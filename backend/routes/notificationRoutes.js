const express = require("express");
const {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", protect, authorize("Admin"), createNotification);
router.get("/", protect, authorize("Student"), getNotifications);
router.patch("/:id/read", protect, authorize("Student"), markNotificationRead);
router.patch("/read-all", protect, authorize("Student"), markAllNotificationsRead);
router.delete("/:id", protect, authorize("Student"), deleteNotification);

module.exports = router;