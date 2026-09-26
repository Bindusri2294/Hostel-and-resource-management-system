import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  studentService,
  roomService,
  allocationService,
  feedbackService,
  getErrorMessage,
} from "../../services/api";
import {
  Users,
  DoorOpen,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Armchair,
} from "lucide-react";

export default function AdminDashboard({ data: propData }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(
    propData || {
      students: [],
      rooms: [],
      allocations: [],
      feedbacks: [],
    }
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
    ])
      .then(([studentsRes, roomsRes, allocationsRes, feedbackRes]) => {
        if (!cancelled) {
          setData({
            students: studentsRes.data || [],
            rooms: roomsRes.data || [],
            allocations: allocationsRes.data || [],
            feedbacks: feedbackRes.data || [],
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-purple-900">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const { students, rooms, allocations, feedbacks } = data;

  const totalCapacity = rooms.reduce((sum, r) => sum + Number(r.Capacity || 0), 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + Number(r.OccupiedCount || 0), 0);
  const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
  const activeAllocations = allocations.filter((a) => a.status === "Active");
  const unassignedStudents = students.filter((s) => {
    const r = String(s.Roomno || "").trim().toLowerCase();
    return (
      !r ||
      r === "unassigned" ||
      r === "none" ||
      r === "-" ||
      r === "null" ||
      r === "undefined"
    );
  });

  // Course distribution (only B.Tech and Diploma)
  const courseCount = {
    "B.Tech": 0,
    "Diploma": 0,
  };

  students.forEach((s) => {
    const course = (s.Course || s.Department || "").toLowerCase();
    if (course.includes("diploma") || course.includes("polytechnic")) {
      courseCount["Diploma"] += 1;
    } else {
      courseCount["B.Tech"] += 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* 6 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</p>
            <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{students.length}</h3>
          <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Registered
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rooms</p>
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{rooms.length}</h3>
          <p className="text-[11px] font-semibold text-indigo-600 mt-1">Inventory</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Occupied Beds</p>
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{occupiedBeds}</h3>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">
            {totalCapacity ? Math.round((occupiedBeds / totalCapacity) * 100) : 0}% Filled
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Beds</p>
            <div className="w-8 h-8 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
              <Armchair className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{availableBeds}</h3>
          <p className="text-[11px] font-semibold text-cyan-600 mt-1">Ready for allocation</p>
        </div>

        <div
          onClick={() => navigate("/allocations")}
          className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all"
          title="Click to view Allocations"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Allocation</p>
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{unassignedStudents.length}</h3>
          <p className="text-[11px] font-semibold text-amber-600 mt-1">Unassigned students</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Feedback</p>
            <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{feedbacks.length}</h3>
          <p className="text-[11px] font-semibold text-pink-600 mt-1">Notes received</p>
        </div>
      </div>

      {/* Middle Section: Occupancy Chart & Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Occupancy Visual Card */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Room Occupancy Statistics</h3>
              </div>
              <button onClick={() => navigate("/analytics")} className="text-xs font-bold text-purple-600 hover:underline cursor-pointer">
                Analytics →
              </button>
            </div>

            <div className="my-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Total Bed Capacity ({totalCapacity} Beds)</span>
                <span>{totalCapacity ? Math.round((occupiedBeds / totalCapacity) * 100) : 0}% Occupied</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCapacity ? Math.min(100, (occupiedBeds / totalCapacity) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                <p className="text-slate-500 text-[11px]">Occupied Beds</p>
                <p className="text-lg font-extrabold text-purple-900">{occupiedBeds}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-slate-500 text-[11px]">Available Beds</p>
                <p className="text-lg font-extrabold text-emerald-900">{availableBeds}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <p className="text-xs font-bold text-slate-800 mb-2">Student Course Distribution</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
                B.Tech: <strong className="text-purple-700">{courseCount["B.Tech"]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
                Diploma: <strong className="text-purple-700">{courseCount["Diploma"]}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Recent Feedback Card */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Recent Student Feedback</h3>
              </div>
              <button onClick={() => navigate("/feedback")} className="text-xs font-bold text-purple-600 hover:underline cursor-pointer">
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {feedbacks.length ? (
                feedbacks.slice(0, 3).map((item) => (
                  <div key={item._id || item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.message}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        By {item.studentId?.Name || item.studentId?.name || "Resident"} · Rating: {item.rating}/5
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.status || "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">No feedback submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Allocations Table */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900">Recent Allocations</h3>
          <button onClick={() => navigate("/allocations")} className="text-xs font-bold text-purple-600 hover:underline cursor-pointer">
            Manage Allocations →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {allocations.length ? (
                allocations.slice(0, 5).map((alloc) => (
                  <tr key={alloc.id || alloc._id}>
                    <td className="py-3 px-3 font-bold text-slate-900">{alloc.studentName || alloc.student?.Name || "—"}</td>
                    <td className="py-3 px-3 text-slate-500">{alloc.student?.Rollno || "—"}</td>
                    <td className="py-3 px-3 font-semibold">{alloc.roomNo || alloc.room?.RoomNo || "—"}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        alloc.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {alloc.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400 italic">No allocations recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
