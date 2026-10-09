import { useEffect, useLayoutEffect, useState } from "react";
import { roomService, blockService, studentService, allocationService, getErrorMessage } from "../../services/api";
import {
  DoorOpen,
  Plus,
  Layers,
  Users,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Building,
  RefreshCw,
} from "lucide-react";

const blankRoom = {
  RoomNo: "",
  Block: "D",
  Floor: 1,
  Capacity: 2,
  OccupiedCount: 0,
  Status: "Available",
};

let blockDraftId = 0;

const createRoomDraft = () => ({ id: blockDraftId++, roomNo: "" });
const createFloorDraft = (floorNumber) => ({
  id: blockDraftId++,
  floorNumber: String(floorNumber),
  rooms: [createRoomDraft()],
});

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [blocksMap, setBlocksMap] = useState({});
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);

  // Filter state
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFloor, setSelectedFloor] = useState("All");
  const [filterResetKey, setFilterResetKey] = useState(0);
  const viewMode = "table";

  // Modal states
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankRoom);
  const [formOpen, setFormOpen] = useState(false);
  const [blockFormOpen, setBlockFormOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [newBlockInstitution, setNewBlockInstitution] = useState("KIET");
  const [newBlockHostelType, setNewBlockHostelType] = useState("Boys");
  const [newBlockFloors, setNewBlockFloors] = useState([createFloorDraft(1)]);
  const [newBlockRoomCapacity, setNewBlockRoomCapacity] = useState("2");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, blocksRes, studentsRes, allocationsRes] = await Promise.all([
        roomService.list(),
        blockService.list(),
        studentService.list(),
        allocationService.list(),
      ]);
      setRooms(roomsRes.data || []);
      const blocksList = blocksRes.data || [];
      // build a lookup of block name -> block object (contains hostelType)
      const blocksMapObj = {};
      blocksList.forEach((b) => { if (b && b.name) blocksMapObj[b.name] = b; });
      setBlocksMap(blocksMapObj);
      setBlocks([...new Set([
        ...blocksList.map((block) => block.name),
        ...(roomsRes.data || []).map((room) => room.Block).filter(Boolean),
      ])].sort((a, b) => a.localeCompare(b)));
      setStudents(studentsRes.data || []);
      setAllocations(allocationsRes.data || []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetFilters = () => {
    setSelectedBlock("All");
    setSelectedStatus("All");
    setSelectedFloor("All");
    setFilterResetKey((key) => key + 1);
  };

  useLayoutEffect(() => {
    window.addEventListener("pageshow", resetFilters);
    resetFilters();
    return () => window.removeEventListener("pageshow", resetFilters);
  }, []);

  const getCalculatedStatus = (occupied, capacity) => {
    if (occupied >= capacity) return "Full";
    if (occupied > 0) return "Partial";
    return "Available";
  };

  const getHostelTypeForBlock = (blockName) => {
    if (!blockName) return "—";
    // Prefer explicit block metadata from blocksMap when available
    const explicit = blocksMap[blockName];
    if (explicit && explicit.hostelType) return explicit.hostelType;

    // Fallback inference by block identifier
    const name = String(blockName).toLowerCase().replace(/^block\s*/,'').trim();
    if (["c", "d"].includes(name)) return "Boys";
    if (["kw", "executive"].includes(name)) return "Girls";
    return "—";
  };

  const getResidentsForRoom = (room) => {
    if (!room) return [];

    // 1. From Allocations
    const fromAllocations = allocations
      .filter((a) => {
        if (a.status && a.status !== "Active") return false;
        const matchRoomId = room._id && (String(a.roomId?._id || a.roomId) === String(room._id));
        const matchRoomNo = (String(a.roomNo || a.room?.RoomNo).trim().toLowerCase() === String(room.RoomNo).trim().toLowerCase()) &&
                            (!a.room?.Block && !a.block ? true : (a.room?.Block || a.block) === room.Block);
        return matchRoomId || matchRoomNo;
      })
      .map((a) => {
        const found = students.find(
          (s) =>
            String(s._id) === String(a.studentId?._id || a.studentId) ||
            (s.Rollno && (s.Rollno.toUpperCase() === (a.student?.Rollno || a.studentName || "").toUpperCase()))
        );
        return {
          _id: found?._id || a.studentId?._id || a.studentId || a.id,
          Name: found?.Name || a.studentName || a.student?.Name || a.studentId?.Name || "Student",
          Rollno: found?.Rollno || a.student?.Rollno || a.studentId?.Rollno || "—",
          Course: found?.Course || a.student?.Course || a.studentId?.Course || "—",
          Department: found?.Department || a.student?.Department || a.studentId?.Department || "—",
          Year: found?.Year || a.student?.Year || a.studentId?.Year,
        };
      });

    // 2. From Students directory directly mapped to this Room & Block
    const fromStudents = students
      .filter(
        (s) =>
          String(s.Roomno || "").trim().toLowerCase() === String(room.RoomNo || "").trim().toLowerCase() &&
          s.Roomno !== "Unassigned" &&
          s.Roomno !== "" &&
          (!s.Block || !room.Block || s.Block.trim().toUpperCase() === room.Block.trim().toUpperCase())
      )
      .map((s) => ({
        _id: s._id,
        Name: s.Name || "Student",
        Rollno: s.Rollno || "—",
        Course: s.Course || "—",
        Department: s.Department || "—",
        Year: s.Year,
      }));

    // 3. From backend populated AllocatedStudents
    const fromBackend = (room.AllocatedStudents || []).map((s) => ({
      _id: s._id,
      Name: s.Name || "Student",
      Rollno: s.Rollno || "—",
      Course: s.Course || "—",
      Department: s.Department || "—",
      Year: s.Year,
    }));

    // Merge and deduplicate by Rollno / _id
    const merged = [...fromAllocations, ...fromStudents, ...fromBackend];
    const seen = new Set();
    return merged.filter((item) => {
      const key = item.Rollno !== "—" ? item.Rollno.toUpperCase() : String(item._id || item.Name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const filteredRooms = rooms.filter((room) => {
    const residents = getResidentsForRoom(room);
    const occupiedCount = residents.length > 0 ? Math.max(residents.length, Number(room.OccupiedCount || 0)) : Number(room.OccupiedCount || 0);
    const capacity = Number(room.Capacity || 1);
    const roomStatus = getCalculatedStatus(occupiedCount, capacity);

    const matchesStatus = selectedStatus === "All" || roomStatus === selectedStatus;
    const matchesBlock = selectedBlock === "All" || room.Block === selectedBlock;
    const matchesFloor = selectedFloor === "All" || String(room.Floor || "") === String(selectedFloor);

    return matchesStatus && matchesBlock && matchesFloor;
  });

  const openForm = (room = null) => {
    setSelected(room);
    setForm(room ? { ...room } : blankRoom);
    setFormOpen(true);
    setError("");
  };

  const openDetails = (room) => {
    setSelected(room);
    setDetailsOpen(true);
    setError("");
  };

  const resetBlockForm = () => {
    setNewBlockName("");
    setNewBlockInstitution("KIET");
    setNewBlockHostelType("Boys");
    setNewBlockFloors([createFloorDraft(1)]);
    setNewBlockRoomCapacity("2");
  };

  const addFloorToBlockDraft = () => {
    setNewBlockFloors((current) => {
      const nextFloorNumber = current.length
        ? Number(current[current.length - 1].floorNumber || 1) + 1
        : 1;
      return [...current, createFloorDraft(nextFloorNumber)];
    });
  };

  const updateFloorDraft = (floorId, value) => {
    setNewBlockFloors((current) =>
      current.map((floor) =>
        floor.id === floorId ? { ...floor, floorNumber: String(value) } : floor
      )
    );
  };

  const addRoomToFloorDraft = (floorId) => {
    setNewBlockFloors((current) =>
      current.map((floor) =>
        floor.id === floorId ? { ...floor, rooms: [...floor.rooms, createRoomDraft()] } : floor
      )
    );
  };

  const updateRoomDraft = (floorId, roomId, value) => {
    setNewBlockFloors((current) =>
      current.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              rooms: floor.rooms.map((room) =>
                room.id === roomId ? { ...room, roomNo: value } : room
              ),
            }
          : floor
      )
    );
  };

  const removeRoomFromFloorDraft = (floorId, roomId) => {
    setNewBlockFloors((current) =>
      current
        .map((floor) => {
          if (floor.id !== floorId) return floor;
          const remainingRooms = floor.rooms.filter((room) => room.id !== roomId);
          return {
            ...floor,
            rooms: remainingRooms.length ? remainingRooms : [createRoomDraft()],
          };
        })
        .filter((floor) => floor.rooms.length > 0)
    );
  };

  const removeFloorDraft = (floorId) => {
    setNewBlockFloors((current) => current.filter((floor) => floor.id !== floorId));
  };

  const saveBlock = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const floorNumbers = newBlockFloors.map((floor) => Number(floor.floorNumber));
    if (
      !floorNumbers.length ||
      floorNumbers.some((floor) => !Number.isInteger(floor) || floor < 0) ||
      new Set(floorNumbers).size !== floorNumbers.length
    ) {
      setError("Enter at least one valid, unique floor number.");
      return;
    }

    const capacity = Number(newBlockRoomCapacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      setError("Default room capacity must be a positive whole number.");
      return;
    }

    const roomDrafts = newBlockFloors.flatMap((floor) =>
      floor.rooms
        .map((room) => ({ roomNo: room.roomNo.trim(), floor: Number(floor.floorNumber) }))
        .filter((room) => room.roomNo)
    );
    const roomKeys = roomDrafts.map((room) => room.roomNo.toLocaleLowerCase());
    const duplicateDraftRoom = roomKeys.find((roomNo, index) => roomKeys.indexOf(roomNo) !== index);
    const existingRoomNumbers = new Set(
      rooms
        .filter((room) => String(room.Block || "").trim().toLocaleLowerCase() === newBlockName.trim().toLocaleLowerCase())
        .map((room) => String(room.RoomNo || "").trim().toLocaleLowerCase())
    );
    const duplicateExistingRoom = roomDrafts.find((room) => existingRoomNumbers.has(room.roomNo.toLocaleLowerCase()));
    if (duplicateDraftRoom || duplicateExistingRoom) {
      setError(`Room number "${duplicateDraftRoom || duplicateExistingRoom.roomNo}" is duplicated in this block.`);
      return;
    }

    setBusy(true);
    let createdBlockName = "";
    let createdRoomsCount = 0;
    try {
      const { data } = await blockService.create({
        name: newBlockName.trim(),
        institution: newBlockInstitution,
        hostelType: newBlockHostelType,
        floors: newBlockFloors.length,
      });
      createdBlockName = data.name;

      for (const room of roomDrafts) {
        await roomService.create({
          RoomNo: room.roomNo,
          Block: data.name,
          Floor: room.floor,
          Capacity: capacity,
          OccupiedCount: 0,
          Status: "Available",
        });
        createdRoomsCount += 1;
      }

      setBlocks((current) => [...new Set([...current, data.name])].sort((a, b) => a.localeCompare(b)));
      setNewBlockName("");
      setNewBlockInstitution("KIET");
      setNewBlockHostelType("Boys");
      setNewBlockFloors([createFloorDraft(1)]);
      setNewBlockRoomCapacity("2");
      setBlockFormOpen(false);
      setSuccessMsg(`${data.name} added successfully with ${createdRoomsCount} room${createdRoomsCount === 1 ? "" : "s"}.`);
      loadData();
    } catch (err) {
      if (createdBlockName) {
        setError(`${createdBlockName} was created, but room creation failed after ${createdRoomsCount} of ${roomDrafts.length} rooms: ${getErrorMessage(err, "Failed to create room.")}`);
        loadData();
      } else {
        setError(getErrorMessage(err, "Failed to add block."));
      }
    } finally {
      setBusy(false);
    }
  };

  const saveRoom = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMsg("");

    try {
      const occupied = Number(form.OccupiedCount || 0);
      const capacity = Number(form.Capacity || 1);
      const statusValue = getCalculatedStatus(occupied, capacity);

      const payload = {
        ...form,
        Floor: Number(form.Floor),
        Capacity: capacity,
        OccupiedCount: occupied,
        Status: statusValue,
      };

      if (selected) {
        await roomService.update(selected._id, payload);
        setSuccessMsg("Room updated successfully.");
      } else {
        await roomService.create(payload);
        setSuccessMsg("Room created successfully.");
      }

      setFormOpen(false);
      setSelected(null);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save room."));
    } finally {
      setBusy(false);
    }
  };

  const deleteRoom = async (room) => {
    if (!window.confirm(`Are you sure you want to delete Room ${room.RoomNo}?`)) return;
    try {
      await roomService.remove(room._id);
      setSuccessMsg(`Room ${room.RoomNo} deleted.`);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete room."));
    }
  };

  const newBlockRooms = newBlockName.trim()
    ? rooms.filter(
        (room) => String(room.Block || "").trim().toLowerCase() === newBlockName.trim().toLowerCase()
      )
    : [];

  return (
    <div className="max-h-[calc(100vh-56px)] overflow-y-auto space-y-6">
      {/* Hierarchy Breadcrumb Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-3">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#2F2925]">Room Management</h2>
            <p className="text-xs text-[#8B7355]">
              View room details, check student information, and manage room availability and allocations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setError("");
                resetBlockForm();
                setBlockFormOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EB8055] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#D96B3A] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Block
            </button>
            <button
              onClick={() => openForm()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EB8055] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#D96B3A] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Room
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="p-1 hover:bg-rose-100 rounded-lg text-rose-700 transition-colors cursor-pointer"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold flex items-center justify-between gap-2">
          <span>{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-[#E8D8C4] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8B7355] uppercase">Total Rooms</p>
              <p className="text-2xl font-extrabold text-[#2F2925]">{rooms.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FDF0DC] flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#EB8055]" />
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E8D8C4] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8B7355] uppercase">Occupied Beds</p>
              <p className="text-2xl font-extrabold text-[#2F2925]">
                {rooms.reduce((s, r) => s + Number(r.OccupiedCount || 0), 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E8D8C4] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8B7355] uppercase">Available Beds</p>
              <p className="text-2xl font-extrabold text-emerald-700">
                {rooms.reduce((s, r) => s + Math.max(0, Number(r.Capacity || 0) - Number(r.OccupiedCount || 0)), 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E8D8C4] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8B7355] uppercase">Total Capacity</p>
              <p className="text-2xl font-extrabold text-[#2F2925]">
                {rooms.reduce((s, r) => s + Number(r.Capacity || 0), 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FDF0DC] flex items-center justify-center">
              <Building className="w-5 h-5 text-[#8B7355]" />
            </div>
          </div>
        </div>
      )}

      {/* Room filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8D8C4] shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Block</label>
            <select
              key={`block-${filterResetKey}`}
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              autoComplete="off"
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-sm cursor-pointer"
            >
              <option value="All">All</option>
              {blocks.map((block) => (
                <option key={block} value={block}>
                  {block === "Executive" ? "Executive Block" : `Block ${block}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Status</label>
            <select
              key={`status-${filterResetKey}`}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              autoComplete="off"
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-sm cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Available">Available</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Floor</label>
            <select
              key={`floor-${filterResetKey}`}
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              autoComplete="off"
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-sm cursor-pointer"
            >
              <option value="All">All</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              resetFilters();
              loadData();
            }}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#2F2925] border-[#E8D8C4]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Room Inventory View */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-slate-500">
          Loading room inventory...
        </div>
      ) : filteredRooms.length ? (
        viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="bg-white rounded-2xl border border-[#E8D8C4] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FDF0DC]/50 border-b border-[#E8D8C4] text-[11px] font-bold uppercase text-[#8B7355] tracking-wider">
                    <th className="p-3.5 pl-5">Room No</th>
                    <th className="p-3.5">Block</th>
                    <th className="p-3.5">Floor</th>
                    <th className="p-3.5">Capacity & Occupancy</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Active Students</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C4]/60 font-medium text-[#2F2925]">
                  {filteredRooms.map((room) => {
                    const residents = getResidentsForRoom(room);
                    const occupied = residents.length > 0 ? Math.max(residents.length, Number(room.OccupiedCount || 0)) : Number(room.OccupiedCount || 0);
                    const capacity = Number(room.Capacity || 1);
                    const statusBadge = getCalculatedStatus(occupied, capacity);
                    const pct = Math.min(100, Math.round((occupied / capacity) * 100));

                    return (
                      <tr key={room._id} className="hover:bg-[#FDF0DC]/20 transition-colors">
                        {/* 1. Room No */}
                        <td className="p-3.5 pl-5 font-extrabold text-sm text-[#2F2925]">
                          Room {room.RoomNo}
                        </td>

                        {/* 2. Block */}
                        <td className="p-3.5">
                          <span className="text-[11px] font-bold text-[#B85228] bg-[#FDF0DC] px-2.5 py-1 rounded-lg border border-[#E8D8C4] inline-block shadow-2xs">
                            {room.Block === "Executive" ? "Executive Block" : `Block ${room.Block || "D"}`}
                          </span>
                        </td>

                        {/* 3. Floor */}
                        <td className="p-3.5 font-semibold text-[#8B7355]">
                          Floor {room.Floor ?? 1}
                        </td>

                        {/* 4. Capacity & Occupancy */}
                        <td className="p-3.5">
                          <div className="space-y-1 max-w-[160px]">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span>{occupied} / {capacity} Beds</span>
                              <span className="text-[10px] text-[#8B7355]">{pct}%</span>
                            </div>
                            <div className="w-full bg-[#FDF0DC] rounded-full h-1.5 overflow-hidden border border-[#E8D8C4]/60">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  statusBadge === "Full"
                                    ? "bg-rose-500"
                                    : statusBadge === "Partial"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 5. Status */}
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              statusBadge === "Available"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : statusBadge === "Partial"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-rose-100 text-rose-800 border-rose-200"
                            }`}
                          >
                            {statusBadge}
                          </span>
                        </td>

                        {/* 6. Active Residents (Opens View Room Modal) */}
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => openDetails(room)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#B85228] border border-[#E8D8C4] rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#EB8055]" />
                            <span>View Room</span>
                            <span className="text-[10px] font-extrabold bg-white text-[#2F2925] px-1.5 py-0.2 rounded-md border border-[#E8D8C4]">
                              {residents.length} {residents.length === 1 ? "student" : "students"}
                            </span>
                          </button>
                        </td>

                        {/* 7. Actions (Edit & Delete) */}
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openForm(room)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-[#8B7355] hover:text-[#EB8055] hover:bg-[#FDF0DC] rounded-lg transition-colors cursor-pointer"
                              title="Edit Room Number"
                              aria-label={`Edit Room Number ${room.RoomNo}`}
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit Room No</span>
                            </button>
                            <button
                              onClick={() => deleteRoom(room)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Room"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => {
              const residents = getResidentsForRoom(room);
              const occupied = residents.length > 0 ? Math.max(residents.length, Number(room.OccupiedCount || 0)) : Number(room.OccupiedCount || 0);
              const capacity = Number(room.Capacity || 1);
              const availableBeds = Math.max(0, capacity - occupied);
              const statusBadge = getCalculatedStatus(occupied, capacity);

              return (
                <div
                  key={room._id}
                  className="bg-white rounded-2xl border border-[#E8D8C4] p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-[11px] font-bold text-[#B85228] bg-[#FDF0DC] px-2.5 py-1 rounded-lg border border-[#E8D8C4] shadow-2xs">
                        {room.Block === "Executive" ? "Executive Block" : `Block ${room.Block || "D"}`}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          statusBadge === "Available"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : statusBadge === "Partial"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-rose-100 text-rose-800 border-rose-200"
                        }`}
                      >
                        {statusBadge}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <h3 className="text-xl font-extrabold text-[#2F2925]">Room {room.RoomNo}</h3>
                      <span className="text-xs font-semibold text-[#8B7355]">Floor {room.Floor ?? 1}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E8D8C4]/60 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]/50">
                        <span className="text-[10px] text-[#8B7355] block font-bold">Capacity</span>
                        <strong className="text-[#2F2925] font-extrabold">{capacity}</strong>
                      </div>
                      <div className="p-2 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]/50">
                        <span className="text-[10px] text-[#8B7355] block font-bold">Occupied</span>
                        <strong className="text-[#EB8055] font-extrabold">{occupied}</strong>
                      </div>
                      <div className="p-2 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]/50">
                        <span className="text-[10px] text-[#8B7355] block font-bold">Available</span>
                        <strong className="text-emerald-700 font-extrabold">{availableBeds}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8D8C4]/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openDetails(room)}
                      className="flex-1 py-1.5 px-2 bg-[#FDF0DC] text-[#B85228] font-bold text-xs rounded-xl hover:bg-[#F5E8D4] border border-[#E8D8C4] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Room
                    </button>
                    <button
                      onClick={() => openForm(room)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-2 text-[#8B7355] hover:text-[#EB8055] hover:bg-[#FDF0DC] rounded-xl transition-colors cursor-pointer text-xs font-bold"
                      title="Edit Room Number"
                      aria-label={`Edit Room Number ${room.RoomNo}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Room No</span>
                    </button>
                    <button
                      onClick={() => deleteRoom(room)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-[#E8D8C4] text-center space-y-2">
          <DoorOpen className="w-10 h-10 text-[#8B7355]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#2F2925]">No rooms found</h3>
          <p className="text-xs text-[#8B7355]">Try changing your filters, or add a room to this block.</p>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={saveRoom}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden space-y-4 p-6 border border-[#E8D8C4]"
          >
            <div className="flex items-center justify-between border-b border-[#E8D8C4] pb-3">
              <h3 className="text-base font-extrabold text-[#2F2925]">
                {selected ? `Edit Room ${selected.RoomNo}` : "Add New Room"}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101, 204"
                  value={form.RoomNo || ""}
                  onChange={(e) => setForm({ ...form, RoomNo: e.target.value })}
                  className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                />
              </div>

              <div className={`grid ${selected ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Block *</label>
                  <select
                    value={form.Block || "D"}
                    onChange={(e) => setForm({ ...form, Block: e.target.value })}
                    className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  >
                    {blocks.map((block) => (
                      <option key={block} value={block}>
                        {block === "Executive" ? "Executive Block" : `Block ${block}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Floor *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.Floor ?? 1}
                    onChange={(e) => setForm({ ...form, Floor: Number(e.target.value) })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Bed Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.Capacity ?? 2}
                    onChange={(e) => setForm({ ...form, Capacity: Number(e.target.value) })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8D8C4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FDF0DC] text-[#2F2925] hover:bg-[#F5E8D4] border border-[#E8D8C4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#EB8055] text-white hover:bg-[#D96B3A] cursor-pointer disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Room"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Block Modal */}
      {blockFormOpen && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={saveBlock}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 p-6 border border-[#E8D8C4]"
          >
            <div className="flex items-center justify-between border-b border-[#E8D8C4] pb-3">
              <h3 className="text-base font-extrabold text-[#2F2925]">Add New Block</h3>
              <button
                type="button"
                onClick={() => setBlockFormOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Block Name *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  autoFocus
                  placeholder="e.g. D or Executive"
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Institution *</label>
                  <select
                    required
                    value={newBlockInstitution}
                    onChange={(e) => setNewBlockInstitution(e.target.value)}
                    className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  >
                    <option value="KIET">KIET</option>
                    <option value="KIEW">KIEW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Hostel Type *</label>
                  <select
                    required
                    value={newBlockHostelType}
                    onChange={(e) => setNewBlockHostelType(e.target.value)}
                    className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-[#E8D8C4] bg-[#FDF0DC]/30 p-3">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[#2F2925] font-bold">Floors</label>
                  <button
                    type="button"
                    onClick={addFloorToBlockDraft}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8D8C4] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#B85228] hover:bg-[#FDF0DC] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Floor
                  </button>
                </div>

                <div className="space-y-3">
                  {newBlockFloors.map((floor, floorIndex) => (
                    <div key={floor.id} className="rounded-xl border border-[#E8D8C4] bg-white p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7355]">Floor</span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={floor.floorNumber}
                            onChange={(e) => updateFloorDraft(floor.id, e.target.value)}
                            className="w-20 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-lg px-2 py-1.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 text-[#2F2925]"
                          />
                        </div>
                        {newBlockFloors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFloorDraft(floor.id)}
                            className="text-rose-600 hover:text-rose-700 text-[10px] font-bold cursor-pointer"
                          >
                            Remove Floor
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {floor.rooms.map((room, roomIndex) => (
                          <div key={room.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={room.roomNo}
                              onChange={(e) => updateRoomDraft(floor.id, room.id, e.target.value)}
                              placeholder={`Room ${floorIndex + 1}${roomIndex + 1}`}
                              className="flex-1 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 text-[#2F2925]"
                            />
                            <button
                              type="button"
                              onClick={() => removeRoomFromFloorDraft(floor.id, room.id)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#E8D8C4] bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Remove room"
                              aria-label="Remove room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addRoomToFloorDraft(floor.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#E8D8C4] bg-[#FDF0DC]/30 px-2.5 py-1.5 text-[10px] font-bold text-[#B85228] hover:bg-[#FDF0DC] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8D8C4] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBlockFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FDF0DC] text-[#2F2925] hover:bg-[#F5E8D4] border border-[#E8D8C4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !newBlockName.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#EB8055] text-white hover:bg-[#D96B3A] cursor-pointer disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Block"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Details Modal */}
      {detailsOpen && selected && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col space-y-4 p-6 border border-[#E8D8C4]">
            <div className="flex items-center justify-between border-b border-[#E8D8C4] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#EB8055] uppercase tracking-wider">
                  Room Details & Students
                </span>
                <h3 className="text-xl font-extrabold text-[#2F2925] mt-1">Room {selected.RoomNo}</h3>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const residents = getResidentsForRoom(selected);
              const occupiedCount = residents.length > 0 ? Math.max(residents.length, Number(selected.OccupiedCount || 0)) : Number(selected.OccupiedCount || 0);
              const availableCount = Math.max(0, (selected.Capacity || 0) - occupiedCount);

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs text-center font-semibold">
                    <div className="p-3 bg-[#FDF0DC] rounded-xl border border-[#E8D8C4]">
                      <span className="text-[#8B7355] text-[10px] block font-bold">Block</span>
                      <strong className="text-[#B85228] font-extrabold">
                        {selected.Block === "Executive" ? "Executive Block" : `Block ${selected.Block}`}
                      </strong>
                    </div>
                    <div className="p-3 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]">
                      <span className="text-[#8B7355] text-[10px] block font-bold">Hostel</span>
                      <strong className="text-[#2F2925] font-extrabold">{getHostelTypeForBlock(selected.Block)}</strong>
                    </div>
                    <div className="p-3 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]">
                      <span className="text-[#8B7355] text-[10px] block font-bold">Floor</span>
                      <strong className="text-[#2F2925] font-extrabold">{selected.Floor}</strong>
                    </div>
                    <div className="p-3 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]">
                      <span className="text-[#8B7355] text-[10px] block font-bold">Capacity</span>
                      <strong className="text-[#2F2925] font-extrabold">{selected.Capacity}</strong>
                    </div>
                    <div className="p-3 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]">
                      <span className="text-[#8B7355] text-[10px] block font-bold">Occupied</span>
                      <strong className="text-[#EB8055] font-extrabold">{occupiedCount}</strong>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 text-[10px] block font-bold">Available</span>
                      <strong className="text-emerald-900 font-extrabold">{availableCount}</strong>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-[#2F2925] mb-2 flex items-center justify-between">
                      <span>Current Active Students ({residents.length})</span>
                      {availableCount > 0 && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                          {availableCount} {availableCount === 1 ? "bed" : "beds"} vacant
                        </span>
                      )}
                    </h4>
                    {residents.length ? (
                      <div className="max-h-[300px] overflow-auto overscroll-contain scroll-smooth rounded-xl border border-[#E8D8C4]">
                        <table className="w-full min-w-[850px] text-left text-xs">
                          <thead className="sticky top-0 bg-[#FDF0DC] text-[#8B7355]">
                            <tr>
                              <th scope="col" className="px-4 py-3 font-extrabold">Student Name</th>
                              <th scope="col" className="px-4 py-3 font-extrabold">Student ID / Roll Number</th>
                              <th scope="col" className="px-4 py-3 font-extrabold">Course</th>
                              <th scope="col" className="px-4 py-3 font-extrabold">Year</th>
                              <th scope="col" className="px-4 py-3 font-extrabold">Room Number</th>
                              <th scope="col" className="px-4 py-3 font-extrabold">Block</th>
                              <th scope="col" className="px-4 py-3 font-extrabold">Allocation Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8D8C4]">
                            {residents.map((res, i) => (
                              <tr key={res._id || res.Rollno || i} className="bg-white even:bg-[#FDF0DC]/30">
                                <td className="px-4 py-3 font-bold text-[#2F2925]">{res.Name || "—"}</td>
                                <td className="px-4 py-3 font-semibold text-[#B85228]">{res.Rollno !== "—" ? res.Rollno : res._id || "—"}</td>
                                <td className="px-4 py-3 text-[#5A4A3A]">{res.Course || "—"}</td>
                                <td className="px-4 py-3 text-[#5A4A3A]">{res.Year || "—"}</td>
                                <td className="px-4 py-3 text-[#5A4A3A]">{selected.RoomNo || "—"}</td>
                                <td className="px-4 py-3 text-[#5A4A3A]">{selected.Block ? `Block ${selected.Block}` : "—"}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                    Active
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 bg-[#FDF0DC]/30 rounded-xl border border-dashed border-[#E8D8C4] text-center space-y-1">
                        <Users className="w-7 h-7 text-[#8B7355]/40 mx-auto" />
                        <p className="text-xs font-bold text-[#2F2925]">No students currently assigned</p>
                        <p className="text-[10px] text-[#8B7355]">All {selected.Capacity || 2} beds are available in this room.</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            <div className="pt-3 border-t border-[#E8D8C4] flex justify-end">
              <button
                onClick={() => setDetailsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FDF0DC] text-[#2F2925] hover:bg-[#F5E8D4] border border-[#E8D8C4] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
