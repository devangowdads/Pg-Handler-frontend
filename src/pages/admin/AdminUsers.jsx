import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ROLES = ['USER','ADMIN']

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', username:'', password:'', role:'USER', email:'', phone:'' })

  const load = () => {
    setLoading(true)
    api.get('/users').then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const open = (u = null) => {
    setEditing(u)
    setForm(u ? { name:u.name, username:u.username, password:'', role:u.role, email:u.email||'', phone:u.phone||'' } : { name:'', username:'', password:'', role:'USER', email:'', phone:'' })
    setShowModal(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.password) delete payload.password
    try {
      if (editing) await api.put(`/users/${editing.id}`, payload)
      else await api.post('/users', payload)
      toast.success(`User ${editing ? 'updated' : 'created'}`); setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try { await api.delete(`/users/${id}`); toast.success('User deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FiUser className="text-primary-600"/> User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage admin and user accounts</p>
        </div>
        <button onClick={() => open()} className="btn-primary"><FiPlus/> Add User</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"/></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['User','Username','Email','Phone','Role','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">{u.name?.[0]?.toUpperCase()}</div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{u.username}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => open(u)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"><FiEdit2 size={14}/></button>
                        <button onClick={() => del(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><FiTrash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-center py-16 text-gray-400">No users found</div>}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg">{editing ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Full Name *</label><input className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                  <div><label className="label">Username *</label><input className="input-field" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required/></div>
                </div>
                <div><label className="label">Password {editing && <span className="text-gray-400 font-normal">(leave blank to keep)</span>}</label>
                  <input type="password" className="input-field" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required={!editing}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Email</label><input type="email" className="input-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
                  <div><label className="label">Phone</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                </div>
                <div><label className="label">Role *</label>
                  <select className="input-field" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                    {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
