import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { paymentService, guestService } from '../../services/api'
import { format } from 'date-fns'

const MODE_BADGE = {
  CASH: 'bg-green-100 text-green-700',
  UPI: 'bg-purple-100 text-purple-700',
  BANK_TRANSFER: 'bg-blue-100 text-blue-700',
  ONLINE: 'bg-teal-100 text-teal-700',
}

export default function UserPayments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [guestInfo, setGuestInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      paymentService.getAll({ userId: user?.id }),
      guestService.getAll({ userId: user?.id })
    ]).then(([p, g]) => {
      setPayments(p.data)
      const active = g.data.find(gu => gu.status === 'ACTIVE' || gu.status === 'DAILY')
      setGuestInfo(active || g.data[0] || null)
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600"/></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your complete payment history</p>
      </div>

      {guestInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-gray-50">
            <p className="text-xs text-gray-500 font-medium">Total Rent</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">₹{guestInfo.totalRent?.toLocaleString()}</p>
          </div>
          <div className="card bg-emerald-50">
            <p className="text-xs text-emerald-600 font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">₹{guestInfo.totalPaid?.toLocaleString()}</p>
          </div>
          {guestInfo.remainingDue > 0 ? (
            <div className="card bg-red-50">
              <p className="text-xs text-red-600 font-medium">Remaining Due</p>
              <p className="text-2xl font-bold text-red-700 mt-1">₹{guestInfo.remainingDue?.toLocaleString()}</p>
            </div>
          ) : guestInfo.advanceToReturn > 0 ? (
            <div className="card bg-amber-50">
              <p className="text-xs text-amber-600 font-medium">Advance to Return</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">₹{guestInfo.advanceToReturn?.toLocaleString()}</p>
            </div>
          ) : (
            <div className="card bg-emerald-50">
              <p className="text-xs text-emerald-600 font-medium">Balance</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">Settled ✓</p>
            </div>
          )}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Amount','Mode','Date','Note'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-emerald-600">₹{p.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`badge ${MODE_BADGE[p.mode]||'bg-gray-100 text-gray-600'}`}>{p.mode?.replace('_',' ')}</span></td>
                  <td className="px-4 py-3 text-gray-500">{p.createdAt ? format(new Date(p.createdAt),'dd MMM yyyy, h:mm a') : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.note||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <div className="text-center py-16 text-gray-400">No payment records found</div>}
        </div>
      </div>
    </div>
  )
}
