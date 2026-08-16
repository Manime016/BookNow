import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, User, Ticket } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/store'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, logout, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 group"
          >
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg group-hover:shadow-glow transition-all">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient hidden sm:inline">BookNow</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link to="/admin" className="btn btn-primary py-2 px-4 text-sm">
                    Admin Panel
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/dashboard" className="btn btn-outline py-2 px-4 text-sm">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary py-2 px-4 text-sm"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn btn-ghost py-2 px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary py-2 px-4">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-200 space-y-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block btn btn-primary text-center"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block btn btn-outline text-center"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full btn btn-secondary"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block btn btn-ghost text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block btn btn-primary text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
