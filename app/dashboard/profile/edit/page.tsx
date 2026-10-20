'use client'

import { DEFAULT_HOURS, type Hours, type DayHours, type Day as HoursDay } from '@/lib/hours'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AddressAutocomplete } from '@/components/address-autocomplete'

// Read an image File, downscale it on a canvas, return a JPEG data URL
function fileToDataUrl(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no ctx'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const label: React.CSSProperties = { fontSize: 13.5, fontWeight: 600, color: '#37352f', display: 'block', marginBottom: 6 }
const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12,
  border: '1px solid #e9e9e7', background: '#fff', fontSize: 15, color: '#37352f',
  outline: 'none', fontFamily: 'inherit',
}
const sectionLabel: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
  margin: '0 0 12px', padding: '0 4px', color: '#9b9a97',
}
const card: React.CSSProperties = { border: '1px solid #e9e9e7', background: '#fff', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }

type Day = HoursDay
const DAYS: { key: Day; label: string }[] = [
  { key: 'mon', label: 'Monday' }, { key: 'tue', label: 'Tuesday' }, { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' }, { key: 'fri', label: 'Friday' }, { key: 'sat', label: 'Saturday' }, { key: 'sun', label: 'Sunday' },
]

export default function EditProfilePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const [name, setName]       = useState('')
  const [address, setAddress] = useState('')
  const [photo, setPhoto]     = useState<string | null>(null)
  const [email, setEmail]     = useState('')
  const [origEmail, setOrigEmail] = useState('')
  const [password, setPassword]   = useState('')
  const [hours, setHours]     = useState<Hours>(DEFAULT_HOURS)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      setOrigEmail(user.email ?? '')
      // try with working_hours; fall back if the column doesn't exist yet
      let { data } = await supabase.from('barbers').select('name, address, photo_url, working_hours').eq('user_id', user.id).single()
      if (!data) {
        const retry = await supabase.from('barbers').select('name, address, photo_url').eq('user_id', user.id).single()
        data = retry.data as typeof data
      }
      if (data) {
        setName(data.name ?? '')
        setAddress(data.address ?? '')
        setPhoto(data.photo_url ?? null)
      }
      // hours: DB column → localStorage → defaults
      const dbHours = (data as { working_hours?: Hours })?.working_hours
      let localHours: Hours | null = null
      try { const s = localStorage.getItem('snippr:hours'); if (s) localHours = JSON.parse(s) } catch {}
      setHours(dbHours || localHours || DEFAULT_HOURS)
      setLoading(false)
    })()
  }, [router])

  const setDay = (key: Day, patch: Partial<DayHours>) =>
    setHours(h => ({ ...h, [key]: { ...h[key], ...patch } }))

  async function onPhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(await fileToDataUrl(file, 400))
  }

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not signed in'); setSaving(false); return }

    // 1) barber profile
    const { error: bErr } = await supabase.from('barbers')
      .update({ name, address, photo_url: photo })
      .eq('user_id', user.id)
    if (bErr) { setError(bErr.message); setSaving(false); return }

    // working hours — always saved on this browser; also to the DB if the column exists
    try { localStorage.setItem('snippr:hours', JSON.stringify(hours)) } catch {}
    await supabase.from('barbers').update({ working_hours: hours }).eq('user_id', user.id)

    // 2) email / password (auth)
    const authPatch: { email?: string; password?: string } = {}
    if (email && email !== origEmail) authPatch.email = email
    if (password) authPatch.password = password
    if (Object.keys(authPatch).length) {
      const { error: aErr } = await supabase.auth.updateUser(authPatch)
      if (aErr) { setError(aErr.message); setSaving(false); return }
      if (authPatch.email) setOrigEmail(email)
      setPassword('')
    }

    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #e9e9e7', borderTopColor: '#37352f', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div className="flex flex-col gap-8" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', maxWidth: 720, margin: '0 auto' }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={onPhotoPick} style={{ display: 'none' }} />

      {/* Header + back */}
      <div>
        <button
          onClick={() => router.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '7px 14px', borderRadius: 999, border: '1px solid #e9e9e7', background: '#fff', color: '#37352f', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f7f7f5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
          Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#37352f' }}>Edit profile</h1>
        <p style={{ marginTop: 6, fontSize: 14, color: '#787774', margin: 0 }}>Update your photo, details and account.</p>
      </div>

      {/* Photo */}
      <section>
        <p style={sectionLabel}>Photo</p>
        <div style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 74, height: 74, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#fca5a5,#c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {photo
              ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{(name || '?').charAt(0).toUpperCase()}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => fileRef.current?.click()} style={{ padding: '9px 16px', borderRadius: 10, background: '#111827', color: '#fff', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Change photo
            </button>
            {photo && (
              <button onClick={() => setPhoto(null)} style={{ padding: '9px 16px', borderRadius: 10, background: '#fff', color: '#37352f', fontSize: 14, fontWeight: 500, border: '1px solid #e9e9e7', cursor: 'pointer', fontFamily: 'inherit' }}>
                Remove
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Profile details */}
      <section>
        <p style={sectionLabel}>Profile</p>
        <div style={card}>
          <div>
            <label style={label}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={input} />
          </div>
          <div>
            <label style={label}>Shop address</label>
            <AddressAutocomplete value={address} onChange={setAddress} placeholder="e.g. 12 Main St, Berlin" inputStyle={input} />
          </div>
        </div>
      </section>

      {/* Working hours */}
      <section>
        <p style={sectionLabel}>Working hours</p>
        <div style={card}>
          {DAYS.map(({ key, label: dl }) => {
            const d = hours[key]
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setDay(key, { open: !d.open })}
                  style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: d.open ? '#37352f' : '#e3e2e0', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}
                >
                  <span style={{ position: 'absolute', top: 3, left: d.open ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
                <span style={{ width: 92, fontSize: 14, fontWeight: 500, color: '#37352f' }}>{dl}</span>
                {d.open ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="time" value={d.start} onChange={e => setDay(key, { start: e.target.value })}
                      style={{ padding: '7px 10px', borderRadius: 10, border: '1px solid #e9e9e7', background: '#fff', fontSize: 14, color: '#37352f', outline: 'none', fontFamily: 'inherit' }} />
                    <span style={{ color: '#9b9a97' }}>–</span>
                    <input type="time" value={d.end} onChange={e => setDay(key, { end: e.target.value })}
                      style={{ padding: '7px 10px', borderRadius: 10, border: '1px solid #e9e9e7', background: '#fff', fontSize: 14, color: '#37352f', outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                ) : (
                  <span style={{ fontSize: 14, color: '#9b9a97' }}>Closed</span>
                )}
              </div>
            )
          })}
          <p style={{ fontSize: 12.5, color: '#9b9a97', margin: 0 }}>Customers can only book inside these hours. Don’t forget to Save.</p>
        </div>
      </section>

      {/* Account */}
      <section>
        <p style={sectionLabel}>Account</p>
        <div style={card}>
          <div>
            <label style={label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={input} />
          </div>
          <div>
            <label style={label}>New password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" style={input} />
          </div>
        </div>
      </section>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '12px 26px', borderRadius: 12, background: '#111827', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span style={{ fontSize: 14, color: '#16a34a', fontWeight: 500 }}>✓ Saved</span>}
        {error && <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 500 }}>{error}</span>}
      </div>
    </div>
  )
}
