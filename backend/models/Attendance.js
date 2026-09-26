const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String, // ISO format: YYYY-MM-DD
      required: true,
      index: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      default: "Present",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee one attendance entry per student per day
attendanceSchema.index({ date: 1, student: 1 }, { unique: true });
attendanceSchema.index({ rollNo: 1, date: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
