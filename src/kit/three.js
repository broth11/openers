import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { makeSvgGraph } from './svg.js'
import { createLabeller } from './labels.js'
import { COLORS as C } from './style.js'
import './three.css'
import { sweptGeometry } from '../components/solid-of-revolution/geometry.js'

export function makeThreeGraph(host, { renderLabel, onDrag }) {
  const root = document.createElement('div')
  root.className = 'revolution-stage'
  root.innerHTML = `<section class="profile-pane"><h3>Generating region</h3><div class="profile-graph"></div></section>
    <section class="solid-pane"><h3>Revolution <span class="axis-name"></span></h3>
    <div class="solid-viewport"><div class="solid-labels dg-ov"></div></div>
    <div class="solid-tools"><button type="button" data-view="play" aria-pressed="false">Play turn</button><button type="button" data-view="reset">Reset view</button><button type="button" data-view="front">Front</button><button type="button" data-view="end">End-on</button></div>
    <p class="orbit-hint">Drag to look around · scroll to zoom</p></section>`
  host.append(root)
  const viewport = root.querySelector('.solid-viewport')
  const profile = makeSvgGraph(root.querySelector('.profile-graph'), { renderLabel, onDrag: (param, value) => onDrag(param, param === 'selected' && spec ? (value - spec.a) / (spec.b - spec.a) : value) })
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setClearColor(0xffffff)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.domElement.setAttribute('aria-label', 'Interactive solid of revolution. Drag to orbit.')
  viewport.prepend(renderer.domElement)
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.01, 200)
  const orbit = new OrbitControls(camera, renderer.domElement)
  orbit.enablePan = false; orbit.minDistance = 2; orbit.maxDistance = 40
  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(3, 7, 8)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7b8d9c, 2.5), key)
  const body = new THREE.Group()
  scene.add(body)
  const labeller = createLabeller(root.querySelector('.solid-labels'), renderLabel)
  let spec = null, playing = false, raf = 0, lastFrame = 0, destroyed = false
  const point = (t, r, angle = 0) => spec.axis === 'x' ? new THREE.Vector3(t, r * Math.cos(angle), r * Math.sin(angle)) : new THREE.Vector3(r * Math.cos(angle), t, r * Math.sin(angle))
  const project = (p) => { const q = p.clone().project(camera); return { x: (q.x + 1) / 2 * viewport.clientWidth, y: (1 - q.y) / 2 * viewport.clientHeight } }
  function labels() {
    if (!spec) return
    const anchors = new Map(), ls = []
    const add = (id, p, html, color, pos = 'ne') => { const index = anchors.size; anchors.set(index, p); ls.push({ id, x: index, y: 0, html, color, pos, attached: true }) }
    add('axis', point(spec.b + 0.3, 0), `$${spec.axis}$`, C.ink)
    if (spec.revealed && spec.pieces) add('piece', point(spec.typical.m, spec.outer(spec.typical.m), 0.4), 'Selected slice', C.sel, 'n')
    labeller.place({ labels: ls, toPx: (id) => project(anchors.get(id)), w: viewport.clientWidth, h: viewport.clientHeight })
  }
  function render() {
    if (destroyed || !spec) return
    renderer.render(scene, camera); labels()
    viewport.dataset.camera = camera.position.toArray().map((v) => v.toFixed(3)).join(',')
  }
  orbit.addEventListener('change', render)
  function setView(mode = 'reset') {
    if (!spec) return
    const target = new THREE.Vector3(...spec.center), distance = spec.scale * 2.2
    let offset = new THREE.Vector3(0.9, 0.65, 1.3).normalize().multiplyScalar(distance)
    if (mode === 'front') offset = new THREE.Vector3(0, 0, distance)
    if (mode === 'end') offset = spec.axis === 'x' ? new THREE.Vector3(distance, 0.001, 0) : new THREE.Vector3(0.001, distance, 0.001)
    camera.up.set(0, 1, 0); camera.position.copy(target).add(offset); orbit.target.copy(target); orbit.update(); render()
  }
  const material = (color, opacity = 1) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, side: THREE.DoubleSide, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 })
  function disposeBody() {
    body.traverse((o) => { o.geometry?.dispose(); if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose()); else o.material?.dispose() })
    body.clear()
  }
  function line(points, color, dashed = false) {
    const g = new THREE.BufferGeometry().setFromPoints(points)
    const m = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.1, gapSize: 0.07 }) : new THREE.LineBasicMaterial({ color })
    const l = new THREE.Line(g, m)
    if (dashed) l.computeLineDistances()
    body.add(l)
  }
  function mesh(s, angle, color, opacity = 1, selected = false, longitudinal = 40) {
    body.add(new THREE.Mesh(sweptGeometry(s, angle, longitudinal, 48), [material(color, opacity), material(selected ? C.sel : C.face, opacity)]))
  }
  function draw() {
    disposeBody()
    const angle = Math.max(0.0001, Math.min(360, spec.angle)) * Math.PI / 180
    const sweep = spec.cutaway ? Math.min(angle, Math.PI * 1.5) : angle
    const start = point(spec.a - 0.35, 0), end = point(spec.b + 0.45, 0)
    line([start, end], C.ink, true)
    const direction = end.clone().sub(start).normalize()
    body.add(new THREE.ArrowHelper(direction, end.clone().addScaledVector(direction, -0.2), 0.2, C.ink, 0.16, 0.08))
    if (!spec.revealed) { render(); return }
    if (spec.reference) {
      const g = sweptGeometry({ ...spec, ...spec.reference }, Math.PI * 2, 16, 16)
      body.add(new THREE.LineSegments(new THREE.WireframeGeometry(g), new THREE.LineBasicMaterial({ color: C.muted, transparent: true, opacity: 0.12 }))); g.dispose()
    }
    if (spec.stack) {
      const h = (spec.b - spec.a) / spec.n
      for (let i = 0; i < spec.n; i++) {
        if (i === spec.typical.i && spec.pieces) continue
        const lo = spec.a + i * h, mid = lo + h / 2
        mesh({ ...spec, a: lo, b: lo + h, outer: () => spec.outer(mid), inner: () => spec.inner(mid) }, sweep, C.strip, 0.65, false, 1)
      }
    } else mesh(spec, sweep, C.solid, spec.pieces ? 0.46 : 0.92)
    const phi = spec.sign < 0 ? Math.PI : 0
    const sample = (f) => Array.from({ length: 97 }, (_, i) => { const t = spec.a + (spec.b - spec.a) * i / 96; return point(t, f(t), phi) })
    line(sample(spec.outer), C.strip)
    if (spec.inner(spec.b) > 0) line(sample(spec.inner), C.coral)
    if (spec.pieces) {
      const t = spec.typical
      mesh({ ...spec, a: t.lo, b: t.hi, outer: () => spec.outer(t.m), inner: () => spec.inner(t.m) }, sweep, C.sel, 0.95, true, 1)
      line([point(t.m, spec.inner(t.m), phi), point(t.m, spec.outer(t.m), phi)], C.sel)
    }
    Object.assign(viewport.dataset, { axis: spec.axis, angle: String(spec.angle), cutaway: String(spec.cutaway), selected: String(spec.typical.i), innerRadius: String(spec.inner(spec.typical.m)), outerRadius: String(spec.outer(spec.typical.m)), triangles: String(body.children.reduce((n, o) => n + (o.isMesh ? o.geometry.attributes.position.count / 3 : 0), 0)) })
    render()
  }
  function stop() {
    playing = false; cancelAnimationFrame(raf)
    const b = root.querySelector('[data-view="play"]'); b.setAttribute('aria-pressed', 'false'); b.textContent = 'Play turn'
  }
  function tick(time) {
    if (!playing) return
    if (time - lastFrame > 65) {
      const next = Math.min(360, spec.angle + 9)
      lastFrame = time; onDrag('angle', next)
      if (next >= 360) { stop(); return }
    }
    raf = requestAnimationFrame(tick)
  }
  root.addEventListener('click', (e) => {
    const button = e.target.closest('[data-view]'), mode = button?.dataset.view
    if (!mode) return
    if (mode === 'play') {
      if (playing) { stop(); return }
      playing = true
      if (spec.angle >= 360) onDrag('angle', 0)
      button.textContent = 'Pause turn'; button.setAttribute('aria-pressed', 'true'); lastFrame = 0; raf = requestAnimationFrame(tick)
    } else setView(mode)
  })
  function resize() {
    const w = viewport.clientWidth, h = viewport.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h); camera.aspect = w / h
    // Preserve the full solid when the working drawer makes the pane narrow.
    camera.zoom = Math.min(1, camera.aspect)
    camera.updateProjectionMatrix(); render()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(viewport)
  return {
    engine: 'three',
    apply(next) {
      const changed = spec?.id !== next.solid.id || spec?.axis !== next.solid.axis
      spec = next.solid; root.hidden = false; root.dataset.scene = spec.id
      root.querySelector('.axis-name').textContent = `about ${spec.axis}`
      root.querySelector('.solid-pane').style.visibility = spec.revealed ? 'visible' : 'hidden'
      renderer.domElement.style.visibility = spec.revealed ? 'visible' : 'hidden'
      root.querySelector('.solid-tools').style.visibility = spec.revealed ? 'visible' : 'hidden'
      root.querySelector('[data-view="play"]').hidden = !spec.turnEnabled
      root.querySelector('.orbit-hint').textContent = spec.cutaway ? 'Cutaway: ¼ hidden · values use the full solid' : 'Drag to look around · scroll to zoom'
      profile.apply(next.profile)
      if (changed) { stop(); setView() }
      resize(); draw()
    },
    clear() { stop(); disposeBody(); profile.clear(); root.hidden = true },
    destroy() { destroyed = true; stop(); ro.disconnect(); orbit.dispose(); disposeBody(); renderer.dispose(); profile.destroy(); labeller.clear(); root.remove() },
    resize,
  }
}
