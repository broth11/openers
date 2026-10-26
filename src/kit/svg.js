// Hand-built SVG graph for lesson openers, in the matplotlib house style (Haese variant):
// 1:1 grid, dotted teal grid lines, arrowheads on both ends of both axes, open origin circle,
// no "0" at the origin, true minus signs, translucent shading, and function labels in white boxes
// with a thin rounded black border. Engines share one interface: apply(spec), clear(), destroy(), and engine: '<name>'.
//
// A spec is { bounds, items, labels }. Items, drawn in this order of layers:
//   { type: 'area', var: 'x' | 'y', from, to, lo: (t) => v, hi: (t) => v, color, opacity }
//   { type: 'rects', items: [[x1, x2, y1, y2], ...], color, opacity }
//   { type: 'line', x1, y1, x2, y2, color, width, dash }
//   { type: 'curve', f: (t) => [x, y], t: [a, b], color, width, dash }
//   { type: 'rect', x1, x2, y1, y2, color, drag: { param, axis: 'x' | 'y' } }   (the typical strip)
//   { type: 'dim', from: [x, y], to: [x, y], color }                           (double-headed arrow)
//   { type: 'points', pts: [[x, y], ...], color, r, hollow }
//   { type: 'arrow', from: [x, y], to: [x, y], color, width }                  (single-headed arrow)
//   { type: 'handle', x, y, color, drag: { param, axis } }                      (draggable point)
// Optional spec.scene = { frac, draw(api) } puts a drawn context scene beside the graph (below 640 px wide,
// above it). See components/context-stage/README.md for the api the draw function receives.
// Labels: { id, x, y, html, color, pos, plain, fixed }, placed by kit/labels.js.

import { COLORS, ROLES, ORIGIN, gridStep } from './style.js'
import { createLabeller } from './labels.js'

const NS = 'http://www.w3.org/2000/svg'
const GRID = COLORS.grid
const AXIS = COLORS.ink
const TICK = COLORS.tick
const minus = (s) => String(s).replace('-', '−')
const r2 = (v) => Math.round(v * 100) / 100

let instances = 0

export function makeSvgGraph(host, { renderLabel, onDrag }) {
  const uid = `g${++instances}`
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'sg')
  svg.setAttribute('role', 'img')
  const ov = document.createElement('div')
  ov.className = 'dg-ov'
  ov.setAttribute('aria-hidden', 'true')
  host.append(svg, ov)

  let spec = { items: [], labels: [] }
  let want = null
  let view = null // { left, right, bottom, top, ppu, w, h }
  let drag = null
  const labeller = createLabeller(ov, renderLabel)
  let geo = { pts: [], dots: [] } // what labels must avoid, in px

  const X = (x) => view.ox + (x - view.left) * view.ppu * view.aspect
  const Y = (y) => view.oy + (view.top - y) * view.ppu
  const toMath = (px, py) => ({ x: view.left + (px - view.ox) / (view.ppu * view.aspect), y: view.top - (py - view.oy) / view.ppu })

  // The graph's own rectangle inside the svg: the whole svg, or what a context scene leaves free.
  function layout(W, H) {
    if (!spec.scene) return { ox: 0, oy: 0, gw: W, gh: H, scene: null }
    const gap = 14
    if (W < 640) {
      const sh = Math.round(H * (spec.scene.stackFrac || 0.42))
      return { ox: 0, oy: sh + gap, gw: W, gh: H - sh - gap, scene: { x: 0, y: 0, w: W, h: sh, stacked: true } }
    }
    const sw = Math.round(W * (spec.scene.frac || 0.4))
    return { ox: sw + gap, oy: 0, gw: W - sw - gap, gh: H, scene: { x: 0, y: 0, w: sw, h: H, stacked: false } }
  }

  function fit() {
    const W = host.clientWidth
    const H = host.clientHeight
    if (!want || !W || !H) return false
    const { ox, oy, gw, gh, scene } = layout(W, H)
    const xr = want.right - want.left
    const yr = want.top - want.bottom
    const aspect = spec.axes?.aspect || 1
    const ppu = Math.min(gw / (xr * aspect), gh / yr)
    const cx = (want.left + want.right) / 2
    const cy = (want.bottom + want.top) / 2
    view = { left: cx - gw / (ppu * aspect) / 2, right: cx + gw / (ppu * aspect) / 2, bottom: cy - gh / ppu / 2, top: cy + gh / ppu / 2, ppu, aspect, w: ox + gw, h: oy + gh, ox, oy, gw, gh, W, H, scene }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.setAttribute('width', W)
    svg.setAttribute('height', H)
    ov.style.left = `${ox}px`
    ov.style.top = `${oy}px`
    ov.style.width = `${gw}px`
    ov.style.height = `${gh}px`
    ov.style.right = 'auto'
    ov.style.bottom = 'auto'
    return true
  }

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag)
    for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v)
    if (parent) parent.append(n)
    return n
  }

  function grid(g) {
    const step = { x: spec.axes?.xStep || gridStep(view.ppu * view.aspect), y: spec.axes?.yStep || gridStep(view.ppu) }
    const gx = el('g', { stroke: GRID, 'stroke-width': ROLES.grid.lineWidth, 'stroke-dasharray': '1.5 3.5', 'stroke-opacity': ROLES.grid.lineOpacity }, g)
    for (let x = Math.ceil(view.left / step.x) * step.x; x <= view.right; x += step.x) if (x !== 0) el('line', { x1: X(x), y1: view.oy, x2: X(x), y2: view.h }, gx)
    for (let y = Math.ceil(view.bottom / step.y) * step.y; y <= view.top; y += step.y) if (y !== 0) el('line', { x1: view.ox, y1: Y(y), x2: view.w, y2: Y(y) }, gx)
    return step
  }

  function axes(g, step) {
    const nonnegativeX = spec.axes?.nonnegative === true || spec.axes?.nonnegative?.x
    const nonnegativeY = spec.axes?.nonnegative === true || spec.axes?.nonnegative?.y
    const ox = X(0)
    const oy = Y(0)
    // an axis outside the graph's rectangle (beside a scene) is not drawn, nor are its numbers
    const showX = oy >= view.oy && oy <= view.h
    const showY = ox >= view.ox && ox <= view.w
    const a = el('g', { stroke: AXIS, 'stroke-width': ROLES.axis.lineWidth, fill: 'none' }, g)
    if (showX) el('line', { x1: nonnegativeX ? ox : view.ox + 6, y1: oy, x2: view.w - 6, y2: oy, 'marker-start': nonnegativeX ? null : 'url(#ar)', 'marker-end': 'url(#ar)' }, a)
    if (showY) el('line', { x1: ox, y1: nonnegativeY ? oy : view.h - 6, x2: ox, y2: view.oy + 6, 'marker-start': nonnegativeY ? null : 'url(#ar)', 'marker-end': 'url(#ar)' }, a)
    const t = el('g', { fill: TICK, 'font-family': 'STIX Two Text, Cambria Math, serif', 'font-size': 17 }, g)
    const tk = el('g', { stroke: AXIS, 'stroke-width': 1.4 }, g)
    for (let x = Math.ceil(view.left / step.x) * step.x; x <= view.right; x += step.x) {
      if (!showX || x === 0 || X(x) < view.ox + 18 || X(x) > view.w - 38 || (nonnegativeX && x < 0)) continue
      el('line', { x1: X(x), y1: oy - 4, x2: X(x), y2: oy + 4 }, tk)
      const n = el('text', { class: 'sg-tick', x: X(x), y: oy + 22, 'text-anchor': 'middle', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, t)
      n.textContent = minus(r2(x))
    }
    for (let y = Math.ceil(view.bottom / step.y) * step.y; y <= view.top; y += step.y) {
      if (!showY || y === 0 || Y(y) > view.h - 18 || Y(y) < view.oy + 38 || (nonnegativeY && y < 0)) continue
      el('line', { x1: ox - 4, y1: Y(y), x2: ox + 4, y2: Y(y) }, tk)
      const n = el('text', { class: 'sg-tick', x: ox - 9, y: Y(y) + 6, 'text-anchor': 'end', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, t)
      n.textContent = minus(r2(y))
    }
    const it = el('g', { fill: AXIS, 'font-family': 'STIX Two Text, Cambria Math, serif', 'font-size': 21, 'font-style': 'italic' }, g)
    el('text', { x: view.w - 10, y: oy - 12, 'text-anchor': 'end' }, it).textContent = spec.axes?.x || 'x'
    el('text', { x: ox + 12, y: view.oy + 22 }, it).textContent = spec.axes?.y || 'y'
  }

  function draw() {
    if (!view) return
    svg.replaceChildren()
    const defs = el('defs', {}, svg)
    const m = el('marker', { id: 'ar', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 9, markerHeight: 9, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, defs)
    el('path', { d: 'M0,1 L10,5 L0,9 z', fill: AXIS }, m)
    for (const c of new Set(spec.items.filter((i) => i.type === 'dim').map((i) => i.color || COLORS.sel))) {
      const id = 'dm' + c.slice(1)
      const mk = el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, defs)
      el('path', { d: 'M0,1 L10,5 L0,9 z', fill: c }, mk)
    }
    el('rect', { x: 0, y: 0, width: view.W, height: view.H, fill: '#fff' }, svg)
    // everything mathematical is clipped to the graph's rectangle, so a scene beside it stays clean
    const clip = el('clipPath', { id: `${uid}-clip` }, defs)
    el('rect', { x: view.ox, y: view.oy, width: view.gw, height: view.gh }, clip)
    if (view.scene && spec.scene?.draw) {
      const sc = view.scene
      const sclip = el('clipPath', { id: `${uid}-sclip` }, defs)
      el('rect', { x: sc.x, y: sc.y, width: sc.w, height: sc.h }, sclip)
      const sg = el('g', { 'clip-path': `url(#${uid}-sclip)`, class: 'sg-scene' }, svg)
      // Shared vertical scale beside the graph; its own scale over the same range when stacked above it.
      const sy = sc.stacked ? (y) => sc.y + 8 + ((view.top - y) / (view.top - view.bottom)) * (sc.h - 16) : Y
      spec.scene.draw({ el: (tag, attrs, parent) => el(tag, attrs, parent || sg), g: sg, x: sc.x, y: sc.y, w: sc.w, h: sc.h, Y: sy, stacked: sc.stacked, graphY: Y })
    }
    // origin circle sits under everything, so the axes run through it
    // Grid and axes are drawn inside the graph's rectangle by construction, never clipped:
    // WebKit paints a clipped group with opacity only in patches.
    const inside = X(0) >= view.ox && X(0) <= view.w && Y(0) >= view.oy && Y(0) <= view.h
    if (inside) el('circle', { cx: X(0), cy: Y(0), r: ORIGIN.radius, fill: 'none', stroke: AXIS, 'stroke-width': ORIGIN.lineWidth }, svg)
    const step = grid(el('g', {}, svg))
    // curves and shapes are clipped only when a scene shares the svg
    const clipped = view.scene ? { 'clip-path': `url(#${uid}-clip)` } : {}
    const pts = []
    const dots = []
    const seg = (x1, y1, x2, y2) => {
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 6))
      for (let i = 0; i <= n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n])
    }
    seg(view.ox, Y(0), view.w, Y(0))
    seg(X(0), view.oy, X(0), view.h)
    const layer = (type) => spec.items.filter((i) => i.type === type)
    const body = el('g', clipped, svg)

    for (const a of layer('area')) {
      const pts = []
      const n = 160
      for (let i = 0; i <= n; i++) { const t = a.from + ((a.to - a.from) * i) / n; pts.push(a.var === 'x' ? [t, a.hi(t)] : [a.hi(t), t]) }
      for (let i = n; i >= 0; i--) { const t = a.from + ((a.to - a.from) * i) / n; pts.push(a.var === 'x' ? [t, a.lo(t)] : [a.lo(t), t]) }
      el('path', { d: 'M' + pts.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('L') + 'Z', fill: a.color, 'fill-opacity': a.opacity ?? ROLES.region.fillOpacity, stroke: 'none' }, body)
    }
    for (const rs of layer('rects')) {
      const g = el('g', { fill: rs.color || COLORS.strip, 'fill-opacity': rs.opacity ?? ROLES.strip.fillOpacity, stroke: rs.color || COLORS.strip, 'stroke-width': ROLES.strip.lineWidth, 'stroke-opacity': ROLES.strip.lineOpacity }, body)
      for (const [x1, x2, y1, y2] of rs.items) {
        el('rect', { x: X(Math.min(x1, x2)), y: Y(Math.max(y1, y2)), width: Math.abs(X(x2) - X(x1)), height: Math.abs(Y(y1) - Y(y2)) }, g)
      }
    }
    axes(el('g', {}, svg), step)
    const top = el('g', clipped, svg)
    for (const l of layer('line')) {
      seg(X(l.x1), Y(l.y1), X(l.x2), Y(l.y2))
      el('line', { x1: X(l.x1), y1: Y(l.y1), x2: X(l.x2), y2: Y(l.y2), stroke: l.color, 'stroke-width': l.width || 3, 'stroke-dasharray': l.dash ? '9 7' : null, 'stroke-linecap': 'round' }, top)
    }
    for (const c of layer('curve')) {
      const n = 240
      const cp = []
      for (let i = 0; i <= n; i++) cp.push(c.f(c.t[0] + ((c.t[1] - c.t[0]) * i) / n))
      for (let i = 1; i < cp.length; i++) seg(X(cp[i - 1][0]), Y(cp[i - 1][1]), X(cp[i][0]), Y(cp[i][1]))
      el('path', { d: 'M' + cp.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('L'), fill: 'none', stroke: c.color, 'stroke-width': c.width || ROLES.curve.lineWidth, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': c.dash ? '9 7' : null }, top)
    }
    for (const r of layer('rect')) {
      const x = X(Math.min(r.x1, r.x2))
      const y = Y(Math.max(r.y1, r.y2))
      const w = Math.abs(X(r.x2) - X(r.x1))
      const h = Math.abs(Y(r.y1) - Y(r.y2))
      const g = el('g', { class: r.drag ? 'sg-drag' : null, 'data-param': r.drag?.param, 'data-axis': r.drag?.axis }, top)
      seg(x, y, x + w, y); seg(x + w, y, x + w, y + h); seg(x + w, y + h, x, y + h); seg(x, y + h, x, y)
      el('rect', { x, y, width: w, height: h, fill: r.color || COLORS.sel, 'fill-opacity': ROLES.typical.fillOpacity, stroke: r.color || COLORS.sel, 'stroke-width': ROLES.typical.lineWidth }, g)
      if (r.drag) {
        // grip: a round handle on the strip so it reads as draggable
        const gx = r.drag.axis === 'x' ? x + w / 2 : x + w
        const gy = r.drag.axis === 'x' ? y : y + h / 2
        el('circle', { cx: gx, cy: gy, r: 9, fill: '#fff', stroke: r.color || COLORS.sel, 'stroke-width': 3 }, g)
        dots.push([gx, gy])
        el('rect', { x: x - 10, y: y - 10, width: w + 20, height: h + 20, fill: 'transparent' }, g)
      }
    }
    for (const d of layer('dim')) {
      const c = d.color || COLORS.sel
      seg(X(d.from[0]), Y(d.from[1]), X(d.to[0]), Y(d.to[1]))
      el('line', { x1: X(d.from[0]), y1: Y(d.from[1]), x2: X(d.to[0]), y2: Y(d.to[1]), stroke: c, 'stroke-width': 2, 'marker-start': `url(#dm${c.slice(1)})`, 'marker-end': `url(#dm${c.slice(1)})` }, top)
    }
    for (const a of layer('arrow')) {
      const c = a.color || COLORS.ink
      const id = 'sa' + c.slice(1)
      if (!defs.querySelector('#' + id)) {
        const mk = el('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 12, markerHeight: 12, orient: 'auto', markerUnits: 'userSpaceOnUse' }, defs)
        el('path', { d: 'M0,0 L10,5 L0,10 z', fill: c }, mk)
      }
      seg(X(a.from[0]), Y(a.from[1]), X(a.to[0]), Y(a.to[1]))
      el('line', { x1: X(a.from[0]), y1: Y(a.from[1]), x2: X(a.to[0]), y2: Y(a.to[1]), stroke: c, 'stroke-width': a.width || 3, 'stroke-linecap': 'round', 'marker-end': `url(#${id})`, 'stroke-dasharray': a.dash ? '7 6' : null }, top)
    }
    for (const p of layer('points')) {
      for (const [x, y] of p.pts) {
        el('circle', p.hollow
          ? { cx: X(x), cy: Y(y), r: p.r || 6, fill: '#fff', stroke: p.color || COLORS.sel, 'stroke-width': 3 }
          : { cx: X(x), cy: Y(y), r: p.r || 6, fill: p.color || COLORS.sel, stroke: '#fff', 'stroke-width': 2 }, top)
        dots.push([X(x), Y(y)])
      }
    }
    for (const hd of layer('handle')) {
      const g = el('g', { class: 'sg-drag', 'data-param': hd.drag.param, 'data-axis': hd.drag.axis }, svg)
      el('circle', { cx: X(hd.x), cy: Y(hd.y), r: 18, fill: 'transparent' }, g)
      el('circle', { cx: X(hd.x), cy: Y(hd.y), r: hd.r || 9, fill: '#fff', stroke: hd.color || COLORS.sel, 'stroke-width': 3.5 }, g)
      dots.push([X(hd.x), Y(hd.y)])
    }
    // tick numbers crossed by a curve or line are hidden rather than overprinted
    const ticks = []
    for (const t of svg.querySelectorAll('.sg-tick')) {
      const b = t.getBBox()
      const r = { l: b.x, t: b.y, r: b.x + b.width, b: b.y + b.height, el: t }
      if (pts.some(([x, y]) => x > r.l - 2 && x < r.r + 2 && y > r.t - 2 && y < r.b + 2)) t.style.visibility = 'hidden'
      else ticks.push(r)
    }
    geo = { pts, dots, ticks }
    placeLabels()
  }

  // Labels live in an overlay over the graph's rectangle only, so they never drift into a scene.
  function placeLabels() {
    const { ox, oy } = view
    const shift = (list) => list.map(([x, y]) => [x - ox, y - oy])
    labeller.place({
      labels: spec.labels,
      toPx: (x, y) => ({ x: X(x) - ox, y: Y(y) - oy }),
      w: view.gw, h: view.gh,
      pts: shift(geo.pts), dots: shift(geo.dots),
      ticks: (geo.ticks || []).map((q) => ({ ...q, l: q.l - ox, r: q.r - ox, t: q.t - oy, b: q.b - oy })),
      view,
    })
  }

  // dragging the typical strip: capture on the svg, report the math coordinate to the shell
  function pointer(e) {
    const r = svg.getBoundingClientRect()
    return toMath(e.clientX - r.left, e.clientY - r.top)
  }
  svg.addEventListener('pointerdown', (e) => {
    const g = e.target.closest('.sg-drag')
    if (!g) return
    drag = { param: g.dataset.param, axis: g.dataset.axis }
    svg.setPointerCapture(e.pointerId)
    svg.classList.add('dragging')
    const p = pointer(e)
    onDrag(drag.param, drag.axis === 'x' ? p.x : p.y)
    e.preventDefault()
  })
  svg.addEventListener('pointermove', (e) => {
    if (drag === null) return
    const p = pointer(e)
    onDrag(drag.param, drag.axis === 'x' ? p.x : p.y)
  })
  const end = (e) => {
    if (drag === null) return
    drag = null
    svg.classList.remove('dragging')
    try { svg.releasePointerCapture(e.pointerId) } catch { /* already released */ }
  }
  svg.addEventListener('pointerup', end)
  svg.addEventListener('pointercancel', end)

  const ro = new ResizeObserver(() => { if (fit()) draw() })
  ro.observe(host)
  // label boxes change size when the math fonts arrive: place them again then
  const refont = () => { if (view) placeLabels() }
  document.fonts?.ready.then(refont)
  document.fonts?.addEventListener?.('loadingdone', refont)

  return {
    engine: 'svg',
    apply(next) {
      const changedAxes = JSON.stringify(spec.axes) !== JSON.stringify(next.axes)
      const hadScene = !!spec.scene
      spec = { items: next.items || [], labels: next.labels || [], axes: next.axes, scene: next.scene }
      if (hadScene !== !!spec.scene) want = null
      svg.setAttribute('aria-label', next.description || 'Function graph')
      if (changedAxes || JSON.stringify(next.bounds) !== JSON.stringify(want)) {
        want = next.bounds
        fit()
      } else if (!view) fit()
      draw()
    },
    clear() {
      spec = { items: [], labels: [] }
      draw()
    },
    destroy() {
      ro.disconnect()
      document.fonts?.removeEventListener?.('loadingdone', refont)
      svg.remove()
      ov.remove()
      labeller.clear()
    },
  }
}
