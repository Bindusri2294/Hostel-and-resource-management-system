import { useEffect, useState } from "react";
import { studentService, roomService, getErrorMessage } from "../../services/api";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Building,
  UserCheck,
  RefreshCw,
} from "lucide-react";

const blankStudent = {
  Name: "",
  Rollno: "",
  Course: "B.Tech",
  Year: 3,
  Department: "CSM",
  Campus: "KIET",
  Block: "D",
  Floor: "",
  Roomno: "Unassigned",
  Status: "Boys",
};

const getDeptFromRollNo = (rollno) => {
  if (!rollno || rollno.length < 4) return "CSE";
  const code = rollno.slice(-4, -2);
  switch (code) {
    case "42": return "CSM";
    case "43": return "CAI";
    case "44": return "CSD";
    case "45": return "AID";
    case "46": return "CSC";
    default: return "CSE";
  }
};

const getOrdinalYear = (year) => {
  const y = parseInt(year) || 1;
  if (y === 1) return "1st";
  if (y === 2) return "2nd";
  if (y === 3) return "3rd";
  if (y === 4) return "4th";
  return `${y}th`;
};

const getCampusFromRollNo = (rollno) => {
  if (!rollno || rollno.length < 4) return "KIET";
  const code = rollno.substring(2, 4).toUpperCase();
  switch (code) {
    case "B2": return "KIET";
    case "6Q": return "KIET+";
    case "JN": return "KIET W";
    default: return "KIET";
  }
};

const getHostelType = (student) => {
  if (student.Status === "Boys" || student.Status === "Girls") return student.Status;
  if (student.Block === "KW" || student.Campus === "KIET-W" || student.Campus === "KIET W") return "Girls";
  return "Boys";
};


export default function Students() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter state
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [blockFilter, setBlockFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal states
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankStudent);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data } = await studentService.list();
      setStudents(data || []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const { data } = await roomService.list();
      setRooms(data || []);
    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  };

  useEffect(() => {
    loadStudents();
    loadRooms();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesDept =
      deptFilter === "All" ||
      (student.Course || student.Department || "").toLowerCase().includes(deptFilter.toLowerCase());
    const matchesYear =
      yearFilter === "All" || String(student.Year || "") === String(yearFilter);
    const matchesBlock =
      blockFilter === "All" || String(student.Block || "") === String(blockFilter);
    const matchesStatus =
      statusFilter === "All" || getHostelType(student) === statusFilter;

    if (!query.trim()) {
      return matchesDept && matchesYear && matchesBlock && matchesStatus;
    }

    const q = query.toLowerCase();
    const matchName = String(student.Name || "").toLowerCase().includes(q);
    const matchRoll = String(student.Rollno || "").toLowerCase().includes(q);
    const matchCourse = String(student.Course || "").toLowerCase().includes(q);
    const matchDept = String(student.Department || "").toLowerCase().includes(q);
    const matchRoom = String(student.Roomno || "").toLowerCase().includes(q);
    const matchBlock = String(student.Block || "").toLowerCase().includes(q);
    const matchCampus = String(student.Campus || "").toLowerCase().includes(q);
    const matchEmail = String(student.Email || "").toLowerCase().includes(q);
    const matchPhone = String(student.Phone || "").toLowerCase().includes(q);

    const matchesQuery =
      matchName ||
      matchRoll ||
      matchCourse ||
      matchDept ||
      matchRoom ||
      matchBlock ||
      matchCampus ||
      matchEmail ||
      matchPhone;

    return matchesDept && matchesYear && matchesBlock && matchesStatus && matchesQuery;
  });

  const openForm = (student = null) => {
    setSelected(student);
    setForm(student ? { ...student, Status: getHostelType(student) } : blankStudent);
    setFormOpen(true);
    setError("");
  };

  const openView = (student) => {
    setSelected({ ...student, Status: getHostelType(student) });
    setViewOpen(true);
  };

  const saveStudent = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        ...form,
        Campus: form.Campus || getCampusFromRollNo(form.Rollno),
        Department: form.Department || getDeptFromRollNo(form.Rollno),
        Year: Number(form.Year),
        Status: form.Status || "Boys",
      };

      if (selected) {
        await studentService.update(selected._id, payload);
        setSuccessMsg("Student profile updated.");
      } else {
        await studentService.create(payload);
        setSuccessMsg("Student added successfully.");
      }

      setFormOpen(false);
      setSelected(null);
      loadStudents();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save student details."));
    } finally {
      setBusy(false);
    }
  };

  const saveViewChanges = async () => {
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      await studentService.update(selected._id, selected);
      setSuccessMsg("Student room details updated.");
      setViewOpen(false);
      setSelected(null);
      loadStudents();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update student details."));
    } finally {
      setBusy(false);
    }
  };

  const deleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.Name}?`)) return;
    try {
      await studentService.remove(student._id);
      setSuccessMsg(`Student ${student.Name} removed.`);
      loadStudents();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to remove student."));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#2F2925]">Student Management</h2>
          <p className="text-xs text-[#8B7355] mt-0.5">
            Manage student records, filter by hostel blocks, and easily update room allocations.
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Student
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

      {/* FILTER & SEARCH TOOLBAR (Feedback style across all fields) */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8D8C4] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Course</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-xs cursor-pointer"
            >
              <option value="All">All Courses</option>
              <option value="B.TECH">B.TECH</option>
              <option value="DIPLOMA">DIPLOMA</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-xs cursor-pointer"
            >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Block</label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-xs cursor-pointer"
            >
              <option value="All">All Blocks</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
              <option value="KW">Block KW</option>
              <option value="Executive">Executive Block</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Hostel Type</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-xs cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
              </select>
            </div>
            <button
              onClick={() => {
                setQuery("");
                setDeptFilter("All");
                setYearFilter("All");
                setBlockFilter("All");
                setStatusFilter("All");
                loadStudents();
                loadRooms();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#2F2925] border-[#E8D8C4] h-[30px]"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#EB8055]" />
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-[#E8D8C4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs font-semibold text-[#8B7355]">
            Loading student list...
          </div>
        ) : filteredStudents.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8D8C4] bg-[#FDF0DC] text-[#2F2925] text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Year & Dept</th>
                  <th className="py-3 px-4">Block</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Hostel Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D8C4]/60 font-medium text-[#5A4A3A]">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-[#FDF0DC]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#2F2925] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EB8055] text-white font-extrabold flex items-center justify-center text-xs">
                        {student.Name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span>{student.Name}</span>
                    </td>
                    <td className="py-3 px-4 text-[#8B7355] font-bold">{student.Rollno || "—"}</td>
                    <td className="py-3 px-4">
                      {student.Course || "Engineering"}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#5A4A3A]">
                      {getCampusFromRollNo(student.Rollno)}
                    </td>
                    <td className="py-3 px-4">
                      {getOrdinalYear(student.Year)} . {getDeptFromRollNo(student.Rollno)}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#B85228]">
                      {student.Block === "Executive" ? "Executive" : (student.Block || "D")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#FDF0DC] text-[#B85228] font-bold text-[11px] border border-[#E8D8C4]">
                        {student.Roomno || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getHostelType(student) === "Boys"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-pink-100 text-pink-800 border border-pink-200"
                          }`}
                      >
                        {getHostelType(student)}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex justify-end items-center gap-1">
                      <button
                        onClick={() => openView(student)}
                        className="p-1.5 text-[#8B7355] hover:text-[#EB8055] hover:bg-[#FDF0DC] rounded-lg cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteStudent(student)}
                        className="p-1.5 text-[#8B7355] hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No student records found</p>
            <p className="text-[11px] text-slate-400">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={saveStudent}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {selected ? `Edit ${selected.Name}` : "Add New Student"}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.Name || ""}
                  onChange={(e) => setForm({ ...form, Name: e.target.value })}
                  className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                />
              </div>

              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Roll Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-CS-01"
                  value={form.Rollno || ""}
                  onChange={(e) => setForm({ ...form, Rollno: e.target.value })}
                  className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                />
              </div>

              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Course</label>
                <select
                  value={form.Course || "B.Tech"}
                  onChange={(e) => setForm({ ...form, Course: e.target.value })}
                  className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={form.Year ?? 3}
                    onChange={(e) => setForm({ ...form, Year: Number(e.target.value) })}
                    className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  />
                </div>
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Department</label>
                  <select
                    value={form.Department || "CSM"}
                    onChange={(e) => setForm({ ...form, Department: e.target.value })}
                    className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  >
                    <option value="CSM">CSM</option>
                    <option value="CAI">CAI</option>
                    <option value="CSD">CSD</option>
                    <option value="AID">AID</option>
                    {form.Campus !== "KIET-W" && <option value="CSC">CSC</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Block</label>
                  <select
                    value={form.Block || "D"}
                    onChange={(e) => setForm({ ...form, Block: e.target.value, Roomno: "Unassigned", Floor: "" })}
                    className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  >
                    <option value="D">Block D</option>
                    <option value="E">Block E</option>
                    <option value="KW">Block KW</option>
                    <option value="Executive">Executive Block</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Floor</label>
                  <select
                    value={form.Floor || ""}
                    onChange={(e) => setForm({ ...form, Floor: e.target.value, Roomno: "Unassigned" })}
                    className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                  >
                    <option value="" disabled>Select Floor</option>
                    {Array.from(new Set(rooms.filter(r => r.Block === form.Block).map(r => r.Floor)))
                      .filter(Boolean)
                      .sort((a, b) => a - b)
                      .map(floor => (
                        <option key={floor} value={floor}>Floor {floor}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Campus</label>
                <select
                  value={form.Campus || "KIET"}
                  onChange={(e) => {
                    const newCampus = e.target.value;
                    const newDept = (newCampus === "KIET-W" && form.Department === "CSC") ? "CSM" : form.Department;
                    setForm({ ...form, Campus: newCampus, Department: newDept });
                  }}
                  className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                >
                  <option value="KIET">KIET</option>
                  <option value="KIET+">KIET+</option>
                  <option value="KIET-W">KIET-W</option>
                </select>
              </div>

              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Room Number</label>
                <select
                  value={form.Roomno || "Unassigned"}
                  onChange={(e) => setForm({ ...form, Roomno: e.target.value })}
                  disabled={!form.Floor}
                  className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925] disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="Unassigned">Unassigned</option>
                  {rooms
                    .filter(room => room.Block === form.Block && String(room.Floor) === String(form.Floor))
                    .map((room) => (
                      <option key={room._id} value={room.RoomNo}>
                        {room.RoomNo}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Hostel Type</label>
                <select
                  value={form.Status || "Boys"}
                  onChange={(e) => setForm({ ...form, Status: e.target.value })}
                  className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8D8C4]/60 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FDF0DC] text-[#5A4A3A] hover:bg-[#F5E8D4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#EB8055] text-white hover:bg-[#D96B3A] cursor-pointer disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Student Modal */}
      {viewOpen && selected && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4 border border-[#E8D8C4]">
            <div className="flex items-center justify-between border-b border-[#E8D8C4]/60 pb-3">
              <h3 className="text-base font-extrabold text-[#2F2925]">Student Profile</h3>
              <button
                onClick={() => setViewOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-[#FDF0DC] p-4 rounded-2xl border border-[#E8D8C4]">
              <div className="w-14 h-14 rounded-2xl bg-[#EB8055] text-white font-black flex items-center justify-center text-xl">
                {selected.Name?.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-[#2F2925]">{selected.Name}</h4>
                <p className="text-xs font-semibold text-[#B85228]">{selected.Course}</p>
                <p className="text-[11px] text-[#8B7355]">Roll No: {selected.Rollno}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F9EFDE]/50 rounded-xl border border-[#E8D8C4]">
                <span className="text-[10px] text-[#8B7355] font-bold block">Academic Year</span>
                <span className="font-extrabold text-[#2F2925]">Year {selected.Year || 1}</span>
              </div>
              <div className="p-3 bg-[#F9EFDE]/50 rounded-xl border border-[#E8D8C4]">
                <span className="text-[10px] text-[#8B7355] font-bold block">Department</span>
                <span className="font-extrabold text-[#2F2925]">{selected.Department || "CSM"}</span>
              </div>
              <div className="p-3 bg-[#F9EFDE]/50 rounded-xl border border-[#E8D8C4]">
                <span className="text-[10px] text-[#8B7355] font-bold block mb-1">Hostel Block & Floor</span>
                <div className="flex gap-2">
                  <select
                    value={selected.Block || "D"}
                    onChange={(e) => setSelected({ ...selected, Block: e.target.value, Roomno: "Unassigned", Floor: "" })}
                    className="w-1/2 bg-white border border-[#E8D8C4] rounded-lg px-2 py-1 outline-none focus:border-[#EB8055] font-extrabold text-[#B85228] text-xs"
                  >
                    <option value="D">Block D</option>
                    <option value="E">Block E</option>
                    <option value="KW">Block KW</option>
                    <option value="Executive">Executive</option>
                  </select>
                  <select
                    value={selected.Floor || ""}
                    onChange={(e) => setSelected({ ...selected, Floor: e.target.value, Roomno: "Unassigned" })}
                    className="w-1/2 bg-white border border-[#E8D8C4] rounded-lg px-2 py-1 outline-none focus:border-[#EB8055] font-extrabold text-[#B85228] text-xs"
                  >
                    <option value="" disabled>Select Floor</option>
                    {Array.from(new Set(rooms.filter(r => r.Block === selected.Block).map(r => r.Floor)))
                      .filter(Boolean)
                      .sort((a, b) => a - b)
                      .map(floor => (
                        <option key={floor} value={floor}>Floor {floor}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="p-3 bg-[#F9EFDE]/50 rounded-xl border border-[#E8D8C4]">
                <span className="text-[10px] text-[#8B7355] font-bold block mb-1">Allocated Room</span>
                <select
                  value={selected.Roomno || "Unassigned"}
                  onChange={(e) => setSelected({ ...selected, Roomno: e.target.value })}
                  disabled={!selected.Floor}
                  className="w-full bg-white border border-[#E8D8C4] rounded-lg px-2 py-1 outline-none focus:border-[#EB8055] font-extrabold text-[#2F2925] text-xs disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="Unassigned">Unassigned</option>
                  {rooms
                    .filter(room => room.Block === selected.Block && String(room.Floor) === String(selected.Floor))
                    .map((room) => (
                      <option key={room._id} value={room.RoomNo}>
                        {room.RoomNo}
                      </option>
                    ))}
                </select>
              </div>
              <div className="p-3 bg-[#F9EFDE]/50 rounded-xl border border-[#E8D8C4] col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8B7355] font-bold block">Hostel Type</span>
                  <span className="text-[11px] text-[#8B7355] font-medium">Boys or Girls Hostel</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${getHostelType(selected) === "Boys"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-pink-100 text-pink-800 border border-pink-200"
                    }`}
                >
                  {getHostelType(selected)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8D8C4]/60 flex justify-end gap-2">
              <button
                onClick={saveViewChanges}
                disabled={busy}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EB8055] text-white hover:bg-[#D96B3A] cursor-pointer disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setViewOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#5A4A3A] border border-[#E8D8C4] hover:bg-[#FDF0DC] cursor-pointer"
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
