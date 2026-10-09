const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markNotificationRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Admin routes
router.post("/", protect, authorize("Admin"), createNotification);
router.delete("/:id", protect, authorize("Admin"), deleteNotification);

// Student and Admin routes
router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markNotificationRead);

module.exports = router;