'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang, LANGS, Lang } from '@/lib/i18n'
import { TIMEZONES, TZ_REGIONS, gmtOffset, tzCity, detectTimezone, TZ_KEY } from '@/lib/timezones'
import { useStored, useClientValue, writeStored } from '@/lib/use-stored'
import { CURRENCIES, useCurrency } from '@/lib/currency'
import { supabase } from '@/lib/supabase'
import { FIRST_VISIT_DISCOUNT } from '@/lib/features'
import { glass, SALON_STYLES, SALON_STYLE_KEY, getSalonStyle } from '@/lib/glass'

const text = 'text-[#37352f]'
const muted = 'text-[#9b9a97]'
const border = 'border-[#e9e9e7]'

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: on ? '#37352f' : '#e3e2e0', position: 'relative', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 19 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { t, lang, setLang, isRTL } = useLang()
  const { currency, setCurrency } = useCurrency()
  const [curOpen, setCurOpen] = useState(false)
  const currentCur = CURRENCIES.find(c => c.code === currency)
  // Account deletion (two steps: click, then type DELETE)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const [tzOpen, setTzOpen] = useState(false)
  const savedTz = useStored(TZ_KEY)
  const detectedTz = useClientValue(detectTimezone, '')
  const tz = savedTz || detectedTz
  const servicesOn = useStored('snippr:services') !== 'off'

  const salonStyle = getSalonStyle(useStored(SALON_STYLE_KEY))
  // The signed-in barber's own email (never a hardcoded one)
  const [email, setEmail] = useState('')
  // First-visit discount (% off a customer's first appointment; on for everyone, 5–50%)
  const [discount, setDiscount] = useState<number | null>(null)
  const [discountSaved, setDiscountSaved] = useState(false)
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setEmail(user?.email ?? '')
      if (!user) return
      const { data } = await supabase.from('barbers').select('first_visit_discount').eq('user_id', user.id).maybeSingle()
      if (data && typeof data.first_visit_discount === 'number') setDiscount(data.first_visit_discount)
    })
  }, [])

  const chooseDiscount = async (value: number) => {
    setDiscount(value)
    setDiscountSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('barbers').update({ first_visit_discount: value }).eq('user_id', user.id)
    if (!error) { setDiscountSaved(true); setTimeout(() => setDiscountSaved(false), 2000) }
  }

  const toggleServices = () => writeStored('snippr:services', servicesOn ? 'off' : 'on')

  const chooseTz = (value: string) => { writeStored(TZ_KEY, value); setTzOpen(false) }
  const isAutoDetected = tz && tz === detectTimezone()

  const deleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      })
      if (!res.ok) {
        setDeleteError((await res.json().catch(() => ({}))).error || 'Could not delete the account.')
        setDeleting(false)
        return
      }
    } catch {
      setDeleteError('Could not reach the server. Please try again.')
      setDeleting(false)
      return
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  const current = LANGS.find(l => l.code === lang)!


  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col gap-8" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div>
        <button
          onClick={() => router.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '7px 14px', borderRadius: 999, border: '1px solid #e9e9e7', background: '#fff', color: '#37352f', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f7f7f5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#37352f' }}>{t.setTitle}</h1>
        <p style={{ marginTop: 6, fontSize: 14, color: '#787774', margin: 0 }}>{t.setSub}</p>
      </div>

      {/* Account */}
      <section>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 12px', padding: '0 4px', color: '#9b9a97' }}>{t.account}</p>
        <div className={`rounded-2xl border ${border} bg-[#ffffff] divide-y divide-[#e9e9e7]`}>
          <div className="flex items-center justify-between px-4 py-3">
            <span style={{ fontSize: 14, color: '#37352f' }}>{t.email}</span>
            <span className={`text-sm ${muted}`}>{email || '…'}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span style={{ fontSize: 14, color: '#37352f' }}>{t.workspaceField}</span>
            <span className={`text-sm ${muted}`}>Snippr</span>
          </div>

          {/* Language selector */}
          <div className="relative flex items-center justify-between px-4 py-3">
            <span style={{ fontSize: 14, color: '#37352f' }}>{t.language}</span>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`flex items-center gap-2 rounded-md border ${border} bg-[#ffffff] px-3 py-1.5 text-sm ${text} transition hover:bg-[#f7f7f5]`}
            >
              <span>{current.flag}</span>
              <span>{current.label}</span>
              <span className={`text-[10px] ${muted} transition-transform ${langOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {langOpen && (
              <div className={`absolute z-10 top-full mt-1 ${isRTL ? 'left-4' : 'right-4'} w-44 overflow-hidden rounded-2xl border ${border} bg-[#ffffff] shadow-lg`}>
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as Lang); setLangOpen(false) }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-[#f7f7f5] ${l.code === lang ? text : muted}`}
                  >
                    <span>{l.flag}</span>
                    <span className="flex-1 text-left">{l.label}</span>
                    {l.code === lang && <span className="text-[#1c3829]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-between px-4 py-3">
            <span style={{ fontSize: 14, color: '#37352f' }}>{t.timezone}</span>
            <button
              onClick={() => setTzOpen(!tzOpen)}
              className={`flex items-center gap-2 rounded-md border ${border} bg-[#ffffff] px-3 py-1.5 text-sm ${text} transition hover:bg-[#f7f7f5]`}
            >
              <span>{tz ? tzCity(tz) : '—'}</span>
              {tz && <span className={`text-xs ${muted}`}>{gmtOffset(tz)}</span>}
              {isAutoDetected && <span className="rounded bg-[#dbeddb] px-1.5 py-0.5 text-[10px] font-medium text-[#1c3829]">auto</span>}
              <span className={`text-[10px] ${muted} transition-transform ${tzOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {tzOpen && (
              <div className={`absolute z-10 top-full mt-1 ${isRTL ? 'left-4' : 'right-4'} max-h-72 w-60 overflow-y-auto rounded-2xl border ${border} bg-[#ffffff] shadow-lg`}>
                {TZ_REGIONS.map(region => (
                  <div key={region}>
                    <p className={`sticky top-0 bg-[#fbfbfa] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${muted}`}>{region}</p>
                    {TIMEZONES.filter(z => z.region === region).map(z => (
                      <button
                        key={z.value}
                        onClick={() => chooseTz(z.value)}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition hover:bg-[#f7f7f5] ${z.value === tz ? text : muted}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={z.value === tz ? text : 'text-[#37352f]'}>{z.city}</span>
                          <span className="text-xs text-[#9b9a97]">{gmtOffset(z.value)}</span>
                        </span>
                        {z.value === tz && <span className="text-[#1c3829]">✓</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Currency */}
          <div className="relative flex items-center justify-between px-4 py-3">
            <span style={{ fontSize: 14, color: '#37352f' }}>{t.currency}</span>
            <button
              onClick={() => setCurOpen(!curOpen)}
              className={`flex items-center gap-2 rounded-md border ${border} bg-[#ffffff] px-3 py-1.5 text-sm ${text} transition hover:bg-[#f7f7f5]`}
            >
              <span>{currentCur ? `${currentCur.symbol} ${currentCur.code}` : currency}</span>
              <span className={`text-[10px] ${muted} transition-transform ${curOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {curOpen && (
              <div className={`absolute z-10 top-full mt-1 ${isRTL ? 'left-4' : 'right-4'} max-h-72 w-60 overflow-y-auto rounded-2xl border ${border} bg-[#ffffff] shadow-lg`}>
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setCurOpen(false) }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-[#f7f7f5] ${c.code === currency ? text : muted}`}
                  >
                    <span className="w-7 text-[#37352f]">{c.symbol}</span>
                    <span className="flex-1 text-left text-[#37352f]">{c.label}</span>
                    <span className="text-xs text-[#9b9a97]">{c.code}</span>
                    {c.code === currency && <span className="text-[#1c3829]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Salon style */}
      <section>
        <p className={`mb-3 px-1 text-xs font-medium ${muted}`}>Salon style</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {SALON_STYLES.map(s => {
            const selected = s.key === salonStyle.key
            return (
              <button
                key={s.key}
                onClick={() => writeStored(SALON_STYLE_KEY, s.key)}
                style={{
                  textAlign: 'left', padding: 0, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit',
                  background: '#ffffff',
                  border: selected ? `2px solid ${s.accent}` : '2px solid #e9e9e7',
                  boxShadow: selected ? '0 6px 18px rgba(30,30,60,0.12)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                {/* preview: the wash with two glass tiles on it */}
                <div style={{ background: s.pageWash, height: 92, padding: 14, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ ...glass(true), width: 64, height: 40, borderRadius: 12 }} />
                  <div style={{ ...glass(), width: 64, height: 40, borderRadius: 12 }} />
                  <div style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: 7, background: s.accent }} />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#37352f', margin: 0 }}>{s.label}</p>
                    <p className={`text-xs ${muted}`} style={{ margin: 0 }}>{s.sub}</p>
                  </div>
                  {selected && <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: s.accent, borderRadius: 999, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</span>}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* First-visit discount (hidden until first-visit-discount.sql has been run) */}
      {FIRST_VISIT_DISCOUNT && discount !== null && (
        <section>
          <p className={`mb-3 px-1 text-xs font-medium ${muted}`}>First-visit discount</p>
          <div className={`rounded-2xl border ${border} bg-[#ffffff] px-4 py-3.5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div style={{ maxWidth: 420 }}>
                <p style={{ fontSize: 14, color: '#37352f' }}>🎁 New customers get {discount}% off their first appointment</p>
                <p className={`text-xs ${muted}`}>
                  Shown on your booking page and applied automatically. Only once per customer (checked by phone number or email); a cancelled booking doesn&apos;t count. You give the discount in your shop when they pay.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select value={discount} onChange={e => chooseDiscount(Number(e.target.value))}
                  className={`rounded-md border ${border} bg-[#ffffff] px-3 py-1.5 text-sm ${text}`}>
                  {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(v => <option key={v} value={v}>{v}%</option>)}
                </select>
                {discountSaved && <span className="text-xs text-[#1c3829]">Saved ✓</span>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section>
        <p className={`mb-3 px-1 text-xs font-medium ${muted}`}>Features</p>
        <div className={`rounded-2xl border ${border} bg-[#ffffff] divide-y divide-[#e9e9e7]`}>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p style={{ fontSize: 14, color: '#37352f' }}>Services</p>
              <p className={`text-xs ${muted}`}>Show the Services section in the sidebar</p>
            </div>
            <Toggle on={servicesOn} onClick={toggleServices} />
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <p className={`mb-3 px-1 text-xs font-medium ${muted}`}>{t.dangerZone}</p>
        <div className="rounded-2xl border border-[#f5d0ca] bg-[#fffafa] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#5d1715]">{t.deleteAccount}</p>
              <p className="text-xs text-[#9b9a97]">{t.deleteAccountSub}</p>
            </div>
            {!confirmingDelete && (
              <button onClick={() => { setConfirmingDelete(true); setDeleteError('') }}
                className="rounded-md bg-[#ffe2dd] border border-[#f5d0ca] px-3 py-1.5 text-xs font-medium text-[#5d1715] transition hover:brightness-95">
                {t.deleteBtn}
              </button>
            )}
          </div>

          {/* Second step: type DELETE so it can't happen by accident */}
          {confirmingDelete && (
            <div className="mt-4 flex flex-col gap-2 border-t border-[#f5d0ca] pt-4">
              <p className="text-xs text-[#5d1715]">
                This permanently deletes your account, booking page, services and all appointments. It can&apos;t be undone.
                Type <strong>DELETE</strong> to confirm.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <input value={deleteText} onChange={e => setDeleteText(e.target.value)} placeholder="DELETE" autoFocus
                  className="rounded-md border border-[#f5d0ca] bg-white px-3 py-1.5 text-sm text-[#37352f] outline-none focus:border-[#eb5757]" />
                <button onClick={deleteAccount} disabled={deleteText !== 'DELETE' || deleting}
                  className="rounded-md bg-[#eb5757] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40">
                  {deleting ? 'Deleting…' : 'Delete my account forever'}
                </button>
                <button onClick={() => { setConfirmingDelete(false); setDeleteText('') }} disabled={deleting}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${muted} hover:text-[#37352f]`}>
                  Cancel
                </button>
              </div>
              {deleteError && <p className="text-xs font-medium text-[#eb5757]">{deleteError}</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
