import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  ["/", "Overview", "◈"], ["/students", "Students", "♧"], ["/rooms", "Rooms", "⌂"], ["/allocations", "Allocations", "↗"], ["/feedback", "Feedback", "✦"],
];
const studentLinks = [["/", "My dashboard", "◈"], ["/profile", "My profile", "♙"], ["/feedback", "Feedback", "✦"]];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user.role === "Admin" ? adminLinks : studentLinks;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">H</span><span>HostelHub<small>Campus living, organized</small></span></div>
      <div className="sidebar-label">Workspace</div>
      <nav>{links.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><b>{icon}</b>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="user-chip"><span className="avatar">{user.name?.slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.role}</small></span></div><button className="logout" onClick={() => { logout(); navigate("/login"); }}>Sign out <span>↪</span></button></div>
    </aside>
    <main className="main-content"><header className="topbar"><div><span className="eyebrow">{user.role === "Admin" ? "Administration" : "Resident portal"}</span><h1>{user.role === "Admin" ? "Campus operations" : "Your residence"}</h1></div><div className="topbar-meta"><span className="online-dot" /> System online <span className="top-avatar">{user.name?.slice(0, 1).toUpperCase()}</span></div></header><div className="page-content"><Outlet /></div></main>
  </div>;
}
