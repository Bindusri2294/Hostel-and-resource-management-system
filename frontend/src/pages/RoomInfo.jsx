import { useEffect, useState } from "react";
import { roomService, getErrorMessage } from "../services/api";
import { DoorOpen, Search, ChevronRight, Building } from "lucide-react";

export default function RoomInfo() {
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRooms = async () => {
    setLoading(true);
    try {
      const res = await roomService.list();
      setRooms(res.data || []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load room directory."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const filteredRooms = rooms.filter((room) => {
    return (
      !query ||
      String(room.RoomNo || "").toLowerCase().includes(query.toLowerCase()) ||
      String(room.Block || "").toLowerCase().includes(query.toLowerCase())
    );
  });

  // Summary statistics
  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce(
    (acc, r) => acc + Number(r.Capacity || 0),
    0
  );
  const totalOccupied = rooms.reduce(
    (acc, r) => acc + Number(r.OccupiedCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Hostel Rooms Directory
            </h2>
            <p className="text-xs text-slate-500">
              Browse hostel rooms, capacity, and occupancy details.
            </p>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
              Total Rooms
            </span>
            <span className="text-xl font-extrabold text-purple-950">
              {totalRooms}
            </span>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
              Total Capacity
            </span>
            <span className="text-xl font-extrabold text-indigo-950">
              {totalCapacity}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Total Occupied
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {totalOccupied}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Toolbar Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search room number or block..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs font-semibold text-slate-500">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading room details...
        </div>
      ) : filteredRooms.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRooms.map((room) => {
            const occupied = Number(room.OccupiedCount || 0);
            const capacity = Number(room.Capacity || 1);

            return (
              <div
                key={room._id}
                className="bg-white rounded-2xl border border-purple-100/70 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100/80 flex items-center gap-1.5 shadow-2xs">
                      <Building className="w-3.5 h-3.5 text-purple-600" />
                      {room.Block === "Executive" ? "Executive Block" : `Block ${room.Block || "D"}`}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Floor {room.Floor ?? 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Room {room.RoomNo}
                  </h3>
                </div>

                {/* Only Room Capacity & Occupied */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      Capacity
                    </span>
                    <strong className="text-slate-900 font-extrabold text-sm">
                      {capacity}
                    </strong>
                  </div>

                  <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-100">
                    <span className="text-[10px] text-purple-600 block font-bold">
                      Occupied
                    </span>
                    <strong className="text-purple-700 font-extrabold text-sm">
                      {occupied}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-purple-100/70 text-center space-y-2">
          <DoorOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No rooms found
          </h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query.
          </p>
        </div>
      )}
    </div>
  );
}
