import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Rooms from "./pages/Rooms";
import Allocations from "./pages/Allocations";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";

export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="feedback" element={<Feedback />} />
    </Route></Route>
    <Route element={<ProtectedRoute roles={["Admin"]} />}><Route element={<Layout />}>
      <Route path="students" element={<Students />} /><Route path="rooms" element={<Rooms />} /><Route path="allocations" element={<Allocations />} />
    </Route></Route>
    <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
  </Routes>;
}
