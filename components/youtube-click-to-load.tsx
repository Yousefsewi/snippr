'use client'

import { useState, useSyncExternalStore } from 'react'
import { CONSENT_CHANGED, hasConsent } from '@/lib/consent'

// A YouTube video that looks like it does on YouTube.
// - Visitor accepted all cookies (marketing): the real YouTube player loads right away.
// - Otherwise: the video's own thumbnail with YouTube's red play button; one tap plays it.
//   Until then only the thumbnail picture comes from YouTube, no player and no cookies.
// The player always uses youtube-nocookie.com (allowed in the CSP frame-src).

const subscribe = (cb: () => void) => {
  window.addEventListener(CONSENT_CHANGED, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(CONSENT_CHANGED, cb); window.removeEventListener('storage', cb) }
}

export default function YoutubeClickToLoad({ id, title, lang }: { id: string; title?: string; lang?: string }) {
  const allowed = useSyncExternalStore(subscribe, () => hasConsent('marketing'), () => false)
  const [clicked, setClicked] = useState(false)
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)
  const play = ({ tr: 'Videoyu oynat', nl: 'Video afspelen', ar: 'تشغيل الفيديو', de: 'Video abspielen' } as Record<string, string>)[lang ?? ''] ?? 'Play video'

  if (allowed || clicked) {
    return (
      <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1${clicked ? '&autoplay=1' : ''}`} title={title || 'YouTube'} width="100%" height="100%"
        style={{ border: 'none', display: 'block', background: '#000' }} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
    )
  }
  return (
    <button type="button" onClick={() => setClicked(true)} aria-label={`${play}${title ? `: ${title}` : ''}`}
      style={{ position: 'relative', width: '100%', height: '100%', border: 'none', padding: 0, cursor: 'pointer', display: 'block', background: '#000', overflow: 'hidden' }}>
      {/* the video's own thumbnail; falls back to the smaller one if there's no HD version */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb} alt="" loading="lazy" referrerPolicy="no-referrer"
        onLoad={e => { if ((e.currentTarget as HTMLImageElement).naturalWidth <= 120) setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`) }}
        onError={() => setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* title bar like YouTube's, only when there is a title */}
      {title && title !== 'Video' && (
        <span style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 14px 28px', textAlign: 'left', color: '#fff', fontSize: 15, fontWeight: 600, background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
      )}
      {/* YouTube's red play button */}
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 68, height: 48, display: 'block' }}>
        <svg viewBox="0 0 68 48" width="68" height="48" aria-hidden>
          <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00" />
          <path d="M45 24 27 14v20" fill="#fff" />
        </svg>
      </span>
    </button>
  )
}
