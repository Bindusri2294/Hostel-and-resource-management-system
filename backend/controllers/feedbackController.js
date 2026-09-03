const Feedback = require("../models/Feedback");
const Student = require("../models/Student");

const createFeedback = async (req, res) => {
  try {
    const { studentId, message, rating } = req.body;

    const student = await Student.findOne({ Rollno: studentId });

    if (!student) {
      return res.status(404).json({
        message: "Student with this Rollno not found",
      });
    }

    const feedback = await Feedback.create({
      studentId,
      message,
      rating,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    res.json({
      message: "Feedback deleted successfully",
    });
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
