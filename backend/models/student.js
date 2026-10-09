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

studentSchema.index({ Roomno: 1, Block: 1 });
studentSchema.index({ Status: 1 });

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);