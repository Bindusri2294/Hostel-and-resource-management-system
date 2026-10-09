import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9EFDE] flex items-center justify-center text-[#2F2925]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#EB8055] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-[#8B7355]">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect user to their appropriate role home dashboard if trying to access unauthorized route
    return <Navigate to={user.role === 'Admin' ? '/admin' : '/student'} replace />;
  }

  return children;
}
