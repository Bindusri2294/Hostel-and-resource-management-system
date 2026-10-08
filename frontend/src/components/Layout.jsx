import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminNavItems, studentNavItems } from "../config/navigation";
import { notificationService } from "../services/api";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
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
  X,
} from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

function HamburgerButton() {
  const { toggleSidebar, open, isMobile, openMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer hover:bg-[#FDF0DC] active:bg-[#F5E4D0] text-[#5A4A3A] hover:text-[#2F2925] shrink-0 mr-1"
    >
      <div
        className="w-4 h-3.5 flex flex-col justify-between items-center relative"
        style={{
          transition: "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
        }}
      >
        <span
          className="h-[2px] bg-current rounded-full block"
          style={{
            width: isOpen ? "16px" : "10px",
            alignSelf: isOpen ? "center" : "flex-start",
            transformOrigin: "left center",
            transform: isOpen ? "none" : "rotate(-40deg) translate(0.5px, -1px)",
            transition: "all 280ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <span
          className="w-4 h-[2px] bg-current rounded-full block"
          style={{
            transition: "all 280ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <span
          className="h-[2px] bg-current rounded-full block"
          style={{
            width: isOpen ? "16px" : "10px",
            alignSelf: isOpen ? "center" : "flex-start",
            transformOrigin: "left center",
            transform: isOpen ? "none" : "rotate(40deg) translate(0.5px, 1px)",
            transition: "all 280ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </button>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const [popupNotification, setPopupNotification] = useState(null);
  const popupTimeoutRef = useRef(null);
  const shownNotifIdRef = useRef(null);

  const navItems = user?.role === "Admin" ? adminNavItems : studentNavItems;

  const handleLogout = () => {
    shownNotifIdRef.current = null;
    setPopupNotification(null);
    logout();
    navigate("/login");
  };

  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("previewed_notif_")) {
          localStorage.removeItem(key);
        }
      });
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!user || user.role === "Admin") return;
    let isCancelled = false;
    const loadNotifications = async () => {
      try {
        const res = await notificationService.list();
        if (!isCancelled && Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  const currentUserId = user?._id || user?.id;
  const isNotificationRead = (notif) => {
    if (!currentUserId || !notif.readBy) return false;
    return notif.readBy.some((id) => String(id) === String(currentUserId));
  };
  const unreadCount = notifications.filter((n) => !isNotificationRead(n)).length;

  useEffect(() => {
    if (!user || user.role === "Admin") {
      setPopupNotification(null);
      shownNotifIdRef.current = null;
      return;
    }

    const unread = notifications.filter((n) => !isNotificationRead(n));
    if (unread.length > 0) {
      const latest = unread[0];

      // Show popup preview on login / when an unread notification exists
      // Re-checks and shows whenever the student logs in or when a new unread notification arrives
      if (shownNotifIdRef.current !== String(latest._id)) {
        shownNotifIdRef.current = String(latest._id);
        setPopupNotification(latest);

        if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = setTimeout(() => {
          setPopupNotification(null);
        }, 10000);
      }
    } else {
      shownNotifIdRef.current = null;
      setPopupNotification(null);
    }

    return () => {
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, [notifications, currentUserId]);

  const handleNotificationClick = async (notif) => {
    if (!isNotificationRead(notif) && currentUserId) {
      try {
        await notificationService.markRead(notif._id);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notif._id
              ? { ...item, readBy: [...(item.readBy || []), currentUserId] }
              : item
          )
        );
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
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
                {user?.role === "Admin" ? "Admin Portal" : "Student Portal"}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-3">
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive}
                    style={isActive ? {
                      backgroundColor: "#FDEEE5",
                      color: "#C95E2B",
                    } : {}}
                    className={`transition-colors duration-150 rounded-xl font-medium px-3.5 py-2.5 flex items-center gap-3 text-xs cursor-pointer w-full ${isActive
                        ? "font-bold text-[#C95E2B]"
                        : "hover:bg-[#FDF0DC]/50 text-[#5A4A3A]"
                      }`}
                  >
                    <item.icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: isActive ? "#EB8055" : "#8B7355" }}
                    />
                    <span className="truncate">
                      {item.label}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t" style={{ borderColor: "#E8D8C4" }}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="hover:bg-[#FDF0DC]/50 transition-colors font-bold rounded-xl px-3.5 py-2.5 text-xs flex items-center gap-2.5 cursor-pointer w-full text-[#EB8055] hover:text-[#D96B3A]"
              >
                <LogOut className="w-4 h-4 shrink-0 text-[#EB8055]" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* ── Top Header ── */}
        <header
          className="flex items-center justify-between border-b px-4 md:px-6 h-14 sticky top-0 z-20 backdrop-blur-sm"
          style={{ borderColor: "#E8D8C4", background: "rgba(255,255,255,0.97)" }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <HamburgerButton />
            {user?.role === "Admin" ? (
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight truncate leading-tight" style={{ color: "#2F2925" }}>
                  {`${getGreeting()}, Administrator`}
                </p>
                <p className="text-[11px] font-medium hidden sm:block leading-tight mt-0.5" style={{ color: "#8B7355" }}>
                  Here's what's happening across KIET Hostel today.
                </p>
              </div>
            ) : (
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold tracking-tight text-[#2F2925] leading-tight truncate">
                  {today}
                </p>
                <p className="text-[10px] sm:text-[11px] font-medium text-[#8B7355] leading-tight mt-0.5 truncate">
                  Academic Year · {user?.student?.Year ? `${user.student.Year} Year` : "3rd Year"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell (Residents only; Admin manages notifications from sidebar) */}
            {user?.role !== "Admin" && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setPopupNotification(null);
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="relative p-2 rounded-lg transition-colors cursor-pointer hover:bg-[#FDF0DC]"
                  style={{ color: "#5A4A3A" }}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ background: "#EB8055" }}
                    />
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg z-50 p-3 space-y-2 max-h-96 overflow-y-auto"
                    style={{ border: "1px solid #E8D8C4" }}
                  >
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "#E8D8C4" }}>
                      <h4 className="text-xs font-bold" style={{ color: "#2F2925" }}>Campus Announcements</h4>
                      {unreadCount > 0 && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white transition-all"
                          style={{ background: "#EB8055" }}
                        >
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-xs">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => {
                          const isRead = isNotificationRead(notif);
                          return (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className="p-2.5 rounded-lg transition-all cursor-pointer"
                              style={{
                                background: isRead ? "#FFFFFF" : "#FDF0DC",
                                border: isRead ? "1px solid #E8D8C4" : "1px solid #F3C694",
                              }}
                            >
                              <p className={`text-xs ${isRead ? "font-semibold text-[#5A4A3A]" : "font-extrabold text-[#2F2925]"}`}>
                                {notif.title}
                              </p>
                              <p className="text-[11px] mt-1 whitespace-pre-wrap leading-relaxed" style={{ color: "#5A4A3A" }}>
                                {notif.message}
                              </p>
                              <small className="text-[10px] mt-2 block font-medium" style={{ color: "#8B7355" }}>
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "Recently"}
                              </small>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs font-medium" style={{ color: "#8B7355" }}>
                          No announcements at this time.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Small Notification Preview Popup */}
            {user?.role !== "Admin" && popupNotification && !notificationsOpen && (
              <div
                onClick={() => {
                  setPopupNotification(null);
                  setNotificationsOpen(true);
                }}
                className="fixed top-16 right-4 sm:right-6 z-50 max-w-xs sm:max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl p-3.5 cursor-pointer transition-all duration-300 hover:shadow-xl border"
                style={{
                  borderColor: "#E8D8C4",
                  boxShadow: "0 10px 25px -5px rgba(235, 128, 85, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                }}
                role="alert"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5"
                    style={{ background: "#FDF0DC", color: "#EB8055" }}
                  >
                    <Bell className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: "#EB8055" }}>
                        New Notification
                      </span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#EB8055" }}></span>
                    </div>
                    <p className="text-xs font-bold truncate mt-0.5" style={{ color: "#2F2925" }}>
                      {popupNotification.title}
                    </p>
                    <p className="text-[11px] line-clamp-2 mt-0.5 leading-relaxed" style={{ color: "#5A4A3A" }}>
                      {popupNotification.message}
                    </p>
                    <p className="text-[10px] font-semibold mt-1.5 flex items-center gap-1" style={{ color: "#8B7355" }}>
                      <span>Click to view in panel</span>
                      <span>→</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupNotification(null);
                    }}
                    className="text-[#8B7355] hover:text-[#2F2925] p-1 rounded-md hover:bg-[#FDF0DC] transition-colors cursor-pointer shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="w-px h-6 bg-[#E8D8C4] hidden sm:block"></div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl transition-colors cursor-pointer hover:bg-[#FDF0DC]/60"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-2xs shrink-0"
                  style={{ background: "#EB8055" }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "R"}
                </div>
                <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
                  <p className="text-xs font-bold leading-tight truncate" style={{ color: "#2F2925" }}>
                    {user?.name || "Rahul Sharma"}
                  </p>
                  <p className="text-[10px] font-medium leading-tight truncate text-[#8B7355]">
                    {user?.role === "Student" ? "Student" : user?.role || "Student"}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8B7355] hidden sm:block" />
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
        <main className="p-4 md:p-6 lg:p-7 min-h-[calc(100vh-56px)]" style={{ background: "#FAF4EC" }}>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}