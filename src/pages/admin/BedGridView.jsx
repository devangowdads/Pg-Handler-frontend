import React, { useEffect, useState } from 'react'
import { roomService } from '../../services/api'
import { FiRefreshCw, FiGrid } from 'react-icons/fi'
import { format } from 'date-fns'

const STATUS_STYLES = {
  AVAILABLE: 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100',
  OCCUPIED:  'bg-red-50   border-red-300   text-red-700   hover:bg-red-100',
  RESERVED:  'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100',
  MAINTENANCE:'bg-gray-100 border-gray-300 text-gray-500',
}

const STATUS_DOT = {
  AVAILABLE: 'bg-emerald-400',
  OCCUPIED:  'bg-red-400',
  RESERVED:  'bg-amber-400',
  MAINTENANCE:'bg-gray-400',
}

const TYPE_COLORS = {
  'SINGLE':    { bg: 'bg-violet-50',  border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  '2_SHARING': { bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700' },
  '3_SHARING': { bg: 'bg-teal-50',    border: 'border-teal-200',   badge: 'bg-teal-100 text-teal-700' },
  '4_SHARING': { bg: 'bg-orange-50',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
}

const BED = ({ bed }) => {
  const style = STATUS_STYLES[bed.status] || STATUS_STYLES.AVAILABLE
  const guest = bed.currentGuest

  return (
    <div className="relative group bed-card">
      <div className={`relative border-2 rounded-xl p-3 cursor-default transition-all duration-200 ${style}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold">{bed.bedId}</span>
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[bed.status]}`} />
        </div>
        <p className="text-xs font-medium truncate">{bed.status === 'OCCUPIED' && guest ? guest.name : bed.status.charAt(0) + bed.status.slice(1).toLowerCase()}</p>
        {bed.status === 'OCCUPIED' && guest && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
            {format(new Date(guest.checkIn), 'dd MMM')} → {guest.checkOut ? format(new Date(guest.checkOut), 'dd MMM') : 'Open'}
          </p>
        )}
      </div>

      {/* Tooltip on hover */}
      {bed.status === 'OCCUPIED' && guest && (
        <div className="bed-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-gray-900 text-white rounded-xl shadow-2xl p-4 w-64 pointer-events-none">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
              {guest.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{guest.name}</p>
              <p className="text-gray-400 text-xs">{guest.phone}</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Check-in</span>
              <span>{format(new Date(guest.checkIn), 'dd MMM yyyy')}</span>
            </div>
            {guest.checkOut && (
              <div className="flex justify-between">
                <span className="text-gray-400">Check-out</span>
                <span>{format(new Date(guest.checkOut), 'dd MMM yyyy')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Total Rent</span>
              <span>₹{guest.totalRent?.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-700 pt-1.5 mt-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Paid</span>
                <span className="text-emerald-400">₹{guest.totalPaid?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Remaining</span>
                <span className={guest.remainingDue > 0 ? 'text-red-400' : 'text-emerald-400'}>
                  ₹{guest.remainingDue?.toLocaleString()}
                </span>
              </div>
              {guest.advanceToReturn > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Advance to return</span>
                  <span className="text-amber-400">₹{guest.advanceToReturn?.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

export default function BedGridView() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const load = () => {
    setLoading(true)
    roomService.getAvailability().then(res => setRooms(res.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const types = ['ALL', 'SINGLE', '2_SHARING', '3_SHARING', '4_SHARING']
  const filtered = filter === 'ALL' ? rooms : rooms.filter(r => r.type === filter)

  const labelMap = { 'ALL': 'All Rooms', 'SINGLE': 'Single', '2_SHARING': '2 Sharing', '3_SHARING': '3 Sharing', '4_SHARING': '4 Sharing' }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FiGrid className="text-primary-600" /> Bed Grid View</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hover over occupied beds to see guest details</p>
        </div>
        <button onClick={load} className="btn-secondary"><FiRefreshCw size={15} /> Refresh</button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center">
        {[['AVAILABLE','bg-emerald-400','Available'],['OCCUPIED','bg-red-400','Occupied'],['RESERVED','bg-amber-400','Reserved'],['MAINTENANCE','bg-gray-400','Maintenance']].map(([,dot,label]) => (
          <div key={label} className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className={`w-3 h-3 rounded-full ${dot}`} />{label}
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              filter === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            }`}>
            {labelMap[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No rooms found</div>
      ) : (
        <div className="space-y-6">
          {filtered.map(room => {
            const tc = TYPE_COLORS[room.type] || TYPE_COLORS['2_SHARING']
            return (
              <div key={room.id} className={`rounded-2xl border-2 p-5 ${tc.bg} ${tc.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{room.roomNumber} — {room.name}</h3>
                      <p className="text-sm text-gray-500">Floor {room.floor} · {room.beds?.length || 0} beds</p>
                    </div>
                    <span className={`badge ${tc.badge}`}>{labelMap[room.type]}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Occupancy</p>
                    <p className="font-bold text-gray-800">
                      {room.beds?.filter(b => b.status === 'OCCUPIED').length}/{room.beds?.length}
                    </p>
                  </div>
                </div>

                {/* Bed grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {room.beds?.map(bed => <BED key={bed.id} bed={bed} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
