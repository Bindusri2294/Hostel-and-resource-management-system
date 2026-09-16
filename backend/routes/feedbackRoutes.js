const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", protect, createFeedback);
router.get("/", protect, getFeedbacks);
router.get("/:id", protect, getFeedbackById);
router.put("/:id", protect, authorize("Admin"), updateFeedback);
router.delete("/:id", protect, authorize("Admin"), deleteFeedback);

module.exports = router;