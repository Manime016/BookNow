import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CreditCard, Lock, ArrowLeft, RefreshCw } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { bookingsAPI, paymentsAPI, eventSeatsAPI, eventsAPI, authAPI } from '../services/api'
import { formatPrice, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const PLATFORM_FEE = 2

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => reject(new Error('Razorpay checkout could not be loaded')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Razorpay checkout could not be loaded'))
    document.body.appendChild(script)
  })
}

export default function Checkout() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [eventSeat, setEventSeat] = useState(null)
  const [event, setEvent] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [verificationData, setVerificationData] = useState(null)
  const [verificationFailed, setVerificationFailed] = useState(false)

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const [bookingRes, userRes] = await Promise.all([
          bookingsAPI.getById(bookingId),
          authAPI.me(),
        ])
        const seatRes = await eventSeatsAPI.getById(bookingRes.data.event_seat_id)
        const eventRes = await eventsAPI.getById(seatRes.data.event_id)
        setBooking(bookingRes.data)
        setEventSeat(seatRes.data)
        setEvent(eventRes.data)
        setUser(userRes.data)
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to load booking details')
        navigate('/events')
      } finally {
        setLoading(false)
      }
    }
    fetchCheckoutData()
  }, [bookingId, navigate])

  const verifyPayment = async (response) => {
    try {
      await paymentsAPI.verify(Number(bookingId), response)
      toast.success('Payment successful! Your ticket is confirmed.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      console.error('Payment verification failed:', error)
      setVerificationData(response)
      setVerificationFailed(true)
      setProcessing(false)
      toast.error(error.response?.data?.detail || 'Payment was received, but confirmation could not be completed. Please retry verification.')
    }
  }

  const handleRetryVerification = async () => {
    if (!verificationData || processing) return
    setProcessing(true)
    await verifyPayment(verificationData)
  }

  const handlePayment = async (eventSubmit) => {
    eventSubmit.preventDefault()
    if (processing) return

    try {
      setProcessing(true)
      setVerificationFailed(false)
      await loadRazorpay()

      const { data: order } = await paymentsAPI.createOrder({ booking_id: Number(bookingId) })
      if (!order?.razorpay_order_id || !order?.razorpay_key_id) {
        throw new Error('Payment order was not created correctly. Please try again.')
      }

      const razorpay = new window.Razorpay({
        key: order.razorpay_key_id,
        amount: Math.round(Number(order.amount) * 100),
        currency: order.currency || 'INR',
        order_id: order.razorpay_order_id,
        name: 'BookNow',
        description: `Booking #${bookingId} - ${event?.title || 'Event ticket'}`,
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#0ea5e9' },
        handler: verifyPayment,
        modal: { ondismiss: () => setProcessing(false) },
      })

      razorpay.on('payment.failed', (response) => {
        console.error('Razorpay payment failed:', response?.error)
        setProcessing(false)
        toast.error(response?.error?.description || 'Payment failed. Please try again.')
      })

      razorpay.open()
    } catch (error) {
      console.error('Unable to start payment:', error)
      setProcessing(false)
      toast.error(error.response?.data?.detail || error.message || 'Unable to start payment')
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>
  if (!booking || !eventSeat || !event) return <div className="flex justify-center items-center min-h-screen"><p className="text-gray-600">Booking not found</p></div>

  const seatPrice = Number(eventSeat.price)
  const totalAmount = seatPrice + PLATFORM_FEE

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
              {verificationFailed && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 mb-3">Your payment response was received, but confirmation needs to be retried. Do not make another payment.</p>
                  <button type="button" onClick={handleRetryVerification} disabled={processing} className="btn btn-secondary flex items-center gap-2">
                    {processing ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
                    Retry confirmation
                  </button>
                </div>
              )}
              <button type="submit" disabled={processing || booking.booking_status !== 'PENDING_PAYMENT'} className="w-full btn btn-primary py-3 font-bold text-lg flex items-center justify-center space-x-2 disabled:opacity-60">
                {processing ? <><LoadingSpinner size="sm" /><span>Opening secure checkout...</span></> : <><CreditCard className="w-5 h-5" /><span>Pay {formatPrice(totalAmount)}</span></>}
              </button>
              {booking.booking_status !== 'PENDING_PAYMENT' && <p className="text-sm text-gray-500 text-center">This booking is no longer awaiting payment.</p>}
            </form>
          </div></div>
          <div><div className="card p-8 sticky top-24"><h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="mb-6 pb-6 border-b border-gray-200"><p className="text-sm text-gray-600 mb-2">Event</p><p className="font-bold text-lg mb-2">{event.title}</p><p className="text-sm text-gray-600">{formatDate(event.start_time)}</p></div>
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between"><span className="text-gray-600">Ticket</span><span className="font-semibold">{formatPrice(seatPrice)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Platform Fee</span><span className="font-semibold">{formatPrice(PLATFORM_FEE)}</span></div>
            </div>
            <div className="flex justify-between items-center"><span className="font-bold text-lg">Total Amount</span><span className="text-3xl font-bold text-gradient">{formatPrice(totalAmount)}</span></div>
          </div></div>
        </div>
      </div>
    </div>
  )
}
