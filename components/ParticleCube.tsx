'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* tuning */
const CUBE_HALF      = 0.85
const GRID_DESKTOP   = 12     // points per face edge
const GRID_MOBILE    = 8
const EDGE_DESKTOP   = 34     // extra points per edge (crisp edges)
const EDGE_MOBILE    = 22
const SECONDS_PER_TURN = 45   // full rotation duration
const DAMPING        = 0.88
const SPRING         = 0.045
const REPEL_STRENGTH = 1.1
const CAM_Z          = 5.8    // camera distance: the canvas is ~1.7× the cube, so a burst has room to fly
const MIN_DIST       = 4.8    // depth normalisation range
const MAX_DIST       = 6.9

/* ── shaders ─────────────────────────────────────────────── */
const vert = /* glsl */`
  attribute float aSize;
  uniform float uScale;
  uniform float uMin;
  uniform float uMax;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    // near particles bigger, far smaller
    gl_PointSize = clamp(aSize * (uScale / dist), 3.0, 14.0);
    vDepth = clamp((dist - uMin) / (uMax - uMin), 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`

const frag = /* glsl */`
  precision mediump float;
  varying float vDepth;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float mask = 1.0 - smoothstep(0.42, 0.5, d);
    if (mask <= 0.0) discard;
    // near = dark & opaque, far = light grey & faint
    vec3  col = mix(vec3(0.10), vec3(0.72), vDepth);
    float op  = mix(0.92, 0.22, vDepth);
    gl_FragColor = vec4(col, op * mask);
  }
`

/* ── build grid-aligned cube points (faces + edges) ───────── */
function buildPoints(grid: number, edgeN: number): Float32Array {
  const H = CUBE_HALF
  const pts: number[] = []

  // 6 faces, regular grid
  const faces: [number, 0 | 1 | 2][] = [
    [ 1, 0], [-1, 0],   // ±x
    [ 1, 1], [-1, 1],   // ±y
    [ 1, 2], [-1, 2],   // ±z
  ]
  for (const [sign, axis] of faces) {
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const u = (i / (grid - 1)) * 2 * H - H
        const v = (j / (grid - 1)) * 2 * H - H
        if (axis === 0) pts.push(sign * H, u, v)
        else if (axis === 1) pts.push(u, sign * H, v)
        else pts.push(u, v, sign * H)
      }
    }
  }

  // 12 edges, denser line of points for crisp geometry
  const c = [-H, H]
  const edges: [number[], number[]][] = []
  // along x
  for (const y of c) for (const z of c) edges.push([[-H, y, z], [H, y, z]])
  // along y
  for (const x of c) for (const z of c) edges.push([[x, -H, z], [x, H, z]])
  // along z
  for (const x of c) for (const y of c) edges.push([[x, y, -H], [x, y, H]])

  for (const [a, b] of edges) {
    for (let k = 0; k < edgeN; k++) {
      const t = k / (edgeN - 1)
      pts.push(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
    }
  }

  return new Float32Array(pts)
}

export default function ParticleCube() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current!
    const isMobile = window.innerWidth < 768
    const grid  = isMobile ? GRID_MOBILE : GRID_DESKTOP
    const edgeN = isMobile ? EDGE_MOBILE : EDGE_DESKTOP

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.01, 100)
    camera.position.z = CAM_Z

    const orig = buildPoints(grid, edgeN)
    const COUNT = orig.length / 3
    const pos = new Float32Array(orig)
    const vel = new Float32Array(COUNT * 3)
    const sz  = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) sz[i] = 0.85 + Math.random() * 0.4

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sz, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uScale: { value: 44.0 },
        uMin:   { value: MIN_DIST },
        uMax:   { value: MAX_DIST },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })

    const mesh = new THREE.Points(geo, mat)
    mesh.rotation.x = 0.4   // gentle tilt for 3D read
    scene.add(mesh)

    /* ── interaction, measured on screen (pixels) so every visible dot reacts ──
       hover: dots near the pointer move away · click / tap: the cube bursts and rebuilds */
    const pointer = { x: -1e4, y: -1e4, inside: false }
    let burstAt = -1e4            // time of the last burst (ms)
    function toLocal(e: PointerEvent) {
      const r = mount.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom }
    }
    function onMove(e: PointerEvent) { Object.assign(pointer, toLocal(e)) }
    function onLeave() { pointer.inside = false; pointer.x = pointer.y = -1e4 }
    function onDown(e: PointerEvent) {
      const p = toLocal(e)
      if (!p.inside) return
      Object.assign(pointer, p)
      burst(p.x, p.y)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    const proj = new THREE.Vector3()
    const invQ = new THREE.Quaternion()
    const dirW = new THREE.Vector3()
    const screenX = new Float32Array(COUNT), screenY = new Float32Array(COUNT)

    function project() {
      const w = mount.clientWidth, h = mount.clientHeight
      mesh.updateMatrixWorld()
      const arr = (geo.attributes.position as THREE.BufferAttribute).array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        proj.set(arr[i*3], arr[i*3+1], arr[i*3+2]).applyMatrix4(mesh.matrixWorld).project(camera)
        screenX[i] = (proj.x * 0.5 + 0.5) * w
        screenY[i] = (-proj.y * 0.5 + 0.5) * h
      }
    }

    // push dots away from (x, y) on screen; direction is turned into the cube's own space
    function burst(x: number, y: number) {
      burstAt = performance.now()
      project()
      invQ.copy(mesh.quaternion).invert()
      const size = Math.min(mount.clientWidth, mount.clientHeight)
      for (let i = 0; i < COUNT; i++) {
        const b = i * 3
        let dx = screenX[i] - x, dy = screenY[i] - y
        const d = Math.hypot(dx, dy) || 1
        dx /= d; dy /= d
        const near = Math.max(0, 1 - d / (size * 0.9))          // strongest under the finger
        const k = (0.05 + near * near * 0.22) * (0.7 + Math.random() * 0.6)
        // outward on screen, plus outward from the cube centre and a bit of depth
        dirW.set(dx, -dy, (Math.random() - 0.5) * 1.2).applyQuaternion(invQ)
        const ox = orig[b], oy = orig[b+1], oz = orig[b+2], ol = Math.hypot(ox, oy, oz) || 1
        vel[b]   += dirW.x * k + (ox / ol) * k * 0.6
        vel[b+1] += dirW.y * k + (oy / ol) * k * 0.6
        vel[b+2] += dirW.z * k + (oz / ol) * k * 0.6
      }
    }

    const speed = (Math.PI * 2) / SECONDS_PER_TURN   // rad / sec
    let raf = 0
    let last = performance.now()

    function tick(now: number) {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const f60 = dt * 60                               // same feel at any frame rate

      // spins a little faster for a moment after a burst
      const sinceBurst = (now - burstAt) / 1000
      mesh.rotation.y += speed * dt * (1 + 2.5 * Math.max(0, 1 - sinceBurst / 1.5))

      // after a burst the dots drift back slowly, then snap into place
      const spring = SPRING * (sinceBurst < 2.2 ? 0.18 + 0.82 * Math.min(1, sinceBurst / 2.2) ** 2 : 1)
      const damping = Math.pow(DAMPING, f60)

      const hover = pointer.inside
      if (hover) { project(); invQ.copy(mesh.quaternion).invert() }
      const radius = Math.min(mount.clientWidth, mount.clientHeight) * 0.16

      const arr = (geo.attributes.position as THREE.BufferAttribute).array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        const b = i * 3
        const px = arr[b], py = arr[b+1], pz = arr[b+2]
        let fx = (orig[b]   - px) * spring
        let fy = (orig[b+1] - py) * spring
        let fz = (orig[b+2] - pz) * spring
        if (hover) {
          const dx = screenX[i] - pointer.x, dy = screenY[i] - pointer.y
          const d = Math.hypot(dx, dy)
          if (d < radius && d > 0.01) {
            const t = 1 - d / radius
            const f = t * t * REPEL_STRENGTH * 0.06
            dirW.set(dx / d, -dy / d, 0.35).applyQuaternion(invQ)
            fx += dirW.x * f; fy += dirW.y * f; fz += dirW.z * f
          }
        }
        vel[b]   = (vel[b]   + fx * f60) * damping
        vel[b+1] = (vel[b+1] + fy * f60) * damping
        vel[b+2] = (vel[b+2] + fz * f60) * damping
        arr[b]   = px + vel[b]   * f60
        arr[b+1] = py + vel[b+1] * f60
        arr[b+2] = pz + vel[b+2] * f60
      }
      ;(geo.attributes.position as THREE.BufferAttribute).needsUpdate = true
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    function onResize() {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', onResize)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      renderer.dispose(); geo.dispose(); mat.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', touchAction: 'pan-y' }} />
}
