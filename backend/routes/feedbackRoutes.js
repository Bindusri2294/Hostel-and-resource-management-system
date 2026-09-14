const express = require("express");

const {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Apply protect middleware to ALL feedback routes
router.use(protect);

const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    next();
  });
};

router.post("/", handleUpload, createFeedback);
router.get("/", getFeedbacks);
router.get("/:id", getFeedbackById);

// Admin-only operations
router.put("/:id", authorize("Admin"), updateFeedback);
router.delete("/:id", authorize("Admin"), deleteFeedback);

module.exports = router;