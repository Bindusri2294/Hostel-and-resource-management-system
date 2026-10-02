import { useEffect, useState } from "react";
import { roomService, studentService, allocationService, getErrorMessage } from "../../services/api";
import {
  DoorOpen,
  Plus,
  Search,
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

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);

  // Filter & Search state
  const [query, setQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFloor, setSelectedFloor] = useState("All");

  // Modal states
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankRoom);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, studentsRes, allocationsRes] = await Promise.all([
        roomService.list(),
        studentService.list(),
        allocationService.list(),
      ]);
      setRooms(roomsRes.data || []);
      setStudents(studentsRes.data || []);
      setAllocations(allocationsRes.data || []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCalculatedStatus = (occupied, capacity) => {
    if (occupied >= capacity) return "Full";
    if (occupied > 0) return "Partial";
    return "Available";
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
          Name: found?.Name || a.studentName || a.student?.Name || a.studentId?.Name || "Resident",
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
        Name: s.Name || "Resident",
        Rollno: s.Rollno || "—",
        Course: s.Course || "—",
        Department: s.Department || "—",
        Year: s.Year,
      }));

    // 3. From backend populated AllocatedStudents
    const fromBackend = (room.AllocatedStudents || []).map((s) => ({
      _id: s._id,
      Name: s.Name || "Resident",
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

    if (!query.trim()) {
      return matchesStatus && matchesBlock && matchesFloor;
    }

    const q = query.toLowerCase();
    const matchRoomNo = String(room.RoomNo || "").toLowerCase().includes(q);
    const matchBlock = String(room.Block || "").toLowerCase().includes(q);
    const matchFloor = `floor ${room.Floor || ""}`.toLowerCase().includes(q) || String(room.Floor || "").toLowerCase().includes(q);
    const matchCapacity = `${capacity} beds`.toLowerCase().includes(q) || String(capacity).toLowerCase().includes(q);
    const matchOccupied = `${occupiedCount} occupied`.toLowerCase().includes(q);
    const matchStatus = roomStatus.toLowerCase().includes(q);

    // Check if any student/resident inside this room matches the query
    const matchResident = residents.some(
      (r) =>
        String(r.Name || "").toLowerCase().includes(q) ||
        String(r.Rollno || "").toLowerCase().includes(q) ||
        String(r.Course || "").toLowerCase().includes(q) ||
        String(r.Department || "").toLowerCase().includes(q)
    );

    const matchesQuery =
      matchRoomNo ||
      matchBlock ||
      matchFloor ||
      matchCapacity ||
      matchOccupied ||
      matchStatus ||
      matchResident;

    return matchesStatus && matchesBlock && matchesFloor && matchesQuery;
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

  return (
    <div className="max-h-[calc(100vh-56px)] overflow-y-auto space-y-6">
      {/* Hierarchy Breadcrumb Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-3">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#2F2925]">Room Management</h2>
            <p className="text-xs text-[#8B7355]">
              Browse room cards, inspect resident student details, and manage bed allocations.
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EB8055] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#D96B3A] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Room
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold">
          {successMsg}
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

      {/* FILTER & SEARCH TOOLBAR (Feedback style across all fields) */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8D8C4] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7355]/60" />
            <input
              type="text"
              placeholder="Search by room no, student name/roll no, block, floor, status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none bg-[#FDF0DC]/40 border-[#E8D8C4] text-[#2F2925] placeholder-[#8B7355]/60 focus:border-[#EB8055] focus:bg-white focus:ring-1 focus:ring-[#EB8055]/20 shadow-sm"
            />
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#2F2925] border-[#E8D8C4]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E8D8C4]">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Block Filter</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-sm cursor-pointer"
            >
              <option value="All">All Blocks</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
              <option value="KW">Block KW</option>
              <option value="Executive">Executive Block</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Status Filter</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Floor Filter</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-sm cursor-pointer"
            >
              <option value="All">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-slate-500">
          Loading room inventory...
        </div>
      ) : filteredRooms.length ? (
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
                    <span className="text-[11px] font-bold text-[#B85228] bg-[#FDF0DC] px-2.5 py-1 rounded-lg border border-[#E8D8C4] flex items-center gap-1.5 shadow-2xs">
                      <Building className="w-3.5 h-3.5 text-[#EB8055]" />
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
                    className="p-2 text-[#8B7355] hover:text-[#EB8055] hover:bg-[#FDF0DC] rounded-xl transition-colors cursor-pointer"
                    title="Edit Room"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
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
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-[#E8D8C4] text-center space-y-2">
          <DoorOpen className="w-10 h-10 text-[#8B7355]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#2F2925]">No rooms found</h3>
          <p className="text-xs text-[#8B7355]">Try changing your search query or filters.</p>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Block *</label>
                  <select
                    value={form.Block || "D"}
                    onChange={(e) => setForm({ ...form, Block: e.target.value })}
                    className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  >
                    <option value="D">Block D</option>
                    <option value="E">Block E</option>
                    <option value="KW">Block KW</option>
                    <option value="Executive">Executive Block</option>
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

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Occupied Count</label>
                  <input
                    type="number"
                    min="0"
                    value={form.OccupiedCount ?? 0}
                    onChange={(e) => setForm({ ...form, OccupiedCount: Number(e.target.value) })}
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

      {/* Room Details Modal */}
      {detailsOpen && selected && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col space-y-4 p-6 border border-[#E8D8C4]">
            <div className="flex items-center justify-between border-b border-[#E8D8C4] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#EB8055] uppercase tracking-wider">
                  Room Details & Residents
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center font-semibold">
                    <div className="p-3 bg-[#FDF0DC] rounded-xl border border-[#E8D8C4]">
                      <span className="text-[#8B7355] text-[10px] block font-bold">Block</span>
                      <strong className="text-[#B85228] font-extrabold">
                        {selected.Block === "Executive" ? "Executive Block" : `Block ${selected.Block}`}
                      </strong>
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
                      <span>Current Active Residents ({residents.length})</span>
                      {availableCount > 0 && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                          {availableCount} {availableCount === 1 ? "bed" : "beds"} vacant
                        </span>
                      )}
                    </h4>
                    {residents.length ? (
                      <div className="max-h-[300px] overflow-y-auto overscroll-contain scroll-smooth pr-2 space-y-2">
                        {residents.map((res, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-xl bg-[#FDF0DC]/50 border border-[#E8D8C4] flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#EB8055] text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                                {res.Name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-extrabold text-[#2F2925] text-xs">{res.Name}</p>
                                <p className="text-[11px] text-[#8B7355] font-semibold">
                                  {res.Course && res.Course !== "—" ? res.Course : "B.Tech"} 
                                  {res.Department && res.Department !== "—" ? ` · ${res.Department}` : ""} 
                                  {res.Year && res.Year !== "—" ? ` · Year ${res.Year}` : ""}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-[#B85228] bg-white px-2.5 py-1 rounded-lg border border-[#E8D8C4] shadow-2xs">
                              {res.Rollno}
                            </span>
                          </div>
                        ))}
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
