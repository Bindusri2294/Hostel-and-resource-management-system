const Student = require("../models/student");

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

// Get student by Rollno
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findOne({ Rollno: req.params.id });
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
      { Rollno: req.params.id },
      req.body,
      { new: true, runValidators: true }
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
    const student = await Student.findOneAndDelete({ Rollno: req.params.id });
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