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
//   { type: 'points', pts: [[x, y], ...], color, r }
// Labels: { id, x, y, html, color, pos, plain, fixed }, placed by kit/labels.js.

import { COLORS, ROLES, ORIGIN, gridStep } from './style.js'
import { createLabeller } from './labels.js'

const NS = 'http://www.w3.org/2000/svg'
const GRID = COLORS.grid
const AXIS = COLORS.ink
const TICK = COLORS.tick
const minus = (s) => String(s).replace('-', '−')
const r2 = (v) => Math.round(v * 100) / 100

export function makeSvgGraph(host, { renderLabel, onDrag }) {
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

  const X = (x) => (x - view.left) * view.ppu
  const Y = (y) => (view.top - y) * view.ppu
  const toMath = (px, py) => ({ x: view.left + px / view.ppu, y: view.top - py / view.ppu })

  function fit() {
    const w = host.clientWidth
    const h = host.clientHeight
    if (!want || !w || !h) return false
    const xr = want.right - want.left
    const yr = want.top - want.bottom
    const ppu = Math.min(w / xr, h / yr)
    const cx = (want.left + want.right) / 2
    const cy = (want.bottom + want.top) / 2
    view = { left: cx - w / ppu / 2, right: cx + w / ppu / 2, bottom: cy - h / ppu / 2, top: cy + h / ppu / 2, ppu, w, h }
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    svg.setAttribute('width', w)
    svg.setAttribute('height', h)
    return true
  }

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag)
    for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v)
    if (parent) parent.append(n)
    return n
  }

  function grid(g) {
    const step = gridStep(view.ppu)
    const gx = el('g', { stroke: GRID, 'stroke-width': ROLES.grid.lineWidth, 'stroke-dasharray': '1.5 3.5', opacity: ROLES.grid.lineOpacity }, g)
    for (let x = Math.ceil(view.left / step) * step; x <= view.right; x += step) if (x !== 0) el('line', { x1: X(x), y1: 0, x2: X(x), y2: view.h }, gx)
    for (let y = Math.ceil(view.bottom / step) * step; y <= view.top; y += step) if (y !== 0) el('line', { x1: 0, y1: Y(y), x2: view.w, y2: Y(y) }, gx)
    return step
  }

  function axes(g, step) {
    const ox = X(0)
    const oy = Y(0)
    const a = el('g', { stroke: AXIS, 'stroke-width': ROLES.axis.lineWidth, fill: 'none' }, g)
    el('line', { x1: 6, y1: oy, x2: view.w - 6, y2: oy, 'marker-start': 'url(#ar)', 'marker-end': 'url(#ar)' }, a)
    el('line', { x1: ox, y1: view.h - 6, x2: ox, y2: 6, 'marker-start': 'url(#ar)', 'marker-end': 'url(#ar)' }, a)
    const t = el('g', { fill: TICK, 'font-family': 'STIX Two Text, Cambria Math, serif', 'font-size': 17 }, g)
    const tk = el('g', { stroke: AXIS, 'stroke-width': 1.4 }, g)
    for (let x = Math.ceil(view.left / step) * step; x <= view.right - 0.6; x += step) {
      if (x === 0 || X(x) < 18) continue
      el('line', { x1: X(x), y1: oy - 4, x2: X(x), y2: oy + 4 }, tk)
      const n = el('text', { class: 'sg-tick', x: X(x), y: oy + 22, 'text-anchor': 'middle', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, t)
      n.textContent = minus(r2(x))
    }
    for (let y = Math.ceil(view.bottom / step) * step; y <= view.top - 0.6; y += step) {
      if (y === 0 || Y(y) > view.h - 18) continue
      el('line', { x1: ox - 4, y1: Y(y), x2: ox + 4, y2: Y(y) }, tk)
      const n = el('text', { class: 'sg-tick', x: ox - 9, y: Y(y) + 6, 'text-anchor': 'end', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, t)
      n.textContent = minus(r2(y))
    }
    const it = el('g', { fill: AXIS, 'font-family': 'STIX Two Text, Cambria Math, serif', 'font-size': 21, 'font-style': 'italic' }, g)
    el('text', { x: view.w - 10, y: oy - 12, 'text-anchor': 'end' }, it).textContent = 'x'
    el('text', { x: ox + 12, y: 22 }, it).textContent = 'y'
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
    el('rect', { x: 0, y: 0, width: view.w, height: view.h, fill: '#fff' }, svg)
    // origin circle sits under everything, so the axes run through it
    el('circle', { cx: X(0), cy: Y(0), r: ORIGIN.radius, fill: 'none', stroke: AXIS, 'stroke-width': ORIGIN.lineWidth }, svg)
    const step = grid(el('g', {}, svg))
    const pts = []
    const dots = []
    const seg = (x1, y1, x2, y2) => {
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 6))
      for (let i = 0; i <= n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n])
    }
    seg(0, Y(0), view.w, Y(0))
    seg(X(0), 0, X(0), view.h)
    const layer = (type) => spec.items.filter((i) => i.type === type)
    const body = el('g', {}, svg)

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
    const top = el('g', {}, svg)
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
    for (const p of layer('points')) {
      for (const [x, y] of p.pts) { el('circle', { cx: X(x), cy: Y(y), r: p.r || 6, fill: p.color || COLORS.sel, stroke: '#fff', 'stroke-width': 2 }, top); dots.push([X(x), Y(y)]) }
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

  function placeLabels() {
    labeller.place({ labels: spec.labels, toPx: (x, y) => ({ x: X(x), y: Y(y) }), w: view.w, h: view.h, ...geo, view })
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
      spec = { items: next.items || [], labels: next.labels || [] }
      if (JSON.stringify(next.bounds) !== JSON.stringify(want)) {
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
