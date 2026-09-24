const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

router.post("/", protect, authorize("Admin", "Student"), createStudent);
router.get("/", protect, authorize("Admin", "Student"), getStudents);
router.get("/:id", protect, authorize("Admin", "Student"), getStudentById);
router.put("/:id", protect, authorize("Admin", "Student"), updateStudent);
router.delete("/:id", protect, authorize("Admin", "Student"), deleteStudent);

module.exports = router;