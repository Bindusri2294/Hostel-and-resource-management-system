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
  LayoutGrid,
  Table,
} from "lucide-react";

export default function RoomInfo() {
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFloor, setSelectedFloor] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

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

  const openDetails = async (room) => {
    setSelected(room);
    setDetailsOpen(true);

    if (room.Block === "Executive") {
      try {
        const response = await roomService.get(room._id);
        setSelected(response.data);
      } catch {
        // Keep the live room-list data if the detail request fails.
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#2F2925]">Room Directory</h2>
            <p className="text-xs text-[#8B7355]">
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

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7355]" />
            <input
              type="text"
              placeholder="Search by room no, block, floor, capacity, status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] placeholder-[#8B7355]/50 focus:border-[#EB8055] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-[#FDF0DC]/60 p-1 rounded-xl border border-[#E8D8C4]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#B85228] shadow-2xs border border-[#E8D8C4]"
                    : "text-[#8B7355] hover:text-[#2F2925]"
                }`}
                title="Table View"
              >
                <Table className="w-3.5 h-3.5" /> Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#B85228] shadow-2xs border border-[#E8D8C4]"
                    : "text-[#8B7355] hover:text-[#2F2925]"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </button>
            </div>

            <button
              onClick={loadRooms}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#2F2925] border-[#E8D8C4]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E8D8C4]/60">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Block Filter</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
            >
              <option value="All">All Blocks</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
              <option value="KW">Block KW</option>
              <option value="Executive">Executive Block</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Status Filter</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Floor Filter</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
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

      {/* Room Directory View */}
      {loading ? (
        <div className="text-center py-12 text-xs font-semibold text-[#8B7355]">
          Loading room inventory...
        </div>
      ) : filteredRooms.length ? (
        viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="bg-white rounded-2xl border border-[#E8D8C4] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FDF0DC]/50 border-b border-[#E8D8C4] text-[11px] font-bold uppercase text-[#8B7355] tracking-wider">
                    <th className="p-3.5 pl-5">Room No</th>
                    <th className="p-3.5">Block</th>
                    <th className="p-3.5">Floor</th>
                    <th className="p-3.5">Capacity & Occupancy</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C4]/60 font-medium text-[#2F2925]">
                  {filteredRooms.map((room) => {
                    const occupied = Number(room.OccupiedCount || 0);
                    const capacity = Number(room.Capacity || 1);
                    const statusBadge = getCalculatedStatus(occupied, capacity);
                    const pct = Math.min(100, Math.round((occupied / capacity) * 100));

                    return (
                      <tr key={room._id} className="hover:bg-[#FDF0DC]/20 transition-colors">
                        {/* 1. Room No */}
                        <td className="p-3.5 pl-5 font-extrabold text-sm text-[#2F2925]">
                          Room {room.RoomNo}
                        </td>

                        {/* 2. Block */}
                        <td className="p-3.5">
                          <span className="text-[11px] font-bold text-[#B85228] bg-[#FDF0DC] px-2.5 py-1 rounded-lg border border-[#E8D8C4] inline-block shadow-2xs">
                            {room.Block === "Executive" ? "Executive Block" : `Block ${room.Block || "D"}`}
                          </span>
                        </td>

                        {/* 3. Floor */}
                        <td className="p-3.5 font-semibold text-[#8B7355]">
                          Floor {room.Floor ?? 1}
                        </td>

                        {/* 4. Capacity & Occupancy */}
                        <td className="p-3.5">
                          <div className="space-y-1 max-w-[160px]">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span>{occupied} / {capacity} Beds</span>
                              <span className="text-[10px] text-[#8B7355]">{pct}%</span>
                            </div>
                            <div className="w-full bg-[#FDF0DC] rounded-full h-1.5 overflow-hidden border border-[#E8D8C4]/60">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  statusBadge === "Full"
                                    ? "bg-rose-500"
                                    : statusBadge === "Partial"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 5. Status */}
                        <td className="p-3.5">
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
                        </td>

                        {/* 6. View Room Button */}
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            type="button"
                            onClick={() => openDetails(room)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#B85228] border border-[#E8D8C4] rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#EB8055]" /> View Room
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => {
              const occupied = Number(room.OccupiedCount || 0);
              const capacity = Number(room.Capacity || 1);
              const availableBeds = Math.max(0, capacity - occupied);
              const statusBadge = getCalculatedStatus(occupied, capacity);

              return (
                <div
                  key={room._id}
                  className="bg-white rounded-2xl border border-[#E8D8C4] p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-[11px] font-bold text-[#B85228] bg-[#FDF0DC] px-2.5 py-1 rounded-lg border border-[#E8D8C4] shadow-2xs">
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
                      <h3 className="text-xl font-extrabold text-[#2F2925]">Room {room.RoomNo}</h3>
                      <span className="text-xs font-semibold text-[#8B7355]">Floor {room.Floor ?? 1}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E8D8C4]/60 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-[#FDF0DC]/30 rounded-xl">
                        <span className="text-[10px] text-[#8B7355] block font-bold">Capacity</span>
                        <strong className="text-[#2F2925] font-extrabold">{capacity}</strong>
                      </div>
                      <div className="p-2 bg-[#FDF0DC]/30 rounded-xl">
                        <span className="text-[10px] text-[#8B7355] block font-bold">Occupied</span>
                        <strong className="text-[#EB8055] font-extrabold">{occupied}</strong>
                      </div>
                      <div className="p-2 bg-[#FDF0DC]/30 rounded-xl">
                        <span className="text-[10px] text-[#8B7355] block font-bold">Available</span>
                        <strong className="text-emerald-700 font-extrabold">{availableBeds}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8D8C4]/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openDetails(room)}
                      className="flex-1 py-1.5 px-2 bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#B85228] font-bold text-xs rounded-xl border border-[#E8D8C4] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Room
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-[#E8D8C4] text-center space-y-2">
          <DoorOpen className="w-10 h-10 text-[#8B7355]/40 mx-auto" />
          <h3 className="text-base font-bold text-[#2F2925]">No rooms found</h3>
          <p className="text-xs text-[#8B7355]">Try changing your search query or filters.</p>
        </div>
      )}

      {/* Room Details Modal */}
      {detailsOpen && selected && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col space-y-4 p-6 border border-[#E8D8C4]">
            <div className="flex items-center justify-between border-b border-[#E8D8C4]/60 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#EB8055] uppercase tracking-wider">
                  Room Number
                </span>
                <h3 className="text-xl font-extrabold text-[#2F2925] mt-1">Room {selected.RoomNo}</h3>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs text-center font-semibold">
              <div className="p-3 bg-[#FDF0DC] rounded-xl border border-[#E8D8C4]">
                <span className="text-[#8B7355] text-[10px] block font-bold">Block</span>
                <strong className="text-[#2F2925] font-extrabold">{selected.Block === "Executive" ? "Executive" : selected.Block}</strong>
              </div>
              <div className="p-3 bg-[#FDF0DC]/30 rounded-xl border border-[#E8D8C4]">
                <span className="text-[#8B7355] text-[10px] block font-bold">Floor</span>
                <strong className="text-[#2F2925] font-extrabold">{selected.Floor}</strong>
              </div>
              <div className="p-3 bg-[#FDF0DC]/30 rounded-xl border border-[#E8D8C4]">
                <span className="text-[#8B7355] text-[10px] block font-bold">Capacity</span>
                <strong className="text-[#2F2925] font-extrabold">{selected.Capacity}</strong>
              </div>
            </div>

            <div className="p-4 bg-[#FDF0DC]/20 rounded-xl border border-[#E8D8C4] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#2F2925] font-semibold">
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
              <div className="flex justify-between items-center text-[#2F2925] font-semibold">
                <span>Occupied</span>
                <span className="font-extrabold text-[#EB8055]">{selected.OccupiedCount || 0}</span>
              </div>
              <div className="flex justify-between items-center text-[#2F2925] font-semibold">
                <span>Available</span>
                <span className="font-extrabold text-emerald-700">
                  {Math.max(0, (selected.Capacity || 0) - (selected.OccupiedCount || 0))}
                </span>
              </div>
            </div>

            {selected.Block === "Executive" && (
              <div className="p-4 bg-[#FDF0DC]/20 rounded-xl border border-[#E8D8C4] space-y-2 text-xs">
                <h4 className="font-bold text-[#2F2925]">Allocated Students</h4>
                {selected.AllocatedStudents?.length ? (
                  <div className="max-h-[300px] overflow-y-auto overscroll-contain scroll-smooth pr-2 divide-y divide-[#E8D8C4]/70">
                    {selected.AllocatedStudents.map((student) => (
                      <div key={student._id} className="py-2 first:pt-0 last:pb-0">
                        <p className="font-semibold text-[#2F2925]">{student.Name}</p>
                        <p className="text-[#8B7355]">{student.Rollno} · {student.Course}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#8B7355]">No active student allocations.</p>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-[#E8D8C4]/60 flex justify-end">
              <button
                onClick={() => setDetailsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FDF0DC] text-[#2F2925] hover:bg-[#F5E8D4] border border-[#E8D8C4] cursor-pointer"
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
