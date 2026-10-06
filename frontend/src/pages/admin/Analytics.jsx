import React, { useEffect, useState, useMemo } from "react";
import {
  roomService,
  studentService,
  allocationService,
  attendanceService,
  getErrorMessage,
} from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  DoorOpen,
  ClipboardList,
  Download,
  Calendar,
  Layers,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  CalendarCheck2,
} from "lucide-react";

// Theme color palette
const PALETTE = {
  primary: "#EB8055",
  primaryLight: "#F3C694",
  secondary: "#D96B3A",
  accent: "#ECA270",
  success: "#10B981",
  danger: "#EF4444",
  purple: "#B85228",
  indigo: "#923F1E",
  slate: "#8B7355",
};

const PIE_COLORS = ["#EB8055", "#D96B3A", "#ECA270", "#F3C694", "#B85228", "#923F1E"];

export default function Analytics() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [activeSection, setActiveSection] = useState("all"); // "all" | "allocation" | "attendance"
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [blockFilter, setBlockFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [attendanceTimeframe, setAttendanceTimeframe] = useState("Daily");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      studentService.list().catch(() => ({ data: [] })),
      roomService.list().catch(() => ({ data: [] })),
      allocationService.list().catch(() => ({ data: [] })),
      attendanceService.getMonthSummary(selectedMonth).catch(() => ({ data: null })),
    ])
      .then(([studentRes, roomRes, allocRes, attendRes]) => {
        if (!cancelled) {
          setStudents(studentRes.data || []);
          setRooms(roomRes.data || []);
          setAllocations(allocRes.data || []);
          setAttendanceSummary(attendRes.data || null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load analytics data"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  const getNormalizedCourse = (c) => {
    const str = String(c || "").trim().toLowerCase();
    if (str.includes("diploma") || str.includes("polytechnic")) return "Diploma";
    return "B.Tech";
  };

  const yearOptions =
    courseFilter === "B.Tech"
      ? ["1", "2", "3", "4"]
      : courseFilter === "Diploma"
      ? ["1", "2", "3"]
      : ["1", "2", "3", "4"];

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const normCourse = getNormalizedCourse(s.Course);
      const matchesCourse = courseFilter === "All" || normCourse === courseFilter;
      const matchesYear = yearFilter === "All" || String(s.Year || "") === yearFilter;
      const matchesBlock = blockFilter === "All" || String(s.Block || "") === blockFilter;

      if (!query.trim()) {
        return matchesCourse && matchesYear && matchesBlock;
      }

      const q = query.toLowerCase();
      const matchName = String(s.Name || "").toLowerCase().includes(q);
      const matchRoll = String(s.Rollno || "").toLowerCase().includes(q);
      const matchCourseName = String(s.Course || "").toLowerCase().includes(q);
      const matchDept = String(s.Department || "").toLowerCase().includes(q);
      const matchBlock = String(s.Block || "").toLowerCase().includes(q);
      const matchRoom = String(s.Roomno || "").toLowerCase().includes(q);

      return matchesCourse && matchesYear && matchesBlock && (matchName || matchRoll || matchCourseName || matchDept || matchBlock || matchRoom);
    });
  }, [students, courseFilter, yearFilter, blockFilter, query]);

  // Key Stats Calculations
  const totalCapacity = useMemo(() => rooms.reduce((sum, r) => sum + Number(r.Capacity || 0), 0), [rooms]);
  const occupiedBeds = useMemo(() => rooms.reduce((sum, r) => sum + Number(r.OccupiedCount || 0), 0), [rooms]);
  const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
  const occupancyPercentage = totalCapacity ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
  const activeAllocations = useMemo(() => allocations.filter((a) => a.status === "Active").length, [allocations]);
  const allocatedStudentsCount = useMemo(() => students.filter((s) => s.Roomno && s.Roomno !== "—").length, [students]);
  const unallocatedStudentsCount = Math.max(0, students.length - allocatedStudentsCount);
  const fullyOccupiedRoomsCount = useMemo(() => rooms.filter(r => Number(r.OccupiedCount || 0) >= Number(r.Capacity || 0) && Number(r.Capacity || 0) > 0).length, [rooms]);
  const completelyVacantRoomsCount = useMemo(() => rooms.filter(r => Number(r.OccupiedCount || 0) === 0).length, [rooms]);

  // --- RECHARTS DATA PREPARATION: ALLOCATION & CAPACITY ---

  // 1. Block Capacity vs Occupancy Bar Chart
  const blockData = useMemo(() => {
    const blocks = ["D", "E", "KW", "Executive"];
    return blocks.map((block) => {
      const blockRooms = rooms.filter((r) => r.Block === block);
      const cap = blockRooms.reduce((sum, r) => sum + Number(r.Capacity || 0), 0);
      const occ = blockRooms.reduce((sum, r) => sum + Number(r.OccupiedCount || 0), 0);
      const avail = Math.max(0, cap - occ);
      const blockAllocations = allocations.filter((a) => a.status === "Active" && a.room?.Block === block).length;
      return {
        name: block === "Executive" ? "Executive" : `Block ${block}`,
        Capacity: cap,
        Occupied: occ,
        Available: avail,
        Allocations: blockAllocations,
      };
    });
  }, [rooms, allocations]);

  // 2. Bed Occupancy Donut Chart
  const occupancyDonutData = useMemo(() => {
    return [
      { name: "Occupied Beds", value: occupiedBeds, color: PALETTE.primary },
      { name: "Available Beds", value: availableBeds, color: PALETTE.success },
    ];
  }, [occupiedBeds, availableBeds]);

  // 3. Student Allocation Status Donut
  const studentAllocationDonut = useMemo(() => {
    return [
      { name: "Allocated Students", value: allocatedStudentsCount, color: PALETTE.primary },
      { name: "Unassigned Students", value: unallocatedStudentsCount, color: PALETTE.accent },
    ];
  }, [allocatedStudentsCount, unallocatedStudentsCount]);

  // 4. Course & Year Breakdown Bar Chart
  const courseYearData = useMemo(() => {
    const years = ["1", "2", "3", "4"];
    return years.map((yr) => {
      const btechCount = filteredStudents.filter((s) => getNormalizedCourse(s.Course) === "B.Tech" && String(s.Year) === yr).length;
      const diplomaCount = filteredStudents.filter((s) => getNormalizedCourse(s.Course) === "Diploma" && String(s.Year) === yr).length;
      return {
        year: `Year ${yr}`,
        "B.Tech": btechCount,
        Diploma: diplomaCount,
        Total: btechCount + diplomaCount,
      };
    });
  }, [filteredStudents]);

  // 5. Room Occupancy State Distribution
  const roomStatusData = useMemo(() => {
    let full = 0;
    let partial = 0;
    let vacant = 0;

    rooms.forEach((r) => {
      const cap = Number(r.Capacity || 0);
      const occ = Number(r.OccupiedCount || 0);
      if (occ >= cap && cap > 0) full++;
      else if (occ > 0) partial++;
      else vacant++;
    });

    return [
      { name: "Fully Occupied", value: full, color: PALETTE.danger },
      { name: "Partially Occupied", value: partial, color: PALETTE.accent },
      { name: "Completely Vacant", value: vacant, color: PALETTE.success },
    ];
  }, [rooms]);

  // --- RECHARTS DATA PREPARATION: ATTENDANCE ---

  // 6. Attendance Daily/Weekly/Monthly Trend
  const attendanceChartData = useMemo(() => {
    if (!attendanceSummary?.daysList || attendanceSummary.daysList.length === 0) {
      return [];
    }
    const days = attendanceSummary.daysList;

    if (attendanceTimeframe === "Daily") {
      return days.map((d) => ({
        date: d.date.slice(8), // Just "DD"
        fullDate: d.date,
        Present: d.present || 0,
        Absent: d.absent || 0,
        Leave: d.leave || 0,
      }));
    }

    if (attendanceTimeframe === "Weekly") {
      const weeks = [
        { date: "Week 1", Present: 0, Absent: 0, Leave: 0 },
        { date: "Week 2", Present: 0, Absent: 0, Leave: 0 },
        { date: "Week 3", Present: 0, Absent: 0, Leave: 0 },
        { date: "Week 4", Present: 0, Absent: 0, Leave: 0 },
      ];
      days.forEach(d => {
        const dayNum = parseInt(d.date.slice(8), 10);
        let wIdx = 0;
        if (dayNum > 21) wIdx = 3;
        else if (dayNum > 14) wIdx = 2;
        else if (dayNum > 7) wIdx = 1;
        weeks[wIdx].Present += d.present || 0;
        weeks[wIdx].Absent += d.absent || 0;
        weeks[wIdx].Leave += d.leave || 0;
      });
      return weeks;
    }

    if (attendanceTimeframe === "Monthly") {
      const total = { date: selectedMonth, Present: 0, Absent: 0, Leave: 0 };
      days.forEach(d => {
        total.Present += d.present || 0;
        total.Absent += d.absent || 0;
        total.Leave += d.leave || 0;
      });
      return [total];
    }
    return [];
  }, [attendanceSummary, attendanceTimeframe, selectedMonth]);

  // 7. Aggregate Monthly Attendance Breakdown
  const aggregateAttendanceBreakdown = useMemo(() => {
    if (!attendanceSummary?.daysList || attendanceSummary.daysList.length === 0) {
      return [
        { name: "Present", value: 0, color: PALETTE.success },
        { name: "Absent", value: 0, color: PALETTE.danger },
        { name: "On Leave", value: 0, color: PALETTE.accent },
      ];
    }
    const totalPresent = attendanceSummary.daysList.reduce((acc, d) => acc + (d.present || 0), 0);
    const totalAbsent = attendanceSummary.daysList.reduce((acc, d) => acc + (d.absent || 0), 0);
    const totalLeave = attendanceSummary.daysList.reduce((acc, d) => acc + (d.leave || 0), 0);

    return [
      { name: "Present", value: totalPresent, color: PALETTE.success },
      { name: "Absent", value: totalAbsent, color: PALETTE.danger },
      { name: "On Leave", value: totalLeave, color: PALETTE.accent },
    ];
  }, [attendanceSummary]);

  const totalMonthlyLogs = aggregateAttendanceBreakdown.reduce((s, i) => s + i.value, 0);
  const overallAttendanceRate = totalMonthlyLogs > 0
    ? Math.round((aggregateAttendanceBreakdown[0].value / totalMonthlyLogs) * 100)
    : 0;

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="analytics-dashboard">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2F2925] via-[#43372F] to-[#2F2925] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#52453D]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F9EFDE]">Hostel & Student Analytics</h2>
          <p className="text-xs sm:text-sm text-[#F5E8D4]/90 font-medium mt-1.5">
            Gain actionable insights into hostel operations, monitor bed capacities, and track student attendance trends.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-white px-3 py-2 rounded-2xl border border-[#E8D8C4] shadow-sm">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#2F2925] focus:outline-none cursor-pointer"
              style={{ colorScheme: 'light' }}
            />
          </div>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-xs rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION SELECTOR & FILTER TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8D8C4] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8D8C4]/60 pb-4">
          {/* Navigation Pills */}
          <div className="flex items-center gap-2 p-1 bg-[#FDF0DC] rounded-xl border border-[#E8D8C4]">
            <button
              onClick={() => setActiveSection("all")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSection === "all"
                  ? "bg-[#EB8055] text-white shadow-xs"
                  : "text-[#8B7355] hover:text-[#2F2925]"
              }`}
            >
              All Analytics
            </button>
            <button
              onClick={() => setActiveSection("allocation")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSection === "allocation"
                  ? "bg-[#EB8055] text-white shadow-xs"
                  : "text-[#8B7355] hover:text-[#2F2925]"
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              Allocation & Capacity
            </button>
            <button
              onClick={() => setActiveSection("attendance")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSection === "attendance"
                  ? "bg-[#EB8055] text-white shadow-xs"
                  : "text-[#8B7355] hover:text-[#2F2925]"
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              Attendance Trends
            </button>
          </div>

          <div className="text-xs font-bold text-[#8B7355]">
            Showing <span className="text-[#EB8055] font-extrabold">{filteredStudents.length}</span> students in scope
          </div>
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7355]" />
            <input
              type="text"
              placeholder="Search student, roll no, room..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] placeholder-[#8B7355]/60 focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-xs"
            />
          </div>

          <div>
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setYearFilter("All");
              }}
              className="w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-xs cursor-pointer"
            >
              <option value="All">All Courses</option>
              <option value="B.Tech">B.Tech</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>

          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-xs cursor-pointer"
            >
              <option value="All">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}{year === "1" ? "st" : year === "2" ? "nd" : year === "3" ? "rd" : "th"} Year
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 shadow-xs cursor-pointer"
            >
              <option value="All">All Blocks</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
              <option value="KW">Block KW</option>
              <option value="Executive">Executive Block</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-center bg-gradient-to-br from-orange-50 to-orange-100 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
          <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Occupancy Rate</p>
          <h3 className="text-2xl font-black text-orange-950 mt-1">{occupancyPercentage}%</h3>
          <p className="text-[11px] font-semibold text-orange-800 mt-0.5">
            {occupiedBeds} / {totalCapacity} Beds Occupied
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center bg-gradient-to-br from-blue-50 to-blue-100 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Room Utilization</p>
          <h3 className="text-2xl font-black text-blue-950 mt-1">{fullyOccupiedRoomsCount} <span className="text-base text-blue-800 font-semibold">/ {rooms.length}</span></h3>
          <p className="text-[11px] font-semibold text-blue-800 mt-0.5">
            Fully Booked · {completelyVacantRoomsCount} Vacant
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Attendance Rate</p>
          <h3 className="text-2xl font-black text-emerald-950 mt-1">
            {totalMonthlyLogs > 0 ? `${overallAttendanceRate}%` : "No Logs"}
          </h3>
          <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
            {totalMonthlyLogs} monthly log entries
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-center bg-gradient-to-br from-purple-50 to-purple-100 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Student Census</p>
          <h3 className="text-2xl font-black text-purple-950 mt-1">{filteredStudents.length}</h3>
          <p className="text-[11px] font-semibold text-purple-800 mt-0.5">
            {allocatedStudentsCount} Allocated · {unallocatedStudentsCount} Unassigned
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ALLOCATION & CAPACITY RECHARTS                                */}
      {/* ========================================================================= */}
      {(activeSection === "all" || activeSection === "allocation") && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 pt-2">
            <DoorOpen className="w-5 h-5 text-[#EB8055]" />
            <h3 className="text-lg font-black text-[#2F2925]">Allocation & Capacity Visualizations</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Block-wise Capacity vs Occupancy Bar Chart (8 cols) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8D8C4]/60 pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-[#2F2925]">Block-wise Capacity vs Occupancy</h4>
                  <p className="text-xs text-[#8B7355]">Comparison of total beds, active occupancies, and available slots across blocks.</p>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={blockData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5E8D4" />
                    <XAxis dataKey="name" tick={{ fill: "#8B7355", fontSize: 12, fontWeight: 600 }} />
                    <YAxis tick={{ fill: "#8B7355", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #E8D8C4", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      formatter={(val, name) => [`${val} Beds`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="Capacity" fill="#D9C4A8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Occupied" fill="#EB8055" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Available" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Bed Occupancy Donut Chart (4 cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="border-b border-[#E8D8C4]/60 pb-3">
                <h4 className="text-base font-extrabold text-[#2F2925]">Vacated vs Occupied Beds</h4>
                <p className="text-xs text-[#8B7355]">Available vs allocated beds</p>
              </div>

              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyDonutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {occupancyDonutData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #E8D8C4" }}
                      formatter={(val, name) => [`${val} Beds (${totalCapacity ? Math.round((val/totalCapacity)*100) : 0}%)`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8D8C4]/60 text-center">
                <div className="bg-[#FDF0DC] p-2 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-[#B85228]">Occupied</p>
                  <p className="text-sm font-black text-[#2F2925]">{occupiedBeds}</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-emerald-700">Available</p>
                  <p className="text-sm font-black text-emerald-900">{availableBeds}</p>
                </div>
              </div>
            </div>
          </div>


        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ATTENDANCE RECHARTS                                            */}
      {/* ========================================================================= */}
      {(activeSection === "all" || activeSection === "attendance") && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-[#EB8055]" />
              <h3 className="text-lg font-black text-[#2F2925]">Attendance Analytics ({selectedMonth})</h3>
            </div>
            {attendanceChartData.length === 0 && (
              <span className="text-xs font-bold text-[#8B7355] italic">No attendance records logged for {selectedMonth}</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Chart 3: Attendance Trend Area Chart (Full Width) */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8D8C4]/60 pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-[#2F2925]">Attendance Flow</h4>
                  <p className="text-xs text-[#8B7355]">Dynamic visualization tracking daily, weekly, and monthly student attendance patterns.</p>
                </div>
                <div className="flex items-center gap-1 bg-[#FDF0DC] p-1 rounded-xl border border-[#E8D8C4]">
                  {["Daily", "Weekly", "Monthly"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setAttendanceTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        attendanceTimeframe === tf
                          ? "bg-[#EB8055] text-white shadow-xs"
                          : "text-[#8B7355] hover:text-[#2F2925]"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {attendanceChartData.length > 0 ? (
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="leaveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EB8055" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#EB8055" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F5E8D4" />
                      <XAxis dataKey="date" tick={{ fill: "#8B7355", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#8B7355", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #E8D8C4" }}
                        labelFormatter={(lbl) => {
                          if (attendanceTimeframe === "Daily") return `Date: ${selectedMonth}-${String(lbl).padStart(2, "0")}`;
                          if (attendanceTimeframe === "Weekly") return `${lbl}, ${selectedMonth}`;
                          return `Month: ${lbl}`;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Area type="monotone" dataKey="Present" stroke="#10B981" fillOpacity={1} fill="url(#presentGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Absent" stroke="#EF4444" fillOpacity={1} fill="url(#absentGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Leave" stroke="#EB8055" fillOpacity={1} fill="url(#leaveGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 w-full flex flex-col items-center justify-center text-[#8B7355] bg-[#FDF0DC]/30 rounded-xl border border-dashed border-[#E8D8C4]">
                  <CalendarCheck2 className="w-10 h-10 text-[#D9C4A8] mb-2" />
                  <p className="text-xs font-bold">No attendance records found for {selectedMonth}.</p>
                  <p className="text-[11px] text-[#8B7355] mt-1">Mark attendance in the Attendance module to populate this trend.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
