const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getBlocks, createBlock } = require("../controllers/blockController");

const router = express.Router();

router.get("/", protect, authorize("Admin"), getBlocks);
router.post("/", protect, authorize("Admin"), createBlock);

module.exports = router;
