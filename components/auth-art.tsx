// Playful 3D-style artwork for the login card: glossy spheres, glass bubbles,
// a striped ball, a gem and a fluffy purple character, all drawn in SVG.
// Shapes float gently; motion stops for people who prefer reduced motion.

const PETALS = 22

function Sphere({ id, cx, cy, r, light, base, dark }: { id: string; cx: number; cy: number; r: number; light: string; base: string; dark: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={light} />
          <stop offset="45%" stopColor={base} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.42} rx={r * 0.28} ry={r * 0.16} fill="#fff" opacity="0.55" transform={`rotate(-30 ${cx - r * 0.35} ${cy - r * 0.42})`} filter="url(#soft)" />
    </g>
  )
}

function Bubble({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="url(#glass)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
      <path d={`M ${cx - r * 0.62} ${cy - r * 0.2} A ${r * 0.7} ${r * 0.7} 0 0 1 ${cx - r * 0.1} ${cy - r * 0.66}`} stroke="#fff" strokeWidth={r * 0.09} strokeLinecap="round" fill="none" opacity="0.9" />
      <circle cx={cx + r * 0.42} cy={cy + r * 0.45} r={r * 0.07} fill="#fff" opacity="0.7" />
    </g>
  )
}

export function AuthArt() {
  const petals = Array.from({ length: PETALS }, (_, i) => (360 / PETALS) * i)
  return (
    <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <style>{`
        .fl1 { animation: fl 7s ease-in-out infinite; }
        .fl2 { animation: fl 9s ease-in-out -3s infinite; }
        .fl3 { animation: fl 8s ease-in-out -5s infinite; }
        .spin { animation: sp 40s linear infinite; transform-origin: 300px 300px; transform-box: view-box; }
        .bob { animation: bob 5s ease-in-out infinite; }
        @keyframes fl { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes sp { to { transform: rotate(360deg) } }
        @media (prefers-reduced-motion: reduce) { .fl1, .fl2, .fl3, .spin, .bob { animation: none } }
      `}</style>
      <defs>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#3b2a8a" floodOpacity="0.28" /></filter>
        <radialGradient id="glass" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="80%" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#dfe6ff" stopOpacity="0.55" />
        </radialGradient>
        <pattern id="stripes" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
          <rect width="44" height="44" fill="#f7f1e3" />
          <rect width="22" height="44" fill="#e9b52c" />
        </pattern>
        <radialGradient id="shade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#5a3d00" stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6caff" />
          <stop offset="55%" stopColor="#9b82ff" />
          <stop offset="100%" stopColor="#6a4cf0" />
        </linearGradient>
        <radialGradient id="core" cx="45%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#c9bbff" />
          <stop offset="70%" stopColor="#8d72ff" />
          <stop offset="100%" stopColor="#6a4cf0" />
        </radialGradient>
        <linearGradient id="gemA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7d8bff" /><stop offset="100%" stopColor="#3442d8" /></linearGradient>
        <linearGradient id="gemB" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4f5cf0" /><stop offset="100%" stopColor="#2a35b8" /></linearGradient>
        <radialGradient id="butter" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fff2a8" />
          <stop offset="45%" stopColor="#ffd23f" />
          <stop offset="100%" stopColor="#e09a00" />
        </radialGradient>
        <clipPath id="ball"><circle cx="95" cy="110" r="125" /></clipPath>
      </defs>

      {/* back layer */}
      <g className="fl2">
        <g clipPath="url(#ball)"><rect x="-40" y="-20" width="280" height="270" fill="url(#stripes)" /></g>
        <circle cx="95" cy="110" r="125" fill="url(#shade)" />
      </g>
      <g className="fl1"><Sphere id="s-blue" cx={520} cy={95} r={135} light="#c3cdff" base="#6f7dff" dark="#3a44c9" /></g>
      <g className="fl3"><Sphere id="s-silver" cx={8} cy={330} r={72} light="#ffffff" base="#c9cbd6" dark="#8d90a3" /></g>
      <g className="fl2"><Sphere id="s-purple" cx={575} cy={335} r={92} light="#e2c9ff" base="#a46bff" dark="#6a2fd6" /></g>
      <g className="fl3"><Sphere id="s-blue2" cx={70} cy={500} r={58} light="#bcc6ff" base="#6170ff" dark="#3340c4" /></g>
      <g className="fl1"><Bubble cx={250} cy={52} r={44} /></g>
      <g className="fl3"><Bubble cx={92} cy={360} r={34} /></g>

      {/* fluffy character */}
      <g className="bob" filter="url(#shadow)">
        <g className="spin">
          {petals.map((a) => (
            <ellipse key={a} cx="300" cy="196" rx="30" ry="62" fill="url(#petal)" transform={`rotate(${a} 300 300)`} />
          ))}
          {petals.map((a) => (
            <ellipse key={`i${a}`} cx="300" cy="226" rx="24" ry="44" fill="url(#petal)" transform={`rotate(${a + 360 / PETALS / 2} 300 300)`} />
          ))}
        </g>
        <circle cx="300" cy="300" r="92" fill="url(#core)" />
        <ellipse cx="300" cy="262" rx="46" ry="22" fill="#fff" opacity="0.18" filter="url(#soft)" />
        {/* face */}
        <ellipse cx="270" cy="292" rx="13" ry="18" fill="#0d0d12" />
        <ellipse cx="330" cy="292" rx="13" ry="18" fill="#0d0d12" />
        <circle cx="266" cy="285" r="4" fill="#fff" />
        <circle cx="326" cy="285" r="4" fill="#fff" />
        <ellipse cx="300" cy="320" rx="6" ry="4" fill="#0d0d12" />
      </g>

      {/* front layer */}
      <g className="fl1">
        <path d="M128 470 C 168 440, 236 452, 252 492 C 268 534, 246 590, 200 600 L 132 600 C 104 580, 96 500, 128 470 Z" fill="url(#butter)" />
        <ellipse cx="170" cy="488" rx="26" ry="12" fill="#fff" opacity="0.5" filter="url(#soft)" />
      </g>
      <g className="fl2">
        <polygon points="420,520 482,500 520,560 470,612 404,590" fill="url(#gemA)" />
        <polygon points="420,520 482,500 462,548" fill="#9aa5ff" opacity="0.9" />
        <polygon points="462,548 520,560 470,612" fill="url(#gemB)" />
      </g>
      <g className="fl3"><Bubble cx={560} cy={520} r={50} /></g>
      <g className="fl1"><Bubble cx={470} cy={268} r={30} /></g>
    </svg>
  )
}
