import { useEffect, useState } from "react";
import { studentService, roomService, attendanceService, leaveService, getErrorMessage } from "../../services/api";
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCheck,
  X,
  FileSpreadsheet,
  Filter,
  BarChart2,
  ListFilter,
  Layers,
  Sparkles,
  ArrowRight,
  FileText,
  UserCheck,
  Phone,
  Check,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  // Views: "daily" (roster sheet), "calendar" (monthly heatmap overview), or "leaves" (leave approval queue)
  const [activeView, setActiveView] = useState("daily");

  // Selected date for daily roll call (format: "YYYY-MM-DD")
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  // Month string for calendar view (format: "YYYY-MM")
  const [selectedMonth, setSelectedMonth] = useState(getTodayStr().slice(0, 7));
  const [monthSummary, setMonthSummary] = useState(null);
  const [loadingMonth, setLoadingMonth] = useState(false);

  // Leave Requests state
  const [leavesList, setLeavesList] = useState([]);
  const [leaveStats, setLeaveStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leaveFilter, setLeaveFilter] = useState("All");
  const [actionLeave, setActionLeave] = useState(null); // leave object selected for rejection/remarks
  const [adminRemarkInput, setAdminRemarkInput] = useState("");
  const [processingLeaveId, setProcessingLeaveId] = useState(null);

  // Daily attendance state: map studentId -> status ("Present" | "Absent" | "Leave")
  const [attendanceMap, setAttendanceMap] = useState({});

  // Filters for daily roll call
  const [query, setQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load students & rooms on mount
  useEffect(() => {
    Promise.all([studentService.list(), roomService.list()])
      .then(([studentsRes, roomsRes]) => {
        setStudents(studentsRes.data || []);
        setRooms(roomsRes.data || []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));

    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    setLoadingLeaves(true);
    leaveService
      .listAll()
      .then((res) => {
        setLeavesList(res.data?.leaves || []);
        setLeaveStats(res.data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
      })
      .catch((err) => console.error("Error fetching leaves:", err))
      .finally(() => setLoadingLeaves(false));
  };

  // Fetch daily attendance whenever selectedDate or students change
  const fetchDateAttendance = () => {
    if (!selectedDate || students.length === 0) return;

    attendanceService
      .getByDate(selectedDate)
      .then((res) => {
        const remoteMap = res.data?.attendanceMap || {};
        const mergedMap = {};

        students.forEach((s) => {
          if (remoteMap[s._id] && remoteMap[s._id].status) {
            mergedMap[s._id] = remoteMap[s._id].status;
          } else {
            mergedMap[s._id] = null; // Unmarked — admin must manually select
          }
        });

        setAttendanceMap(mergedMap);
      })
      .catch((err) => {
        console.error("Error fetching date attendance:", err);
      });
  };

  useEffect(() => {
    fetchDateAttendance();
  }, [selectedDate, students]);

  // Fetch monthly summary whenever selectedMonth or activeView changes
  useEffect(() => {
    if (activeView === "calendar") {
      setLoadingMonth(true);
      attendanceService
        .getMonthSummary(selectedMonth)
        .then((res) => {
          setMonthSummary(res.data);
        })
        .catch((err) => console.error("Error fetching month summary:", err))
        .finally(() => setLoadingMonth(false));
    } else if (activeView === "leaves") {
      fetchLeaves();
    }
  }, [selectedMonth, activeView]);

  // Date Navigation Helpers
  const stepDate = (days) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const newStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(
      dateObj.getDate()
    ).padStart(2, "0")}`;
    setSelectedDate(newStr);
  };

  const stepMonth = (delta) => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const dateObj = new Date(y, m - 1 + delta, 1);
    const newStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newStr);
  };

  // Status updates
  const setStudentStatus = (id, status) => {
    setAttendanceMap((prev) => ({ ...prev, [id]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceMap(updated);
  };

  // Save attendance to backend MongoDB
  const handleSaveAttendance = async () => {
    // Check if any students are still unmarked
    const unmarkedStudents = students.filter((s) => !attendanceMap[s._id]);
    if (unmarkedStudents.length > 0) {
      setError(`Cannot save: ${unmarkedStudents.length} student(s) are still unmarked. Please mark all students before saving.`);
      return;
    }

    setSaving(true);
    setError("");
    setSavedMsg("");

    try {
      const records = students.map((s) => ({
        studentId: s._id,
        rollNo: s.Rollno,
        status: attendanceMap[s._id],
        remarks: "",
      }));

      await attendanceService.saveDaily({
        date: selectedDate,
        records,
      });

      setSavedMsg(`Attendance for ${selectedDate} saved to database successfully.`);
      setTimeout(() => setSavedMsg(""), 4000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save daily attendance."));
    } finally {
      setSaving(false);
    }
  };

  // Admin approves or rejects leave
  const handleUpdateLeave = async (leaveId, status, remarks = "") => {
    setProcessingLeaveId(leaveId);
    setError("");

    try {
      await leaveService.updateStatus(leaveId, {
        status,
        adminRemarks: remarks,
      });

      setSavedMsg(`Leave request marked as ${status}.${status === "Approved" ? " Attendance records auto-updated to 'Leave'." : ""}`);
      setTimeout(() => setSavedMsg(""), 5000);
      setActionLeave(null);
      setAdminRemarkInput("");
      fetchLeaves();
      fetchDateAttendance();
    } catch (err) {
      setError(getErrorMessage(err, `Failed to update leave request.`));
    } finally {
      setProcessingLeaveId(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ["Date", "Student Name", "Roll Number", "Block", "Room Number", "Attendance Status"],
    ];

    students.forEach((s) => {
      const block = getStudentBlock(s);
      const status = attendanceMap[s._id] || "Unmarked";
      rows.push([selectedDate, `"${s.Name}"`, s.Rollno, block, s.Roomno || "Unassigned", status]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hostel_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Block & Room Mappings
  const blockOptions = [
    { value: "D", label: "Block D" },
    { value: "E", label: "Block E" },
    { value: "KW", label: "Block KW" },
    { value: "Executive", label: "Executive Block" },
  ];
  const roomBlockMap = new Map(rooms.map((r) => [String(r.RoomNo), r.Block]));
  const getStudentBlock = (s) => roomBlockMap.get(String(s.Roomno)) || s.Block || "D";

  const roomOptions = [...new Set(students.map((s) => s.Roomno).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true })
  );

  // Filtered students for daily table
  const filteredStudents = students.filter((s) => {
    const studentBlock = getStudentBlock(s);
    const currentStatus = attendanceMap[s._id] || null;

    const matchesBlock = !selectedBlock || studentBlock === selectedBlock;
    const matchesRoom = !selectedRoom || String(s.Roomno || "") === selectedRoom;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Present" && currentStatus === "Present") ||
      (statusFilter === "Absent" && currentStatus === "Absent") ||
      (statusFilter === "Leave" && currentStatus === "Leave") ||
      (statusFilter === "Unmarked" && !currentStatus);

    if (!query.trim()) {
      return matchesBlock && matchesRoom && matchesStatus;
    }

    const q = query.toLowerCase();
    const matchName = String(s.Name || "").toLowerCase().includes(q);
    const matchRoll = String(s.Rollno || "").toLowerCase().includes(q);
    const matchRoom = String(s.Roomno || "").toLowerCase().includes(q);
    const matchBlock = String(studentBlock || "").toLowerCase().includes(q);
    const matchCourse = String(s.Course || s.Department || "").toLowerCase().includes(q);
    const statusLabel = currentStatus || "unmarked";
    const matchStatus = statusLabel.toLowerCase().includes(q);

    const matchesQuery = matchName || matchRoll || matchRoom || matchBlock || matchCourse || matchStatus;

    return matchesBlock && matchesRoom && matchesStatus && matchesQuery;
  });

  const clearFilters = () => {
    setQuery("");
    setSelectedBlock("");
    setSelectedRoom("");
    setStatusFilter("all");
  };

  // Stats calculation
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((v) => v === "Present").length;
  const absentCount = Object.values(attendanceMap).filter((v) => v === "Absent").length;
  const leaveCount = Object.values(attendanceMap).filter((v) => v === "Leave").length;
  const unmarkedCount = Object.values(attendanceMap).filter((v) => !v).length;
  const markedCount = totalCount - unmarkedCount;
  const attendanceRate = markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0;

  // Selected date formatted: e.g. "Friday, Sep 25, 2026"
  const [selY, selM, selD] = selectedDate.split("-").map(Number);
  const selectedDateObj = new Date(selY, selM - 1, selD);
  const formattedSelectedDate = selectedDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Monthly Calendar calculations
  const [calY, calM] = selectedMonth.split("-").map(Number);
  const calMonthObj = new Date(calY, calM - 1, 1);
  const calMonthLabel = calMonthObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInCalMonth = new Date(calY, calM, 0).getDate();
  const firstDayOfWeekCal = new Date(calY, calM - 1, 1).getDay();

  // Filtered leave applications
  const filteredLeaves = leavesList.filter((l) => {
    if (leaveFilter === "All") return true;
    return l.status === leaveFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner & View Mode Switcher */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Hostel Attendance Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track daily night roll calls, verify absences across hostel blocks, and manage student leave applications.
          </p>
        </div>

        {/* View Switcher Tabs & Save Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveView("daily")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === "daily"
                  ? "bg-purple-600 text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daily Roll Call</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("calendar")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === "calendar"
                  ? "bg-purple-600 text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Monthly Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("leaves")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === "leaves"
                  ? "bg-purple-600 text-white shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Leave Requests</span>
              {leaveStats.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                  {leaveStats.pending}
                </span>
              )}
            </button>
          </div>

          {activeView === "daily" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Export Daily Attendance to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    <span>Save Attendance Log</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* VIEW 1: DAILY ROLL CALL */}
      {activeView === "daily" && (
        <div className="space-y-6">
          {/* Interactive Date Navigator Bar */}
          <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => stepDate(-1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => stepDate(1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs font-extrabold text-purple-900 bg-purple-50 px-3.5 py-1.5 rounded-xl border border-purple-100 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>{formattedSelectedDate}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Total Residents</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Present Tonight</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-2xl font-extrabold text-emerald-600">{presentCount}</p>
                  {markedCount > 0 && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {attendanceRate}%
                    </span>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Absent Count</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{absentCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Approved Leaves</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{leaveCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-4 bg-white rounded-2xl border shadow-xs flex items-center justify-between ${unmarkedCount > 0 ? 'border-orange-200 bg-orange-50/30' : 'border-purple-100/70'}`}>
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Unmarked</p>
                <p className={`text-2xl font-extrabold mt-0.5 ${unmarkedCount > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{unmarkedCount}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${unmarkedCount > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Roster Table Card */}
          <div className="bg-white rounded-2xl border border-purple-100/70 shadow-xs overflow-hidden">
            {/* Filter & Batch Action Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3">
              {/* FILTER & SEARCH TOOLBAR (Feedback style across all fields) */}
              <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by student name, roll no, room, block, status..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#673BB7] focus:bg-white shadow-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Block Filter</label>
                    <select
                      aria-label="Select Block"
                      value={selectedBlock}
                      onChange={(e) => setSelectedBlock(e.target.value)}
                      className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
                    >
                      <option value="">All Blocks</option>
                      {blockOptions.map((block) => (
                        <option key={block.value} value={block.value}>
                          {block.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Room Filter</label>
                    <select
                      aria-label="Select Room"
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
                    >
                      <option value="">All Rooms</option>
                      {roomOptions.map((room) => (
                        <option key={room} value={room}>
                          Room {room}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Status Filter</label>
                    <select
                      aria-label="Filter by Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Present">Present Only</option>
                      <option value="Absent">Absent Only</option>
                      <option value="Leave">Leave Only</option>
                      <option value="Unmarked">Unmarked Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch:</span>
                <button
                  type="button"
                  onClick={() => markAll("Present")}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll("Absent")}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-xs font-semibold text-slate-500">
                Loading students and roll call records...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Resident</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Block & Room</th>
                      <th className="py-3 px-4 text-center">Night Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredStudents.length ? (
                      filteredStudents.map((s) => {
                        const status = attendanceMap[s._id] || null;
                        const block = getStudentBlock(s);
                        return (
                          <tr key={s._id} className={`hover:bg-slate-50/70 transition-colors ${!status ? 'bg-orange-50/30' : ''}`}>
                            <td className="py-3 px-4">
                              <span className="font-extrabold text-slate-900 block">{s.Name}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {s.Course || "B.Tech"} · Year {s.Year || 1}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-purple-900">{s.Rollno}</td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold text-[11px] border border-purple-100">
                                {block === "Executive" ? "Executive Block" : `Block ${block}`} · Room {s.Roomno || "—"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className={`inline-flex rounded-xl p-0.5 border ${!status ? 'bg-orange-100/60 border-orange-300' : 'bg-slate-100 border-slate-200'}`}>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(s._id, "Present")}
                                  className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                                    status === "Present"
                                      ? "bg-emerald-600 text-white shadow-xs font-black"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(s._id, "Absent")}
                                  className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                                    status === "Absent"
                                      ? "bg-rose-600 text-white shadow-xs font-black"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatus(s._id, "Leave")}
                                  className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                                    status === "Leave"
                                      ? "bg-amber-500 text-white shadow-xs font-black"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  Leave
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-10 text-center text-slate-400 italic">
                          No students matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY ATTENDANCE CALENDAR HEATMAP */}
      {activeView === "calendar" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{calMonthLabel} Overview</h3>
                <p className="text-xs text-slate-500">
                  Hostel-wide attendance heatmap and verification rate per day.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => stepMonth(-1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedMonth(getTodayStr().slice(0, 7))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Current Month
              </button>
              <button
                type="button"
                onClick={() => stepMonth(1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase py-2 border-b border-slate-100">
              <span>Sunday</span>
              <span>Monday</span>
              <span>Tuesday</span>
              <span>Wednesday</span>
              <span>Thursday</span>
              <span>Friday</span>
              <span>Saturday</span>
            </div>

            {loadingMonth ? (
              <div className="py-20 text-center text-xs font-bold text-purple-900 flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading monthly hostel attendance logs...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfWeekCal }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] rounded-xl bg-slate-50/40 border border-transparent" />
                ))}

                {Array.from({ length: daysInCalMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, "0")}`;
                  const dayData = monthSummary?.days?.[dateStr];
                  const isToday = getTodayStr() === dateStr;

                  let cardBg = "bg-slate-50 hover:bg-slate-100/80 border-slate-200/60";
                  let rateBadge = null;

                  if (dayData && dayData.total > 0) {
                    if (dayData.percentage >= 90) {
                      cardBg = "bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/80";
                      rateBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                          {dayData.percentage}%
                        </span>
                      );
                    } else if (dayData.percentage >= 75) {
                      cardBg = "bg-amber-50/80 border-amber-200 hover:bg-amber-100/80";
                      rateBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white">
                          {dayData.percentage}%
                        </span>
                      );
                    } else {
                      cardBg = "bg-rose-50/80 border-rose-200 hover:bg-rose-100/80";
                      rateBadge = (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white">
                          {dayData.percentage}%
                        </span>
                      );
                    }
                  }

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setActiveView("daily");
                      }}
                      className={`min-h-[90px] p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-xs ${cardBg} ${
                        isToday ? "ring-2 ring-purple-600 font-bold" : ""
                      }`}
                      title={`Click to inspect or record attendance for ${dateStr}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold ${isToday ? "text-purple-700" : "text-slate-800"}`}>
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-1 py-0.2 rounded">
                            Today
                          </span>
                        )}
                        {rateBadge}
                      </div>

                      <div className="mt-2 text-[10px] font-semibold text-slate-600 space-y-0.5">
                        {dayData && dayData.total > 0 ? (
                          <>
                            <div className="flex items-center justify-between text-emerald-700 font-bold">
                              <span>Present</span>
                              <span>{dayData.present}</span>
                            </div>
                            <div className="flex items-center justify-between text-rose-600">
                              <span>Absent</span>
                              <span>{dayData.absent}</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic text-[9px]">No Log</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>High Attendance (≥ 90%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span>Moderate (75% - 89%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span>Low Attendance (&lt; 75%)</span>
                </div>
              </div>

              <div className="text-[11px] text-purple-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tip: Click any day to immediately open and edit its daily roll call sheet.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: LEAVE APPROVALS QUEUE */}
      {activeView === "leaves" && (
        <div className="space-y-6">
          {/* Leave Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Total Applications</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{leaveStats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Pending Approval</p>
                <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{leaveStats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Approved Leaves</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{leaveStats.approved}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Rejected Requests</p>
                <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{leaveStats.rejected}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Leave Applications Table Card */}
          <div className="bg-white rounded-2xl border border-purple-100/70 shadow-xs overflow-hidden">
            {/* Status Tabs Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {["All", "Pending", "Approved", "Rejected"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setLeaveFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leaveFilter === st
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st} {st === "Pending" && leaveStats.pending > 0 && `(${leaveStats.pending})`}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-semibold text-slate-500">
                Approving a request automatically marks attendance as "Leave" for those dates.
              </div>
            </div>

            {loadingLeaves ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading leave requests...</div>
            ) : filteredLeaves.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Resident</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Room & Block</th>
                      <th className="py-3 px-4">Leave Type & Reason</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Parent Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Warden Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredLeaves.map((l) => {
                      const isPending = l.status === "Pending";
                      const isApproved = l.status === "Approved";
                      const isRejected = l.status === "Rejected";

                      return (
                        <tr key={l._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 block">{l.studentName}</span>
                            <span className="text-[10px] text-slate-400">
                              Applied: {new Date(l.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-purple-900">{l.rollNo}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold text-[11px] border border-purple-100">
                              Block {l.block} · Room {l.roomNo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-0.5">
                              {l.leaveType}
                            </span>
                            <p className="text-slate-800 font-semibold line-clamp-2">{l.reason}</p>
                            {l.adminRemarks && (
                              <p className="text-[10px] text-slate-500 italic mt-0.5">
                                Note: {l.adminRemarks}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-extrabold text-slate-900 block">
                              {l.startDate}
                            </span>
                            <span className="text-slate-400 text-[10px] block font-semibold">to {l.endDate}</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                            {l.parentContact}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : isPending
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isPending ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={processingLeaveId === l._id}
                                  onClick={() => handleUpdateLeave(l._id, "Approved")}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={processingLeaveId === l._id}
                                  onClick={() => setActionLeave(l)}
                                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {isApproved ? "Approved" : "Rejected"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                No {leaveFilter !== "All" ? leaveFilter.toLowerCase() : ""} leave applications found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Remarks Modal */}
      {actionLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-extrabold text-slate-900">Reject Leave Application</h3>
              </div>
              <button
                type="button"
                onClick={() => setActionLeave(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Rejecting leave request for <span className="font-bold text-slate-900">{actionLeave.studentName}</span> ({actionLeave.rollNo}) for dates {actionLeave.startDate} to {actionLeave.endDate}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Rejection *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Mandatory examinations scheduled on those dates / parent phone unreachable"
                value={adminRemarkInput}
                onChange={(e) => setAdminRemarkInput(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-rose-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionLeave(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!adminRemarkInput.trim() || processingLeaveId === actionLeave._id}
                onClick={() => handleUpdateLeave(actionLeave._id, "Rejected", adminRemarkInput)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
