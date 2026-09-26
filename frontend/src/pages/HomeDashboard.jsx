import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  studentService,
  roomService,
  allocationService,
  feedbackService,
  getErrorMessage,
} from "../services/api";
import {
  Users,
  Building2,
  DoorOpen,
  ClipboardList,
  MessageSquare,
  TrendingUp,
  UserPlus,
  ClipboardPlus,
  CheckCircle2,
  AlertCircle,
  Star,
  Sparkles,
  Layers,
  Armchair,
  Utensils,
  Wrench,
  Wifi,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";

export default function HomeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    students: [],
    rooms: [],
    allocations: [],
    feedbacks: [],
    myAllocation: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    if (user?.role === "Admin") {
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
              myAllocation: null,
            });
          }
        })
        .catch((err) => {
          if (!cancelled) setError(getErrorMessage(err));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      Promise.all([
        allocationService.mine().catch((err) => {
          if (err.response?.status === 404 || err.response?.status === 400) return { data: null };
          throw err;
        }),
        feedbackService.list().catch(() => ({ data: [] })),
        roomService.list().catch(() => ({ data: [] })),
      ])
        .then(([allocRes, feedbackRes, roomsRes]) => {
          if (!cancelled) {
            setData({
              students: [],
              rooms: roomsRes.data || [],
              allocations: [],
              feedbacks: feedbackRes.data || [],
              myAllocation: allocRes.data || null,
            });
          }
        })
        .catch((err) => {
          if (!cancelled) setError(getErrorMessage(err));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-purple-900">Loading campus dashboard...</p>
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

  return user?.role === "Admin" ? (
    <AdminDashboardView data={data} />
  ) : (
    <StudentDashboardView data={data} user={user} />
  );
}

// ADMIN DASHBOARD VIEW
function AdminDashboardView({ data }) {
  const navigate = useNavigate();
  const { students, rooms, allocations, feedbacks } = data;

  const totalCapacity = rooms.reduce((sum, r) => sum + Number(r.Capacity || 0), 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + Number(r.OccupiedCount || 0), 0);
  const availableBeds = Math.max(0, totalCapacity - occupiedBeds);
  const activeAllocations = allocations.filter((a) => a.status === "Active");
  const pendingAllocations = allocations.filter((a) => a.status === "Pending");

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

        <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Alloc.</p>
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">{pendingAllocations.length}</h3>
          <p className="text-[11px] font-semibold text-amber-600 mt-1">Awaiting review</p>
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

// STUDENT DASHBOARD VIEW
function StudentDashboardView({ data, user }) {
  const navigate = useNavigate();
  const { myAllocation, feedbacks } = data;
  const student = user.student || {};
  const room = myAllocation?.room || {};
  const roommates = myAllocation?.roommates || [];

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem(`profile_image_${user?._id || user?.id || user?.email || "current"}`) || null;
  });

  useEffect(() => {
    const handleStorage = () => {
      setProfileImage(localStorage.getItem(`profile_image_${user?._id || user?.id || user?.email || "current"}`) || null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Student Profile Hero Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white rounded-3xl p-6 shadow-xl border border-purple-500/30 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/profile" title="View Profile" className="focus:outline-none">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-white font-extrabold text-2xl shadow-inner overflow-hidden ring-2 ring-white/20 hover:ring-white/50 transition-all">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                (student.Name || user.name)?.charAt(0)?.toUpperCase()
              )}
            </div>
          </Link>
          <div>
            <h2 className="text-2xl font-black">{student.Name || user.name}</h2>
            <p className="text-xs text-purple-200 font-medium">
              {student.Course || "B.Tech Engineering"} · {student.Campus || "Main Campus"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15">
          <div>
            <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Roll Number</p>
            <p className="text-sm font-extrabold text-white">{student.Rollno || "Unassigned"}</p>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div>
            <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">Academic Year</p>
            <p className="text-sm font-extrabold text-white">{student.Year ? `${student.Year} Year` : "3rd Year"}</p>
          </div>
        </div>
      </div>

      {/* Allocation & Hierarchy Info */}
      {myAllocation ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-slate-400">Hostel</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span>Block {room.Block || myAllocation.block || "A"}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span>Floor {room.Floor || "2"}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                Room {room.RoomNo || myAllocation.roomNo}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Room {room.RoomNo || myAllocation.roomNo} Details
                </h3>
                <p className="text-xs text-slate-500">Occupied by active residents</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-200">
                {myAllocation.status} Allocation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Block</span>
                <span className="text-slate-900 font-extrabold text-sm">{room.Block || "A"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Floor</span>
                <span className="text-slate-900 font-extrabold text-sm">{room.Floor || "2"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Capacity</span>
                <span className="text-slate-900 font-extrabold text-sm">{room.Capacity || 4} Beds</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Occupied</span>
                <span className="text-slate-900 font-extrabold text-sm">{room.OccupiedCount || 1} Beds</span>
              </div>
            </div>
          </div>

          {/* Roommates Card */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Roommates ({roommates.length})</h3>
            {roommates.length ? (
              <div className="space-y-3">
                {roommates.map((mate) => (
                  <div key={mate.id || mate._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      {mate.studentName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{mate.studentName}</p>
                      <p className="text-[10px] text-slate-500">Active Resident</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">You have this room to yourself.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-2xl border border-purple-100/70 shadow-xs text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Active Room Allocation</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your hostel team has not assigned a room allocation to your account yet. Contact hostel administration for support.
          </p>
        </div>
      )}

      {/* Announcements & Available Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">Hostel Announcements</h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Utensils className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Mess Timings Update</p>
                <p className="text-slate-600 text-[11px] mt-0.5">Breakfast: 7:30 AM - 9:00 AM · Lunch: 12:30 PM - 2:00 PM · Dinner: 7:30 PM - 9:00 PM</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Wifi className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">High-Speed Wi-Fi Available</p>
                <p className="text-slate-600 text-[11px] mt-0.5">Campus Wi-Fi credentials refreshed for the semester.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">Quick Student Actions</h3>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate("/feedback")}
              className="w-full text-left p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" /> Submit Feedback / Issue
              </span>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>
            <button
              onClick={() => navigate("/hostel-info")}
              className="w-full text-left p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-xs flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> View Hostel Facilities & Rules
              </span>
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
