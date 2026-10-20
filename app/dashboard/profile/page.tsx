'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)


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

export default function ProfilePage() {
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  const [me, setMe] = useState<{ name: string; email: string; photo: string | null; role: string; location: string; slug: string }>({
    name: 'Your name', email: '', photo: null, role: 'Barber', location: 'Add your location', slug: '',
  })
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // try to read cover_url too; fall back if the column doesn't exist yet
      let { data } = await supabase.from('barbers').select('name, photo_url, address, slug, cover_url').eq('user_id', user.id).single()
      if (!data) {
        const retry = await supabase.from('barbers').select('name, photo_url, address, slug').eq('user_id', user.id).single()
        data = retry.data as typeof data
      }
      if (!data) return
      setMe({
        name: data.name || 'Your name',
        email: user.email ?? '',
        photo: data.photo_url || null,
        role: 'Barber',
        location: data.address || 'Add your location',
        slug: data.slug || '',
      })
      const dbCover = (data as { cover_url?: string }).cover_url ?? null
      let localCover: string | null = null
      try { localCover = localStorage.getItem('snippr:cover') } catch {}
      setBanner(dbCover ?? localCover ?? null)
    })()
  }, [])

  const cards = [
    { href: me.slug ? `/b/${me.slug}` : '/dashboard/profile/edit', title: 'Your booking page', desc: 'Open the public page your customers use to book.' },
    { href: '/dashboard/services', title: 'Services & prices', desc: 'Manage the services and prices you offer.' },
    { href: '/dashboard/calendar', title: 'Calendar', desc: 'See and manage your upcoming appointments.' },
  ]

  async function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file, 400)
    setMe(m => ({ ...m, photo: url }))
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('barbers').update({ photo_url: url }).eq('user_id', user.id)
  }

  async function onBannerPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file, 1200)
    setBanner(url)
    // Persist on this browser immediately (survives refresh / re-login)
    try { localStorage.setItem('snippr:cover', url) } catch {}
    // Also save to the DB if the cover_url column exists (cross-device + public page) — ignore if it doesn't
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('barbers').update({ cover_url: url }).eq('user_id', user.id)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* hidden file inputs */}
      <input ref={avatarRef} type="file" accept="image/*" onChange={onAvatarPick} style={{ display: 'none' }} />
      <input ref={bannerRef} type="file" accept="image/*" onChange={onBannerPick} style={{ display: 'none' }} />

      <div
        className="relative mx-auto w-full max-w-[1400px] rounded-[36px] overflow-hidden"
        style={{ background: '#ffffff', boxShadow: '0 30px 80px rgba(0,0,0,0.12)', border: '1px solid #eee' }}
      >
        {/* ── Banner (click to change) ── */}
        <div
          onClick={() => bannerRef.current?.click()}
          className="relative h-[270px] cursor-pointer group"
          style={banner
            ? { backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(100deg, #2563eb 0%, #6d28d9 24%, #db2777 46%, #f97316 70%, #fbbf24 92%)' }}
          title="Click to change cover"
        >
          <button
            onClick={(e) => { e.stopPropagation(); bannerRef.current?.click() }}
            className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-105"
            style={{ background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', color: '#1f2937' }}
            title="Change cover photo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-12 md:px-16 pb-16">
          {/* Avatar (click to change) */}
          <button
            onClick={() => avatarRef.current?.click()}
            className="relative -mt-[92px] w-[180px] h-[180px] rounded-full overflow-hidden flex items-center justify-center group cursor-pointer"
            style={{ border: '8px solid #fff', background: 'linear-gradient(135deg,#fca5a5,#c084fc)', boxShadow: '0 6px 18px rgba(0,0,0,0.15)' }}
            title="Click to change photo"
          >
            {me.photo
              ? <img src={me.photo} alt="" className="w-full h-full object-cover" />
              : <span style={{ fontSize: 68, fontWeight: 700, color: '#fff' }}>{(me.name || '?').charAt(0).toUpperCase()}</span>}
            {/* hover overlay */}
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
              </svg>
            </span>
          </button>

          {/* Name + actions */}
          <div className="mt-5">
            <h1 className="text-[38px] font-bold" style={{ color: '#111827', letterSpacing: '-0.02em' }}>{me.name}</h1>
            <p className="text-[16px] mt-1" style={{ color: '#6b7280' }}>{me.role}</p>
            <p className="text-[16px]" style={{ color: '#9ca3af' }}>{me.location}</p>

            <div className="flex items-center gap-2.5 mt-5">
              <Link href="/dashboard/profile/edit" className="inline-flex items-center rounded-full px-6 py-3 text-[15px] font-semibold transition-colors" style={{ background: '#111827', color: '#fff' }}>
                Edit Profile
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center rounded-full px-6 py-3 text-[15px] font-semibold transition-colors" style={{ background: '#fff', color: '#111827', border: '1px solid #e5e7eb' }}>
                Settings
              </Link>
            </div>
          </div>

          {/* ── Bottom cards ── */}
          <div className="grid sm:grid-cols-3 gap-5 mt-9">
            {cards.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="group rounded-2xl p-5 transition-colors"
                style={{ background: '#f5f7fb', border: '1px solid #eef1f6' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[16px] font-semibold mb-1" style={{ color: '#111827' }}>{c.title}</p>
                    <p className="text-[14px] leading-snug" style={{ color: '#9ca3af' }}>{c.desc}</p>
                  </div>
                  <span className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ background: '#fff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <ArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
