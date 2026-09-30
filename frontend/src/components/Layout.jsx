import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminNavItems, studentNavItems } from "../config/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  LogOut,
  ChevronDown,
  User,
  Settings,
  ShieldCheck,
  Home,
} from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const rawItems = user?.role === "Admin" ? adminNavItems : studentNavItems;
  const navItems = [
    ...rawItems,
    { label: "Sign Out", icon: LogOut, path: "#logout", isSignOut: true },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SidebarProvider>
      {/* ── Sidebar ── */}
      <Sidebar className="border-r bg-white" style={{ borderColor: "#E8D8C4" }}>
        <SidebarHeader className="px-4 py-3.5 border-b" style={{ borderColor: "#E8D8C4" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm text-sm"
              style={{ background: "#EB8055" }}
            >
              K
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm tracking-tight leading-tight" style={{ color: "#2F2925" }}>KIET Hostel</p>
              <p className="text-[11px] font-medium flex items-center gap-1 leading-tight mt-0.5" style={{ color: "#8B7355" }}>
                <ShieldCheck className="w-3 h-3 inline shrink-0" style={{ color: "#EB8055" }} />
                {user?.role === "Admin" ? "Admin Portal" : "Resident Portal"}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2.5 py-3">
          <SidebarMenu className="space-y-0.5">
            {navItems.map((item) => {
              if (item.isSignOut) {
                return (
                  <SidebarMenuItem key="signout-item" className="mt-3 pt-2 border-t" style={{ borderColor: "#E8D8C4" }}>
                    <SidebarMenuButton
                      onClick={handleLogout}
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors font-medium rounded-lg px-3 py-2 text-xs flex items-center gap-2.5 cursor-pointer w-full"
                    >
                      <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive}
                    style={isActive ? {
                      backgroundColor: "#FDF0DC",
                      color: "#B85228",
                    } : {}}
                    className={`relative transition-colors duration-150 rounded-lg font-medium px-3 py-2 flex items-center gap-2.5 text-xs cursor-pointer w-full ${
                      isActive
                        ? "font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r-full"
                        : "hover:bg-[#FDF0DC]/60"
                    }`}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                        style={{ background: "#EB8055" }}
                      />
                    )}
                    <item.icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: isActive ? "#EB8055" : "#8B7355" }}
                    />
                    <span
                      className="truncate"
                      style={{ color: isActive ? "#B85228" : "#5A4A3A" }}
                    >
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t" style={{ borderColor: "#E8D8C4", background: "#FDF0DC" }}>
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 shrink-0" style={{ border: "1px solid #F3C694" }}>
              <AvatarFallback className="text-white text-xs font-bold" style={{ background: "#EB8055" }}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold truncate leading-tight" style={{ color: "#2F2925" }}>{user?.name || "User"}</p>
              <p className="text-[10px] font-medium truncate leading-tight" style={{ color: "#EB8055" }}>{user?.email}</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* ── Top Header ── */}
        <header
          className="flex items-center justify-between border-b px-4 md:px-6 h-14 sticky top-0 z-20 backdrop-blur-sm"
          style={{ borderColor: "#E8D8C4", background: "rgba(255,255,255,0.97)" }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <SidebarTrigger
              className="hover:bg-[#FDF0DC] transition-colors cursor-pointer"
              style={{ color: "#5A4A3A" }}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight truncate leading-tight" style={{ color: "#2F2925" }}>
                {user?.role === "Admin"
                  ? "Good morning, Administrator 👋"
                  : `${getGreeting()}, ${user?.name?.split(" ")?.[0] || "Resident"} 👋`}
              </p>
              <p className="text-[11px] font-medium hidden sm:block leading-tight mt-0.5" style={{ color: "#8B7355" }}>
                {user?.role === "Admin"
                  ? "Here's what's happening across KIET Hostel today."
                  : today}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Notification Bell (Residents only; Admin manages notifications from sidebar) */}
            {user?.role !== "Admin" && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg transition-colors cursor-pointer hover:bg-[#FDF0DC]"
                  style={{ color: "#5A4A3A" }}
                >
                  <Bell className="w-4 h-4" />
                  <span
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: "#EB8055" }}
                  />
                </button>

                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg z-50 p-3 space-y-2"
                    style={{ border: "1px solid #E8D8C4" }}
                  >
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "#E8D8C4" }}>
                      <h4 className="text-xs font-bold" style={{ color: "#2F2925" }}>Campus Announcements</h4>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                        style={{ background: "#EB8055" }}
                      >
                        2 New
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg" style={{ background: "#FDF0DC", border: "1px solid #F3C694" }}>
                        <p className="font-bold" style={{ color: "#2F2925" }}>Mess Menu Update</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#5A4A3A" }}>Special dinner menu scheduled for Friday.</p>
                        <small className="text-[10px] mt-1 block" style={{ color: "#8B7355" }}>2 hours ago</small>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: "#F9EFDE", border: "1px solid #E8D8C4" }}>
                        <p className="font-bold" style={{ color: "#2F2925" }}>Room Inspection</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#5A4A3A" }}>Routine cleanliness inspection on Saturday morning.</p>
                        <small className="text-[10px] mt-1 block" style={{ color: "#8B7355" }}>1 day ago</small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[#FDF0DC]"
                style={{ border: "1px solid #E8D8C4" }}
              >
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarFallback className="text-white text-[10px] font-bold" style={{ background: "#EB8055" }}>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left max-w-[100px] truncate">
                  <p className="text-xs font-bold leading-tight truncate" style={{ color: "#2F2925" }}>{user?.name}</p>
                  <p className="text-[10px] leading-tight truncate" style={{ color: "#8B7355" }}>{user?.role}</p>
                </div>
                <ChevronDown className="w-3 h-3" style={{ color: "#8B7355" }} />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 py-1.5 text-xs font-medium"
                  style={{ border: "1px solid #E8D8C4" }}
                >
                  <div className="px-3 py-2 border-b" style={{ borderColor: "#E8D8C4" }}>
                    <p className="font-bold truncate" style={{ color: "#2F2925" }}>{user?.name}</p>
                    <p className="text-[10px] truncate" style={{ color: "#8B7355" }}>{user?.email}</p>
                  </div>
                  {user?.role === "Student" ? (
                    <>
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate("/profile"); }}
                        className="w-full text-left px-3 py-2 hover:bg-[#FDF0DC] flex items-center gap-2 cursor-pointer transition-colors"
                        style={{ color: "#5A4A3A" }}
                      >
                        <User className="w-3.5 h-3.5" style={{ color: "#EB8055" }} /> My Profile
                      </button>
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate("/hostel-info"); }}
                        className="w-full text-left px-3 py-2 hover:bg-[#FDF0DC] flex items-center gap-2 cursor-pointer transition-colors"
                        style={{ color: "#5A4A3A" }}
                      >
                        <Home className="w-3.5 h-3.5" style={{ color: "#EB8055" }} /> Hostel Info
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigate("/settings"); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#FDF0DC] flex items-center gap-2 cursor-pointer transition-colors"
                      style={{ color: "#5A4A3A" }}
                    >
                      <Settings className="w-3.5 h-3.5" style={{ color: "#EB8055" }} /> System Settings
                    </button>
                  )}
                  <div className="border-t my-1" style={{ borderColor: "#E8D8C4" }}></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="p-4 md:p-6 min-h-[calc(100vh-56px)]" style={{ background: "#F9EFDE" }}>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}