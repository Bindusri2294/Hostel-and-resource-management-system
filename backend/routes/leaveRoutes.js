const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

const router = express.Router();

// Student routes
router.post("/apply", protect, authorize("Student"), applyLeave);
router.get("/mine", protect, authorize("Student", "Admin"), getMyLeaves);

// Admin routes
router.get("/all", protect, authorize("Admin"), getAllLeaves);
router.put("/:id/status", protect, authorize("Admin"), updateLeaveStatus);

module.exports = router;
