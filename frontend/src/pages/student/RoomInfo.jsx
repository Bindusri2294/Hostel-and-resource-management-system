import { useEffect, useState } from "react";
import { roomService, getErrorMessage } from "../../services/api";
import {
  DoorOpen,
  Search,
  Building,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function RoomInfo() {
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFloor, setSelectedFloor] = useState("All");

  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const getCalculatedStatus = (occupied, capacity) => {
    if (occupied >= capacity) return "Full";
    if (occupied > 0) return "Partial";
    return "Available";
  };

  const filteredRooms = rooms.filter((room) => {
    const roomStatus = getCalculatedStatus(
      Number(room.OccupiedCount || 0),
      Number(room.Capacity || 1)
    );
    const matchesStatus = selectedStatus === "All" || roomStatus === selectedStatus;
    const matchesBlock = selectedBlock === "All" || room.Block === selectedBlock;
    const matchesFloor = selectedFloor === "All" || String(room.Floor || "") === String(selectedFloor);

    if (!query.trim()) {
      return matchesStatus && matchesBlock && matchesFloor;
    }

    const q = query.toLowerCase();
    const matchRoomNo = String(room.RoomNo || "").toLowerCase().includes(q);
    const matchBlock = String(room.Block || "").toLowerCase().includes(q);
    const matchFloor = `floor ${room.Floor || ""}`.toLowerCase().includes(q) || String(room.Floor || "").toLowerCase().includes(q);
    const matchCapacity = `${room.Capacity || ""} beds`.toLowerCase().includes(q) || String(room.Capacity || "").toLowerCase().includes(q);
    const matchOccupied = `${room.OccupiedCount || ""} occupied`.toLowerCase().includes(q);
    const matchStatus = roomStatus.toLowerCase().includes(q);

    const matchesQuery = matchRoomNo || matchBlock || matchFloor || matchCapacity || matchOccupied || matchStatus;

    return matchesStatus && matchesBlock && matchesFloor && matchesQuery;
  });

  const openDetails = (room) => {
    setSelected(room);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Room Management</h2>
            <p className="text-xs text-slate-500">
              Browse room cards, inspect bed availability, and explore residential space.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER & SEARCH TOOLBAR (Feedback style across all fields) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by room no, block, floor, capacity, status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#673BB7] focus:bg-white shadow-sm"
            />
          </div>

          <button
            onClick={loadRooms}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Block Filter</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Blocks</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
              <option value="KW">Block KW</option>
              <option value="Executive">Executive Block</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Status Filter</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-slate-600">Floor Filter</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm cursor-pointer"
            >
              <option value="All">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-slate-500">
          Loading room inventory...
        </div>
      ) : filteredRooms.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRooms.map((room) => {
            const occupied = Number(room.OccupiedCount || 0);
            const capacity = Number(room.Capacity || 1);
            const availableBeds = Math.max(0, capacity - occupied);
            const statusBadge = getCalculatedStatus(occupied, capacity);

            return (
              <div
                key={room._id}
                className="bg-white rounded-2xl border border-purple-100/70 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100/80 flex items-center gap-1.5 shadow-2xs">
                      <Building className="w-3.5 h-3.5 text-purple-600" />
                      {room.Block === "Executive" ? "Executive Block" : `Block ${room.Block || "D"}`}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        statusBadge === "Available"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : statusBadge === "Partial"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-rose-100 text-rose-800 border-rose-200"
                      }`}
                    >
                      {statusBadge}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <h3 className="text-xl font-extrabold text-slate-900">Room {room.RoomNo}</h3>
                    <span className="text-xs font-semibold text-slate-500">Floor {room.Floor ?? 1}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Capacity</span>
                      <strong className="text-slate-900 font-extrabold">{capacity}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Occupied</span>
                      <strong className="text-purple-700 font-extrabold">{occupied}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Available</span>
                      <strong className="text-emerald-700 font-extrabold">{availableBeds}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openDetails(room)}
                    className="flex-1 py-1.5 px-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Room
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-purple-100/70 text-center space-y-2">
          <DoorOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No rooms found</h3>
          <p className="text-xs text-slate-400">Try changing your search query or filters.</p>
        </div>
      )}

      {/* Room Details Modal */}
      {detailsOpen && selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  Room Details & Occupancy
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Room {selected.RoomNo}</h3>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs text-center font-semibold">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-slate-400 text-[10px] block font-bold">Block / Floor</span>
                <strong className="text-purple-900 font-extrabold">
                  {selected.Block === "Executive" ? "Executive Block" : `Block ${selected.Block}`} · Floor {selected.Floor}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-bold">Total Beds</span>
                <strong className="text-slate-900 font-extrabold">{selected.Capacity}</strong>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-slate-400 text-[10px] block font-bold">Available Beds</span>
                <strong className="text-emerald-900 font-extrabold">
                  {Math.max(0, (selected.Capacity || 0) - (selected.OccupiedCount || 0))}
                </strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 font-semibold">
                <span>Current Status</span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    getCalculatedStatus(Number(selected.OccupiedCount || 0), Number(selected.Capacity || 1)) === "Available"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : getCalculatedStatus(Number(selected.OccupiedCount || 0), Number(selected.Capacity || 1)) === "Partial"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-rose-100 text-rose-800 border-rose-200"
                  }`}
                >
                  {getCalculatedStatus(Number(selected.OccupiedCount || 0), Number(selected.Capacity || 1))}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-semibold">
                <span>Occupied Beds</span>
                <span className="font-extrabold text-purple-700">{selected.OccupiedCount || 0}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-semibold">
                <span>Vacant Beds Available</span>
                <span className="font-extrabold text-emerald-700">
                  {Math.max(0, (selected.Capacity || 0) - (selected.OccupiedCount || 0))}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
