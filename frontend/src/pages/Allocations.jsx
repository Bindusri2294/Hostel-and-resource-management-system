import { useEffect, useState } from "react";
import { allocationService, studentService, roomService, getErrorMessage } from "../services/api";
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

  // Modal State for New Allocation
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
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
    const matchesStatus = statusFilter === "All" || alloc.status === statusFilter;
    const matchesQuery =
      !query ||
      [
        alloc.studentName,
        alloc.student?.Name,
        alloc.student?.Rollno,
        alloc.roomNo,
        alloc.room?.RoomNo,
        alloc.room?.Block,
      ].some((v) => String(v || "").toLowerCase().includes(query.toLowerCase()));

    return matchesStatus && matchesQuery;
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

      {/* Toolbar Filters */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search student, roll no, room..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span>Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Vacated">Vacated</option>
          </select>
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
                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                          {studentName.charAt(0)}
                        </div>
                        <span>{studentName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-bold">{rollNo}</td>
                      <td className="py-3 px-4 font-bold text-purple-700">Block {blockName}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">Room {roomNum}</td>
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
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.Name} ({s.Rollno})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Select Available Room *</label>
                <select
                  required
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="">Select a room...</option>
                  {availableRooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.RoomNo} · Block {r.Block} (
                      {Math.max(0, (r.Capacity || 1) - (r.OccupiedCount || 0))} beds left)
                    </option>
                  ))}
                </select>
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
