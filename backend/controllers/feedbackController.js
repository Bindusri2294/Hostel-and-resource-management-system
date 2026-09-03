const Feedback = require("../models/Feedback");
const Student = require("../models/Student");

// Create feedback
const createFeedback = async (req, res) => {
  try {
    const { studentId, message, rating } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feedback = await Feedback.create({
      studentId,
      message,
      rating,
    });

    const populatedFeedback = await Feedback.findById(feedback._id).populate(
      "studentId"
    );

    res.status(201).json(populatedFeedback);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all feedback
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("studentId");
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get feedback by ID
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate(
      "studentId"
    );
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update feedback
const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("studentId");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
};
