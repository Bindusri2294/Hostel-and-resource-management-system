import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/Dashboard";
import StudentDashboard from "./student/Dashboard";

export default function HomeDashboard() {
  const { user } = useAuth();
  return user?.role === "Admin" ? <AdminDashboard /> : <StudentDashboard />;
}
