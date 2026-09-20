import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import HomeDashboard from "./pages/HomeDashboard";
import Students from "./pages/Students";
import Rooms from "./pages/Rooms";
import Allocations from "./pages/Allocations";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import MyAllocation from "./pages/MyAllocation";
import HostelInfo from "./pages/HostelInfo";
import Attendance from "./pages/Attendance";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

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
          <Route path="my-allocation" element={<MyAllocation />} />
          <Route path="hostel-info" element={<HostelInfo />} />
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