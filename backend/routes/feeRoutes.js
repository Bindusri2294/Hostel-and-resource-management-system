const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createFee,
  createBatchFees,
  getAllFees,
  getMyFees,
  recordPayment,
  studentPayFee,
  updateFee,
  deleteFee,
  bulkAdjustFees,
  bulkDeleteFees,
} = require("../controllers/feeController");

const router = express.Router();

// Student routes (accessible to authenticated students and admins)
router.get("/mine", protect, authorize("Student", "Admin"), getMyFees);
router.post("/:id/pay", protect, authorize("Student", "Admin"), studentPayFee);

// Admin-only management routes
router.get("/", protect, authorize("Admin"), getAllFees);
router.post("/", protect, authorize("Admin"), createFee);
router.post("/batch", protect, authorize("Admin"), createBatchFees);
router.post("/bulk-adjust", protect, authorize("Admin"), bulkAdjustFees);
router.post("/bulk-delete", protect, authorize("Admin"), bulkDeleteFees);
router.post("/:id/payments", protect, authorize("Admin"), recordPayment);
router.put("/:id", protect, authorize("Admin"), updateFee);
router.delete("/:id", protect, authorize("Admin"), deleteFee);

module.exports = router;
