const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createAllocation,
  getAllocations,
  getAllocationById,
  getMyAllocation,
  updateAllocation,
  deleteAllocation,
} = require("../controllers/allocationController");

const router = express.Router();

// Create allocation
router.post("/", protect, authorize("Admin"), createAllocation);

// Get logged-in student's own allocation
router.get("/mine", protect, authorize("Student"), getMyAllocation);

// Get all allocations
router.get("/", protect, authorize("Admin"), getAllocations);

// Get allocation by ID
router.get("/:id", protect, authorize("Admin"), getAllocationById);

// Update allocation
router.put("/:id", protect, authorize("Admin"), updateAllocation);

// Delete allocation
router.delete("/:id", protect, authorize("Admin"), deleteAllocation);

module.exports = router;