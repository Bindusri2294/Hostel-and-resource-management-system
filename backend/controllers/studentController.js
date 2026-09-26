const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("../models/student");
const User = require("../models/User");

const studentFilter = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { Rollno: id }] };
  }
  return { Rollno: id };
};

// Create a student (Admin only)
// Auto-creates a linked User account with default password = roll number
const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    // Auto-create User login account with roll number as default password
    const existingUser = await User.findOne({ student: student._id });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(student.Rollno, salt);
      await User.create({
        name: student.Name,
        email: `${student.Rollno.toLowerCase().replace(/[^a-z0-9]/g, "")}@hostel.local`,
        password: hashedPassword,
        role: "Student",
        student: student._id,
      });
    }

    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// Get all students
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find();
    const users = await User.find({ role: "Student" }).select("email student");
    const emailByStudentId = new Map(users.map((user) => [String(user.student), user.email]));
    res.status(200).json(
      students.map((student) => ({
        ...student.toObject(),
        email: emailByStudentId.get(String(student._id)) || "",
      }))
    );
  } catch (error) {
    next(error);
  }
};

// Get student by Rollno or _id
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findOne(studentFilter(req.params.id));
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// Update a student
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findOneAndUpdate(
      studentFilter(req.params.id),
      req.body,
      { returnDocument: "after", runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// Delete a student
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findOneAndDelete(studentFilter(req.params.id));
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully", student });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};