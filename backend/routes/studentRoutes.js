const express = require("express");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;