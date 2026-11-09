'use client'

// Dashboard → Announcements: every piece of news, newest first (lib/announcements.ts).
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { useStored } from '@/lib/use-stored'
import { ANNOUNCEMENTS, NEWS_READ_KEY, newsDate, newsLang, parseRead, txt } from '@/lib/announcements'

const T = {
  tr: { title: 'Duyurular', sub: 'Yeni özellikler ve Snippr’dan haberler.', empty: 'Henüz duyuru yok', emptySub: 'Yeni özellikler ve haberler çıktığında burada ve bildirimlerinde görünecek.', unread: 'Yeni' },
  en: { title: 'Announcements', sub: 'New features and news from Snippr.', empty: 'No announcements yet', emptySub: 'New features and news will show up here and in your notifications.', unread: 'New' },
  nl: { title: 'Aankondigingen', sub: 'Nieuwe functies en nieuws van Snippr.', empty: 'Nog geen aankondigingen', emptySub: 'Nieuwe functies en nieuws verschijnen hier en bij je meldingen.', unread: 'Nieuw' },
}

export default function NewsPage() {
  const { lang } = useLang()
  const l = newsLang(lang)
  const t = T[l]
  const read = parseRead(useStored(NEWS_READ_KEY))

  return (
    <div className="mx-auto w-full max-w-[860px] pb-16 text-[#1d1d1f]">
      <h1 className="text-[30px] font-bold tracking-[-0.02em]">{t.title}</h1>
      <p className="mt-1 text-[15px] text-[#787774]">{t.sub}</p>

      {ANNOUNCEMENTS.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-[14px] border border-[#ececea] bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#ececea] bg-[#f7f7f5] text-[#787774]"><Bell size={22} strokeWidth={1.75} /></span>
          <p className="mt-4 text-[17px] font-semibold">{t.empty}</p>
          <p className="mt-1 max-w-[360px] text-[14.5px] text-[#787774]">{t.emptySub}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ANNOUNCEMENTS.map(a => (
            <Link key={a.id} href={`/dashboard/news/${a.id}`} className="group flex flex-col overflow-hidden rounded-[14px] border border-[#ececea] bg-white transition hover:border-[#d4d4d2]">
              {a.cover
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={a.cover} alt="" className="aspect-[16/9] w-full object-cover" />
                : <div className="aspect-[16/9] w-full bg-[#f7f7f5]" />}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-[12.5px] text-[#8e8e93]">
                  {newsDate(a.date, l)}
                  {!read.includes(a.id) && <span className="rounded-full bg-[#1d1d1f] px-2 py-0.5 text-[11px] font-semibold text-white">{t.unread}</span>}
                </div>
                <p className="mt-2 text-[17px] leading-snug font-semibold group-hover:underline">{txt(a.title, l)}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#6e6e73]">{txt(a.summary, l)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
