'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { openCookieSettings } from '@/lib/consent'
import { motion } from 'framer-motion'
import { inter as serif, playfair } from '@/lib/fonts'
import BackToTop from '@/components/ui/back-to-top'
import DownloadPopup from '@/components/ui/download-popup'
import TwistingRibbon from '@/components/ui/twisting-ribbon'
import { Rocket, Link2, Share2, CalendarCheck } from 'lucide-react'
import { SUPPORT_EMAIL } from '@/lib/site'
import FeatureExplorer from '@/components/feature-explorer'
import WhySnippr from '@/components/why-snippr'
import ClaimLink from '@/components/claim-link'
import FeatureAccordion from '@/components/feature-accordion'
import HeroCalendar from '@/components/hero-calendar'
import LangCurrencyPicker from '@/components/lang-currency-picker'
import { TRIAL_DAYS } from '@/lib/legal'
import { L, browserSiteLng, isSiteLng, type SiteLng } from '@/lib/site-lang'
import { useStored, useClientValue, writeStored } from '@/lib/use-stored'


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
// Hero background video. Turned off; the file is kept off the site in private/media/hero-video.mp4
// (not published). To bring it back: move it to public/hero-video.mp4 and set this to true —
// text and menu colours switch back automatically.
const SHOW_HERO_VIDEO = false

// "How it works": expanding feature cards (components/feature-accordion.tsx).
// Set to true to show the older four-step timeline instead.
const SHOW_STEPS_TIMELINE = false

// Interactive calendar next to / under the hero (components/hero-calendar.tsx). Off for now.
const SHOW_HERO_CALENDAR = false

// Colourful twisting ribbon above the FAQ (components/ui/twisting-ribbon.tsx). Off for now.
const SHOW_RIBBON = false

// Halftone cloud picture next to the big headline (public/hero-clouds.webp), with a dot field
// behind it and two small glass cards on top. Wide screens only.
const SHOW_HERO_ART = false

// Dotted 3D cube next to the big headline (components/ParticleCube.tsx). Wide screens only.
const SHOW_HERO_CUBE = true
// three.js is big: load the cube only in the browser, after the page itself
const ParticleCube = dynamic(() => import("@/components/ParticleCube"), { ssr: false })

function HeroArt({ lng }: { lng: string }) {
  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 18px 40px -18px rgba(40,60,80,0.35)',
  }
  const dots = 'radial-gradient(closest-side, #000 35%, transparent 100%)'
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden items-center pr-[7vw] pt-20 xl:flex" aria-hidden>
      <style>{`
        @keyframes heroFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        .hero-float { animation: heroFloat 7s ease-in-out infinite }
        .hero-float-late { animation: heroFloat 7s ease-in-out -3.5s infinite }
        @media (prefers-reduced-motion: reduce) { .hero-float, .hero-float-late { animation: none } }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative" style={{ width: 'clamp(330px, 29vw, 540px)' }}
      >
        {/* print-dot field behind the picture, echoing its halftone */}
        <div className="absolute -left-28 -bottom-24 h-[75%] w-[85%]" style={{ backgroundImage: 'radial-gradient(rgba(52,112,142,0.5) 1.6px, transparent 1.9px)', backgroundSize: '16px 16px', maskImage: dots, WebkitMaskImage: dots }} />
        <div className="absolute -right-24 -top-20 h-[45%] w-[60%]" style={{ backgroundImage: 'radial-gradient(rgba(52,112,142,0.4) 1.6px, transparent 1.9px)', backgroundSize: '16px 16px', maskImage: dots, WebkitMaskImage: dots }} />
        {/* soft sky-blue glow so the picture sits in the page's colour wash */}
        <div className="absolute -inset-8 rounded-[60px]" style={{ background: 'radial-gradient(circle at 60% 40%, rgba(96,165,196,0.35), transparent 70%)', filter: 'blur(40px)' }} />

        <div className="hero-float relative">
          <div className="relative overflow-hidden rounded-[34px]"
            style={{ aspectRatio: '968 / 1380', transform: 'rotate(2.5deg)', boxShadow: '0 50px 90px -35px rgba(30,70,95,0.55), 0 0 0 6px rgba(255,255,255,0.55)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero-clouds.webp" alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
            {/* warm paper tint at the bottom, matching the beige page */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(236,226,212,0.45), rgba(236,226,212,0) 38%)' }} />
          </div>
        </div>

        {/* "confirmed" chip, top right */}
        <div className="hero-float-late absolute -right-8 top-12 flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4" style={glass}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: '#1f9d55' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
          </span>
          <span className="text-[13px] font-semibold text-[#1d1d1f]">{L(lng as SiteLng, { en: "Sat 14:30 · Confirmed", nl: "za 14:30 · Bevestigd", de: "Sa 14:30 · Bestätigt", tr: "Cmt 14:30 · Onaylandı", ar: "السبت 14:30 · مؤكد" })}</span>
        </div>

        {/* phone-style booking notification, overlapping the lower left corner */}
        <div className="hero-float-late absolute -left-20 bottom-16 w-[270px] rounded-[20px] px-4 pt-3 pb-3.5" style={glass}>
          <div className="mb-1.5 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Snippr" style={{ height: 13, width: 'auto' }} />
            <span className="ml-auto text-[11px] text-[#9ca3af]">{L(lng as SiteLng, { en: "now", nl: "nu", de: "jetzt", tr: "şimdi", ar: "الآن" })}</span>
          </div>
          <p className="text-[13.5px] font-semibold text-[#1d1d1f]">{L(lng as SiteLng, { en: "New booking", nl: "Nieuwe afspraak", de: "Neuer Termin", tr: "Yeni randevu", ar: "حجز جديد" })}</p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-[#4b5563]">{L(lng as SiteLng, { en: "Ali booked a haircut for Saturday at 14:30.", nl: "Ali boekte een knipbeurt voor zaterdag 14:30.", de: "Ali hat einen Haarschnitt für Samstag 14:30 gebucht.", tr: "Ali, Cumartesi 14:30 için saç kesimi randevusu aldı.", ar: "حجز علي قص شعر يوم السبت الساعة 14:30." })}</p>
        </div>
      </motion.div>
    </div>
  )
}

// "Snippr on your phone" QR box in the bottom corner (components/ui/download-popup.tsx). Off for now.
const SHOW_PHONE_POPUP = false

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
  'Pricing': '/pricing', 'About': '/about', 'FAQ': '/faq', 'Help & support': '/help', 'Contact': '/contact', 'Privacy': '/privacy', 'Terms': '/terms', 'Imprint': '/imprint', 'DPA': '/dpa', 'Cookie settings': '#cookie-settings',
}

function FooterLinks({ links }: { links: string[] }) {
  return (
    <ul className="space-y-3">
      {links.map((l) => (
        <li key={l}>
          <a href={FOOTER_HREFS[l] ?? '#'} className="text-[13.5px] uppercase tracking-wide transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}
            onClick={FOOTER_HREFS[l] === '#cookie-settings' ? (e) => { e.preventDefault(); openCookieSettings() } : undefined}
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
    { q: 'What if a customer doesn’t show up?', a: 'You get a notification for every booking and can confirm or cancel it from your dashboard. Every booking includes the customer’s contact details, so you can reach them. Customers who left an email also get an automatic reminder before their appointment.' },
    { q: 'Can customers cancel their appointment?', a: 'Yes. Every booking email has a “Cancel my appointment” link. The time opens up again in your calendar right away and you get a notification. To change the time, they cancel and pick a new one on your booking page.' },
    { q: 'Can two people book the same time?', a: 'Never. Once a slot is taken it disappears for everyone, so you can’t get double-booked.' },
    { q: 'Can I set my working hours and days off?', a: 'Yes — set your hours for each day of the week and switch off the days you’re closed. Those times are never offered to customers.' },
  ],
  'Pricing': [
    { q: 'Is Snippr free?', a: `Every plan is free to try for ${TRIAL_DAYS} days, no credit card needed. Nothing is charged when the trial ends: before payments open we email you first, and you keep all your data.` },
    { q: 'Are there hidden costs?', a: 'No. No setup fees, no subscription today, and we never take a commission on your bookings.' },
    { q: 'Can I delete my account?', a: 'Anytime, from Settings → Delete account. Your page, services and appointments are removed for good.' },
  ],
  'Payments': [
    { q: 'Can I take a deposit or payment online?', a: 'Not yet — customers pay you in your shop, the way they already do. Online deposits are on our roadmap.' },
    { q: 'Does Snippr take a cut of my earnings?', a: 'No. You keep 100% of what your customers pay you.' },
  ],
  'Features': [
    { q: 'Do customers get a confirmation?', a: 'Yes — if they leave their email, they get a confirmation with the date, time and price right after booking, plus an automatic reminder before the appointment.' },
    { q: 'Can I offer discounts?', a: 'Not yet. Promotions such as a first-visit discount are planned for the paid plan.' },
    { q: 'Can I set my own services and prices?', a: 'Of course — add as many services as you like, each with its own duration and price.' },
    { q: 'Can I share my page on Instagram?', a: 'Yes — your link is made for Instagram bios, Stories and WhatsApp, and you get a QR code to print for your counter.' },
    { q: 'Can I add my team / multiple barbers?', a: 'Not yet — today each account is one barber with one calendar. Team calendars are on our roadmap.' },
  ],
  'Support': [
    { q: 'How do I get help?', a: `Email us at ${SUPPORT_EMAIL} and we’ll reply by email.` },
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
    { q: 'Müşteri gelmezse ne olur?', a: 'Her randevuda bildirim alırsın ve panelinden onaylayıp iptal edebilirsin. Her randevuda müşterinin iletişim bilgisi olduğu için ona ulaşabilirsin. E-postasını bırakan müşteriler randevudan önce otomatik hatırlatma da alır.' },
    { q: 'Müşteriler randevusunu iptal edebilir mi?', a: 'Evet. Her randevu e-postasında “Randevumu iptal et” linki var. O saat takviminde hemen tekrar boşalır ve sana bildirim gelir. Saati değiştirmek isteyen müşteri iptal edip randevu sayfandan yeni bir saat seçer.' },
    { q: 'İki kişi aynı saati alabilir mi?', a: 'Asla. Bir saat dolunca herkes için kaybolur, böylece çift rezervasyon olmaz.' },
    { q: 'Çalışma saatlerimi ve izin günlerimi ayarlayabilir miyim?', a: 'Evet — haftanın her günü için saatlerini ayarla, kapalı olduğun günleri kapat. O saatler müşterilere hiç gösterilmez.' },
  ],
  'Fiyatlandırma': [
    { q: 'Snippr ücretsiz mi?', a: `Bütün planları ${TRIAL_DAYS} gün ücretsiz deneyebilirsin, kredi kartı gerekmez. Deneme bitince otomatik ücret alınmaz: ödemeler açılmadan önce sana e-postayla haber veririz, tüm verilerin seninle kalır.` },
    { q: 'Gizli bir ücret var mı?', a: 'Hayır. Kurulum ücreti yok, şu an abonelik yok ve randevularından asla komisyon alınmaz.' },
    { q: 'Hesabımı silebilir miyim?', a: 'İstediğin an, Ayarlar → Hesabı sil’den. Sayfan, hizmetlerin ve randevuların kalıcı olarak silinir.' },
  ],
  'Ödemeler': [
    { q: 'Online kapora/ödeme alabilir miyim?', a: 'Henüz değil — müşteriler ödemeyi her zamanki gibi dükkânda yapar. Online kapora yol haritamızda.' },
    { q: 'Snippr kazancımdan pay alıyor mu?', a: 'Hayır. Müşterinin sana ödediğinin %100’ü senin.' },
  ],
  'Özellikler': [
    { q: 'Müşteriye onay gider mi?', a: 'Evet — e-postasını yazdıysa randevudan hemen sonra tarih, saat ve fiyatla bir onay maili alır, randevudan önce de otomatik bir hatırlatma gelir.' },
    { q: 'İndirim sunabilir miyim?', a: 'Henüz değil. İlk ziyaret indirimi gibi kampanyalar ücretli plan için planlanıyor.' },
    { q: 'Kendi hizmet ve fiyatlarımı koyabilir miyim?', a: 'Tabii — istediğin kadar hizmet ekle, her birinin kendi süresi ve fiyatı olsun.' },
    { q: 'Sayfamı Instagram’da paylaşabilir miyim?', a: 'Evet — linkin Instagram bio’su, hikâyeler ve WhatsApp için hazır; tezgâhın için yazdırabileceğin bir QR kod da alırsın.' },
    { q: 'Ekibimi / birden fazla berberi ekleyebilir miyim?', a: 'Henüz değil — şu an her hesap tek berber ve tek takvim. Ekip takvimi yol haritamızda.' },
  ],
  'Destek': [
    { q: 'Nasıl yardım alırım?', a: `${SUPPORT_EMAIL} adresine yaz, e-postana cevap verelim.` },
    { q: 'Kurulumda yardımcı olur musunuz?', a: 'Evet — bize yaz, hizmetlerini, saatlerini ve rezervasyon sayfanı ücretsiz birlikte hazırlayalım.' },
    { q: 'Verim güvende mi?', a: 'Verin AB’de güvenle saklanır ve asla satılmaz. Müşteri bilgilerini sadece sen görürsün; hesabını ve tüm verini Ayarlar’dan istediğin an silebilirsin.' },
  ],
}

const FAQ_DATA_NL: Record<string, { q: string; a: string }[]> = {
  'Aan de slag': [
    { q: 'Hoe stel ik mijn boekingspagina in?', a: 'Meld je aan en voeg je behandelingen, prijzen en openingstijden toe. Binnen ongeveer 2 minuten heb je je eigen boekingslink om te delen.' },
    { q: 'Hoe boeken mijn klanten?', a: 'Deel je link of QR-code op Instagram, WhatsApp of in je zaak. Klanten kiezen een behandeling en een vrij tijdstip en bevestigen; jij krijgt direct een melding.' },
    { q: 'Moeten klanten een app downloaden?', a: 'Nee. Snippr opent in elke browser. Ze tikken op je link en boeken, er hoeft niets geïnstalleerd te worden.' },
    { q: 'Ik ben niet zo handig met technologie. Is het moeilijk?', a: 'Helemaal niet. Kun je Instagram gebruiken, dan kun je Snippr gebruiken. Het instellen gaat stap voor stap, en we helpen je als je vastloopt.' },
  ],
  'Afspraken': [
    { q: 'Wat als een klant niet komt opdagen?', a: 'Je krijgt bij elke afspraak een melding en kunt die in je dashboard bevestigen of annuleren. Bij elke afspraak staan de contactgegevens van de klant, zodat je hem kunt bereiken. Klanten die hun e-mail achterlaten krijgen ook een automatische herinnering.' },
    { q: 'Kunnen klanten hun afspraak annuleren?', a: 'Ja. In elke afspraakmail staat een link “Afspraak annuleren”. Het tijdstip komt meteen weer vrij in je agenda en je krijgt een melding. Wil een klant een andere tijd, dan annuleert hij en kiest hij een nieuwe op je boekingspagina.' },
    { q: 'Kunnen twee mensen hetzelfde tijdstip boeken?', a: 'Nooit. Zodra een tijdstip bezet is, verdwijnt het voor iedereen. Dubbele boekingen zijn dus onmogelijk.' },
    { q: 'Kan ik mijn openingstijden en vrije dagen instellen?', a: 'Ja. Stel je tijden per weekdag in en zet de dagen uit waarop je dicht bent. Die tijden worden nooit aan klanten getoond.' },
  ],
  'Prijzen': [
    { q: 'Is Snippr gratis?', a: `Elk abonnement kun je ${TRIAL_DAYS} dagen gratis proberen, zonder creditcard. Er wordt niets afgeschreven als de proef afloopt: voordat betalingen starten mailen we je eerst, en al je gegevens blijven van jou.` },
    { q: 'Zijn er verborgen kosten?', a: 'Nee. Geen opstartkosten, en we nemen nooit commissie op je afspraken.' },
    { q: 'Kan ik mijn account verwijderen?', a: 'Altijd, via Instellingen → Account verwijderen. Je pagina, behandelingen en afspraken worden definitief verwijderd.' },
  ],
  'Betalingen': [
    { q: 'Kan ik online een aanbetaling of betaling ontvangen?', a: 'Nog niet. Klanten betalen je in de zaak, zoals ze nu al doen. Online aanbetalingen staan op onze planning.' },
    { q: 'Neemt Snippr een deel van mijn verdiensten?', a: 'Nee. Je houdt 100% van wat je klanten je betalen.' },
  ],
  'Functies': [
    { q: 'Krijgen klanten een bevestiging?', a: 'Ja. Als ze hun e-mail achterlaten, krijgen ze direct na het boeken een bevestiging met datum, tijd en prijs, plus een automatische herinnering vóór de afspraak.' },
    { q: 'Kan ik kortingen geven?', a: 'Nog niet. Acties zoals korting bij het eerste bezoek staan gepland voor het betaalde abonnement.' },
    { q: 'Kan ik mijn eigen behandelingen en prijzen instellen?', a: 'Natuurlijk. Voeg zoveel behandelingen toe als je wilt, elk met een eigen duur en prijs.' },
    { q: 'Kan ik mijn pagina op Instagram delen?', a: 'Ja. Je link is gemaakt voor je Instagram-bio, Stories en WhatsApp, en je krijgt een QR-code om te printen voor bij de kassa.' },
    { q: 'Kan ik mijn team of meerdere kappers toevoegen?', a: 'Nog niet. Nu is elk account één kapper met één agenda. Teamagenda’s staan op onze planning.' },
  ],
  'Support': [
    { q: 'Hoe krijg ik hulp?', a: `Mail ons op ${SUPPORT_EMAIL}, dan antwoorden we per e-mail.` },
    { q: 'Helpen jullie me met instellen?', a: 'Ja. Mail ons en we helpen je gratis met je behandelingen, tijden en boekingspagina.' },
    { q: 'Zijn mijn gegevens veilig?', a: 'Je gegevens worden veilig in de EU opgeslagen en nooit verkocht. Alleen jij ziet de gegevens van je klanten, en je kunt je account en al je gegevens altijd verwijderen via Instellingen.' },
  ],
}

const FAQ_DATA_DE: Record<string, { q: string; a: string }[]> = {
  'Erste Schritte': [
    { q: 'Wie richte ich meine Buchungsseite ein?', a: 'Registriere dich und trag deine Leistungen, Preise und Arbeitszeiten ein. In etwa 2 Minuten hast du deinen eigenen Buchungslink zum Teilen.' },
    { q: 'Wie buchen meine Kunden?', a: 'Teile deinen Link oder QR-Code auf Instagram, WhatsApp oder im Laden. Kunden wählen eine Leistung und eine freie Zeit und bestätigen; du wirst sofort benachrichtigt.' },
    { q: 'Müssen Kunden eine App herunterladen?', a: 'Nein. Snippr öffnet sich in jedem Browser. Sie tippen auf deinen Link und buchen, nichts muss installiert werden.' },
    { q: 'Ich bin nicht so technikaffin. Ist das schwer?', a: 'Überhaupt nicht. Wenn du Instagram nutzen kannst, kannst du auch Snippr nutzen. Die Einrichtung führt dich Schritt für Schritt, und wir helfen, wenn du nicht weiterkommst.' },
  ],
  'Termine': [
    { q: 'Was, wenn ein Kunde nicht erscheint?', a: 'Du bekommst bei jeder Buchung eine Benachrichtigung und kannst sie im Dashboard bestätigen oder absagen. Jede Buchung enthält die Kontaktdaten des Kunden, damit du ihn erreichst. Kunden, die ihre E-Mail angeben, bekommen außerdem eine automatische Erinnerung.' },
    { q: 'Können Kunden ihren Termin absagen?', a: 'Ja. In jeder Buchungsmail gibt es einen Link „Termin absagen“. Die Zeit wird sofort wieder frei in deinem Kalender und du bekommst eine Benachrichtigung. Für eine andere Zeit sagt der Kunde ab und wählt auf deiner Buchungsseite eine neue.' },
    { q: 'Können zwei Personen dieselbe Zeit buchen?', a: 'Nie. Sobald eine Zeit vergeben ist, verschwindet sie für alle. Doppelbuchungen sind also ausgeschlossen.' },
    { q: 'Kann ich Arbeitszeiten und freie Tage festlegen?', a: 'Ja. Leg deine Zeiten für jeden Wochentag fest und schalte die Tage ab, an denen du geschlossen hast. Diese Zeiten werden Kunden nie angeboten.' },
  ],
  'Preise': [
    { q: 'Ist Snippr kostenlos?', a: `Jeden Tarif kannst du ${TRIAL_DAYS} Tage kostenlos testen, ohne Kreditkarte. Wenn die Testphase endet, wird nichts abgebucht: Bevor Zahlungen starten, schreiben wir dir zuerst, und alle deine Daten bleiben deine.` },
    { q: 'Gibt es versteckte Kosten?', a: 'Nein. Keine Einrichtungsgebühr, und wir nehmen nie Provision auf deine Buchungen.' },
    { q: 'Kann ich mein Konto löschen?', a: 'Jederzeit, unter Einstellungen → Konto löschen. Deine Seite, Leistungen und Termine werden endgültig entfernt.' },
  ],
  'Zahlungen': [
    { q: 'Kann ich online eine Anzahlung oder Zahlung annehmen?', a: 'Noch nicht. Kunden bezahlen dich im Laden, so wie bisher. Online-Anzahlungen sind geplant.' },
    { q: 'Nimmt Snippr einen Anteil an meinen Einnahmen?', a: 'Nein. Du behältst 100 % von dem, was deine Kunden dir zahlen.' },
  ],
  'Funktionen': [
    { q: 'Bekommen Kunden eine Bestätigung?', a: 'Ja. Wenn sie ihre E-Mail angeben, bekommen sie direkt nach der Buchung eine Bestätigung mit Datum, Uhrzeit und Preis, dazu eine automatische Erinnerung vor dem Termin.' },
    { q: 'Kann ich Rabatte anbieten?', a: 'Noch nicht. Aktionen wie ein Rabatt beim ersten Besuch sind für den bezahlten Tarif geplant.' },
    { q: 'Kann ich eigene Leistungen und Preise festlegen?', a: 'Natürlich. Füge so viele Leistungen hinzu, wie du willst, jede mit eigener Dauer und eigenem Preis.' },
    { q: 'Kann ich meine Seite auf Instagram teilen?', a: 'Ja. Dein Link ist für Instagram-Bio, Stories und WhatsApp gemacht, und du bekommst einen QR-Code zum Ausdrucken für die Theke.' },
    { q: 'Kann ich mein Team oder mehrere Barbiere hinzufügen?', a: 'Noch nicht. Derzeit ist jedes Konto ein Barbier mit einem Kalender. Team-Kalender sind geplant.' },
  ],
  'Support': [
    { q: 'Wie bekomme ich Hilfe?', a: `Schreib uns an ${SUPPORT_EMAIL}, wir antworten per E-Mail.` },
    { q: 'Helft ihr mir bei der Einrichtung?', a: 'Ja. Schreib uns und wir richten deine Leistungen, Zeiten und Buchungsseite kostenlos mit dir ein.' },
    { q: 'Sind meine Daten sicher?', a: 'Deine Daten werden sicher in der EU gespeichert und nie verkauft. Nur du siehst die Daten deiner Kunden, und du kannst dein Konto mit allen Daten jederzeit in den Einstellungen löschen.' },
  ],
}

const FAQ_DATA_AR: Record<string, { q: string; a: string }[]> = {
  'البداية': [
    { q: 'كيف أُعدّ صفحة الحجز؟', a: 'سجّل وأضف خدماتك وأسعارك وساعات عملك، وخلال دقيقتين تقريبًا يصبح لديك رابط حجز خاص بك لمشاركته.' },
    { q: 'كيف يحجز عملائي؟', a: 'شارك رابطك أو رمز QR على إنستغرام أو واتساب أو في محلك. يختار العميل خدمة ووقتًا متاحًا ويؤكد، ويصلك إشعار فورًا.' },
    { q: 'هل يحتاج العملاء إلى تنزيل تطبيق؟', a: 'لا. يفتح Snippr في أي متصفح. يضغطون على رابطك ويحجزون، دون تثبيت أي شيء.' },
    { q: 'لست جيدًا في التقنية، هل الأمر صعب؟', a: 'إطلاقًا. إذا كنت تستخدم إنستغرام فستستخدم Snippr. الإعداد يرشدك خطوة بخطوة، ونحن هنا إذا احتجت مساعدة.' },
  ],
  'الحجوزات': [
    { q: 'ماذا لو لم يحضر العميل؟', a: 'يصلك إشعار مع كل حجز ويمكنك تأكيده أو إلغاؤه من لوحتك. كل حجز يتضمن بيانات تواصل العميل لتتمكن من الوصول إليه. والعملاء الذين يتركون بريدهم يحصلون أيضًا على تذكير تلقائي قبل الموعد.' },
    { q: 'هل يمكن للعملاء إلغاء موعدهم؟', a: 'نعم. في كل رسالة حجز رابط "إلغاء موعدي". يصبح الوقت متاحًا فورًا في تقويمك ويصلك إشعار. ولتغيير الوقت يلغي العميل ويختار وقتًا جديدًا من صفحة الحجز.' },
    { q: 'هل يمكن لشخصين حجز الوقت نفسه؟', a: 'أبدًا. بمجرد حجز الوقت يختفي للجميع، فلا يحدث حجز مزدوج.' },
    { q: 'هل يمكنني ضبط ساعات العمل وأيام العطلة؟', a: 'نعم. اضبط ساعاتك لكل يوم من أيام الأسبوع وأغلق الأيام التي لا تعمل فيها، ولن تُعرض تلك الأوقات على العملاء.' },
  ],
  'الأسعار': [
    { q: 'هل Snippr مجاني؟', a: `يمكنك تجربة كل الخطط مجانًا لمدة ${TRIAL_DAYS} يومًا بدون بطاقة ائتمان. لا يُخصم شيء عند انتهاء التجربة: قبل بدء الدفع نراسلك أولًا، وتبقى كل بياناتك ملكك.` },
    { q: 'هل توجد رسوم خفية؟', a: 'لا. لا رسوم إعداد، ولا نأخذ أي عمولة على حجوزاتك.' },
    { q: 'هل يمكنني حذف حسابي؟', a: 'في أي وقت من الإعدادات ← حذف الحساب. تُحذف صفحتك وخدماتك ومواعيدك نهائيًا.' },
  ],
  'الدفع': [
    { q: 'هل يمكنني أخذ عربون أو دفع عبر الإنترنت؟', a: 'ليس بعد. يدفع العملاء لك في المحل كما يفعلون الآن. العربون عبر الإنترنت ضمن خططنا.' },
    { q: 'هل يأخذ Snippr نسبة من أرباحي؟', a: 'لا. تحتفظ بـ 100% مما يدفعه لك عملاؤك.' },
  ],
  'الميزات': [
    { q: 'هل يحصل العملاء على تأكيد؟', a: 'نعم. إذا تركوا بريدهم الإلكتروني يحصلون على تأكيد بالتاريخ والوقت والسعر بعد الحجز مباشرة، مع تذكير تلقائي قبل الموعد.' },
    { q: 'هل يمكنني تقديم خصومات؟', a: 'ليس بعد. العروض مثل خصم الزيارة الأولى مخطط لها في الخطة المدفوعة.' },
    { q: 'هل يمكنني إضافة خدماتي وأسعاري؟', a: 'بالطبع. أضف ما تشاء من الخدمات، لكل منها مدتها وسعرها.' },
    { q: 'هل يمكنني مشاركة صفحتي على إنستغرام؟', a: 'نعم. رابطك مناسب للبايو والقصص وواتساب، وتحصل على رمز QR لطباعته عند الكاشير.' },
    { q: 'هل يمكنني إضافة فريقي أو أكثر من حلاق؟', a: 'ليس بعد. حاليًا كل حساب لحلاق واحد بتقويم واحد. تقويمات الفريق ضمن خططنا.' },
  ],
  'الدعم': [
    { q: 'كيف أحصل على المساعدة؟', a: `راسلنا على ${SUPPORT_EMAIL} وسنرد عليك بالبريد.` },
    { q: 'هل تساعدونني في الإعداد؟', a: 'نعم. راسلنا وسنساعدك مجانًا في إعداد خدماتك وساعاتك وصفحة الحجز.' },
    { q: 'هل بياناتي آمنة؟', a: 'تُحفظ بياناتك بأمان داخل الاتحاد الأوروبي ولا تُباع أبدًا. أنت وحدك ترى بيانات عملائك، ويمكنك حذف حسابك وكل بياناته في أي وقت من الإعدادات.' },
  ],
}

type Lng = SiteLng
const FAQ_BY_LANG: Record<Lng, Record<string, { q: string; a: string }[]>> = { en: FAQ_DATA, tr: FAQ_DATA_TR, nl: FAQ_DATA_NL, de: FAQ_DATA_DE, ar: FAQ_DATA_AR }

// Landing copy (English, Dutch, German, Turkish, Arabic)
const LC: Record<Lng, {
  nav: { how: string; pricing: string; faq: string; about: string; help: string }
  login: string; getStarted: string; badge: string; downloadApp: string
  heroBig: string; heroSub: string
  appTag: string; appTitle: string; appBody: string; appBtn: string; appDone: string
  howTag: string; howTitle: string; howBody: string; howSteps: { title: string; body: string }[]
  baTitle: string; baRows: [string, string][]
  questions: string
  briefTitle: string; briefBody: string; briefPlaceholder: string; briefBtn: string
  trustTag: string; trustTitle: string; trustBody: string
  stats: { name: string; value: string; href: string }[]
  tagline: string; rights: string; builtWith: string
}> = {
  en: {
    nav: { how: 'How it works', pricing: 'Pricing', faq: 'FAQ', about: 'About', help: 'Help & support' },
    login: 'Login', getStarted: 'Get started', badge: 'Online booking 24/7', downloadApp: 'Download App',
    heroBig: 'NEVER MISS\nA CUSTOMER.',
    heroSub: 'Put your link in your bio, on Instagram or anywhere you like — or hang up your QR code. Clients book in seconds.',
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
    briefTitle: 'TALK TO US', briefBody: 'Questions, ideas, or want help setting up your page? We read every email.',
    briefPlaceholder: '', briefBtn: 'EMAIL US',
    trustTag: 'Built for the long view', trustTitle: 'Make room for the work that matters.',
    trustBody: 'Snippr keeps the details moving quietly in the background, so every appointment feels considered from first click to final look.',
    stats: [
      { name: 'Free trial, no credit card', value: `${TRIAL_DAYS} days`, href: '/pricing' },
      { name: 'To set up your booking page', value: '2 min', href: '/register' },
      { name: 'Customers book day and night', value: '24/7', href: '#how' },
    ],
    tagline: 'Helping barbers fill every chair, effortlessly.', rights: `© ${new Date().getFullYear()} Snippr. All rights reserved.`, builtWith: 'Built with',
  },
  tr: {
    nav: { how: 'Nasıl çalışır', pricing: 'Fiyatlandırma', faq: 'SSS', about: 'Hakkında', help: 'Yardım ve destek' },
    login: 'Giriş', getStarted: 'Başla', badge: '7/24 online randevu', downloadApp: 'Uygulamayı İndir',
    heroBig: 'MÜŞTERİNİ\nKAÇIRMA.',
    heroSub: 'Linkini bio’na, Instagram’a ya da istediğin yere koy — veya QR kodunu as. Müşterilerin saniyeler içinde randevu alsın.',
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
    briefTitle: 'BİZE YAZ', briefBody: 'Sorun, fikrin ya da sayfanı kurmak için yardım mı lazım? Her e-postayı okuyoruz.',
    briefPlaceholder: '', briefBtn: 'E-POSTA GÖNDER',
    trustTag: 'Uzun vadeli düşünüldü', trustTitle: 'Önemli işe zaman ayır.',
    trustBody: 'Snippr detayları sessizce arka planda yürütür — her randevu ilk tıktan son ana kadar özenle planlanır.',
    stats: [
      { name: 'Ücretsiz deneme, kredi kartı yok', value: `${TRIAL_DAYS} gün`, href: '/pricing' },
      { name: 'Randevu sayfan bu kadar sürede hazır', value: '2 dk', href: '/register' },
      { name: 'Müşteriler gece gündüz randevu alır', value: '7/24', href: '#how' },
    ],
    tagline: 'Berberlerin her koltuğu zahmetsizce doldurmasına yardım ediyoruz.', rights: `© ${new Date().getFullYear()} Snippr. Tüm hakları saklıdır.`, builtWith: 'Şununla yapıldı:',
  },
  nl: {
    nav: { how: 'Hoe het werkt', pricing: 'Prijzen', faq: 'Veelgestelde vragen', about: 'Over ons', help: 'Hulp en support' },
    login: 'Inloggen', getStarted: 'Beginnen', badge: '24/7 online boeken', downloadApp: 'App downloaden',
    heroBig: 'MIS NOOIT\nMEER EEN KLANT.',
    heroSub: 'Zet je link in je bio, op Instagram of waar je maar wilt, of hang je QR-code op. Klanten boeken in een paar seconden.',
    appTag: 'Mobiele app', appTitle: 'Snippr als app?',
    appBody: 'Snippr werkt al prima in de browser van je telefoon. We bouwen ook apps voor iOS en Android. Wil je het als eerste horen als ze klaar zijn?',
    appBtn: 'Mail me als hij klaar is', appDone: 'Bedankt! Stuur die e-mail en je hoort het als eerste.',
    howTag: 'Aan de slag', howTitle: 'Eenvoudige stappen om te beginnen',
    howBody: 'Volg deze stappen om je boekingspagina in te stellen en binnen een paar minuten afspraken te ontvangen.',
    howSteps: [
      { title: 'Aanmelden', body: 'Maak je account aan en voeg je behandelingen, prijzen en openingstijden toe.' },
      { title: 'Je boekingslink', body: 'Krijg je eigen boekingslink en een QR-code om te printen voor je zaak.' },
      { title: 'Delen', body: 'Zet hem op Instagram en WhatsApp, of print de QR-code voor bij de kassa.' },
      { title: 'Afspraken en groei', body: 'Klanten boeken 24/7 online. Jij beheert elke afspraak vanuit één dashboard.' },
    ],
    baTitle: 'Stop met achter afspraken aan rennen.',
    baRows: [
      ['Eindeloze berichtjes om een tijd te prikken', 'Ze tikken op je link en zijn geboekt'],
      ['Klanten die de details vergeten', 'Een bevestigingsmail met datum en tijd'],
      ['Afspraken missen terwijl je knipt', 'Direct een melding op je telefoon'],
      ['Een volgekrabbeld afsprakenboekje', 'Alle afspraken op één plek'],
      ['Klanten die vragen “waar zit je?”', 'Je adres opent direct in Maps'],
    ],
    questions: 'Vragen?',
    briefTitle: 'NEEM CONTACT OP', briefBody: 'Vragen, ideeën of hulp nodig bij het instellen van je pagina? We lezen elke e-mail.',
    briefPlaceholder: '', briefBtn: 'MAIL ONS',
    trustTag: 'Gemaakt voor de lange termijn', trustTitle: 'Maak ruimte voor het werk dat telt.',
    trustBody: 'Snippr regelt de details stil op de achtergrond, zodat elke afspraak goed verzorgd is van de eerste klik tot de laatste look.',
    stats: [
      { name: 'Gratis proefperiode, geen creditcard', value: `${TRIAL_DAYS} dagen`, href: '/pricing' },
      { name: 'Om je boekingspagina in te stellen', value: '2 min', href: '/register' },
      { name: 'Klanten boeken dag en nacht', value: '24/7', href: '#how' },
    ],
    tagline: 'We helpen kappers elke stoel moeiteloos te vullen.', rights: `© ${new Date().getFullYear()} Snippr. Alle rechten voorbehouden.`, builtWith: 'Gemaakt met',
  },
  de: {
    nav: { how: 'So funktioniert’s', pricing: 'Preise', faq: 'FAQ', about: 'Über uns', help: 'Hilfe und Support' },
    login: 'Anmelden', getStarted: 'Loslegen', badge: 'Online-Buchung rund um die Uhr', downloadApp: 'App laden',
    heroBig: 'VERPASSE NIE\nWIEDER KUNDEN.',
    heroSub: 'Pack deinen Link in deine Bio, auf Instagram oder wohin du willst, oder häng deinen QR-Code auf. Kunden buchen in Sekunden.',
    appTag: 'Mobile App', appTitle: 'Snippr als App?',
    appBody: 'Snippr läuft schon super im Browser deines Handys. Wir bauen auch Apps für iOS und Android. Willst du als Erster erfahren, wann sie fertig sind?',
    appBtn: 'Schreib mir, wenn sie fertig ist', appDone: 'Danke! Schick die E-Mail ab und du erfährst es als Erster.',
    howTag: 'Erste Schritte', howTitle: 'Einfache Schritte zum Start',
    howBody: 'Mit diesen Schritten richtest du deine Buchungsseite ein und nimmst in wenigen Minuten Termine an.',
    howSteps: [
      { title: 'Registrieren', body: 'Erstelle dein Konto und trag deine Leistungen, Preise und Arbeitszeiten ein.' },
      { title: 'Dein Buchungslink', body: 'Hol dir deinen eigenen Buchungslink und einen QR-Code zum Ausdrucken für deinen Laden.' },
      { title: 'Teilen', body: 'Teile ihn auf Instagram und WhatsApp oder druck den QR-Code für die Theke aus.' },
      { title: 'Gebucht werden und wachsen', body: 'Kunden buchen rund um die Uhr online. Du verwaltest jeden Termin in einem Dashboard.' },
    ],
    baTitle: 'Schluss mit Hinterherlaufen. Fang an zu buchen.',
    baRows: [
      ['Endlose Nachrichten, nur um eine Zeit zu finden', 'Sie tippen auf deinen Link und sind gebucht'],
      ['Kunden, die die Details vergessen', 'Eine Bestätigungsmail mit Datum und Uhrzeit'],
      ['Verpasste Buchungen, während du schneidest', 'Sofortige Benachrichtigung aufs Handy'],
      ['Ein vollgekritzeltes Terminbuch', 'Alle Termine an einem Ort'],
      ['Kunden, die fragen „Wo bist du?“', 'Deine Adresse öffnet sich direkt in Maps'],
    ],
    questions: 'Fragen?',
    briefTitle: 'SCHREIB UNS', briefBody: 'Fragen, Ideen oder Hilfe beim Einrichten deiner Seite? Wir lesen jede E-Mail.',
    briefPlaceholder: '', briefBtn: 'E-MAIL SENDEN',
    trustTag: 'Auf lange Sicht gebaut', trustTitle: 'Schaff Platz für die Arbeit, die zählt.',
    trustBody: 'Snippr hält die Details leise im Hintergrund am Laufen, damit sich jeder Termin vom ersten Klick bis zum fertigen Look durchdacht anfühlt.',
    stats: [
      { name: 'Kostenlos testen, ohne Kreditkarte', value: `${TRIAL_DAYS} Tage`, href: '/pricing' },
      { name: 'Bis deine Buchungsseite steht', value: '2 Min.', href: '/register' },
      { name: 'Kunden buchen Tag und Nacht', value: '24/7', href: '#how' },
    ],
    tagline: 'Wir helfen Barbieren, jeden Stuhl mühelos zu füllen.', rights: `© ${new Date().getFullYear()} Snippr. Alle Rechte vorbehalten.`, builtWith: 'Gebaut mit',
  },
  ar: {
    nav: { how: 'كيف يعمل', pricing: 'الأسعار', faq: 'الأسئلة الشائعة', about: 'من نحن', help: 'المساعدة والدعم' },
    login: 'تسجيل الدخول', getStarted: 'ابدأ الآن', badge: 'حجز عبر الإنترنت على مدار الساعة', downloadApp: 'نزّل التطبيق',
    heroBig: 'لا تفوّت\nأي زبون.',
    heroSub: 'ضع رابطك في البايو أو على إنستغرام أو في أي مكان تريده، أو علّق رمز QR الخاص بك. يحجز العملاء في ثوانٍ.',
    appTag: 'تطبيق الجوال', appTitle: 'هل تريد Snippr كتطبيق؟',
    appBody: 'يعمل Snippr بشكل ممتاز في متصفح هاتفك. ونعمل أيضًا على تطبيقات iOS وأندرويد. هل تريد أن تعرف أولًا عندما تصبح جاهزة؟',
    appBtn: 'راسلني عندما يصبح جاهزًا', appDone: 'شكرًا! أرسل تلك الرسالة وستكون أول من يعرف.',
    howTag: 'البداية', howTitle: 'خطوات بسيطة للبدء',
    howBody: 'اتبع هذه الخطوات لإعداد صفحة الحجز وابدأ باستقبال المواعيد خلال دقائق.',
    howSteps: [
      { title: 'سجّل', body: 'أنشئ حسابك وأضف خدماتك وأسعارك وساعات عملك.' },
      { title: 'احصل على رابط الحجز', body: 'احصل على رابط حجز خاص بك ورمز QR لطباعته لمحلك.' },
      { title: 'شاركه', body: 'انشره على إنستغرام وواتساب، أو اطبع رمز QR عند الكاشير.' },
      { title: 'احجز وانمُ', body: 'يحجز العملاء عبر الإنترنت على مدار الساعة، وأنت تدير كل المواعيد من لوحة واحدة.' },
    ],
    baTitle: 'توقف عن الملاحقة. ابدأ بالحجز.',
    baRows: [
      ['رسائل لا تنتهي فقط لاختيار وقت', 'يضغطون على رابطك ويتم الحجز'],
      ['عملاء ينسون التفاصيل', 'بريد تأكيد بالتاريخ والوقت'],
      ['حجوزات تضيع وأنت تعمل', 'إشعار فوري على هاتفك'],
      ['دفتر مواعيد مليء بالشطب', 'كل المواعيد في مكان واحد'],
      ['عملاء يسألون "أين أنت؟"', 'عنوانك يفتح مباشرة في الخرائط'],
    ],
    questions: 'أسئلة؟',
    briefTitle: 'تواصل معنا', briefBody: 'أسئلة أو أفكار أو تحتاج مساعدة في إعداد صفحتك؟ نقرأ كل رسالة.',
    briefPlaceholder: '', briefBtn: 'راسلنا',
    trustTag: 'مصمَّم للمدى الطويل', trustTitle: 'افسح المجال للعمل الذي يهم.',
    trustBody: 'يدير Snippr التفاصيل بهدوء في الخلفية، ليبدو كل موعد مدروسًا من أول نقرة حتى اللمسة الأخيرة.',
    stats: [
      { name: 'تجربة مجانية بدون بطاقة ائتمان', value: `${TRIAL_DAYS} يومًا`, href: '/pricing' },
      { name: 'لإعداد صفحة الحجز', value: 'دقيقتان', href: '/register' },
      { name: 'العملاء يحجزون ليلًا ونهارًا', value: '24/7', href: '#how' },
    ],
    tagline: 'نساعد الحلاقين على ملء كل كرسي بسهولة.', rights: `© ${new Date().getFullYear()} Snippr. جميع الحقوق محفوظة.`, builtWith: 'صُنع باستخدام',
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
                      {`${L(lng as SiteLng, { en: "Step", nl: "Stap", de: "Schritt", tr: "Adım", ar: "الخطوة" })} ${i + 1}`}
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

// quick facts: three plain figures with thin dividers, each one a link
function StatsSection({ lng }: { lng: Lng }) {
  const c = LC[lng]
  return (
    <section className="px-6 py-14" style={{ background: 'transparent' }}>
      <div className="mx-auto grid max-w-4xl grid-cols-1 border-y border-[#1d1d1f]/10 sm:grid-cols-3">
        {c.stats.map((stat, i) => (
          <Link key={stat.name} href={stat.href}
            className={`group flex flex-col items-center px-6 py-8 text-center no-underline transition-colors hover:bg-white/40 ${i > 0 ? 'border-t border-[#1d1d1f]/10 sm:border-t-0 sm:border-l' : ''}`}>
            <span className="text-[40px] leading-none font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-[46px]">{stat.value}</span>
            <span className="mt-3 text-[14.5px] text-[#1d1d1f]/60">{stat.name}</span>
            <span aria-hidden className="mt-3 text-[13px] font-semibold text-[#1d1d1f] opacity-0 transition-opacity group-hover:opacity-100">
              {stat.href === '/pricing' ? L(lng as SiteLng, { en: "See plans →", nl: "Bekijk abonnementen →", de: "Tarife ansehen →", tr: "Planları gör →", ar: "شاهد الخطط ←" }) : stat.href === '/register' ? L(lng as SiteLng, { en: "Get started →", nl: "Nu beginnen →", de: "Jetzt loslegen →", tr: "Hemen başla →", ar: "ابدأ الآن ←" }) : L(lng as SiteLng, { en: "How it works →", nl: "Hoe het werkt →", de: "So funktioniert’s →", tr: "Nasıl çalışır →", ar: "كيف يعمل ←" })}
            </span>
          </Link>
        ))}
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
  const saved = useStored('snippr-lang')
  const browserLng = useClientValue(browserSiteLng, 'en' as SiteLng)
  const lng: Lng = isSiteLng(saved) ? saved : browserLng
  // hero cube: scattered (true) or a cube (false) — changes the hint under it
  const [cubeScattered, setCubeScattered] = useState(false)
  const chooseLng = (l: Lng) => { try { writeStored('snippr-lang', l) } catch { /* storage blocked */ } }
  const c = LC[lng]
  const isRTL = lng === 'ar'

  // Light text on the dark video, dark text on the light colour wash
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
            <Link href="/" className="flex items-center flex-shrink-0 pl-3 pr-1" aria-label="Snippr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SHOW_HERO_VIDEO ? '/logo-white.svg' : '/logo.svg'} alt="Snippr" style={{ height: 26, width: 'auto', display: 'block' }} />
            </Link>

            {/* Menu items */}
            <div className="hidden lg:flex items-center gap-7">
              {[
                { label: c.nav.how,     href: '#how' },
                { label: c.nav.pricing, href: '/pricing' },
                { label: c.nav.faq,     href: '#faq' },
                { label: c.nav.about,   href: '/about' },
                { label: c.nav.help,    href: '/help' },
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
            {/* launch label above the headline: every plan free to try (lib/legal.ts → TRIAL_DAYS) */}
            <Link href="/pricing" className="pointer-events-auto mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)', color: SHOW_HERO_VIDEO ? '#f4efe7' : '#3a3a3c', boxShadow: '0 4px 14px rgba(29,29,31,0.06)' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#34c759' }} />
              {L(lng, { en: `Launch · Every plan free for ${TRIAL_DAYS} days, no card needed`, nl: `Lancering · Elk abonnement ${TRIAL_DAYS} dagen gratis, geen kaart nodig`, de: `Start · Jeder Tarif ${TRIAL_DAYS} Tage kostenlos, keine Karte nötig`, tr: `Lansman · Bütün planlar ${TRIAL_DAYS} gün ücretsiz, kart gerekmez`, ar: `إطلاق · كل الخطط مجانية لمدة ${TRIAL_DAYS} يومًا، بدون بطاقة` })}
              <span aria-hidden>→</span>
            </Link>
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

        {/* ── Cloud artwork on the right (wide screens) ── */}
        {SHOW_HERO_ART && <HeroArt lng={lng} />}

        {/* ── Dotted 3D cube on the right (wide screens) — dots move away from the mouse ── */}
        {SHOW_HERO_CUBE && (
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden items-center justify-center pt-16 lg:flex" style={{ width: '54%' }}>
            <motion.div className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              {/* the cube's own size: grows with the screen but never reaches the headline (300–760px);
                 the drawing area around it is larger so a burst isn't cut off */}
              <div className="relative" style={{ width: 'clamp(300px, calc(146vw - 1680px), 760px)', aspectRatio: '1 / 1' }}>
                <div className="pointer-events-auto absolute cursor-pointer select-none" style={{ inset: '-35%' }}>
                  <ParticleCube onToggle={setCubeScattered} />
                </div>
              </div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[#1d1d1f]/45" style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }}>
                {cubeScattered ? L(lng as SiteLng, { en: "Click again to rebuild", nl: "Klik opnieuw om op te bouwen", de: "Nochmal klicken zum Zusammensetzen", tr: "Tekrar tıkla, toplansın", ar: "اضغط مجددًا لإعادة البناء" }) : L(lng as SiteLng, { en: "Click to scatter", nl: "Klik om te verspreiden", de: "Klicken zum Zerstreuen", tr: "Tıkla, dağılsın", ar: "اضغط للتفريق" })}
              </p>
            </motion.div>
          </div>
        )}

        {/* ── Interactive calendar on the right (wide screens) ── */}
        {SHOW_HERO_CALENDAR && (
        <div className="hero-cal-zoom absolute inset-y-0 right-0 z-10 hidden items-center pr-[5vw] pt-32 xl:flex">
          <HeroCalendar key={lng} lng={lng} />
        </div>
        )}

      </section>

      {/* ── Same calendar under the hero on smaller screens ── */}
      {SHOW_HERO_CALENDAR && (
      <section className="flex justify-center px-5 pt-4 pb-24 xl:hidden" style={{ background: 'transparent' }}>
        <HeroCalendar key={lng} lng={lng} />
      </section>
      )}

      {/* Page story, top to bottom: welcome → quick facts → how it works → every feature →
           what makes us different → old way vs Snippr → promise → questions → app interest */}
      {/* ══ STATS ══ */}
      <StatsSection lng={lng} />

      {/* ══ HOW IT WORKS ══ */}
      {/* Calendly-style expanding cards; the older step timeline is kept behind a flag */}
      {SHOW_STEPS_TIMELINE ? <HowItWorksSection lng={lng} /> : <FeatureAccordion lng={lng} />}

      {/* ══ FEATURE EXPLORER (tabs + spec list) ══ */}
      <FeatureExplorer lng={lng} />

      {/* ══ WHY SNIPPR (what makes us different) ══ */}
      <WhySnippr lng={lng} />

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

      {/* ══ TWISTING RIBBON (switched off) ══ */}
      {SHOW_RIBBON && (
      <section className="ribbon-section pt-10 pb-0" style={{ background: 'transparent' }}>
        <div className="w-full h-[360px]">
          <TwistingRibbon className="rounded-none" />
        </div>
      </section>
      )}

      {/* ══ CLAIM YOUR LINK ══ */}
      <ClaimLink lng={lng} />

      {/* ══ FAQ ══ */}
      <div id="faq" className="scroll-mt-24">
        <FAQ serif={playfair.className} lng={lng} />
      </div>

      {/* ══ APP INTEREST CTA ══ */}
      <AppInterestCTA serif={serif.className} lng={lng} />

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
              <FooterCol title="Company" links={['Pricing', 'About', 'FAQ', 'Help & support', 'Contact', 'Privacy', 'Terms', 'DPA', 'Imprint', 'Cookie settings']} serif={serif.className} />
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
            {/* the logo used as a mask, so it keeps the white-to-grey fade */}
            <h2 className="m-0 select-none" aria-label="Snippr"
              style={{
                height: 'clamp(70px, 14vw, 230px)', aspectRatio: '2.238', maxWidth: '100%',
                background: 'linear-gradient(180deg, #ffffff 0%, #888888 100%)',
                WebkitMaskImage: 'url(/logo.svg)', maskImage: 'url(/logo.svg)',
                WebkitMaskSize: 'contain', maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'left bottom', maskPosition: 'left bottom',
              }}
            />
            <p className={`${serif.className} text-[18px] md:text-[22px] leading-snug max-w-[280px] pb-3`} style={{ color: 'rgba(255,255,255,0.55)' }}>
              {c.tagline}
            </p>
          </div>

          {/* bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.rights}</p>
            <LangCurrencyPicker lng={lng} setLng={chooseLng} theme="dark" placement="up" align="center" />
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.builtWith} <span style={{ color: 'rgba(255,255,255,0.7)' }}>Next.js</span></p>
          </div>
        </div>
      </footer>

      <BackToTop />
      {SHOW_PHONE_POPUP && <DownloadPopup />}
    </main>
  )
}
