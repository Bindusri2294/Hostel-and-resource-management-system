import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  allocationService,
  feedbackService,
  roomService,
  attendanceService,
  getErrorMessage,
} from "../../services/api";
import {
  ClipboardList,
  ChevronRight,
  ClipboardCheck,
  DoorOpen,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

export default function StudentDashboard({ data: propData, user: propUser }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const user = propUser || authUser || {};

  const [data, setData] = useState(
    propData || {
      myAllocation: null,
      myAttendance: null,
      feedbacks: [],
      rooms: [],
    }
  );
  const [loading, setLoading] = useState(!propData);
  const [error, setError] = useState("");

  const [profileImage, setProfileImage] = useState(() => {
    return (
      localStorage.getItem(
        `profile_image_${user?._id || user?.id || user?.email || "current"}`
      ) || null
    );
  });

  useEffect(() => {
    const handleStorage = () => {
      setProfileImage(
        localStorage.getItem(
          `profile_image_${user?._id || user?.id || user?.email || "current"}`
        ) || null
      );
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user]);

  useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      allocationService.mine().catch((err) => {
        if (err.response?.status === 404) return { data: null };
        throw err;
      }),
      feedbackService.list().catch(() => ({ data: [] })),
      roomService.list().catch(() => ({ data: [] })),
      attendanceService.mine().catch(() => ({ data: null })),
    ])
      .then(([allocRes, feedbackRes, roomsRes, attendanceRes]) => {
        if (!cancelled) {
          setData({
            myAllocation: allocRes.data || null,
            feedbacks: feedbackRes.data || [],
            rooms: roomsRes.data || [],
            myAttendance: attendanceRes.data || null,
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
        <p className="text-sm font-semibold text-purple-900">Loading student residence...</p>
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

  const { myAllocation, feedbacks, myAttendance } = data;
  const student = user.student || {};
  const room = myAllocation?.room || {};
  const roommates = myAllocation?.roommates || [];
  const attendanceSummary = myAttendance?.summary || {
    percentage: 100,
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
  };

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

      {/* Attendance Quick Stats Card */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Hostel Attendance Overview</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  attendanceSummary.percentage >= 75
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {attendanceSummary.percentage}% Rate
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified: <span className="font-bold text-slate-700">{attendanceSummary.presentDays} Days Present</span> ·{" "}
              <span className="font-bold text-rose-600">{attendanceSummary.absentDays} Absent</span> ·{" "}
              <span className="font-bold text-amber-600">{attendanceSummary.leaveDays} On Leave</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/my-attendance")}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>View My Attendance Calendar</span>
          <ChevronRight className="w-4 h-4" />
        </button>
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
                <span className="text-slate-900 font-extrabold text-sm">{room.Capacity || 2} Beds</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Occupancy</span>
                <span className="text-purple-700 font-extrabold text-sm">
                  {room.OccupiedCount || 1} / {room.Capacity || 2} Beds
                </span>
              </div>
            </div>

            {/* Roommates Section */}
            <div className="pt-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Roommates</h4>
              {roommates.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roommates.map((rm) => (
                    <div
                      key={rm.id || rm._id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                          {(rm.studentName || rm.name || "R").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{rm.studentName || rm.name}</p>
                          <p className="text-[10px] text-slate-500">Roll: {rm.rollNo || rm.Rollno || "Active"}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {rm.department || rm.Department || "Roommate"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">No other roommates assigned yet.</p>
              )}
            </div>
          </div>

          {/* Quick Action Side Panel */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Residential Services</h3>
              <div className="space-y-2 text-xs font-bold">
                <button
                  onClick={() => navigate("/room-info")}
                  className="w-full text-left p-2.5 rounded-xl bg-purple-50/70 text-purple-900 hover:bg-purple-100 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-purple-600" />
                    <span>Hostel Rooms Directory</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
                <button
                  onClick={() => navigate("/feedback")}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span>Report Issue / Feedback</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-100/70 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">My Recent Feedback</h3>
                <button
                  onClick={() => navigate("/feedback")}
                  className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                >
                  All →
                </button>
              </div>
              <div className="space-y-2">
                {feedbacks.length ? (
                  feedbacks.slice(0, 2).map((item) => (
                    <div
                      key={item._id || item.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <p className="font-bold text-slate-800 line-clamp-1">{item.message}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-semibold">
                        <span>Rating: {item.rating}/5</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full font-bold ${
                            item.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-2">No feedback submitted.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-purple-100/70 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No Active Room Allocation Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Your profile is registered, but a room allocation has not been finalized yet.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/room-info")}
              className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all cursor-pointer"
            >
              Browse Available Rooms
            </button>
            <button
              onClick={() => navigate("/feedback")}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
            >
              Contact Warden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
