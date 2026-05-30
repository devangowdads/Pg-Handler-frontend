import React, { useEffect, useState } from 'react'
import { guestService, bedService, roomService, paymentService } from '../../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiPhone, FiCalendar, FiDollarSign, FiX, FiLogOut } from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  ACTIVE:   'bg-green-100 text-green-700',
  CHECKED_OUT:'bg-gray-100 text-gray-600',
  DAILY:    'bg-blue-100 text-blue-700',
}

const PAYMENT_MODES = ['CASH','UPI','BANK_TRANSFER','ONLINE']

export default function AdminGuests() {
  const [guests, setGuests] = useState([])
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [payGuest, setPayGuest] = useState(null)
  const [payForm, setPayForm] = useState({ amount: '', mode: 'CASH', note: '' })

  const initForm = {
    name: '', phone: '', email: '', idProof: '', idNumber: '',
    roomId: '', bedId: '', checkIn: new Date(), checkOut: null,
    checkInMode: 'datepicker', duration: '',
    monthlyRent: '', advancePaid: '', totalRent: '', guestType: 'MONTHLY',
    emergencyContact: '', address: ''
  }
  const [form, setForm] = useState(initForm)

  const load = () => {
    setLoading(true)
    Promise.all([guestService.getAll(), roomService.getAll()])
      .then(([g, r]) => { setGuests(g.data); setRooms(r.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const onRoomChange = async (roomId) => {
    setForm(f => ({ ...f, roomId, bedId: '' }))
    if (roomId) {
      const res = await bedService.getByRoom(roomId)
      setBeds(res.data.filter(b => b.status === 'AVAILABLE' || (editing && b.currentGuest?.id === editing.id)))
    } else setBeds([])
  }

  const openModal = (guest = null) => {
    setEditing(guest)
    if (guest) {
      setForm({
        name: guest.name, phone: guest.phone, email: guest.email || '',
        idProof: guest.idProof || '', idNumber: guest.idNumber || '',
        roomId: guest.roomId || '', bedId: guest.bedId || '',
        checkIn: new Date(guest.checkIn), checkOut: guest.checkOut ? new Date(guest.checkOut) : null,
        checkInMode: 'datepicker', duration: '',
        monthlyRent: guest.monthlyRent || '', advancePaid: guest.advancePaid || '',
        totalRent: guest.totalRent || '', guestType: guest.guestType || 'MONTHLY',
        emergencyContact: guest.emergencyContact || '', address: guest.address || ''
      })
      if (guest.roomId) onRoomChange(guest.roomId)
    } else {
      setForm(initForm); setBeds([])
    }
    setShowModal(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        checkIn: form.checkIn?.toISOString(),
        checkOut: form.checkOut?.toISOString() || null,
      }
      if (editing) await guestService.update(editing.id, payload)
      else await guestService.create(payload)
      toast.success(`Guest ${editing ? 'updated' : 'added'} successfully`)
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving guest') }
  }

  const checkout = async (id) => {
    if (!window.confirm('Mark this guest as checked out?')) return
    try { await guestService.checkout(id); toast.success('Guest checked out'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const deleteGuest = async (id) => {
    if (!window.confirm('Delete this guest record?')) return
    try { await guestService.delete(id); toast.success('Guest deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const openPayModal = (guest) => {
    setPayGuest(guest); setPayForm({ amount: '', mode: 'CASH', note: '' }); setShowPayModal(true)
  }

  const submitPayment = async (e) => {
    e.preventDefault()
    try {
      await paymentService.create({ ...payForm, guestId: payGuest.id, amount: Number(payForm.amount) })
      toast.success('Payment recorded'); setShowPayModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const filtered = guests.filter(g => {
    const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase()) || g.phone?.includes(search)
    const matchStatus = statusFilter === 'ALL' || g.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all PG residents</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary"><FiPlus /> Add Guest</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-9 w-64" placeholder="Search by name or phone..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {['ALL','ACTIVE','DAILY','CHECKED_OUT'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${statusFilter===s?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
            {s === 'ALL' ? 'All' : s.replace('_',' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"/></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Guest','Contact','Bed','Check-in','Check-out','Rent','Paid','Due','Status','Actions'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">{g.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <p className="font-medium text-gray-900">{g.name}</p>
                          <p className="text-xs text-gray-400">{g.guestType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{g.phone}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{g.bedId || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{g.checkIn ? format(new Date(g.checkIn), 'dd MMM yy') : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{g.checkOut ? format(new Date(g.checkOut), 'dd MMM yy') : '—'}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">₹{g.totalRent?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">₹{g.totalPaid?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {g.remainingDue > 0
                        ? <span className="text-red-600 font-medium">₹{g.remainingDue?.toLocaleString()}</span>
                        : g.advanceToReturn > 0
                          ? <span className="text-amber-600 font-medium">-₹{g.advanceToReturn?.toLocaleString()}</span>
                          : <span className="text-emerald-600 font-medium">Settled</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_BADGE[g.status] || 'bg-gray-100 text-gray-600'}`}>{g.status?.replace('_',' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openPayModal(g)} title="Add Payment" className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"><FiDollarSign size={14}/></button>
                        <button onClick={() => openModal(g)} title="Edit" className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"><FiEdit2 size={14}/></button>
                        {g.status === 'ACTIVE' && <button onClick={() => checkout(g.id)} title="Check Out" className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"><FiLogOut size={14}/></button>}
                        <button onClick={() => deleteGuest(g.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><FiTrash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-16 text-gray-400">No guests found</div>}
          </div>
        </div>
      )}

      {/* Guest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg">{editing ? 'Edit Guest' : 'Add New Guest'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl"><FiX/></button>
            </div>
            <form onSubmit={submit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Full Name *</label><input className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
                  <div><label className="label">Phone *</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Email</label><input type="email" className="input-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                  <div><label className="label">Emergency Contact</label><input className="input-field" value={form.emergencyContact} onChange={e=>setForm({...form,emergencyContact:e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">ID Proof Type</label>
                    <select className="input-field" value={form.idProof} onChange={e=>setForm({...form,idProof:e.target.value})}>
                      <option value="">Select</option>
                      {['Aadhaar','PAN','Passport','Driving License','Voter ID'].map(i=><option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div><label className="label">ID Number</label><input className="input-field" value={form.idNumber} onChange={e=>setForm({...form,idNumber:e.target.value})} /></div>
                </div>
                <div><label className="label">Address</label><textarea className="input-field" rows={2} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="font-medium text-gray-700 mb-3">Room & Bed Allocation</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Room *</label>
                      <select className="input-field" value={form.roomId} onChange={e=>onRoomChange(e.target.value)} required>
                        <option value="">Select Room</option>
                        {rooms.map(r=><option key={r.id} value={r.id}>{r.roomNumber} - {r.name}</option>)}
                      </select>
                    </div>
                    <div><label className="label">Bed *</label>
                      <select className="input-field" value={form.bedId} onChange={e=>setForm({...form,bedId:e.target.value})} required>
                        <option value="">Select Bed</option>
                        {beds.map(b=><option key={b.id} value={b.bedId}>{b.bedId}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="font-medium text-gray-700 mb-3">Stay Details</p>
                  <div className="mb-3"><label className="label">Guest Type</label>
                    <select className="input-field" value={form.guestType} onChange={e=>setForm({...form,guestType:e.target.value})}>
                      <option value="MONTHLY">Monthly</option>
                      <option value="DAILY">Daily</option>
                    </select>
                  </div>
                  <div className="mb-3"><label className="label">Check-in Mode</label>
                    <div className="flex gap-3">
                      {['datepicker','duration'].map(m=>(
                        <button key={m} type="button" onClick={()=>setForm({...form,checkInMode:m})}
                          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${form.checkInMode===m?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 border-gray-200'}`}>
                          {m === 'datepicker' ? 'Date Picker' : 'Duration (days)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Check-in Date *</label>
                      <DatePicker selected={form.checkIn} onChange={d=>setForm({...form,checkIn:d})} dateFormat="dd/MM/yyyy" className="input-field w-full" required />
                    </div>
                    {form.checkInMode === 'datepicker' ? (
                      <div><label className="label">Check-out Date</label>
                        <DatePicker selected={form.checkOut} onChange={d=>setForm({...form,checkOut:d})} dateFormat="dd/MM/yyyy" className="input-field w-full" minDate={form.checkIn} />
                      </div>
                    ) : (
                      <div><label className="label">Duration (days) *</label>
                        <input type="number" className="input-field" value={form.duration} onChange={e=>{
                          const days = Number(e.target.value)
                          const co = new Date(form.checkIn); co.setDate(co.getDate()+days)
                          setForm({...form, duration:e.target.value, checkOut:co})
                        }} required />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="font-medium text-gray-700 mb-3">Payment Details</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="label">Monthly Rent (₹)</label><input type="number" className="input-field" value={form.monthlyRent} onChange={e=>setForm({...form,monthlyRent:e.target.value})} /></div>
                    <div><label className="label">Total Rent (₹) *</label><input type="number" className="input-field" value={form.totalRent} onChange={e=>setForm({...form,totalRent:e.target.value})} required /></div>
                    <div><label className="label">Advance Paid (₹)</label><input type="number" className="input-field" value={form.advancePaid} onChange={e=>setForm({...form,advancePaid:e.target.value})} /></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && payGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Record Payment — {payGuest.name}</h3>
              <button onClick={() => setShowPayModal(false)}><FiX /></button>
            </div>
            <form onSubmit={submitPayment}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-3">
                  <div><span className="text-gray-500">Total Rent</span><p className="font-semibold">₹{payGuest.totalRent?.toLocaleString()}</p></div>
                  <div><span className="text-gray-500">Total Paid</span><p className="font-semibold text-emerald-600">₹{payGuest.totalPaid?.toLocaleString()}</p></div>
                  <div><span className="text-gray-500">Remaining Due</span><p className="font-semibold text-red-600">₹{payGuest.remainingDue?.toLocaleString()}</p></div>
                  {payGuest.advanceToReturn > 0 && <div><span className="text-gray-500">Advance to Return</span><p className="font-semibold text-amber-600">₹{payGuest.advanceToReturn?.toLocaleString()}</p></div>}
                </div>
                <div><label className="label">Amount (₹) *</label><input type="number" className="input-field" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})} required /></div>
                <div><label className="label">Payment Mode *</label>
                  <select className="input-field" value={payForm.mode} onChange={e=>setPayForm({...payForm,mode:e.target.value})}>
                    {PAYMENT_MODES.map(m=><option key={m} value={m}>{m.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div><label className="label">Note</label><input className="input-field" placeholder="Optional note" value={payForm.note} onChange={e=>setPayForm({...payForm,note:e.target.value})} /></div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowPayModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-success">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
