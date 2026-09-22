const mongoose = require("mongoose");
const Student = require("../models/student");

const studentFilter = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { Rollno: id }] };
  }
  return { Rollno: id };
};

// Create a student
const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// Get all students
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
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