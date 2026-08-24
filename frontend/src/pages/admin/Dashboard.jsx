import { useEffect, useState } from 'react'
import { BarChart3, Users, Calendar, CreditCard, AlertCircle, RefreshCw, Plus, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatPrice } from '../../utils/helpers'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SETTINGS_KEY = 'booknow_admin_settings'
const DEFAULT_SETTINGS = { bookingAlerts: true, paymentAlerts: true }

const readSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    return { ...DEFAULT_SETTINGS, ...saved }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [settings, setSettings] = useState(readSettings)

  const loadStats = async (manual = false) => {
    try {
      if (manual) setRefreshing(true)
      else setLoading(true)
      const { data } = await api.get('/admin/stats')
      setStats(data)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load live dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStats()
    const interval = window.setInterval(() => loadStats(true), 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleStorage = () => setSettings(readSettings())
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></AdminLayout>

  if (!stats) return <AdminLayout><div className="bg-white rounded-lg shadow-sm p-8 text-center"><h2 className="text-xl font-bold mb-2">Dashboard data unavailable</h2><p className="text-gray-600 mb-5">The dashboard could not retrieve current data from the backend.</p><button onClick={() => loadStats(true)} className="btn btn-primary">Try again</button></div></AdminLayout>

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4"><div className={`p-3 rounded-lg ${color}`}><Icon className="w-6 h-6 text-white" /></div></div>
      <p className="text-gray-600 text-sm mb-1">{label}</p><p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Live platform overview from the BookNow backend.</p>
          {stats.generatedAt && <p className="text-xs text-gray-400 mt-2">Last updated: {new Date(stats.generatedAt).toLocaleString('en-IN')}</p>}
        </div>
        <button onClick={() => loadStats(true)} disabled={refreshing} className="btn btn-outline flex items-center gap-2"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />{refreshing ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Calendar} label="Total Events" value={stats.totalEvents.toLocaleString('en-IN')} color="bg-blue-500" />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString('en-IN')} color="bg-purple-500" />
        <StatCard icon={BarChart3} label="Total Bookings" value={stats.totalBookings.toLocaleString('en-IN')} color="bg-green-500" />
        <StatCard icon={CreditCard} label="Total Revenue" value={formatPrice(stats.totalRevenue)} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6"><h3 className="text-lg font-bold mb-4">This Month</h3><div className="space-y-4"><div className="flex justify-between items-center"><span className="text-gray-600">New Users</span><span className="text-2xl font-bold">{stats.newUsersThisMonth.toLocaleString('en-IN')}</span></div><div className="flex justify-between items-center"><span className="text-gray-600">Revenue</span><span className="text-2xl font-bold text-gradient">{formatPrice(stats.revenueThisMonth)}</span></div></div></div>
        <div className="bg-white rounded-lg shadow-sm p-6"><h3 className="text-lg font-bold mb-4">Quick Actions</h3><div className="space-y-3"><Link to="/admin/events/new" className="w-full btn btn-primary py-2 text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Create New Event</Link><Link to="/admin/bookings" className="w-full btn btn-outline py-2 text-sm flex items-center justify-center gap-2"><ClipboardList className="w-4 h-4" />View All Bookings</Link><Link to="/admin/users" className="w-full btn btn-outline py-2 text-sm flex items-center justify-center gap-2"><Users className="w-4 h-4" />Manage Users</Link></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settings.bookingAlerts && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"><div className="flex items-start space-x-4"><AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" /><div><h4 className="font-bold text-yellow-900">Pending Actions</h4><p className="text-sm text-yellow-800 mt-1">{stats.pendingBookings.toLocaleString('en-IN')} bookings need your attention</p></div></div></div>}
        {settings.paymentAlerts && <div className="bg-blue-50 border border-blue-200 rounded-lg p-6"><div className="flex items-start space-x-4"><CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" /><div><h4 className="font-bold text-blue-900">Payment Alerts</h4><p className="text-sm text-blue-800 mt-1">Payment notifications are enabled in Settings.</p></div></div></div>}
      </div>
    </AdminLayout>
  )
}
