import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { venuesAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminVenues() {
  const [venues, setVenues] = useState([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState('')
  useEffect(() => { venuesAPI.getAll().then(({ data }) => setVenues(data)).catch((error) => toast.error(error.response?.data?.detail || 'Unable to load venues')).finally(() => setLoading(false)) }, [])
  const remove = async (id) => { if (!window.confirm('Delete this venue and its events?')) return; try { await venuesAPI.delete(id); setVenues((items) => items.filter((item) => item.id !== id)); toast.success('Venue deleted') } catch (error) { toast.error(error.response?.data?.detail || 'Unable to delete venue') } }
  const filtered = venues.filter((venue) => `${venue.name} ${venue.address || ''}`.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <AdminLayout><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></AdminLayout>
  return <AdminLayout><div><div className="flex justify-between items-center mb-6"><div><h1 className="text-3xl font-bold">Venues</h1><p className="text-gray-600">Live data from the database</p></div><Link to="/admin/venues/new" className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" />Add Venue</Link></div>
    <div className="relative bg-white rounded-lg p-4 mb-6"><Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search venues" className="input-base w-full pl-10" /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map((venue) => <div key={venue.id} className="bg-white rounded-lg shadow-sm p-6"><div className="flex gap-3"><MapPin className="w-5 h-5 text-primary-600 mt-1" /><div><h2 className="font-bold">{venue.name}</h2><p className="text-sm text-gray-600">{venue.address || 'No address set'}</p></div></div><div className="my-5 text-sm text-gray-700">{venue.total_rows} rows × {venue.total_cols} seats = {venue.total_rows * venue.total_cols} seats</div><div className="flex gap-4"><Link to={`/admin/venues/${venue.id}`} className="text-primary-600"><Edit2 className="w-4 h-4" /></Link><button onClick={() => remove(venue.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button></div></div>)}</div>{!filtered.length && <p className="text-center py-10 text-gray-600">No venues found.</p>}
  </div></AdminLayout>
}
