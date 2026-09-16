const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createAllocation,
  getAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
} = require("../controllers/allocationController");

const router = express.Router();

// Create allocation
router.post("/", protect, authorize("Admin"), createAllocation);

// Get all allocations
router.get("/", protect, getAllocations);

// Get allocation by ID
router.get("/:id", protect, getAllocationById);

// Update allocation
router.put("/:id", protect, authorize("Admin"), updateAllocation);

// Delete allocation
router.delete("/:id", protect, authorize("Admin"), deleteAllocation);

module.exports = router;