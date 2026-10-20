'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { FaInstagram, FaTiktok, FaWhatsapp, FaFacebook, FaYoutube, FaXTwitter, FaGlobe } from 'react-icons/fa6'
import { Palette, Link2, PlaySquare, ChevronUp, ChevronDown, Trash2, Check, Copy, ExternalLink, ImagePlus, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AddressAutocomplete } from '@/components/address-autocomplete'
import { useClientValue } from '@/lib/use-stored'
import { glass, GLASS_PAGE_WASH } from '@/lib/glass'
import { PAGE_THEMES, wallpaper } from '@/lib/page-themes'
import {
  SOCIAL_PLATFORMS, MAX_SOCIALS, MAX_BLOCKS, safeUrl, whatsappUrl, youtubeId, isHexColor,
  type SocialLink, type PageBlock,
} from '@/lib/page-links'

const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const INK = '#1d1d1f'
const MUTED = 'rgba(29,29,31,0.6)'

// Theme presets for the public page live in lib/page-themes.ts (stored as barbers.accent)

const SOCIAL_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: FaInstagram, tiktok: FaTiktok, whatsapp: FaWhatsapp, facebook: FaFacebook, youtube: FaYoutube, x: FaXTwitter, website: FaGlobe,
}

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

const newId = () => Math.random().toString(36).slice(2, 10)

// shared bits of styling
const panel: React.CSSProperties = { ...glass(), borderRadius: 24, padding: 18 }
const panelTitle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 14px' }
const field: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.85)', fontSize: 14, color: INK, outline: 'none', fontFamily: 'inherit' }
const darkBtn: React.CSSProperties = { padding: '10px 16px', borderRadius: 12, background: INK, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }
const lightBtn: React.CSSProperties = { padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.9)', color: INK, fontSize: 14, fontWeight: 600, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }
const iconBtn: React.CSSProperties = { width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, border: 'none', background: 'rgba(0,0,0,0.04)', color: INK, cursor: 'pointer' }

export default function BookingLinkPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const qrRef = useRef<HTMLDivElement>(null)
  const origin = useClientValue(() => window.location.origin, '')

  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  // page background, separate from the profile photo (barbers.cover_url)
  const [cover, setCover] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [address, setAddress] = useState('')
  const [accent, setAccent] = useState('#111827')
  const [links, setLinks] = useState<SocialLink[]>([])
  const [blocks, setBlocks] = useState<PageBlock[]>([])

  const [status, setStatus] = useState<'' | 'saving' | 'saved' | 'error'>('')
  const [previewKey, setPreviewKey] = useState(0)
  const [copied, setCopied] = useState(false)

  // add-forms
  const [platform, setPlatform] = useState<string>('instagram')
  const [socialInput, setSocialInput] = useState('')
  const [socialError, setSocialError] = useState('')
  const [blockType, setBlockType] = useState<'link' | 'embed' | null>(null)
  const [blockTitle, setBlockTitle] = useState('')
  const [blockUrl, setBlockUrl] = useState('')
  const [blockError, setBlockError] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('barbers')
        .select('slug, name, photo_url, cover_url, bio, address, accent, links, blocks').eq('user_id', user.id).single()
      if (!data) return
      setSlug(data.slug ?? '')
      setName(data.name ?? '')
      setPhoto(data.photo_url ?? null)
      setCover(data.cover_url ?? null)
      setBio(data.bio ?? '')
      setAddress(data.address ?? '')
      if (isHexColor(data.accent)) setAccent(data.accent)
      setLinks(Array.isArray(data.links) ? data.links : [])
      setBlocks(Array.isArray(data.blocks) ? data.blocks : [])
    })()
  }, [])

  // Save some columns of the barber's row, then refresh the phone preview
  async function save(patch: Record<string, unknown>) {
    setStatus('saving')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setStatus('error'); return }
    const { error } = await supabase.from('barbers').update(patch).eq('user_id', user.id)
    if (error) { setStatus('error'); return }
    setStatus('saved')
    setPreviewKey(k => k + 1)
    setTimeout(() => setStatus(s => (s === 'saved' ? '' : s)), 1800)
  }

  const chooseAccent = (color: string) => {
    if (!isHexColor(color)) return
    setAccent(color)
    save({ accent: color })
  }

  // ── social icons
  const addSocial = () => {
    setSocialError('')
    if (links.length >= MAX_SOCIALS) { setSocialError(`You can add up to ${MAX_SOCIALS} icons.`); return }
    const url = platform === 'whatsapp' ? whatsappUrl(socialInput) : safeUrl(socialInput)
    if (!url) { setSocialError(platform === 'whatsapp' ? 'Enter a phone number with country code.' : 'That doesn’t look like a valid link.'); return }
    const next = [...links.filter(l => l.platform !== platform), { platform, url }]
    setLinks(next); setSocialInput('')
    save({ links: next })
  }
  const removeSocial = (p: string) => {
    const next = links.filter(l => l.platform !== p)
    setLinks(next); save({ links: next })
  }

  // ── blocks
  const addBlock = () => {
    setBlockError('')
    if (!blockType) return
    if (blocks.length >= MAX_BLOCKS) { setBlockError(`You can add up to ${MAX_BLOCKS} blocks.`); return }
    let url: string | null
    if (blockType === 'embed') {
      const id = youtubeId(blockUrl)
      url = id ? `https://www.youtube.com/watch?v=${id}` : null
      if (!url) { setBlockError('Paste a YouTube video link (youtube.com/watch?v=… or youtu.be/…).'); return }
    } else {
      url = safeUrl(blockUrl)
      if (!url) { setBlockError('That doesn’t look like a valid link.'); return }
    }
    const title = blockTitle.trim().slice(0, 60) || (blockType === 'embed' ? 'Video' : 'Link')
    const next = [...blocks, { id: newId(), type: blockType, title, url }]
    setBlocks(next); setBlockTitle(''); setBlockUrl(''); setBlockType(null)
    save({ blocks: next })
  }
  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]; [next[i], next[j]] = [next[j], next[i]]
    setBlocks(next); save({ blocks: next })
  }
  const removeBlock = (id: string) => {
    const next = blocks.filter(b => b.id !== id)
    setBlocks(next); save({ blocks: next })
  }

  // ── profile
  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file, 1200)
    setPhoto(dataUrl); save({ photo_url: dataUrl })
  }

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file, 1600)
    setCover(dataUrl); save({ cover_url: dataUrl })
  }

  const url = slug ? `${origin}/b/${slug}` : ''
  const copy = () => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // Turn the on-screen QR (SVG) into a large PNG with a white margin, ready to print
  const downloadQr = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const img = new Image()
    img.onload = () => {
      const size = 1200, pad = 90
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2)
      const a = document.createElement('a')
      a.download = `snippr-${slug || 'booking'}-qr.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg))
  }

  const statusText = status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved — live on your page' : status === 'error' ? 'Could not save, try again' : ''

  return (
    <div style={{ minHeight: '100vh', background: GLASS_PAGE_WASH, fontFamily: SANS, color: INK, fontWeight: 500 }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: 'none' }} />
      <input ref={coverRef} type="file" accept="image/*" onChange={onPickCover} style={{ display: 'none' }} />
      <style>{`
        .link-editor { display: grid; gap: 22px; grid-template-columns: 1fr; }
        @media (min-width: 1180px) { .link-editor { grid-template-columns: 330px 330px minmax(0, 1fr); align-items: start; } .link-preview { position: sticky; top: 24px; } }
        .theme-tile { transition: transform .15s, box-shadow .15s; }
        .theme-tile:hover { transform: translateY(-2px); }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 28px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <button onClick={() => router.back()} style={{ ...glass(), display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '7px 14px', borderRadius: 999, color: INK, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
              Back
            </button>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Booking link</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: MUTED }}>Make your page yours — every change shows up live on the phone.</p>
          </div>
          {/* link pill */}
          <div style={{ ...glass(true), display: 'flex', alignItems: 'center', gap: 8, padding: 6, paddingLeft: 14, borderRadius: 999, maxWidth: '100%' }}>
            <span style={{ fontSize: 13.5, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{url || 'Loading…'}</span>
            <button onClick={copy} disabled={!url} style={{ ...darkBtn, borderRadius: 999, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
            </button>
            {url && <a href={url} target="_blank" rel="noopener noreferrer" style={{ ...lightBtn, borderRadius: 999, padding: '8px 12px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}><ExternalLink size={15} /></a>}
          </div>
        </div>

        <div className="link-editor">
          {/* ── LEFT: customize ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <section style={panel}>
              <p style={panelTitle}><Palette size={17} /> Customize</p>
              {PAGE_THEMES.map(group => (
                <div key={group.group} style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, margin: '0 0 8px', color: INK }}>{group.group}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
                    {group.items.map(t => {
                      const on = accent.toLowerCase() === t.accent.toLowerCase()
                      return (
                        <button key={t.name} className="theme-tile" onClick={() => chooseAccent(t.accent)} title={t.name}
                          style={{ position: 'relative', padding: 0, border: on ? `2px solid ${INK}` : '2px solid transparent', borderRadius: 16, cursor: 'pointer', background: 'none', boxShadow: on ? '0 6px 16px rgba(30,30,60,0.18)' : '0 2px 6px rgba(30,30,60,0.06)' }}>
                          {/* mini page */}
                          <div style={{ position: 'relative', height: 84, borderRadius: 14, overflow: 'hidden', background: wallpaper(t.accent) }}>
                            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '58%', height: '64%', borderRadius: 10, background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.9)' }} />
                              <span style={{ width: '70%', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.9)' }} />
                              <span style={{ width: '70%', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.7)' }} />
                            </div>
                          </div>
                          <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: INK, marginTop: 5 }}>{t.name}</span>
                          {on && <span style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: '50%', background: '#14b8a6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}><Check size={12} strokeWidth={3} /></span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: 13.5, color: MUTED, cursor: 'pointer' }}>
                <input type="color" value={accent} onChange={e => setAccent(e.target.value)} onBlur={e => chooseAccent(e.target.value)}
                  style={{ width: 34, height: 34, border: 'none', borderRadius: 10, padding: 0, background: 'none', cursor: 'pointer' }} />
                Or pick your own colour
              </label>
            </section>

            <section style={panel}>
              <p style={panelTitle}><ImagePlus size={17} /> Background</p>
              {/* what customers see behind the glass panel */}
              <div style={{ position: 'relative', height: 120, borderRadius: 18, overflow: 'hidden', marginBottom: 12,
                background: cover ? '#111' : wallpaper(accent) }}>
                {cover && <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(3px)', transform: 'scale(1.06)' }} />}
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 64, height: 84, borderRadius: 16, background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} />
              </div>
              <p style={{ fontSize: 12.5, color: MUTED, margin: '0 0 12px', lineHeight: 1.5 }}>
                {cover ? 'Your own background photo, shown softly blurred behind your page.' : 'No background photo — your page uses the wallpaper of your theme above. Your profile photo is separate.'}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => coverRef.current?.click()} style={{ ...darkBtn, padding: '8px 13px', fontSize: 13 }}>{cover ? 'Change background' : 'Add background photo'}</button>
                {cover && <button onClick={() => { setCover(null); save({ cover_url: null }) }} style={{ ...lightBtn, padding: '8px 13px', fontSize: 13 }}>Use theme wallpaper</button>}
              </div>
            </section>

            <section style={panel}>
              <p style={panelTitle}><ImagePlus size={17} /> Profile</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, overflow: 'hidden', flexShrink: 0, background: photo ? '#111' : `linear-gradient(160deg, ${accent}, #1a1a1a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24 }}>
                  {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (name || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => fileRef.current?.click()} style={{ ...darkBtn, padding: '8px 13px', fontSize: 13 }}>{photo ? 'Change photo' : 'Add photo'}</button>
                  {photo && <button onClick={() => { setPhoto(null); save({ photo_url: null }) }} style={{ ...lightBtn, padding: '8px 13px', fontSize: 13 }}>Remove</button>}
                </div>
              </div>
              <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                placeholder="A line about you or your shop — e.g. Fades, beards & hot-towel shaves. Walk-ins welcome."
                style={{ ...field, resize: 'vertical', lineHeight: 1.5 }} />
              <div style={{ marginTop: 10 }}>
                <AddressAutocomplete value={address} onChange={setAddress} placeholder="Shop address"
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9b9a97" strokeWidth="2" style={{ position: 'absolute', left: 13, top: 15, pointerEvents: 'none' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
                  inputStyle={{ ...field, paddingLeft: 38 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontSize: 12, color: MUTED }}>{bio.length}/300</span>
                <button onClick={() => save({ bio: bio.trim(), address: address.trim() })} style={{ ...darkBtn, padding: '8px 16px', fontSize: 13 }}>Save</button>
              </div>
            </section>
          </div>

          {/* ── MIDDLE: live phone preview ── */}
          <div className="link-preview" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 312, height: 640, borderRadius: 52, padding: 11, background: 'linear-gradient(145deg, #2a2a2e, #0f0f11)', boxShadow: '0 30px 60px rgba(30,30,60,0.28), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 42, overflow: 'hidden', background: '#ecebe8' }}>
                {/* status bar + dynamic island, drawn over the page like on a real iPhone */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 0 30px', color: '#fff', fontSize: 13, fontWeight: 600, pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
                  <span>9:41</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {/* signal */}
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.3" y="5" width="3" height="6" rx="1" /><rect x="8.6" y="2.5" width="3" height="8.5" rx="1" /><rect x="12.9" y="0" width="3" height="11" rx="1" /></svg>
                    {/* wifi */}
                    <svg width="15" height="11" viewBox="0 0 15 11" fill="#fff"><path d="M7.5 2.2c2.1 0 4 .8 5.5 2.2l1.1-1.1A9.3 9.3 0 0 0 7.5.6 9.3 9.3 0 0 0 .9 3.3L2 4.4a7.7 7.7 0 0 1 5.5-2.2Zm0 3.2c1.2 0 2.3.5 3.2 1.3l1.1-1.1a6.2 6.2 0 0 0-8.6 0l1.1 1.1c.9-.8 2-1.3 3.2-1.3Zm0 3.2c-.4 0-.8.2-1.1.5L7.5 10.2l1.1-1.1a1.6 1.6 0 0 0-1.1-.5Z" /></svg>
                    {/* battery */}
                    <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="#fff" strokeOpacity="0.5" /><rect x="2" y="2" width="16" height="8" rx="2" fill="#fff" /><path d="M23 4v4c.8-.3 1.3-1 1.3-2s-.5-1.7-1.3-2Z" fill="#fff" fillOpacity="0.5" /></svg>
                  </span>
                </div>
                <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 88, height: 25, borderRadius: 20, background: '#000', zIndex: 3 }} />
                {url ? (
                  <iframe key={previewKey} src={`${url}?preview=1`} title="Your booking page"
                    style={{ width: 390, height: 618 / 0.745, border: 'none', transform: 'scale(0.745)', transformOrigin: 'top left' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 13 }}>Loading preview…</div>
                )}
              </div>
            </div>
            <span style={{ fontSize: 12.5, minHeight: 18, color: status === 'error' ? '#dc2626' : status === 'saved' ? '#15803d' : MUTED, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {status === 'saved' && <Check size={13} />}{statusText || 'Live preview of your page'}
            </span>
          </div>

          {/* ── RIGHT: add social icons, blocks, share ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <section style={panel}>
              <p style={panelTitle}><Plus size={17} /> Social icons</p>
              {links.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {links.map(l => {
                    const Icon = SOCIAL_ICON[l.platform] ?? FaGlobe
                    return (
                      <div key={l.platform} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 14, background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <span style={{ width: 30, height: 30, borderRadius: 9, background: INK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={15} /></span>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url.replace(/^https?:\/\//, '')}</span>
                        <button onClick={() => removeSocial(l.platform)} title="Remove" style={iconBtn}><Trash2 size={14} /></button>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ ...field, width: 130, flexShrink: 0 }}>
                  {SOCIAL_PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
                <input value={socialInput} onChange={e => setSocialInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addSocial() }}
                  placeholder={SOCIAL_PLATFORMS.find(p => p.key === platform)?.placeholder} style={field} />
                <button onClick={addSocial} style={darkBtn}>Add</button>
              </div>
              {socialError && <p style={{ fontSize: 12.5, color: '#dc2626', margin: '8px 0 0' }}>{socialError}</p>}
            </section>

            <section style={panel}>
              <p style={panelTitle}><Link2 size={17} /> Add blocks</p>
              {/* block type cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {([
                  { type: 'link' as const, icon: Link2, title: 'Link button', sub: 'Price list, Instagram post, gift card shop…' },
                  { type: 'embed' as const, icon: PlaySquare, title: 'YouTube video', sub: 'Show your work: a cut, a transformation' },
                ]).map(o => {
                  const on = blockType === o.type
                  const Icon = o.icon
                  return (
                    <button key={o.type} onClick={() => { setBlockType(on ? null : o.type); setBlockError('') }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 16, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        background: on ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)', border: on ? '1.5px solid #5eead4' : '1px solid rgba(0,0,0,0.06)', boxShadow: on ? '0 0 0 4px rgba(94,234,212,0.18)' : 'none' }}>
                      <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK, flexShrink: 0 }}><Icon size={18} /></span>
                      <span>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: INK }}>{o.title}</span>
                        <span style={{ display: 'block', fontSize: 12.5, color: '#0f766e' }}>{o.sub}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {blockType && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  <input value={blockTitle} onChange={e => setBlockTitle(e.target.value)} maxLength={60}
                    placeholder={blockType === 'embed' ? 'Title — e.g. Skin fade in 60 seconds' : 'Button text — e.g. See my price list'} style={field} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={blockUrl} onChange={e => setBlockUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addBlock() }}
                      placeholder={blockType === 'embed' ? 'Paste a YouTube link…' : 'Paste or type a link…'} style={field} />
                    <button onClick={addBlock} style={darkBtn}>Add</button>
                  </div>
                  {blockError && <p style={{ fontSize: 12.5, color: '#dc2626', margin: 0 }}>{blockError}</p>}
                </div>
              )}

              {blocks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, margin: 0 }}>On your page</p>
                  {blocks.map((b, i) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 14, background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {b.type === 'embed' ? <PlaySquare size={15} /> : <Link2 size={15} />}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                        <span style={{ display: 'block', fontSize: 11.5, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.url.replace(/^https?:\/\//, '')}</span>
                      </span>
                      <button onClick={() => moveBlock(i, -1)} disabled={i === 0} title="Move up" style={{ ...iconBtn, opacity: i === 0 ? 0.35 : 1 }}><ChevronUp size={15} /></button>
                      <button onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} title="Move down" style={{ ...iconBtn, opacity: i === blocks.length - 1 ? 0.35 : 1 }}><ChevronDown size={15} /></button>
                      <button onClick={() => removeBlock(b.id)} title="Remove" style={iconBtn}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {url && (
              <section style={{ ...panel, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div ref={qrRef} style={{ background: '#fff', padding: 10, borderRadius: 14, lineHeight: 0, boxShadow: '0 2px 8px rgba(30,30,60,0.08)' }}>
                  <QRCode value={url} size={112} />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>QR code for your shop</p>
                  <p style={{ fontSize: 12.5, color: MUTED, margin: '4px 0 12px', lineHeight: 1.5 }}>Print it for your window or counter — customers scan and book.</p>
                  <button onClick={downloadQr} style={{ ...darkBtn, padding: '8px 14px', fontSize: 13 }}>Download QR (PNG)</button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
