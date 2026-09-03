const express = require("express");
const {
  createAllocation,
  getAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
} = require("../controllers/allocationController");

const router = express.Router();

router.post("/", createAllocation);
router.get("/", getAllocations);
router.get("/:id", getAllocationById);
router.put("/:id", updateAllocation);
router.delete("/:id", deleteAllocation);

module.exports = router;