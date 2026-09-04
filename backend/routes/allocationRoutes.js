const express = require("express");

const {
  createAllocation,
  getAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
} = require("../controllers/allocationController");

const router = express.Router();

// Create allocation
router.post("/", createAllocation);

// Get all allocations
router.get("/", getAllocations);

// Get allocation by ID
router.get("/:id", getAllocationById);

// Update allocation
router.put("/:id", updateAllocation);

// Delete allocation
router.delete("/:id", deleteAllocation);

module.exports = router;