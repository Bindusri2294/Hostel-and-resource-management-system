const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    roomNo: {
      type: String,
      trim: true,
      default: "Unassigned",
    },
    block: {
      type: String,
      trim: true,
      default: "D",
    },
    leaveType: {
      type: String,
      enum: [
        "Home Visit",
        "Medical Leave",
        "Academic / Internship",
        "Emergency",
        "Festival / Holiday",
        "Other",
      ],
      default: "Home Visit",
      required: true,
    },
    startDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    endDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    parentContact: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.index({ rollNo: 1, createdAt: -1 });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
