import React, { useEffect, useState } from 'react'
import { dashboardService, paymentService } from '../../services/api'
import { FiUsers, FiLayers, FiDollarSign, FiAlertCircle, FiTrendingUp, FiHome } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="text-white text-xl" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [paymentSummary, setPaymentSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      paymentService.getSummary()
    ]).then(([s, p]) => {
      setStats(s.data)
      setPaymentSummary(p.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  )

  const occupancyData = stats?.roomTypeStats?.map(r => ({
    name: r.type, Occupied: r.occupied, Available: r.available
  })) || []

  const paymentModeData = paymentSummary?.byMode?.map(m => ({
    name: m.mode, value: m.amount
  })) || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">PG activities overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Total Guests" value={stats?.totalGuests ?? 0} sub={`${stats?.activeGuests ?? 0} currently staying`} color="bg-primary-500" />
        <StatCard icon={FiHome} label="Total Beds" value={stats?.totalBeds ?? 0} sub={`${stats?.occupiedBeds ?? 0} occupied`} color="bg-emerald-500" />
        <StatCard icon={FiDollarSign} label="Total Collected" value={`₹${(paymentSummary?.totalCollected ?? 0).toLocaleString()}`} sub="This month" color="bg-violet-500" />
        <StatCard icon={FiAlertCircle} label="Pending Dues" value={`₹${(paymentSummary?.totalDue ?? 0).toLocaleString()}`} sub="Across all guests" color="bg-amber-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiTrendingUp className="text-primary-500" /> Room Occupancy by Type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={occupancyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="Occupied" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Available" fill="#bae6fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiDollarSign className="text-violet-500" /> Payment by Mode</h3>
          {paymentModeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={paymentModeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {paymentModeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} contentStyle={{ borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No payment data yet</div>
          )}
        </div>
      </div>

      {/* Payment summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-emerald-50 border-emerald-100">
          <p className="text-sm text-emerald-600 font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">₹{(paymentSummary?.totalCollected ?? 0).toLocaleString()}</p>
        </div>
        <div className="card bg-amber-50 border-amber-100">
          <p className="text-sm text-amber-600 font-medium">Pending Dues</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">₹{(paymentSummary?.totalDue ?? 0).toLocaleString()}</p>
        </div>
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Advance to Return</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">₹{(paymentSummary?.totalAdvanceToReturn ?? 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
