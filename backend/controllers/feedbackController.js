const Feedback = require("../models/Feedback");
const Student = require("../models/student");

// Create feedback
const createFeedback = async (req, res, next) => {
  try {
    const { studentId, RoomNo, Block, message, rating } = req.body;

    const student = await Student.findOne({ Rollno: studentId });

    if (!student) {
      return res.status(404).json({
        message: "Student with this Rollno not found",
      });
    }

    const feedback = await Feedback.create({
      studentId,
      RoomNo,
      Block,
      message,
      rating,
      status: "Pending",
    });

    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

// Get all feedback
const getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
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
    res.status(200).json(feedback);
  } catch (error) {
    next(error);
  }
};

// Update feedback status
const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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