import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/User/Login'
import Dashboard from './pages/User/Dashboard'
import Profile from './pages/User/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      <Route path="/" element={<Navigate to="/admin/analytics" replace />} />
    </Routes>
  )
}

export default App