// Function and strip labels for every graph engine, in the house style: white box, thin rounded
// black border, text in the curve's colour (plain: true drops the border, for marks such as Δx).
//
// Placement is ported from labkit.js (aasl-online-lesson-deck). Each label names an anchor (x, y) and
// a preferred direction (pos). On every draw it takes the first direction, from its preference then
// the rest, whose box clears every drawn line, curve, point, tick number and earlier label. Fixed
// labels (fixed: true) keep their direction and are placed first, so the others move around them.
// A tick number under a placed label is hidden rather than overprinted.
//
// What to avoid comes in pixels: pts (points sampled along every stroke), dots (points and handles),
// ticks (tick-number boxes { l, t, r, b, el }). avoidPoints() builds pts and dots from math shapes.
// A label's x may be 'left' or 'right' (y 'top' or 'bottom') to pin it to that edge of the view.

const DIRS = ['ne', 'nw', 'se', 'sw', 'n', 's', 'e', 'w', 'n>', 'n<', 's>', 's<', 'e^', 'ev', 'w^', 'wv', 'e^^', 'evv', 'w^^', 'wvv', 'n>>', 'n<<', 's>>', 's<<']

function candidate(dir, px, py, w, h, gap) {
  return {
    ne: [px + gap, py - gap - h], nw: [px - gap - w, py - gap - h], se: [px + gap, py + gap], sw: [px - gap - w, py + gap],
    n: [px - w / 2, py - gap - h], s: [px - w / 2, py + gap], e: [px + gap, py - h / 2], w: [px - gap - w, py - h / 2], c: [px - w / 2, py - h / 2],
    'n>': [px + w * 0.1, py - gap - h], 'n<': [px - w * 1.1, py - gap - h], 's>': [px + w * 0.1, py + gap], 's<': [px - w * 1.1, py + gap],
    'e^': [px + gap, py - h * 1.3], ev: [px + gap, py + h * 0.3], 'w^': [px - gap - w, py - h * 1.3], wv: [px - gap - w, py + h * 0.3],
    'e^^': [px + gap, py - h * 2.6], evv: [px + gap, py + h * 1.6], 'w^^': [px - gap - w, py - h * 2.6], wvv: [px - gap - w, py + h * 1.6],
    'n>>': [px + w * 0.7, py - gap - h], 'n<<': [px - w * 1.7, py - gap - h], 's>>': [px + w * 0.7, py + gap], 's<<': [px - w * 1.7, py + gap],
  }[dir]
}

// Math shapes to pixel points. Shapes:
//   { curve: (t) => [x, y], t: [a, b] }   { seg: [x1, y1, x2, y2] }   { rect: [x1, x2, y1, y2] }   { pt: [x, y] }
export function avoidPoints(shapes, toPx) {
  const pts = []
  const dots = []
  const seg = (a, b) => {
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 6))
    for (let i = 0; i <= n; i++) pts.push([a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n])
  }
  for (const s of shapes || []) {
    if (s.curve) {
      const n = 160
      let prev = null
      for (let i = 0; i <= n; i++) {
        const [x, y] = s.curve(s.t[0] + ((s.t[1] - s.t[0]) * i) / n)
        const p = toPx(x, y)
        if (prev) seg(prev, p)
        prev = p
      }
    } else if (s.seg) {
      const [x1, y1, x2, y2] = s.seg
      seg(toPx(x1, y1), toPx(x2, y2))
    } else if (s.rect) {
      const [x1, x2, y1, y2] = s.rect
      const a = toPx(x1, y1), b = toPx(x2, y1), c = toPx(x2, y2), d = toPx(x1, y2)
      seg(a, b); seg(b, c); seg(c, d); seg(d, a)
    } else if (s.pt) {
      const p = toPx(s.pt[0], s.pt[1])
      dots.push([p.x, p.y])
    }
  }
  return { pts, dots }
}

export function createLabeller(ov, renderLabel) {
  const labelEls = new Map()

  // view (optional): the visible math bounds. A label's x may be 'left' or 'right' and its y 'top' or
  // 'bottom', to stay pinned to that edge of the view when a zoomable scene is panned or zoomed.
  function place({ labels, toPx, w, h, pts = [], dots = [], ticks = [], view = null }) {
    const edge = (v, lo, hi) => (v === 'left' || v === 'bottom' ? lo + (hi - lo) * 0.015 : v === 'right' || v === 'top' ? hi - (hi - lo) * 0.015 : v)
    const seen = new Set()
    const taken = []
    const m = 5
    const clash = (r) => {
      let n = 0
      for (const [x, y] of pts) if (x > r.l - m && x < r.r + m && y > r.t - m && y < r.b + m) n++
      for (const [x, y] of dots) if (x > r.l - 14 && x < r.r + 14 && y > r.t - 14 && y < r.b + 14) n += 20
      for (const q of taken) if (r.l < q.r + 2 && q.l < r.r + 2 && r.t < q.b + 2 && q.t < r.b + 2) n += 500 // never on another label
      for (const q of ticks) if (r.l < q.r + 2 && q.l < r.r + 2 && r.t < q.b + 2 && q.t < r.b + 2) n += 0.3
      if (r.l < 4 || r.t < 4 || r.r > w - 4 || r.b > h - 4) n += 200
      return n
    }
    const ordered = [...(labels || [])].sort((a, b) => (b.fixed ? 1 : 0) - (a.fixed ? 1 : 0))
    for (const lb of ordered) {
      seen.add(lb.id)
      let node = labelEls.get(lb.id)
      if (!node) {
        node = document.createElement('div')
        node.className = 'dl'
        ov.append(node)
        labelEls.set(lb.id, node)
      }
      if (node.dataset.html !== lb.html) {
        node.innerHTML = renderLabel(lb.html)
        node.dataset.html = lb.html
      }
      node.style.color = lb.color || '#0e2233'
      node.classList.toggle('plain', !!lb.plain)
      const ex = view ? edge(lb.x, view.left, view.right) : lb.x
      const ey = view ? edge(lb.y, view.bottom, view.top) : lb.y
      if (typeof ex !== 'number' || typeof ey !== 'number') continue
      const p = toPx(ex, ey)
      const out = !p || p.x < -4 || p.y < -4 || p.x > w + 4 || p.y > h + 4
      node.hidden = out
      if (out) continue
      const nw = node.offsetWidth
      const nh = node.offsetHeight
      const gap = Math.max(nh * 0.25, 10)
      const pref = lb.pos || 'ne'
      const order = lb.fixed ? [pref] : [pref, ...DIRS.filter((q) => q !== pref && q[0] === pref[0]), ...DIRS.filter((q) => q[0] !== pref[0])]
      let best = null
      for (const dir of order) {
        const [l, t] = candidate(dir, p.x, p.y, nw, nh, gap)
        const r = { l, t, r: l + nw, b: t + nh }
        const n = clash(r)
        if (!best || n < best.n) best = { r, n }
        if (n === 0) break
      }
      const left = Math.max(4, Math.min(w - nw - 4, best.r.l))
      const top = Math.max(4, Math.min(h - nh - 4, best.r.t))
      node.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`
      const r = { l: left, t: top, r: left + nw, b: top + nh }
      taken.push(r)
      for (const q of ticks) if (q.el && r.l < q.r + 4 && q.l < r.r + 4 && r.t < q.b + 4 && q.t < r.b + 4) q.el.style.visibility = 'hidden'
    }
    for (const [id, node] of labelEls) {
      if (!seen.has(id)) {
        node.remove()
        labelEls.delete(id)
      }
    }
  }

  return { place, clear: () => labelEls.clear() }
}
