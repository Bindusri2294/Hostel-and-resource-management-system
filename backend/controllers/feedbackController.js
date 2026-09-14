const Feedback = require("../models/Feedback");
const Student = require("../models/student");

// Create feedback
const createFeedback = async (req, res, next) => {
  try {
    const body = req.body || {};
    let { studentId, RoomNo, Block, message, rating, category } = body;

    // Enforce authenticated student identity from user token session
    if (req.user && req.user.role === "Student" && req.user.student) {
      if (req.user.student?.Rollno) studentId = req.user.student.Rollno;
      if (req.user.student?.Roomno) RoomNo = req.user.student.Roomno;
      if (req.user.student?.Campus) Block = req.user.student.Campus;
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

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const feedback = await Feedback.create({
      studentId: student.Rollno || String(studentId).trim().toUpperCase(),
      RoomNo: RoomNo || student.Roomno || "Unassigned",
      Block: Block || student.Campus || "Main Campus",
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

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
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