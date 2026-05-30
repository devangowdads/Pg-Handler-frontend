import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiHome, FiGrid, FiUsers, FiCreditCard, FiBook,
  FiLogOut, FiMenu, FiX, FiUser, FiChevronRight, FiLayers
} from 'react-icons/fi'

const navItems = [
  { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/admin/bed-grid', icon: FiGrid, label: 'Bed Grid View' },
  { to: '/admin/rooms', icon: FiLayers, label: 'Rooms & Beds' },
  { to: '/admin/guests', icon: FiUsers, label: 'Guests' },
  { to: '/admin/payments', icon: FiCreditCard, label: 'Payments' },
  { to: '/admin/catalogue', icon: FiBook, label: 'Catalogue' },
  { to: '/admin/users', icon: FiUser, label: 'Users' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <FiHome className="text-white text-lg" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">PG Manager</p>
            <p className="text-primary-300 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-primary-100 hover:bg-white/10 hover:text-white'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon className={`text-lg flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                <span className="flex-1">{label}</span>
                {isActive && <FiChevronRight className="text-primary-400 text-sm" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-primary-300 text-xs">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm text-primary-200 hover:bg-white/10 hover:text-white transition-all duration-200">
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-gradient-to-b from-primary-700 to-primary-900 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full bg-gradient-to-b from-primary-700 to-primary-900 flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white"><FiX size={20} /></button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700"><FiMenu size={22} /></button>
          <p className="font-semibold text-gray-800">PG Manager</p>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
