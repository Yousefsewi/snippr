'use client'

// Appearance: accent colour, text size, reduce motion and sidebar icons for the dashboard,
// with a live preview. Saved on this device (lib/appearance.ts). Text size is applied by the
// dashboard layout (zoom on the page), so the preview here grows with it.

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Check, Home, ListChecks, Plus, Receipt } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { ACCENTS, AccentName, DEFAULT_APPEARANCE, TEXT_SIZES, saveAppearance, useAppearance, AppearancePrefs } from '@/lib/appearance'

const T = {
  en: {
    back: 'Settings', title: 'Appearance', sub: 'Choose how your dashboard looks on this device.', reset: 'Reset', saved: 'Saved',
    preview: 'Preview — tick an appointment to try it.',
    accent: 'Accent colour', accentSub: 'Used for the selected menu item, buttons and highlights.',
    size: 'Text size', sizeSub: 'Makes everything in the dashboard bigger or smaller.', sample: 'Ali booked a haircut for Saturday at 14:30.',
    access: 'Accessibility', motion: 'Reduce motion', motionSub: 'Turns off sliding and bouncing animations.',
    icons: 'Show sidebar icons', iconsSub: 'Show an icon next to each menu item.',
    nav: ['Overview', 'Calendar', 'Appointments', 'Sales'], today: 'Today', newAppt: 'New',
    list: [['Ali', 'Haircut', '10:00'], ['Mehmet', 'Beard trim', '11:30'], ['Sam', 'Fade', '14:30'], ['Yusuf', 'Hair + beard', '16:00']],
    done: (a: number, b: number) => `${a} of ${b} done`,
  },
  tr: {
    back: 'Ayarlar', title: 'Görünüm', sub: 'Panelinin bu cihazda nasıl görüneceğini seç.', reset: 'Sıfırla', saved: 'Kaydedildi',
    preview: 'Önizleme — denemek için bir randevuyu işaretle.',
    accent: 'Vurgu rengi', accentSub: 'Seçili menü, butonlar ve öne çıkan yerlerde kullanılır.',
    size: 'Yazı boyutu', sizeSub: 'Paneldeki her şeyi büyütür ya da küçültür.', sample: 'Ali, Cumartesi 14:30 için saç kesimi randevusu aldı.',
    access: 'Erişilebilirlik', motion: 'Hareketleri azalt', motionSub: 'Kayan ve zıplayan animasyonları kapatır.',
    icons: 'Menü simgelerini göster', iconsSub: 'Her menü öğesinin yanında simge göster.',
    nav: ['Genel bakış', 'Takvim', 'Randevular', 'Satışlar'], today: 'Bugün', newAppt: 'Yeni',
    list: [['Ali', 'Saç kesimi', '10:00'], ['Mehmet', 'Sakal düzeltme', '11:30'], ['Sam', 'Fade', '14:30'], ['Yusuf', 'Saç + sakal', '16:00']],
    done: (a: number, b: number) => `${b} randevudan ${a} tamamlandı`,
  },
}

const NAV_ICONS = [Home, Calendar, ListChecks, Receipt]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className="relative h-6 w-10 flex-shrink-0 rounded-full transition-colors" style={{ background: on ? 'var(--ui-accent)' : '#d4d4d2' }}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left]" style={{ left: on ? 18 : 2 }} />
    </button>
  )
}

function Section({ title, sub, aside, children }: { title: string; sub?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[#37352f]">{title}</h2>
          {sub && <div className="text-[13.5px] text-[#787774]">{sub}</div>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

function Preview({ prefs, t }: { prefs: AppearancePrefs; t: typeof T.en }) {
  const [done, setDone] = useState<boolean[]>([true, false, false, false])
  const accent = ACCENTS[prefs.accent].color
  const count = done.filter(Boolean).length
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#e9e9e7] bg-white" style={{ fontSize: 13 }}>
      <div className="flex">
        {/* mini sidebar */}
        <div className="hidden w-[11em] flex-shrink-0 flex-col gap-[0.2em] border-r border-[#e9e9e7] bg-[#f7f7f5] p-[0.6em] sm:flex">
          {t.nav.map((label, i) => {
            const Icon = NAV_ICONS[i]
            const active = i === 2
            return (
              <span key={label} className="flex items-center gap-[0.55em] rounded-[0.6em] px-[0.6em] py-[0.45em]"
                style={{ background: active ? `color-mix(in srgb, ${accent} 12%, white)` : 'transparent', color: active ? accent : '#5f5e5b', fontWeight: active ? 600 : 500, transition: prefs.reduceMotion ? 'none' : 'background .3s, color .3s' }}>
                {prefs.sidebarIcons && <Icon size="1.1em" strokeWidth={1.75} />}
                {label}
              </span>
            )
          })}
        </div>
        {/* mini page */}
        <div className="min-w-0 flex-1 p-[0.9em]">
          <div className="flex items-center gap-[0.6em]">
            <span className="text-[1.15em] font-semibold text-[#37352f]">{t.today}</span>
            <span className="text-[0.85em] text-[#9b9a97]">{t.done(count, done.length)}</span>
            <span className="ml-auto inline-flex items-center gap-[0.3em] rounded-[0.6em] px-[0.7em] py-[0.35em] text-[0.85em] font-medium text-white" style={{ background: accent, transition: prefs.reduceMotion ? 'none' : 'background .3s' }}>
              <Plus size="1em" />{t.newAppt}
            </span>
          </div>
          <div className="mt-[0.6em] h-[0.3em] overflow-hidden rounded-full bg-[#f1f1ef]">
            <div className="h-full rounded-full" style={{ width: `${(count / done.length) * 100}%`, background: accent, transition: prefs.reduceMotion ? 'none' : 'width .35s, background .3s' }} />
          </div>
          <div className="mt-[0.4em]">
            {t.list.map(([name, svc, time], i) => (
              <div key={name} className="flex items-center gap-[0.7em] border-b border-[#f1f1ef] py-[0.55em] last:border-0">
                <button type="button" aria-label={name} onClick={() => setDone(d => d.map((v, k) => (k === i ? !v : v)))}
                  className="flex h-[1.15em] w-[1.15em] flex-shrink-0 items-center justify-center rounded-[0.3em] border text-white"
                  style={{ background: done[i] ? accent : '#fff', borderColor: done[i] ? accent : '#d4d4d2' }}>
                  {done[i] && <Check size="0.8em" strokeWidth={3.2} />}
                </button>
                <span className={`min-w-0 flex-1 truncate ${done[i] ? 'text-[#9b9a97] line-through' : 'text-[#37352f]'}`}>{name} · {svc}</span>
                <span className="text-[0.85em] tabular-nums text-[#787774]">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppearancePage() {
  const { lang } = useLang()
  const t = T[lang === 'tr' ? 'tr' : 'en']
  const prefs = useAppearance()
  const [savedAt, setSavedAt] = useState(0)
  const update = (patch: Partial<AppearancePrefs>) => { saveAppearance({ ...prefs, ...patch }); setSavedAt(Date.now()) }
  const isDefault = JSON.stringify(prefs) === JSON.stringify(DEFAULT_APPEARANCE)
  const sizeIndex = Math.max(0, TEXT_SIZES.indexOf(prefs.textSize))
  const lng = lang === 'tr' ? 'tr' : 'en'

  return (
    <div>
      <Link href="/dashboard/settings" className="inline-flex items-center gap-1.5 text-[13.5px] text-[#787774] hover:text-[#37352f]">
        <ArrowLeft size={15} /> {t.back}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#37352f]">{t.title}</h1>
          <div className="mt-1 text-[14px] text-[#787774]">{t.sub}</div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          {savedAt > 0 && <span key={savedAt} className="flex items-center gap-1 text-[12.5px] text-[#787774]"><Check size={13} />{t.saved}</span>}
          <button type="button" disabled={isDefault} onClick={() => update(DEFAULT_APPEARANCE)}
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[#37352f] hover:bg-[#f1f1ef] disabled:opacity-40">{t.reset}</button>
        </div>
      </div>

      <div className="mt-7 rounded-[18px] border border-[#e9e9e7] bg-[#fbfbfa] p-2">
        <Preview prefs={prefs} t={t} />
        <div className="px-1.5 pt-2 pb-0.5 text-[12px] text-[#9b9a97]">{t.preview}</div>
      </div>

      <Section title={t.accent} sub={t.accentSub} aside={<span className="text-[13.5px] text-[#787774]">{ACCENTS[prefs.accent][lng]}</span>}>
        <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label={t.accent}>
          {(Object.keys(ACCENTS) as AccentName[]).map(name => {
            const on = prefs.accent === name
            return (
              <button key={name} type="button" role="radio" aria-checked={on} aria-label={ACCENTS[name][lng]} onClick={() => update({ accent: name })}
                className="relative flex h-9 w-9 items-center justify-center rounded-full">
                <span className="absolute inset-0 rounded-full border-2" style={{ borderColor: on ? '#37352f' : 'transparent' }} />
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-white" style={{ background: ACCENTS[name].color }}>
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title={t.size} sub={t.sizeSub}>
        <div className="mt-3 rounded-[14px] border border-[#e9e9e7] bg-white px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span aria-hidden className="w-3 text-center text-[12px] text-[#9b9a97]">A</span>
            <input type="range" min={0} max={TEXT_SIZES.length - 1} step={1} value={sizeIndex} aria-label={t.size}
              onChange={e => update({ textSize: TEXT_SIZES[Number(e.target.value)] ?? 100 })}
              className="h-1.5 flex-1 cursor-pointer" style={{ accentColor: 'var(--ui-accent)' }} />
            <span aria-hidden className="w-3 text-center text-[17px] text-[#9b9a97]">A</span>
            <span className="w-10 text-right font-mono text-[12px] tabular-nums text-[#787774]">{prefs.textSize}%</span>
          </div>
          <div className="mt-3 truncate rounded-[10px] bg-[#f7f7f5] px-3 py-2 text-[#37352f]" style={{ fontSize: 14 }}>{t.sample}</div>
        </div>
      </Section>

      <Section title={t.access}>
        <div className="mt-3 divide-y divide-[#f1f1ef] rounded-[14px] border border-[#e9e9e7] bg-white">
          <div className="flex items-center gap-4 px-4 py-3.5">
            <div className="min-w-0 flex-1"><div className="text-[14px] font-medium text-[#37352f]">{t.motion}</div><div className="text-[12.5px] text-[#787774]">{t.motionSub}</div></div>
            <Toggle on={prefs.reduceMotion} onChange={v => update({ reduceMotion: v })} />
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5">
            <div className="min-w-0 flex-1"><div className="text-[14px] font-medium text-[#37352f]">{t.icons}</div><div className="text-[12.5px] text-[#787774]">{t.iconsSub}</div></div>
            <Toggle on={prefs.sidebarIcons} onChange={v => update({ sidebarIcons: v })} />
          </div>
        </div>
      </Section>
    </div>
  )
}
