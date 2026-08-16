import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CreditCard, Lock, ArrowLeft } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { bookingsAPI, paymentsAPI, eventSeatsAPI, eventsAPI } from '../services/api'
import { formatPrice, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Checkout() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [eventSeat, setEventSeat] = useState(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const bookingRes = await bookingsAPI.getById(bookingId)
        const seatRes = await eventSeatsAPI.getById(bookingRes.data.event_seat_id)
        const eventRes = await eventsAPI.getById(seatRes.data.event_id)
        setBooking(bookingRes.data)
        setEventSeat(seatRes.data)
        setEvent(eventRes.data)
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to load booking details')
        navigate('/events')
      } finally {
        setLoading(false)
      }
    }
    fetchCheckoutData()
  }, [bookingId, navigate])

  const handlePayment = async (event) => {
    event.preventDefault()
    try {
      setProcessing(true)
      const { data: order } = await paymentsAPI.createOrder({ booking_id: Number(bookingId) })
      if (!window.Razorpay) throw new Error('Razorpay checkout could not be loaded')
      new window.Razorpay({
        key: order.razorpay_key_id,
        amount: Math.round(Number(order.amount) * 100),
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: 'BookNow',
        description: `Booking #${bookingId}`,
        handler: async (response) => {
          try {
            await paymentsAPI.verify(bookingId, response)
            toast.success('Payment successful!')
            navigate('/dashboard')
          } catch (error) {
            toast.error(error.response?.data?.detail || 'Payment verification failed')
          } finally {
            setProcessing(false)
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      }).open()
    } catch (error) {
      setProcessing(false)
      toast.error(error.response?.data?.detail || error.message || 'Unable to start payment')
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>
  if (!booking || !eventSeat || !event) return <div className="flex justify-center items-center min-h-screen"><p className="text-gray-600">Booking not found</p></div>

  const amount = Number(eventSeat.price)
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8"><ArrowLeft className="w-5 h-5" /><span>Back</span></button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2"><div className="card p-8">
            <h1 className="text-3xl font-bold mb-4">Complete Payment</h1>
            <p className="text-gray-600 mb-8">You will be securely redirected to Razorpay to complete this payment.</p>
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3"><Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-green-700">BookNow never receives or stores your card details.</p></div>
              <button type="submit" disabled={processing} className="w-full btn btn-primary py-3 font-bold text-lg flex items-center justify-center space-x-2">
                {processing ? <><LoadingSpinner size="sm" /><span>Opening secure checkout...</span></> : <><CreditCard className="w-5 h-5" /><span>Pay {formatPrice(amount)}</span></>}
              </button>
            </form>
          </div></div>
          <div><div className="card p-8 sticky top-24"><h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="mb-6 pb-6 border-b border-gray-200"><p className="text-sm text-gray-600 mb-2">Event</p><p className="font-bold text-lg mb-2">{event.title}</p><p className="text-sm text-gray-600">{formatDate(event.start_time)}</p></div>
            <div className="flex justify-between items-center"><span className="font-bold text-lg">Total Amount</span><span className="text-3xl font-bold text-gradient">{formatPrice(amount)}</span></div>
          </div></div>
        </div>
      </div>
    </div>
  )
}
