const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Food/Mess",
        "Cleanliness & Sanitation",
        "Maintenance & Repairs",
        "Water & Electricity",
        "Wi-Fi & Internet",
        "Warden & Staff",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    adminResponse: {
      type: String,
      default: "",
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
