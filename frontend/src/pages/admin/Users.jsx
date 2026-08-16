import { useState, useEffect } from 'react'
import { Search, Edit2, Trash2, Mail, Phone } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1-555-0123',
          joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          role: 'user',
          bookings: 5,
          totalSpent: 375.50,
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1-555-0124',
          joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          role: 'user',
          bookings: 8,
          totalSpent: 650.00,
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+1-555-0125',
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'inactive',
          role: 'user',
          bookings: 2,
          totalSpent: 200.00,
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || user.status === filter
    return matchesSearch && matchesFilter
  })

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

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
        <div>
          <h1 className="text-3xl font-bold mb-2">Users Management</h1>
          <p className="text-gray-600">Manage all platform users</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Bookings
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Total Spent
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">ID: {user.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{user.bookings}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gradient">
                      ${user.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-primary-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
