const express = require("express");
const {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("Student"), createFeedback);
router.get("/", protect, authorize("Admin"), getFeedbacks);
router.get("/:id", protect, authorize("Admin"), getFeedbackById);
router.put("/:id", protect, authorize("Admin"), updateFeedback);
router.delete("/:id", protect, authorize("Admin"), deleteFeedback);

module.exports = router;