import React, { useEffect, useState } from 'react'
import { paymentService } from '../../services/api'
import { FiSearch, FiDollarSign, FiFilter } from 'react-icons/fi'
import { format } from 'date-fns'

const MODE_BADGE = {
  CASH: 'bg-green-100 text-green-700',
  UPI: 'bg-purple-100 text-purple-700',
  BANK_TRANSFER: 'bg-blue-100 text-blue-700',
  ONLINE: 'bg-teal-100 text-teal-700',
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState('ALL')

  useEffect(() => {
    Promise.all([paymentService.getAll(), paymentService.getSummary()])
      .then(([p, s]) => { setPayments(p.data); setSummary(s.data) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = payments.filter(p => {
    const matchSearch = p.guestName?.toLowerCase().includes(search.toLowerCase())
    const matchMode = modeFilter === 'ALL' || p.mode === modeFilter
    return matchSearch && matchMode
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track all payment transactions</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><FiDollarSign className="text-white"/></div>
              <div>
                <p className="text-sm text-emerald-600 font-medium">Total Collected</p>
                <p className="text-2xl font-bold text-emerald-700">₹{summary.totalCollected?.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card bg-red-50 border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center"><FiDollarSign className="text-white"/></div>
              <div>
                <p className="text-sm text-red-600 font-medium">Total Pending Dues</p>
                <p className="text-2xl font-bold text-red-700">₹{summary.totalDue?.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card bg-amber-50 border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center"><FiDollarSign className="text-white"/></div>
              <div>
                <p className="text-sm text-amber-600 font-medium">Advance to Return</p>
                <p className="text-2xl font-bold text-amber-700">₹{summary.totalAdvanceToReturn?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="input-field pl-9 w-64" placeholder="Search by guest name..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {['ALL','CASH','UPI','BANK_TRANSFER','ONLINE'].map(m=>(
          <button key={m} onClick={()=>setModeFilter(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${modeFilter===m?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
            {m === 'ALL' ? 'All Modes' : m.replace('_',' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"/></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Guest','Bed','Amount','Mode','Date','Note'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">{p.guestName?.[0]?.toUpperCase()}</div>
                        <span className="font-medium text-gray-900">{p.guestName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{p.bedId || '—'}</span></td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`badge ${MODE_BADGE[p.mode] || 'bg-gray-100 text-gray-600'}`}>{p.mode?.replace('_',' ')}</span></td>
                    <td className="px-4 py-3 text-gray-500">{p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy, h:mm a') : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-16 text-gray-400">No payments found</div>}
          </div>
        </div>
      )}
    </div>
  )
}
