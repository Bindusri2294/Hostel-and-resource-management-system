import { useEffect, useState } from "react";
import { roomService, studentService, allocationService, getErrorMessage } from "../services/api";
import {
  BarChart,
  PieChart as PieIcon,
  TrendingUp,
  Users,
  DoorOpen,
  ClipboardList,
  Filter,
  Download,
  Calendar,
  Layers,
  Award,
  AlertCircle,
} from "lucide-react";

export default function Analytics() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("KIET");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([studentService.list(), roomService.list(), allocationService.list()])
      .then(([studentRes, roomRes, allocRes]) => {
        if (!cancelled) {
          setStudents(studentRes.data || []);
          setRooms(roomRes.data || []);
          setAllocations(allocRes.data || []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const yearOptions =
    courseFilter === "B.Tech"
      ? ["1", "2", "3", "4"]
      : courseFilter === "Diploma"
        ? ["1", "2", "3"]
        : [];

  const filteredStudents = students.filter((s) => {
    const matchesCourse = courseFilter === "All" || String(s.Course || "") === courseFilter;
    const matchesYear = yearFilter === "All" || String(s.Year || "") === yearFilter;
    return matchesCourse && matchesYear;
  });

  // Calculate Key Stats
  const totalCapacity = rooms.reduce((sum, r) => sum + Number(r.Capacity || 0), 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + Number(r.OccupiedCount || 0), 0);
  const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
  const occupancyPercentage = totalCapacity ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
  const activeAllocations = allocations.filter((a) => a.status === "Active").length;

  // Department distribution
  const deptMap = filteredStudents.reduce((acc, s) => {
    const dept = s.Course || "General Engineering";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const totalFilteredCount = filteredStudents.length || 1;
  const deptData = Object.entries(deptMap).map(([name, count], index) => {
    const colors = ["#673bb7", "#5e35b1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];
    return {
      name,
      count,
      percentage: Math.round((count / totalFilteredCount) * 100),
      color: colors[index % colors.length],
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Modern Analytics Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time occupancy trends, student demographics, allocation statistics, and course distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Downloading Analytics PDF Report...")}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer border border-slate-200"
          >
            <Download className="w-4 h-4 text-purple-600" /> Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Course and Year Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Filter by Course:</span>
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setYearFilter("All");
            }}
            className="bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700 rounded-xl px-3 py-2 outline-none"
          >
            <option value="All">All Courses</option>
            <option value="B.Tech">B.Tech</option>
            <option value="Diploma">Diploma</option>
          </select>

          {yearOptions.length > 0 && (
            <select
              aria-label="Select Year"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700 rounded-xl px-3 py-2 outline-none"
            >
              <option value="All">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}{year === "1" ? "st" : year === "2" ? "nd" : year === "3" ? "rd" : "th"} Year
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing data for <strong className="text-purple-700">{filteredStudents.length}</strong> residents
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Room Occupancy Rate</p>
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <DoorOpen className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{occupancyPercentage}%</h3>
          <p className="text-xs font-semibold text-emerald-600 mt-1">
            {occupiedBeds} occupied out of {totalCapacity} beds
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Student Population</p>
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{filteredStudents.length}</h3>
          <p className="text-xs font-semibold text-indigo-600 mt-1">
            Registered campus residents
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Active Allocations</p>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{activeAllocations}</h3>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Assigned room allocations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Available Inventory</p>
            <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900">{availableBeds}</h3>
          <p className="text-xs font-semibold text-cyan-600 mt-1">Beds ready for allotment</p>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Representation */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Block-wise Occupancy Breakdown</h3>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {["A", "B", "C"].map((block) => {
              const blockRooms = rooms.filter((r) => r.Block === block);
              const cap = blockRooms.reduce((sum, r) => sum + Number(r.Capacity || 0), 0) || 10;
              const occ = blockRooms.reduce((sum, r) => sum + Number(r.OccupiedCount || 0), 0) || 0;
              const pct = Math.round((occ / cap) * 100);

              return (
                <div key={block} className="space-y-1.5 text-xs font-bold">
                  <div className="flex justify-between text-slate-700">
                    <span>Block {block} Residential Rooms</span>
                    <span>
                      {occ} / {cap} Beds ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course / Department Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900">Department & Section Distribution</h3>
          </div>

          <div className="space-y-3 pt-2">
            {deptData.length ? (
              deptData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-slate-900">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">{item.count} Residents</span>
                    <span className="font-extrabold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No department data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
