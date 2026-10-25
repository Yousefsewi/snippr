'use client'

// Intro for the Automated messages page: an iPhone lock screen where Snippr's
// real client messages drop in one by one.

import { motion } from 'framer-motion'
import { CalendarCheck, CalendarPlus, Check, Heart, Scissors, Star } from 'lucide-react'

const COPY = {
  en: {
    included: 'Included in your plan', h1: 'Keep in touch with your clients and keep them informed',
    sub: 'Automated messages build loyalty and cut no-shows. Every email that goes out appears in your message history below.',
    b: ['Keep clients updated when you confirm or cancel, so nobody turns up at the wrong time', 'Thank clients after their visit and collect more Google reviews', 'Sent by email from Snippr — you don’t have to type a thing'],
    setup: 'Set it up now', history: 'Message history',
    date: 'Tuesday, 14 November',
    n: [['Snippr', 'New appointment', 'Haircut · Tomorrow 14:30'], ['Snippr', 'Appointment confirmed', 'See you tomorrow at 14:30'], ['Snippr', 'Thanks for visiting!', 'Tap here to leave a review'], ['Snippr', 'Thank you for the tip 💛', 'See you next time!']],
    float: ['Appointment confirmed', 'Thank you for booking'],
  },
  tr: {
    included: 'Planına dahildir', h1: 'Müşterilerinle iletişim kur ve onları bilgilendir',
    sub: 'Otomatik mesajlarla müşteri sadakatini artır, gelmeyen randevuları azalt. Gönderilen her e-posta aşağıdaki mesaj geçmişinde görünür.',
    b: ['Onayladığında ya da iptal ettiğinde müşterilerine haber ver, kimse yanlış saatte gelmesin', 'Ziyaretten sonra teşekkür et, daha çok Google yorumu topla', 'Snippr e-postayla gönderir — senin bir şey yazmana gerek yok'],
    setup: 'Hemen yapılandır', history: 'Mesaj geçmişi',
    date: '14 Kasım Salı',
    n: [['Snippr', 'Yeni randevu', 'Saç kesimi · Yarın 14:30'], ['Snippr', 'Randevun onaylandı', 'Yarın 14:30’da görüşmek üzere'], ['Snippr', 'Geldiğin için teşekkürler!', 'Yorum bırakmak için dokun'], ['Snippr', 'Bahşişin için teşekkürler 💛', 'Bir dahaki sefere görüşmek üzere!']],
    float: ['Randevu onaylandı', 'Rezervasyonun için teşekkürler'],
  },
}

const ICONS = [
  { Icon: CalendarPlus, bg: '#0a84ff' }, { Icon: CalendarCheck, bg: '#34c759' }, { Icon: Star, bg: '#ff9f0a' }, { Icon: Heart, bg: '#ff375f' },
]

export default function MessagesHero({ lang }: { lang: 'en' | 'tr' }) {
  const t = COPY[lang]
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#141416] px-7 py-10 text-white sm:px-10">
      <span aria-hidden className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full opacity-70 blur-3xl" style={{ background: 'radial-gradient(circle, #3b37d6, transparent 70%)' }} />
      <div className="relative grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-[12px] font-bold tracking-[0.08em] text-[#7be38f] uppercase">{t.included}</p>
          <h2 className="mt-3 text-[clamp(26px,3.6vw,36px)] leading-[1.12] font-bold tracking-[-0.02em]">{t.h1}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75">{t.sub}</p>
          <ul className="mt-5 space-y-2.5">
            {t.b.map(b => <li key={b} className="flex items-start gap-2.5 text-[14px] leading-snug text-white/85"><Check size={17} className="mt-0.5 flex-shrink-0 text-white/70" /> {b}</li>)}
          </ul>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a href="#settings" className="rounded-full bg-white px-5 py-2.5 text-[14.5px] font-semibold text-[#141416] hover:bg-white/90">{t.setup}</a>
            <a href="#history" className="rounded-full px-5 py-2.5 text-[14.5px] font-semibold text-white ring-1 ring-white/25 hover:bg-white/10">{t.history}</a>
          </div>
        </div>

        {/* iPhone lock screen */}
        <div className="relative mx-auto h-[430px] w-[230px]">
          <div className="absolute inset-0 overflow-hidden rounded-[40px] border-[6px] border-[#2c2c30] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
            style={{ background: 'radial-gradient(120% 80% at 70% 20%, #8e2de2 0%, #4a00e0 35%, #120a3a 70%, #07051a 100%)' }}>
            <div className="mx-auto mt-2 h-[18px] w-[72px] rounded-full bg-black" />
            <p className="mt-6 text-center text-[11px] font-medium text-white/80">{t.date}</p>
            <p className="text-center text-[54px] leading-none font-semibold tracking-tight text-white/95">9:41</p>
            <div className="mt-5 space-y-1.5 px-2.5">
              {t.n.map(([app, title, body], i) => {
                const { Icon, bg } = ICONS[i]
                return (
                  <motion.div key={title} initial={{ opacity: 0, y: -14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.55, type: 'spring', stiffness: 320, damping: 26 }}
                    className="flex items-center gap-2 rounded-[14px] bg-white/75 px-2 py-1.5 text-[#111] backdrop-blur-md">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[7px] text-white" style={{ background: bg }}><Icon size={13} strokeWidth={2.4} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-[9.5px] font-bold">{title}</p>
                        <p className="text-[8px] text-black/45">{app}</p>
                      </div>
                      <p className="truncate text-[8.5px] text-black/65">{body}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 text-white/80">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"><Scissors size={13} /></span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15"><CalendarCheck size={13} /></span>
            </div>
          </div>
          {/* floating card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
            transition={{ opacity: { delay: 2.8, duration: 0.4 }, x: { delay: 2.8, duration: 0.5 }, y: { delay: 3.3, duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute top-[150px] -left-24 hidden w-[180px] items-center gap-2.5 rounded-[14px] bg-white p-2.5 text-[#111] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] lg:flex">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] text-white" style={{ background: '#a855f7' }}><CalendarCheck size={16} /></span>
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-bold">{t.float[0]}</p>
              <p className="truncate text-[10px] text-black/55">{t.float[1]}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
