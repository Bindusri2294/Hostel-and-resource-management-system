const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const getStudentId = (req) => req.user?.student?._id || req.user?.student;
const studentFilter = (req) => ({ studentId: getStudentId(req) });

const createNotification = async (req, res, next) => {
  try {
    const { studentId, message, notificationType, relatedAction } = req.body || {};
    if (!studentId || !message || !notificationType || !relatedAction) {
      return res.status(400).json({ message: "studentId, message, notificationType, and relatedAction are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "studentId must be a valid student ID" });
    }
    const notification = await Notification.create({ studentId, message, notificationType, relatedAction });
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find(studentFilter(req)).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...studentFilter(req) },
      { isRead: true },
      { returnDocument: "after" }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(studentFilter(req), { isRead: true });
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, ...studentFilter(req) });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createNotification, getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification };