import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  userRole: localStorage.getItem('userRole') || 'user',

  setUser: (user) => {
    const role = user?.role || 'user'
    localStorage.setItem('userRole', role)
    set({ user, userRole: role })
  },
  setToken: (token) => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
    set({ token, isAuthenticated: !!token })
  },
  setRole: (role) => {
    localStorage.setItem('userRole', role)
    set({ userRole: role })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    set({ user: null, token: null, isAuthenticated: false, userRole: 'user' })
  },
}))

export const useBookingStore = create((set) => ({
  bookings: [],
  currentBooking: null,
  loading: false,
  setBookings: (bookings) => set({ bookings }),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setLoading: (loading) => set({ loading }),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
}))

export const useEventStore = create((set) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  filters: { searchTerm: '', category: 'all', sortBy: 'date' },
  setEvents: (events) => set({ events }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setLoading: (loading) => set({ loading }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}))

export const useCartStore = create((set) => ({
  selectedSeats: [],
  totalPrice: 0,

  addSeat: (seat) => set((state) => {
    const newSeats = [...state.selectedSeats, { ...seat, price: Number(seat.price) }]
    const total = newSeats.reduce((sum, selectedSeat) => sum + Number(selectedSeat.price || 0), 0)
    return { selectedSeats: newSeats, totalPrice: total }
  }),

  removeSeat: (seatId) => set((state) => {
    const newSeats = state.selectedSeats.filter((s) => s.id !== seatId)
    const total = newSeats.reduce((sum, selectedSeat) => sum + Number(selectedSeat.price || 0), 0)
    return { selectedSeats: newSeats, totalPrice: total }
  }),

  clearCart: () => set({ selectedSeats: [], totalPrice: 0 }),
}))

export const useAdminStore = create((set) => ({
  stats: null,
  dashboardData: null,
  loading: false,
  setStats: (stats) => set({ stats }),
  setDashboardData: (data) => set({ dashboardData: data }),
  setLoading: (loading) => set({ loading }),
}))
