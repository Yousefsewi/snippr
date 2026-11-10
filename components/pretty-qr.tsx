'use client'

// A good-looking QR code: round dots, round "eyes" in three corners and the Snippr S logo in the
// middle, on a white tile with rounded corners. It is a plain SVG (no images), so it can be turned
// into a PNG for printing. High error correction keeps it scannable with the logo in the centre.
import { forwardRef, useMemo } from 'react'
import QRCodeImpl from 'qr.js/lib/QRCode'
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel'

const toBinary = (s: string) => Array.from(new TextEncoder().encode(s)).map(b => String.fromCharCode(b)).join('')

type Props = { value: string; size?: number; color?: string; background?: string; logo?: boolean }

const PrettyQR = forwardRef<SVGSVGElement, Props>(function PrettyQR({ value, size = 160, color = '#111111', background = '#ffffff', logo = true }, ref) {
  const { n, cells } = useMemo(() => {
    const qr = new QRCodeImpl(-1, ErrorCorrectLevel.H)
    qr.addData(toBinary(value), 'Byte')
    qr.make()
    return { n: qr.modules.length, cells: qr.modules }
  }, [value])

  const pad = 3                    // quiet zone, in modules
  const total = n + pad * 2
  const finder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
  const hole = logo ? Math.round(n * 0.25) | 1 : 0   // odd number of modules, centred
  const h0 = Math.floor((n - hole) / 2)
  const inHole = (r: number, c: number) => logo && r >= h0 && r < h0 + hole && c >= h0 && c < h0 + hole

  const dots: string[] = []
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!cells[r][c] || finder(r, c) || inHole(r, c)) continue
    dots.push(`M${c + pad + 0.5} ${r + pad + 0.06}a.44 .44 0 1 1 0 .88a.44 .44 0 1 1 0-.88`)
  }
  const eye = (r: number, c: number) => {
    const cx = c + pad + 3.5, cy = r + pad + 3.5
    return (
      <g key={`${r}-${c}`}>
        <circle cx={cx} cy={cy} r={3} fill="none" stroke={color} strokeWidth={1} />
        <circle cx={cx} cy={cy} r={1.5} fill={color} />
      </g>
    )
  }
  const mid = pad + h0 + hole / 2

  return (
    <svg ref={ref} viewBox={`0 0 ${total} ${total}`} width={size} height={size} role="img" aria-label="QR code" style={{ display: 'block' }}>
      <rect width={total} height={total} rx={total * 0.16} fill={background} />
      <path d={dots.join('')} fill={color} />
      {eye(0, 0)}{eye(0, n - 7)}{eye(n - 7, 0)}
      {logo && (
        // the Snippr S with its two dots, scaled into the clear centre
        <g transform={`translate(${mid} ${mid}) scale(${(hole * 0.86) / 170}) translate(-101 -103)`}>
          <path d="M128 56 C112 40 72 40 68 66 C64 92 134 96 132 132 C130 164 86 168 70 152" stroke={color} strokeWidth={28} strokeLinecap="round" fill="none" />
          <circle cx={166} cy={58} r={14} fill={color} />
          <circle cx={36} cy={136} r={14} fill={color} />
        </g>
      )}
    </svg>
  )
})

export default PrettyQR
