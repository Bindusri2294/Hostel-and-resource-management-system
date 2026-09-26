import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { attendanceService, leaveService, getErrorMessage } from "../../services/api";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CalendarCheck2,
  PlusCircle,
  FileText,
  Send,
  X,
  Phone,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";

export default function MyAttendance() {
  const { user } = useAuth();
  const student = user?.student || {};

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Leave Requests state
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState("");

  // Leave Form state
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Home Visit",
    startDate: "",
    endDate: "",
    reason: "",
    parentContact: "",
  });

  // Month navigation state: defaults to current month (e.g., "2026-09")
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedDateRecord, setSelectedDateRecord] = useState(null);

  const fetchAttendance = (month) => {
    setLoading(true);
    setError("");
    attendanceService
      .mine({ month })
      .then((res) => {
        setAttendanceData(res.data);
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Could not load attendance record."));
      })
      .finally(() => setLoading(false));
  };

  const fetchMyLeaves = () => {
    setLoadingLeaves(true);
    leaveService
      .mine()
      .then((res) => {
        setLeaveRequests(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching leaves:", err);
      })
      .finally(() => setLoadingLeaves(false));
  };

  useEffect(() => {
    fetchAttendance(selectedMonth);
    fetchMyLeaves();
  }, [selectedMonth]);

  // Handle Month Stepping
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(prevStr);
    setSelectedDateRecord(null);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(nextStr);
    setSelectedDateRecord(null);
  };

  // Submit Leave Request
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmittingLeave(true);
    setError("");

    try {
      await leaveService.apply(leaveForm);
      setLeaveSuccessMsg("Leave application sent to hostel warden for approval!");
      setIsLeaveModalOpen(false);
      setLeaveForm({
        leaveType: "Home Visit",
        startDate: "",
        endDate: "",
        reason: "",
        parentContact: "",
      });
      fetchMyLeaves();
      setTimeout(() => setLeaveSuccessMsg(""), 5000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to submit leave request."));
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Month formatting (e.g., "September 2026")
  const [currentYear, currentMonthNum] = selectedMonth.split("-").map(Number);
  const monthDateObj = new Date(currentYear, currentMonthNum - 1, 1);
  const monthLabel = monthDateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Compute days in month for the calendar
  const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthNum - 1, 1).getDay();

  // Map records by date string: "YYYY-MM-DD"
  const recordsMap = {};
  if (attendanceData?.records) {
    attendanceData.records.forEach((r) => {
      recordsMap[r.date] = r;
    });
  }

  const summary = attendanceData?.summary || {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    percentage: 100,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/15 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Personal Attendance & Leave Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            My Attendance Record
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 font-medium mt-1">
            Roll No: <span className="font-extrabold text-white">{student.Rollno || "Unassigned"}</span> · Room:{" "}
            <span className="font-extrabold text-white">{student.Roomno || "—"}</span> (Block{" "}
            <span className="font-extrabold text-white">{student.Block || "D"}</span>)
          </p>
        </div>

        {/* Action & Rate Badge */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Apply for Leave</span>
          </button>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <div className="text-right">
              <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Attendance Rate</p>
              <p className="text-2xl font-black text-white">{summary.percentage}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {leaveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{leaveSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Days Tracked</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.totalDays}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Days</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{summary.presentDays}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent Days</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{summary.absentDays}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved Leaves</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{summary.leaveDays}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Monthly Attendance Calendar & Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-extrabold text-slate-900">{monthLabel}</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedMonth(currentMonthStr)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Day Labels */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-400 uppercase py-1 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 rounded-xl bg-slate-50/50" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, "0")}`;
              const record = recordsMap[dateStr];
              const isToday =
                today.getFullYear() === currentYear &&
                today.getMonth() + 1 === currentMonthNum &&
                today.getDate() === dayNum;
              const isSelected = selectedDateRecord?.date === dateStr;

              let statusBg = "bg-slate-50 text-slate-600 hover:bg-slate-100";
              let statusDot = null;

              if (record) {
                if (record.status === "Present") {
                  statusBg = "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100";
                  statusDot = <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>;
                } else if (record.status === "Absent") {
                  statusBg = "bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100";
                  statusDot = <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>;
                } else if (record.status === "Leave") {
                  statusBg = "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100";
                  statusDot = <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>;
                }
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDateRecord(record ? { ...record, dayNum } : { date: dateStr, dayNum, status: "Not Logged" })}
                  className={`h-14 p-1.5 rounded-xl text-left flex flex-col justify-between transition-all cursor-pointer ${statusBg} ${isSelected ? "ring-2 ring-purple-600 shadow-md font-bold" : ""
                    } ${isToday ? "border-2 border-purple-500" : ""}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isToday ? "text-purple-700" : ""}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-100 px-1 rounded">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    {statusDot}
                    <span className="text-[10px] font-bold capitalize">
                      {record ? record.status : "—"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Approved Leave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span>No Session</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details / Guidelines */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Day Inspection
            </h3>

            {selectedDateRecord ? (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Date</span>
                  <span className="text-xs font-extrabold text-slate-800">{selectedDateRecord.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Attendance Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${selectedDateRecord.status === "Present"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedDateRecord.status === "Absent"
                        ? "bg-rose-100 text-rose-800"
                        : selectedDateRecord.status === "Leave"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {selectedDateRecord.status}
                  </span>
                </div>
                {selectedDateRecord.remarks && (
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-1">Remarks</span>
                    <p className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-purple-100">
                      {selectedDateRecord.remarks}
                    </p>
                  </div>
                )}
                {selectedDateRecord.createdAt && (
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-purple-100">
                    Logged: {new Date(selectedDateRecord.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-xs italic">
                Click any day on the calendar to inspect specific attendance status and remarks.
              </div>
            )}

            {/* Hostel Leave & Attendance Policy */}
            <div className="mt-5 space-y-2 text-xs text-slate-600">
              <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Leave Protocol
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Hostel leaves must be submitted at least 24 hours in advance. Once approved by the warden, your attendance records are automatically updated to "Leave" without penalty.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLeaveModalOpen(true)}
            className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* 4. My Leave Applications Section */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">My Leave Applications</h3>
              <p className="text-xs text-slate-500">Track warden approvals for hostel leave requests</p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
            {leaveRequests.length} Applications
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {loadingLeaves ? (
            <div className="py-6 text-center text-xs font-bold text-slate-400">Loading leave applications...</div>
          ) : leaveRequests.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaveRequests.map((leave) => {
                const isApproved = leave.status === "Approved";
                const isPending = leave.status === "Pending";
                const isRejected = leave.status === "Rejected";

                return (
                  <div
                    key={leave._id}
                    className={`p-4 rounded-2xl border transition-all ${isApproved
                      ? "bg-emerald-50/50 border-emerald-200 shadow-xs"
                      : isPending
                        ? "bg-amber-50/50 border-amber-200"
                        : "bg-rose-50/50 border-rose-200"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-700 mb-1">
                          {leave.leaveType}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">{leave.reason}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${isApproved
                          ? "bg-emerald-600 text-white"
                          : isPending
                            ? "bg-amber-500 text-white"
                            : "bg-rose-600 text-white"
                          }`}
                      >
                        {isApproved ? "Approved Leave" : isPending ? "Pending Review" : "Rejected"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-200/60 my-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Duration</span>
                        <span className="font-extrabold text-slate-800">
                          {leave.startDate} to {leave.endDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Parent Contact</span>
                        <span className="font-bold text-slate-800">{leave.parentContact}</span>
                      </div>
                    </div>

                    {leave.adminRemarks && (
                      <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl border border-slate-200/60 mt-1">
                        <span className="font-bold">Warden Note:</span> {leave.adminRemarks}
                      </p>
                    )}

                    {isApproved && (
                      <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Valid Gate Pass · Attendance auto-marked as Leave for these dates</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              You haven't submitted any leave applications yet. Click "Apply for Leave" when you need to travel.
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Daily Logs Table */}
      <div className="bg-white rounded-2xl border border-purple-100/70 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent Attendance Logs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of daily verification</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
            {attendanceData?.records?.length || 0} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {attendanceData?.records?.length ? (
                attendanceData.records.slice(0, 15).map((rec) => {
                  const dayOfWeek = new Date(rec.date).toLocaleDateString("en-US", { weekday: "long" });
                  return (
                    <tr key={rec._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{rec.date}</td>
                      <td className="py-3.5 px-4 text-slate-500">{dayOfWeek}</td>
                      <td className="py-3.5 px-4 font-bold text-purple-900">{rec.rollNo}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${rec.status === "Present"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : rec.status === "Absent"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                        >
                          {rec.status === "Present" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {rec.status === "Absent" && <XCircle className="w-3 h-3 text-rose-600" />}
                          {rec.status === "Leave" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic">
                        {rec.remarks || "Regular hostel check-in"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 italic">
                    {loading ? "Loading attendance records..." : "No attendance logs found for this period."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Apply Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-purple-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Apply for Hostel Leave</h3>
                  <p className="text-xs text-slate-500">Requires hostel warden approval</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Leave Category *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
                >
                  <option value="Home Visit">Home Visit</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Academic / Internship">Academic / Internship Event</option>
                  <option value="Emergency">Family Emergency</option>
                  <option value="Festival / Holiday">Festival / Holiday</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departure (Start) Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Return (End) Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Contact Phone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 ***** *****"
                    value={leaveForm.parentContact}
                    onChange={(e) => setLeaveForm({ ...leaveForm, parentContact: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details about your travel destination, consent, or doctor appointment..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50 text-[11px] text-purple-900 border border-purple-100 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Once approved by the warden, your attendance records for these dates will automatically reflect as "Approved Leave" in daily night verifications.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingLeave ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
