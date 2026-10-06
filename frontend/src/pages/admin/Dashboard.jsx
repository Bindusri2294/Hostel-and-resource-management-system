import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  studentService,
  roomService,
  allocationService,
  feedbackService,
  authService,
  getErrorMessage,
} from "../../services/api";
import {
  Users,
  Building2,
  CheckCircle2,
  BedDouble,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

/* ─── Compact Status Badge ─── */
function StatusBadge({ status }) {
  const map = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Inactive: "bg-slate-100 text-slate-600 border-slate-200",
    Vacated: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const cls = map[status] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${cls}`}>
      {status || "—"}
    </span>
  );
}

/* ─── Compact Stat Card ─── */
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E8D8C4] p-4 flex flex-col justify-between transition-all ${
        onClick ? "cursor-pointer hover:border-[#EB8055] hover:shadow-xs" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-[#8B7355] uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#2F2925] tracking-tight leading-tight">{value}</p>
        {sub && <p className="text-[11px] font-medium text-[#8B7355] mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard({ data: propData }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(
    propData || { students: [], rooms: [], allocations: [], feedbacks: [], resetRequests: [] }
  );
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState("");

  useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      studentService.list(),
      roomService.list(),
      allocationService.list(),
      feedbackService.list(),
      authService.getResetRequests(),
    ])
      .then(([s, r, a, f, rr]) => {
        if (!cancelled) {
          setData({
            students: s.data || [],
            rooms: r.data || [],
            allocations: a.data || [],
            feedbacks: f.data || [],
            resetRequests: rr.data || [],
          });
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
  }, [propData]);

  const handleResolveResetRequest = async (id) => {
    try {
      const res = await authService.resolveResetRequest(id);
      alert(res.data.message);
      setData((prev) => ({
        ...prev,
        resetRequests: prev.resetRequests.filter((r) => r._id !== id),
      }));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
        <div className="w-8 h-8 border-3 border-[#EB8055] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#8B7355]">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const { students, rooms, allocations, feedbacks } = data;
  const totalCapacity = rooms.reduce((s, r) => s + Number(r.Capacity || 0), 0);
  const occupiedBeds = rooms.reduce((s, r) => s + Number(r.OccupiedCount || 0), 0);
  const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
  const maintenanceRooms = rooms.filter((r) => r.Status === "Maintenance");
  const maintenanceBeds = maintenanceRooms.reduce((s, r) => s + Number(r.Capacity || 0), 0);
  const occupancyPct = totalCapacity ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
  const pendingFeedbacks = feedbacks.filter((f) => !f.status || f.status === "Pending");

  return (
    <div className="space-y-6 max-w-[1360px]">

      {/* ── 1. STATISTICS (5 Compact Cards) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Total Students"
          value={students.length}
          sub="Registered residents"
          icon={Users}
          iconBg="bg-[#FDF0DC]"
          iconColor="text-[#EB8055]"
        />
        <StatCard
          label="Total Rooms"
          value={rooms.length}
          sub="Across all wings"
          icon={Building2}
          iconBg="bg-[#FDF0DC]"
          iconColor="text-[#EB8055]"
        />
        <StatCard
          label="Occupied Beds"
          value={occupiedBeds}
          sub={`${occupancyPct}% of capacity`}
          icon={CheckCircle2}
          iconBg="bg-[#FDF0DC]"
          iconColor="text-[#EB8055]"
        />
        <StatCard
          label="Available Beds"
          value={availableBeds}
          sub="Ready for allocation"
          icon={BedDouble}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Pending Feedback"
          value={pendingFeedbacks.length}
          sub="Requires attention"
          icon={MessageSquare}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => navigate("/feedback")}
        />
      </div>

      {/* ── 2. MAIN HOSTEL OVERVIEW + HOSTEL STATUS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Main Hostel Overview Card: Hostel Occupancy (Spans 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E8D8C4] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#2F2925] leading-tight">Hostel Occupancy</h3>
                <p className="text-xs text-[#8B7355] mt-0.5">Real-time bed utilization across all wings</p>
              </div>
              <button
                onClick={() => navigate("/analytics")}
                className="text-xs font-semibold text-[#EB8055] hover:text-[#D96B3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-extrabold text-[#2F2925] tracking-tight">{occupancyPct}%</span>
                <span className="text-sm font-semibold text-[#8B7355]">
                  {occupiedBeds} / {totalCapacity} Beds Occupied
                </span>
              </div>

              {/* Progress Visualization */}
              <div className="w-full bg-[#FDF0DC] rounded-full h-3 overflow-hidden my-3 border border-[#E8D8C4]">
                <div
                  className="bg-[#EB8055] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, occupancyPct)}%` }}
                />
              </div>

              {/* Status Visual Indicators */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FDF0DC]/40 border border-[#E8D8C4]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EB8055] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B7355]">Occupied</p>
                    <p className="text-xs font-bold text-[#2F2925]">{occupiedBeds} Beds</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B7355]">Available</p>
                    <p className="text-xs font-bold text-[#2F2925]">{availableBeds} Beds</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#8B7355]">Maintenance</p>
                    <p className="text-xs font-bold text-[#2F2925]">{maintenanceBeds} Beds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8D8C4] mt-3 flex items-center justify-between text-xs text-[#8B7355]">
            <span>Academic Term 2025–26</span>
            <span>Total Capacity: <strong className="text-[#2F2925] font-semibold">{totalCapacity} Beds</strong></span>
          </div>
        </div>

        {/* Compact Hostel Status Card (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8D8C4] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-[#2F2925] leading-tight">Hostel Status</h3>
              <p className="text-xs text-[#8B7355] mt-0.5">Facility and services condition</p>
            </div>

            <div className="space-y-3 divide-y divide-[#E8D8C4]/60">
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-[#8B7355]">Hostel Operations</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">Normal</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-xs font-medium text-[#8B7355]">Water Supply</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">Normal</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-xs font-medium text-[#8B7355]">Electricity</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">Normal</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-xs font-medium text-[#8B7355]">Maintenance</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold text-amber-700">
                    {maintenanceRooms.length > 0 ? `${maintenanceRooms.length} Rooms` : "3 Rooms"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8D8C4] mt-3 flex items-center justify-between text-[11px] text-[#8B7355]">
            <span>Verified by Hostel Warden</span>
            <span>Live status</span>
          </div>
        </div>

      </div>

      {/* ── 3. RECENT ACTIVITY: Recent Allocations & Recent Student Feedback ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Allocations Table */}
        <div className="bg-white rounded-xl border border-[#E8D8C4] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2F2925] leading-tight">Recent Allocations</h3>
              <p className="text-xs text-[#8B7355] mt-0.5">Latest bed assignments</p>
            </div>
            <button
              onClick={() => navigate("/allocations")}
              className="text-xs font-semibold text-[#EB8055] hover:text-[#D96B3A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8D8C4] text-[10px] font-bold uppercase text-[#8B7355] tracking-wider">
                  <th className="pb-2.5 pr-2">Student</th>
                  <th className="pb-2.5 px-2">Room</th>
                  <th className="pb-2.5 px-2">Date</th>
                  <th className="pb-2.5 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D8C4]/60 font-medium text-[#2F2925]">
                {allocations.length ? (
                  allocations.slice(0, 5).map((alloc) => (
                    <tr key={alloc._id || alloc.id}>
                      <td className="py-2.5 pr-2 font-bold text-[#2F2925] truncate max-w-[140px]">
                        {alloc.studentName || alloc.student?.Name || "—"}
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-[#8B7355]">
                        {alloc.roomNo || alloc.room?.RoomNo || "—"}
                      </td>
                      <td className="py-2.5 px-2 text-[#8B7355] text-[11px]">
                        {alloc.allocationDate || alloc.createdAt
                          ? new Date(alloc.allocationDate || alloc.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "—"}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <StatusBadge status={alloc.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-[#8B7355] italic">
                      No allocations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Student Feedback */}
        <div className="bg-white rounded-xl border border-[#E8D8C4] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2F2925] leading-tight">Recent Student Feedback</h3>
              <p className="text-xs text-[#8B7355] mt-0.5">Latest reviews and grievances</p>
            </div>
            <button
              onClick={() => navigate("/feedback")}
              className="text-xs font-semibold text-[#EB8055] hover:text-[#D96B3A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {feedbacks.length ? (
              feedbacks.slice(0, 4).map((item) => (
                <div
                  key={item._id || item.id}
                  className="p-3 rounded-lg bg-[#FDF0DC]/30 border border-[#E8D8C4] flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2F2925] truncate">{item.message}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#8B7355] truncate">
                      <span>{item.studentId?.Name || item.studentId?.name || "Resident"}</span>
                      <span>·</span>
                      <span>Room {item.roomNo || item.room || "—"}</span>
                      <span>·</span>
                      <span className="text-amber-600 font-semibold">★ {item.rating}/5</span>
                    </div>
                  </div>
                  <StatusBadge status={item.status || "Pending"} />
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8B7355] italic py-6 text-center">No feedback submitted yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* ── 4. PENDING PASSWORD RESETS ── */}
      {data.resetRequests?.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200/80 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Pending Password Resets</h3>
                <p className="text-xs text-slate-500 mt-0.5">Students who requested password reset</p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full text-xs">
              {data.resetRequests.length} pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="pb-2.5 pr-2">Student Name</th>
                  <th className="pb-2.5 px-2">Roll No</th>
                  <th className="pb-2.5 px-2">Course</th>
                  <th className="pb-2.5 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {data.resetRequests.map((req) => (
                  <tr key={req._id}>
                    <td className="py-2.5 pr-2 font-bold text-slate-900">{req.student?.Name}</td>
                    <td className="py-2.5 px-2 text-slate-600">{req.student?.Rollno}</td>
                    <td className="py-2.5 px-2 text-slate-500">{req.student?.Course}</td>
                    <td className="py-2.5 pl-2 text-right">
                      <button
                        onClick={() => handleResolveResetRequest(req._id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-2.5 rounded text-[11px] transition-colors cursor-pointer"
                      >
                        Reset to Roll No
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
