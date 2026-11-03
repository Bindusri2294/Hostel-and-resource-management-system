const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllFees,
  getMyFees,
} = require("../controllers/feeController");

const router = express.Router();

/**
 * CONFIDENTIAL & READ-ONLY FEE MODULE
 * All fee records are strictly locked. No creation, editing, deletion, or online payments allowed.
 */

// Student & Admin read-only view of their own fee statements
router.get("/mine", protect, authorize("Student", "Admin"), getMyFees);

// Admin read-only view of all fee statements with filters and statistics
router.get("/", protect, authorize("Admin"), getAllFees);

// Explicitly reject all mutation attempts (POST, PUT, PATCH, DELETE) with 403 Forbidden
router.use((req, res, next) => {
  if (req.method !== "GET") {
    return res.status(403).json({
      message: "Fee records are confidential and strictly read-only. Modifications, payments, and deletions are disabled.",
    });
  }
  next();
});

module.exports = router;
