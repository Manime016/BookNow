import { useEffect, useState } from 'react'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { eventsAPI, venuesAPI, eventSeatsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const emptyForm = { venue_id: '', title: '', date: '', time: '', end_time: '', description: '', category: 'Concert', price: '100', thumbnail_url: '' }
const toLocal = (value) => value ? new Date(value).toISOString().slice(0, 16) : ''

export default function AdminEventForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(Boolean(id))

  useEffect(() => {
    Promise.all([venuesAPI.getAll(), id ? eventsAPI.getById(id) : Promise.resolve(null)])
      .then(([venueResponse, eventResponse]) => {
        setVenues(venueResponse.data)
        if (eventResponse) {
          const event = eventResponse.data
          setFormData({ venue_id: String(event.venue_id), title: event.title, date: toLocal(event.start_time).slice(0, 10), time: toLocal(event.start_time).slice(11), end_time: toLocal(event.end_time), description: event.metadata?.description || '', category: event.metadata?.category || 'Concert', price: String(event.metadata?.price || 100), thumbnail_url: event.metadata?.thumbnail_url || '' })
        }
      })
      .catch((error) => toast.error(error.response?.data?.detail || 'Unable to load event form'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    if (formData.thumbnail_url && !/^https:\/\//i.test(formData.thumbnail_url)) { toast.error('Thumbnail URL must use HTTPS'); setLoading(false); return }
    const payload = { venue_id: Number(formData.venue_id), title: formData.title, start_time: new Date(`${formData.date}T${formData.time}`).toISOString(), end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null, metadata: { description: formData.description, category: formData.category, price: Number(formData.price), thumbnail_url: formData.thumbnail_url.trim() || null } }
    try {
      const response = id ? await eventsAPI.update(id, payload) : await eventsAPI.create(payload)
      // Venue layout row prices are authoritative for new event seats. The event price is retained as metadata/default information.
      if (!id) await eventSeatsAPI.generate(response.data.id)
      toast.success(`Event ${id ? 'updated' : 'created'} successfully`)
      navigate('/admin/events')
    } catch (error) { toast.error(error.response?.data?.detail || 'Unable to save event') }
    finally { setLoading(false) }
  }

  return <AdminLayout><div className="max-w-3xl"><button onClick={() => navigate('/admin/events')} className="flex items-center space-x-2 text-primary-600 mb-6"><ArrowLeft className="w-5 h-5" /><span>Back to Events</span></button><div className="bg-white rounded-lg shadow-sm p-8"><h1 className="text-3xl font-bold mb-8">{id ? 'Edit Event' : 'Create Event'}</h1><form onSubmit={handleSubmit} className="space-y-6"><label className="block text-sm font-medium">Title<input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-base w-full mt-2" /></label><div className="grid grid-cols-2 gap-6"><label className="block text-sm font-medium">Venue<select required value={formData.venue_id} onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })} className="input-base w-full mt-2"><option value="">Select venue</option>{venues.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></label><label className="block text-sm font-medium">Category<select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-base w-full mt-2">{['Concert', 'Movie', 'Sports', 'Theater', 'Comedy', 'Conference'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-sm font-medium">Date<input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-base w-full mt-2" /></label><label className="block text-sm font-medium">Start time<input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="input-base w-full mt-2" /></label><label className="block text-sm font-medium">End time (optional)<input type="datetime-local" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="input-base w-full mt-2" /></label><label className="block text-sm font-medium">Default price<input required min="0" step="0.01" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-base w-full mt-2" /><span className="text-xs text-gray-500">Used only when the venue has no row-specific price.</span></label></div><label className="block text-sm font-medium">Description<textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-base w-full h-28 mt-2" /></label><div><label className="block text-sm font-medium mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4" />Custom thumbnail URL</label><input type="url" value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} className="input-base w-full" placeholder="https://example.com/event-thumbnail.jpg" /><p className="text-xs text-gray-500 mt-2">Use a direct HTTPS image URL. Leave empty to use the default event artwork.</p>{formData.thumbnail_url && <img src={formData.thumbnail_url} alt="Thumbnail preview" className="mt-3 h-40 w-full object-cover rounded-lg border" onError={(e) => { e.currentTarget.style.display = 'none' }} />}</div><p className="text-sm text-gray-600">New events automatically receive the selected venue's seat layout and row pricing.</p><button disabled={loading} className="btn btn-primary py-2 px-6">{loading ? 'Saving...' : 'Save Event'}</button></form></div></div></AdminLayout>
}
