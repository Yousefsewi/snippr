'use client'

// One announcement (lib/announcements.ts). Opening it marks it as read in this browser.
import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import { writeStored } from '@/lib/use-stored'
import NewsArticle from '@/components/news-article'
import { NEWS_READ_KEY, findAnnouncement, newsLang, parseRead } from '@/lib/announcements'

export default function NewsItemPage() {
  const { id } = useParams<{ id: string }>()
  const { lang } = useLang()
  const l = newsLang(lang)
  const a = findAnnouncement(id)

  useEffect(() => {
    if (!a) return
    let raw: string | null = null
    try { raw = localStorage.getItem(NEWS_READ_KEY) } catch { /* blocked */ }
    const read = parseRead(raw)
    if (!read.includes(a.id)) writeStored(NEWS_READ_KEY, JSON.stringify([...read, a.id]))
  }, [a])

  if (!a) return (
    <div className="mx-auto max-w-[720px] py-16 text-center text-[#6e6e73]">
      <p className="text-[17px] font-semibold text-[#1d1d1f]">{l === 'tr' ? 'Bu duyuru bulunamadı.' : l === 'nl' ? 'Deze aankondiging is niet gevonden.' : 'This announcement was not found.'}</p>
      <Link href="/dashboard/news" className="mt-4 inline-block font-semibold text-[#1d1d1f] underline">{l === 'tr' ? 'Tüm duyurular' : l === 'nl' ? 'Alle aankondigingen' : 'All announcements'}</Link>
    </div>
  )
  return <NewsArticle a={a} l={l} />
}
