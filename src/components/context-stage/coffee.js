// A cup of coffee cooling on a table, with a thermometer on the graph's own vertical scale, so the
// mercury lines up with the temperature on the graph beside it. Steam fades as the coffee cools.
//   drawCoffee(api, { T, t, top })
//   T: temperature in degrees C; t: minutes; top: the temperature at the top of the thermometer.
import { PALETTE as P, label } from './shared.js'

export function drawCoffee(api, { T, t, top = 100 }) {
  const { x, y, w, h, Y } = api
  const g = api.el('g', {})
  const base = Y(0)
  const tall = Y(0) - Y(top)
  // wall and table
  api.el('rect', { x, y, width: w, height: h, rx: 10, fill: '#f7f3ec' }, g)
  api.el('rect', { x, y: base + 8, width: w, height: y + h - base - 8, fill: P.wood, rx: 4 }, g)
  api.el('rect', { x, y: base + 8, width: w, height: 6, fill: P.woodDark }, g)
  // cup
  const cw = Math.min(w * 0.4, tall * 0.34)
  const ch = tall * 0.3
  const cx = x + w * 0.3
  const rimY = base - ch
  api.el('ellipse', { cx, cy: base + 2, rx: cw * 0.72, ry: 6, fill: '#e3ddd2' }, g)
  api.el('path', { d: `M ${cx - cw / 2} ${rimY} L ${cx + cw / 2} ${rimY} L ${cx + cw * 0.36} ${base - 3} Q ${cx} ${base + 5} ${cx - cw * 0.36} ${base - 3} Z`, fill: '#fff', stroke: P.wallEdge, 'stroke-width': 2 }, g)
  api.el('path', { d: `M ${cx + cw / 2 - 2} ${rimY + ch * 0.18} q ${cw * 0.3} 2 ${cw * 0.2} ${ch * 0.34} q ${-cw * 0.06} ${ch * 0.16} ${-cw * 0.3} ${ch * 0.2}`, fill: 'none', stroke: P.wallEdge, 'stroke-width': 4, 'stroke-linecap': 'round' }, g)
  api.el('ellipse', { cx, cy: rimY, rx: cw / 2, ry: 7, fill: '#6b3f24', stroke: P.wallEdge, 'stroke-width': 2 }, g)
  // steam: strongest when hot
  const steam = Math.max(0, Math.min(1, (T - 25) / 67))
  for (let i = 0; i < 3; i++) {
    const sx = cx - cw * 0.22 + i * cw * 0.22
    const sy = rimY - 10
    const hh = 16 + 34 * steam
    api.el('path', { d: `M ${sx} ${sy} q ${-9} ${-hh * 0.3} 0 ${-hh * 0.5} q ${9} ${-hh * 0.3} 0 ${-hh * 0.5}`, fill: 'none', stroke: '#9fb3c4', 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: 0.18 + 0.7 * steam }, g)
  }
  // thermometer on the graph's scale
  const tx = x + w * 0.72
  const tw = 14
  api.el('rect', { x: tx, y: Y(top), width: tw, height: tall, rx: tw / 2, fill: '#fff', stroke: P.wallEdge, 'stroke-width': 2 }, g)
  const mTop = Y(Math.max(0, Math.min(top, T)))
  api.el('rect', { x: tx + 3, y: mTop, width: tw - 6, height: base - mTop + 8, fill: P.coral }, g)
  api.el('circle', { cx: tx + tw / 2, cy: base + 12, r: 11, fill: P.coral, stroke: P.wallEdge, 'stroke-width': 2 }, g)
  for (let v = 0; v <= top; v += 20) {
    api.el('line', { x1: tx + tw, x2: tx + tw + 7, y1: Y(v), y2: Y(v), stroke: P.muted, 'stroke-width': 1.5 }, g)
    label(api, g, tx + tw + 10, Y(v) + 4, String(v), { size: 11 })
  }
  label(api, g, tx + tw / 2, Y(top) - 8, '°C', { size: 12, weight: 700, fill: P.ink, anchor: 'middle' })
  label(api, g, x + 12, y + 26, `t = ${t.toFixed(1)} min`, { size: 17, weight: 700, fill: P.ink, mono: true })
  label(api, g, x + 12, y + 48, `${T.toFixed(1)} °C`, { size: 15, weight: 700, fill: '#7a4500', mono: true })
}
