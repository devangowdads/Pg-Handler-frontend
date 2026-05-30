import React, { useEffect, useState } from 'react'
import { roomService, bedService } from '../../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import toast from 'react-hot-toast'

const TYPES = ['SINGLE','2_SHARING','3_SHARING','4_SHARING']
const TYPE_LABELS = { SINGLE:'Single', '2_SHARING':'2 Sharing', '3_SHARING':'3 Sharing', '4_SHARING':'4 Sharing' }
const BED_STATUSES = ['AVAILABLE','OCCUPIED','RESERVED','MAINTENANCE']
const STATUS_BADGE = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  OCCUPIED:  'bg-red-100 text-red-700',
  RESERVED:  'bg-amber-100 text-amber-700',
  MAINTENANCE:'bg-gray-100 text-gray-600',
}

const Modal = ({ title, onClose, onSubmit, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="p-6 space-y-4">{children}</div>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
)

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showBedModal, setShowBedModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [editingBed, setEditingBed] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [roomForm, setRoomForm] = useState({ roomNumber: '', name: '', floor: '', type: 'SINGLE', description: '' })
  const [bedForm, setBedForm] = useState({ bedId: '', status: 'AVAILABLE' })

  const load = () => {
    setLoading(true)
    roomService.getAll().then(r => setRooms(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openRoomModal = (room = null) => {
    setEditingRoom(room)
    setRoomForm(room ? { roomNumber: room.roomNumber, name: room.name, floor: room.floor, type: room.type, description: room.description || '' } : { roomNumber: '', name: '', floor: '', type: 'SINGLE', description: '' })
    setShowRoomModal(true)
  }

  const openBedModal = (room, bed = null) => {
    setSelectedRoom(room)
    setEditingBed(bed)
    setBedForm(bed ? { bedId: bed.bedId, status: bed.status } : { bedId: '', status: 'AVAILABLE' })
    setShowBedModal(true)
  }

  const submitRoom = async (e) => {
    e.preventDefault()
    try {
      if (editingRoom) await roomService.update(editingRoom.id, roomForm)
      else await roomService.create(roomForm)
      toast.success(`Room ${editingRoom ? 'updated' : 'created'} successfully`)
      setShowRoomModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving room') }
  }

  const submitBed = async (e) => {
    e.preventDefault()
    try {
      const data = { ...bedForm, roomId: selectedRoom.id }
      if (editingBed) await bedService.update(editingBed.id, data)
      else await bedService.create(data)
      toast.success(`Bed ${editingBed ? 'updated' : 'added'} successfully`)
      setShowBedModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving bed') }
  }

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return
    try { await roomService.delete(id); toast.success('Room deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete room') }
  }

  const deleteBed = async (id) => {
    if (!window.confirm('Delete this bed?')) return
    try { await bedService.delete(id); toast.success('Bed deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete bed') }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms & Beds</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all rooms and their beds</p>
        </div>
        <button onClick={() => openRoomModal()} className="btn-primary"><FiPlus /> Add Room</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="space-y-4">
          {rooms.map(room => (
            <div key={room.id} className="card p-0 overflow-hidden">
              {/* Room header */}
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(e => ({ ...e, [room.id]: !e[room.id] }))}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {room.roomNumber}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{room.name}</p>
                    <p className="text-sm text-gray-500">Floor {room.floor} · {TYPE_LABELS[room.type]} · {room.beds?.length || 0} beds</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 hidden sm:block">
                    {room.beds?.filter(b=>b.status==='OCCUPIED').length}/{room.beds?.length} occupied
                  </span>
                  <button onClick={(e)=>{e.stopPropagation();openRoomModal(room)}} className="p-2 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors"><FiEdit2 size={15}/></button>
                  <button onClick={(e)=>{e.stopPropagation();deleteRoom(room.id)}} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><FiTrash2 size={15}/></button>
                  {expanded[room.id] ? <FiChevronUp className="text-gray-400"/> : <FiChevronDown className="text-gray-400"/>}
                </div>
              </div>

              {/* Beds */}
              {expanded[room.id] && (
                <div className="border-t border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Beds in this room</p>
                    <button onClick={() => openBedModal(room)} className="btn-secondary py-1.5 text-xs"><FiPlus size={13}/> Add Bed</button>
                  </div>
                  {room.beds?.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No beds added yet</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                      {room.beds?.map(bed => (
                        <div key={bed.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50 group relative">
                          <p className="font-bold text-gray-800 text-sm">{bed.bedId}</p>
                          <span className={`badge mt-1 ${STATUS_BADGE[bed.status]}`}>{bed.status}</span>
                          <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                            <button onClick={()=>openBedModal(room,bed)} className="p-1 bg-white rounded-lg shadow text-primary-600 hover:bg-primary-50"><FiEdit2 size={11}/></button>
                            <button onClick={()=>deleteBed(bed.id)} className="p-1 bg-white rounded-lg shadow text-red-500 hover:bg-red-50"><FiTrash2 size={11}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {rooms.length === 0 && <div className="card text-center py-16 text-gray-400">No rooms added yet. Click "Add Room" to start.</div>}
        </div>
      )}

      {showRoomModal && (
        <Modal title={editingRoom ? 'Edit Room' : 'Add Room'} onClose={() => setShowRoomModal(false)} onSubmit={submitRoom}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Room Number *</label>
              <input className="input-field" placeholder="e.g. 101" value={roomForm.roomNumber} onChange={e=>setRoomForm({...roomForm, roomNumber:e.target.value})} required />
            </div>
            <div>
              <label className="label">Floor *</label>
              <input className="input-field" type="number" placeholder="e.g. 1" value={roomForm.floor} onChange={e=>setRoomForm({...roomForm, floor:e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="label">Room Name *</label>
            <input className="input-field" placeholder="e.g. Room A" value={roomForm.name} onChange={e=>setRoomForm({...roomForm, name:e.target.value})} required />
          </div>
          <div>
            <label className="label">Type *</label>
            <select className="input-field" value={roomForm.type} onChange={e=>setRoomForm({...roomForm, type:e.target.value})}>
              {TYPES.map(t=><option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" rows={2} placeholder="Optional notes about this room" value={roomForm.description} onChange={e=>setRoomForm({...roomForm, description:e.target.value})} />
          </div>
        </Modal>
      )}

      {showBedModal && (
        <Modal title={editingBed ? 'Edit Bed' : `Add Bed to ${selectedRoom?.name}`} onClose={() => setShowBedModal(false)} onSubmit={submitBed}>
          <div>
            <label className="label">Bed ID *</label>
            <input className="input-field" placeholder="e.g. A1, B2, 101-1" value={bedForm.bedId} onChange={e=>setBedForm({...bedForm, bedId:e.target.value})} required />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={bedForm.status} onChange={e=>setBedForm({...bedForm, status:e.target.value})}>
              {BED_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  )
}
