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
const REPEL_RADIUS   = 0.4
const REPEL_STRENGTH = 1.1
const MIN_DIST       = 2.4    // depth normalisation range
const MAX_DIST       = 4.5

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
    camera.position.z = 3.4

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
        uScale: { value: 26.0 },
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

    /* mouse repel → cube local space */
    const ndc = new THREE.Vector2(9999, 9999)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const world = new THREE.Vector3()
    const ray = new THREE.Raycaster()
    function onMove(e: MouseEvent) {
      const r = mount.getBoundingClientRect()
      ndc.x =  ((e.clientX - r.left) / r.width)  * 2 - 1
      ndc.y = -((e.clientY - r.top)  / r.height) * 2 + 1
    }
    function onLeave() { ndc.set(9999, 9999) }
    window.addEventListener('mousemove', onMove)
    mount.addEventListener('mouseleave', onLeave)

    const speed = (Math.PI * 2) / SECONDS_PER_TURN   // rad / sec
    let raf = 0
    let last = performance.now()

    function tick(now: number) {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      mesh.rotation.y += speed * dt

      ray.setFromCamera(ndc, camera)
      ray.ray.intersectPlane(plane, world)
      const lm = mesh.worldToLocal(world.clone())
      const active = ndc.x < 999

      const arr = (geo.attributes.position as THREE.BufferAttribute).array as Float32Array
      for (let i = 0; i < COUNT; i++) {
        const b = i * 3
        const px = arr[b], py = arr[b+1], pz = arr[b+2]
        let fx = (orig[b]   - px) * SPRING
        let fy = (orig[b+1] - py) * SPRING
        let fz = (orig[b+2] - pz) * SPRING
        if (active) {
          const dx = px - lm.x, dy = py - lm.y, dz = pz - lm.z
          const dd = Math.sqrt(dx*dx + dy*dy + dz*dz)
          if (dd < REPEL_RADIUS && dd > 0.0001) {
            const f = ((REPEL_RADIUS - dd) / REPEL_RADIUS) * REPEL_STRENGTH
            const inv = 1 / dd
            fx += dx * inv * f; fy += dy * inv * f; fz += dz * inv * f
          }
        }
        vel[b]   = (vel[b]   + fx) * DAMPING
        vel[b+1] = (vel[b+1] + fy) * DAMPING
        vel[b+2] = (vel[b+2] + fz) * DAMPING
        arr[b]   = px + vel[b]
        arr[b+1] = py + vel[b+1]
        arr[b+2] = pz + vel[b+2]
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
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      mount.removeEventListener('mouseleave', onLeave)
      renderer.dispose(); geo.dispose(); mat.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
