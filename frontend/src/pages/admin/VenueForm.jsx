import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { venuesAPI } from '../../services/api'
import toast from 'react-hot-toast'

const makeRows = (count, existing = []) => Array.from({ length: Number(count) || 0 }, (_, index) => ({ row: index + 1, offset: Number(existing[index]?.offset ?? 0), price: Number(existing[index]?.price ?? 150) }))

export default function AdminVenueForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(Boolean(id))
  const [formData, setFormData] = useState({ name: '', address: '', total_rows: 10, total_cols: 10 })
  const [rows, setRows] = useState(makeRows(10))
  const [screen, setScreen] = useState(true)
  const [seatGap, setSeatGap] = useState(1)

  useEffect(() => {
    if (!id) return
    venuesAPI.getById(id).then(({ data }) => {
      setFormData({ name: data.name, address: data.address || '', total_rows: data.total_rows, total_cols: data.total_cols })
      setRows(makeRows(data.total_rows, data.layout?.rows || []))
      setScreen(data.layout?.screen !== false)
      setSeatGap(Number(data.layout?.seat_gap || 1))
    }).catch((error) => toast.error(error.response?.data?.detail || 'Unable to load venue')).finally(() => setLoading(false))
  }, [id])

  const updateRow = (index, field, value) => setRows((current) => current.map((row, i) => i === index ? { ...row, [field]: value } : row))
  const previewRows = useMemo(() => rows.map((row) => ({ ...row, offset: Math.max(-Number(formData.total_cols), Math.min(Number(formData.total_cols), Number(row.offset) || 0)) })), [rows, formData.total_cols])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const payload = { name: formData.name, address: formData.address, total_rows: Number(formData.total_rows), total_cols: Number(formData.total_cols), layout: { screen, seat_gap: Number(seatGap), rows: rows.map((row) => ({ row: row.row, offset: Number(row.offset) || 0, price: Number(row.price) || 0 })) } }
    try {
      if (id) await venuesAPI.update(id, payload)
      else await venuesAPI.create(payload)
      toast.success(`Venue ${id ? 'updated' : 'created'} successfully`)
      navigate('/admin/venues')
    } catch (error) { toast.error(error.response?.data?.detail || 'Unable to save venue') }
    finally { setLoading(false) }
  }

  const changeRows = (value) => {
    const count = Math.max(1, Math.min(100, Number(value) || 1))
    setFormData((current) => ({ ...current, total_rows: count }))
    setRows((current) => makeRows(count, current))
  }

  return <AdminLayout><div className="max-w-5xl">
    <button onClick={() => navigate('/admin/venues')} className="flex items-center space-x-2 text-primary-600 mb-6"><ArrowLeft className="w-5 h-5" /><span>Back to Venues</span></button>
    <div className="bg-white rounded-lg shadow-sm p-8"><h1 className="text-3xl font-bold mb-2">{id ? 'Edit Venue Layout' : 'Add Venue'}</h1><p className="text-gray-600 mb-8">Create curved rows, aisle spacing, and different prices for each row.</p>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block text-sm font-medium">Venue name<input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-base w-full mt-2" /></label>
          <label className="block text-sm font-medium">Address<textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-base w-full mt-2" /></label>
          <label className="block text-sm font-medium">Rows<input required min="1" max="100" disabled={Boolean(id)} type="number" value={formData.total_rows} onChange={(e) => changeRows(e.target.value)} className="input-base w-full mt-2" /></label>
          <label className="block text-sm font-medium">Seats per row<input required min="1" max="100" disabled={Boolean(id)} type="number" value={formData.total_cols} onChange={(e) => setFormData({ ...formData, total_cols: e.target.value })} className="input-base w-full mt-2" /></label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={screen} onChange={(e) => setScreen(e.target.checked)} /> Show screen/stage</label>
          <label className="block text-sm font-medium">Seat spacing<select value={seatGap} onChange={(e) => setSeatGap(e.target.value)} className="input-base w-full mt-2"><option value="0.75">Tight</option><option value="1">Normal</option><option value="1.5">Wide</option><option value="2">Very wide</option></select></label>
        </div>
        <div><h2 className="text-xl font-bold mb-2">Row layout & pricing</h2><p className="text-sm text-gray-600 mb-4">Positive offset moves a row right; negative offset moves it left. Price is applied when event seats are generated.</p><div className="space-y-3">{rows.map((row, index) => <div key={row.row} className="grid grid-cols-[80px_1fr_180px] gap-4 items-center border rounded-lg p-3"><span className="font-semibold">Row {String.fromCharCode(64 + ((row.row - 1) % 26) + 1)}</span><label className="text-sm">Offset<div className="flex items-center gap-2 mt-1"><button type="button" onClick={() => updateRow(index, 'offset', Number(row.offset) - 1)} className="p-2 border rounded"><Minus className="w-4 h-4" /></button><input type="number" step="0.5" min={-Number(formData.total_cols)} max={Number(formData.total_cols)} value={row.offset} onChange={(e) => updateRow(index, 'offset', e.target.value)} className="input-base" /><button type="button" onClick={() => updateRow(index, 'offset', Number(row.offset) + 1)} className="p-2 border rounded"><Plus className="w-4 h-4" /></button></div></label><label className="text-sm">Price (₹)<input required type="number" min="0" step="0.01" value={row.price} onChange={(e) => updateRow(index, 'price', e.target.value)} className="input-base w-full mt-1" /></label></div>)}</div></div>
        <div className="bg-gray-50 rounded-xl p-6 overflow-x-auto"><div className="text-center font-semibold mb-5">{screen ? <div className="mx-auto max-w-md rounded-full bg-gray-800 text-white py-2 mb-6">SCREEN / STAGE</div> : null}</div><div className="min-w-[700px] space-y-3">{previewRows.map((row) => <div key={row.row} className="flex items-center gap-2" style={{ paddingLeft: `${Math.max(0, row.offset) * 18}px`, paddingRight: `${Math.max(0, -row.offset) * 18}px` }}><span className="w-10 text-xs text-gray-500">{String.fromCharCode(64 + ((row.row - 1) % 26) + 1)}</span><div className="flex gap-2" style={{ columnGap: `${Number(seatGap) * 8}px` }}>{Array.from({ length: Number(formData.total_cols) }, (_, col) => <span key={col} className="w-7 h-7 rounded bg-white border border-gray-300 text-[9px] flex items-center justify-center">{col + 1}</span>)}</div><span className="text-xs text-gray-500 ml-3">₹{Number(row.price).toFixed(0)}</span></div>)}</div></div>
        <button disabled={loading} className="btn btn-primary py-2 px-6">{loading ? 'Saving...' : 'Save Venue Layout'}</button>
      </form>
    </div>
  </div></AdminLayout>
}
