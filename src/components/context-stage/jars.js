// Cylindrical jars full of jelly beans, drawn to scale: a 10 cm reference jar and a jar that grows.
//   drawJars(api, { jar: { h, w, N, filled }, ref: { h, w, N }, maxCm, target })
//   h, w in cm; N beans; target: { h, w } draws a dashed empty jar with a question mark (prediction).
// Beans are a fixed size on screen, so a bigger jar holds visibly more of them; the count is written above.
import { PALETTE as P, BEANS, label, rand } from './shared.js'

function beans(api, parent, x0, y0, bw, bh, salt) {
  const sx = 10.5
  const sy = 7.2
  const cols = Math.max(1, Math.floor((bw - 6) / sx))
  const rows = Math.max(1, Math.floor((bh - 4) / sy))
  const ox = x0 + (bw - cols * sx) / 2 + sx / 2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * 131 + c + salt * 7919
      const cx = ox + c * sx + (r % 2 ? sx / 2 : 0) + (rand(id) - 0.5) * 2.5
      if (cx > x0 + bw - 5) continue
      const cy = y0 + bh - 4 - r * sy - (rand(id, 1) - 0.5) * 2
      api.el('ellipse', { cx, cy, rx: 5, ry: 3.3, fill: BEANS[Math.floor(rand(id, 2) * BEANS.length)], transform: `rotate(${Math.round(rand(id, 5) * 160 - 80)} ${cx.toFixed(1)} ${cy.toFixed(1)})` }, parent)
    }
  }
}

function jar(api, g, cx, base, ppc, j, { dashed = false, salt = 0, title = '' } = {}) {
  const bw = j.w * ppc
  const bh = j.h * ppc
  const x0 = cx - bw / 2
  const y0 = base - bh
  const clipId = `jarclip-${salt}`
  const cp = api.el('clipPath', { id: clipId }, g)
  api.el('rect', { x: x0, y: y0, width: bw, height: bh, rx: Math.min(12, bw / 5) }, cp)
  api.el('rect', { x: x0, y: y0, width: bw, height: bh, rx: Math.min(12, bw / 5), fill: dashed ? '#fff' : '#eef6fb' }, g)
  if (j.filled) {
    const inner = api.el('g', { 'clip-path': `url(#${clipId})` }, g)
    beans(api, inner, x0, y0, bw, bh, salt)
  }
  // glass highlight and outline
  api.el('rect', { x: x0 + bw * 0.08, y: y0 + 6, width: Math.max(3, bw * 0.05), height: Math.max(0, bh - 14), rx: 3, fill: '#fff', opacity: 0.55 }, g)
  api.el('rect', { x: x0, y: y0, width: bw, height: bh, rx: Math.min(12, bw / 5), fill: 'none', stroke: dashed ? P.muted : '#6f93ab', 'stroke-width': dashed ? 2 : 2.5, 'stroke-dasharray': dashed ? '7 5' : null }, g)
  // lid
  api.el('rect', { x: x0 - 3, y: y0 - 9, width: bw + 6, height: 9, rx: 3, fill: dashed ? 'none' : P.coral, stroke: dashed ? P.muted : '#b23b1c', 'stroke-width': 1.5, 'stroke-dasharray': dashed ? '5 4' : null }, g)
  // dimensions
  const dimC = '#7a4500'
  api.el('line', { x1: x0 - 12, x2: x0 - 12, y1: y0, y2: base, stroke: dimC, 'stroke-width': 1.5 }, g)
  for (const yy of [y0, base]) api.el('line', { x1: x0 - 17, x2: x0 - 7, y1: yy, y2: yy, stroke: dimC, 'stroke-width': 1.5 }, g)
  label(api, g, x0 - 17, (y0 + base) / 2 + 5, `${+j.h.toFixed(1)} cm`, { size: 13, weight: 600, fill: dimC, anchor: 'end' })
  api.el('line', { x1: x0, x2: x0 + bw, y1: base + 12, y2: base + 12, stroke: dimC, 'stroke-width': 1.5 }, g)
  for (const xx of [x0, x0 + bw]) api.el('line', { x1: xx, x2: xx, y1: base + 7, y2: base + 17, stroke: dimC, 'stroke-width': 1.5 }, g)
  label(api, g, cx, base + 32, `${+j.w.toFixed(1)} cm`, { size: 13, weight: 600, fill: dimC, anchor: 'middle' })
  if (dashed) label(api, g, cx, y0 + bh / 2 + 14, '?', { size: Math.min(48, bh / 2), weight: 700, fill: P.muted, anchor: 'middle' })
  const count = j.N === undefined ? '' : `${Math.round(j.N).toLocaleString('en-US')} beans`
  if (title || count) label(api, g, cx, y0 - 16, [title, count].filter(Boolean).join(': '), { size: 14, weight: 700, fill: P.ink, anchor: 'middle' })
}

export function drawJars(api, { jar: big, ref, maxCm = 20, target = null }) {
  const { x, y, w, h } = api
  const g = api.el('g', {})
  api.el('rect', { x, y, width: w, height: h, fill: '#f7fafc', rx: 10 }, g)
  const base = y + h - 46
  // shelf
  api.el('rect', { x: x + 8, y: base, width: w - 16, height: 8, rx: 3, fill: P.bench }, g)
  // room on the left of each jar for its height label (about 58 px)
  const margin = 58
  const ppc = Math.min((h - 120) / maxCm, (w - 3 * margin - 16) / (maxCm + ref.w))
  const refCx = x + margin + (ref.w * ppc) / 2
  jar(api, g, refCx, base, ppc, { ...ref, filled: true }, { salt: 1, title: 'Reference' })
  const cx = refCx + (ref.w * ppc) / 2 + margin + (maxCm * ppc) / 2 + 8
  if (target) jar(api, g, cx, base, ppc, { ...target, filled: false }, { dashed: true, salt: 2 })
  else jar(api, g, cx, base, ppc, big, { salt: 3 })
}
