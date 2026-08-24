import axios from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const API_BASE_URL = configuredApiUrl
  ? `${configuredApiUrl.replace(/\/+$/, '')}${configuredApiUrl.replace(/\/+$/, '').endsWith('/api') ? '' : '/api'}`
  : 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
}

// Events APIs
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
}

// Venues APIs
export const venuesAPI = {
  getAll: (params) => api.get('/venues', { params }),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
}

// Seats APIs
export const seatsAPI = {
  getAll: (params) => api.get('/seats', { params }),
  getById: (id) => api.get(`/seats/${id}`),
  getByVenue: (venueId) => api.get(`/seats/venue/${venueId}`),
  create: (data) => api.post('/seats', data),
  update: (id, data) => api.put(`/seats/${id}`, data),
  delete: (id) => api.delete(`/seats/${id}`),
}

// Event Seats APIs
export const eventSeatsAPI = {
  getByEvent: (eventId) => api.get(`/event-seats/event/${eventId}`),
  getAvailableByEvent: (eventId) => api.get(`/event-seats/event/${eventId}/available`),
  getById: (id) => api.get(`/event-seats/${id}`),
  generate: (eventId, price) => api.post(`/event-seats/event/${eventId}/generate`, null, { params: { price } }),
}

// Bookings APIs
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getMy: (params) => api.get('/bookings/my', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.delete(`/bookings/${id}`),
}

// Payments APIs
export const paymentsAPI = {
  getById: (id) => api.get(`/payments/${id}`),
  createOrder: (data) => api.post('/payments/order', data),
  verify: (bookingId, data) => api.post('/payments/verify', data, { params: { booking_id: bookingId } }),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
}

// Seat Locks APIs
export const seatLocksAPI = {
  create: (data) => api.post('/seat-locks', data),
  delete: (id) => api.delete(`/seat-locks/${id}`),
}

export default api
