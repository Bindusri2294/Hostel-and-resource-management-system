const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
    },
    institution: {
      type: String,
      required: true,
      enum: ["KIET", "KIEW"],
    },
    hostelType: {
      type: String,
      required: true,
      enum: ["Boys", "Girls"],
    },
    floors: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Block", blockSchema);
