import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { eventsAPI, venuesAPI } from '../../services/api'
import { formatDate, formatPrice } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AdminEvents() {
  const [events, setEvents] = useState([]); const [venues, setVenues] = useState({}); const [loading, setLoading] = useState(true); const [search, setSearch] = useState('')
  const load = async () => { try { const [eventResponse, venueResponse] = await Promise.all([eventsAPI.getAll(), venuesAPI.getAll()]); setEvents(eventResponse.data); setVenues(Object.fromEntries(venueResponse.data.map((venue) => [venue.id, venue.name]))) } catch (error) { toast.error(error.response?.data?.detail || 'Unable to load events') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  const remove = async (id) => { if (!window.confirm('Delete this event?')) return; try { await eventsAPI.delete(id); setEvents((items) => items.filter((item) => item.id !== id)); toast.success('Event deleted') } catch (error) { toast.error(error.response?.data?.detail || 'Unable to delete event') } }
  const filtered = events.filter((event) => event.title.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <AdminLayout><div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div></AdminLayout>
  return <AdminLayout><div><div className="flex justify-between items-center mb-6"><div><h1 className="text-3xl font-bold">Events</h1><p className="text-gray-600">Live data from the database</p></div><Link to="/admin/events/new" className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" />Create Event</Link></div>
    <div className="relative bg-white rounded-lg p-4 mb-6"><Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events" className="input-base w-full pl-10" /></div>
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="p-4 text-left">Event</th><th className="p-4 text-left">Date</th><th className="p-4 text-left">Venue</th><th className="p-4 text-left">Price</th><th className="p-4 text-left">Actions</th></tr></thead><tbody>{filtered.map((event) => <tr key={event.id} className="border-t"><td className="p-4 font-medium">{event.title}</td><td className="p-4">{formatDate(event.start_time)}</td><td className="p-4">{venues[event.venue_id] || `Venue #${event.venue_id}`}</td><td className="p-4">{formatPrice(event.metadata?.price)}</td><td className="p-4 flex gap-3"><Link to={`/admin/events/${event.id}`}><Edit2 className="w-4 h-4 text-primary-600" /></Link><button onClick={() => remove(event.id)}><Trash2 className="w-4 h-4 text-red-600" /></button></td></tr>)}</tbody></table>{!filtered.length && <p className="p-8 text-center text-gray-600">No events found.</p>}</div>
  </div></AdminLayout>
}
