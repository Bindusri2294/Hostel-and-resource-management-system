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

  const filteredRooms = rooms.filter((room) => {
    const roomStatus = getCalculatedStatus(
      Number(room.OccupiedCount || 0),
      Number(room.Capacity || 1)
    );
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
    const matchCapacity = `${room.Capacity || ""} beds`.toLowerCase().includes(q) || String(room.Capacity || "").toLowerCase().includes(q);
    const matchOccupied = `${room.OccupiedCount || ""} occupied`.toLowerCase().includes(q);
    const matchStatus = roomStatus.toLowerCase().includes(q);

    const matchesQuery = matchRoomNo || matchBlock || matchFloor || matchCapacity || matchOccupied || matchStatus;

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

  const getResidentsForRoom = (room) => {
    if (!room) return [];
    return allocations
      .filter(
        (a) =>
          a.status === "Active" &&
          (String(a.roomId) === String(room._id) || String(a.roomNo) === String(room.RoomNo))
      )
      .map((a) => {
        const found = students.find((s) => String(s._id) === String(a.studentId));
        return {
          Name: found?.Name || a.studentName || "Resident",
          Rollno: found?.Rollno || a.student?.Rollno || "—",
          Course: found?.Course || "—",
        };
      });
  };

  return (
    <div className="space-y-6">
      {/* Hierarchy Breadcrumb Banner */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-3">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Room Management</h2>
            <p className="text-xs text-slate-500">
              Browse room cards, inspect bed availability, and manage residential space.
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
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

      {/* FILTER & SEARCH TOOLBAR (Feedback style across all fields) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by room no, block, floor, capacity, status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#673BB7] focus:bg-white shadow-sm"
            />
          </div>

          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Block Filter</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Blocks</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
              <option value="KW">Block KW</option>
              <option value="Executive">Executive Block</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Status Filter</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Floor Filter</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
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
            const occupied = Number(room.OccupiedCount || 0);
            const capacity = Number(room.Capacity || 1);
            const availableBeds = Math.max(0, capacity - occupied);
            const statusBadge = getCalculatedStatus(occupied, capacity);

            return (
              <div
                key={room._id}
                className="bg-white rounded-2xl border border-purple-100/70 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100/80 flex items-center gap-1.5 shadow-2xs">
                      <Building className="w-3.5 h-3.5 text-purple-600" />
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
                    <h3 className="text-xl font-extrabold text-slate-900">Room {room.RoomNo}</h3>
                    <span className="text-xs font-semibold text-slate-500">Floor {room.Floor ?? 1}</span>
                  </div>


                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Capacity</span>
                      <strong className="text-slate-900 font-extrabold">{capacity}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Occupied</span>
                      <strong className="text-purple-700 font-extrabold">{occupied}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Available</span>
                      <strong className="text-emerald-700 font-extrabold">{availableBeds}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openDetails(room)}
                    className="flex-1 py-1.5 px-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Room
                  </button>
                  <button
                    onClick={() => openForm(room)}
                    className="p-2 text-slate-500 hover:text-purple-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
        <div className="bg-white p-12 rounded-2xl border border-purple-100/70 text-center space-y-2">
          <DoorOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No rooms found</h3>
          <p className="text-xs text-slate-400">Try changing your search query or filters.</p>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={saveRoom}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden space-y-4 p-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {selected ? `Edit Room ${selected.RoomNo}` : "Add New Room"}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101, 204"
                  value={form.RoomNo || ""}
                  onChange={(e) => setForm({ ...form, RoomNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Block *</label>
                  <select
                    value={form.Block || "D"}
                    onChange={(e) => setForm({ ...form, Block: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  >
                    <option value="D">Block D</option>
                    <option value="E">Block E</option>
                    <option value="KW">Block KW</option>
                    <option value="Executive">Executive Block</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Floor *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.Floor ?? 1}
                    onChange={(e) => setForm({ ...form, Floor: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Bed Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.Capacity ?? 2}
                    onChange={(e) => setForm({ ...form, Capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Occupied Count</label>
                  <input
                    type="number"
                    min="0"
                    value={form.OccupiedCount ?? 0}
                    onChange={(e) => setForm({ ...form, OccupiedCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 cursor-pointer disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Room"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room Details Modal */}
      {detailsOpen && selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  Room Details & Residents
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Room {selected.RoomNo}</h3>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs text-center font-semibold">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-slate-400 text-[10px] block font-bold">Block / Floor</span>
                <strong className="text-purple-900 font-extrabold">
                  {selected.Block === "Executive" ? "Executive Block" : `Block ${selected.Block}`} · Floor {selected.Floor}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-bold">Total Beds</span>
                <strong className="text-slate-900 font-extrabold">{selected.Capacity}</strong>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-slate-400 text-[10px] block font-bold">Available Beds</span>
                <strong className="text-emerald-900 font-extrabold">
                  {Math.max(0, (selected.Capacity || 0) - (selected.OccupiedCount || 0))}
                </strong>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-800 mb-2">Current Active Residents</h4>
              {getResidentsForRoom(selected).length ? (
                <div className="space-y-2">
                  {getResidentsForRoom(selected).map((res, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                          {res.Name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{res.Name}</p>
                          <p className="text-[10px] text-slate-500">{res.Course}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        Roll: {res.Rollno}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No active student allocations currently assigned to this room.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
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
