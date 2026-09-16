const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

const router = express.Router();

router.post("/", protect, authorize("Admin"), createRoom);
router.get("/", protect, getRooms);
router.get("/:id", protect, getRoomById);
router.put("/:id", protect, authorize("Admin"), updateRoom);
router.delete("/:id", protect, authorize("Admin"), deleteRoom);

module.exports = router;