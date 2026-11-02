'use client'

// "Claim your link" near the bottom of the homepage: big heading, an italic second line,
// and a snipprcalendar.com/b/yourname box. It shows right away whether the name is free,
// and "Start" opens sign-up with that name (app/register reads ?slug=).
// Text uses div (the homepage recolours every <h2>/<p> in a section) and the button has
// the pd-btn class so the glass button style leaves it alone.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/site-url'

type Lng = 'en' | 'tr'

const COPY = {
  en: { big: 'More than a link', italic: 'Your shop’s home online', sub: 'Your services, prices, free times and bookings on one page.', ph: 'yourname', start: 'Start', login: 'or log in', free: 'Available', taken: 'Taken — try another', checking: 'Checking…' },
  tr: { big: 'Bir linkten fazlası', italic: 'Dükkânının internetteki evi', sub: 'Hizmetlerin, fiyatların, boş saatlerin ve randevuların tek sayfada.', ph: 'adın', start: 'Başla', login: 'veya giriş yap', free: 'Boşta', taken: 'Alınmış — başka bir ad dene', checking: 'Bakılıyor…' },
}

const host = SITE_URL.replace(/^https?:\/\//, '').replace(/^www\./, '')
const clean = (v: string) => v.toLowerCase().replace(/s+/g, '-').replace(/[^a-z0-9-]+/g, '').replace(/-{2,}/g, '-').slice(0, 40)

export default function ClaimLink({ lng }: { lng: Lng }) {
  const c = COPY[lng] ?? COPY.en
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle')

  // is the name free? (asked 400 ms after typing stops)
  useEffect(() => {
    const s = slug.replace(/^-+|-+$/g, '')
    if (s.length < 2) return
    let stale = false
    const id = setTimeout(async () => {
      const { data, error } = await supabase.from('barbers').select('id').eq('slug', s).limit(1)
      if (!stale) setStatus(error ? 'idle' : data && data.length ? 'taken' : 'free')
    }, 400)
    return () => { stale = true; clearTimeout(id) }
  }, [slug])

  const onType = (v: string) => {
    const s = clean(v)
    setSlug(s)
    setStatus(s.replace(/^-+|-+$/g, '').length >= 2 ? 'checking' : 'idle')
  }
  const start = (e: React.FormEvent) => {
    e.preventDefault()
    const s = slug.replace(/^-+|-+$/g, '')
    router.push(s ? `/register?slug=${encodeURIComponent(s)}` : '/register')
  }

  return (
    <section className="claim-link px-5 py-20 md:px-10 lg:py-24" style={{ background: 'transparent' }}>
      <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[40px] px-6 py-20 text-center md:py-28">
        {/* background: the shop photo, darkened */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/barbershop-cover.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" style={{ transform: 'scale(1.05)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(20,14,10,0.55) 0%, rgba(16,12,10,0.72) 60%, rgba(12,10,9,0.85) 100%)' }} />

        <div className="relative">
          <div role="heading" aria-level={2} className="font-semibold tracking-[-0.035em] text-[#f6f1ea]" style={{ fontSize: 'clamp(40px, 7vw, 92px)', lineHeight: 1 }}>
            {c.big}
          </div>
          <div className="mt-2 text-[#e2c39a]" style={{ fontFamily: 'var(--font-noto-serif), Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(36px, 6.2vw, 84px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            {c.italic}
          </div>
          <div className="mx-auto mt-7 max-w-[520px] text-[16px] font-medium text-white/85 md:text-[18px]">{c.sub}</div>

          <form onSubmit={start} className="mx-auto mt-9 flex max-w-[560px] items-center gap-2 rounded-full p-1.5 pl-6 text-left"
            style={{ background: 'rgba(30,22,18,0.6)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
            <label className="flex min-w-0 flex-1 items-baseline text-[16px] md:text-[17px]">
              <span className="flex-shrink-0 font-semibold text-white">{host}/b/</span>
              <input value={slug} onChange={e => onType(e.target.value)} placeholder={c.ph} aria-label={c.ph}
                autoCapitalize="none" autoCorrect="off" spellCheck={false}
                className="min-w-0 flex-1 bg-transparent font-medium text-white outline-none placeholder:text-white/45" />
            </label>
            <button type="submit" className="pd-btn flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold"
              style={{ background: '#f6f1ea', color: '#1d1d1f' }}>
              {c.start} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-3 h-5 text-[13.5px] font-medium" aria-live="polite">
            {status === 'checking' && <span className="text-white/60">{c.checking}</span>}
            {status === 'free' && <span className="inline-flex items-center gap-1.5 text-[#8fe0a6]"><Check size={14} />{c.free}</span>}
            {status === 'taken' && <span className="inline-flex items-center gap-1.5 text-[#ffb4a8]"><X size={14} />{c.taken}</span>}
          </div>
          <Link href="/login" className="mt-2 inline-block text-[15px] font-semibold text-white/90 hover:text-white">{c.login}</Link>
        </div>
      </div>
    </section>
  )
}
