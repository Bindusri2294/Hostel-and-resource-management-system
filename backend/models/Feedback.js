const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
    },

    RoomNo: {
      type: String,
      required: true,
      trim: true,
    },

    Block: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    imageUrl: {
      type: String,
      default: null,
    },

    category: {
      type: String,
      enum: [
        "Overall Experience",
        "Water Supply & Plumbing",
        "Room Cleaning & Sanitation",
        "Furniture & Electrical",
        "Food & Mess Quality",
        "Internet & Wi-Fi",
      ],
      default: "Overall Experience",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);