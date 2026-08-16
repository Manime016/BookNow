import { useState, useEffect } from 'react'
import { Search, Download, TrendingUp, CreditCard } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate, formatPrice } from '../../utils/helpers'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
  })

  useEffect(() => {
    setTimeout(() => {
      const paymentData = [
        {
          id: 'PAY001',
          bookingId: 'BK001',
          user: 'John Doe',
          amount: 150,
          method: 'Credit Card',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          reference: '4532-XXXX-XXXX-1234',
        },
        {
          id: 'PAY002',
          bookingId: 'BK002',
          user: 'Jane Smith',
          amount: 45,
          method: 'Debit Card',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          reference: '5234-XXXX-XXXX-5678',
        },
        {
          id: 'PAY003',
          bookingId: 'BK003',
          user: 'Mike Johnson',
          amount: 600,
          method: 'PayPal',
          date: new Date(Date.now()).toISOString(),
          status: 'pending',
          reference: 'PAYPAL-789456',
        },
      ]
      setPayments(paymentData)
      setTotals({
        totalRevenue: paymentData.reduce((sum, p) => sum + p.amount, 0),
        totalTransactions: paymentData.length,
        successRate: (paymentData.filter((p) => p.status === 'completed').length / paymentData.length) * 100,
      })
      setLoading(false)
    }, 500)
  }, [])

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || payment.status === filter
    return matchesSearch && matchesFilter
  })

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
            <h1 className="text-3xl font-bold mb-2">Payments & Revenue</h1>
            <p className="text-gray-600">Track all payments and revenue analytics</p>
          </div>
          <button className="btn btn-primary flex items-center space-x-2 py-2 px-4">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-bold">+12.5%</span>
            </div>
            <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
            <p className="text-3xl font-bold">{formatPrice(totals.totalRevenue)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-blue-600 font-bold">This Month</span>
            </div>
            <p className="text-gray-600 text-sm mb-2">Transactions</p>
            <p className="text-3xl font-bold">{totals.totalTransactions}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600 font-bold">Excellent</span>
            </div>
            <p className="text-gray-600 text-sm mb-2">Success Rate</p>
            <p className="text-3xl font-bold">{totals.successRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Payment ID or user..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Payment ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Booking
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{payment.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{payment.bookingId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gradient">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No payments found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
