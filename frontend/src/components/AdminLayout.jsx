import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Settings, Ticket } from 'lucide-react'
import { useAuthStore } from '../store/store'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gradient hidden sm:inline">BookNow Admin</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-gray-900">{user?.full_name}</p>
              <p className="text-sm text-gray-600">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
