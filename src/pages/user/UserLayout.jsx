import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiHome, FiGrid, FiCreditCard, FiLogOut, FiMenu, FiX, FiChevronRight } from 'react-icons/fi'

const navItems = [
  { to: '/user/dashboard', icon: FiHome, label: 'My Dashboard' },
  { to: '/user/rooms', icon: FiGrid, label: 'Room View' },
  { to: '/user/payments', icon: FiCreditCard, label: 'My Payments' },
]

export default function UserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <FiHome className="text-white text-lg"/>
          </div>
          <div>
            <p className="text-white font-bold text-base">PG Manager</p>
            <p className="text-accent-300 text-xs">Guest Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-white text-accent-700 shadow-sm' : 'text-accent-100 hover:bg-white/10 hover:text-white'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon className={`text-lg ${isActive ? 'text-accent-600' : ''}`}/>
                <span className="flex-1">{label}</span>
                {isActive && <FiChevronRight className="text-accent-400 text-sm"/>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-accent-300 text-xs">Guest</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm text-accent-200 hover:bg-white/10 hover:text-white transition-all">
          <FiLogOut/> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden lg:flex w-64 flex-col bg-gradient-to-b from-accent-600 to-accent-900 flex-shrink-0">
        <Sidebar/>
      </aside>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}/>
          <aside className="relative w-72 h-full bg-gradient-to-b from-accent-600 to-accent-900 flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white"><FiX size={20}/></button>
            <Sidebar/>
          </aside>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500"><FiMenu size={22}/></button>
          <p className="font-semibold text-gray-800">PG Manager</p>
          <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</div>
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet/></main>
      </div>
    </div>
  )
}
