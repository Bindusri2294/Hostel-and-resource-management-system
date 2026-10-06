const Notification = require("../models/Notification");
const Student = require("../models/Student");

// @desc    Create a new notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res, next) => {
  try {
    const { title, message, targetType, targetValue } = req.body;

    if (!title || !message || !targetType) {
      return res.status(400).json({ message: "Please provide title, message, and targetType." });
    }

    const notification = await Notification.create({
      title,
      message,
      targetType,
      targetValue: targetValue || "",
      sender: req.user._id,
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    // If admin, return all notifications they sent (or all overall)
    if (req.user.role === "Admin") {
      const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json(notifications);
    }

    // If student, filter notifications specifically for them
    const student = req.user.student;
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    // Build query
    const query = {
      $or: [
        { targetType: "ALL" },
        { targetType: "BLOCK", targetValue: student.Block },
        { targetType: "COURSE", targetValue: student.Course },
        { targetType: "SINGLE_STUDENT", targetValue: student.Rollno },
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Add user to readBy array if not already there
    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.deleteOne();
    res.status(200).json({ message: "Notification removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationRead,
  deleteNotification,
};