import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pg_token')
      localStorage.removeItem('pg_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const roomService = {
  getAll: () => api.get('/rooms'),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  getAvailability: () => api.get('/rooms/availability'),
}

export const bedService = {
  getByRoom: (roomId) => api.get(`/beds/room/${roomId}`),
  create: (data) => api.post('/beds', data),
  update: (id, data) => api.put(`/beds/${id}`, data),
  delete: (id) => api.delete(`/beds/${id}`),
}

export const guestService = {
  getAll: (params) => api.get('/guests', { params }),
  getById: (id) => api.get(`/guests/${id}`),
  create: (data) => api.post('/guests', data),
  update: (id, data) => api.put(`/guests/${id}`, data),
  checkout: (id) => api.post(`/guests/${id}/checkout`),
  delete: (id) => api.delete(`/guests/${id}`),
}

export const paymentService = {
  getByGuest: (guestId) => api.get(`/payments/guest/${guestId}`),
  create: (data) => api.post('/payments', data),
  getAll: (params) => api.get('/payments', { params }),
  getSummary: () => api.get('/payments/summary'),
}

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
}

export const catalogueService = {
  getAll: () => api.get('/catalogue'),
  create: (data) => api.post('/catalogue', data),
  update: (id, data) => api.put(`/catalogue/${id}`, data),
  delete: (id) => api.delete(`/catalogue/${id}`),
}

export default api