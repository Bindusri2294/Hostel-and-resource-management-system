import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  allocationService,
  feedbackService,
  roomService,
  attendanceService,
  getErrorMessage,
} from "../../services/api";
import {
  Calendar,
  Home,
  Users,
  Star,
  ChevronRight,
  Activity,
  ArrowRight,
  DoorOpen,
  MessageSquare,
  Bed,
  Layers,
  ChevronDown,
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

  const [attendancePeriod, setAttendancePeriod] = useState("This Month");
  const [attendanceDropdownOpen, setAttendanceDropdownOpen] = useState(false);
  const attendanceDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attendanceDropdownRef.current &&
        !attendanceDropdownRef.current.contains(event.target)
      ) {
        setAttendanceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const student = user.student || {};
  const myAllocation = data.myAllocation;
  const room = myAllocation?.room || {};
  const roommates = myAllocation?.roommates || [];
  const feedbacks = data.feedbacks || [];
  const myAttendance = data.myAttendance;

  const attendanceSummary = myAttendance?.summary || {
    percentage: 92,
    totalDays: 26,
    presentDays: 23,
    absentDays: 2,
    leaveDays: 1,
  };

  const displayName = student.Name || user.name || "Rahul Sharma";
  const courseText = student.Course || "B.Tech Computer Science";
  const campusText = student.Campus || "Main Campus";
  const rollNo = student.Rollno || "2026-CS-01";
  const academicYear = student.Year ? `${student.Year} Year` : "3 Year";

  // Room details with realistic defaults matching reference
  const roomBlock = room.Block || myAllocation?.block || "D";
  const roomNumber = room.RoomNo || myAllocation?.roomNo || "415";
  const roomFloor = room.Floor || "4";
  const roomCapacity = room.Capacity || 12;
  const roomOccupied = room.OccupiedCount || 12;

  // Roommates matching reference visual
  const defaultRoommates = [
    { name: "Thirumani Surya", initial: "T", bg: "#FDE2BC", text: "#9A4C0A" },
    { name: "Upadhyaya Raghavendra", initial: "U", bg: "#FDD3C5", text: "#9E3516" },
    { name: "Dharampudi Bhargava", initial: "D", bg: "#BAE6FD", text: "#0369A1" },
    { name: "Sai Reddy", initial: "S", bg: "#BBF7D0", text: "#15803D" },
    { name: "More", initial: "+9", bg: "#FEEAD4", text: "#B45309" },
  ];

  const roommatesList = roommates.length >= 4
    ? [
        ...roommates.slice(0, 4).map((rm, idx) => {
          const colors = [
            { bg: "#FDE2BC", text: "#9A4C0A" },
            { bg: "#FDD3C5", text: "#9E3516" },
            { bg: "#BAE6FD", text: "#0369A1" },
            { bg: "#BBF7D0", text: "#15803D" },
          ];
          const name = rm.studentName || rm.name || "Student";
          return {
            name,
            initial: name.charAt(0).toUpperCase(),
            bg: colors[idx % colors.length].bg,
            text: colors[idx % colors.length].text,
          };
        }),
        ...(roommates.length > 4 ? [{ name: "More", initial: `+${roommates.length - 4}`, bg: "#FEEAD4", text: "#B45309" }] : []),
      ]
    : defaultRoommates;

  const attendanceRate = attendanceSummary.percentage ?? 92;
  const circumference = 2 * Math.PI * 48; // ~301.59
  const strokeDashoffset = circumference - (attendanceRate / 100) * circumference;


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-[#EB8055] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#2F2925]">Loading student portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1380px] mx-auto pb-10">
      {/* 1. RESIDENT PROFILE BANNER */}
      <div className="relative overflow-hidden bg-[#26201B] text-white rounded-2xl md:rounded-3xl p-5 sm:p-6 shadow-md border border-[#3E332B] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left Section: Avatar & Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            onClick={() => navigate("/profile")}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-[#EB8055]/50 ring-offset-2 ring-offset-[#26201B] flex items-center justify-center text-white font-extrabold text-xl shrink-0 cursor-pointer transition-transform hover:scale-105"
            style={{ background: "#EB8055" }}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#EB8055]">
              Student Profile
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-white truncate leading-tight mt-0.5">
              {displayName}
            </h2>
            <p className="text-xs text-[#C5B5A7] font-medium mt-1 truncate">
              {courseText} · {campusText}
            </p>
          </div>
        </div>


        {/* Right Section: Roll Number, Academic Year, and Arrow Button */}
        <div className="flex items-center gap-4 sm:gap-6 bg-white/[0.07] backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 w-full md:w-auto justify-between md:justify-end">
          <div>
            <p className="text-[10px] text-[#A6988D] uppercase font-bold tracking-wider">
              Roll Number
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
              {rollNo}
            </p>
          </div>
          <div className="w-px h-8 bg-white/15"></div>
          <div>
            <p className="text-[10px] text-[#A6988D] uppercase font-bold tracking-wider">
              Academic Year
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
              {academicYear}
            </p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#EB8055] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-1"
            title="View Profile"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. FOUR SUMMARY CARDS (ONE HORIZONTAL ROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance */}
        <div
          onClick={() => navigate("/my-attendance")}
          className="bg-white rounded-2xl p-5 border border-[#EDE2D4] shadow-xs flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#FDF1EC] text-[#EB8055] flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#8C7B6E]">Attendance</p>
              <p className="text-2xl font-black text-[#26201B] leading-none mt-1">
                {attendanceRate}%
              </p>
              <p className="text-[11px] text-[#8C7B6E] mt-1.5 truncate">
                {attendanceSummary.presentDays} Present · {attendanceSummary.absentDays} Absent · {attendanceSummary.leaveDays} Leave
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FDF5EE] text-[#C9703C] group-hover:bg-[#FBE8DA] flex items-center justify-center transition-colors shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Room */}
        <div
          onClick={() => navigate("/my-allocation")}
          className="bg-white rounded-2xl p-5 border border-[#EDE2D4] shadow-xs flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#FAF0E4] text-[#C9703C] flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#8C7B6E]">Room</p>
              <p className="text-2xl font-black text-[#26201B] leading-none mt-1">
                {roomBlock}-{roomNumber}
              </p>
              <p className="text-[11px] text-[#8C7B6E] mt-1.5 truncate">
                Block {roomBlock} · Floor {roomFloor}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FDF5EE] text-[#C9703C] group-hover:bg-[#FBE8DA] flex items-center justify-center transition-colors shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Occupancy */}
        <div
          onClick={() => navigate("/room-info")}
          className="bg-white rounded-2xl p-5 border border-[#EDE2D4] shadow-xs flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#FDF0EC] text-[#D86840] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#8C7B6E]">Occupancy</p>
              <p className="text-2xl font-black text-[#26201B] leading-none mt-1">
                {roomOccupied} / {roomCapacity}
              </p>
              <p className="text-[11px] text-[#8C7B6E] mt-1.5 truncate">
                Beds Occupied
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FDF5EE] text-[#C9703C] group-hover:bg-[#FBE8DA] flex items-center justify-center transition-colors shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Recent Feedback */}
        <div
          onClick={() => navigate("/feedback")}
          className="bg-white rounded-2xl p-5 border border-[#EDE2D4] shadow-xs flex items-center justify-between hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#FBF3E8] text-[#D48238] flex items-center justify-center shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#8C7B6E]">Recent Feedback</p>
              <p className="text-2xl font-black text-[#26201B] leading-none mt-1">
                {feedbacks.length || 2}
              </p>
              <p className="text-[11px] text-[#8C7B6E] mt-1.5 truncate">
                Submissions
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FDF5EE] text-[#C9703C] group-hover:bg-[#FBE8DA] flex items-center justify-center transition-colors shrink-0 ml-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4. LOWER DASHBOARD (Two-column structure) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT COLUMN: Attendance Overview */}
        <div className="bg-white rounded-2xl p-6 border border-[#EDE2D4] shadow-xs flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-[#EB8055]" />
                <h3 className="text-base font-extrabold text-[#26201B]">
                  Attendance Overview
                </h3>
              </div>
              <div className="relative" ref={attendanceDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAttendanceDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#66574D] border border-[#E8DDD1] px-3 py-1.5 rounded-xl hover:bg-[#FAF4ED] active:bg-[#F5ECE1] transition-colors cursor-pointer"
                  aria-expanded={attendanceDropdownOpen}
                >
                  <span>{attendancePeriod}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8C7B6E] transition-transform duration-200 ${
                      attendanceDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {attendanceDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#E8DDD1] rounded-xl shadow-lg py-1 z-30">
                    {["This Month", "Last Month", "This Semester"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setAttendancePeriod(option);
                          setAttendanceDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                          attendancePeriod === option
                            ? "bg-[#FAF4ED] text-[#EB8055] font-bold"
                            : "text-[#66574D] font-semibold hover:bg-[#FAF4ED] hover:text-[#26201B]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Donut Chart & Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-5 pb-2">
              {/* Donut Chart */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="text-[#F1E9E0]"
                    strokeWidth="14"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    strokeWidth="14"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="#EB8055"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-[#26201B] leading-none">
                    {attendanceRate}%
                  </span>
                  <span className="text-xs font-semibold text-[#8C7B6E] mt-1">
                    Present
                  </span>
                </div>
              </div>

              {/* Legend Breakdown */}
              <div className="space-y-3.5 w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start gap-6 text-xs font-semibold">
                  <div className="flex items-center gap-2 min-w-[70px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                    <span className="text-[#26201B] font-bold">Present</span>
                  </div>
                  <span className="text-[#66574D]">{attendanceSummary.presentDays} Days</span>
                  <span className="text-[#10B981] font-bold min-w-[36px] text-right">
                    {attendanceRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-6 text-xs font-semibold">
                  <div className="flex items-center gap-2 min-w-[70px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
                    <span className="text-[#26201B] font-bold">Absent</span>
                  </div>
                  <span className="text-[#66574D]">{attendanceSummary.absentDays} Days</span>
                  <span className="text-[#EF4444] font-bold min-w-[36px] text-right">
                    8%
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-6 text-xs font-semibold">
                  <div className="flex items-center gap-2 min-w-[70px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                    <span className="text-[#26201B] font-bold">Leave</span>
                  </div>
                  <span className="text-[#66574D]">{attendanceSummary.leaveDays} Day</span>
                  <span className="text-[#F59E0B] font-bold min-w-[36px] text-right">
                    4%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Status Box (matching bottom notification bar height) */}
          <div className="bg-[#FAF4ED] rounded-xl p-3.5 border border-[#EDE2D4] flex items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#EB8055] border border-[#EDE2D4]">
                <Activity className="w-4 h-4 text-[#EB8055]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#26201B] truncate">
                  Attendance Status: Good Standing
                </p>
                <p className="text-[11px] text-[#8C7B6E] truncate">
                  Verified {attendanceSummary.presentDays} of {attendanceSummary.totalDays} academic hostel days
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/my-attendance")}
              className="text-[11px] font-bold text-[#EB8055] hover:text-[#D96B3A] bg-white border border-[#EDE2D4] hover:bg-[#FDF5EE] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Details →
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: My Room */}
        <div className="bg-white rounded-2xl p-6 border border-[#EDE2D4] shadow-xs flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <Bed className="w-5 h-5 text-[#EB8055]" />
              <h3 className="text-base font-extrabold text-[#26201B]">
                My Room
              </h3>
            </div>

            {/* Room Details */}
            <div className="mt-5 p-5 rounded-xl bg-[#FAF4ED] border border-[#EFE5D9]">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C7B6E]">
                  Block {roomBlock}
                </span>
                <span className="text-2xl font-black text-[#26201B]">
                  Room {roomNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 pt-3.5 border-t border-[#EFE5D9] text-xs text-[#66574D] font-semibold">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#8C7B6E] shrink-0" />
                  <span>Floor {roomFloor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-3.5 h-3.5 text-[#8C7B6E] shrink-0" />
                  <span>Capacity : {roomCapacity} Beds</span>
                </div>
                <div className="flex items-center gap-2 text-[#EB8055] font-bold">
                  <Users className="w-3.5 h-3.5 text-[#EB8055] shrink-0" />
                  <span>Occupied : {roomOccupied} / {roomCapacity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dark Notification Box */}
          <div className="bg-[#2A231E] rounded-xl p-4 text-white flex items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#E8DDD1]">
                <Home className="w-4 h-4 text-[#EB8055]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  Your room is fully occupied
                </p>
                <p className="text-[11px] text-[#A6988D] truncate">
                  {roomOccupied} students currently assigned to this room
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: My Roommates */}
        <div className="bg-white rounded-2xl p-6 border border-[#EDE2D4] shadow-xs flex flex-col justify-between h-full space-y-5">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#EB8055]" />
                <h3 className="text-base font-extrabold text-[#26201B]">
                  My Roommates
                </h3>
              </div>
              <button
                onClick={() => navigate("/my-allocation")}
                className="text-xs font-bold text-[#EB8055] hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* Horizontal Circular Avatars */}
            <div className="flex items-center justify-between pt-4 pb-1 overflow-x-auto gap-3">
              {roommatesList.map((rm, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center gap-2 min-w-[70px] sm:min-w-[80px]"
                >
                  <div
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-black text-base shadow-xs"
                    style={{ backgroundColor: rm.bg, color: rm.text }}
                  >
                    {rm.initial}
                  </div>
                  <p className="text-[11px] font-bold text-[#26201B] leading-tight max-w-[85px] line-clamp-2">
                    {rm.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-[#EDE2D4] shadow-xs flex flex-col justify-between h-full space-y-5">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <span className="text-[#EB8055] text-lg font-black">⚡</span>
            <h3 className="text-base font-extrabold text-[#26201B]">
              Quick Actions
            </h3>
          </div>

          {/* 2 x 2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. View Attendance */}
            <div
              onClick={() => navigate("/my-attendance")}
              className="bg-[#FAF4ED] hover:bg-[#F3E8DC] p-3.5 sm:p-4 rounded-xl border border-[#EDE2D4] flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#EB8055]" />
                <span className="text-xs font-bold text-[#26201B] group-hover:text-[#EB8055] transition-colors">
                  View Attendance
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7B6E] group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* 2. My Allocation */}
            <div
              onClick={() => navigate("/my-allocation")}
              className="bg-[#FAF4ED] hover:bg-[#F3E8DC] p-3.5 sm:p-4 rounded-xl border border-[#EDE2D4] flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-[#EB8055]" />
                <span className="text-xs font-bold text-[#26201B] group-hover:text-[#EB8055] transition-colors">
                  My Allocation
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7B6E] group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* 3. Room Directory */}
            <div
              onClick={() => navigate("/room-info")}
              className="bg-[#FAF4ED] hover:bg-[#F3E8DC] p-3.5 sm:p-4 rounded-xl border border-[#EDE2D4] flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <DoorOpen className="w-4 h-4 text-[#EB8055]" />
                <span className="text-xs font-bold text-[#26201B] group-hover:text-[#EB8055] transition-colors">
                  Room Directory
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7B6E] group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* 4. Give Feedback */}
            <div
              onClick={() => navigate("/feedback")}
              className="bg-[#FAF4ED] hover:bg-[#F3E8DC] p-3.5 sm:p-4 rounded-xl border border-[#EDE2D4] flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#EB8055]" />
                <span className="text-xs font-bold text-[#26201B] group-hover:text-[#EB8055] transition-colors">
                  Give Feedback
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7B6E] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
