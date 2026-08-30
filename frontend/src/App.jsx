import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './components/auth/LoginView';
import StudentFeedbackDashboard from './components/feedback/StudentFeedbackDashboard';
import AdminFeedbackDashboard from './components/feedback/AdminFeedbackDashboard';
import { Toaster } from 'sonner';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-slate-400">Loading Portal Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Secure Role-Based View Rendering based directly on authenticated user role
  if (user.role === 'Admin') {
    return <AdminFeedbackDashboard />;
  }

  return <StudentFeedbackDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors theme="dark" />
      <AppContent />
    </AuthProvider>
  );
}
