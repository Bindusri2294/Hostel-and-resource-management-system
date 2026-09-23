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
import { Bell, Search, LogOut, ChevronDown, User, Settings, ShieldCheck, Home } from "lucide-react";

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
      <Sidebar className="border-r border-purple-100 bg-white">
        <SidebarHeader className="p-4 border-b border-purple-100/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-purple-500/20 text-lg">
              H
            </div>
            <div>
              <p className="font-extrabold text-sm text-purple-950 tracking-tight">HostelHub</p>
              <p className="text-[11px] font-semibold text-purple-600/80 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-500 inline" />
                {user?.role === "Admin" ? "Warden Admin" : "Resident Portal"}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              if (item.isSignOut) {
                return (
                  <SidebarMenuItem key="signout-item" className="mt-4 pt-2 border-t border-slate-100">
                    <SidebarMenuButton
                      onClick={handleLogout}
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all font-semibold rounded-xl"
                    >
                      <LogOut className="w-4 h-4" />
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
                    className={`relative transition-all duration-200 rounded-xl font-medium px-3 py-2 flex items-center gap-3 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-500/25 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-indigo-300 before:rounded-r-md"
                        : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-purple-100/60 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 border border-purple-200">
              <AvatarFallback className="bg-purple-600 text-white text-xs font-extrabold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-purple-600 font-medium truncate">{user?.email}</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between border-b border-purple-100 bg-white/90 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hover:bg-purple-50 text-slate-700" />
            <div>
              <p className="text-sm font-extrabold text-slate-900 tracking-tight">
                {user?.role === "Admin" ? "Good morning, Administrator" : "Resident Portal"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 rounded-xl px-3 py-1.5 focus-within:border-purple-500 focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search portal..."
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-36 lg:w-48 font-medium"
              />
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl hover:bg-purple-50 transition-colors text-slate-600 cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-purple-100 rounded-2xl shadow-xl z-50 p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-900">Campus Announcements</h4>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">2 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100/50">
                      <p className="font-bold text-slate-800">Mess Menu Update</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">Special dinner menu scheduled for Friday.</p>
                      <small className="text-[10px] text-slate-400 mt-1 block">2 hours ago</small>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-800">Room Inspection</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">Routine cleanliness inspection on Saturday morning.</p>
                      <small className="text-[10px] text-slate-400 mt-1 block">1 day ago</small>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar with Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer border border-slate-200/60"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-purple-600 text-white text-xs font-extrabold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{user?.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-purple-100 rounded-2xl shadow-xl z-50 py-1.5 text-xs font-medium space-y-0.5">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  {user?.role === "Student" ? (
                    <>
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate("/profile"); }}
                        className="w-full text-left px-3 py-2 hover:bg-purple-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-purple-600" /> My Profile
                      </button>
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigate("/hostel-info"); }}
                        className="w-full text-left px-3 py-2 hover:bg-purple-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Home className="w-3.5 h-3.5 text-purple-600" /> Hostel Info
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigate("/settings"); }}
                      className="w-full text-left px-3 py-2 hover:bg-purple-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-purple-600" /> System Settings
                    </button>
                  )}
                  <div className="border-t border-slate-100 my-1"></div>
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

        <main className="p-4 md:p-6 bg-slate-50 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}