'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Seconds for one full loop (default 30) */
  duration?: number
  /** Pause the scroll while hovering (default true) */
  pauseOnHover?: boolean
}

export function Marquee({
  children,
  className,
  duration = 30,
  pauseOnHover = true,
  ...props
}: MarqueeProps) {
  return (
    <div className={cn('marquee-root group relative flex w-full overflow-hidden', className)} {...props}>
      <div className="marquee-track flex w-max shrink-0 items-center" style={{ animationDuration: `${duration}s` }}>
        {children}
        {children}
      </div>

      <style>{`
        .marquee-track {
          animation-name: marquee-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        ${pauseOnHover ? '.marquee-root:hover .marquee-track { animation-play-state: paused; }' : ''}
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

export default Marquee
