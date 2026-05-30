import React, { useEffect, useState } from 'react'
import { catalogueService } from '../../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiBook } from 'react-icons/fi'
import toast from 'react-hot-toast'

const TYPES = ['SINGLE','2_SHARING','3_SHARING','4_SHARING']
const TYPE_LABELS = { SINGLE:'Single Occupancy', '2_SHARING':'2 Sharing', '3_SHARING':'3 Sharing', '4_SHARING':'4 Sharing' }
const TYPE_COLORS = {
  SINGLE:    'bg-violet-50 border-violet-200',
  '2_SHARING': 'bg-blue-50 border-blue-200',
  '3_SHARING': 'bg-teal-50 border-teal-200',
  '4_SHARING': 'bg-orange-50 border-orange-200',
}
const TYPE_BADGE = {
  SINGLE:    'bg-violet-100 text-violet-700',
  '2_SHARING': 'bg-blue-100 text-blue-700',
  '3_SHARING': 'bg-teal-100 text-teal-700',
  '4_SHARING': 'bg-orange-100 text-orange-700',
}

const initForm = { name:'', type:'2_SHARING', monthlyRent:'', dailyRate:'', deposit:'', amenities:'', description:'' }

export default function AdminCatalogue() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm)

  const load = () => {
    setLoading(true)
    catalogueService.getAll().then(r => setItems(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const open = (item = null) => {
    setEditing(item)
    setForm(item ? {
      name: item.name, type: item.type, monthlyRent: item.monthlyRent, dailyRate: item.dailyRate || '',
      deposit: item.deposit || '', amenities: item.amenities?.join(', ') || '', description: item.description || ''
    } : initForm)
    setShowModal(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    const payload = { ...form, amenities: form.amenities.split(',').map(a=>a.trim()).filter(Boolean), monthlyRent: Number(form.monthlyRent), dailyRate: Number(form.dailyRate) || 0, deposit: Number(form.deposit) || 0 }
    try {
      if (editing) await catalogueService.update(editing.id, payload)
      else await catalogueService.create(payload)
      toast.success('Catalogue item saved'); setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this catalogue item?')) return
    try { await catalogueService.delete(id); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FiBook className="text-primary-600"/> Catalogue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage pricing plans for each room type</p>
        </div>
        <button onClick={() => open()} className="btn-primary"><FiPlus/> Add Plan</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className={`rounded-2xl border-2 p-5 ${TYPE_COLORS[item.type]} transition-all hover:shadow-md`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`badge mb-2 ${TYPE_BADGE[item.type]}`}>{TYPE_LABELS[item.type]}</span>
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => open(item)} className="p-2 rounded-xl hover:bg-white/70 text-primary-600 transition-colors"><FiEdit2 size={14}/></button>
                  <button onClick={() => del(item.id)} className="p-2 rounded-xl hover:bg-white/70 text-red-500 transition-colors"><FiTrash2 size={14}/></button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Rent</span>
                  <span className="font-bold text-gray-900 text-base">₹{item.monthlyRent?.toLocaleString()}</span>
                </div>
                {item.dailyRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Rate</span>
                    <span className="font-semibold text-gray-700">₹{item.dailyRate}/day</span>
                  </div>
                )}
                {item.deposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Security Deposit</span>
                    <span className="font-semibold text-gray-700">₹{item.deposit?.toLocaleString()}</span>
                  </div>
                )}
              </div>
              {item.amenities?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/50">
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.amenities.map(a => (
                      <span key={a} className="text-xs bg-white/70 text-gray-700 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {item.description && <p className="mt-3 text-xs text-gray-500 border-t border-white/50 pt-3">{item.description}</p>}
            </div>
          ))}
          {items.length === 0 && <div className="col-span-3 card text-center py-16 text-gray-400">No catalogue items. Click "Add Plan" to create pricing.</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg">{editing ? 'Edit Plan' : 'Add Catalogue Plan'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="p-6 space-y-4">
                <div><label className="label">Plan Name *</label><input className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Premium 2-Share" required/></div>
                <div><label className="label">Room Type *</label>
                  <select className="input-field" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    {TYPES.map(t=><option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label">Monthly Rent *</label><input type="number" className="input-field" value={form.monthlyRent} onChange={e=>setForm({...form,monthlyRent:e.target.value})} required/></div>
                  <div><label className="label">Daily Rate</label><input type="number" className="input-field" value={form.dailyRate} onChange={e=>setForm({...form,dailyRate:e.target.value})}/></div>
                  <div><label className="label">Deposit</label><input type="number" className="input-field" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})}/></div>
                </div>
                <div><label className="label">Amenities <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                  <input className="input-field" value={form.amenities} onChange={e=>setForm({...form,amenities:e.target.value})} placeholder="WiFi, AC, Meals, Laundry..."/>
                </div>
                <div><label className="label">Description</label><textarea className="input-field" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
