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
  Roomno: "Unassigned",
  Status: "Active",
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
      statusFilter === "All" || (student.Status || "Active") === statusFilter;

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
    setForm(student ? { ...student } : blankStudent);
    setFormOpen(true);
    setError("");
  };

  const openView = (student) => {
    setSelected(student);
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
        Status: form.Status || "Active",
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
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Student Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, edit, and manage registered hostel residents.
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll no, course, room, block, department, phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#673BB7] focus:bg-white shadow-sm"
            />
          </div>

          <button
            onClick={() => {
              loadStudents();
              loadRooms();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Course Filter</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Courses</option>
              <option value="B.TECH">B.TECH</option>
              <option value="DIPLOMA">DIPLOMA</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Year Filter</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Block Filter</label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs font-semibold text-slate-500">
            Loading student list...
          </div>
        ) : filteredStudents.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-purple-50/50 text-purple-950 text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Year & Dept</th>
                  <th className="py-3 px-4">Block</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-xs">
                        {student.Name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span>{student.Name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-bold">{student.Rollno || "—"}</td>
                    <td className="py-3 px-4">
                      {student.Course || "Engineering"}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {getCampusFromRollNo(student.Rollno)}
                    </td>
                    <td className="py-3 px-4">
                      {getOrdinalYear(student.Year)} . {getDeptFromRollNo(student.Rollno)}
                    </td>
                    <td className="py-3 px-4 font-bold text-purple-700">
                      {student.Block === "Executive" ? "Executive" : (student.Block || "D")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px]">
                        {student.Roomno || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          (student.Status || "Active") === "Active"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {student.Status || "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex justify-end items-center gap-1">
                      <button
                        onClick={() => openView(student)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteStudent(student)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Roll Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-CS-01"
                  value={form.Rollno || ""}
                  onChange={(e) => setForm({ ...form, Rollno: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Course</label>
                <select
                  value={form.Course || "B.Tech"}
                  onChange={(e) => setForm({ ...form, Course: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={form.Year ?? 3}
                    onChange={(e) => setForm({ ...form, Year: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Department</label>
                  <select
                    value={form.Department || "CSM"}
                    onChange={(e) => setForm({ ...form, Department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  >
                    <option value="CSM">CSM</option>
                    <option value="CAI">CAI</option>
                    <option value="CSD">CSD</option>
                    <option value="AID">AID</option>
                    {form.Campus !== "KIET-W" && <option value="CSC">CSC</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Block</label>
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
                <label className="block text-slate-700 mb-1 font-bold">Campus</label>
                <select
                  value={form.Campus || "KIET"}
                  onChange={(e) => {
                    const newCampus = e.target.value;
                    const newDept = (newCampus === "KIET-W" && form.Department === "CSC") ? "CSM" : form.Department;
                    setForm({ ...form, Campus: newCampus, Department: newDept });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="KIET">KIET</option>
                  <option value="KIET-W">KIET-W</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Room Number</label>
                <select
                  value={form.Roomno || "Unassigned"}
                  onChange={(e) => setForm({ ...form, Roomno: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="Unassigned">Unassigned</option>
                  {rooms
                    .filter(room => !form.Block || room.Block === form.Block)
                    .map((room) => (
                      <option key={room._id} value={room.RoomNo}>
                        {room.RoomNo}
                      </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Resident Status</label>
                <select
                  value={form.Status || "Active"}
                  onChange={(e) => setForm({ ...form, Status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                {busy ? "Saving..." : "Save Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Student Modal */}
      {viewOpen && selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Student Profile</h3>
              <button
                onClick={() => setViewOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center text-xl">
                {selected.Name?.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">{selected.Name}</h4>
                <p className="text-xs font-semibold text-purple-700">{selected.Course}</p>
                <p className="text-[11px] text-slate-500">Roll No: {selected.Rollno}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Academic Year</span>
                <span className="font-extrabold text-slate-900">Year {selected.Year || 1}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Department</span>
                <span className="font-extrabold text-slate-900">{selected.Department || "CSM"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Hostel Block</span>
                <span className="font-extrabold text-purple-700">{selected.Block || "D"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Allocated Room</span>
                <span className="font-extrabold text-slate-900">{selected.Roomno || "Unassigned"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Resident Status</span>
                  <span className="text-[11px] text-slate-500 font-medium">Hostel Residency State</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    (selected.Status || "Active") === "Active"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {selected.Status || "Active"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setViewOpen(false);
                  openForm(selected);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
              >
                Edit Student
              </button>
              <button
                onClick={() => setViewOpen(false)}
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
