import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginView from './components/auth/LoginView';
import ProtectedRoute from './components/auth/ProtectedRoute';
import StudentFeedbackDashboard from './components/feedback/StudentFeedbackDashboard';
import AdminFeedbackDashboard from './components/feedback/AdminFeedbackDashboard';
import Dashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-slate-400">Loading Portal Session...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === 'Admin' ? '/admin' : '/student'} replace />
          ) : (
            <LoginView />
          )
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="Student">
            <StudentFeedbackDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="Admin">
            <AdminFeedbackDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'Admin' ? '/admin' : '/student'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}