import { useEffect, useState } from "react";
import { allocationService, studentService, roomService, getErrorMessage } from "../../services/api";
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  LogOut,
  Trash2,
  AlertCircle,
  X,
  Building,
  RefreshCw,
} from "lucide-react";

export default function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [blockFilter, setBlockFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All");

  // Modal State for New Allocation
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("D");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allocRes, studentRes, roomRes] = await Promise.all([
        allocationService.list(),
        studentService.list(),
        roomService.list(),
      ]);
      setAllocations(allocRes.data || []);
      setStudents(studentRes.data || []);
      setRooms(roomRes.data || []);
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

  const activeAllocations = allocations.filter((a) => a.status === "Active");
  const vacatedAllocations = allocations.filter((a) => a.status === "Vacated");
  const availableRooms = rooms.filter(
    (r) => r.Status !== "Full" && Number(r.OccupiedCount || 0) < Number(r.Capacity || 1)
  );

  const availableRoomNumbers = Array.from(
    new Set(
      rooms
        .filter((r) => blockFilter === "All" || r.Block === blockFilter)
        .map((r) => r.RoomNo)
    )
  ).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

  const modalAvailableRooms = availableRooms.filter(
    (r) => !selectedBlock || r.Block === selectedBlock
  );

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
    const stu = students.find((s) => s._id === studentId);
    if (stu?.Block) {
      setSelectedBlock(stu.Block);
    }
    setSelectedRoom("");
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRoom) return;
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      await allocationService.create({
        studentId: selectedStudent,
        roomId: selectedRoom,
        allocatedDate: new Date().toISOString(),
      });

      setSuccessMsg("Room allocation created successfully.");
      setSelectedStudent("");
      setSelectedBlock("D");
      setSelectedRoom("");
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create allocation."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVacate = async (id) => {
    if (!window.confirm("Are you sure you want to mark this allocation as Vacated?")) return;
    try {
      await allocationService.update(id, {
        status: "Vacated",
        vacatedDate: new Date().toISOString(),
      });
      setSuccessMsg("Allocation marked as Vacated.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this allocation record?")) return;
    try {
      await allocationService.remove(id);
      setSuccessMsg("Allocation record deleted.");
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filteredAllocations = allocations.filter((alloc) => {
    const allocBlock = alloc.room?.Block || alloc.block || "D";
    const allocRoom = String(alloc.roomNo || alloc.room?.RoomNo || "");
    const matchesStatus = statusFilter === "All" || alloc.status === statusFilter;
    const matchesBlock = blockFilter === "All" || allocBlock === blockFilter;
    const matchesRoom = roomFilter === "All" || allocRoom === roomFilter;

    if (!query.trim()) {
      return matchesStatus && matchesBlock && matchesRoom;
    }

    const q = query.toLowerCase();
    const matchName = String(alloc.studentName || alloc.student?.Name || "").toLowerCase().includes(q);
    const matchRoll = String(alloc.student?.Rollno || "").toLowerCase().includes(q);
    const matchRoom = allocRoom.toLowerCase().includes(q);
    const matchBlock = String(allocBlock).toLowerCase().includes(q);
    const matchCourse = String(alloc.student?.Course || alloc.student?.Department || "").toLowerCase().includes(q);
    const matchStatus = String(alloc.status || "").toLowerCase().includes(q);
    const matchDate = alloc.allocationDate ? new Date(alloc.allocationDate).toLocaleDateString().toLowerCase().includes(q) : false;

    const matchesQuery = matchName || matchRoll || matchRoom || matchBlock || matchCourse || matchStatus || matchDate;

    return matchesStatus && matchesBlock && matchesRoom && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Allocation Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign residents to available rooms and track active / vacated status.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Allocation
        </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Active Allocations</p>
            <p className="text-2xl font-extrabold text-slate-900">{activeAllocations.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Vacated Rooms</p>
            <p className="text-2xl font-extrabold text-slate-900">{vacatedAllocations.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <LogOut className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Available Rooms</p>
            <p className="text-2xl font-extrabold text-purple-900">{availableRooms.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR (Feedback style across all fields) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll no, room, block, course, status, date..."
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
              value={blockFilter}
              onChange={(e) => {
                setBlockFilter(e.target.value);
                setRoomFilter("All");
              }}
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
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Room Filter</label>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Rooms</option>
              {availableRoomNumbers.map((room) => (
                <option key={room} value={room}>
                  Room {room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Vacated">Vacated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs font-semibold text-slate-500">
            Loading allocations...
          </div>
        ) : filteredAllocations.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-purple-50/50 text-purple-950 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Block</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Allocated Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAllocations.map((alloc) => {
                  const studentName = alloc.studentName || alloc.student?.Name || "Resident";
                  const rollNo = alloc.student?.Rollno || "—";
                  const blockName = alloc.room?.Block || alloc.block || "D";
                  const roomNum = alloc.roomNo || alloc.room?.RoomNo || "—";
                  const allocDate = alloc.allocationDate
                    ? new Date(alloc.allocationDate).toLocaleDateString()
                    : "Recently";

                  return (
                    <tr key={alloc.id || alloc._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-xs">
                          {studentName.charAt(0)?.toUpperCase()}
                        </div>
                        <span>{studentName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-bold">{rollNo}</td>
                      <td className="py-3 px-4 font-bold text-purple-700">
                        {blockName === "Executive" ? "Executive" : (blockName || "D")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px]">
                          {roomNum || "Unassigned"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{allocDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            alloc.status === "Active"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : alloc.status === "Vacated"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {alloc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {alloc.status === "Active" && (
                          <button
                            onClick={() => handleVacate(alloc.id || alloc._id)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 cursor-pointer"
                          >
                            Mark Vacated
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(alloc.id || alloc._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-2">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No allocation records found</p>
            <p className="text-[11px] text-slate-400">Click "Create Allocation" to assign a room.</p>
          </div>
        )}
      </div>

      {/* Create Allocation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAllocation}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Create Room Allocation</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Select Resident Student *</label>
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="">Select a student...</option>
                  {students.map((s) => {
                    const isUnassigned = !s.Roomno || s.Roomno.toLowerCase() === "unassigned";
                    return (
                      <option key={s._id} value={s._id}>
                        {s.Name} ({s.Rollno}) {isUnassigned ? "• Unassigned" : `• Room ${s.Roomno}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Block *</label>
                  <select
                    value={selectedBlock}
                    onChange={(e) => {
                      setSelectedBlock(e.target.value);
                      setSelectedRoom("");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  >
                    <option value="D">Block D</option>
                    <option value="E">Block E</option>
                    <option value="KW">Block KW</option>
                    <option value="Executive">Executive Block</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Room Number *</label>
                  <select
                    required
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  >
                    <option value="">Select Room...</option>
                    {modalAvailableRooms.map((r) => {
                      const freeBeds = Math.max(0, (r.Capacity || 1) - (r.OccupiedCount || 0));
                      return (
                        <option key={r._id} value={r._id}>
                          {r.RoomNo} ({freeBeds} {freeBeds === 1 ? "bed" : "beds"} left)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedStudent || !selectedRoom}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Allocating..." : "Confirm Allocation"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
