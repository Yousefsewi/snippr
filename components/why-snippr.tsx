'use client'

import { motion } from 'framer-motion'

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

const mono = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } as const
const serif = { fontFamily: 'var(--font-noto-serif), Georgia, serif' } as const

// Same look as the rest of the homepage: big serif heading and short text on the left
// (like the feature explorer), a plain numbered list with thin lines on the right — no boxes.
export default function WhySnippr({ lng }: { lng: Lng }) {
  const c = COPY[lng] ?? COPY.en
  return (
    <section id="why" className="px-5 py-20 md:px-10 lg:py-28" style={{ background: 'transparent' }}>
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-[12.5px] uppercase tracking-[0.12em] text-[#1d1d1f]" style={mono}>{c.eyebrow}</p>
          <h2 className="mt-6 text-[44px] leading-[1.02] tracking-[-0.03em] text-[#1d1d1f] md:text-[60px]" style={{ ...serif, fontWeight: 400 }}>{c.title}</h2>
          <p className="mt-6 max-w-[480px] text-[16.5px] leading-[1.6] text-[#3b4048] md:text-[18px]">{c.body}</p>
        </div>

        <ol className="m-0 list-none border-t border-[#1d1d1f]/10 p-0">
          {c.items.map(([title, text], i) => (
            <motion.li key={title} className="grid grid-cols-[56px_1fr] gap-x-4 border-b border-[#1d1d1f]/10 py-7 md:grid-cols-[80px_1fr]"
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}>
              <span className="text-[13px] text-[#1d1d1f]/45" style={mono}>0{i + 1}</span>
              <div>
                <h3 className="text-[13.5px] uppercase tracking-[0.08em] text-[#1d1d1f]" style={mono}>{title}</h3>
                <p className="mt-2.5 max-w-[560px] text-[16px] leading-[1.6] text-[#4b5563]">{text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
