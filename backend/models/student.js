const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    Rollno: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Course: {
      type: String,
      required: true,
      trim: true,
    },
    Campus: {
      type: String,
      required: true,
      trim: true,
    },
    Year: {
      type: Number,
      required: true,
    },
    Roomno: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);