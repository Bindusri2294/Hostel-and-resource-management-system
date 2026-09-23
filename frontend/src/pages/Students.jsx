import { useEffect, useState } from "react";
import { studentService, roomService, getErrorMessage } from "../services/api";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  GraduationCap,
  Building,
  UserCheck,
} from "lucide-react";

const blankStudent = {
  Name: "",
  Rollno: "",
  Course: "B.Tech",
  Year: 3,
  Department: "CSM",
  Campus: "KIET",
  Block: "C",
  Roomno: "Unassigned",
  Status: "Active",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter state
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
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
      const [studentsRes, roomsRes] = await Promise.all([
        studentService.list(),
        roomService.list(),
      ]);
      setStudents(studentsRes.data || []);
      setAllRooms(roomsRes.data || []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesDept =
      deptFilter === "All" ||
      (student.Course || student.Department || "").toLowerCase().includes(deptFilter.toLowerCase());
    const matchesYear =
      yearFilter === "All" || String(student.Year || "") === String(yearFilter);
    const matchesStatus =
      statusFilter === "All" || (student.Status || "Active") === statusFilter;
    const matchesQuery =
      !query ||
      [student.Name, student.Rollno, student.Course, student.Roomno, student.Block]
        .some((val) => String(val || "").toLowerCase().includes(query.toLowerCase()));

    return matchesDept && matchesYear && matchesStatus && matchesQuery;
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

  const getYearOrdinal = (year) => {
    const y = Number(year) || 1;
    if (y === 1) return "1st";
    if (y === 2) return "2nd";
    if (y === 3) return "3rd";
    return `${y}th`;
  };

  const getDeptFromRollNo = (rollNo, defaultDept) => {
    if (!rollNo) return defaultDept || "CSM";
    const match = String(rollNo).toUpperCase().match(/(42|43|44|45|46)\d{2}$/);
    if (match && String(rollNo).length >= 10) {
      const code = match[1];
      if (code === "42") return "CSM";
      if (code === "43") return "CAI";
      if (code === "44") return "CSD";
      if (code === "45") return "AID";
      if (code === "46") return "CSC";
    }
    return defaultDept || "CSM";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Resident Directory
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Student Management</h2>
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

      {/* Toolbar Filters */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search name, roll no, course..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            <span>Course:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none"
            >
              <option value="All">All Courses</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none"
            >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none"
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
                  <th className="py-3 px-4">Course / Dept</th>
                  <th className="py-3 px-4">Year</th>
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
                    <td className="py-3 px-4 text-slate-600 font-bold">
                      {student.Course || "B.Tech"} / {getDeptFromRollNo(student.Rollno, student.Department)}
                    </td>
                    <td className="py-3 px-4">
                      {getYearOrdinal(student.Year)}
                    </td>
                    <td className="py-3 px-4 font-bold text-purple-700">
                      {student.Block || "C"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px]">
                        {student.Roomno || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${(student.Status || "Active") === "Active"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                      >
                        {student.Status || "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openView(student)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openForm(student)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
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
                  placeholder="e.g. 24B25A4367"
                  value={form.Rollno || ""}
                  onChange={(e) => {
                    const roll = e.target.value.toUpperCase();
                    let updatedDept = form.Department;
                    let updatedBlock = form.Block;
                    
                    const match = roll.match(/(42|43|44|45|46)\d{2}$/);
                    if (match && roll.length >= 10) {
                      const code = match[1];
                      if (code === "42") updatedDept = "CSM";
                      else if (code === "43") updatedDept = "CAI";
                      else if (code === "44") updatedDept = "CSD";
                      else if (code === "45") updatedDept = "AID";
                      else if (code === "46") updatedDept = "CSC";
                      
                      if (updatedDept === "CSC" && (updatedBlock === "Womens" || updatedBlock === "Executive")) {
                        updatedBlock = "C";
                      }
                    }
                    setForm({ ...form, Rollno: roll, Department: updatedDept, Block: updatedBlock });
                  }}
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
                    {!(form.Block === "Womens" || form.Block === "Executive") && (
                      <option value="CSC">CSC</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Campus</label>
                  <select
                    value={form.Campus || "KIET"}
                    onChange={(e) => setForm({ ...form, Campus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  >
                    <option value="KIET">KIET</option>
                    <option value="KIET-W">KIET-W</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Block</label>
                  <select
                    value={form.Block || "C"}
                    onChange={(e) => {
                      const newBlock = e.target.value;
                      let updatedDept = form.Department || "CSM";
                      if ((newBlock === "Womens" || newBlock === "Executive") && updatedDept === "CSC") {
                        updatedDept = "CSM";
                      }
                      setForm({ ...form, Block: newBlock, Roomno: "Unassigned", Department: updatedDept });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                  >
                    <option value="C">Block C</option>
                    <option value="D">Block D</option>
                    <option value="E">Block E</option>
                    <option value="Womens">Womens</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Room Number</label>
                <select
                  value={form.Roomno || "Unassigned"}
                  onChange={(e) => setForm({ ...form, Roomno: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
                >
                  <option value="Unassigned">Unassigned</option>
                  {allRooms.filter(r => r.Block === (form.Block || "C")).map(r => (
                    <option key={r._id} value={r.RoomNo}>{r.RoomNo}</option>
                  ))}
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
                <span className="font-extrabold text-slate-900">{getYearOrdinal(selected.Year)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Department</span>
                <span className="font-extrabold text-slate-900">{getDeptFromRollNo(selected?.Rollno, selected?.Department)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Hostel Block</span>
                <span className="font-extrabold text-purple-700">Block {selected.Block || "C"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">Allocated Room</span>
                <span className="font-extrabold text-slate-900">Room {selected.Roomno || "Unassigned"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
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
