import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { allocationService, getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, Home, Users } from "lucide-react";

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

  const roommates = allocation?.roommates || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#2F2925] via-[#43372F] to-[#2F2925] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#E8D8C4]/20 flex flex-wrap items-center justify-between gap-6 max-md:flex-col max-md:text-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            My Room Allocation
          </h2>
          <p className="text-xs sm:text-sm text-[#E8D8C4]/90 font-medium mt-1.5">
            Comfortable and well-maintained rooms designed for a safe and convenient student stay.
          </p>
        </div>
        
        <div>
          <Link
            to="/hostel-info"
            className="inline-flex items-center gap-2 bg-[#EB8055] hover:bg-[#D96F44] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Hostel Info</span>
          </Link>
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
          {/* Roommates */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#2F2925] border-b border-[#E8D8C4]/60 pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#EB8055]" />
              <span>Roommates ({roommates.length})</span>
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
                      <p className="text-[10px] text-[#8B7355]">Roommate</p>
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

