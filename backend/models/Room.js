const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
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
    Floor: {
      type: Number,
      required: true,
    },
    Capacity: {
      type: Number,
      required: true,
      default: 2,
    },
    OccupiedCount: {
      type: Number,
      default: 0,
    },
    Status: {
      type: String,
      enum: ["Available", "Full"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);

