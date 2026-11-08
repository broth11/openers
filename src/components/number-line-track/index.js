// Number-line track: a horizontal strip with a particle moving along a number line.
// Used above a v-t graph so the motion and the area are seen together. Draws in plain SVG, house colours.
//
// spec = {
//   min, max, step,            number-line range and tick step (position, in metres)
//   s,                         current position
//   v,                         current velocity (the car faces its direction; 0 shows a still dot)
//   trail: [[t, s], ...],      path so far, drawn as a thin trace in two rows: out (right) and back (left)
//   ghost: s,                  optional faded marker (for example the start, or a wrong answer)
//   ghostLabel, ghostColor,
//   odometer: number | null,   distance travelled so far, shown at the right end
//   label: 'O'                 name of the origin
// }
import { COLORS } from '../../kit/style.js'

const NS = 'http://www.w3.org/2000/svg'
const mn = (s) => String(s).replace('-', '−')

export function makeTrack(host) {
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'nlt')
  svg.setAttribute('role', 'img')
  host.append(svg)
  let last = null

  const el = (tag, attrs, parent = svg) => {
    const n = document.createElementNS(NS, tag)
    for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v)
    parent.append(n)
    return n
  }

  function draw(spec) {
    last = spec
    // optional spec.theme (concept visuals): background, ink, ticks, and role colours
    const T = spec.theme || {}
    const R = T.roles || {}
    const K = { ink: T.ink || COLORS.ink, tick: T.tick || COLORS.tick, bg: T.bg || '#fff', teal: R.teal || COLORS.teal, coral: R.coral || COLORS.coral, sel: R.sel || COLORS.sel, muted: R.muted || COLORS.muted }
    const W = host.clientWidth
    const H = host.clientHeight
    if (!W || !H) return
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.replaceChildren()
    svg.setAttribute('aria-label', `Particle at ${spec.s.toFixed(2)} m`)
    const padL = 34
    const narrow = W < 560
    const padR = spec.odometer != null ? (narrow ? 118 : 190) : 34
    const X = (s) => padL + ((s - spec.min) / (spec.max - spec.min)) * (W - padL - padR)
    const yLine = Math.round(H * 0.68)
    const defs = el('defs', {})
    const mk = el('marker', { id: 'nlt-ar', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 9, markerHeight: 9, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, defs)
    el('path', { d: 'M0,1 L10,5 L0,9 z', fill: K.ink }, mk)
    el('rect', { x: 0, y: 0, width: W, height: H, fill: K.bg })

    // the trail: out-going part above the line, back part slightly higher, so a reversal reads
    if (spec.trail?.length > 1) {
      // each change of direction moves the trace up one row (at most three rows)
      let row = 0
      let lastDir = 0
      let prev = spec.trail[0]
      for (let i = 1; i < spec.trail.length; i++) {
        const cur = spec.trail[i]
        const dir = Math.sign(cur[1] - prev[1])
        if (dir && lastDir && dir !== lastDir) row = Math.min(row + 1, 2)
        if (dir) lastDir = dir
        const y = yLine - 18 - row * 11
        el('line', { x1: X(prev[1]), y1: y, x2: X(cur[1]), y2: y, stroke: dir < 0 ? K.coral : K.teal, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-opacity': 0.8 })
        prev = cur
      }
    }

    // number line
    el('line', { x1: padL - 14, y1: yLine, x2: W - padR + 18, y2: yLine, stroke: K.ink, 'stroke-width': 1.6, 'marker-start': 'url(#nlt-ar)', 'marker-end': 'url(#nlt-ar)' })
    const tg = el('g', { fill: K.tick, 'font-family': 'STIX Two Text, Cambria Math, serif', 'font-size': 16, 'text-anchor': 'middle' })
    // thin the ticks until neighbours are at least 30 px apart
    let step = spec.step
    while ((X(step) - X(0)) < 30) step *= 2
    for (let s = Math.ceil(spec.min / step) * step; s <= spec.max + 1e-9; s += step) {
      el('line', { x1: X(s), y1: yLine - 4, x2: X(s), y2: yLine + 4, stroke: K.ink, 'stroke-width': 1.4 })
      el('text', { x: X(s), y: yLine + 22 }, tg).textContent = s === 0 ? (spec.label || 'O') : mn(Math.round(s * 100) / 100)
    }
    el('text', { x: W - padR + 22, y: yLine - 8, fill: K.ink, 'font-family': 'STIX Two Text, serif', 'font-size': 20, 'font-style': 'italic' }).textContent = 's'

    if (spec.ghost != null) {
      const gx = X(spec.ghost)
      el('circle', { cx: gx, cy: yLine, r: 9, fill: 'none', stroke: spec.ghostColor || K.muted, 'stroke-width': 2.5, 'stroke-dasharray': '3 3' })
      if (spec.ghostLabel) el('text', { x: gx, y: yLine - 44, 'text-anchor': 'middle', fill: spec.ghostColor || K.muted, 'font-family': 'Lexend, system-ui, sans-serif', 'font-size': 14, 'font-weight': 600 }).textContent = spec.ghostLabel
    }

    // the particle: a dot with a direction arrow
    const px = X(spec.s)
    if (Math.abs(spec.v) > 0.05) {
      const d = Math.sign(spec.v)
      el('line', { x1: px + d * 14, y1: yLine - 58, x2: px + d * 44, y2: yLine - 58, stroke: d > 0 ? K.teal : K.coral, 'stroke-width': 3, 'marker-end': 'url(#nlt-ar)' })
    }
    el('circle', { cx: px, cy: yLine, r: 11, fill: K.sel, stroke: K.ink, 'stroke-width': 1.5 })

    if (spec.odometer != null) {
      const bw = narrow ? 88 : 128
      const ox = W - bw - 4
      el('rect', { x: ox, y: yLine - 34, width: bw, height: 46, rx: 8, fill: K.bg, stroke: K.ink, 'stroke-width': 1.2 })
      el('text', { x: ox + bw / 2, y: yLine - 18, 'text-anchor': 'middle', fill: K.muted, 'font-family': 'Lexend, system-ui, sans-serif', 'font-size': 12 }).textContent = 'odometer'
      el('text', { x: ox + bw / 2, y: yLine + 4, 'text-anchor': 'middle', fill: K.ink, 'font-family': 'JetBrains Mono, monospace', 'font-size': narrow ? 15 : 18, 'font-weight': 700 }).textContent = `${spec.odometer.toFixed(2)} m`
    }
  }

  const ro = new ResizeObserver(() => { if (last) draw(last) })
  ro.observe(host)
  return { apply: draw, destroy() { ro.disconnect(); svg.remove() } }
}
