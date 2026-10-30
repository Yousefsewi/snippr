'use client'

// Get bookings from Instagram, Facebook, Google and WhatsApp: a step-by-step guide
// with the barber's own booking link ready to copy.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Copy, ExternalLink, MapPin, QrCode } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/site-url'
import { useLang } from '@/lib/i18n'
import { useClientValue } from '@/lib/use-stored'
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/brand-icons'

type Tab = 'instagram' | 'facebook' | 'google' | 'whatsapp'

const COPY = {
  en: {
    back: 'Add-ons', label: 'Facebook and Instagram bookings', h1: 'Take bookings on Instagram and Facebook',
    sub: 'Put your Snippr booking link on your social pages so followers can book in seconds.',
    b1: 'Free online booking for new and regular clients', b2: 'Works with your existing Instagram and Facebook pages', b3: 'Share it in stories, posts and ads too',
    included: 'Included in your plan', setup: 'Set it up now', copy: 'Copy link', copied: 'Copied!', yourLink: 'Your booking link', qr: 'QR code',
    book: 'Book now', posts: 'posts', followers: 'followers', following: 'following', message: 'Message', open: 'Open',
    how: 'How to set it up', tabs: { instagram: 'Instagram', facebook: 'Facebook', google: 'Google', whatsapp: 'WhatsApp' },
    steps: {
      instagram: [
        ['Open your profile', 'In the Instagram app, go to your profile and tap “Edit profile”.'],
        ['Add your link', 'Tap “Links” → “Add external link”, paste your booking link and name it “Book now”.'],
        ['Use it in stories', 'In a story, add the “Link” sticker, paste the same link and write “Book here”.'],
        ['Pin it', 'Save that story to a Highlight called “Book” so it stays on your profile.'],
      ],
      facebook: [
        ['Open your Page', 'Go to your Facebook business Page.'],
        ['Add a button', 'Tap “Add button” (or “Edit button”) under your cover photo.'],
        ['Choose “Book now”', 'Pick “Book now”, then “Link to website”.'],
        ['Paste your link', 'Paste your booking link and save. Test it with “Test button”.'],
      ],
      google: [
        ['Open your Business Profile', 'Search your shop name on Google or open Google Business Profile.'],
        ['Edit the profile', 'Tap “Edit profile” → “Contact”.'],
        ['Add an appointment link', 'Under “Appointment links”, paste your booking link and save.'],
        ['Done', 'A “Book” button shows on Google Search and Maps once Google approves it.'],
      ],
      whatsapp: [
        ['Open WhatsApp Business', 'Go to Settings → Business tools → Business profile.'],
        ['Add your link', 'Paste your booking link in the “Website” field.'],
        ['Away message', 'Under “Away message”, add: “Book here anytime:” and your link.'],
        ['Share it', 'Send the link to clients or post it in your Status.'],
      ],
    },
    tip: 'Tip: download your QR code and put it on the mirror or at the till — clients scan it and book.',
  },
  tr: {
    back: 'Eklentiler', label: 'Facebook ve Instagram rezervasyonları', h1: 'Instagram ve Facebook’ta randevu al',
    sub: 'Snippr randevu linkini sosyal medya sayfalarına ekle, takipçilerin saniyeler içinde randevu alsın.',
    b1: 'Hem yeni hem düzenli müşterilere ÜCRETSİZ online randevu', b2: 'Mevcut Instagram ve Facebook sayfalarınla çalışır', b3: 'Hikâyelerde, gönderilerde ve reklamlarda da paylaş',
    included: 'Planına dahildir', setup: 'Hemen yapılandır', copy: 'Linki kopyala', copied: 'Kopyalandı!', yourLink: 'Randevu linkin', qr: 'QR kod',
    book: 'Randevu al', posts: 'gönderi', followers: 'takipçi', following: 'takip', message: 'Mesaj', open: 'Aç',
    how: 'Nasıl kurulur?', tabs: { instagram: 'Instagram', facebook: 'Facebook', google: 'Google', whatsapp: 'WhatsApp' },
    steps: {
      instagram: [
        ['Profilini aç', 'Instagram uygulamasında profiline git ve “Profili düzenle”ye dokun.'],
        ['Linkini ekle', '“Bağlantılar” → “Harici bağlantı ekle”ye dokun, randevu linkini yapıştır ve adını “Randevu al” yap.'],
        ['Hikâyede kullan', 'Bir hikâyeye “Bağlantı” çıkartmasını ekle, aynı linki yapıştır ve “Buradan randevu al” yaz.'],
        ['Sabitle', 'O hikâyeyi “Randevu” adlı bir öne çıkana kaydet, profilinde hep dursun.'],
      ],
      facebook: [
        ['Sayfanı aç', 'Facebook işletme sayfana git.'],
        ['Buton ekle', 'Kapak fotoğrafının altındaki “Düğme ekle”ye (ya da “Düğmeyi düzenle”ye) dokun.'],
        ['“Şimdi rezervasyon yap”ı seç', '“Şimdi rezervasyon yap”ı, sonra “Web sitesine bağlantı”yı seç.'],
        ['Linkini yapıştır', 'Randevu linkini yapıştır ve kaydet. “Düğmeyi test et” ile dene.'],
      ],
      google: [
        ['İşletme profilini aç', 'Google’da dükkânının adını ara ya da Google İşletme Profili’ni aç.'],
        ['Profili düzenle', '“Profili düzenle” → “İletişim”e dokun.'],
        ['Randevu linki ekle', '“Randevu bağlantıları” kısmına randevu linkini yapıştır ve kaydet.'],
        ['Tamam', 'Google onaylayınca Arama ve Haritalar’da “Randevu al” butonu çıkar.'],
      ],
      whatsapp: [
        ['WhatsApp Business’ı aç', 'Ayarlar → İşletme araçları → İşletme profili’ne git.'],
        ['Linkini ekle', 'Randevu linkini “Web sitesi” alanına yapıştır.'],
        ['Uzakta mesajı', '“Uzakta mesajı”na şunu ekle: “Her zaman buradan randevu alabilirsin:” ve linkin.'],
        ['Paylaş', 'Linki müşterilerine gönder ya da Durum’unda paylaş.'],
      ],
    },
    tip: 'İpucu: QR kodunu indirip aynaya ya da kasaya koy — müşteriler okutup randevu alsın.',
  },
}

const TAB_STYLE: Record<Tab, { grad: string; Icon: React.ComponentType<{ size?: number }> }> = {
  instagram: { grad: 'linear-gradient(145deg,#feda75,#fa7e1e 30%,#d62976 60%,#962fbf 85%,#4f5bd5)', Icon: InstagramIcon },
  facebook: { grad: 'linear-gradient(145deg,#4c8dff,#1463e6)', Icon: FacebookIcon },
  google: { grad: 'linear-gradient(145deg,#ff8a80,#e53935)', Icon: ({ size }) => <MapPin size={size} /> },
  whatsapp: { grad: 'linear-gradient(145deg,#5ff07f,#1ebe57)', Icon: WhatsAppIcon },
}

export default function SocialPage() {
  const { lang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = COPY[lng]
  const origin = SITE_URL
  const startTab = useClientValue<Tab>(() => (window.location.hash === '#google' ? 'google' : 'instagram'), 'instagram')
  const [picked, setPicked] = useState<Tab | null>(null)
  const tab = picked ?? startTab
  const [barber, setBarber] = useState<{ name: string; slug: string; photo_url: string | null } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('barbers').select('name, slug, photo_url').eq('user_id', user.id).single()
      if (active && data) setBarber(data)
    })()
    return () => { active = false }
  }, [])

  const link = barber ? `${origin}/b/${barber.slug}` : ''
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* blocked */ } }
  const name = barber?.name || 'Snippr'
  const handle = (barber?.slug || 'snippr').replace(/-/g, '.')

  return (
    <div className="pb-16" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <Link href="/dashboard/addons" className="inline-flex items-center gap-1 text-[14.5px] font-medium text-[#0a84ff] hover:underline"><ArrowLeft size={16} /> {t.back}</Link>

      {/* hero */}
      <section className="relative mt-4 overflow-hidden rounded-[28px] bg-[#141416] px-7 py-10 text-white sm:px-10">
        <span aria-hidden className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full opacity-60 blur-3xl" style={{ background: 'radial-gradient(circle, #1fb5a6, transparent 70%)' }} />
        <div className="relative grid items-center gap-10 md:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-white/80">
              <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: TAB_STYLE.facebook.grad }}><FacebookIcon size={14} /></span>
              <span className="-ml-3.5 flex h-6 w-6 items-center justify-center rounded-md ring-2 ring-[#141416]" style={{ background: TAB_STYLE.instagram.grad }}><InstagramIcon size={13} /></span>
              {t.label}
            </p>
            <h1 className="mt-4 text-[clamp(28px,4vw,38px)] leading-[1.1] font-bold tracking-[-0.02em]">{t.h1}</h1>
            <p className="mt-3 text-[15.5px] leading-relaxed text-white/75">{t.sub}</p>
            <ul className="mt-5 space-y-2">
              {[t.b1, t.b2, t.b3].map(b => <li key={b} className="flex items-start gap-2.5 text-[14.5px] text-white/85"><Check size={17} className="mt-0.5 flex-shrink-0 text-[#5fe3d0]" /> {b}</li>)}
            </ul>
            <p className="mt-7 text-[13px] font-semibold text-[#7be38f]">{t.included}</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <a href="#how" className="rounded-full bg-white px-5 py-2.5 text-[14.5px] font-semibold text-[#141416] hover:bg-white/90">{t.setup}</a>
              <button onClick={copy} disabled={!link} className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[14.5px] font-semibold text-white ring-1 ring-white/25 hover:bg-white/10">
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t.copied : t.copy}
              </button>
            </div>
          </div>

          {/* phone with an Instagram-style profile */}
          <div className="relative mx-auto h-[400px] w-[260px]">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 overflow-hidden rounded-[38px] border-[7px] border-[#2a2a2d] bg-white text-[#111] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="mx-auto mt-2 h-[18px] w-[80px] rounded-full bg-[#111]" />
              <p className="mt-2 text-center text-[12px] font-bold">{handle}</p>
              <div className="mt-3 flex items-center gap-4 px-4">
                <div className="h-[60px] w-[60px] flex-shrink-0 rounded-full p-[2px]" style={{ background: TAB_STYLE.instagram.grad }}>
                  {barber?.photo_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={barber.photo_url} alt="" className="h-full w-full rounded-full border-2 border-white object-cover" />
                    : <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-[#f1f1ef] text-[22px] font-bold text-[#787774]">{name.charAt(0).toUpperCase()}</div>}
                </div>
                <div className="flex flex-1 justify-between text-center">
                  {[['48', t.posts], ['1,2K', t.followers], ['310', t.following]].map(([n, l]) => (
                    <div key={l}><p className="text-[13px] font-bold">{n}</p><p className="text-[10px] text-[#666]">{l}</p></div>
                  ))}
                </div>
              </div>
              <p className="mt-2 px-4 text-[12px] font-semibold">{name}</p>
              <p className="px-4 text-[11px] text-[#00376b]">{link ? link.replace(/^https?:\/\//, '') : 'snippr.app/b/…'}</p>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 px-4">
                <motion.span animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2 }}
                  className="rounded-lg bg-[#0095f6] py-1.5 text-center text-[11.5px] font-semibold text-white">{t.book}</motion.span>
                <span className="rounded-lg bg-[#efefef] py-1.5 text-center text-[11.5px] font-semibold">{t.message}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-[2px]">
                {['#f6d365,#fda085', '#a1c4fd,#c2e9fb', '#d4fc79,#96e6a1', '#fbc2eb,#a6c1ee', '#84fab0,#8fd3f4', '#ffecd2,#fcb69f', '#cfd9df,#e2ebf0', '#f093fb,#f5576c', '#4facfe,#00f2fe'].map(g => (
                  <div key={g} className="aspect-square" style={{ background: `linear-gradient(135deg,${g})` }} />
                ))}
              </div>
            </motion.div>
            {/* Facebook "Book now" card peeking out */}
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-16 bottom-12 hidden w-[170px] rounded-[18px] bg-white p-3 text-[#111] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)] lg:block">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: TAB_STYLE.facebook.grad }}><FacebookIcon size={16} /></span>
                <p className="truncate text-[12px] font-bold">{name}</p>
              </div>
              <span className="mt-2.5 block rounded-lg bg-[#1463e6] py-1.5 text-center text-[11.5px] font-semibold text-white">{t.book}</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* link box */}
      <section className="mt-4 flex flex-wrap items-center gap-3 rounded-[20px] border border-[#ededec] bg-white p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-[#9b9a97]">{t.yourLink}</p>
          <p className="truncate text-[15px] font-semibold text-[#37352f]">{link ? link.replace(/^https?:\/\//, '') : '…'}</p>
        </div>
        <button onClick={copy} disabled={!link} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold text-white" style={{ background: 'var(--accent)' }}>
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? t.copied : t.copy}
        </button>
        {link && <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-[#e3e2e0] px-4 py-2 text-[14px] font-semibold text-[#37352f] hover:bg-[#f7f7f5]"><ExternalLink size={15} /> {t.open}</a>}
        <Link href="/dashboard/link" className="flex items-center gap-1.5 rounded-full border border-[#e3e2e0] px-4 py-2 text-[14px] font-semibold text-[#37352f] hover:bg-[#f7f7f5]"><QrCode size={15} /> {t.qr}</Link>
      </section>

      {/* steps */}
      <section id="how" className="mt-10 scroll-mt-6">
        <h2 className="text-[22px] font-bold text-[#37352f]">{t.how}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(TAB_STYLE) as Tab[]).map(k => {
            const { grad, Icon } = TAB_STYLE[k]
            const on = tab === k
            return (
              <button key={k} onClick={() => setPicked(k)} className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[14px] font-semibold transition"
                style={{ borderColor: on ? '#37352f' : '#e3e2e0', background: on ? '#37352f' : '#fff', color: on ? '#fff' : '#37352f' }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: grad }}><Icon size={14} /></span>
                {t.tabs[k]}
              </button>
            )
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.ol key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            className="mt-5 grid gap-3 sm:grid-cols-2">
            {t.steps[tab].map(([title, body], i) => (
              <li key={title} className="flex gap-4 rounded-[20px] border border-[#ededec] bg-white p-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: TAB_STYLE[tab].grad }}>{i + 1}</span>
                <div>
                  <p className="text-[15.5px] font-semibold text-[#37352f]">{title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#787774]">{body}</p>
                </div>
              </li>
            ))}
          </motion.ol>
        </AnimatePresence>
        <p className="mt-5 rounded-[16px] bg-[#f7f7f5] px-4 py-3 text-[14px] text-[#5f5e5b]">💡 {t.tip}</p>
      </section>
    </div>
  )
}
