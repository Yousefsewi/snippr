// News and announcements for barbers, shown in the dashboard's notification panel.
// Each one opens its own page (/dashboard/news/<id>) with a cover, video, photos and text.
//
// To publish one: add it to the TOP of ANNOUNCEMENTS and deploy. Put its photos and videos in
// public/news/ (e.g. public/news/2026-12-sms/cover.jpg → src: '/news/2026-12-sms/cover.jpg').
// Texts: Turkish (tr) is required; English, Dutch, German and Arabic are shown when present
// (a missing language falls back to English, then Turkish).
// Whether a barber has read it is kept in their own browser (localStorage).

export type NewsLang = 'tr' | 'en' | 'nl' | 'de' | 'ar'
export type Txt = { tr: string; en?: string; nl?: string; de?: string; ar?: string }

export type NewsBlock =
  | { type: 'p'; text: Txt }
  | { type: 'h'; text: Txt }
  | { type: 'image'; src: string; alt: Txt; caption?: Txt }
  /** a video file from public/news/... (mp4) */
  | { type: 'video'; src: string; poster?: string; caption?: Txt }
  /** a YouTube video (only loads after a click: components/youtube-click-to-load.tsx) */
  | { type: 'youtube'; id: string; caption?: Txt }

export interface Announcement {
  id: string            // used in the address: /dashboard/news/<id> (letters, numbers, dashes)
  date: string          // YYYY-MM-DD
  title: Txt
  summary: Txt          // one or two sentences, shown in the notification panel
  cover?: string        // image shown in the panel and at the top of the page
  blocks: NewsBlock[]   // the page body, top to bottom
  cta?: { label: Txt; href: string } // optional button at the end
}

/** Live announcements, newest first. Empty for now. */
export const ANNOUNCEMENTS: Announcement[] = []

/** A sample that is never listed or notified: open /dashboard/news/ornek to see the layout. */
export const EXAMPLE: Announcement = {
  id: 'ornek',
  date: '2026-11-09',
  title: { tr: 'Örnek duyuru: duyuru sayfaları böyle görünür', en: 'Sample announcement: this is how news pages look', nl: 'Voorbeeld: zo zien nieuwspagina’s eruit' },
  summary: {
    tr: 'Bu sayfa sadece örnek. Gerçek duyurular bildirimlerde görünür ve tıklanınca bu düzende açılır.',
    en: 'This page is only a sample. Real announcements appear in the notifications and open in this layout.',
    nl: 'Deze pagina is alleen een voorbeeld. Echte aankondigingen verschijnen bij de meldingen en openen in deze opmaak.',
  },
  cover: '/demo/barbershop-cover.webp',
  blocks: [
    { type: 'p', text: { tr: 'Her duyurunun en üstünde bir kapak fotoğrafı, başlık ve kısa bir özet olur. Altında istediğimiz kadar paragraf, ara başlık, fotoğraf ve video sıralanır.', en: 'Every announcement starts with a cover photo, a title and a short summary. Below that come as many paragraphs, subheadings, photos and videos as we like.', nl: 'Elke aankondiging begint met een omslagfoto, een titel en een korte samenvatting. Daaronder volgen zoveel alinea’s, tussenkoppen, foto’s en video’s als we willen.' } },
    { type: 'h', text: { tr: 'Ara başlık', en: 'A subheading', nl: 'Een tussenkop' } },
    { type: 'p', text: { tr: 'Mesela yeni bir özellik çıktığında ne işe yaradığını, nasıl açılacağını ve berbere ne kazandıracağını burada anlatırız.', en: 'For example, when a new feature ships we explain here what it does, how to turn it on and what it brings the barber.', nl: 'Als er bijvoorbeeld een nieuwe functie is, leggen we hier uit wat die doet, hoe je hem aanzet en wat hij de kapper oplevert.' } },
    { type: 'image', src: '/hero-clouds.webp', alt: { tr: 'Örnek fotoğraf', en: 'Sample photo', nl: 'Voorbeeldfoto' }, caption: { tr: 'Fotoğrafların altına kısa bir açıklama yazılabilir.', en: 'Photos can have a short caption.', nl: 'Foto’s kunnen een kort bijschrift hebben.' } },
    { type: 'p', text: { tr: 'Videolar da aynı şekilde sayfanın içinde oynatılır: kendi video dosyamız ya da bir YouTube videosu olabilir.', en: 'Videos play inside the page the same way: our own video file or a YouTube video.', nl: 'Video’s spelen op dezelfde manier in de pagina: een eigen videobestand of een YouTube-video.' } },
  ],
  cta: { label: { tr: 'Panele dön', en: 'Back to the dashboard', nl: 'Terug naar het dashboard' }, href: '/dashboard' },
}

export const findAnnouncement = (id: string) => ANNOUNCEMENTS.find(a => a.id === id) ?? (id === EXAMPLE.id ? EXAMPLE : undefined)
export const newsLang = (lang: string): NewsLang => (['tr', 'nl', 'de', 'ar'].includes(lang) ? (lang as NewsLang) : 'en')
export const txt = (t: Txt | undefined, l: NewsLang) => (t ? t[l] ?? t.en ?? t.tr : '')

/** read ids, kept in this browser */
export const NEWS_READ_KEY = 'snippr:news-read'
export const parseRead = (raw: string | null): string[] => { try { const v = JSON.parse(raw ?? '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }

export const newsDate = (iso: string, l: NewsLang) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString({ tr: 'tr-TR', nl: 'nl-NL', en: 'en-GB', de: 'de-DE', ar: 'ar-u-nu-latn' }[l], { day: 'numeric', month: 'long', year: 'numeric' })
