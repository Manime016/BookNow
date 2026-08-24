import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Phone, Loader, ArrowRight } from 'lucide-react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await authAPI.register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        password: formData.password,
      })
      toast.success('Account created. Please sign in.')
      navigate('/login')
    } catch (error) {
      const detail = error.response?.data?.detail
      toast.error(Array.isArray(detail) ? detail.map((item) => item.msg).join(', ') : detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-600 to-primary-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🎫</span></div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Join BookNow</h1>
            <p className="text-gray-600">Create your account and start booking events</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input-base pl-12" placeholder="John Doe" minLength="2" maxLength="255" required /></div></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="input-base pl-12" placeholder="you@example.com" required /></div></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-base pl-12" placeholder="+91 98765 43210" maxLength="30" /></div></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="input-base pl-12" placeholder="At least 8 characters" minLength="8" required /></div></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} className="input-base pl-12" placeholder="Repeat your password" minLength="8" required /></div></div>
            <div className="flex items-start space-x-3"><input type="checkbox" className="mt-1" required /><p className="text-sm text-gray-600">I agree to the Terms of Service and Privacy Policy.</p></div>
            <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 font-bold text-lg flex items-center justify-center space-x-2">
              {loading ? <><Loader className="w-5 h-5 animate-spin" /><span>Creating Account...</span></> : <><span>Create Account</span><ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
          <p className="text-center text-gray-600 mt-6">Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:text-primary-700">Sign In</Link></p>
        </div>
      </div>
    </div>
  )
}
