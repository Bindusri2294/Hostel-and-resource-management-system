const express = require("express");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("Admin"), createStudent);
router.get("/", protect, authorize("Admin"), getStudents);
router.get("/:id", protect, authorize("Admin"), getStudentById);
router.put("/:id", protect, authorize("Admin"), updateStudent);
router.delete("/:id", protect, authorize("Admin"), deleteStudent);

module.exports = router;