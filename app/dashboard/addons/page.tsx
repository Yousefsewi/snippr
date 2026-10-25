'use client'

// Add-ons & integrations: everything extra Snippr can do, with honest status badges.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3, Bot, CalendarSync, CreditCard, Crown, Download, Gem, Globe, Headphones, Hourglass, MapPin, MessagesSquare, Star, X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { useClientValue } from '@/lib/use-stored'
import { InstagramIcon, WhatsAppIcon } from '@/components/brand-icons'

type Icon = React.ComponentType<{ size?: number; strokeWidth?: number }>

type Status = 'active' | 'free' | 'soon' | 'setup'
type Addon = { id: string; icon: Icon; grad: string; title: string; desc: string; status: Status; href?: string; action?: () => void; beta?: boolean }

const COPY = {
  en: {
    title: 'Snippr add-ons', sub: 'Take your business to the next level with Snippr add-ons.', tabs: { addons: 'Add-ons', integrations: 'Integrations' },
    view: 'View', badge: { active: 'Active', free: 'Free', soon: 'Coming soon', setup: 'Set up' } as Record<Status, string>,
    a: {
      messages: ['Automated messages', 'Confirmations, cancellations and thank-you emails that go to clients on their own.'],
      google: ['Google review boost', 'Ask happy clients for a Google review right after their visit and get found more.'],
      analytics: ['Sales reports', 'Daily, weekly and monthly sales, payments and tips, ready to export.'],
      waitlist: ['Waitlist', 'Clients join when you’re full; book them in one tap when a spot opens.'],
      export: ['Data export', 'Export appointments and sales to PDF, CSV or Excel for your accountant.'],
      site: ['Your booking page', 'Your own page with photo, services, links and online booking.'],
      support: ['Support', 'Questions? Write to us and a real person answers.'],
      payments: ['Online payments', 'Take deposits and payments online when clients book.'],
      loyalty: ['Client loyalty', 'Reward regulars with points and offers so they keep coming back.'],
      memberships: ['Memberships', 'Monthly plans with perks for your regular clients.'],
      ai: ['AI assistant', 'Answers client questions and takes bookings for you, day and night.'],
    },
    i: {
      social: ['Instagram & Facebook', 'Add a “Book now” button to your Instagram and Facebook pages.'],
      whatsapp: ['WhatsApp', 'Share your booking link with clients in one tap.'],
      maps: ['Google Maps', 'Put your booking link on your Google Business profile.'],
      gcal: ['Google Calendar', 'See your Snippr appointments in your Google Calendar.'],
    },
    gTitle: 'Google review link', gBody: 'Paste the review link from your Google Business profile. It goes into the “Thanks for your visit” email.',
    gHow: 'Where do I find it? Google Business Profile → “Ask for reviews” → copy the link.', gPh: 'https://g.page/r/…/review', gSave: 'Save', gRemove: 'Remove', gBad: 'The link must start with https://',
    gSetup: 'Run supabase/messages.sql in the Supabase SQL Editor first.', saving: 'Saving…',
    waMsg: 'Book your appointment with me here:',
  },
  tr: {
    title: 'Snippr eklentileri', sub: 'Snippr eklentileri ile işini bir üst seviyeye taşı.', tabs: { addons: 'Eklentiler', integrations: 'Entegrasyonlar' },
    view: 'Görüntüle', badge: { active: 'Aktif', free: 'Ücretsiz', soon: 'Yakında', setup: 'Kurulum' } as Record<Status, string>,
    a: {
      messages: ['Otomatik mesajlar', 'Onay, iptal ve teşekkür e-postaları müşterilere kendiliğinden gider.'],
      google: ['Google değerlendirme desteği', 'Mutlu müşterilerinden ziyaretten hemen sonra Google yorumu iste, daha çok bulun.'],
      analytics: ['Satış raporları', 'Günlük, haftalık ve aylık satış, ödeme ve bahşiş raporları; dışa aktarmaya hazır.'],
      waitlist: ['Bekleme listesi', 'Dolu olduğunda müşteriler listeye katılır; yer açılınca tek dokunuşla randevu ver.'],
      export: ['Veri dışa aktarma', 'Randevu ve satışları muhasebecin için PDF, CSV ya da Excel olarak indir.'],
      site: ['Randevu sayfan', 'Fotoğraflı, hizmetli, linkli ve online randevulu kendi sayfan.'],
      support: ['Destek', 'Sorun mu var? Bize yaz, gerçek bir insan cevap verir.'],
      payments: ['Online ödemeler', 'Müşteriler randevu alırken kapora ya da ödemeyi online al.'],
      loyalty: ['Müşteri sadakati', 'Düzenli müşterilerini puan ve tekliflerle ödüllendir, tekrar gelsinler.'],
      memberships: ['Üyelikler', 'Düzenli müşterilerin için avantajlı aylık planlar.'],
      ai: ['Yapay zeka asistanı', 'Gece gündüz müşteri sorularını yanıtlar ve senin yerine randevu alır.'],
    },
    i: {
      social: ['Instagram ve Facebook', 'Instagram ve Facebook sayfalarına “Randevu al” butonu ekle.'],
      whatsapp: ['WhatsApp', 'Randevu linkini müşterilerine tek dokunuşla gönder.'],
      maps: ['Google Haritalar', 'Randevu linkini Google İşletme profiline ekle.'],
      gcal: ['Google Takvim', 'Snippr randevularını Google Takvim’inde gör.'],
    },
    gTitle: 'Google yorum linki', gBody: 'Google İşletme profilindeki yorum linkini yapıştır. “Ziyaret için teşekkürler” e-postasına eklenir.',
    gHow: 'Nerede bulurum? Google İşletme Profili → “Yorum iste” → linki kopyala.', gPh: 'https://g.page/r/…/review', gSave: 'Kaydet', gRemove: 'Kaldır', gBad: 'Link https:// ile başlamalı.',
    gSetup: 'Önce supabase/messages.sql dosyasını Supabase SQL Editor’da çalıştır.', saving: 'Kaydediliyor…',
    waMsg: 'Randevunu buradan alabilirsin:',
  },
}

const G = {
  blue: 'linear-gradient(145deg,#5ac8fa,#0a63e8)', purple: 'linear-gradient(145deg,#b18cff,#6a3df0)', orange: 'linear-gradient(145deg,#ffc24d,#ff7a00)',
  pink: 'linear-gradient(145deg,#ff8ab4,#e0307a)', green: 'linear-gradient(145deg,#7be38f,#1fa44a)', teal: 'linear-gradient(145deg,#5fe3d0,#0f9c9c)',
  indigo: 'linear-gradient(145deg,#8b9bff,#4b4fe0)', red: 'linear-gradient(145deg,#ff8a80,#e53935)', grey: 'linear-gradient(145deg,#c9c9ce,#8e8e93)',
  insta: 'linear-gradient(145deg,#feda75,#fa7e1e 30%,#d62976 60%,#962fbf 85%,#4f5bd5)',
}

export default function AddonsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = COPY[lng]

  const [tab, setTab] = useState<'addons' | 'integrations'>('addons')
  const [barber, setBarber] = useState<{ id: string; slug: string } | null>(null)
  const [review, setReview] = useState('')
  const [hasReview, setHasReview] = useState(false)
  const [ready, setReady] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const askedFromUrl = useClientValue(() => new URLSearchParams(window.location.search).has('google'), false)
  const [googleOpen, setGoogleOpen] = useState<boolean | null>(null)
  const showGoogle = googleOpen ?? askedFromUrl
  const origin = useClientValue(() => window.location.origin, '')

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: b } = await supabase.from('barbers').select('id, slug').eq('user_id', user.id).single()
      if (!b || !active) return
      setBarber(b)
      const { data: g, error } = await supabase.from('barbers').select('google_review_url').eq('id', b.id).single()
      if (!active) return
      if (error) { setReady(false); return }
      setReview(g?.google_review_url ?? ''); setHasReview(!!g?.google_review_url)
    })()
    return () => { active = false }
  }, [])

  async function saveReview(value: string) {
    if (!barber) return
    const v = value.trim()
    if (v && !/^https:\/\//i.test(v)) return setErr(t.gBad)
    setSaving(true); setErr('')
    const { error } = await supabase.from('barbers').update({ google_review_url: v || null }).eq('id', barber.id)
    setSaving(false)
    if (error) return setErr(error.message)
    setReview(v); setHasReview(!!v); setGoogleOpen(false)
  }

  const link = barber ? `${origin}/b/${barber.slug}` : ''
  const A = t.a, I = t.i
  const addons: Addon[] = [
    { id: 'messages', icon: MessagesSquare, grad: G.purple, title: A.messages[0], desc: A.messages[1], status: 'active', href: '/dashboard/messages' },
    { id: 'google', icon: Star, grad: G.orange, title: A.google[0], desc: A.google[1], status: hasReview ? 'active' : 'setup', action: () => { setErr(''); setGoogleOpen(true) } },
    { id: 'analytics', icon: BarChart3, grad: G.indigo, title: A.analytics[0], desc: A.analytics[1], status: 'active', href: '/dashboard/sales' },
    { id: 'waitlist', icon: Hourglass, grad: G.teal, title: A.waitlist[0], desc: A.waitlist[1], status: 'active', href: '/dashboard/waitlist' },
    { id: 'export', icon: Download, grad: G.green, title: A.export[0], desc: A.export[1], status: 'active', href: '/dashboard/appointments' },
    { id: 'site', icon: Globe, grad: G.blue, title: A.site[0], desc: A.site[1], status: 'active', href: '/dashboard/link' },
    { id: 'support', icon: Headphones, grad: G.indigo, title: A.support[0], desc: A.support[1], status: 'free', href: '/dashboard/help' },
    { id: 'payments', icon: CreditCard, grad: G.grey, title: A.payments[0], desc: A.payments[1], status: 'soon' },
    { id: 'loyalty', icon: Gem, grad: G.grey, title: A.loyalty[0], desc: A.loyalty[1], status: 'soon' },
    { id: 'memberships', icon: Crown, grad: G.grey, title: A.memberships[0], desc: A.memberships[1], status: 'soon' },
    { id: 'ai', icon: Bot, grad: G.grey, title: A.ai[0], desc: A.ai[1], status: 'soon', beta: true },
  ]
  const integrations: Addon[] = [
    { id: 'social', icon: InstagramIcon, grad: G.insta, title: I.social[0], desc: I.social[1], status: 'active', href: '/dashboard/addons/social' },
    { id: 'whatsapp', icon: WhatsAppIcon, grad: 'linear-gradient(145deg,#5ff07f,#1ebe57)', title: I.whatsapp[0], desc: I.whatsapp[1], status: 'active', action: () => { if (link) window.open(`https://wa.me/?text=${encodeURIComponent(`${t.waMsg} ${link}`)}`, '_blank', 'noopener') } },
    { id: 'maps', icon: MapPin, grad: G.red, title: I.maps[0], desc: I.maps[1], status: 'active', href: '/dashboard/addons/social#google' },
    { id: 'gcal', icon: CalendarSync, grad: G.grey, title: I.gcal[0], desc: I.gcal[1], status: 'soon' },
  ]
  const list = tab === 'addons' ? addons : integrations

  const badgeStyle: Record<Status, React.CSSProperties> = {
    active: { background: '#e9f6ec', color: '#1c6b3f' }, free: { background: '#e6f0ff', color: '#1d5bd6' },
    soon: { background: '#f1f1ef', color: '#9b9a97' }, setup: { background: '#fff4e0', color: '#9a6516' },
  }

  return (
    <div className="pb-16" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <h1 className="text-[30px] font-bold tracking-[-0.02em] text-[#37352f]">{t.title}</h1>
      <p className="mt-1 text-[15px] text-[#787774]">{t.sub}</p>

      <div className="mt-6 flex gap-1.5">
        {(['addons', 'integrations'] as const).map(k => (
          <button key={k} onClick={() => setTab(k)} className="relative rounded-full px-4 py-2 text-[14.5px] font-semibold" style={{ color: tab === k ? '#fff' : '#37352f' }}>
            {tab === k && <motion.span layoutId="addon-tab" className="absolute inset-0 rounded-full bg-[#37352f]" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
            <span className="relative">{t.tabs[k]}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(a => {
            const clickable = !!(a.href || a.action) && a.status !== 'soon'
            const Inner = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[14px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-10px_rgba(0,0,0,0.4)]" style={{ background: a.grad }}>
                    <a.icon size={23} strokeWidth={2} />
                  </span>
                  <span className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={badgeStyle[a.status]}>{t.badge[a.status]}</span>
                </div>
                <h3 className="mt-5 text-[16px] font-semibold text-[#37352f]">
                  {a.title}{a.beta && <span className="ml-1.5 text-[13px] font-semibold text-[#d6409f]">| Beta</span>}
                </h3>
                <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-[#787774]">{a.desc}</p>
                {a.status !== 'soon' && (
                  <span className="mt-5 self-start rounded-full border border-[#e3e2e0] px-4 py-1.5 text-[13.5px] font-semibold text-[#37352f] transition group-hover:bg-[#f7f7f5]">{t.view}</span>
                )}
              </>
            )
            const cls = `group flex min-h-[230px] flex-col rounded-[22px] border border-[#ededec] bg-white p-5 text-left transition ${clickable ? 'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]' : 'opacity-70'}`
            if (a.href && a.status !== 'soon') return <Link key={a.id} href={a.href} className={cls}>{Inner}</Link>
            if (a.action) return <button key={a.id} onClick={a.action} className={cls}>{Inner}</button>
            return <div key={a.id} className={cls}>{Inner}</div>
          })}
        </motion.div>
      </AnimatePresence>

      {/* Google review link */}
      <AnimatePresence>
        {showGoogle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setGoogleOpen(false); router.replace('/dashboard/addons') }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-t-[24px] bg-white p-6 shadow-2xl sm:rounded-[24px]">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] text-white" style={{ background: G.orange }}><Star size={21} /></span>
                <button onClick={() => { setGoogleOpen(false); router.replace('/dashboard/addons') }} className="rounded-full p-1.5 text-[#787774] hover:bg-[#f1f1ef]" aria-label="Close"><X size={18} /></button>
              </div>
              <h3 className="mt-4 text-[19px] font-bold text-[#37352f]">{t.gTitle}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#787774]">{t.gBody}</p>
              {!ready ? (
                <p className="mt-4 rounded-xl bg-[#fff8e6] p-3 text-[13.5px] text-[#5c4300]">{t.gSetup}</p>
              ) : (
                <>
                  <input value={review} onChange={e => setReview(e.target.value)} placeholder={t.gPh} maxLength={500} inputMode="url"
                    className="mt-4 w-full rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-2.5 text-[15px] text-[#37352f] outline-none focus:border-[#37352f]" />
                  <p className="mt-2 text-[12.5px] text-[#9b9a97]">{t.gHow}</p>
                  {err && <p className="mt-2 text-[13.5px] font-medium text-[#e5484d]">{err}</p>}
                  <div className="mt-6 flex gap-3">
                    {hasReview && <button onClick={() => saveReview('')} disabled={saving} className="flex-1 rounded-full border border-[#e9e9e7] px-4 py-2.5 font-semibold text-[#a8302a] hover:bg-[#fdf0f0]">{t.gRemove}</button>}
                    <button onClick={() => saveReview(review)} disabled={saving} className="flex-1 rounded-full px-4 py-2.5 font-semibold text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>{saving ? t.saving : t.gSave}</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
