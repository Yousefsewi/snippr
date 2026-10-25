"use client"

// Cookie window: "Only necessary", "Preferences", "Accept all".
// Honest to our policy: only necessary storage is in use. Analytics and marketing are
// listed but marked "not in use"; the choice is saved for if they're ever added.
import { useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { readConsent, saveConsent, OPEN_COOKIE_SETTINGS } from "@/lib/consent"

const COPY = {
  tr: {
    title: "Gizliliğiniz",
    body: "Snippr sadece sitenin çalışması için gerekli çerezleri ve tarayıcı depolamasını kullanır: oturumunu açık tutmak ve dil gibi ayarlarını hatırlamak için. Reklam ve takip çerezi kullanmıyoruz. Sadece gerekli çerezlere izin verebilir, hepsini kabul edebilir veya tercihlerini yönetebilirsin. Ayrıntılar:",
    policy: "Çerez Politikası",
    necessary: "Sadece gerekli", prefs: "Tercihler", all: "Hepsini kabul et",
    prefsTitle: "Çerez tercihleri", save: "Seçimi kaydet", back: "Geri",
    always: "Her zaman açık", notUsed: "Şu an kullanılmıyor",
    cats: [
      ["Gerekli", "Giriş yapmanı, oturumunu ve bu seçimini hatırlamak için. Bunlar olmadan site çalışmaz."],
      ["Analiz", "Sitenin nasıl kullanıldığını anlamak için. Şu an hiçbir analiz aracı kullanmıyoruz; eklersek önce bu seçime bakarız."],
      ["Pazarlama", "Reklam ve kişiselleştirme için. Snippr reklam çerezi kullanmıyor."],
    ] as [string, string][],
  },
  en: {
    title: "Your privacy",
    body: "Snippr only uses cookies and browser storage that the site needs to work: to keep you signed in and remember settings like your language. We don't use advertising or tracking cookies. You can allow only necessary cookies, accept all, or manage your preferences. Details in our",
    policy: "Cookie Policy",
    necessary: "Only necessary", prefs: "Preferences", all: "Accept all",
    prefsTitle: "Cookie preferences", save: "Save choice", back: "Back",
    always: "Always on", notUsed: "Not in use",
    cats: [
      ["Necessary", "Keep you signed in and remember this choice. The site can't work without them."],
      ["Analytics", "Help us understand how the site is used. We don't use any analytics tools today; if we add one, we'll respect this choice."],
      ["Marketing", "Ads and personalisation. Snippr doesn't use advertising cookies."],
    ] as [string, string][],
  },
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

function Switch({ on, disabled, onChange, label }: { on: boolean; disabled?: boolean; onChange?: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled}
      onClick={() => onChange?.(!on)}
      className="relative h-[31px] w-[51px] flex-shrink-0 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#0a84ff]/40 disabled:cursor-not-allowed"
      style={{ background: on ? "#34c759" : "#e9e9eb", opacity: disabled && !on ? 0.6 : 1 }}>
      <motion.span className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white"
        style={{ boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.16)" }}
        animate={{ left: on ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} />
    </button>
  )
}

export default function CookieConsent() {
  // Server snapshot says "already decided" so nothing renders until the browser has been checked
  const decided = useSyncExternalStore(subscribe, () => !!readConsent(), () => true)
  const [hidden, setHidden] = useState(false)
  const [reopened, setReopened] = useState(false)
  const [view, setView] = useState<"main" | "prefs">("main")
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  // the language picked in the dashboard wins, otherwise the browser language
  const lng = useSyncExternalStore(() => () => {}, () => {
    let saved: string | null = null
    try { saved = localStorage.getItem("snippr-lang") } catch { /* blocked */ }
    if (saved && /tr/.test(saved)) return "tr"
    if (saved && /en/.test(saved)) return "en"
    return (navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en"
  }, () => "en")
  const t: (typeof COPY)["en"] = COPY[lng as "tr" | "en"]

  // the privacy page can open this window again
  useEffect(() => {
    const open = () => {
      const c = readConsent()
      setAnalytics(!!c?.analytics); setMarketing(!!c?.marketing)
      setView("prefs"); setHidden(false); setReopened(true)
    }
    window.addEventListener(OPEN_COOKIE_SETTINGS, open)
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, open)
  }, [])

  const show = !hidden && (!decided || reopened)
  const done = (a: boolean, m: boolean) => { saveConsent(a, m); setHidden(true); setReopened(false); setView("main") }

  const pill = "rounded-full px-5 py-2.5 text-[14px] font-medium transition-all active:scale-[0.97]"
  const outline = `${pill} border border-[#d1d1d6] bg-white text-[#111] hover:bg-[#f5f5f7]`
  const solid = `${pill} bg-[#111] text-white hover:bg-black`

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="cookie" className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-end sm:p-6"
          style={{ colorScheme: "light", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* dim the page behind, like the system privacy sheet */}
          <div className="absolute inset-0 bg-black/30" aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-labelledby="cookie-title"
            className="relative w-full max-w-[620px] rounded-[28px] bg-white p-6 text-[#111] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:mb-[8vh] sm:p-7"
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }} layout>
            <AnimatePresence mode="wait" initial={false}>
              {view === "main" ? (
                <motion.div key="main" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                  <h2 id="cookie-title" className="text-[22px] font-bold tracking-[-0.01em]">{t.title}</h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#3a3a3c]">
                    {t.body}{" "}
                    <a href="/privacy#cookies" className="font-medium text-[#7c5cff] hover:underline">{t.policy}</a>.
                  </p>
                  <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button className={outline} onClick={() => done(false, false)}>{t.necessary}</button>
                    <button className={outline} onClick={() => setView("prefs")}>{t.prefs}</button>
                    <button className={solid} onClick={() => done(true, true)}>{t.all}</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="prefs" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if (reopened && decided) { setHidden(true); setReopened(false); setView("main") } else setView("main") }} aria-label={t.back}
                      className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-[#111] hover:bg-[#f2f2f7]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
                    </button>
                    <h2 id="cookie-title" className="text-[22px] font-bold tracking-[-0.01em]">{t.prefsTitle}</h2>
                  </div>
                  <div className="mt-4 divide-y divide-[#e5e5ea] overflow-hidden rounded-[18px] bg-[#f2f2f7]">
                    {t.cats.map(([name, desc], i) => {
                      const on = i === 0 ? true : i === 1 ? analytics : marketing
                      return (
                        <div key={name} className="flex items-center gap-4 px-4 py-3.5">
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                              {name}
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#6e6e73]">{i === 0 ? t.always : t.notUsed}</span>
                            </p>
                            <p className="mt-0.5 text-[13px] leading-snug text-[#6e6e73]">{desc}</p>
                          </div>
                          <Switch on={on} disabled={i === 0} label={name}
                            onChange={i === 1 ? setAnalytics : i === 2 ? setMarketing : undefined} />
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button className={outline} onClick={() => done(false, false)}>{t.necessary}</button>
                    <button className={solid} onClick={() => done(analytics, marketing)}>{t.save}</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
