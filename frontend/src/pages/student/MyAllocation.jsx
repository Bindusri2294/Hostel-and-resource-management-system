import { useEffect, useState } from "react";
import { allocationService, getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { ClipboardList, DoorOpen, ChevronRight, AlertCircle, Calendar, Users, Building } from "lucide-react";

export default function MyAllocation() {
  const { user } = useAuth();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    allocationService
      .mine()
      .then(({ data }) => setAllocation(data))
      .catch((err) => {
        if (err.response?.status !== 404 && err.response?.status !== 400) {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-xs font-semibold text-slate-500">
        Loading room allocation details...
      </div>
    );
  }

  const student = user?.student || {};
  const room = allocation?.room || {};
  const roommates = allocation?.roommates || [];

  const capacity = Number(room.Capacity) || 4;
  // Real-time occupied beds based on database records (including the logged-in student)
  const occupiedCount = room.OccupiedCount !== undefined
    ? Number(room.OccupiedCount)
    : (roommates.length + 1);
  const remainingCount = Math.max(0, capacity - occupiedCount);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#2F2925] via-[#43372F] to-[#2F2925] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#E8D8C4]/20 flex flex-wrap items-center justify-between gap-6 max-md:flex-col max-md:text-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            My Room Allocation
          </h2>
          <p className="text-xs sm:text-sm text-[#E8D8C4] font-medium mt-1">
            Roll No: <span className="font-extrabold text-[#EB8055]">{student.Rollno || user?.rollno || "Resident"}</span> · Room:{" "}
            <span className="font-extrabold text-white">{room.RoomNo || allocation?.roomNo || "—"}</span> (Block{" "}
            <span className="font-extrabold text-white">{room.Block || student.Block || "D"}</span>)
          </p>
        </div>
        {allocation && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 max-md:w-full max-md:justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
              {allocation.status || "Active"} Resident
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {allocation ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C4]/60 pb-4 max-md:flex-col max-md:items-start max-md:gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EB8055] text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {room.RoomNo || allocation.roomNo}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#2F2925]">Room {room.RoomNo || allocation.roomNo}</h3>
                  <p className="text-xs font-semibold text-[#B85228]">Block {room.Block || "A"} · Floor {room.Floor || 2}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200">
                {allocation.status} Assignment
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#FDF0DC]/30 rounded-xl border border-[#E8D8C4]">
                <span className="text-[#8B7355] font-bold block text-[10px] uppercase">Allocated Date</span>
                <span className="font-extrabold text-[#2F2925]">
                  {allocation.allocationDate ? new Date(allocation.allocationDate).toLocaleDateString() : "Active"}
                </span>
              </div>
              <div className="p-3 bg-[#FDF0DC]/30 rounded-xl border border-[#E8D8C4]">
                <span className="text-[#8B7355] font-bold block text-[10px] uppercase">Capacity</span>
                <span className="font-extrabold text-[#2F2925]">{capacity} Beds</span>
              </div>
              <div className="p-3 bg-[#FDF0DC]/30 rounded-xl border border-[#E8D8C4]">
                <span className="text-[#8B7355] font-bold block text-[10px] uppercase">Occupied</span>
                <span className="font-extrabold text-[#EB8055]">{occupiedCount} Beds</span>
              </div>
              <div className="p-3 bg-[#FDF0DC]/30 rounded-xl border border-[#E8D8C4]">
                <span className="text-[#8B7355] font-bold block text-[10px] uppercase">Remaining</span>
                <span className="font-extrabold text-emerald-700">
                  {remainingCount} Beds
                </span>
              </div>
            </div>
          </div>

          {/* Roommates */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#2F2925] border-b border-[#E8D8C4]/60 pb-3">
              Roommates ({roommates.length})
            </h3>
            {roommates.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roommates.map((mate) => (
                  <div key={mate.id || mate._id} className="p-3.5 rounded-xl bg-[#FDF0DC]/40 border border-[#E8D8C4] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EB8055] text-white font-bold text-xs flex items-center justify-center">
                      {mate.studentName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2F2925]">{mate.studentName}</p>
                      <p className="text-[10px] text-[#8B7355]">Active Resident</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8B7355] italic py-4 text-center">
                No roommates assigned yet. You currently have this room to yourself.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 bg-white rounded-2xl border border-[#E8D8C4] text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-[#2F2925]">No active allocation found</h3>
          <p className="text-xs text-[#8B7355] max-w-sm mx-auto">
            Your account does not currently have an active room allocation assigned by administration.
          </p>
        </div>
      )}
    </div>
  );
}
