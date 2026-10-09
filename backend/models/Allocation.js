const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    allocatedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Active", "Vacated"],
      default: "Active",
    },

    vacatedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

allocationSchema.index({ status: 1 });
allocationSchema.index({ studentId: 1, status: 1 });
allocationSchema.index({ roomId: 1, status: 1 });
allocationSchema.index({ allocatedDate: -1 });

module.exports = mongoose.model("Allocation", allocationSchema);