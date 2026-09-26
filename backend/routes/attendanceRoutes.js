const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getMyAttendance,
  getAttendanceByDate,
  saveDailyAttendance,
  getMonthSummary,
} = require("../controllers/attendanceController");

const router = express.Router();

// Student route: view their own attendance records ONLY
router.get("/mine", protect, authorize("Student", "Admin"), getMyAttendance);

// Admin routes:
router.get("/date", protect, authorize("Admin"), getAttendanceByDate);
router.get("/month-summary", protect, authorize("Admin"), getMonthSummary);
router.post("/save", protect, authorize("Admin"), saveDailyAttendance);

module.exports = router;
