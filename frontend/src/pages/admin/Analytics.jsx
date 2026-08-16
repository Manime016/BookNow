import { useState, useEffect } from 'react'
import { BarChart, LineChart, PieChart, TrendingUp, Calendar, Users } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

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
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-gray-600">Detailed platform analytics and insights</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-base"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <LineChart className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-bold">Bookings Trend</h3>
            </div>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <p>Chart placeholder - Connect to chart library</p>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-secondary-500" />
              <h3 className="text-lg font-bold">Revenue Trend</h3>
            </div>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <p>Chart placeholder - Connect to chart library</p>
            </div>
          </div>

          {/* Top Events */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart className="w-5 h-5 text-accent-500" />
              <h3 className="text-lg font-bold">Top Events</h3>
            </div>
            <div className="space-y-4">
              {['Summer Festival', 'Jazz Night', 'Tech Conference'].map((event, i) => (
                <div key={event} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{event}</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" 
                         style={{ width: `${100 - i * 20}px` }} />
                    <span className="font-bold text-gray-900">{1500 - i * 300}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Demographics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold">User Demographics</h3>
            </div>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <p>Chart placeholder - Connect to chart library</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg. Booking Value', value: '$145.50' },
              { label: 'Conversion Rate', value: '3.24%' },
              { label: 'Repeat Customers', value: '34.2%' },
              { label: 'Avg. Rating', value: '4.8/5' },
            ].map((metric) => (
              <div key={metric.label} className="border-l-4 border-primary-500 pl-4">
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gradient">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
