// A cut-away shopping mall that fills with shoppers. The crowd level sits on the graph's vertical
// scale, so it lines up with the value on the graph beside it.
//   drawMall(api, { V, clock, t, tEnd, roofV, level })
//   V: shoppers inside, in the graph's units (hundreds); roofV: the value at the roof line;
//   level: draw the dashed crowd level and its label.
import { PALETTE as P, PEOPLE, person, label, rand } from './shared.js'

export function drawMall(api, { V, clock, t = 0, tEnd = 10, roofV, level = true, unit = 100 }) {
  const { x, y, w, h, Y } = api
  const g = api.el('g', {})
  const ground = Y(0)
  const dusk = Math.max(0, Math.min(1, (t - tEnd * 0.6) / (tEnd * 0.4)))
  // sky, from day to evening
  api.el('rect', { x, y, width: w, height: ground - y, fill: dusk > 0.5 ? P.night : dusk > 0 ? P.skyDusk : P.sky, rx: 10 }, g)
  const sunX = x + w * (0.12 + 0.76 * Math.min(1, t / tEnd))
  const sunY = y + 70 + Math.sin(Math.PI * Math.min(1, t / tEnd) + Math.PI) * -40 + 40
  api.el('circle', { cx: sunX, cy: sunY, r: 13, fill: dusk > 0.7 ? '#f3f0e0' : P.sun, opacity: 0.9 }, g)
  // car park below ground level
  api.el('rect', { x, y: ground, width: w, height: y + h - ground, fill: P.ground }, g)
  // building
  const bx = x + w * 0.07
  const bw = w * 0.74
  const roof = Y(roofV)
  api.el('rect', { x: bx, y: roof, width: bw, height: ground - roof, fill: P.wall, stroke: P.wallEdge, 'stroke-width': 2 }, g)
  api.el('rect', { x: bx - 6, y: roof - 10, width: bw + 12, height: 10, fill: P.wallEdge, rx: 3 }, g)
  label(api, g, bx + bw / 2, roof - 18, 'MALL', { size: 15, weight: 700, fill: P.ink, anchor: 'middle' })
  // floors
  const floors = 4
  for (let i = 1; i < floors; i++) {
    const fy = ground - ((ground - roof) * i) / floors
    api.el('line', { x1: bx, x2: bx + bw, y1: fy, y2: fy, stroke: P.wallEdge, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, g)
  }
  // shoppers: rows from the ground up to the crowd level
  const top = Y(Math.max(0, V))
  const crowdTop = Math.max(top, roof + 4) // the crowd stops at the roof; the level line does not
  const rh = 15
  const ph = 13
  const cols = Math.max(4, Math.floor((bw - 12) / 11))
  const rows = Math.max(0, (ground - crowdTop) / rh)
  const crowd = api.el('g', {}, g)
  for (let r = 0; r < Math.ceil(rows); r++) {
    const fill = Math.min(1, rows - r)
    const n = Math.round(cols * fill)
    for (let i = 0; i < n; i++) {
      const id = r * 97 + i
      const px = bx + 8 + ((bw - 16) * (i + 0.5)) / cols + (rand(id) - 0.5) * 4
      const py = ground - 2 - r * rh
      person(api, crowd, px, py, ph, PEOPLE[Math.floor(rand(id, 3) * PEOPLE.length)])
    }
  }
  // doors
  api.el('rect', { x: bx + bw / 2 - 16, y: ground - 24, width: 32, height: 24, fill: P.glass, stroke: P.wallEdge, 'stroke-width': 1.5 }, g)
  // crowd level, on the graph's scale
  if (level && V > 0) {
    api.el('line', { x1: bx, x2: x + w, y1: top, y2: top, stroke: P.sel, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, g)
    const count = Math.round(V * unit).toLocaleString('en-US').replace(/,/g, ' ')
    label(api, g, bx + bw + 6, top - 8, `${count}`, { size: 14, weight: 700, fill: '#7a4500' })
    label(api, g, bx + bw + 6, top + 16, 'inside', { size: 12, fill: '#7a4500' })
  }
  // clock
  api.el('rect', { x: x + 10, y: y + 10, width: 118, height: 46, rx: 10, fill: '#fff', stroke: P.wallEdge }, g)
  label(api, g, x + 20, y + 28, 'Saturday', { size: 12, fill: P.muted })
  label(api, g, x + 20, y + 50, clock, { size: 20, weight: 700, fill: P.ink, mono: true })
}
