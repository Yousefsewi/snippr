'use client'

import { useState } from 'react'

// YouTube video that only loads after the visitor clicks. Until then nothing is requested
// from YouTube (not even the thumbnail), so no IP address goes to Google without a choice.
export default function YoutubeClickToLoad({ id, title, lang }: { id: string; title?: string; lang?: string }) {
  const [on, setOn] = useState(false)
  const tr = lang === 'tr', nl = lang === 'nl', ar = lang === 'ar'
  const play = tr ? 'Videoyu oynat' : nl ? 'Video afspelen' : ar ? 'تشغيل الفيديو' : 'Play video'
  const note = tr ? 'Video YouTube’dan yüklenir.' : nl ? 'De video wordt geladen vanaf YouTube.' : ar ? 'يتم تحميل الفيديو من يوتيوب.' : 'The video loads from YouTube.'

  if (on) {
    return (
      <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={title || 'YouTube'} width="100%" height="100%"
        style={{ border: 'none', display: 'block' }} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
    )
  }
  return (
    <button type="button" onClick={() => setOn(true)} aria-label={`${play}${title ? `: ${title}` : ''}`}
      style={{ width: '100%', height: '100%', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#fff', padding: 16,
        background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 60%), linear-gradient(160deg, #2b2b30, #111114)' }}>
      <span style={{ width: 58, height: 58, borderRadius: 999, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#111"><path d="M8 5.5v13l11-6.5z" /></svg>
      </span>
      {title && <span style={{ fontSize: 14, fontWeight: 600, maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>}
      <span style={{ fontSize: 11.5, opacity: 0.7 }}>{note}</span>
    </button>
  )
}
