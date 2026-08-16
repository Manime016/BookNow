import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Users, Share2, Heart, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import Seat from '../components/Seat'
import { eventsAPI, eventSeatsAPI, seatsAPI, bookingsAPI, seatLocksAPI } from '../services/api'
import { useCartStore, useAuthStore } from '../store/store'
import { formatDate, formatTime, formatPrice } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { selectedSeats, addSeat, removeSeat, clearCart, totalPrice } = useCartStore()

  const [event, setEvent] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true)
        clearCart()
        const [eventRes, eventSeatsRes] = await Promise.all([
          eventsAPI.getById(id),
          eventSeatsAPI.getByEvent(id),
        ])
        const eventData = eventRes.data
        const venueSeatsRes = await seatsAPI.getByVenue(eventData.venue_id)
        const venueSeats = new Map(venueSeatsRes.data.map((seat) => [seat.id, seat]))
        setEvent(eventData)
        setSeats(eventSeatsRes.data.map((eventSeat) => {
          const venueSeat = venueSeats.get(eventSeat.seat_id)
          return {
            ...eventSeat,
            row: venueSeat ? String.fromCharCode(64 + venueSeat.row_num) : '',
            number: venueSeat?.col_num || '',
            is_available: eventSeat.status === 'available',
          }
        }))
      } catch (error) {
        console.error(error)
        toast.error('Failed to load event details')
        navigate('/events')
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [id, navigate, clearCart])

  const handleSeatClick = async (seat) => {
    if (!isAuthenticated) {
      toast.error('Please login to select a seat')
      navigate('/login')
      return
    }
    const isSelected = selectedSeats.some((s) => s.id === seat.id)
    if (isSelected) {
      try {
        await seatLocksAPI.delete(seat.id)
        removeSeat(seat.id)
        setSeats((current) => current.map((item) => item.id === seat.id ? { ...item, status: 'available', is_available: true } : item))
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Unable to release seat')
      }
    } else {
      if (selectedSeats.length) {
        toast.error('Only one seat can be booked at a time')
        return
      }
      try {
        await seatLocksAPI.create({ event_seat_id: seat.id })
        addSeat(seat)
        setSeats((current) => current.map((item) => item.id === seat.id ? { ...item, status: 'reserved', is_available: false } : item))
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Seat is no longer available')
      }
    }
  }

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets')
      navigate('/login')
      return
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }

    try {
      setBookingLoading(true)

      // Create booking
      const bookingRes = await bookingsAPI.create({ event_seat_id: selectedSeats[0].id })

      toast.success('Booking created! Proceeding to checkout...')
      clearCart()
      navigate(`/checkout/${bookingRes.data.id}`)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.detail || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Event not found</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Events</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="card overflow-hidden mb-8">
              <img
                src={
                  event.image ||
                  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=500&fit=crop'
                }
                alt={event.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Event Info */}
            <div className="card p-8 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold">{event.title}</h1>
                <div className="flex space-x-3">
                  <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Heart className="w-6 h-6 text-red-500" />
                  </button>
                  <button className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {event.metadata?.category || 'Event'}
                </span>
                <span className="text-gray-600">⭐ 4.8 (2,450 reviews)</span>
              </div>

              <p className="text-lg text-gray-700 mb-8 leading-relaxed">{event.metadata?.description || 'No description provided.'}</p>

              {/* Event Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start space-x-4">
                  <Calendar className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg font-semibold">{formatDate(event.start_time)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="text-lg font-semibold">{formatTime(event.start_time)} onwards</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Venue</p>
                    <p className="text-lg font-semibold">{event.metadata?.venue_name || `Venue #${event.venue_id}`}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="text-lg font-semibold">{seats.length} seats</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>

              <div className="mb-8 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded" />
                  <span className="text-sm text-gray-600">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <span className="text-sm text-gray-600">Unavailable</span>
                </div>
              </div>

              <div className="grid grid-cols-10 gap-2 mb-8 max-w-2xl">
                {seats.map((seat) => (
                  <Seat
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeats.some((s) => s.id === seat.id)}
                    isLocked={false}
                    onSelect={handleSeatClick}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-8 sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Booking Summary</h3>

              {/* Selected Seats */}
              {selectedSeats.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-3">Selected Seats:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat) => (
                      <span key={seat.id} className="bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm font-medium">
                        {seat.row}
                        {seat.number}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tickets ({selectedSeats.length})</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-semibold">{formatPrice(selectedSeats.length * 2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-bold text-gradient">
                    {formatPrice(totalPrice + selectedSeats.length * 2)}
                  </span>
                </div>
              </div>

              {/* Booking Button */}
              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || bookingLoading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
                  selectedSeats.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'btn btn-primary'
                }`}
              >
                {bookingLoading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </span>
                ) : (
                  `Proceed to Checkout`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                You can cancel or modify your booking up to 24 hours before the event
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
