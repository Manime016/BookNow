import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  CreditCard,
  Building2,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Calendar, label: 'Events', path: '/admin/events' },
    { icon: Building2, label: 'Venues', path: '/admin/venues' },
    { icon: BookOpen, label: 'Bookings', path: '/admin/bookings' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white w-64 transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative h-screen overflow-y-auto z-40`}
      >
        {/* Close button for mobile */}
        <div className="md:hidden p-4 flex justify-end">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Admin Panel v1.0</p>
          <p className="text-xs text-gray-500">© 2024 BookNow</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={onClose}
        />
      )}
    </>
  )
}
