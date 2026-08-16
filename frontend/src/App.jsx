import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/store'
import { authAPI } from './services/api'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminEvents from './pages/admin/Events'
import AdminEventForm from './pages/admin/EventForm'
import AdminBookings from './pages/admin/Bookings'
import AdminUsers from './pages/admin/Users'
import AdminPayments from './pages/admin/Payments'
import AdminVenues from './pages/admin/Venues'
import AdminVenueForm from './pages/admin/VenueForm'
import AdminAnalytics from './pages/admin/Analytics'

// Protected Route Component
function ProtectedRoute({ children, requiredRole = 'user' }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" />
  }

  return children
}

// Admin Routes Component
function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/analytics" element={<AdminAnalytics />} />
      <Route path="/events" element={<AdminEvents />} />
      <Route path="/events/new" element={<AdminEventForm />} />
      <Route path="/events/:id" element={<AdminEventForm />} />
      <Route path="/bookings" element={<AdminBookings />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/payments" element={<AdminPayments />} />
      <Route path="/venues" element={<AdminVenues />} />
      <Route path="/venues/new" element={<AdminVenueForm />} />
      <Route path="/venues/:id" element={<AdminVenueForm />} />
    </Routes>
  )
}

export default function App() {
  const { isAuthenticated, user, setUser, logout } = useAuthStore()
  const [authLoading, setAuthLoading] = useState(isAuthenticated && !user)

  useEffect(() => {
    if (!isAuthenticated || user) {
      setAuthLoading(false)
      return
    }
    authAPI.me()
      .then((response) => setUser(response.data))
      .catch(() => logout())
      .finally(() => setAuthLoading(false))
  }, [isAuthenticated, user, setUser, logout])

  if (authLoading) return <div className="min-h-screen bg-gray-50" />
  const isAdmin = isAuthenticated && user?.role === 'admin'

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {isAdmin ? (
        // Admin Layout with nested routes
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      ) : (
        // User Layout
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/checkout/:bookingId" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<Login adminOnly />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}
