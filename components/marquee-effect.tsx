'use client'

interface MarqueeEffectProps {
  children: React.ReactNode
  gap?: number
  speed?: number
  speedOnHover?: number
  reverse?: boolean
  className?: string
}

export function MarqueeEffect({
  children,
  gap = 24,
  speed = 30,
  speedOnHover,
  reverse = false,
  className = '',
}: MarqueeEffectProps) {
  // Duration is derived from `speed` only to preserve relative pacing between
  // instances (higher speed = shorter loop) — the actual travel distance is
  // handled purely in CSS (translateX(-50%) on a track duplicated 2x), so
  // there's no JS width measurement to race against layout/hydration.
  const duration = 600 / Math.max(speed, 1)
  const hoverDuration = speedOnHover ? 600 / Math.max(speedOnHover, 1) : undefined

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex w-max snippr-marquee-track"
        style={{
          gap,
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
          ['--marquee-hover-duration' as string]: hoverDuration ? `${hoverDuration}s` : `${duration}s`,
        } as React.CSSProperties}
      >
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">
          {children}
        </div>
      </div>

      <style jsx>{`
        .snippr-marquee-track {
          animation-name: snippr-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .snippr-marquee-track:hover {
          animation-duration: var(--marquee-hover-duration);
        }
        @keyframes snippr-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

export default MarqueeEffect
