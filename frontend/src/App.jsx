import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Shared / Root pages
import Login from "./pages/Login";
import HomeDashboard from "./pages/HomeDashboard";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";

// Student pages
import MyAttendance from "./pages/student/MyAttendance";
import MyAllocation from "./pages/student/MyAllocation";
import RoomInfo from "./pages/student/RoomInfo";
import HostelInfo from "./pages/student/HostelInfo";

// Admin pages
import Students from "./pages/admin/Students";
import Rooms from "./pages/admin/Rooms";
import Allocations from "./pages/admin/Allocations";
import Attendance from "./pages/admin/Attendance";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      {/* Protected routes accessible to all authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<HomeDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="room-info" element={<RoomInfo />} />
          <Route path="my-allocation" element={<MyAllocation />} />
          <Route path="hostel-info" element={<HostelInfo />} />
          <Route path="my-attendance" element={<MyAttendance />} />
        </Route>
      </Route>

      {/* Admin-only protected routes */}
      <Route element={<ProtectedRoute roles={["Admin"]} />}>
        <Route element={<Layout />}>
          <Route path="students" element={<Students />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="allocations" element={<Allocations />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}