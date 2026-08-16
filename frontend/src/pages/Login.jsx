import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader, ShieldCheck, Ticket } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'

export default function Login({ adminOnly = false }) {
  const navigate = useNavigate()
  const { setToken, setUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const accountLabel = adminOnly ? 'Administrator' : 'Customer'

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      const { data } = await authAPI.login(formData)
      if (adminOnly && data.user.role !== 'admin') {
        logout()
        toast.error('This account does not have administrator access')
        return
      }
      setToken(data.access_token)
      setUser(data.user)
      toast.success(`Welcome back, ${accountLabel.toLowerCase()}`)
      navigate(data.user.role === 'admin' ? '/admin' : '/')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center text-white mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/15 flex items-center justify-center">
            {adminOnly ? <ShieldCheck className="w-9 h-9" /> : <Ticket className="w-9 h-9" />}
          </div>
          <p className="font-semibold tracking-wide uppercase text-sm text-primary-100">BookNow {accountLabel} Portal</p>
          <h1 className="text-3xl font-bold mt-2">Sign in to continue</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input required type="email" name="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="input-base pl-12" placeholder="you@example.com" /></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input required type="password" name="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} className="input-base pl-12" placeholder="••••••••" /></div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 font-bold text-lg flex justify-center items-center gap-2">
              {loading ? <><Loader className="w-5 h-5 animate-spin" />Signing in...</> : <>Sign in as {accountLabel}<ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            {adminOnly ? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Customer sign in</Link> : <><p>New to BookNow?</p><Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Create a customer account</Link><p className="mt-4"><Link to="/admin/login" className="text-gray-500 hover:text-primary-600">Administrator sign in</Link></p></>}
          </div>
        </div>
      </div>
    </div>
  )
}
