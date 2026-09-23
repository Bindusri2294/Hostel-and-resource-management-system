// Verified and tested locally via Postman API testing
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
    Department: {
      type: String,
      trim: true,
      default: "CSM",
    },
    Campus: {
      type: String,
      required: true,
      trim: true,
      default: "Main Campus",
    },
    Year: {
      type: Number,
      required: true,
    },
    Block: {
      type: String,
      trim: true,
      default: "D",
    },
    Roomno: {
      type: String,
      required: true,
      trim: true,
    },
    Status: {
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);