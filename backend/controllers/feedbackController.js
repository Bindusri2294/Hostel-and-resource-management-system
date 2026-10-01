const Feedback = require("../models/Feedback");
const Student = require("../models/student");
const Notification = require("../models/Notification");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/r2");

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
        return res.status(404).json({
          message: `Student ${feedback.studentId} could not be found; feedback status was not changed`,
        });
      }
    }

    feedback.status = status;
    await feedback.save();

    if (student) {
      await Notification.create({
        studentId: student._id,
        message: `Your feedback "${feedback.message}" is now marked as ${status}.`,
        notificationType: "Feedback Update",
        relatedAction: "/feedback",
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

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
};