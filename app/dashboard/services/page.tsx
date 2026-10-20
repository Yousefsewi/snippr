'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/lib/currency'

type Service = {
  id: string
  barber_id: string
  name: string
  duration_min: number
  price: number
}

export default function ServicesPage() {
  const router = useRouter()
  const { format } = useCurrency()
  const [barberId, setBarberId]     = useState<string | null>(null)
  const [services, setServices]     = useState<Service[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Service | null>(null)
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm]             = useState({ name: '', duration_min: '', price: '' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: barber } = await supabase.from('barbers').select('id').eq('user_id', user.id).single()
      if (!barber) { setLoading(false); return }
      setBarberId(barber.id)
      await fetchServices(barber.id)
      setLoading(false)
    }
    load()
  }, [router])

  async function fetchServices(bid: string) {
    const { data } = await supabase.from('services').select('*').eq('barber_id', bid).order('name')
    setServices(data || [])
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!barberId) return
    setSaving(true)
    const payload = { barber_id: barberId, name: form.name, duration_min: parseInt(form.duration_min), price: parseFloat(form.price) }
    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('services').insert(payload)
    }
    await fetchServices(barberId)
    setSaving(false)
    cancel()
  }

  async function handleDelete(id: string) {
    if (!barberId) return
    setDeletingId(id)
    await supabase.from('services').delete().eq('id', id)
    await fetchServices(barberId)
    setDeletingId(null)
  }

  function startEdit(s: Service) {
    setEditing(s)
    setForm({ name: s.name, duration_min: s.duration_min.toString(), price: s.price.toString() })
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false); setEditing(null)
    setForm({ name: '', duration_min: '', price: '' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2.5px solid #e9e9e7', borderTopColor: '#37352f', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', maxWidth: 680 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, color: '#37352f' }}>Services</h1>
          <p style={{ color: '#9b9a97', fontSize: 14, marginTop: 5, marginBottom: 0 }}>
            {services.length === 0 ? 'No services yet' : `${services.length} service${services.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#37352f', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14.5, fontWeight: 600, padding: '10px 18px', cursor: 'pointer' }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add service
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e9e9e7', borderRadius: 20, padding: 22, marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#9b9a97', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 18px' }}>
            {editing ? 'Edit service' : 'New service'}
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { key: 'name',         label: 'Service name',   type: 'text',   placeholder: 'e.g. Haircut & Fade' },
                { key: 'duration_min', label: 'Duration (min)', type: 'number', placeholder: '30' },
                { key: 'price',        label: 'Price',          type: 'number', placeholder: '0.00' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#9b9a97', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                  <input type={type} required placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={saving}
                style={{ padding: '10px 20px', borderRadius: 10, background: '#37352f', color: '#fff', border: 'none', fontSize: 14.5, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add service'}
              </button>
              <button type="button" onClick={cancel}
                style={{ padding: '10px 20px', borderRadius: 10, background: '#f7f7f5', color: '#37352f', border: '1px solid #e9e9e7', fontSize: 14.5, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {services.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fafafa', borderRadius: 20, border: '1.5px dashed #e9e9e7' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#37352f', margin: '0 0 6px' }}>No services yet</p>
          <p style={{ fontSize: 14, color: '#9b9a97', margin: '0 0 20px' }}>Add your first service to start taking bookings</p>
          <button onClick={() => setShowForm(true)}
            style={{ padding: '10px 22px', borderRadius: 12, background: '#37352f', color: '#fff', border: 'none', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>
            + Add service
          </button>
        </div>
      )}

      {/* Services list */}
      {services.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {services.map((s, i) => (
            <div key={s.id}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #e9e9e7', borderRadius: 18, padding: '14px 18px', transition: 'box-shadow .15s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Number badge */}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f7f7f5', border: '1px solid #e9e9e7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#9b9a97', flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Name + duration */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: '#37352f', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                <p style={{ fontSize: 13, color: '#9b9a97', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⏱ {s.duration_min} min
                </p>
              </div>

              {/* Price */}
              <p style={{ fontSize: 17, fontWeight: 700, color: '#37352f', margin: 0, flexShrink: 0 }}>{format(s.price)}</p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => startEdit(s)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e9e9e7', background: '#fff', color: '#37352f', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                  style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #f5d0ca', background: '#ffe2dd', color: '#5d1715', fontSize: 13.5, fontWeight: 500, cursor: deletingId === s.id ? 'not-allowed' : 'pointer', opacity: deletingId === s.id ? 0.5 : 1 }}>
                  {deletingId === s.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inp: React.CSSProperties = {
  background: '#f7f7f5', border: '1px solid #e9e9e7', borderRadius: 10,
  padding: '10px 13px', color: '#37352f', fontSize: 15, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
