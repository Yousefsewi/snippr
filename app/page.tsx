'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Inter, Playfair_Display } from 'next/font/google'
import BackToTop from '@/components/ui/back-to-top'
import DownloadPopup from '@/components/ui/download-popup'
import TwistingRibbon from '@/components/ui/twisting-ribbon'
import { Rocket, Link2, Share2, CalendarCheck } from 'lucide-react'
import { SUPPORT_EMAIL } from '@/lib/site'
import FeatureAccordion from '@/components/feature-accordion'

const serif = Inter({ subsets: ['latin'], weight: ['600', '700', '800', '900'], display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin', 'latin-ext'], weight: ['500', '600', '700'], display: 'swap' })

// iOS-style liquid glass on top of the hero video: translucent, blurred backdrop,
// bright specular top edge and a soft drop shadow.
const GLASS_PILL: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(22px) saturate(170%)',
  WebkitBackdropFilter: 'blur(22px) saturate(170%)',
  border: '1px solid rgba(255,255,255,0.22)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(255,255,255,0.06), 0 10px 40px rgba(0,0,0,0.28)',
}
const GLASS_BUTTON: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 100%)',
  backdropFilter: 'blur(14px) saturate(170%)',
  WebkitBackdropFilter: 'blur(14px) saturate(170%)',
  border: '1px solid rgba(255,255,255,0.45)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 12px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.25)',
}
// Hero background video (public/hero-video.mp4). Turned off for now but kept:
// set to true to bring it back — text and menu colours switch back automatically.
const SHOW_HERO_VIDEO = false

// "How it works": expanding feature cards (components/feature-accordion.tsx).
// Set to true to show the older four-step timeline instead.
const SHOW_STEPS_TIMELINE = false

// Hero video fades to fully transparent towards the bottom (long, eased fade that starts
// below the headline/button so the white text keeps its dark backdrop).
const HERO_FADE_MASK: React.CSSProperties = {
  WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 58%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.22) 89%, transparent 100%)',
  maskImage: 'linear-gradient(to bottom, #000 0%, #000 58%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.22) 89%, transparent 100%)',
}

// Light glass for the sections below the hero (cards use the .glass-card class in globals.css)
const GLASS_TAG: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.85)', color: '#6e6e73',
  background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(30,30,60,0.05)',
}
const GLASS_ICON: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.55))',
  border: '1px solid rgba(255,255,255,0.9)', color: '#1d1d1f',
  backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
  boxShadow: 'inset 0 1px 0 #fff, 0 6px 18px rgba(30,30,60,0.10)',
}
const HERO_CTA_DARK: React.CSSProperties = {
  background: '#1d1d1f', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 28px rgba(29,29,31,0.25)',
}
const GLASS_BUTTON_HOVER = 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 100%)'

/* ─── Footer helpers (cinematic mega menu) ─── */
function FooterHead({ title, serif }: { title: string; serif: string }) {
  return (
    <div className="mb-6">
      <p className={`${serif} text-[15px] uppercase tracking-[0.12em] mb-3`} style={{ color: 'rgba(255,255,255,0.85)' }}>{title}</p>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.15)' }} />
    </div>
  )
}

// Where each footer item points. Items not listed here (social accounts) stay "#" until real URLs exist.
const FOOTER_HREFS: Record<string, string> = {
  'Barbershops': '/register', 'Hair salons': '/register', 'Beauty salons': '/register', 'Get started': '/register',
  'Online Booking': '#how', 'Calendar': '#how', 'Notifications': '#how', 'Confirmation emails': '#faq',
  'Opening hours': '#faq', 'Working hours': '#faq', 'Booking link': '#how', 'QR code': '#how',
  'Pricing': '/pricing', 'About': '/about', 'FAQ': '/faq', 'Contact': '/contact', 'Privacy': '/privacy', 'Terms': '/terms',
}

function FooterLinks({ links }: { links: string[] }) {
  return (
    <ul className="space-y-3">
      {links.map((l) => (
        <li key={l}>
          <a href={FOOTER_HREFS[l] ?? '#'} className="text-[13.5px] uppercase tracking-wide transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          >{l}</a>
        </li>
      ))}
    </ul>
  )
}

function FooterCol({ title, links, serif }: { title: string; links: string[]; serif: string }) {
  return (
    <div>
      <FooterHead title={title} serif={serif} />
      <FooterLinks links={links} />
    </div>
  )
}

/* ─── FAQ (Questions?) with working category tabs ─── */
const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  'Getting Started': [
    { q: 'How do I set up my booking page?', a: 'Sign up, add your services, prices and working hours — you get your own booking link to share in about 2 minutes.' },
    { q: 'How do my customers book?', a: 'Share your link or QR code on Instagram, WhatsApp or in your shop. Customers pick a service and an open time slot and confirm — you’re notified instantly.' },
    { q: 'Do customers need to download an app?', a: 'No. Snippr opens in any browser. They just tap your link and book — nothing to install.' },
    { q: 'I’m not good with tech — is it hard?', a: 'Not at all. If you can use Instagram, you can use Snippr. Setup is guided, and we’re here if you get stuck.' },
  ],
  'Bookings': [
    { q: 'What if a customer doesn’t show up?', a: 'You get a notification for every booking and can confirm or cancel it from your dashboard. Every booking includes the customer’s contact details, so you can reach them. Automatic reminders are on our roadmap.' },
    { q: 'Can customers cancel or reschedule?', a: 'For now they contact you directly, and you update the booking in your dashboard — your calendar updates live. Self-service changes for customers are coming soon.' },
    { q: 'Can two people book the same time?', a: 'Never. Once a slot is taken it disappears for everyone, so you can’t get double-booked.' },
    { q: 'Can I set my working hours and days off?', a: 'Yes — set your hours for each day of the week and switch off the days you’re closed. Those times are never offered to customers.' },
  ],
  'Pricing': [
    { q: 'Is Snippr free?', a: 'Yes — everything available today is free, no credit card needed. Paid plans with extra features will come later, and you keep all your data.' },
    { q: 'Are there hidden costs?', a: 'No. No setup fees, no subscription today, and we never take a commission on your bookings.' },
    { q: 'Can I delete my account?', a: 'Anytime, from Settings → Delete account. Your page, services and appointments are removed for good.' },
  ],
  'Payments': [
    { q: 'Can I take a deposit or payment online?', a: 'Not yet — customers pay you in your shop, the way they already do. Online deposits are on our roadmap.' },
    { q: 'Does Snippr take a cut of my earnings?', a: 'No. You keep 100% of what your customers pay you.' },
  ],
  'Features': [
    { q: 'Do customers get a confirmation?', a: 'Yes — if they leave their email, they get a confirmation with the date, time and price right after booking. Reminders before the appointment are coming soon.' },
    { q: 'Can I offer discounts?', a: 'Not yet. Promotions such as a first-visit discount are planned for the paid plan.' },
    { q: 'Can I set my own services and prices?', a: 'Of course — add as many services as you like, each with its own duration and price.' },
    { q: 'Can I share my page on Instagram?', a: 'Yes — your link is made for Instagram bios, Stories and WhatsApp, and you get a QR code to print for your counter.' },
    { q: 'Can I add my team / multiple barbers?', a: 'Not yet — today each account is one barber with one calendar. Team calendars are on our roadmap.' },
  ],
  'Support': [
    { q: 'How do I get help?', a: `Email us at ${SUPPORT_EMAIL} — we usually reply within a day.` },
    { q: 'Do you help me get set up?', a: 'Yes — email us and we’ll help you set up your services, hours and booking page, for free.' },
    { q: 'Is my data safe?', a: 'Your data is stored securely in the EU and never sold. Only you can see your customers’ details, and you can delete your account and all its data anytime from Settings.' },
  ],
}

const FAQ_DATA_TR: Record<string, { q: string; a: string }[]> = {
  'Başlarken': [
    { q: 'Rezervasyon sayfamı nasıl kurarım?', a: 'Kaydol, hizmetlerini, fiyatlarını ve çalışma saatlerini ekle — yaklaşık 2 dakikada paylaşabileceğin kendi randevu linkin hazır.' },
    { q: 'Müşterilerim nasıl randevu alır?', a: 'Linkini veya QR kodunu Instagram, WhatsApp ya da dükkânında paylaş. Müşteri bir hizmet ve boş saat seçip onaylar — sana anında bildirim gelir.' },
    { q: 'Müşterilerin uygulama indirmesi gerekir mi?', a: 'Hayır. Snippr her tarayıcıda açılır. Linke dokunup randevu alırlar — hiçbir şey indirmeye gerek yok.' },
    { q: 'Teknolojiyle aram iyi değil, zor mu?', a: 'Hiç değil. Instagram kullanabiliyorsan Snippr’ı da kullanırsın. Kurulum adım adım yönlendirir, takılırsan biz buradayız.' },
  ],
  'Randevular': [
    { q: 'Müşteri gelmezse ne olur?', a: 'Her randevuda bildirim alırsın ve panelinden onaylayıp iptal edebilirsin. Her randevuda müşterinin iletişim bilgisi olduğu için ona ulaşabilirsin. Otomatik hatırlatmalar yol haritamızda.' },
    { q: 'Müşteriler iptal/erteleme yapabilir mi?', a: 'Şimdilik seninle doğrudan iletişime geçerler, sen de randevuyu panelinden güncellersin — takvimin anında yenilenir. Müşterinin kendisi değiştirebilmesi yakında.' },
    { q: 'İki kişi aynı saati alabilir mi?', a: 'Asla. Bir saat dolunca herkes için kaybolur, böylece çift rezervasyon olmaz.' },
    { q: 'Çalışma saatlerimi ve izin günlerimi ayarlayabilir miyim?', a: 'Evet — haftanın her günü için saatlerini ayarla, kapalı olduğun günleri kapat. O saatler müşterilere hiç gösterilmez.' },
  ],
  'Fiyatlandırma': [
    { q: 'Snippr ücretsiz mi?', a: 'Evet — bugün sunulan her şey ücretsiz, kredi kartı gerekmez. Ek özellikli ücretli planlar ileride gelecek, tüm verilerin seninle kalır.' },
    { q: 'Gizli bir ücret var mı?', a: 'Hayır. Kurulum ücreti yok, şu an abonelik yok ve randevularından asla komisyon alınmaz.' },
    { q: 'Hesabımı silebilir miyim?', a: 'İstediğin an, Ayarlar → Hesabı sil’den. Sayfan, hizmetlerin ve randevuların kalıcı olarak silinir.' },
  ],
  'Ödemeler': [
    { q: 'Online kapora/ödeme alabilir miyim?', a: 'Henüz değil — müşteriler ödemeyi her zamanki gibi dükkânda yapar. Online kapora yol haritamızda.' },
    { q: 'Snippr kazancımdan pay alıyor mu?', a: 'Hayır. Müşterinin sana ödediğinin %100’ü senin.' },
  ],
  'Özellikler': [
    { q: 'Müşteriye onay gider mi?', a: 'Evet — e-postasını yazdıysa randevudan hemen sonra tarih, saat ve fiyatla bir onay maili alır. Randevu öncesi hatırlatmalar yakında.' },
    { q: 'İndirim sunabilir miyim?', a: 'Henüz değil. İlk ziyaret indirimi gibi kampanyalar ücretli plan için planlanıyor.' },
    { q: 'Kendi hizmet ve fiyatlarımı koyabilir miyim?', a: 'Tabii — istediğin kadar hizmet ekle, her birinin kendi süresi ve fiyatı olsun.' },
    { q: 'Sayfamı Instagram’da paylaşabilir miyim?', a: 'Evet — linkin Instagram bio’su, hikâyeler ve WhatsApp için hazır; tezgâhın için yazdırabileceğin bir QR kod da alırsın.' },
    { q: 'Ekibimi / birden fazla berberi ekleyebilir miyim?', a: 'Henüz değil — şu an her hesap tek berber ve tek takvim. Ekip takvimi yol haritamızda.' },
  ],
  'Destek': [
    { q: 'Nasıl yardım alırım?', a: `${SUPPORT_EMAIL} adresine yaz — genelde bir gün içinde yanıtlarız.` },
    { q: 'Kurulumda yardımcı olur musunuz?', a: 'Evet — bize yaz, hizmetlerini, saatlerini ve rezervasyon sayfanı ücretsiz birlikte hazırlayalım.' },
    { q: 'Verim güvende mi?', a: 'Verin AB’de güvenle saklanır ve asla satılmaz. Müşteri bilgilerini sadece sen görürsün; hesabını ve tüm verini Ayarlar’dan istediğin an silebilirsin.' },
  ],
}

type Lng = 'en' | 'tr'
const FAQ_BY_LANG: Record<Lng, Record<string, { q: string; a: string }[]>> = { en: FAQ_DATA, tr: FAQ_DATA_TR }

// Landing copy (English / Turkish)
const LC: Record<Lng, {
  nav: { how: string; pricing: string; faq: string; about: string }
  login: string; getStarted: string; badge: string; downloadApp: string
  heroBig: string; heroSub: string
  appTag: string; appTitle: string; appBody: string; appBtn: string; appDone: string
  howTag: string; howTitle: string; howBody: string; howSteps: { title: string; body: string }[]
  baTitle: string; baRows: [string, string][]
  questions: string
  briefTitle: string; briefBody: string; briefPlaceholder: string; briefBtn: string
  trustTag: string; trustTitle: string; trustBody: string
  stats: { name: string; value: string }[]
  tagline: string; rights: string; builtWith: string
}> = {
  en: {
    nav: { how: 'How it works', pricing: 'Pricing', faq: 'FAQ', about: 'About' },
    login: 'Login', getStarted: 'Get started', badge: 'Online booking 24/7', downloadApp: 'Download App',
    heroBig: 'NEVER MISS\nA CUSTOMER.',
    heroSub: 'Smart scheduling for modern barbershops — set up in minutes, book online 24/7.',
    appTag: 'Mobile app', appTitle: 'Want Snippr as an app?',
    appBody: 'Snippr already works great in your phone’s browser. We’re also building native iOS & Android apps — want to hear first when they’re ready?',
    appBtn: 'Email me when it’s ready', appDone: 'Thanks! Send that email and you’ll be the first to know.',
    howTag: 'Getting started', howTitle: 'Simple steps to get you started',
    howBody: 'Follow these straightforward steps to set up your booking page and start taking appointments in minutes.',
    howSteps: [
      { title: 'Sign up', body: 'Create your account and add your services, prices and working hours.' },
      { title: 'Get your booking link', body: 'Get your own booking link and a QR code to print for your shop.' },
      { title: 'Share it', body: 'Post it on Instagram, WhatsApp, or print the QR code at your counter.' },
      { title: 'Get booked & grow', body: 'Customers book online 24/7. You manage every appointment from one dashboard.' },
    ],
    baTitle: 'Stop chasing. Start booking.',
    baRows: [
      ['Endless DMs just to pick a time', 'They tap your link and they’re booked'],
      ['Customers forgetting the details', 'A confirmation email with date & time'],
      ['Missing bookings while you cut', 'An instant notification on your phone'],
      ['A scribbled notebook of bookings', 'Every appointment in one place'],
      ['Clients asking “where are you?”', 'Your address opens straight in Maps'],
    ],
    questions: 'Questions?',
    briefTitle: 'TALK TO US', briefBody: 'Questions, ideas, or want help setting up your page? We read every email and usually reply within a day.',
    briefPlaceholder: '', briefBtn: 'EMAIL US',
    trustTag: 'Built for the long view', trustTitle: 'Make room for the work that matters.',
    trustBody: 'Snippr keeps the details moving quietly in the background, so every appointment feels considered from first click to final look.',
    stats: [
      { name: 'To get started — no credit card', value: 'Free' },
      { name: 'Average setup time', value: '2 min' },
      { name: 'Online booking, every day', value: '24/7' },
    ],
    tagline: 'Helping barbers fill every chair, effortlessly.', rights: `© ${new Date().getFullYear()} Snippr. All rights reserved.`, builtWith: 'Built with',
  },
  tr: {
    nav: { how: 'Nasıl çalışır', pricing: 'Fiyatlandırma', faq: 'SSS', about: 'Hakkında' },
    login: 'Giriş', getStarted: 'Başla', badge: '7/24 online randevu', downloadApp: 'Uygulamayı İndir',
    heroBig: 'MÜŞTERİNİ\nKAÇIRMA.',
    heroSub: 'Modern berberler için akıllı randevu sistemi — dakikalar içinde kur, 7/24 online rezervasyon al.',
    appTag: 'Mobil uygulama', appTitle: 'Snippr’ı uygulama olarak ister misin?',
    appBody: 'Snippr telefonunun tarayıcısında zaten sorunsuz çalışıyor. iOS ve Android uygulamalarını da geliştiriyoruz — hazır olunca ilk sen mi duymak istersin?',
    appBtn: 'Hazır olunca bana yaz', appDone: 'Teşekkürler! O e-postayı gönder, ilk sen haber alacaksın.',
    howTag: 'Nasıl başlanır', howTitle: 'Başlamak için basit adımlar',
    howBody: 'Rezervasyon sayfanı kurmak ve dakikalar içinde randevu almaya başlamak için bu adımları izle.',
    howSteps: [
      { title: 'Kaydol', body: 'Hesabını oluştur, hizmetlerini, fiyatlarını ve çalışma saatlerini ekle.' },
      { title: 'Rezervasyon linkini al', body: 'Kendine özel bir randevu linki ve dükkânın vitrini için bir QR kod al.' },
      { title: 'Paylaş', body: 'Instagram, WhatsApp\'ta paylaş ya da tezgahına QR kodu yazdır.' },
      { title: 'Randevu al ve büyü', body: 'Müşteriler 7/24 online randevu alır. Tüm randevuları tek panelden yönetirsin.' },
    ],
    baTitle: 'Peşinde koşmayı bırak. Randevu almaya başla.',
    baRows: [
      ['Saat ayarlamak için bitmeyen mesajlar', 'Linke dokunur, randevu hazır'],
      ['Detayları unutan müşteriler', 'Tarih ve saatli onay maili'],
      ['Tıraş yaparken kaçan randevular', 'Telefonuna anında bildirim'],
      ['Karalanmış defter dolusu randevu', 'Tüm randevular tek yerde'],
      ['“Neredesin?” diye soran müşteriler', 'Adresin direkt Haritalar’da açılır'],
    ],
    questions: 'Sorular?',
    briefTitle: 'BİZE YAZ', briefBody: 'Sorun, fikrin ya da sayfanı kurmak için yardım mı lazım? Her e-postayı okuyoruz, genelde bir gün içinde yanıtlıyoruz.',
    briefPlaceholder: '', briefBtn: 'E-POSTA GÖNDER',
    trustTag: 'Uzun vadeli düşünüldü', trustTitle: 'Önemli işe zaman ayır.',
    trustBody: 'Snippr detayları sessizce arka planda yürütür — her randevu ilk tıktan son ana kadar özenle planlanır.',
    stats: [
      { name: 'Başlamak için — kredi kartı yok', value: 'Ücretsiz' },
      { name: 'Ortalama kurulum süresi', value: '2 dk' },
      { name: 'Her gün online randevu', value: '7/24' },
    ],
    tagline: 'Berberlerin her koltuğu zahmetsizce doldurmasına yardım ediyoruz.', rights: `© ${new Date().getFullYear()} Snippr. Tüm hakları saklıdır.`, builtWith: 'Şununla yapıldı:',
  },
}

function FAQ({ serif, lng }: { serif: string; lng: Lng }) {
  const data = FAQ_BY_LANG[lng]
  const tabs = Object.keys(data)
  const [active, setActive] = useState(tabs[0])
  // keep active tab valid when language switches
  if (!data[active]) { /* fall back below */ }
  const activeKey = data[active] ? active : tabs[0]

  return (
    <section className="pt-2 pb-24 px-6" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto">
        <h2 className={`${serif} text-center mb-12`} style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 500, color: '#1a1a1a' }}>
          {LC[lng].questions}
        </h2>

        {/* tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {tabs.map((tab) => {
            const on = activeKey === tab
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                aria-pressed={on}
                className="rounded-full px-5 py-2.5 text-[14px] font-semibold transition-all"
                style={{
                  background: on ? '#111' : '#fff',
                  color: on ? '#fff' : '#374151',
                  border: on ? '1px solid #111' : '1px solid rgba(0,0,0,0.1)',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* answers card */}
        <div className="rounded-3xl bg-white px-7 md:px-10 py-4" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.05)' }}>
          {data[activeKey].map((item, i) => (
            <div key={item.q} className="py-7" style={{ borderTop: i ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
              <h3 className="text-[18px] font-bold mb-2.5" style={{ color: '#111' }}>{item.q}</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: '#6b7280' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LangSwitcher({ lng, setLng }: { lng: Lng; setLng: (l: Lng) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const langs: { code: Lng; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'tr', label: 'Türkçe' },
  ]
  const filtered = langs.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))
  const current = langs.find(l => l.code === lng)!

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-full text-[12px] font-semibold px-3.5 py-2 transition-all"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h9M9 5v3M12 8c0 4-3.5 7-7 8M8 12c1.2 1.6 3 2.8 5 3.4"/><path d="M13 20l4-9 4 9M14.5 17h5"/></svg>
        {current.label}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 rounded-2xl overflow-hidden z-10"
          style={{ width: 220, background: '#111', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
        >
          <div className="p-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={lng === 'tr' ? 'Şuna göre ara' : 'Search'}
                className="bg-transparent text-[13px] outline-none flex-1"
                style={{ color: '#fff' }}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto py-1.5">
            {filtered.map(l => (
              <button
                key={l.code}
                onClick={() => { setLng(l.code); setOpen(false); setQuery('') }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-left transition-colors"
                style={{ color: l.code === lng ? '#fff' : 'rgba(255,255,255,0.75)', background: l.code === lng ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = l.code === lng ? 'rgba(255,255,255,0.06)' : 'transparent' }}
              >
                {l.label}
                {l.code === lng && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── "Want this as an app?" interest CTA ─── */
function HowItWorksSection({ lng }: { lng: Lng }) {
  const c = LC[lng]
  const icons = [Rocket, Link2, Share2, CalendarCheck]

  return (
    <section id="how" className="py-20 px-6" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <div className="mb-5 flex justify-center">
            <span className="inline-block rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={GLASS_TAG}>
              {c.howTag}
            </span>
          </div>
          <h2 className={`${playfair.className}`} style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 500, color: '#1d1d1f' }}>
            {c.howTitle}
          </h2>
          <p className="mt-6 text-[16px] md:text-[18px]" style={{ color: 'rgba(29, 29, 31,0.62)' }}>
            {c.howBody}
          </p>
        </div>

        {/* ── Desktop: horizontal timeline ── */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute right-0 left-0 mt-6 h-px" style={{ background: 'rgba(0,0,0,0.10)' }} />
            <div className="grid grid-cols-4 gap-4">
              {c.howSteps.map((step, i) => {
                const Icon = icons[i]
                return (
                  <div key={step.title} className="relative">
                    <div
                      className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full"
                      style={GLASS_ICON}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="text-lg font-semibold" style={{ color: '#1d1d1f' }}>{step.title}</h3>
                      <p className="mt-2 text-sm" style={{ color: 'rgba(29, 29, 31,0.6)' }}>{step.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Mobile: vertical timeline ── */}
        <div className="md:hidden">
          <div className="relative space-y-4">
            <div className="absolute top-0 bottom-0 left-4 w-px" style={{ background: 'rgba(0,0,0,0.10)' }} />
            {c.howSteps.map((step, i) => {
              const Icon = icons[i]
              return (
                <div key={step.title} className="relative flex items-start gap-4">
                  <div
                    className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full"
                    style={GLASS_ICON}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="glass-card grow rounded-2xl p-4">
                    <span className="text-xs font-medium" style={{ color: '#6e6e73' }}>
                      {lng === 'tr' ? `Adım ${i + 1}` : `Step ${i + 1}`}
                    </span>
                    <h3 className="mt-1 font-semibold" style={{ color: '#1d1d1f' }}>{step.title}</h3>
                    <p className="mt-2 text-sm" style={{ color: 'rgba(29, 29, 31,0.6)' }}>{step.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsSection({ lng }: { lng: Lng }) {
  const c = LC[lng]
  return (
    <section className="py-16 px-6" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-5xl">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-12 text-center sm:grid-cols-3">
          {c.stats.map((stat) => (
            <div key={stat.name} className="glass-card flex w-full flex-col gap-y-2 rounded-[28px] px-6 py-8">
              <dd className="font-semibold" style={{ fontSize: 'clamp(32px, 4vw, 44px)', color: '#1d1d1f', letterSpacing: '-0.02em' }}>
                {stat.value}
              </dd>
              <dt className="text-[14px]" style={{ color: 'rgba(29, 29, 31,0.6)' }}>{stat.name}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function AppInterestCTA({ serif, lng }: { serif: string; lng: Lng }) {
  const [yes, setYes] = useState(false)
  const c = LC[lng]
  return (
    <section className="py-24 px-6 text-center" style={{ background: 'transparent' }}>
      <div className="glass-card max-w-2xl mx-auto rounded-[32px] px-8 py-14">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: 'rgba(0,0,0,0.4)' }}>{c.appTag}</p>
        <h2 className={`${serif} mb-4`} style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0a0a0a' }}>
          {c.appTitle}
        </h2>
        <p className="text-[16px] leading-relaxed max-w-md mx-auto mb-8" style={{ color: '#6b7280' }}>
          {c.appBody}
        </p>

        {!yes ? (
          <button
            onClick={() => { window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Snippr app — let me know when it is ready')}`; setYes(true) }}
            className="inline-flex items-center gap-2 rounded-full bg-black text-white hover:bg-gray-800 text-[15px] font-semibold px-8 py-3.5 transition-all"
          >
            {c.appBtn}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        ) : (
          <div
            className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[15px] font-semibold"
            style={{ background: '#e9f6ec', color: '#1c6b3f', border: '1px solid rgba(28,107,63,0.2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            {c.appDone}
          </div>
        )}
      </div>
    </section>
  )
}

export default function Home() {
  const [lng, setLng] = useState<Lng>('en')
  const c = LC[lng]
  const isRTL = false

  // Light text on the dark video, dark text on the light colour wash
  const heading  = SHOW_HERO_VIDEO ? '#f5f5f5' : '#1d1d1f'
  const navText  = SHOW_HERO_VIDEO ? 'rgba(255,255,255,0.82)' : 'rgba(29,29,31,0.72)'
  const navShade = SHOW_HERO_VIDEO ? '0 1px 8px rgba(0,0,0,0.25)' : 'none'
  const navHover = SHOW_HERO_VIDEO ? 'hover:text-white' : 'hover:text-black'
  const glassInk = SHOW_HERO_VIDEO ? '#ffffff' : '#1d1d1f'


  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: '#0a0a0a' }}
      className="editorial-site editorial-dark w-full overflow-x-hidden"
    >

      {/* ══ HERO ══ */}
      <section className="relative w-full h-screen overflow-hidden" style={{ background: 'transparent' }}>

        {/* ── Background video + dark overlay, faded out at the bottom with a mask so the
             page's colour wash shows through: no flat band, no seam with the next section ── */}
        {SHOW_HERO_VIDEO ? (
        <div className="absolute inset-0 z-0 pointer-events-none" style={HERO_FADE_MASK}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/hero-video.mp4"
          />
          {/* dark overlay for text contrast */}
          <div className="absolute inset-0" style={{ background: 'rgba(10,10,10,0.55)' }} />
          {/* a hint of the wash colours in the lower part, so the hand-off feels continuous */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(196,164,124,0) 45%, rgba(196,164,124,0.22) 75%, rgba(244,114,182,0.12) 100%)' }} />
        </div>
        ) : (
        /* no video: a few large, blurred colour glows on the wash give the hero depth */
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={HERO_FADE_MASK} aria-hidden>
          <div className="absolute rounded-full" style={{ width: 620, height: 620, left: '-8%', top: '8%', background: 'radial-gradient(circle, rgba(196,164,124,0.45), transparent 65%)', filter: 'blur(40px)' }} />
          <div className="absolute rounded-full" style={{ width: 560, height: 560, right: '-6%', top: '18%', background: 'radial-gradient(circle, rgba(147,197,253,0.45), transparent 65%)', filter: 'blur(40px)' }} />
          <div className="absolute rounded-full" style={{ width: 480, height: 480, left: '40%', top: '38%', background: 'radial-gradient(circle, rgba(244,114,182,0.26), transparent 65%)', filter: 'blur(40px)' }} />
        </div>
        )}

        {/* ── Navbar: floating liquid-glass pill ── */}
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
          <div className="flex items-center justify-between gap-3 md:gap-7 pl-2 pr-2 py-2 rounded-full" style={GLASS_PILL}>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 pr-1">
              <span className="flex items-center justify-center rounded-full text-[15px]" style={{ ...GLASS_BUTTON, width: 38, height: 38, color: glassInk }}>✦</span>
              <span className="hidden sm:inline font-semibold text-[14px] tracking-[0.08em]" style={{ color: heading }}>SNIPPR</span>
            </Link>

            {/* Menu items */}
            <div className="hidden md:flex items-center gap-7">
              {[
                { label: c.nav.how,     href: '#how' },
                { label: c.nav.pricing, href: '/pricing' },
                { label: c.nav.faq,     href: '#faq' },
                { label: c.nav.about,   href: '/about' },
              ].map(({ label, href }) =>
                href.startsWith('#') ? (
                  <a
                    key={href}
                    href={href}
                    onClick={(e) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }) }}
                    className={`text-[14px] font-medium transition-all ${navHover} cursor-pointer`}
                    style={{ color: navText, textShadow: navShade }}
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className={`text-[14px] font-medium transition-all ${navHover}`}
                    style={{ color: navText, textShadow: navShade }}
                  >
                    {label}
                  </Link>
                )
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-1.5">
              <Link href="/login" className={`inline-flex items-center rounded-full text-[13px] font-medium px-4 py-2.5 transition-all ${navHover}`}
                style={{ color: navText }}>
                {c.login}
              </Link>

              <Link href="/register" className="inline-flex items-center rounded-full text-[13px] font-semibold px-5 py-2.5 transition-all flex-shrink-0"
                style={{ ...GLASS_BUTTON, color: glassInk }}
                onMouseEnter={(e) => { e.currentTarget.style.background = GLASS_BUTTON_HOVER }}
                onMouseLeave={(e) => { e.currentTarget.style.background = GLASS_BUTTON.background as string }}>
                {c.getStarted}
              </Link>
            </div>
          </div>
        </div>


        {/* ── Particle cube background ── */}
        {/* ── Hero content ── */}
        <div className="relative z-10 h-full flex flex-col items-start justify-center text-left px-6 md:px-16 pt-16 pointer-events-none">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mb-9"
          >
            <h1 className={`${serif.className} leading-[0.95] whitespace-pre-line`} style={{ fontSize: 'clamp(44px, 8vw, 110px)', fontWeight: 600, letterSpacing: '-0.03em', color: SHOW_HERO_VIDEO ? '#f4efe7' : '#1d1d1f', textShadow: SHOW_HERO_VIDEO ? '0 8px 40px rgba(0,0,0,0.4)' : 'none' }}>
              {c.heroBig}
            </h1>
            <p className="mt-6 max-w-md text-[16px] md:text-[18px] leading-relaxed" style={{ color: SHOW_HERO_VIDEO ? 'rgba(244,239,231,0.72)' : 'rgba(29,29,31,0.66)' }}>
              {c.heroSub}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center gap-4 pointer-events-auto"
          >
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold transition-all"
              style={SHOW_HERO_VIDEO ? { ...GLASS_BUTTON, color: '#ffffff' } : HERO_CTA_DARK}
              onMouseEnter={(e) => { e.currentTarget.style.background = SHOW_HERO_VIDEO ? GLASS_BUTTON_HOVER : '#000000' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = (SHOW_HERO_VIDEO ? GLASS_BUTTON.background : HERO_CTA_DARK.background) as string }}>
              {c.getStarted}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>

          </motion.div>
        </div>

      </section>

      {/* ══ HOW IT WORKS ══ */}
      {/* Calendly-style expanding cards; the older step timeline is kept behind a flag */}
      {SHOW_STEPS_TIMELINE ? <HowItWorksSection lng={lng} /> : <FeatureAccordion lng={lng} />}

      {/* ══ STATS ══ */}
      <StatsSection lng={lng} />

      {/* ══ APP INTEREST CTA ══ */}
      <AppInterestCTA serif={serif.className} lng={lng} />

      {/* ══ BEFORE / AFTER ══ */}
      <section className="py-28 px-6" style={{ background: 'transparent' }}>
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`${playfair.className} text-center mb-16`}
            style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.01em' }}
          >
            {c.baTitle}
          </motion.h2>

          <div className="glass-card flex flex-col gap-9 md:gap-11 rounded-[32px] p-8 md:p-12">
            {c.baRows.map(([before, after], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="grid items-center gap-4 md:gap-8"
                style={{ gridTemplateColumns: '1fr auto 1fr' }}
              >
                <span className="text-right line-through" style={{ fontSize: 'clamp(16px, 2.2vw, 26px)', color: 'rgba(29, 29, 31,0.4)', fontWeight: 500 }}>
                  {before}
                </span>
                <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="flex-shrink-0">
                  <path d="M2 10h34M30 4l6 6-6 6" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-left" style={{ fontSize: 'clamp(16px, 2.2vw, 26px)', color: '#1d1d1f', fontWeight: 600 }}>
                  {after}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST + TESTIMONIAL ══ */}
      <section
        className="px-6 md:px-12 py-16"
        style={{ background: 'transparent' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-[32px] px-8 py-12 md:px-14 md:py-16 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-6" style={{ color: '#6e6e73' }}>{c.trustTag}</p>
            <h2 className={`${playfair.className} mb-7`} style={{ fontSize: 'clamp(38px, 4.6vw, 68px)', fontWeight: 500, lineHeight: 1.03, color: '#1d1d1f' }}>
              {c.trustTitle}
            </h2>
            <p className="max-w-md mx-auto text-[17px] leading-relaxed" style={{ color: 'rgba(29, 29, 31,0.68)' }}>
              {c.trustBody}
            </p>
          </div>
        </div>
      </section>

      {/* ══ TWISTING RIBBON ══ */}
      <section className="ribbon-section pt-10 pb-0" style={{ background: 'transparent' }}>
        <div className="w-full h-[360px]">
          <TwistingRibbon className="rounded-none" />
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <div id="faq" className="scroll-mt-24">
        <FAQ serif={playfair.className} lng={lng} />
      </div>

      {/* ══ FOOTER (cinematic mega) ══ */}
      <footer
        className="relative px-8 md:px-16 pt-20 pb-0 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #111113 0%, #161618 45%, #0a0a0a 100%)' }}
      >
        {/* cinematic bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* ── Mega menu grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-16">

            {/* SERVICES */}
            <div className="lg:col-span-2">
              <FooterCol title="Made for" links={['Barbershops', 'Hair salons', 'Beauty salons', 'Get started']} serif={serif.className} />
            </div>

            {/* FEATURES — two sub columns */}
            <div className="lg:col-span-4">
              <FooterHead title="Features" serif={serif.className} />
              <div className="grid grid-cols-2 gap-x-6">
                <FooterLinks links={['Online Booking', 'Calendar', 'Notifications', 'Confirmation emails']} />
                <FooterLinks links={['Opening hours', 'Working hours', 'Booking link', 'QR code']} />
              </div>
            </div>

            {/* INFO + CONNECT */}
            <div className="lg:col-span-2">
              <FooterCol title="Company" links={['Pricing', 'About', 'FAQ', 'Contact', 'Privacy', 'Terms']} serif={serif.className} />
              <div className="mt-8">
              </div>
            </div>

            {/* THE BRIEF newsletter card */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl px-8 py-9 h-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <h3 className={`${serif.className} text-center mb-4`} style={{ fontSize: 'clamp(30px, 3vw, 42px)', color: '#fff', letterSpacing: '0.02em' }}>
                  {c.briefTitle}
                </h3>
                <p className="text-center text-[14px] leading-relaxed mb-7 mx-auto max-w-[300px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {c.briefBody}
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Snippr`}
                  className="block text-center w-full rounded-full py-3.5 text-[14px] font-semibold tracking-wide transition-all"
                  style={{ background: 'linear-gradient(180deg, #f5f5f5 0%, #c8c8c8 100%)', color: '#111' }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
                >
                  {c.briefBtn}
                </a>
              </div>
            </div>
          </div>

          {/* ── Giant wordmark + tagline ── */}
          <div className="flex flex-col lg:flex-row items-end justify-between gap-6 pb-10">
            <h2
              className={`${serif.className} leading-none select-none`}
              style={{
                fontSize: 'clamp(80px, 17vw, 280px)',
                letterSpacing: '-0.03em',
                lineHeight: 0.82,
                background: 'linear-gradient(180deg, #ffffff 0%, #888888 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SNIPPR
            </h2>
            <p className={`${serif.className} text-[18px] md:text-[22px] leading-snug max-w-[280px] pb-3`} style={{ color: 'rgba(255,255,255,0.55)' }}>
              {c.tagline}
            </p>
          </div>

          {/* bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.rights}</p>
            <LangSwitcher lng={lng} setLng={setLng} />
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.builtWith} <span style={{ color: 'rgba(255,255,255,0.7)' }}>Next.js</span></p>
          </div>
        </div>
      </footer>

      <BackToTop />
      <DownloadPopup />
    </main>
  )
}
