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
        if (err.response?.status !== 404) {
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

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">My Room Allocation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed overview of your current active hostel room assignment.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {allocation ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {room.RoomNo || allocation.roomNo}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Room {room.RoomNo || allocation.roomNo}</h3>
                  <p className="text-xs font-semibold text-purple-700">Block {room.Block || "A"} · Floor {room.Floor || 2}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200">
                {allocation.status} Assignment
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Allocated Date</span>
                <span className="font-extrabold text-slate-900">
                  {allocation.allocationDate ? new Date(allocation.allocationDate).toLocaleDateString() : "Active"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Capacity</span>
                <span className="font-extrabold text-slate-900">{room.Capacity || 4} Beds</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Occupied</span>
                <span className="font-extrabold text-purple-700">{room.OccupiedCount || 1} Beds</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Remaining</span>
                <span className="font-extrabold text-emerald-700">
                  {Math.max(0, (room.Capacity || 4) - (room.OccupiedCount || 1))} Beds
                </span>
              </div>
            </div>
          </div>

          {/* Roommates */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Roommates ({roommates.length})
            </h3>
            {roommates.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roommates.map((mate) => (
                  <div key={mate.id || mate._id} className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      {mate.studentName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{mate.studentName}</p>
                      <p className="text-[10px] text-slate-500">Active Resident</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No roommates assigned yet. You currently have this room to yourself.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 bg-white rounded-2xl border border-purple-100/70 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active allocation found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your account does not currently have an active room allocation assigned by administration.
          </p>
        </div>
      )}
    </div>
  );
}
