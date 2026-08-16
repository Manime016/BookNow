import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { venuesAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminVenueForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(Boolean(id))
  const [formData, setFormData] = useState({ name: '', address: '', total_rows: 10, total_cols: 10 })

  useEffect(() => {
    if (!id) return
    venuesAPI.getById(id)
      .then(({ data }) => setFormData(data))
      .catch((error) => toast.error(error.response?.data?.detail || 'Unable to load venue'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const payload = { ...formData, total_rows: Number(formData.total_rows), total_cols: Number(formData.total_cols) }
    try {
      if (id) await venuesAPI.update(id, payload)
      else await venuesAPI.create(payload)
      toast.success(`Venue ${id ? 'updated' : 'created'} successfully`)
      navigate('/admin/venues')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Unable to save venue')
    } finally { setLoading(false) }
  }

  return <AdminLayout><div className="max-w-2xl">
    <button onClick={() => navigate('/admin/venues')} className="flex items-center space-x-2 text-primary-600 mb-6"><ArrowLeft className="w-5 h-5" /><span>Back to Venues</span></button>
    <div className="bg-white rounded-lg shadow-sm p-8"><h1 className="text-3xl font-bold mb-8">{id ? 'Edit Venue' : 'Add Venue'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block text-sm font-medium">Venue name<input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-base w-full mt-2" /></label>
        <label className="block text-sm font-medium">Address<textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-base w-full h-24 mt-2" /></label>
        <div className="grid grid-cols-2 gap-6">
          <label className="block text-sm font-medium">Rows<input required min="1" disabled={Boolean(id)} type="number" value={formData.total_rows} onChange={(e) => setFormData({ ...formData, total_rows: e.target.value })} className="input-base w-full mt-2" /></label>
          <label className="block text-sm font-medium">Seats per row<input required min="1" disabled={Boolean(id)} type="number" value={formData.total_cols} onChange={(e) => setFormData({ ...formData, total_cols: e.target.value })} className="input-base w-full mt-2" /></label>
        </div>
        <p className="text-sm text-gray-600">Creating a venue automatically creates its seat grid. Grid dimensions cannot be changed after creation.</p>
        <button disabled={loading} className="btn btn-primary py-2 px-6">{loading ? 'Saving...' : 'Save Venue'}</button>
      </form>
    </div>
  </div></AdminLayout>
}
