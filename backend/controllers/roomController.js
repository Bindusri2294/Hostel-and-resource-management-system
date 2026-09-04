const Room = require("../models/Room");

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { RoomNo, Block, Floor, Capacity, OccupiedCount } = req.body;

    if (!RoomNo || !Block || !Floor || Capacity === undefined) {
      return res.status(400).json({
        message: "Please provide RoomNo, Block, Floor, and Capacity fields",
      });
    }

    if (Capacity < 1) {
      return res.status(400).json({
        message: "Capacity must be at least 1",
      });
    }

    if (OccupiedCount !== undefined && OccupiedCount > Capacity) {
      return res.status(400).json({
        message: "OccupiedCount cannot exceed Capacity",
      });
    }

    const newRoom = await Room.create({
      RoomNo,
      Block,
      Floor,
      Capacity,
      OccupiedCount: OccupiedCount || 0,
    });

    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ Block: 1, Floor: 1, RoomNo: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get a single room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update a room
const updateRoom = async (req, res) => {
  try {
    const { RoomNo, Block, Floor, Capacity, OccupiedCount } = req.body;

    const existingRoom = await Room.findById(req.params.id);
    if (!existingRoom) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (Capacity !== undefined && Capacity < 1) {
      return res.status(400).json({
        message: "Capacity must be at least 1",
      });
    }

    const newCapacity = Capacity !== undefined ? Capacity : existingRoom.Capacity;
    const newOccupied = OccupiedCount !== undefined ? OccupiedCount : existingRoom.OccupiedCount;

    if (newOccupied > newCapacity) {
      return res.status(400).json({
        message: `OccupiedCount (${newOccupied}) cannot exceed Capacity (${newCapacity})`,
      });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        RoomNo: RoomNo || existingRoom.RoomNo,
        Block: Block || existingRoom.Block,
        Floor: Floor || existingRoom.Floor,
        Capacity: newCapacity,
        OccupiedCount: newOccupied,
      },
      { new: true }
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }
    res.status(200).json({
      message: "Room deleted successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get rooms by status
const getRoomsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Available", "Full"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const rooms = await Room.find({ Status: status }).sort({ Block: 1, Floor: 1, RoomNo: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get rooms statistics
const getRoomsStats = async (req, res) => {
  try {
    const rooms = await Room.find();
    const stats = {
      totalRooms: rooms.length,
      availableRooms: rooms.filter((r) => r.Status === "Available").length,
      fullRooms: rooms.filter((r) => r.Status === "Full").length,
      totalCapacity: rooms.reduce((sum, r) => sum + r.Capacity, 0),
      totalOccupied: rooms.reduce((sum, r) => sum + r.OccupiedCount, 0),
    };
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByStatus,
  getRoomsStats,
};