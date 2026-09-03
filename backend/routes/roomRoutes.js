const express = require("express");
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByStatus,
  getRoomsStats,
} = require("../controllers/roomController");

const router = express.Router();

// CRUD operations
router.post("/", createRoom);
router.get("/", getRooms);
router.get("/stats", getRoomsStats);
router.get("/status/:status", getRoomsByStatus);
router.get("/:id", getRoomById);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;