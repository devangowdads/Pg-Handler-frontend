// UserDashboard.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { guestService, paymentService } from '../../services/api'
import { FiHome, FiCalendar, FiDollarSign, FiClock } from 'react-icons/fi'
import { format } from 'date-fns'

export default function UserDashboard() {
  const { user } = useAuth()
  const [guestInfo, setGuestInfo] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      guestService.getAll({ userId: user?.id }),
      paymentService.getAll({ userId: user?.id })
    ]).then(([g, p]) => {
      const active = g.data.find(gu => gu.status === 'ACTIVE' || gu.status === 'DAILY')
      setGuestInfo(active || g.data[0] || null)
      setPayments(p.data.slice(0, 5))
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your stay overview</p>
      </div>

      {guestInfo ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center"><FiHome className="text-accent-600"/></div>
              <div>
                <p className="text-xs text-gray-500">Bed</p>
                <p className="font-bold text-gray-900 font-mono">{guestInfo.bedId || '—'}</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><FiCalendar className="text-blue-600"/></div>
              <div>
                <p className="text-xs text-gray-500">Check-in</p>
                <p className="font-bold text-gray-900">{guestInfo.checkIn ? format(new Date(guestInfo.checkIn), 'dd MMM yyyy') : '—'}</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><FiDollarSign className="text-emerald-600"/></div>
              <div>
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="font-bold text-emerald-700">₹{guestInfo.totalPaid?.toLocaleString()}</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${guestInfo.remainingDue > 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <FiDollarSign className={guestInfo.remainingDue > 0 ? 'text-red-600' : 'text-emerald-600'}/>
              </div>
              <div>
                <p className="text-xs text-gray-500">{guestInfo.remainingDue > 0 ? 'Remaining Due' : guestInfo.advanceToReturn > 0 ? 'Advance to Return' : 'Balance'}</p>
                <p className={`font-bold ${guestInfo.remainingDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {guestInfo.remainingDue > 0 ? `₹${guestInfo.remainingDue?.toLocaleString()}` : guestInfo.advanceToReturn > 0 ? `₹${guestInfo.advanceToReturn?.toLocaleString()}` : 'Settled ✓'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Stay Details</h3>
              <div className="space-y-3 text-sm">
                {[['Name', guestInfo.name],['Room', guestInfo.roomName || '—'],['Bed ID', guestInfo.bedId || '—'],['Guest Type', guestInfo.guestType],['Monthly Rent', `₹${guestInfo.monthlyRent?.toLocaleString()}`],['Total Rent', `₹${guestInfo.totalRent?.toLocaleString()}`]].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Payments</h3>
              {payments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No payments yet</p>
              ) : (
                <div className="space-y-3">
                  {payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">₹{p.amount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{p.mode?.replace('_',' ')} · {p.createdAt ? format(new Date(p.createdAt),'dd MMM yyyy') : ''}</p>
                      </div>
                      <span className="badge bg-emerald-100 text-emerald-700">Paid</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">No active stay found.</p>
          <p className="text-gray-300 text-sm mt-1">Please contact the administrator.</p>
        </div>
      )}
    </div>
  )
}
