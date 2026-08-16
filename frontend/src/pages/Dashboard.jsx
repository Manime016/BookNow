import { useState, useEffect } from 'react'
import { LogOut, TicketIcon, MapPin, Calendar } from 'lucide-react'
import { useAuthStore } from '../store/store'
import { useNavigate } from 'react-router-dom'
import { bookingsAPI, eventSeatsAPI, eventsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate, formatPrice } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await bookingsAPI.getMy()
        const rawBookings = response.data.data || response.data
        const enriched = await Promise.all(rawBookings.map(async (booking) => {
          const eventSeat = (await eventSeatsAPI.getById(booking.event_seat_id)).data
          const event = (await eventsAPI.getById(eventSeat.event_id)).data
          return { ...booking, event, price: eventSeat.price }
        }))
        setBookings(enriched)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const upcomingBookings = bookings.filter((b) => new Date(b.event?.start_time) > new Date())
  const pastBookings = bookings.filter((b) => new Date(b.event?.start_time) <= new Date())

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.full_name}! 👋</h1>
            <p className="text-gray-600">Manage your bookings and see your upcoming events</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary py-2 px-4"
          >
            <LogOut className="w-4 h-4 inline mr-2" />
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6">
            <p className="text-gray-600 text-sm mb-2">Total Bookings</p>
            <p className="text-4xl font-bold text-gradient">{bookings.length}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm mb-2">Upcoming Events</p>
            <p className="text-4xl font-bold text-primary-600">{upcomingBookings.length}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm mb-2">Total Spent</p>
            <p className="text-4xl font-bold text-secondary-600">
              {formatPrice(bookings.reduce((sum, b) => sum + Number(b.price || 0), 0))}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex space-x-8 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'upcoming'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Events ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'past'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Events ({pastBookings.length})
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : displayBookings.length > 0 ? (
            <div className="space-y-4">
              {displayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    {/* Event Info */}
                    <div>
            <h3 className="text-lg font-bold mb-2">{booking.event?.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.event?.start_time)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.event?.metadata?.venue_name || `Venue #${booking.event?.venue_id}`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                      <p className="font-mono font-bold text-gray-900">#{booking.id}</p>
                    </div>

                    {/* Tickets */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tickets</p>
                      <div className="flex items-center space-x-2">
                        <TicketIcon className="w-5 h-5 text-primary-500" />
                        <span className="font-bold text-gray-900">
                          1 seat
                        </span>
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gradient mb-2">
                        {formatPrice(booking.price)}
                      </p>
                      <span
                        className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                          booking.booking_status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : booking.booking_status === 'PENDING_PAYMENT'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {booking.booking_status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {activeTab === 'upcoming'
                  ? 'No upcoming events. Book your next event!'
                  : 'No past events yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
