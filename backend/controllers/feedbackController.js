const Feedback = require("../models/Feedback");

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private (Student Only)
const createFeedback = async (req, res) => {
  try {
    const { title, category, description, rating, priority, isAnonymous } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: "Title, category, and description are required" });
    }

    if (!req.user.student) {
      return res.status(400).json({
        message: "Your user account is not linked to a student record. Please update your profile.",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const feedback = await Feedback.create({
      student: req.user.student._id,
      isAnonymous: isAnonymous === "true" || isAnonymous === true,
      title,
      category,
      description,
      rating: Number(rating) || 5,
      priority: priority || "Medium",
      imageUrl,
      status: "Pending",
    });

    const populatedFeedback = await Feedback.findById(feedback._id).populate("student");

    res.status(201).json(populatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in student's own feedbacks
// @route   GET /api/feedback/my
// @access  Private (Student Only)
const getMyFeedbacks = async (req, res) => {
  try {
    if (!req.user.student) {
      return res.status(200).json([]);
    }

    const feedbacks = await Feedback.find({ student: req.user.student._id })
      .sort({ createdAt: -1 })
      .populate("student");

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedbacks (Admin View with Anonymous Masking & Filtering)
// @route   GET /api/feedback
// @access  Private (Admin Only)
const getAllFeedbacks = async (req, res) => {
  try {
    const { category, status, priority, rating, search } = req.query;

    let query = {};

    if (category && category !== "All") {
      query.category = category;
    }
    if (status && status !== "All") {
      query.status = status;
    }
    if (priority && priority !== "All") {
      query.priority = priority;
    }
    if (rating && rating !== "All") {
      query.rating = Number(rating);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const rawFeedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .populate("student");

    // Mask student identity if isAnonymous is true
    const sanitizedFeedbacks = rawFeedbacks.map((item) => {
      const doc = item.toObject();
      if (doc.isAnonymous) {
        doc.student = {
          _id: doc.student?._id,
          name: "Anonymous Student",
          rollNo: "PRIVACY MASKED",
          roomNo: "PRIVACY MASKED",
          course: "Confidential",
          campus: doc.student?.campus || "N/A",
          year: 0,
        };
      }
      return doc;
    });

    res.status(200).json(sanitizedFeedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update feedback status & response
// @route   PATCH /api/feedback/:id/status
// @access  Private (Admin Only)
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback ticket not found" });
    }

    if (status) {
      feedback.status = status;
    }
    if (adminResponse !== undefined) {
      feedback.adminResponse = adminResponse;
      feedback.respondedAt = Date.now();
    }

    await feedback.save();

    const updated = await Feedback.findById(feedback._id).populate("student");
    const doc = updated.toObject();

    if (doc.isAnonymous) {
      doc.student = {
        _id: doc.student?._id,
        name: "Anonymous Student",
        rollNo: "PRIVACY MASKED",
        roomNo: "PRIVACY MASKED",
        course: "Confidential",
      };
    }

    res.status(200).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get aggregated feedback statistics
// @route   GET /api/feedback/stats
// @access  Private (Admin Only)
const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    const pendingCount = await Feedback.countDocuments({ status: "Pending" });
    const inProgressCount = await Feedback.countDocuments({ status: "In Progress" });
    const resolvedCount = await Feedback.countDocuments({ status: "Resolved" });
    const rejectedCount = await Feedback.countDocuments({ status: "Rejected" });
    const urgentPendingCount = await Feedback.countDocuments({
      status: "Pending",
      priority: "Urgent",
    });

    // Average rating
    const ratingAggregation = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    const averageRating =
      ratingAggregation.length > 0 ? Number(ratingAggregation[0].avgRating.toFixed(1)) : 0;

    // Category distribution
    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    res.status(200).json({
      totalFeedbacks,
      pendingCount,
      inProgressCount,
      resolvedCount,
      rejectedCount,
      urgentPendingCount,
      averageRating,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFeedback,
  getMyFeedbacks,
  getAllFeedbacks,
  updateFeedbackStatus,
  getFeedbackStats,
};
