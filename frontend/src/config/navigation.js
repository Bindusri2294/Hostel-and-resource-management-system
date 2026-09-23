import {
    LayoutDashboard,
    Users,
    Building2,
    ClipboardList,
    MessageSquare,
    ClipboardCheck,
    BarChart3,
    Settings,
    User,
    Home,
} from "lucide-react";

export const adminNavItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Students", icon: Users, path: "/students" },
    { label: "Rooms", icon: Building2, path: "/rooms" },
    { label: "Allocations", icon: ClipboardList, path: "/allocations" },
    { label: "Feedback", icon: MessageSquare, path: "/feedback" },
    { label: "Attendance", icon: ClipboardCheck, path: "/attendance" },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
    { label: "Settings", icon: Settings, path: "/settings" },
];

export const studentNavItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "My Allocation", icon: ClipboardList, path: "/my-allocation" },
    { label: "Hostel Info", icon: Home, path: "/hostel-info" },
    { label: "Feedback", icon: MessageSquare, path: "/feedback" },
    { label: "Room Info", icon: Building2, path: "/room-info" },
    { label: "Profile", icon: User, path: "/profile" },
];