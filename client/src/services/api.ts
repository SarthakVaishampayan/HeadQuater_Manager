import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data: { username: string; email: string; password: string; phoneNumber: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { username?: string; phoneNumber?: string }) =>
    api.put('/auth/profile', data),
}

export const tableAPI = {
  getAll: () => api.get('/tables'),
  getById: (id: string) => api.get(`/tables/${id}`),
  create: (data: { tableName: string; tableType: 'pool' | 'snooker' | 'vip'; hourlyRate: number }) =>
    api.post('/tables', data),
  update: (id: string, data: any) => api.put(`/tables/${id}`, data),
  delete: (id: string) => api.delete(`/tables/${id}`),
  getAllAdmin: () => api.get('/tables/admin'),
}

export const bookingAPI = {
  create: (data: { tableId: string; bookingDate: string; startTime: string; duration: number }) =>
    api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  cancel: (id: string) => api.delete(`/bookings/${id}`),
  getAll: (params?: { date?: string; status?: string }) => api.get('/bookings/admin', { params }),
  updateStatus: (id: string, data: { bookingStatus?: string; paymentStatus?: string }) =>
    api.put(`/bookings/${id}`, data),
  getAvailableSlots: (tableId: string, date: string) =>
    api.get('/bookings/available', { params: { tableId, date } }),
}

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUsers: () => api.get('/analytics/users'),
  getStats: () => api.get('/analytics/stats'),
}

export default api