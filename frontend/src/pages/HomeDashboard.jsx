import { useEffect, useState } from "react";
import { allocationService, getErrorMessage, roomService, studentService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Badge, Empty, ErrorMessage, formatDate, Loading, StatCard } from "../components/UI";

function useCampusData(role) {
  const [data, setData] = useState({ students: [], rooms: [], allocations: [], allocation: null });
  const [state, setState] = useState({ loading: true, error: "" });
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: "" });
    const request = role === "Admin"
      ? Promise.all([studentService.list(), roomService.list(), allocationService.list()])
        .then(([students, rooms, allocations]) => {
          if (!cancelled) setData({ students: students.data, rooms: rooms.data, allocations: allocations.data, allocation: null });
        })
      : allocationService.mine()
        .then(({ data: allocation }) => {
          if (!cancelled) setData({ students: [], rooms: [], allocations: [], allocation });
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            if (!cancelled) setData({ students: [], rooms: [], allocations: [], allocation: null });
            return;
          }
          throw error;
        });
    request
      .catch((error) => {
        if (!cancelled) setState({ loading: false, error: getErrorMessage(error) });
      })
      .finally(() => {
        if (!cancelled) setState((current) => ({ ...current, loading: false }));
      });
    return () => { cancelled = true; };
  }, [role]);
  return { ...data, ...state };
}

export default function HomeDashboard() {
  const { user } = useAuth();
  const data = useCampusData(user.role);
  if (data.loading) return <Loading text="Loading your residence..." />;
  if (data.error) return <ErrorMessage message={data.error} />;
  return user.role === "Admin" ? <AdminHome {...data} /> : <StudentHome {...data} user={user} />;
}

function AdminHome({ students, rooms, allocations }) {
  const active = allocations.filter((allocation) => allocation.status === "Active");
  const capacity = rooms.reduce((sum, room) => sum + Number(room.Capacity || 0), 0);
  const occupied = rooms.reduce((sum, room) => sum + Number(room.OccupiedCount || 0), 0);
  const occupiedRooms = rooms.filter((room) => Number(room.OccupiedCount || 0) > 0).length;
  const availableRooms = rooms.filter((room) => Number(room.OccupiedCount || 0) < Number(room.Capacity || 0)).length;
  return <div className="page-stack"><div className="page-heading"><div><span className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span><h2>Good morning, administrator</h2><p className="muted">Here is the live pulse of your residential campus.</p></div><div className="heading-mark">✦</div></div><div className="stat-grid"><StatCard label="Total students" value={students.length} note="Registered residents" /><StatCard label="Total rooms" value={rooms.length} note="Residential inventory" accent="blue" /><StatCard label="Total capacity" value={capacity} note="Beds across all rooms" accent="green" /><StatCard label="Allocated students" value={active.length} note="Active assignments" accent="orange" /><StatCard label="Occupied rooms" value={occupiedRooms} note="Rooms with residents" /><StatCard label="Available rooms" value={availableRooms} note="Room capacity remains" accent="blue" /><StatCard label="Remaining beds" value={Math.max(capacity - occupied, 0)} note={`${occupied} beds occupied`} accent="green" /></div><div className="content-grid"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">Live occupancy</span><h3>Rooms at a glance</h3></div><span className="panel-count">{rooms.length} rooms</span></div>{rooms.length ? <div className="room-list">{rooms.slice(0, 8).map((room) => <div className="room-row" key={room._id}><div className="room-icon">{room.Block}</div><div className="room-info"><strong>{room.RoomNo}</strong><small>Block {room.Block} · Floor {room.Floor}</small></div><div className="room-meter"><div><span>{room.OccupiedCount || 0} / {room.Capacity || 0}</span><Badge>{room.Status}</Badge></div><div className="meter"><i style={{ width: `${Math.min((Number(room.OccupiedCount || 0) / Number(room.Capacity || 1)) * 100, 100)}%` }} /></div></div></div>)}</div> : <Empty title="No rooms yet" text="Add rooms to see occupancy here." />}</section><section className="panel accent-panel"><span className="eyebrow">Campus occupancy</span><h3>{capacity ? Math.round((occupied / capacity) * 100) : 0}%</h3><p>of available beds are occupied.</p><div className="large-meter"><i style={{ width: `${capacity ? Math.min((occupied / capacity) * 100, 100) : 0}%` }} /></div><div className="accent-stats"><span><b>{occupied}</b>Occupied</span><span><b>{Math.max(capacity - occupied, 0)}</b>Available</span></div></section></div></div>;
}

function StudentHome({ allocation, user }) {
  const student = user.student;
  const room = allocation?.room;
  const roommates = allocation?.roommates || [];
  return <div className="page-stack"><div className="page-heading"><div><span className="eyebrow">Resident portal</span><h2>Welcome home, {student?.Name || user.name}</h2><p className="muted">Everything you need to know about your stay, in one view.</p></div></div><div className="student-hero"><div className="student-profile"><div className="profile-avatar">{(student?.Name || user.name).slice(0, 1)}</div><div><span className="eyebrow">Your profile</span><h3>{student?.Name || user.name}</h3><p>{student?.Course || "Course not provided"} · {student?.Campus || "Campus not provided"}</p></div></div><div className="profile-facts"><span><small>Roll number</small><b>{student?.Rollno || "—"}</b></span><span><small>Year</small><b>{student?.Year || "—"}</b></span></div></div>{!allocation ? <div className="panel"><Empty title="No room allocation found" text="Your hostel team has not assigned a room to you yet." /></div> : <div className="content-grid"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">Current allocation</span><h3>Room {room?.RoomNo || allocation.roomNo}</h3></div><Badge>{allocation.status}</Badge></div><div className="detail-grid"><span><small>Block</small><b>{room?.Block || "—"}</b></span><span><small>Floor</small><b>{room?.Floor || "—"}</b></span><span><small>Capacity</small><b>{room?.Capacity || "—"}</b></span><span><small>Occupied students</small><b>{room?.OccupiedCount ?? "—"}</b></span><span><small>Remaining beds</small><b>{room ? Math.max(room.Capacity - room.OccupiedCount, 0) : "—"}</b></span><span><small>Allocation date</small><b>{formatDate(allocation.allocationDate)}</b></span></div></section><section className="panel"><div className="panel-heading"><div><span className="eyebrow">Shared space</span><h3>Roommates</h3></div><span className="panel-count">{roommates.length}</span></div>{roommates.length ? roommates.map((mate) => <div className="mate-row" key={mate.id}><span className="avatar small">{mate.studentName?.slice(0, 1)}</span><span><strong>{mate.studentName}</strong><small>Active resident</small></span></div>) : <Empty title="No roommates" text="You currently have this room to yourself." />}</section></div>}</div>;
}
