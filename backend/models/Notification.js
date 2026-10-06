const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    targetType: {
      type: String,
      enum: ["ALL", "BLOCK", "COURSE", "SINGLE_STUDENT"],
      required: true,
    },
    targetValue: {
      type: String, // e.g., "Block D", "CSC", or student roll number. Empty if 'ALL'
      default: "",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Student users who have read this
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);