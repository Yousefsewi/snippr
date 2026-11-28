'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A dusk landscape drawn only with points: a far misty ridge, a big dark-green hill sweeping down
// from the left with a spray of light dots blowing off its crest, bushes on the right and a meadow
// of purple/white flowers in front. Every dot sways a little in the wind. Generated in code (no
// image), used as the 404 background. Respects prefers-reduced-motion (draws one still frame).

// small deterministic noise so the scene looks the same on every load
function makeRand(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}
function noise1(x: number) {
  const i = Math.floor(x), f = x - i
  const h = (n: number) => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v) }
  const u = f * f * (3 - 2 * f)
  return h(i) * (1 - u) + h(i + 1) * u
}
const fbm = (x: number) => noise1(x) * 0.55 + noise1(x * 2.3 + 7) * 0.3 + noise1(x * 5.1 + 13) * 0.15

type RGB = [number, number, number]
type Layer = {
  count: number
  ridge: (x: number) => number   // top edge (screen y, -1..1)
  floor: number                 // bottom edge
  xFrom?: number; xTo?: number  // horizontal extent; edges fade out so no hard seam shows
  base: RGB[]                   // most dots (deep greens / mist)
  accent: RGB[]; accentP: number  // scattered flowers (purples, pinks)
  light: RGB[]                  // pale dots that gather along the crest
  size: [number, number]
  alpha: number
  bias?: number                 // >1 packs dots toward the ridge
}

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]
const H = (...h: string[]) => h.map(hex)

function buildLayers(scale: number): Layer[] {
  const n = (k: number) => Math.round(k * scale)
  return [
    // far misty ridge, lilac and white
    { count: n(22000), ridge: x => 0.02 + 0.14 * fbm(x * 1.2 + 3) + 0.16 * Math.exp(-((x - 0.3) ** 2) * 5), floor: -0.35,
      base: H('#8e88c4', '#a29cd4', '#7d77b6'), accent: H('#c9b6ef'), accentP: 0.15, light: H('#e9e6fb', '#f6f4ff', '#d6eccf'),
      size: [2.2, 4.6], alpha: 0.75, bias: 2.4 },
    // the big hill from the top-left down to the middle
    { count: n(80000), ridge: x => 1.0 - (x + 1.05) * 0.95 + 0.07 * fbm(x * 3 + 1), floor: -1.05, xFrom: -1.05, xTo: 0.45,
      base: H('#0c1f0d', '#14301a', '#1d3f1b', '#2a5223', '#355f2b'), accent: H('#5b45a8', '#7d64cf', '#a48ee8'), accentP: 0.12,
      light: H('#cfe9c0', '#e4f4da', '#bfe0ad'), size: [3, 6.5], alpha: 1, bias: 1.5 },
    // rounded bushes on the right
    { count: n(52000), ridge: x => -0.12 + 0.2 * fbm(x * 3.5 + 9) + 0.22 * Math.exp(-((x - 0.8) ** 2) * 6) + 0.12 * Math.exp(-((x - 0.35) ** 2) * 18), floor: -1.05, xFrom: -0.05, xTo: 1.05,
      base: H('#0f2510', '#1a3b18', '#264f20', '#336128', '#41742f'), accent: H('#6a52b6', '#9077d8'), accentP: 0.06,
      light: H('#a9d38a', '#c8e6ad', '#e0f2cf'), size: [3.2, 7], alpha: 1, bias: 1.3 },
    // meadow of flowers in front, rising gently to the left
    { count: n(64000), ridge: x => -0.5 + 0.14 * fbm(x * 2 + 4) - 0.12 * x, floor: -1.05,
      base: H('#14301a', '#1e3f1d', '#2b5124'), accent: H('#5b3fae', '#7e5ed6', '#a385ea', '#d08bc9', '#e7a7d6'), accentP: 0.42,
      light: H('#f4f0ff', '#e6dcfb', '#ffffff'), size: [3.2, 7.5], alpha: 1, bias: 1.0 },
  ]
}

export default function DreamField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.innerWidth < 700
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    host.appendChild(renderer.domElement)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10)
    camera.position.z = 5

    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.NormalBlending,
      uniforms: { uTime: { value: 0 }, uDpr: { value: dpr } },
      vertexShader: /* glsl */`
        attribute float aSize; attribute float aAlpha; attribute float aPhase; attribute float aSpray;
        attribute vec3 aColor;
        uniform float uTime; uniform float uDpr;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vec3 p = position;
          // wind: a slow sway, stronger near the top of each mass, plus the crest spray drifting right
          float sway = sin(uTime * 0.6 + aPhase * 6.2831 + p.x * 2.0) * 0.004 * (1.0 + p.y);
          p.x += sway + aSpray * mod(uTime * 0.02 + aPhase, 0.35);
          p.y += aSpray * 0.25 * mod(uTime * 0.02 + aPhase, 0.35);
          vColor = aColor; vAlpha = aAlpha * (1.0 - aSpray * mod(uTime * 0.02 + aPhase, 0.35) / 0.35);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * uDpr;
        }`,
      fragmentShader: /* glsl */`
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.15, d));
        }`,
    })

    let points: THREE.Points | null = null
    const build = () => {
      const w = host.clientWidth || 1, h = host.clientHeight || 1

      renderer.setSize(w, h, false)
      const rand = makeRand(20261128)
      const layers = buildLayers(mobile ? 0.4 : 1)
      const sprayCount = mobile ? 7000 : 18000
      const total = layers.reduce((s, l) => s + l.count, 0) + sprayCount
      const pos = new Float32Array(total * 3), col = new Float32Array(total * 3)
      const size = new Float32Array(total), alpha = new Float32Array(total), phase = new Float32Array(total), spray = new Float32Array(total)
      let k = 0
      const put = (x: number, y: number, c: [number, number, number], s: number, a: number, sp: number, z: number) => {
        pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z
        const j = 0.9 + rand() * 0.2
        col[k * 3] = Math.min(1, c[0] * j); col[k * 3 + 1] = Math.min(1, c[1] * j); col[k * 3 + 2] = Math.min(1, c[2] * j)
        size[k] = s; alpha[k] = a; phase[k] = rand(); spray[k] = sp; k++
      }
      layers.forEach((L, li) => {
        const x0 = L.xFrom ?? -1.05, x1 = L.xTo ?? 1.05
        for (let i = 0; i < L.count; i++) {
          const x = x0 + rand() * (x1 - x0)
          const top = L.ridge(x)
          // pack dots toward the ridge so crests read as bright edges
          const t = Math.pow(rand(), L.bias ?? 1)
          const y = top - t * (top - L.floor)
          const nearTop = 1 - t
          // mostly base colour, flowers scattered through, pale dots along the crest
          const r = rand()
          const lightP = 0.04 + Math.pow(nearTop, 6) * 0.55
          const pal = r < lightP ? L.light : r < lightP + L.accentP ? L.accent : L.base
          const c = pal[Math.floor(rand() * pal.length)]
          // fade out toward the layer's left/right ends so no straight seam shows
          const edge = Math.min(1, (x - x0) / 0.25, (x1 - x) / 0.25)
          if (edge < 1 && rand() > edge) continue
          put(x, y, c, L.size[0] + rand() * (L.size[1] - L.size[0]), L.alpha * (0.65 + rand() * 0.35), 0, li * 0.1)
        }
      })
      // the spray blowing off the big hill's crest, pale green and white
      const big = layers[1]
      const sprayCols = [hex('#e6f5da'), hex('#cfe8c2'), hex('#f4f2ff'), hex('#b9e0a8')]
      for (let i = 0; i < sprayCount; i++) {
        const x = -1.05 + rand() * 1.4
        const y = big.ridge(x) + rand() * 0.18
        put(x, y, sprayCols[Math.floor(rand() * sprayCols.length)], 2 + rand() * 3.5, 0.85, 1, 0.5)
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
      g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
      g.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1))
      g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
      g.setAttribute('aSpray', new THREE.BufferAttribute(spray, 1))
      if (points) { scene.remove(points); points.geometry.dispose() }
      points = new THREE.Points(g, material)
      scene.add(points)
    }
    build()

    let raf = 0
    const start = performance.now()
    const frame = () => {
      material.uniforms.uTime.value = (performance.now() - start) / 1000
      renderer.render(scene, camera)
      if (!reduced) raf = requestAnimationFrame(frame)
    }
    frame()

    const onResize = () => { build(); if (reduced) renderer.render(scene, camera) }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      if (points) points.geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={ref} className={className} aria-hidden />
}
