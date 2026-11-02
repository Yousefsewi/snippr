'use client'

import { motion } from 'framer-motion'
import { BadgeEuro, Smartphone, Store, Languages, ShieldCheck, MapPin } from 'lucide-react'

// "What makes Snippr different" on the homepage. Only true claims — keep it that way.

type Lng = 'en' | 'tr'

const COPY: Record<Lng, { eyebrow: string; title: string; body: string; items: [string, string][] }> = {
  en: {
    eyebrow: 'WHY SNIPPR',
    title: 'What makes Snippr different',
    body: 'Most booking apps were built for big salons and chains. Snippr is built for the barber with one chair and a busy day.',
    items: [
      ['Free, no commission', 'Start without a credit card. Snippr never takes a cut of your bookings — customers pay you directly.'],
      ['Nothing to install for customers', 'No app and no account. Your customers tap your link and book in a few taps.'],
      ['Your page, not a marketplace', 'Customers only see you — no other barbers listed next to you, no one stealing your clients.'],
      ['Speaks your customers’ language', 'Booking page and emails in English, Turkish, Dutch and Arabic, in the language your customer chose.'],
      ['Your data stays in Europe', 'Stored on servers in the EU and handled under the GDPR. You can download or delete it any time.'],
      ['Made in the Netherlands', 'Built in Assen for barbers and salons — with reminders sent at 10:00 Dutch time.'],
    ],
  },
  tr: {
    eyebrow: 'NEDEN SNIPPR',
    title: 'Snippr’ı farklı kılan ne?',
    body: 'Çoğu randevu uygulaması büyük salonlar ve zincirler için yapıldı. Snippr, tek koltuklu ve günü yoğun geçen berber için yapıldı.',
    items: [
      ['Ücretsiz, komisyon yok', 'Kredi kartı olmadan başla. Snippr randevularından asla pay almaz — müşteri sana doğrudan öder.'],
      ['Müşteriye kurulum yok', 'Uygulama yok, hesap yok. Müşterin linkine dokunur, birkaç dokunuşla randevu alır.'],
      ['Senin sayfan, pazar yeri değil', 'Müşteri sadece seni görür — yanında başka berber listelenmez, kimse müşterini kapmaz.'],
      ['Müşterinin dilini konuşur', 'Randevu sayfası ve mailler İngilizce, Türkçe, Felemenkçe ve Arapça; müşteri hangisini seçtiyse.'],
      ['Verilerin Avrupa’da kalır', 'AB’deki sunucularda, GDPR kurallarıyla saklanır. İstediğin an indirebilir ya da silebilirsin.'],
      ['Hollanda’da yapıldı', 'Assen’de berberler ve salonlar için yapıldı — hatırlatmalar Hollanda saatiyle 10:00’da gider.'],
    ],
  },
}

const ICONS = [BadgeEuro, Smartphone, Store, Languages, ShieldCheck, MapPin]

export default function WhySnippr({ lng }: { lng: Lng }) {
  const c = COPY[lng] ?? COPY.en
  return (
    <section id="why" className="px-5 py-20 md:px-10 lg:py-28" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-4 text-[12px] font-bold tracking-[0.14em] text-[#1d1d1f]">{c.eyebrow}</p>
          <h2 className="m-0 text-[#0f172a]" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.035em' }}>{c.title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#1d1d1f]/65 md:text-[17px]">{c.body}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map(([title, text], i) => {
            const Icon = ICONS[i]
            return (
              <motion.div key={title} className="glass-card rounded-[28px] p-7"
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/80 text-[#1d1d1f] shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#1d1d1f]/65">{text}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
