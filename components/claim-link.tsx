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
const clean = (v: string) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '').replace(/-{2,}/g, '-').slice(0, 40)

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
    <section className="claim-link px-5 py-20 md:px-10 lg:py-28" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-[760px] text-center">
        <div role="heading" aria-level={2} className="font-semibold tracking-[-0.035em] text-[#1d1d1f]" style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.02 }}>
          {c.big}
        </div>
        <div className="mt-1 text-[#1d1d1f]/55" style={{ fontFamily: 'var(--font-noto-serif), Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(32px, 5.2vw, 64px)', lineHeight: 1.08, letterSpacing: '-0.02em' }}>
          {c.italic}
        </div>
        <div className="mx-auto mt-6 max-w-[480px] text-[16px] text-[#1d1d1f]/65 md:text-[17px]">{c.sub}</div>

        <form onSubmit={start} className="mx-auto mt-9 flex max-w-[540px] items-center gap-2 rounded-full bg-white p-1.5 pl-6 text-left"
          style={{ border: '1px solid rgba(29,29,31,0.12)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
          <label className="flex min-w-0 flex-1 items-baseline text-[16px]">
            <span className="flex-shrink-0 font-medium text-[#1d1d1f]">{host}/b/</span>
            <input value={slug} onChange={e => onType(e.target.value)} placeholder={c.ph} aria-label={c.ph}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-[#1d1d1f] outline-none placeholder:text-[#1d1d1f]/35" />
          </label>
          <button type="submit" className="pd-btn flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold"
            style={{ background: '#1d1d1f', color: '#ffffff' }}>
            {c.start} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-3 h-5 text-[13.5px] font-medium" aria-live="polite">
          {status === 'checking' && <span className="text-[#1d1d1f]/45">{c.checking}</span>}
          {status === 'free' && <span className="inline-flex items-center gap-1.5 text-[#1f9d55]"><Check size={14} />{c.free}</span>}
          {status === 'taken' && <span className="inline-flex items-center gap-1.5 text-[#c62828]"><X size={14} />{c.taken}</span>}
        </div>
        <Link href="/login" className="mt-1 inline-block text-[14.5px] font-medium text-[#1d1d1f]/60 underline-offset-4 hover:text-[#1d1d1f] hover:underline">{c.login}</Link>
      </div>
    </section>
  )
}
