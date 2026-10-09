import { useAuth } from "../../context/AuthContext";
import AdminFeedbackDashboard from "../../components/feedback/AdminFeedbackDashboard";
import StudentFeedbackDashboard from "../../components/feedback/StudentFeedbackDashboard";

export default function Feedback() {
  const { user } = useAuth();

  return user?.role === "Admin" ? <AdminFeedbackDashboard /> : <StudentFeedbackDashboard />;
}
