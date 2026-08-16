import { useState, useEffect } from 'react'
import { Search, Eye, Trash2, Download } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, formatPrice } from '../../utils/helpers'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setTimeout(() => {
      setBookings([
        {
          id: 'BK001',
          user: 'John Doe',
          event: 'Summer Music Festival',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          tickets: 2,
          amount: 150,
          status: 'confirmed',
          paymentStatus: 'paid',
        },
        {
          id: 'BK002',
          user: 'Jane Smith',
          event: 'Jazz Night',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          tickets: 1,
          amount: 45,
          status: 'pending',
          paymentStatus: 'pending',
        },
        {
          id: 'BK003',
          user: 'Mike Johnson',
          event: 'Tech Conference 2024',
          date: new Date(Date.now()).toISOString(),
          tickets: 4,
          amount: 600,
          status: 'confirmed',
          paymentStatus: 'paid',
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || booking.status === filter
    return matchesSearch && matchesFilter
  })

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter((b) => b.id !== id))
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bookings Management</h1>
            <p className="text-gray-600">View and manage all bookings</p>
          </div>
          <button className="btn btn-primary flex items-center space-x-2 py-2 px-4">
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID, user, or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-10 w-full"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-base"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Event</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tickets</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{booking.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.event}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(booking.date)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.tickets}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gradient">
                      {formatPrice(booking.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            booking.paymentStatus === 'paid'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {booking.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          title="View Details"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
