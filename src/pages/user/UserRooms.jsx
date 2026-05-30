import React, { useEffect, useState } from 'react'
import { roomService } from '../../services/api'
import { FiRefreshCw } from 'react-icons/fi'
import { format } from 'date-fns'

const STATUS_STYLES = {
  AVAILABLE: 'bg-emerald-50 border-emerald-300 text-emerald-700',
  OCCUPIED:  'bg-red-50 border-red-300 text-red-700',
  RESERVED:  'bg-amber-50 border-amber-300 text-amber-700',
  MAINTENANCE:'bg-gray-100 border-gray-300 text-gray-500',
}

export default function UserRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const load = () => {
    setLoading(true)
    roomService.getAvailability().then(r => setRooms(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const types = ['ALL','SINGLE','2_SHARING','3_SHARING','4_SHARING']
  const labelMap = { ALL:'All', SINGLE:'Single', '2_SHARING':'2 Sharing', '3_SHARING':'3 Sharing', '4_SHARING':'4 Sharing' }
  const filtered = filter === 'ALL' ? rooms : rooms.filter(r => r.type === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Availability</h1>
          <p className="text-sm text-gray-500 mt-0.5">Hover on beds to see details</p>
        </div>
        <button onClick={load} className="btn-secondary"><FiRefreshCw size={15}/> Refresh</button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {[['bg-emerald-400','Available'],['bg-red-400','Occupied'],['bg-amber-400','Reserved'],['bg-gray-400','Maintenance']].map(([dot,label]) => (
          <div key={label} className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className={`w-3 h-3 rounded-full ${dot}`}/>{label}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${filter===t?'bg-accent-600 text-white border-accent-600':'bg-white text-gray-600 border-gray-200 hover:border-accent-300'}`}>
            {labelMap[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600"/></div>
      ) : (
        <div className="space-y-5">
          {filtered.map(room => (
            <div key={room.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">{room.roomNumber} — {room.name}</h3>
                  <p className="text-sm text-gray-500">Floor {room.floor} · {labelMap[room.type] || room.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Occupancy</p>
                  <p className="font-bold">{room.beds?.filter(b=>b.status==='OCCUPIED').length}/{room.beds?.length}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {room.beds?.map(bed => (
                  <div key={bed.id} className={`relative border-2 rounded-xl p-3 cursor-default bed-card ${STATUS_STYLES[bed.status]}`}>
                    <p className="text-xs font-bold">{bed.bedId}</p>
                    <p className="text-xs mt-0.5">{bed.status === 'OCCUPIED' && bed.currentGuest ? 'Occupied' : bed.status.charAt(0)+bed.status.slice(1).toLowerCase()}</p>
                    {bed.status === 'OCCUPIED' && bed.currentGuest && (
                      <div className="bed-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-gray-900 text-white rounded-xl shadow-2xl p-3 w-52 pointer-events-none">
                        <p className="font-semibold text-sm mb-1">{bed.currentGuest.name}</p>
                        <p className="text-gray-400 text-xs">{bed.currentGuest.checkIn ? format(new Date(bed.currentGuest.checkIn),'dd MMM yy') : ''} → {bed.currentGuest.checkOut ? format(new Date(bed.currentGuest.checkOut),'dd MMM yy') : 'Open'}</p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="card text-center py-16 text-gray-400">No rooms found</div>}
        </div>
      )}
    </div>
  )
}
