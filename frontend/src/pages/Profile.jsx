import { useEffect, useMemo, useState } from 'react'
import { Calendar, CheckCircle2, Clock3, Mail, Phone, Save, Ticket, User, XCircle } from 'lucide-react'
import { authAPI, bookingsAPI, eventSeatsAPI, eventsAPI } from '../services/api'
import { useAuthStore } from '../store/store'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate, formatPrice } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadProfile = async () => {
      try {
        const [profileResponse, bookingsResponse] = await Promise.all([
          authAPI.me(),
          bookingsAPI.getMy(),
        ])
        if (cancelled) return
        const profile = profileResponse.data
        setUser(profile)
        setForm({ full_name: profile.full_name || '', phone: profile.phone || '' })

        const rawBookings = bookingsResponse.data || []
        const enriched = await Promise.all(rawBookings.map(async (booking) => {
          try {
            const seat = (await eventSeatsAPI.getById(booking.event_seat_id)).data
            const event = (await eventsAPI.getById(seat.event_id)).data
            return { ...booking, seat, event }
          } catch {
            return { ...booking, seat: null, event: null }
          }
        }))
        if (!cancelled) setBookings(enriched)
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.detail || 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [setUser])

  const handleSave = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      const response = await authAPI.updateProfile(form)
      setUser(response.data)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to update profile')
    } finally {
      setSaving(false)
    }
  }

  const confirmedCount = bookings.filter((booking) => booking.booking_status === 'CONFIRMED').length
  const pendingCount = bookings.filter((booking) => booking.booking_status === 'PENDING_PAYMENT').length
  const totalSpent = useMemo(
    () => bookings.filter((booking) => booking.booking_status === 'CONFIRMED').reduce((sum, booking) => sum + Number(booking.seat?.price || 0) + 2, 0),
    [bookings],
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-primary-600 font-semibold mb-2">My Account</p>
          <h1 className="text-4xl font-bold">Profile</h1>
          <p className="text-gray-600 mt-2">Keep your contact information up to date and review your booking history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="card p-8 lg:col-span-1">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white mx-auto mb-5">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-center">{user?.full_name || 'BookNow User'}</h2>
            <p className="text-gray-500 text-center mt-1">{user?.email}</p>
            <div className="grid grid-cols-3 gap-3 mt-8 text-center">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-xl font-bold">{bookings.length}</p><p className="text-xs text-gray-500">Bookings</p></div>
              <div className="bg-green-50 rounded-xl p-3"><p className="text-xl font-bold text-green-700">{confirmedCount}</p><p className="text-xs text-gray-500">Confirmed</p></div>
              <div className="bg-yellow-50 rounded-xl p-3"><p className="text-xl font-bold text-yellow-700">{pendingCount}</p><p className="text-xs text-gray-500">Pending</p></div>
            </div>
          </div>

          <div className="card p-8 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Personal information</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
                <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input required minLength="2" maxLength="255" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-base pl-12" /></div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input value={user?.email || ''} disabled className="input-base pl-12 bg-gray-100 cursor-not-allowed" /></div>
                <p className="text-xs text-gray-500 mt-1">Email is tied to your account and cannot be changed here.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone number</label>
                <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="tel" maxLength="30" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base pl-12" placeholder="+91 98765 43210" /></div>
              </div>
              <button disabled={saving} className="btn btn-primary py-3 px-6 flex items-center gap-2">
                {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="card p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div><h2 className="text-2xl font-bold">Previous bookings</h2><p className="text-gray-500">Your complete booking history.</p></div>
            <div className="text-right"><p className="text-sm text-gray-500">Confirmed spend</p><p className="text-xl font-bold text-gradient">{formatPrice(totalSpent)}</p></div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">You haven't made any bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const status = booking.booking_status
                const statusConfig = status === 'CONFIRMED'
                  ? { label: 'Confirmed', className: 'bg-green-100 text-green-700', icon: CheckCircle2 }
                  : status === 'PENDING_PAYMENT'
                    ? { label: 'Payment pending', className: 'bg-yellow-100 text-yellow-700', icon: Clock3 }
                    : { label: 'Cancelled', className: 'bg-red-100 text-red-700', icon: XCircle }
                const StatusIcon = statusConfig.icon
                return (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2"><h3 className="font-bold text-lg">{booking.event?.title || 'Event'}</h3><span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusConfig.className}`}><StatusIcon className="w-3.5 h-3.5" />{statusConfig.label}</span></div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{booking.event?.start_time ? formatDate(booking.event.start_time) : 'Date unavailable'}</span>
                          <span>Booking #{booking.id}</span>
                          <span>Seat {booking.seat?.seat_id ?? '—'}</span>
                        </div>
                      </div>
                      <div className="text-left md:text-right"><p className="text-sm text-gray-500">Amount</p><p className="text-xl font-bold">{formatPrice(Number(booking.seat?.price || 0) + 2)}</p></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
