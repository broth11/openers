// Inverse square law experiment: a lamp, a light meter on a metre rule, and (optional) the
// square-spread diagram: the light through 1 square at d covers 4 squares at 2d and 9 squares at 3d.
//   drawLamp(api, { d, I, maxD, spread, unitLabel })
import { PALETTE as P, label } from './shared.js'

// Squares drawn in an oblique view, perpendicular to the beam.
function spreadDiagram(api, g, x0, y0, w, h) {
  const bulb = [x0 + 26, y0 + h * 0.5]
  const a = (w - 80) / 3.55
  const s = Math.min((h - 46) / 3 / 1.25, a * 0.6)
  const pt = (X, cy, u, v) => [X + v * 0.42, cy - u + v * 0.32]
  const big = []
  for (let k = 1; k <= 3; k++) {
    const X = bulb[0] + k * a
    const H = s * k
    const cy = bulb[1]
    const c = (u, v) => pt(X, cy, u, v)
    const corners = [c(-H / 2, -H / 2), c(H / 2, -H / 2), c(H / 2, H / 2), c(-H / 2, H / 2)]
    if (k === 3) big.push(...corners)
    api.el('polygon', { points: corners.map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' '), fill: P.light, 'fill-opacity': 0.28 + 0.12 * (4 - k), stroke: '#b98a00', 'stroke-width': 1.6 }, g)
    for (let i = 1; i < k; i++) {
      const t = -H / 2 + (H * i) / k
      const l1 = [c(t, -H / 2), c(t, H / 2)]
      const l2 = [c(-H / 2, t), c(H / 2, t)]
      for (const [p, q] of [l1, l2]) api.el('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: '#b98a00', 'stroke-width': 1 }, g)
    }
    label(api, g, X + H * 0.21, cy + H * 0.5 + H * 0.16 + 18, `${k * k} square${k > 1 ? 's' : ''}`, { size: 13, weight: 700, fill: P.ink, anchor: 'middle' })
    label(api, g, X + H * 0.21, cy + H * 0.5 + H * 0.16 + 34, k === 1 ? 'at d' : `at ${k}d`, { size: 12, fill: P.muted, anchor: 'middle' })
  }
  for (const q of big) api.el('line', { x1: bulb[0], y1: bulb[1], x2: q[0], y2: q[1], stroke: '#b98a00', 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0.8 }, g)
  api.el('circle', { cx: bulb[0], cy: bulb[1], r: 9, fill: P.sun, stroke: '#b98a00', 'stroke-width': 1.5 }, g)
  label(api, g, x0 + 8, y0 + 18, 'Why the square? Twice as far, the same light covers 4 times the area.', { size: 12.5, weight: 600, fill: P.ink })
}

export function drawLamp(api, { d, I, maxD = 6, spread = false, unitLabel = 'lux' }) {
  const { x, y, w, h } = api
  const g = api.el('g', {})
  api.el('rect', { x, y, width: w, height: h, fill: '#f4f6f9', rx: 10 }, g)
  const benchTop = spread ? y + h * 0.56 : y
  const bh = y + h - benchTop
  if (spread) spreadDiagram(api, g, x + 6, y + 6, w - 12, h * 0.52)
  // bench and metre rule
  const left = x + 46
  const ppm = (w - 46 - 34) / maxD
  const deskY = benchTop + bh * (spread ? 0.62 : 0.74)
  api.el('rect', { x: x + 8, y: deskY, width: w - 16, height: 12, rx: 3, fill: P.bench, stroke: P.wood, 'stroke-width': 1 }, g)
  api.el('rect', { x: left, y: deskY - 8, width: maxD * ppm, height: 8, fill: '#fbf3c8', stroke: '#b98a00', 'stroke-width': 1 }, g)
  for (let m = 0; m <= maxD; m++) {
    const X = left + m * ppm
    api.el('line', { x1: X, x2: X, y1: deskY - 8, y2: deskY - 1, stroke: '#7a5b00', 'stroke-width': 1.2 }, g)
    label(api, g, X, deskY + 28, `${m} m`, { size: 12, fill: P.muted, anchor: 'middle' })
  }
  // lamp
  const lampH = Math.min(bh * 0.4, spread ? 90 : 160)
  const bulb = [left, deskY - 8 - lampH]
  api.el('line', { x1: left, x2: left, y1: deskY - 8, y2: bulb[1] + 10, stroke: P.ink, 'stroke-width': 4 }, g)
  api.el('rect', { x: left - 16, y: deskY - 14, width: 32, height: 6, rx: 2, fill: P.ink }, g)
  // meter position and beam
  const mx = left + d * ppm
  const glow = Math.max(0.08, Math.min(1, I / 400))
  const half = Math.min(lampH * 0.5, 44)
  api.el('polygon', { points: `${bulb[0]},${bulb[1]} ${mx},${bulb[1] - half} ${mx},${bulb[1] + half}`, fill: P.light, opacity: 0.18 + 0.5 * glow }, g)
  api.el('circle', { cx: bulb[0], cy: bulb[1], r: 14, fill: P.sun, stroke: '#b98a00', 'stroke-width': 2 }, g)
  api.el('path', { d: `M ${bulb[0] - 18} ${bulb[1] - 8} Q ${bulb[0]} ${bulb[1] - 30} ${bulb[0] + 18} ${bulb[1] - 8} Z`, fill: P.ink }, g)
  // light meter: a box on a stand, its sensor facing the lamp at bulb height
  const mw = 74
  const mh = 64
  const my = bulb[1] - mh / 2
  api.el('line', { x1: mx + mw / 2 - 4, x2: mx + mw / 2 - 4, y1: my + mh, y2: deskY - 8, stroke: P.ink, 'stroke-width': 4 }, g)
  api.el('rect', { x: mx + mw / 2 - 20, y: deskY - 14, width: 32, height: 6, rx: 2, fill: P.ink }, g)
  api.el('rect', { x: mx - 4, y: my, width: mw, height: mh, rx: 8, fill: '#ffffff', stroke: P.ink, 'stroke-width': 2 }, g)
  api.el('circle', { cx: mx - 4, cy: bulb[1], r: 8, fill: P.light, opacity: 0.35 + 0.65 * glow, stroke: P.ink, 'stroke-width': 1.5 }, g)
  api.el('rect', { x: mx + 6, y: my + 9, width: mw - 18, height: 26, rx: 4, fill: '#173042' }, g)
  label(api, g, mx + 6 + (mw - 18) / 2, my + 28, `${+I.toFixed(1)}`, { size: 14, weight: 700, fill: '#9df5c8', anchor: 'middle', mono: true, halo: false })
  label(api, g, mx + 6 + (mw - 18) / 2, my + 53, unitLabel, { size: 12, fill: P.muted, anchor: 'middle' })
  // distance arrow along the rule
  const ay = deskY + 46
  if (d > 0.3) {
    api.el('line', { x1: left, x2: mx, y1: ay, y2: ay, stroke: '#7a4500', 'stroke-width': 1.8 }, g)
    for (const X of [left, mx]) api.el('line', { x1: X, x2: X, y1: ay - 6, y2: ay + 6, stroke: '#7a4500', 'stroke-width': 1.8 }, g)
    label(api, g, (left + mx) / 2, ay + 22, `d = ${+d.toFixed(2)} m`, { size: 14, weight: 700, fill: '#7a4500', anchor: 'middle' })
  }
}
