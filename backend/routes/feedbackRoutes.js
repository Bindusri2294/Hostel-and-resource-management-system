const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getMyFeedbacks,
  getAllFeedbacks,
  updateFeedbackStatus,
  getFeedbackStats,
} = require("../controllers/feedbackController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Student Routes
router.post(
  "/",
  protect,
  authorize("Student"),
  upload.single("image"),
  createFeedback
);
router.get("/my", protect, authorize("Student"), getMyFeedbacks);

// Admin Routes
router.get("/", protect, authorize("Admin"), getAllFeedbacks);
router.get("/stats", protect, authorize("Admin"), getFeedbackStats);
router.patch("/:id/status", protect, authorize("Admin"), updateFeedbackStatus);

module.exports = router;
