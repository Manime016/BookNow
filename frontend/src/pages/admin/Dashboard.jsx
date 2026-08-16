import { useEffect, useState } from 'react'
import { BarChart3, Users, Calendar, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatPrice } from '../../utils/helpers'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated data - replace with actual API call
    setTimeout(() => {
      setStats({
        totalEvents: 156,
        totalBookings: 8234,
        totalUsers: 5421,
        totalRevenue: 845320.50,
        upcomingEvents: 32,
        pendingBookings: 12,
        newUsersThisMonth: 342,
        revenueThisMonth: 125480.00,
        bookingTrend: '+15.3%',
        revenueTrend: '+22.1%',
      })
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

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-sm font-semibold text-green-600 flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          label="Total Events"
          value={stats.totalEvents}
          trend="+8.2%"
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="+6.3%"
          color="bg-purple-500"
        />
        <StatCard
          icon={BarChart3}
          label="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          trend={stats.bookingTrend}
          color="bg-green-500"
        />
        <StatCard
          icon={CreditCard}
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          trend={stats.revenueTrend}
          color="bg-orange-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">This Month</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Users</span>
              <span className="text-2xl font-bold">{stats.newUsersThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue</span>
              <span className="text-2xl font-bold text-gradient">
                {formatPrice(stats.revenueThisMonth)}
              </span>
            </div>
            <div className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mt-4" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn btn-primary py-2 text-sm">
              Create New Event
            </button>
            <button className="w-full btn btn-outline py-2 text-sm">
              View All Bookings
            </button>
            <button className="w-full btn btn-outline py-2 text-sm">
              Manage Users
            </button>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-yellow-900">Pending Actions</h4>
              <p className="text-sm text-yellow-800 mt-1">
                {stats.pendingBookings} bookings need your attention
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-blue-900">Upcoming Events</h4>
              <p className="text-sm text-blue-800 mt-1">
                {stats.upcomingEvents} events scheduled this month
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
