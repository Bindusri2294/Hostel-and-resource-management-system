const express = require("express");
const {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  escalateFeedback,
  getEscalatedFeedback,
  actionEscalatedFeedback,
} = require("../controllers/feedbackController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public escalation routes (Authority access via secure token)
router.get("/escalation/:token", getEscalatedFeedback);
router.post("/escalation/:token/action", actionEscalatedFeedback);

// Apply protect middleware to ALL feedback routes
router.use(protect);

// Admin route to escalate feedback
router.post("/:id/escalate", authorize("Admin"), escalateFeedback);

const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    next();
  });
};

router.post("/", authorize("Student"), handleUpload, createFeedback);
router.get("/", getFeedbacks);
router.get("/:id", getFeedbackById);

// Admin-only operations
router.put("/:id", authorize("Admin"), updateFeedback);
router.delete("/:id", authorize("Admin"), deleteFeedback);

module.exports = router;