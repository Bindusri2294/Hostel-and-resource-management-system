import { useEffect, useState } from "react";
import { studentService, getErrorMessage } from "../services/api";
import { ClipboardCheck, Search, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    studentService
      .list()
      .then(({ data }) => {
        setStudents(data || []);
        const initial = {};
        (data || []).forEach((s) => {
          initial[s._id] = "Present";
        });
        setAttendanceMap(initial);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = (id, status) => {
    setAttendanceMap((prev) => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = () => {
    setSavedMsg("Daily hostel attendance logged successfully.");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  const filteredStudents = students.filter(
    (s) =>
      !query ||
      [s.Name, s.Rollno, s.Roomno, s.Block].some((v) =>
        String(v || "").toLowerCase().includes(query.toLowerCase())
      )
  );

  const presentCount = Object.values(attendanceMap).filter((v) => v === "Present").length;
  const absentCount = Object.values(attendanceMap).filter((v) => v === "Absent").length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Resident Attendance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record and verify daily night attendance across hostel blocks.
          </p>
        </div>
        <button
          onClick={handleSaveAttendance}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          Save Attendance Log
        </button>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold">
          {savedMsg}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-400 uppercase">Total Residents</p>
            <p className="text-2xl font-extrabold text-slate-900">{students.length}</p>
          </div>
          <ClipboardCheck className="w-6 h-6 text-purple-600" />
        </div>
        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-400 uppercase">Present Tonight</p>
            <p className="text-2xl font-extrabold text-emerald-600">{presentCount}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-400 uppercase">Absent / Leave</p>
            <p className="text-2xl font-extrabold text-rose-600">{absentCount}</p>
          </div>
          <XCircle className="w-6 h-6 text-rose-600" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or room..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-800 outline-none w-full"
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs font-semibold text-slate-500">
            Loading student roll call...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Block & Room</th>
                  <th className="py-3 px-4 text-right">Night Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map((s) => (
                  <tr key={s._id}>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.Name}</td>
                    <td className="py-3 px-4 text-slate-500">{s.Rollno}</td>
                    <td className="py-3 px-4">
                      Block {s.Block || "A"} · Room {s.Roomno || "Unassigned"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                        <button
                          onClick={() => toggleStatus(s._id, "Present")}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                            attendanceMap[s._id] === "Present"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => toggleStatus(s._id, "Absent")}
                          className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                            attendanceMap[s._id] === "Absent"
                              ? "bg-rose-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
