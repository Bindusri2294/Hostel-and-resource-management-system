const Room = require("../models/Room");

// Create a new room
const createRoom = async (req, res, next) => {
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
        next(error);
    }
};

// Get all rooms
const getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find().sort({ Block: 1, Floor: 1, RoomNo: 1 });
        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
};

// Get a single room by RoomNo + Block
const getRoomById = async (req, res, next) => {
    try {
        const room = await Room.findOne({ RoomNo: req.params.roomNo, Block: req.params.block });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json(room);
    } catch (error) {
        next(error);
    }
};

// Update a room
const updateRoom = async (req, res, next) => {
    try {
        const { RoomNo, Block, Floor, Capacity, OccupiedCount } = req.body;

        const existingRoom = await Room.findOne({ RoomNo: req.params.roomNo, Block: req.params.block });
        if (!existingRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (Capacity !== undefined && Capacity < 1) {
            return res.status(400).json({ message: "Capacity must be at least 1" });
        }

        const newCapacity = Capacity !== undefined ? Capacity : existingRoom.Capacity;
        const newOccupied = OccupiedCount !== undefined ? OccupiedCount : existingRoom.OccupiedCount;

        if (newOccupied > newCapacity) {
            return res.status(400).json({
                message: `OccupiedCount (${newOccupied}) cannot exceed Capacity (${newCapacity})`,
            });
        }

        const updatedRoom = await Room.findOneAndUpdate(
            { RoomNo: req.params.roomNo, Block: req.params.block },
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
        next(error);
    }
};

// Delete a room
const deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findOneAndDelete({ RoomNo: req.params.roomNo, Block: req.params.block });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json({ message: "Room deleted successfully", room });
    } catch (error) {
        next(error);
    }
};

// Get rooms by status
const getRoomsByStatus = async (req, res, next) => {
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
        next(error);
    }
};

// Get rooms statistics
const getRoomsStats = async (req, res, next) => {
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
        next(error);
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