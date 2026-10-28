// A vertical pH strip on the graph's own vertical scale, with foods placed at their pH and a marker
// that follows the slider once the model is revealed.
//   drawPhStrip(api, { foods, marker, top })
//   foods: [{ name, pH, color }]; marker: pH value or null; top: the pH at the top of the strip.
import { PALETTE as P, label } from './shared.js'

const stripColor = (p) => {
  // red (acid) through orange, yellow and green to blue (neutral and up)
  const stops = [[0, [214, 40, 40]], [2, [232, 112, 40]], [4, [245, 190, 46]], [6, [120, 190, 70]], [7, [70, 170, 120]], [8, [40, 120, 190]]]
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i][0]) {
      const [p0, c0] = stops[i - 1]
      const [p1, c1] = stops[i]
      const f = (p - p0) / (p1 - p0)
      return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * f)).join(',')})`
    }
  }
  return 'rgb(40,120,190)'
}

export function drawPhStrip(api, { foods = [], marker = null, top = 8 }) {
  const { x, y, w, h, Y } = api
  const g = api.el('g', {})
  api.el('rect', { x, y, width: w, height: h, rx: 10, fill: '#f6f8fa' }, g)
  const sx = x + w * 0.64
  const sw = 26
  const steps = 80
  for (let i = 0; i < steps; i++) {
    const p0 = (top * i) / steps
    const p1 = (top * (i + 1)) / steps
    api.el('rect', { x: sx, y: Y(p1), width: sw, height: Y(p0) - Y(p1) + 0.6, fill: stripColor((p0 + p1) / 2) }, g)
  }
  api.el('rect', { x: sx, y: Y(top), width: sw, height: Y(0) - Y(top), fill: 'none', stroke: P.ink, 'stroke-width': 2, rx: 4 }, g)
  for (let p = 0; p <= top; p += 1) {
    api.el('line', { x1: sx + sw, x2: sx + sw + 7, y1: Y(p), y2: Y(p), stroke: P.muted, 'stroke-width': 1.5 }, g)
    label(api, g, sx + sw + 10, Y(p) + 4, String(p), { size: 11 })
  }
  label(api, g, sx + sw / 2, Y(top) - 12, 'pH', { size: 13, weight: 700, fill: P.ink, anchor: 'middle' })
  for (const f of foods) {
    const fy = Y(f.pH)
    api.el('line', { x1: x + w * 0.4, x2: sx, y1: fy, y2: fy, stroke: f.color, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, g)
    api.el('circle', { cx: x + w * 0.3, cy: fy, r: 15, fill: f.color, stroke: '#fff', 'stroke-width': 3 }, g)
    label(api, g, x + 12, fy - 22, f.name, { size: 13, weight: 700, fill: P.ink })
    label(api, g, x + w * 0.3 + 22, fy + 5, `pH ${f.pH.toFixed(1)}`, { size: 13, weight: 600, fill: P.ink })
  }
  if (marker !== null) {
    const my = Y(marker)
    api.el('path', { d: `M ${sx - 4} ${my} l -14 -9 l 0 18 z`, fill: P.sel, stroke: '#fff', 'stroke-width': 1.5 }, g)
    label(api, g, sx - 22, my - 12, `pH ${marker.toFixed(2)}`, { size: 12, weight: 700, fill: '#7a4500', anchor: 'end' })
  }
}
