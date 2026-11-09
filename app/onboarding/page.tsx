'use client'

// "Set up your shop": a short question flow shown right after sign-up.
// Answers fill the real barber profile (name, address, hours, photo) and create the first services.

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, Camera, Check, Copy, MapPin, Plus, Scissors, Sparkles, Store, Car, Repeat, User, X,
  type LucideIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/site-url'
import { DEFAULT_HOURS, type Day, type Hours } from '@/lib/hours'
import { convertFromUSD, formatMoney, useCurrencyChoice, CURRENCIES } from '@/lib/currency'
import { writeStored } from '@/lib/use-stored'
import { SALON_STYLE_KEY } from '@/lib/glass'
import { AddressAutocomplete } from '@/components/address-autocomplete'
import LangCurrencyPicker from '@/components/lang-currency-picker'
import { markOnboarded } from '@/lib/onboarding'
import { isPlan } from '@/lib/plan'
import { useSiteLng } from '@/lib/use-site-lng'
import type { SiteLng } from '@/lib/site-lang'
import { TRIAL_DAYS } from '@/lib/legal'

type Lng = SiteLng
type Kind = 'barber' | 'salon' | 'solo'
type Where = 'shop' | 'mobile' | 'both'
type Svc = { id: string; name: string; duration: number; price: string; on: boolean }

const STEPS = ['name', 'kind', 'where', 'address', 'hours', 'services', 'photo'] as const
type Step = (typeof STEPS)[number] | 'done'

const DAY_ORDER: Day[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const T = {
  en: {
    setup: 'Account setup', later: 'Do it later', back: 'Back', next: 'Continue', skip: 'Skip for now', finish: 'Finish setup', saving: 'Saving…',
    name: { q: 'What’s your business called?', sub: 'This is the name clients see on your booking page.', ph: 'e.g. Yusuf’s Barbershop', link: 'Your booking link' },
    kind: { q: 'What kind of business is it?', sub: 'We’ll suggest services and a look that fit you.',
      opts: { barber: ['Barbershop', 'Cuts, fades and beards'], salon: ['Hair salon', 'Cuts, colour and styling'], solo: ['Independent barber', 'I work on my own, chair rental or freelance'] } },
    where: { q: 'Where do you serve your clients?', sub: 'You can change this later.',
      opts: { shop: ['At my shop', 'Clients come to me'], mobile: ['At the client’s place', 'I travel to them'], both: ['Both', 'In the shop and on the go'] } },
    address: { qShop: 'Where is your shop?', qMobile: 'Which area do you cover?', sub: 'Shown on your booking page so clients can find you.', label: 'Address', labelMobile: 'City or area', ph: 'Start typing your address', phMobile: 'e.g. Kadıköy, Istanbul' },
    hours: { q: 'When are you open?', sub: 'Clients can only book inside these hours. Fine-tune each day later.', days: 'Open days', from: 'From', to: 'To', short: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' } },
    services: { q: 'What do you offer?', sub: 'Pick your services and set a price. Clients choose from these when they book.', min: 'min', add: 'Add your own', custom: 'Service name', have: (n: number) => `You already have ${n} service${n === 1 ? '' : 's'}. Anything you pick here is added to them.` },
    photo: { q: 'Add a photo', sub: 'Your logo or a photo of you. Pages with a photo get more bookings.', pick: 'Choose photo', change: 'Change photo' },
    done: { title: 'Your shop is ready!', sub: `Your ${TRIAL_DAYS}-day free trial has started. Share your link and get your first booking.`, copy: 'Copy', copied: 'Copied', whatsapp: 'Share on WhatsApp', view: 'View my page', go: 'Go to dashboard', msg: 'Book your appointment with me here:' },
    errName: 'Please enter a name.', errDays: 'Pick at least one day.', errSave: 'Could not save. Please try again.',
  },
  tr: {
    setup: 'Hesap kurulumu', later: 'Sonra yap', back: 'Geri', next: 'Devam', skip: 'Şimdilik geç', finish: 'Kurulumu bitir', saving: 'Kaydediliyor…',
    name: { q: 'İşletmenin adı ne?', sub: 'Müşterilerin randevu sayfanda bu adı görecek.', ph: 'örn. Yusuf Berber', link: 'Randevu linkin' },
    kind: { q: 'Ne tür bir işletmesin?', sub: 'Sana uygun hizmetleri ve görünümü önereceğiz.',
      opts: { barber: ['Berber dükkânı', 'Kesim, fade ve sakal'], salon: ['Kuaför salonu', 'Kesim, boya ve şekillendirme'], solo: ['Bağımsız berber', 'Tek başıma, koltuk kiralayarak ya da serbest çalışıyorum'] } },
    where: { q: 'Müşterilerine nerede hizmet veriyorsun?', sub: 'Bunu daha sonra değiştirebilirsin.',
      opts: { shop: ['Dükkânımda', 'Müşteriler bana geliyor'], mobile: ['Müşterinin adresinde', 'Ben onlara gidiyorum'], both: ['İkisi de', 'Hem dükkânda hem adreste'] } },
    address: { qShop: 'Dükkânın nerede?', qMobile: 'Hangi bölgede hizmet veriyorsun?', sub: 'Müşterilerin seni bulabilsin diye randevu sayfanda görünür.', label: 'Adres', labelMobile: 'Şehir veya bölge', ph: 'Adresini yazmaya başla', phMobile: 'örn. Kadıköy, İstanbul' },
    hours: { q: 'Hangi gün ve saatlerde açıksın?', sub: 'Müşteriler sadece bu saatlerde randevu alabilir. Her günü sonra ayrı ayarlayabilirsin.', days: 'Açık günler', from: 'Açılış', to: 'Kapanış', short: { mon: 'Pzt', tue: 'Sal', wed: 'Çar', thu: 'Per', fri: 'Cum', sat: 'Cmt', sun: 'Paz' } },
    services: { q: 'Hangi hizmetleri veriyorsun?', sub: 'Hizmetlerini seç ve fiyat yaz. Müşteriler randevu alırken bunlardan seçecek.', min: 'dk', add: 'Kendi hizmetini ekle', custom: 'Hizmet adı', have: (n: number) => `Zaten ${n} hizmetin var. Burada seçtiklerin onlara eklenir.` },
    photo: { q: 'Bir fotoğraf ekle', sub: 'Logon ya da kendi fotoğrafın. Fotoğraflı sayfalar daha çok randevu alır.', pick: 'Fotoğraf seç', change: 'Fotoğrafı değiştir' },
    done: { title: 'İşletmen hazır!', sub: `${TRIAL_DAYS} günlük ücretsiz denemen başladı. Linkini paylaş, ilk randevunu al.`, copy: 'Kopyala', copied: 'Kopyalandı', whatsapp: 'WhatsApp’ta paylaş', view: 'Sayfamı gör', go: 'Panele git', msg: 'Randevunu buradan alabilirsin:' },
    errName: 'Lütfen bir ad yaz.', errDays: 'En az bir gün seç.', errSave: 'Kaydedilemedi. Lütfen tekrar dene.',
  },
  nl: {
    setup: 'Account instellen', later: 'Later doen', back: 'Terug', next: 'Doorgaan', skip: 'Nu overslaan', finish: 'Instellen afronden', saving: 'Opslaan…',
    name: { q: 'Hoe heet je zaak?', sub: 'Deze naam zien klanten op je boekingspagina.', ph: 'bijv. Kapsalon Yusuf', link: 'Je boekingslink' },
    kind: { q: 'Wat voor zaak is het?', sub: 'We stellen behandelingen en een stijl voor die bij je passen.',
      opts: { barber: ['Barbershop', 'Knippen, fades en baarden'], salon: ['Kapsalon', 'Knippen, kleuren en stylen'], solo: ['Zelfstandige kapper', 'Ik werk alleen, huur een stoel of werk als zzp’er'] } },
    where: { q: 'Waar help je je klanten?', sub: 'Je kunt dit later wijzigen.',
      opts: { shop: ['In mijn zaak', 'Klanten komen naar mij'], mobile: ['Bij de klant thuis', 'Ik ga naar hen toe'], both: ['Allebei', 'In de zaak en onderweg'] } },
    address: { qShop: 'Waar is je zaak?', qMobile: 'In welk gebied werk je?', sub: 'Staat op je boekingspagina zodat klanten je kunnen vinden.', label: 'Adres', labelMobile: 'Stad of gebied', ph: 'Begin je adres te typen', phMobile: 'bijv. Assen, Drenthe' },
    hours: { q: 'Wanneer ben je open?', sub: 'Klanten kunnen alleen binnen deze tijden boeken. Per dag fijnstellen kan later.', days: 'Open dagen', from: 'Van', to: 'Tot', short: { mon: 'ma', tue: 'di', wed: 'wo', thu: 'do', fri: 'vr', sat: 'za', sun: 'zo' } },
    services: { q: 'Wat bied je aan?', sub: 'Kies je behandelingen en vul een prijs in. Klanten kiezen hieruit als ze boeken.', min: 'min', add: 'Eigen behandeling toevoegen', custom: 'Naam behandeling', have: (n: number) => `Je hebt al ${n} behandeling${n === 1 ? '' : 'en'}. Wat je hier kiest, komt erbij.` },
    photo: { q: 'Voeg een foto toe', sub: 'Je logo of een foto van jezelf. Pagina’s met een foto krijgen meer afspraken.', pick: 'Foto kiezen', change: 'Foto wijzigen' },
    done: { title: 'Je zaak staat klaar!', sub: `Je proefperiode van ${TRIAL_DAYS} dagen is begonnen. Deel je link en krijg je eerste afspraak.`, copy: 'Kopiëren', copied: 'Gekopieerd', whatsapp: 'Delen via WhatsApp', view: 'Mijn pagina bekijken', go: 'Naar dashboard', msg: 'Boek hier je afspraak bij mij:' },
    errName: 'Vul een naam in.', errDays: 'Kies minstens één dag.', errSave: 'Opslaan is niet gelukt. Probeer het opnieuw.',
  },
  de: {
    setup: 'Konto einrichten', later: 'Später erledigen', back: 'Zurück', next: 'Weiter', skip: 'Jetzt überspringen', finish: 'Einrichtung abschließen', saving: 'Wird gespeichert…',
    name: { q: 'Wie heißt dein Laden?', sub: 'Diesen Namen sehen Kunden auf deiner Buchungsseite.', ph: 'z. B. Yusufs Barbershop', link: 'Dein Buchungslink' },
    kind: { q: 'Was für ein Laden ist es?', sub: 'Wir schlagen dir passende Leistungen und einen passenden Look vor.',
      opts: { barber: ['Barbershop', 'Schnitte, Fades und Bärte'], salon: ['Friseursalon', 'Schnitte, Farbe und Styling'], solo: ['Selbstständiger Barbier', 'Ich arbeite allein, miete einen Stuhl oder bin freiberuflich'] } },
    where: { q: 'Wo bedienst du deine Kunden?', sub: 'Du kannst das später ändern.',
      opts: { shop: ['In meinem Laden', 'Kunden kommen zu mir'], mobile: ['Beim Kunden', 'Ich fahre zu ihnen'], both: ['Beides', 'Im Laden und unterwegs'] } },
    address: { qShop: 'Wo ist dein Laden?', qMobile: 'Welches Gebiet deckst du ab?', sub: 'Steht auf deiner Buchungsseite, damit Kunden dich finden.', label: 'Adresse', labelMobile: 'Stadt oder Gebiet', ph: 'Fang an, deine Adresse zu tippen', phMobile: 'z. B. Kreuzberg, Berlin' },
    hours: { q: 'Wann hast du geöffnet?', sub: 'Kunden können nur in diesen Zeiten buchen. Jeden Tag kannst du später genauer einstellen.', days: 'Geöffnete Tage', from: 'Von', to: 'Bis', short: { mon: 'Mo', tue: 'Di', wed: 'Mi', thu: 'Do', fri: 'Fr', sat: 'Sa', sun: 'So' } },
    services: { q: 'Was bietest du an?', sub: 'Wähle deine Leistungen und trag einen Preis ein. Kunden wählen beim Buchen daraus.', min: 'Min.', add: 'Eigene Leistung hinzufügen', custom: 'Name der Leistung', have: (n: number) => `Du hast schon ${n} Leistung${n === 1 ? '' : 'en'}. Was du hier wählst, kommt dazu.` },
    photo: { q: 'Füge ein Foto hinzu', sub: 'Dein Logo oder ein Foto von dir. Seiten mit Foto bekommen mehr Buchungen.', pick: 'Foto wählen', change: 'Foto ändern' },
    done: { title: 'Dein Laden ist bereit!', sub: `Deine ${TRIAL_DAYS}-tägige Testphase hat begonnen. Teile deinen Link und hol dir deine erste Buchung.`, copy: 'Kopieren', copied: 'Kopiert', whatsapp: 'Über WhatsApp teilen', view: 'Meine Seite ansehen', go: 'Zum Dashboard', msg: 'Buch deinen Termin bei mir hier:' },
    errName: 'Bitte gib einen Namen ein.', errDays: 'Wähle mindestens einen Tag.', errSave: 'Speichern fehlgeschlagen. Bitte versuch es noch einmal.',
  },
  ar: {
    setup: 'إعداد الحساب', later: 'لاحقًا', back: 'رجوع', next: 'متابعة', skip: 'تخطَّ الآن', finish: 'إنهاء الإعداد', saving: 'جارٍ الحفظ…',
    name: { q: 'ما اسم محلك؟', sub: 'هذا الاسم يراه العملاء في صفحة الحجز.', ph: 'مثلًا: حلاقة يوسف', link: 'رابط الحجز' },
    kind: { q: 'ما نوع نشاطك؟', sub: 'سنقترح خدمات ومظهرًا يناسبانك.',
      opts: { barber: ['محل حلاقة', 'قص وتدريج ولحى'], salon: ['صالون شعر', 'قص وصبغ وتصفيف'], solo: ['حلاق مستقل', 'أعمل وحدي أو أستأجر كرسيًا أو أعمل لحسابي'] } },
    where: { q: 'أين تخدم عملاءك؟', sub: 'يمكنك تغيير ذلك لاحقًا.',
      opts: { shop: ['في محلي', 'العملاء يأتون إلي'], mobile: ['عند العميل', 'أذهب إليهم'], both: ['الاثنان', 'في المحل وخارجه'] } },
    address: { qShop: 'أين محلك؟', qMobile: 'ما المنطقة التي تغطيها؟', sub: 'يظهر في صفحة الحجز ليجدك العملاء.', label: 'العنوان', labelMobile: 'المدينة أو المنطقة', ph: 'ابدأ بكتابة عنوانك', phMobile: 'مثلًا: روتردام' },
    hours: { q: 'متى تكون مفتوحًا؟', sub: 'لا يمكن للعملاء الحجز إلا ضمن هذه الساعات. يمكنك ضبط كل يوم لاحقًا.', days: 'أيام العمل', from: 'من', to: 'إلى', short: { mon: 'إث', tue: 'ثل', wed: 'أر', thu: 'خم', fri: 'جم', sat: 'سب', sun: 'أح' } },
    services: { q: 'ماذا تقدم؟', sub: 'اختر خدماتك وحدد سعرًا. يختار العملاء منها عند الحجز.', min: 'د', add: 'أضف خدمتك الخاصة', custom: 'اسم الخدمة', have: (n: number) => `لديك ${n} خدمة بالفعل. ما تختاره هنا يُضاف إليها.` },
    photo: { q: 'أضف صورة', sub: 'شعارك أو صورتك. الصفحات التي فيها صورة تحصل على حجوزات أكثر.', pick: 'اختر صورة', change: 'غيّر الصورة' },
    done: { title: 'محلك جاهز!', sub: `بدأت تجربتك المجانية لمدة ${TRIAL_DAYS} يومًا. شارك رابطك واحصل على أول حجز.`, copy: 'نسخ', copied: 'تم النسخ', whatsapp: 'شارك عبر واتساب', view: 'اعرض صفحتي', go: 'إلى اللوحة', msg: 'احجز موعدك معي من هنا:' },
    errName: 'يرجى إدخال اسم.', errDays: 'اختر يومًا واحدًا على الأقل.', errSave: 'تعذر الحفظ. يرجى المحاولة مرة أخرى.',
  },
}

// starting services per business type (price in USD, converted to the chosen currency)
const PRESETS: Record<'barber' | 'salon', (Record<SiteLng, string> & { min: number; usd: number })[]> = {
  barber: [
    { en: 'Haircut', tr: 'Saç kesimi', nl: 'Knippen', de: 'Haarschnitt', ar: 'قص الشعر', min: 30, usd: 15 },
    { en: 'Beard trim', tr: 'Sakal tıraşı', nl: 'Baard trimmen', de: 'Bart trimmen', ar: 'تهذيب اللحية', min: 20, usd: 10 },
    { en: 'Haircut + beard', tr: 'Saç + sakal', nl: 'Knippen + baard', de: 'Haarschnitt + Bart', ar: 'قص الشعر + اللحية', min: 45, usd: 22 },
    { en: 'Kids haircut', tr: 'Çocuk saç kesimi', nl: 'Kinderknipbeurt', de: 'Kinderhaarschnitt', ar: 'قص شعر الأطفال', min: 25, usd: 12 },
    { en: 'Wash & style', tr: 'Yıkama ve fön', nl: 'Wassen en stylen', de: 'Waschen und Styling', ar: 'غسل وتصفيف', min: 20, usd: 10 },
    { en: 'Facial', tr: 'Cilt bakımı', nl: 'Gezichtsbehandeling', de: 'Gesichtsbehandlung', ar: 'عناية بالبشرة', min: 30, usd: 18 },
  ],
  salon: [
    { en: 'Haircut', tr: 'Saç kesimi', nl: 'Knippen', de: 'Haarschnitt', ar: 'قص الشعر', min: 45, usd: 25 },
    { en: 'Blow-dry', tr: 'Fön', nl: 'Föhnen', de: 'Föhnen', ar: 'تجفيف بالسشوار', min: 30, usd: 15 },
    { en: 'Colour', tr: 'Boya', nl: 'Kleuren', de: 'Färben', ar: 'صبغ', min: 90, usd: 55 },
    { en: 'Highlights', tr: 'Röfle', nl: 'Highlights', de: 'Strähnchen', ar: 'خصلات (هايلايت)', min: 120, usd: 75 },
    { en: 'Hair treatment', tr: 'Saç bakımı', nl: 'Haarbehandeling', de: 'Haarpflege', ar: 'علاج الشعر', min: 40, usd: 25 },
  ],
}

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"

function fileToDataUrl(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no canvas'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/* ── small pieces ── */

function Choice({ icon: Icon, title, sub, on, onClick }: { icon: LucideIcon; title: string; sub: string; on: boolean; onClick: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.985 }}
      className="flex w-full items-center gap-4 rounded-[18px] bg-white px-5 py-4 text-left transition-shadow"
      style={{ boxShadow: on ? '0 0 0 2px #1c1c1e' : '0 0 0 1px rgba(0,0,0,0.08)' }}>
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px]" style={{ background: on ? '#1c1c1e' : '#f2f2f7', color: on ? '#fff' : '#3a3a3c' }}>
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold text-[#1c1c1e]">{title}</span>
        <span className="mt-0.5 block text-[14px] text-[#6e6e73]">{sub}</span>
      </span>
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: on ? '#1c1c1e' : 'transparent', boxShadow: on ? 'none' : 'inset 0 0 0 1.5px #c7c7cc' }}>
        {on && <Check size={14} strokeWidth={3} color="#fff" />}
      </span>
    </motion.button>
  )
}

const field = 'w-full rounded-[14px] bg-white px-4 py-3.5 text-[16px] text-[#1c1c1e] outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-[#1c1c1e] placeholder:text-[#aeaeb2]'

/* ── page ── */

export default function OnboardingPage() {
  const router = useRouter()

  const lng: Lng = useSiteLng()
  const t = T[lng]
  const [cur] = useCurrencyChoice()
  const curSymbol = formatMoney(0, cur).replace(/[\d.,\s]/g, '') || (CURRENCIES.find(c => c.code === cur)?.symbol ?? '')

  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState('')
  const [barberId, setBarberId] = useState('')
  const [slug, setSlug] = useState('')
  const [existing, setExisting] = useState(0)

  const [step, setStep] = useState<Step>('name')
  const [dir, setDir] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const [name, setName] = useState('')
  const [kind, setKind] = useState<Kind | null>(null)
  const [where, setWhere] = useState<Where | null>(null)
  const [address, setAddress] = useState('')
  const [days, setDays] = useState<Day[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('19:00')
  const [services, setServices] = useState<Svc[]>([])
  const [photo, setPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // who is signing up
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      if (!user.user_metadata?.terms_accepted_at) { router.replace('/complete-signup'); return }
      if (!isPlan(user.user_metadata?.plan)) { router.replace('/choose-plan?next=/onboarding'); return }
      const { data: b } = await supabase.from('barbers').select('id, name, slug, address, photo_url').eq('user_id', user.id).single()
      if (!b) { router.replace('/dashboard'); return } // the dashboard creates the profile, then sends them back
      const { count } = await supabase.from('services').select('id', { count: 'exact', head: true }).eq('barber_id', b.id)
      if (!active) return
      setUserId(user.id); setBarberId(b.id); setSlug(b.slug ?? '')
      setName(b.name ?? ''); setAddress(b.address ?? ''); setPhoto(b.photo_url ?? null)
      setExisting(count ?? 0)
      setReady(true)
    })()
    return () => { active = false }
  }, [router])

  // fill the services list once the business type is known
  const fillServices = (k: Kind) => {
    const list = PRESETS[k === 'salon' ? 'salon' : 'barber']
    setServices(list.map((p, i) => ({ id: `p${i}`, name: p[lng], duration: p.min, price: String(convertFromUSD(p.usd, cur)), on: existing === 0 && i < 3 })))
  }

  const idx = step === 'done' ? STEPS.length : STEPS.indexOf(step)
  const go = (to: Step, d = 1) => { setError(''); setDir(d); setStep(to) }
  const next = () => go(STEPS[idx + 1] ?? 'done')
  const back = () => idx > 0 && go(STEPS[idx - 1], -1)

  const later = () => { if (userId) markOnboarded(userId); router.replace('/dashboard') }

  const onContinue = () => {
    if (step === 'name' && !name.trim()) return setError(t.errName)
    if (step === 'hours' && days.length === 0) return setError(t.errDays)
    if (step === 'kind' && kind && services.length === 0) fillServices(kind)
    if (step === 'photo') return finish()
    next()
  }

  async function finish() {
    setSaving(true); setError('')
    const hours: Hours = { ...DEFAULT_HOURS }
    for (const d of DAY_ORDER) hours[d] = { open: days.includes(d), start, end }
    const patch: Record<string, unknown> = { name: name.trim(), working_hours: hours }
    if (address.trim()) patch.address = address.trim()
    if (photo) patch.photo_url = photo
    const { error: bErr } = await supabase.from('barbers').update(patch).eq('id', barberId)
    if (bErr) { setSaving(false); setError(t.errSave); return }

    const rows = services
      .filter(s => s.on && s.name.trim())
      .map(s => ({ barber_id: barberId, name: s.name.trim(), duration_min: Math.max(5, s.duration || 30), price: Math.max(0, Number(s.price.replace(',', '.')) || 0) }))
    if (rows.length) {
      const { error: sErr } = await supabase.from('services').insert(rows)
      if (sErr) { setSaving(false); setError(t.errSave); return }
    }

    try {
      localStorage.setItem('snippr:hours', JSON.stringify(hours))
      if (kind) localStorage.setItem(SALON_STYLE_KEY, kind === 'salon' ? 'salon' : 'barber')
    } catch { /* storage blocked */ }
    markOnboarded(userId)
    setSaving(false)
    go('done')
  }

  const origin = SITE_URL
  const link = slug ? `${origin}/b/${slug}` : ''
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ }
  }

  const mobileOnly = where === 'mobile'
  const canContinue =
    step === 'kind' ? !!kind : step === 'where' ? !!where : true

  /* ── screens ── */
  const screens: Record<Exclude<Step, 'done'>, React.ReactNode> = {
    name: (
      <>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && onContinue()}
          placeholder={t.name.ph} maxLength={80} className={field} />
        {link && (
          <div className="mt-4 flex items-center gap-2 rounded-[14px] bg-[#e9e9ee] px-4 py-3 text-[14px] text-[#6e6e73]">
            <span className="font-medium">{t.name.link}:</span>
            <span className="truncate text-[#1c1c1e]">{link.replace(/^https?:\/\//, '')}</span>
          </div>
        )}
      </>
    ),
    kind: (
      <div className="flex flex-col gap-3">
        {([['barber', Scissors], ['salon', Sparkles], ['solo', User]] as [Kind, LucideIcon][]).map(([k, icon]) => (
          <Choice key={k} icon={icon} title={t.kind.opts[k][0]} sub={t.kind.opts[k][1]} on={kind === k}
            onClick={() => { setKind(k); fillServices(k) }} />
        ))}
      </div>
    ),
    where: (
      <div className="flex flex-col gap-3">
        {([['shop', Store], ['mobile', Car], ['both', Repeat]] as [Where, LucideIcon][]).map(([w, icon]) => (
          <Choice key={w} icon={icon} title={t.where.opts[w][0]} sub={t.where.opts[w][1]} on={where === w} onClick={() => setWhere(w)} />
        ))}
      </div>
    ),
    address: (
      <>
        <label className="mb-2 block text-[14px] font-semibold text-[#1c1c1e]">{mobileOnly ? t.address.labelMobile : t.address.label}</label>
        <AddressAutocomplete value={address} onChange={setAddress}
          placeholder={mobileOnly ? t.address.phMobile : t.address.ph}
          icon={<MapPin size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#8e8e93]" />}
          inputStyle={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px 14px 44px', borderRadius: 14, border: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)', background: '#fff', fontSize: 16, color: '#1c1c1e', outline: 'none', fontFamily: 'inherit' }} />
      </>
    ),
    hours: (
      <>
        <p className="mb-3 text-[14px] font-semibold text-[#1c1c1e]">{t.hours.days}</p>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAY_ORDER.map(d => {
            const on = days.includes(d)
            return (
              <motion.button key={d} type="button" whileTap={{ scale: 0.92 }}
                onClick={() => setDays(ds => (on ? ds.filter(x => x !== d) : [...ds, d]))}
                className="rounded-[12px] py-3 text-[13.5px] font-semibold transition-colors"
                style={{ background: on ? '#1c1c1e' : '#fff', color: on ? '#fff' : '#6e6e73', boxShadow: on ? 'none' : '0 0 0 1px rgba(0,0,0,0.1)' }}>
                {t.hours.short[d]}
              </motion.button>
            )
          })}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {([[t.hours.from, start, setStart], [t.hours.to, end, setEnd]] as [string, string, (v: string) => void][]).map(([lbl, v, set]) => (
            <label key={lbl} className="block">
              <span className="mb-2 block text-[14px] font-semibold text-[#1c1c1e]">{lbl}</span>
              <input type="time" value={v} onChange={e => set(e.target.value)} className={`${field} tabular-nums`} />
            </label>
          ))}
        </div>
      </>
    ),
    services: (
      <>
        {existing > 0 && <p className="mb-4 rounded-[14px] bg-[#e9e9ee] px-4 py-3 text-[14px] text-[#3a3a3c]">{t.services.have(existing)}</p>}
        <div className="overflow-hidden rounded-[18px] bg-white ring-1 ring-black/[0.08]">
          {services.map((s, i) => {
            const set = (p: Partial<Svc>) => setServices(list => list.map(x => (x.id === s.id ? { ...x, ...p } : x)))
            return (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? '0.5px solid rgba(0,0,0,0.1)' : 'none' }}>
                <button type="button" onClick={() => set({ on: !s.on })} aria-pressed={s.on}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors"
                  style={{ background: s.on ? '#1c1c1e' : 'transparent', boxShadow: s.on ? 'none' : 'inset 0 0 0 1.5px #c7c7cc' }}>
                  {s.on && <Check size={14} strokeWidth={3} color="#fff" />}
                </button>
                <input value={s.name} onChange={e => set({ name: e.target.value, on: true })} placeholder={t.services.custom} maxLength={60}
                  className="min-w-0 flex-1 bg-transparent text-[15.5px] font-medium text-[#1c1c1e] outline-none placeholder:text-[#aeaeb2]" />
                <span className="flex items-center gap-1 text-[14px] text-[#8e8e93]">
                  <input inputMode="numeric" value={s.duration || ''} onChange={e => set({ duration: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                    className="w-9 rounded-[8px] bg-[#f2f2f7] py-1 text-center text-[#1c1c1e] outline-none" />
                  {t.services.min}
                </span>
                <span className="flex items-center gap-1 rounded-[10px] bg-[#f2f2f7] px-2 py-1 text-[14px] text-[#8e8e93]">
                  {curSymbol}
                  <input inputMode="decimal" value={s.price} onChange={e => set({ price: e.target.value.replace(/[^\d.,]/g, '') })}
                    className="w-12 bg-transparent text-right text-[#1c1c1e] tabular-nums outline-none" />
                </span>
                {s.id.startsWith('c') && (
                  <button type="button" aria-label="Remove" onClick={() => setServices(list => list.filter(x => x.id !== s.id))} className="text-[#aeaeb2] hover:text-[#6e6e73]">
                    <X size={16} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <button type="button" onClick={() => setServices(list => [...list, { id: `c${Date.now()}`, name: '', duration: 30, price: '', on: true }])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-semibold text-[#0a84ff] hover:bg-[#0a84ff]/[0.08]">
          <Plus size={17} strokeWidth={2.4} /> {t.services.add}
        </button>
      </>
    ),
    photo: (
      <div className="flex flex-col items-center py-4">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/10 transition hover:ring-black/20">
          {photo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={photo} alt="" className="h-full w-full object-cover" />
            : <Camera size={34} strokeWidth={1.6} className="text-[#aeaeb2]" />}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="mt-4 rounded-full px-3 py-2 text-[15px] font-semibold text-[#0a84ff] hover:bg-[#0a84ff]/[0.08]">
          {photo ? t.photo.change : t.photo.pick}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden
          onChange={async e => { const f = e.target.files?.[0]; if (f) setPhoto(await fileToDataUrl(f, 400)) }} />
      </div>
    ),
  }

  const titles: Record<Exclude<Step, 'done'>, [string, string]> = {
    name: [t.name.q, t.name.sub],
    kind: [t.kind.q, t.kind.sub],
    where: [t.where.q, t.where.sub],
    address: [mobileOnly ? t.address.qMobile : t.address.qShop, t.address.sub],
    hours: [t.hours.q, t.hours.sub],
    services: [t.services.q, t.services.sub],
    photo: [t.photo.q, t.photo.sub],
  }
  const optional = step === 'address' || step === 'services' || step === 'photo'

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1c1c1e]" style={{ fontFamily: FONT, colorScheme: 'light' }}>
      {/* progress */}
      <div className="fixed inset-x-0 top-0 z-20 h-1 bg-black/[0.06]">
        <motion.div className="h-full bg-[#1c1c1e]" animate={{ width: `${(idx / STEPS.length) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 22 }} />
      </div>

      {/* top bar */}
      <header className="mx-auto flex max-w-[960px] items-center justify-between px-4 pt-6 sm:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Snippr" className="h-6 w-auto" />
        <div className="flex items-center gap-2">
          <LangCurrencyPicker lng={lng} setLng={l => writeStored('snippr-lang', l)} />
          {step !== 'done' && (
            <button onClick={later} className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#1c1c1e] ring-1 ring-black/[0.08] hover:bg-[#fafafa]">
              {t.later}
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[620px] px-4 pt-12 pb-32 sm:px-6 sm:pt-16">
        {!ready ? (
          <div className="flex justify-center pt-20">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-[#1c1c1e]" />
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {step === 'done' ? (
              <motion.section key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center pt-6 text-center">
                {/* glowing orb with a drawn check */}
                <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
                  className="relative flex h-28 w-28 items-center justify-center rounded-full"
                  style={{ background: 'radial-gradient(circle at 32% 28%, #ffb37a 0%, #ff5e8a 45%, #8b5cf6 100%)', boxShadow: '0 20px 60px -10px rgba(255,94,138,0.55), inset -8px -10px 20px rgba(0,0,0,0.18), inset 8px 8px 16px rgba(255,255,255,0.35)' }}>
                  <motion.span className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 0 2px rgba(255,94,138,0.35)' }}
                    initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }} />
                  </svg>
                </motion.div>
                <h1 className="mt-8 text-[34px] leading-tight font-semibold tracking-[-0.025em] sm:text-[40px]">{t.done.title}</h1>
                <p className="mt-3 max-w-[440px] text-[17px] text-[#6e6e73]">{t.done.sub}</p>

                {link && (
                  <div className="mt-8 w-full max-w-[460px] rounded-[20px] bg-white p-2 ring-1 ring-black/[0.08]">
                    <div className="flex items-center gap-2 pl-3">
                      <span className="min-w-0 flex-1 truncate text-left text-[15px] font-medium">{link.replace(/^https?:\/\//, '')}</span>
                      <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#f2f2f7] px-3.5 py-2.5 text-[14px] font-semibold hover:bg-[#e9e9ee]">
                        {copied ? <Check size={15} strokeWidth={2.6} /> : <Copy size={15} />} {copied ? t.done.copied : t.done.copy}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {link && (
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${t.done.msg} ${link}`)}`} target="_blank" rel="noopener noreferrer"
                      className="rounded-full bg-[#25d366] px-5 py-3 text-[15px] font-semibold text-white hover:brightness-95">{t.done.whatsapp}</a>
                  )}
                  {link && (
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      className="rounded-full bg-white px-5 py-3 text-[15px] font-semibold ring-1 ring-black/10 hover:bg-[#fafafa]">{t.done.view}</a>
                  )}
                </div>
                <button onClick={() => router.replace('/dashboard')}
                  className="mt-8 rounded-full bg-[#1c1c1e] px-9 py-3.5 text-[16px] font-semibold text-white hover:bg-black">{t.done.go}</button>
              </motion.section>
            ) : (
              <motion.section key={step} custom={dir}
                initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                <p className="text-[14px] font-medium text-[#8e8e93]">{t.setup} · {idx + 1}/{STEPS.length}</p>
                <h1 className="mt-2 text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[38px]" style={{ textWrap: 'balance' }}>{titles[step][0]}</h1>
                <p className="mt-3 mb-8 text-[16px] leading-relaxed text-[#6e6e73]">{titles[step][1]}</p>
                {screens[step]}
                {error && <p className="mt-4 text-[14px] font-medium text-[#ff3b30]">{error}</p>}
              </motion.section>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* bottom bar */}
      {ready && step !== 'done' && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-black/[0.06] bg-[#f5f5f7]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[620px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
            {idx > 0 ? (
              <button onClick={back} className="inline-flex items-center gap-1 rounded-full px-3 py-2.5 text-[15px] font-semibold text-[#1c1c1e] hover:bg-black/[0.05]">
                <ArrowLeft size={17} /> {t.back}
              </button>
            ) : <span />}
            <div className="flex items-center gap-2">
              {optional && step !== 'photo' && (
                <button onClick={() => { if (step === 'services') setServices(list => list.map(x => ({ ...x, on: false }))); next() }} className="rounded-full px-4 py-2.5 text-[15px] font-semibold text-[#6e6e73] hover:bg-black/[0.05]">{t.skip}</button>
              )}
              <button onClick={onContinue} disabled={!canContinue || saving}
                className="rounded-full bg-[#1c1c1e] px-7 py-3 text-[15px] font-semibold text-white transition disabled:opacity-35 hover:bg-black">
                {saving ? t.saving : step === 'photo' ? t.finish : t.next}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
