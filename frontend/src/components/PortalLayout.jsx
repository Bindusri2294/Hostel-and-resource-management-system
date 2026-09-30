import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/api";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, ChevronDown, User, Settings, ShieldCheck, Home } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

function LayoutInner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState("");
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const rawItems = user?.role === "Admin" ? adminNavItems : studentNavItems;
  const navItems = [...rawItems, { label: "Sign Out", icon: LogOut, path: "#logout", isSignOut: true }];

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = () => {
    logout();
    if (isMobile) setOpenMobile(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setUserDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.role !== "Student") {
      setNotifications([]);
      return undefined;
    }

    let cancelled = false;
    const loadNotifications = async () => {
      try {
        const response = await notificationService.list();
        if (!cancelled) {
          setNotifications(Array.isArray(response.data) ? response.data : []);
          setNotificationError("");
        }
      } catch {
        if (!cancelled) setNotificationError("Unable to load notifications. Please try again.");
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [user?.role, notificationsOpen]);

  const handleNotificationClick = async (notification) => {
    const isUnread = !notification.readBy?.includes(user?._id);
    if (isUnread) {
      try {
        await notificationService.markRead(notification._id);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, readBy: [...(item.readBy || []), user?._id] }
              : item
          )
        );
      } catch {
        return;
      }
    }
    setNotificationsOpen(false);
    if (notification.relatedAction?.startsWith("/")) navigate(notification.relatedAction);
  };

  const unreadNotificationCount = notifications.filter(
    (item) => !item.readBy?.includes(user?._id)
  ).length;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Sidebar className="border-r border-purple-100 bg-white">
        <SidebarHeader className="p-4 border-b border-purple-100/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-purple-500/20 text-lg">H</div>
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
                    <SidebarMenuButton onClick={handleLogout} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all font-semibold rounded-xl">
                      <LogOut className="w-4 h-4" /><span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.path)}
                    isActive={isActive}
                    className={`relative transition-all duration-200 rounded-xl font-medium px-3 py-2 flex items-center gap-3 ${isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 !text-white font-semibold shadow-md shadow-purple-500/25 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-indigo-300 before:rounded-r-md"
                      : "text-slate-600 hover:bg-[#F3EEFF] hover:text-[#5B21B6]"}`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "!text-white" : "text-slate-500 group-hover/menu-button:text-[#5B21B6]"}`} />
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
              <AvatarFallback className="bg-purple-600 text-white text-xs font-extrabold">{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-purple-600 font-medium truncate">{user?.email}</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 w-full">
        <header className="flex items-center justify-between border-b border-purple-100 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-3 sticky top-0 z-20 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <SidebarTrigger className="hover:bg-purple-50 text-slate-700 shrink-0" />
            <div className="max-sm:max-w-[130px] max-[375px]:max-w-[110px] overflow-hidden">
              <p className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                {user?.role === "Admin" ? `${getGreeting()}, Administrator` : `${getGreeting()}, ${user?.name?.split(" ")?.[0] || "Resident"}`}
              </p>
              <p className="text-[11px] text-slate-500 font-medium max-sm:hidden truncate">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user?.role !== "Admin" && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative p-2 rounded-xl hover:bg-purple-50 transition-colors text-slate-600 cursor-pointer"
                  aria-label="Open notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white border border-purple-100 rounded-2xl shadow-xl z-50 p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                      {unreadNotificationCount > 0 && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                          {unreadNotificationCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
                      {notificationError ? (
                        <p className="p-3 text-center text-[11px] text-rose-600">{notificationError}</p>
                      ) : notifications.length ? (
                        notifications.map((notification) => {
                          const isUnread = !notification.readBy?.includes(user?._id);
                          return (
                            <button
                              key={notification._id}
                              type="button"
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left p-2 rounded-xl border transition-colors cursor-pointer ${
                                isUnread
                                  ? "bg-purple-50/60 border-purple-100/50 hover:bg-purple-50"
                                  : "bg-white border-slate-100 hover:bg-slate-50"
                              }`}
                            >
                              <p className="font-bold text-slate-800 flex items-center justify-between">
                                <span>{notification.title || notification.notificationType || "Announcement"}</span>
                                {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />}
                              </p>
                              <p className="text-slate-600 text-[11px] mt-0.5">{notification.message}</p>
                              <small className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </small>
                            </button>
                          );
                        })
                      ) : (
                        <p className="p-3 text-center text-[11px] text-slate-500">No notifications yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <button type="button" onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer border border-slate-200/60">
                <Avatar className="w-7 h-7"><AvatarFallback className="bg-purple-600 text-white text-xs font-extrabold">{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback></Avatar>
                <div className="hidden sm:block text-left"><p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p><p className="text-[10px] text-slate-500 leading-tight">{user?.role}</p></div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-purple-100 rounded-2xl shadow-xl z-50 py-1.5 text-xs font-medium space-y-0.5">
                  <div className="px-3 py-2 border-b border-slate-100"><p className="font-bold text-slate-900 truncate">{user?.name}</p><p className="text-[10px] text-slate-500 truncate">{user?.email}</p></div>
                  {user?.role === "Student" ? <>
                    <button onClick={() => { setUserDropdownOpen(false); navigate("/profile"); }} className="w-full text-left px-3 py-2 hover:bg-purple-50 text-slate-700 flex items-center gap-2 cursor-pointer"><User className="w-3.5 h-3.5 text-purple-600" /> My Profile</button>
                    <button onClick={() => { setUserDropdownOpen(false); navigate("/hostel-info"); }} className="w-full text-left px-3 py-2 hover:bg-purple-50 text-slate-700 flex items-center gap-2 cursor-pointer"><Home className="w-3.5 h-3.5 text-purple-600" /> Hostel Info</button>
                  </> : <button onClick={() => { setUserDropdownOpen(false); navigate("/settings"); }} className="w-full text-left px-3 py-2 hover:bg-purple-50 text-slate-700 flex items-center gap-2 cursor-pointer"><Settings className="w-3.5 h-3.5 text-purple-600" /> System Settings</button>}
                  <div className="border-t border-slate-100 my-1" />
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-bold cursor-pointer"><LogOut className="w-3.5 h-3.5 text-rose-600" /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-6 bg-slate-50 min-h-[calc(100vh-64px)] min-w-0 w-full"><Outlet /></main>
      </SidebarInset>
    </>
  );
}

export default function Layout() {
  return <SidebarProvider><LayoutInner /></SidebarProvider>;
}
