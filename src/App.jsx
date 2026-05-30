import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './pages/auth/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRooms from './pages/admin/AdminRooms'
import AdminGuests from './pages/admin/AdminGuests'
import AdminPayments from './pages/admin/AdminPayments'
import AdminCatalogue from './pages/admin/AdminCatalogue'
import AdminUsers from './pages/admin/AdminUsers'
import BedGridView from './pages/admin/BedGridView'

import UserLayout from './pages/user/UserLayout'
import UserDashboard from './pages/user/UserDashboard'
import UserRooms from './pages/user/UserRooms'
import UserPayments from './pages/user/UserPayments'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/user/dashboard" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} /> : <LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="bed-grid" element={<BedGridView />} />
        <Route path="guests" element={<AdminGuests />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="catalogue" element={<AdminCatalogue />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
      <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="rooms" element={<UserRooms />} />
        <Route path="payments" element={<UserPayments />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          className: 'font-sans text-sm',
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
      </BrowserRouter>
    </AuthProvider>
  )
}
