'use client'

// Privacy notice at sign-up (GDPR art. 13: tell people at the moment their data is
// collected who processes it, why, on what basis, with whom, for how long and their rights),
// plus the required "I accept the Terms" box. The checkbox id is read by app/register.
// Text follows app/privacy — keep the two in step. DRAFT: to be checked by a lawyer.

import { useSyncExternalStore } from 'react'

const COPY = {
  en: {
    accept: ['I have read and accept the ', 'Terms of Service', ' and the ', 'Data Processing Agreement', '.'],
    notice: ['We use your name, email, date of birth and shop details to create and run your account and booking page. More in our ', 'Privacy Policy', '.'],
    more: 'How we use your data',
    rows: [
      ['Who', 'Snippr (Netherlands) is responsible for your account data.'],
      ['What', 'Name, email, date of birth (to check you are 18+), password (stored only as a secure hash) and the shop details you add.'],
      ['Why', 'To create your account and booking page and send account emails. Basis: our contract with you (GDPR art. 6(1)(b)); the age check also rests on our legitimate interest.'],
      ['Shared with', 'Only the providers that run Snippr: Supabase (database, EU), Vercel (hosting) and Google (emails). We never sell your data or use it for ads.'],
      ['How long', 'Until you delete your account (Settings → Delete account).'],
      ['Your rights', 'Access, correct, export, delete, object — and complain to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).'],
    ],
  },
  tr: {
    accept: ['', 'Kullanım Şartları', '’nı ve ', 'Veri İşleme Sözleşmesi', '’ni okudum, kabul ediyorum.'],
    notice: ['Adını, e-postanı, doğum tarihini ve dükkân bilgilerini hesabını ve randevu sayfanı oluşturmak ve çalıştırmak için kullanırız. Ayrıntılar ', 'Gizlilik Politikası', '’nda.'],
    more: 'Verilerin nasıl kullanılır?',
    rows: [
      ['Kim', 'Hesap verilerinden Snippr (Hollanda) sorumludur.'],
      ['Ne', 'Ad, e-posta, doğum tarihi (18 yaşından büyük olduğunu kontrol için), şifre (sadece güvenli şifrelenmiş hali saklanır) ve eklediğin dükkân bilgileri.'],
      ['Neden', 'Hesabını ve randevu sayfanı oluşturmak, hesapla ilgili e-postalar göndermek. Hukuki dayanak: seninle yaptığımız sözleşme (GDPR md. 6(1)(b)); yaş kontrolü ayrıca meşru menfaatimize dayanır.'],
      ['Kimlerle', 'Sadece Snippr’ı çalıştıran hizmet sağlayıcılar: Supabase (veritabanı, AB), Vercel (barındırma) ve Google (e-posta). Verilerini asla satmayız, reklam için kullanmayız.'],
      ['Ne kadar', 'Hesabını silene kadar (Ayarlar → Hesabı sil).'],
      ['Hakların', 'Erişme, düzeltme, indirme, silme, itiraz — ve Hollanda Veri Koruma Kurumu’na (Autoriteit Persoonsgegevens) şikâyet.'],
    ],
  },
}

const a = 'font-medium text-[#111] underline underline-offset-2'

export default function SignupPrivacyNotice() {
  // page language: the one picked on the site, otherwise the browser language
  const lng = useSyncExternalStore(() => () => {}, () => {
    let saved: string | null = null
    try { saved = localStorage.getItem('snippr-lang') } catch { /* blocked */ }
    if (saved) return saved.includes('tr') ? 'tr' : 'en'
    return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en'
  }, () => 'en') as 'en' | 'tr'
  const c = COPY[lng]

  return (
    <div className="space-y-3 text-[12px] leading-snug text-[#6e6e73] 2xl:text-[13.5px]">
      <label htmlFor="Auth5-terms" className="flex cursor-pointer items-start gap-2.5 text-[#3a3a3c] select-none">
        <input id="Auth5-terms" type="checkbox" required className="peer sr-only" />
        <span className="mt-[1px] flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[6px] border border-[#c7c7cc] bg-white transition-colors peer-checked:border-[#111] peer-checked:bg-[#111] peer-focus-visible:ring-2 peer-focus-visible:ring-[#111]/30 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
        </span>
        <span>
          {c.accept[0]}<a href="/terms" target="_blank" rel="noopener noreferrer" className={a}>{c.accept[1]}</a>{c.accept[2]}
          <a href="/dpa" target="_blank" rel="noopener noreferrer" className={a}>{c.accept[3]}</a>{c.accept[4]}
        </span>
      </label>

      <p className="m-0">
        {c.notice[0]}<a href="/privacy" target="_blank" rel="noopener noreferrer" className={a}>{c.notice[1]}</a>{c.notice[2]}
      </p>

      <details className="group rounded-2xl border border-[#e5e5ea] bg-white/70 px-3.5 py-2.5">
        <summary className="cursor-pointer list-none font-medium text-[#3a3a3c] [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90"><path d="M9 6l6 6-6 6" /></svg>
            {c.more}
          </span>
        </summary>
        <dl className="mt-2.5 space-y-2">
          {c.rows.map(([k, v]) => (
            <div key={k}>
              <dt className="font-semibold text-[#3a3a3c]">{k}</dt>
              <dd className="m-0">{v}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  )
}
