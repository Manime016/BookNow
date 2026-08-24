import { useEffect, useState } from 'react'
import { Bell, Lock, Save, Settings as SettingsIcon, Shield, User } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/store'
import LoadingSpinner from '../../components/LoadingSpinner'
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

export default function AdminSettings() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [notifications, setNotifications] = useState(readSettings)

  useEffect(() => {
    let cancelled = false
    authAPI.me()
      .then(({ data }) => {
        if (cancelled) return
        setUser(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '' })
      })
      .catch((error) => {
        if (!cancelled) toast.error(error.response?.data?.detail || 'Failed to load settings')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [setUser])

  const handleNotificationChange = (name, checked) => {
    const next = { ...notifications, [name]: checked }
    setNotifications(next)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    toast.success(`${name === 'bookingAlerts' ? 'Booking' : 'Payment'} alerts ${checked ? 'enabled' : 'disabled'}`)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      const { data } = await authAPI.updateProfile(form)
      setUser(data)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLayout><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-600"><SettingsIcon className="w-6 h-6" /></div>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your administrator profile and dashboard preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white mx-auto mb-4"><User className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold text-center">{user?.full_name || 'Administrator'}</h2>
              <p className="text-sm text-gray-500 text-center mt-1">{user?.email}</p>
              <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-primary-700 bg-primary-50 rounded-lg py-2"><Shield className="w-4 h-4" /> Administrator</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-gray-500" />Security</h3>
              <p className="text-sm text-gray-600">Your account uses the same secure authentication system as customer accounts.</p>
              <p className="text-xs text-gray-500 mt-3">Password changes require a dedicated password-reset endpoint and are not exposed here.</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">Administrator profile</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
                  <input required minLength="2" maxLength="255" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-base" placeholder="Administrator name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                  <input value={user?.email || ''} disabled className="input-base bg-gray-100 cursor-not-allowed" />
                  <p className="text-xs text-gray-500 mt-1">The login email cannot be changed from this page.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone number</label>
                  <input type="tel" maxLength="30" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" placeholder="+91 98765 43210" />
                </div>
                <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
                  {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2"><Bell className="w-5 h-5 text-gray-500" />Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div><p className="font-semibold">Booking alerts</p><p className="text-sm text-gray-500">Show booking-related alerts on the admin dashboard.</p></div>
                  <input type="checkbox" checked={notifications.bookingAlerts} onChange={(e) => handleNotificationChange('bookingAlerts', e.target.checked)} className="w-5 h-5" />
                </label>
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div><p className="font-semibold">Payment alerts</p><p className="text-sm text-gray-500">Show payment-related alerts on the admin dashboard.</p></div>
                  <input type="checkbox" checked={notifications.paymentAlerts} onChange={(e) => handleNotificationChange('paymentAlerts', e.target.checked)} className="w-5 h-5" />
                </label>
                <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">These preferences are saved in this browser and immediately affect the admin dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
