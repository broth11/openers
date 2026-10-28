// A laptop and a words-per-minute gauge on the graph's own vertical scale. The screen fills with
// text as the typist speeds up; the gauge level lines up with the speed on the graph beside it.
//   drawTyping(api, { S, h, top })
//   S: words per minute; h: hours of practice; top: the speed at the top of the gauge.
import { PALETTE as P, label, rand } from './shared.js'

export function drawTyping(api, { S, h, top = 80 }) {
  const { x, y, w, h: sh, Y } = api
  const g = api.el('g', {})
  const base = Y(0)
  const tall = Y(0) - Y(top)
  api.el('rect', { x, y, width: w, height: sh, rx: 10, fill: '#f1f6fa' }, g)
  // laptop screen
  const lx = x + w * 0.06
  const lw = w * 0.56
  const scrH = tall * 0.42
  const scrY = base - scrH - 14
  api.el('rect', { x: lx, y: scrY, width: lw, height: scrH, rx: 6, fill: '#fff', stroke: P.ink, 'stroke-width': 3 }, g)
  const lines = Math.max(1, Math.min(8, Math.round(S / 10)))
  const lh = (scrH - 16) / 8
  for (let i = 0; i < lines; i++) {
    const frac = 0.45 + 0.5 * rand(i, 7)
    api.el('rect', { x: lx + 8, y: scrY + 8 + i * lh, width: (lw - 16) * (i === lines - 1 ? 0.5 : frac), height: lh * 0.45, rx: 2, fill: P.teal, opacity: 0.55 }, g)
  }
  // keyboard base with keys
  const kb = api.el('path', { d: `M ${lx - 8} ${base - 14} L ${lx + lw + 8} ${base - 14} L ${lx + lw - 6} ${base + 4} L ${lx + 6} ${base + 4} Z`, fill: '#d6dee6', stroke: P.ink, 'stroke-width': 2 }, g)
  void kb
  for (let r = 0; r < 2; r++) for (let c = 0; c < 9; c++) {
    api.el('rect', { x: lx + 12 + c * ((lw - 24) / 9), y: base - 11 + r * 7, width: (lw - 24) / 9 - 3, height: 4, rx: 1, fill: '#fff' }, g)
  }
  // gauge on the graph's scale
  const gx = x + w * 0.76
  const gw = 16
  api.el('rect', { x: gx, y: Y(top), width: gw, height: tall, rx: 5, fill: '#fff', stroke: P.wallEdge, 'stroke-width': 2 }, g)
  const fillTop = Y(Math.max(0, Math.min(top, S)))
  api.el('rect', { x: gx + 3, y: fillTop, width: gw - 6, height: Math.max(0, base - fillTop), fill: P.sel }, g)
  for (let v = 0; v <= top; v += 20) {
    api.el('line', { x1: gx + gw, x2: gx + gw + 7, y1: Y(v), y2: Y(v), stroke: P.muted, 'stroke-width': 1.5 }, g)
    label(api, g, gx + gw + 10, Y(v) + 4, String(v), { size: 11 })
  }
  label(api, g, gx + gw / 2, Y(top) - 8, 'wpm', { size: 12, weight: 700, fill: P.ink, anchor: 'middle' })
  label(api, g, x + 12, y + 26, `${h < 10 ? h.toFixed(1) : Math.round(h)} h of practice`, { size: 16, weight: 700, fill: P.ink, mono: true })
  label(api, g, x + 12, y + 48, `${S.toFixed(1)} wpm`, { size: 15, weight: 700, fill: '#7a4500', mono: true })
}
