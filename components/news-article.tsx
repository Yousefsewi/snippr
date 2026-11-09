'use client'

// One announcement page: cover, title, date, summary, then paragraphs, photos and videos.
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import YoutubeClickToLoad from '@/components/youtube-click-to-load'
import { type Announcement, type NewsLang, newsDate, txt } from '@/lib/announcements'

const BACK: Record<NewsLang, string> = { tr: 'Tüm duyurular', en: 'All announcements', nl: 'Alle aankondigingen' }

export default function NewsArticle({ a, l }: { a: Announcement; l: NewsLang }) {
  return (
    <article className="mx-auto w-full max-w-[720px] pb-20 text-[#1d1d1f]">
      <Link href="/dashboard/news" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#6e6e73] hover:text-[#1d1d1f]">
        <ArrowLeft size={16} /> {BACK[l]}
      </Link>

      <p className="mt-6 text-[13.5px] text-[#8e8e93]">{newsDate(a.date, l)}</p>
      <h1 className="mt-2 text-[30px] leading-[1.15] font-bold tracking-[-0.025em] sm:text-[38px]" style={{ textWrap: 'balance' }}>{txt(a.title, l)}</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-[#3a3a3c]">{txt(a.summary, l)}</p>

      {a.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.cover} alt="" className="mt-8 aspect-[16/9] w-full rounded-[14px] object-cover" />
      )}

      <div className="mt-8 flex flex-col gap-5">
        {a.blocks.map((b, i) => {
          if (b.type === 'p') return <p key={i} className="text-[16.5px] leading-[1.7] text-[#3a3a3c]">{txt(b.text, l)}</p>
          if (b.type === 'h') return <h2 key={i} className="mt-4 text-[22px] font-semibold tracking-[-0.02em]">{txt(b.text, l)}</h2>
          const caption = 'caption' in b && b.caption ? <figcaption className="mt-2 text-[13.5px] text-[#8e8e93]">{txt(b.caption, l)}</figcaption> : null
          if (b.type === 'image') return (
            <figure key={i} className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.src} alt={txt(b.alt, l)} className="w-full rounded-[12px]" />
              {caption}
            </figure>
          )
          if (b.type === 'video') return (
            <figure key={i} className="m-0">
              <video src={b.src} poster={b.poster} controls playsInline preload="metadata" className="w-full rounded-[12px] bg-black" />
              {caption}
            </figure>
          )
          return (
            <figure key={i} className="m-0">
              <div className="aspect-video w-full overflow-hidden rounded-[12px]"><YoutubeClickToLoad id={b.id} lang={l} /></div>
              {caption}
            </figure>
          )
        })}
      </div>

      {a.cta && (
        <Link href={a.cta.href} className="mt-10 inline-flex h-11 items-center rounded-[10px] bg-[#1d1d1f] px-5 text-[15px] font-semibold text-white hover:bg-black">
          {txt(a.cta.label, l)}
        </Link>
      )}
    </article>
  )
}
