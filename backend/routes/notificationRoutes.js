const express = require("express");
const {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", protect, admin, createNotification);
router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markNotificationRead);
router.patch("/read-all", protect, markAllNotificationsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;