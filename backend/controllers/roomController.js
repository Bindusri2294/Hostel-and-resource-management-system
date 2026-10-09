const mongoose = require("mongoose");
const Room = require("../models/Room");
const Allocation = require("../models/Allocation");
const Student = require("../models/student");

// Create a new room
const createRoom = async (req, res, next) => {
    try {
        const { RoomNo, Block, Floor, Capacity, OccupiedCount } = req.body;

        if (!RoomNo || !Block || Floor === undefined || Floor === null || Floor === "" || Capacity === undefined) {
            return res.status(400).json({
                message: "Please provide RoomNo, Block, Floor, and Capacity fields",
            });
        }

        if (!Number.isInteger(Number(Floor)) || Number(Floor) < 0) {
            return res.status(400).json({ message: "Floor must be a non-negative whole number" });
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

// Get all rooms — with live occupied counts and full resident student details
const getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find().sort({ Block: 1, Floor: 1, RoomNo: 1 }).lean();
        const [allocCounts, activeAllocations, directStudents] = await Promise.all([
            Allocation.aggregate([
                { $match: { status: "Active" } },
                { $group: { _id: "$roomId", count: { $sum: 1 } } },
            ]),
            Allocation.find({ status: "Active" })
                .populate("studentId", "Name Rollno Course Department Campus Roomno Block Year")
                .lean(),
            Student.find({
                Roomno: { $exists: true, $ne: "Unassigned", $nin: ["", null] },
            }).select("Name Rollno Course Department Campus Roomno Block Year").lean(),
        ]);

        const countMap = new Map(
            allocCounts.map((allocation) => [String(allocation._id), allocation.count])
        );
        const allocationsByRoom = new Map();
        activeAllocations.forEach((allocation) => {
            const roomId = String(allocation.roomId?._id || allocation.roomId);
            const roomAllocations = allocationsByRoom.get(roomId) || [];
            roomAllocations.push(allocation);
            allocationsByRoom.set(roomId, roomAllocations);
        });

        // Pre-index direct students by RoomNo and Block for O(1) lookup
        const directStudentsByRoom = new Map();
        directStudents.forEach((s) => {
            const keyWithBlock = `${String(s.Roomno).trim().toLowerCase()}_${String(s.Block || "").trim().toUpperCase()}`;
            const keyAnyBlock = `${String(s.Roomno).trim().toLowerCase()}_ANY`;

            if (!directStudentsByRoom.has(keyWithBlock)) directStudentsByRoom.set(keyWithBlock, []);
            directStudentsByRoom.get(keyWithBlock).push(s);

            if (!directStudentsByRoom.has(keyAnyBlock)) directStudentsByRoom.set(keyAnyBlock, []);
            directStudentsByRoom.get(keyAnyBlock).push(s);
        });

        res.status(200).json(rooms.map((room) => {
            const allocList = (allocationsByRoom.get(String(room._id)) || [])
                .filter((allocation) => allocation.studentId)
                .map((allocation) => allocation.studentId);

            const roomNo = String(room.RoomNo).trim().toLowerCase();
            const block = String(room.Block || "").trim().toUpperCase();
            const directMatching = directStudentsByRoom.get(`${roomNo}_${block}`) ||
                                   directStudentsByRoom.get(`${roomNo}_ANY`) ||
                                   [];

            // Merge and deduplicate by Rollno / _id
            const studentMap = new Map();
            allocList.forEach((s) => studentMap.set(String(s.Rollno || s._id).toUpperCase(), s));
            directMatching.forEach((s) => studentMap.set(String(s.Rollno || s._id).toUpperCase(), s));
            const mergedStudents = Array.from(studentMap.values());

            const liveOccupied = Math.max(mergedStudents.length, countMap.get(String(room._id)) || 0);
            const liveStatus = liveOccupied >= room.Capacity ? "Full" : (liveOccupied > 0 ? "Partial" : "Available");

            const enrichedRoom = {
                ...room,
                OccupiedCount: liveOccupied,
                Status: liveStatus,
                AllocatedStudents: mergedStudents,
            };

            return enrichedRoom;
        }));
    } catch (error) {
        next(error);
    }
};

const roomFilter = (req) => {
  if (req.params.id) {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      return { $or: [{ _id: req.params.id }, { RoomNo: req.params.id }] };
    }
    return { RoomNo: req.params.id };
  }
  return { RoomNo: req.params.roomNo, Block: req.params.block };
};

// Get a single room by ID, or by RoomNo + Block for older clients
const getRoomById = async (req, res, next) => {
    try {
        const room = await Room.findOne(roomFilter(req));
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const activeAllocationFilter = { roomId: room._id, status: "Active" };
        const [occupiedCount, allocations, directStudents] = await Promise.all([
            Allocation.countDocuments(activeAllocationFilter),
            Allocation.find(activeAllocationFilter)
                .populate("studentId", "Name Rollno Course Department Campus Roomno Block Year")
                .lean(),
            Student.find({
                Roomno: room.RoomNo,
                ...(room.Block ? { Block: room.Block } : {}),
            }).lean(),
        ]);

        const allocList = allocations
            .filter((allocation) => allocation.studentId)
            .map((allocation) => allocation.studentId);

        const studentMap = new Map();
        allocList.forEach((s) => studentMap.set(String(s.Rollno || s._id).toUpperCase(), s));
        directStudents.forEach((s) => studentMap.set(String(s.Rollno || s._id).toUpperCase(), s));
        const mergedStudents = Array.from(studentMap.values());

        const liveOccupied = Math.max(mergedStudents.length, occupiedCount);

        return res.status(200).json({
            ...room.toObject(),
            OccupiedCount: liveOccupied,
            Status: liveOccupied >= room.Capacity ? "Full" : "Available",
            AllocatedStudents: mergedStudents,
        });
    } catch (error) {
        next(error);
    }
};

// Update a room
const updateRoom = async (req, res, next) => {
    try {
        const { RoomNo, Block, Floor, Capacity, OccupiedCount } = req.body;

        const filter = roomFilter(req);
        const existingRoom = await Room.findOne(filter);
        if (!existingRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (Capacity !== undefined && Capacity < 1) {
            return res.status(400).json({ message: "Capacity must be at least 1" });
        }

        if (Floor !== undefined && (!Number.isInteger(Number(Floor)) || Number(Floor) < 0)) {
            return res.status(400).json({ message: "Floor must be a non-negative whole number" });
        }

        const newCapacity = Capacity !== undefined ? Capacity : existingRoom.Capacity;
        const newOccupied = OccupiedCount !== undefined ? OccupiedCount : existingRoom.OccupiedCount;

        if (newOccupied > newCapacity) {
            return res.status(400).json({
                message: `OccupiedCount (${newOccupied}) cannot exceed Capacity (${newCapacity})`,
            });
        }

        const updatedRoom = await Room.findOneAndUpdate(
            filter,
            {
                RoomNo: RoomNo || existingRoom.RoomNo,
                Block: Block || existingRoom.Block,
                Floor: Floor !== undefined ? Floor : existingRoom.Floor,
                Capacity: newCapacity,
                OccupiedCount: newOccupied,
            },
            { returnDocument: "after" }
        );

        res.status(200).json(updatedRoom);
    } catch (error) {
        next(error);
    }
};

// Delete a room
const deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findOneAndDelete(roomFilter(req));
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

// Get rooms statistics — computed from live allocation counts
const getRoomsStats = async (req, res, next) => {
    try {
        const [rooms, allocCounts] = await Promise.all([
            Room.find().lean(),
            Allocation.aggregate([
                { $match: { status: "Active" } },
                { $group: { _id: "$roomId", count: { $sum: 1 } } },
            ]),
        ]);

        const countMap = {};
        allocCounts.forEach((a) => { countMap[String(a._id)] = a.count; });

        let totalOccupied = 0;
        let fullRooms = 0;
        let availableRooms = 0;

        rooms.forEach((r) => {
            const occ = countMap[String(r._id)] || 0;
            totalOccupied += occ;
            if (occ >= r.Capacity) fullRooms++;
            else availableRooms++;
        });

        const stats = {
            totalRooms: rooms.length,
            availableRooms,
            fullRooms,
            totalCapacity: rooms.reduce((sum, r) => sum + r.Capacity, 0),
            totalOccupied,
        };
        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
};

// Sync all room OccupiedCount values from live allocation data
const syncRoomCounts = async (req, res, next) => {
    try {
        const allocCounts = await Allocation.aggregate([
            { $match: { status: "Active" } },
            { $group: { _id: "$roomId", count: { $sum: 1 } } },
        ]);

        const countMap = {};
        allocCounts.forEach((a) => { countMap[String(a._id)] = a.count; });

        const rooms = await Room.find();
        let updated = 0;

        for (const room of rooms) {
            const liveCount = countMap[String(room._id)] || 0;
            const newStatus = liveCount >= room.Capacity ? "Full" : (liveCount > 0 ? "Partial" : "Available");
            if (room.OccupiedCount !== liveCount || room.Status !== newStatus) {
                room.OccupiedCount = liveCount;
                room.Status = newStatus;
                await room.save();
                updated++;
            }
        }

        res.status(200).json({ message: `Synced ${updated} room(s)`, updated });
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
    syncRoomCounts,
};