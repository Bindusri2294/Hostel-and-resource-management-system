const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    block: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: Number,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    occupied: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Available", "Partially Occupied", "Full"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

// Validate occupied count and automatically update status
roomSchema.pre("save", function () {
  if (this.occupied > this.capacity) {
    throw new Error(
      `Occupied count (${this.occupied}) cannot exceed capacity (${this.capacity})`
    );
  }

  if (this.occupied === 0) {
    this.status = "Available";
  } else if (this.occupied === this.capacity) {
    this.status = "Full";
  } else {
    this.status = "Partially Occupied";
  }
});

module.exports = mongoose.model("Room", roomSchema);