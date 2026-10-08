const Feedback = require("../models/Feedback");
const Student = require("../models/student");
const Notification = require("../models/Notification");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/r2");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create feedback
const createFeedback = async (req, res, next) => {
  try {
    const body = req.body || {};
    let { studentId, RoomNo, Block, message, rating, category } = body;

    // Enforce authenticated student identity from user token session
    if (req.user && req.user.role === "Student" && req.user.student) {
      if (req.user.student?.Rollno) studentId = req.user.student.Rollno;
      if (req.user.student?.Roomno) RoomNo = req.user.student.Roomno;
      if (req.user.student?.Block) Block = req.user.student.Block;
    }

    if (!studentId) {
      return res.status(400).json({ message: "Student Rollno is required" });
    }

    const student = await Student.findOne({ Rollno: String(studentId).trim().toUpperCase() });

    if (!student) {
      return res.status(404).json({
        message: "Student with this Rollno not found",
      });
    }

    const mongoose = require("mongoose");
    let imageUrl = null;
    
    if (req.file) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `feedback-${uniqueSuffix}-${req.file.originalname.replace(/\s+/g, '-')}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: filename,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          CacheControl: "public, max-age=604800",
        })
      );

      imageUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    }

    const feedback = await Feedback.create({
      studentId: student.Rollno || String(studentId).trim().toUpperCase(),
      RoomNo: RoomNo || student.Roomno || "Unassigned",
      Block: Block || student.Block || student.Campus || "Main Campus",
      category: category || "Overall Experience",
      message: message ? message.trim() : "",
      rating: Number(rating) || 5,
      status: "Pending",
      imageUrl,
    });

    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

// Get feedback records (Filtered securely by role)
const getFeedbacks = async (req, res, next) => {
  try {
    let filter = {};

    // If logged-in user is a Student, filter strictly by their own Rollno
    if (req.user && req.user.role === "Student") {
      const studentRoll = req.user.student?.Rollno;
      if (studentRoll) {
        filter.studentId = studentRoll;
      } else if (req.query.studentId) {
        filter.studentId = req.query.studentId;
      }
    } else if (req.query.studentId) {
      // Optional query param filter for Warden Admin
      filter.studentId = req.query.studentId;
    }

    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    next(error);
  }
};

// Get feedback by ID
const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Check authorization for students
    if (
      req.user &&
      req.user.role === "Student" &&
      req.user.student?.Rollno &&
      feedback.studentId !== req.user.student.Rollno
    ) {
      return res.status(403).json({ message: "Not authorized to view this feedback record" });
    }

    res.status(200).json(feedback);
  } catch (error) {
    next(error);
  }
};

// Update feedback status
const updateFeedback = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!status) {
      return res.status(400).json({ message: "Status field is required for update" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const statusChanged = feedback.status !== status;
    let student;
    if (statusChanged) {
      const rollNumber = String(feedback.studentId || "").trim();
      student = await Student.findOne({
        Rollno: { $regex: `^${escapeRegex(rollNumber)}$`, $options: "i" },
      });
      if (!student) {
        console.warn(`Student ${feedback.studentId} not found. Skipping notification.`);
      }
    }

    feedback.status = status;
    await feedback.save();

    if (student) {
      await Notification.create({
        title: "Feedback Status Updated",
        message: `Your feedback "${feedback.message}" is now marked as ${status}.`,
        targetType: "SINGLE_STUDENT",
        targetValue: student.Rollno,
        sender: req.user._id, // Assumes the admin's user object is populated in req.user
      });
    }

    res.status(200).json(feedback);
  } catch (error) {
    next(error);
  }
};

// Delete feedback
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json({
      message: "Feedback deleted successfully",
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Escalate a feedback to authority
// @route   POST /api/feedbacks/:id/escalate
// @access  Private/Admin
const escalateFeedback = async (req, res, next) => {
  try {
    const { authority, reason } = req.body;
    if (!authority) return res.status(400).json({ message: "Authority is required" });

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    // Determine email based on authority
    let authorityEmail = "";
    if (authority === "DEAN") authorityEmail = process.env.DEAN_EMAIL;
    else if (authority === "PRINCIPAL") authorityEmail = process.env.PRINCIPAL_EMAIL;
    
    if (!authorityEmail) return res.status(400).json({ message: `Email not configured for ${authority} in server environment.` });

    // Generate token
    const token = crypto.randomBytes(20).toString("hex");

    feedback.isEscalated = true;
    feedback.escalationAuthority = authority;
    feedback.escalationReason = reason;
    feedback.escalationToken = token;
    await feedback.save();

    // Construct URL
    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173";
    const actionUrl = `${frontendUrl}/escalation/${token}`;

    const message = `
Dear ${authority},

A student feedback ticket has been escalated to you by the Hostel Admin.
      
Feedback ID: ${feedback._id}
Category: ${feedback.category}
Room/Block: ${feedback.RoomNo} / ${feedback.Block}
Student Issue: ${feedback.message}

Admin Reason for Escalation: ${reason || "No reason provided."}

Please click the link below to view the details and take action (Resolve / Add Remark).
This link provides secure, direct access and does not require logging in.

${actionUrl}

Thank you,
Hostel Management System
    `;

    await sendEmail({
      email: authorityEmail,
      subject: `[ESCALATION] Hostel Feedback - Action Required`,
      message,
    });

    res.status(200).json({ message: "Feedback escalated successfully and email sent.", feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get escalated feedback by token
// @route   GET /api/feedbacks/escalation/:token
// @access  Public
const getEscalatedFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ escalationToken: req.params.token });
    if (!feedback) return res.status(404).json({ message: "Invalid or expired escalation link." });

    res.status(200).json(feedback);
  } catch (error) {
    next(error);
  }
};

// @desc    Authority action on escalated feedback
// @route   POST /api/feedbacks/escalation/:token/action
// @access  Public
const actionEscalatedFeedback = async (req, res, next) => {
  try {
    const { action, remarks } = req.body;
    const feedback = await Feedback.findOne({ escalationToken: req.params.token });
    
    if (!feedback) return res.status(404).json({ message: "Invalid or expired escalation link." });

    if (remarks) {
      feedback.remarks = remarks;
    }

    if (action === "Resolve") {
      feedback.status = "Completed";
    }

    await feedback.save();

    res.status(200).json({ message: "Action recorded successfully.", feedback });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  escalateFeedback,
  getEscalatedFeedback,
  actionEscalatedFeedback,
};