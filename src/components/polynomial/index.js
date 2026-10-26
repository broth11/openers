// Polynomial recap explorer: degree 2, 3, or 4 in factored form y = a(x - p)(x - q)... with draggable
// roots, repeated roots, and (in standard form) a constant that lifts the graph so real roots appear and
// disappear. Draws end-behaviour arrows, turning points, and real roots, and builds the recap cards.
// First used in MAI HL U5 L2 (scene 2). See README.md.
import { COLORS as C } from '../../kit/style.js'
import { fmt, num } from '../../kit/math.js'

// coefficients, highest power first, of a * prod (x - r)
export function expand(a, roots) {
  let c = [a]
  for (const r of roots) {
    const next = new Array(c.length + 1).fill(0)
    for (let i = 0; i < c.length; i++) { next[i] += c[i]; next[i + 1] -= c[i] * r }
    c = next
  }
  return c
}
export const evalPoly = (c) => (x) => c.reduce((acc, v) => acc * x + v, 0)
export const derive = (c) => c.slice(0, -1).map((v, i) => v * (c.length - 1 - i))

// real zeros where the sign changes, found by sampling and bisection
function signChanges(c, lo = -30, hi = 30, n = 6000) {
  const f = evalPoly(c)
  const out = []
  let x0 = lo
  let f0 = f(x0)
  for (let i = 1; i <= n; i++) {
    const x1 = lo + ((hi - lo) * i) / n
    const f1 = f(x1)
    if (f0 === 0) out.push(x0)
    else if (f0 * f1 < 0) {
      let a = x0, b = x1, fa = f0
      for (let j = 0; j < 60; j++) { const m = (a + b) / 2, fm = f(m); if (fa * fm <= 0) b = m; else { a = m; fa = fm } }
      out.push((a + b) / 2)
    }
    x0 = x1
    f0 = f1
  }
  return out
}

// Roots after the repeated-root choice. rep: 'none' | 'double' | 'two' (two doubles, degree 4) | 'triple'.
export function rootsFor(deg, base, rep) {
  const r = base.slice(0, deg)
  if (!repAllowed(deg, rep)) return r
  if (rep === 'double') r[1] = r[0]
  if (rep === 'two' && deg === 4) { r[1] = r[0]; r[3] = r[2] }
  if (rep === 'triple' && deg >= 3) { r[1] = r[0]; r[2] = r[0] }
  return r
}
// The roots a student can drag: one handle per distinct root, named by its parameter.
export function freeHandles(deg, base, rep, names = ['p', 'q', 'r', 's']) {
  const r = rootsFor(deg, base, rep)
  const idx = { none: [0, 1, 2, 3], double: [0, 2, 3], two: [0, 2], triple: [0, 3] }[repAllowed(deg, rep) ? rep : 'none'].filter((i) => i < deg)
  return idx.map((i) => ({ x: r[i], param: names[i] }))
}
export function repAllowed(deg, rep) {
  if (rep === 'two') return deg === 4
  if (rep === 'triple') return deg >= 3
  return true
}

// Group equal roots: [{ x, m }]
function multiplicities(roots) {
  const out = []
  for (const r of [...roots].sort((a, b) => a - b)) {
    const g = out.find((q) => Math.abs(q.x - r) < 1e-9)
    if (g) g.m++
    else out.push({ x: r, m: 1 })
  }
  return out
}

// Facts about the polynomial on screen
export function analyse({ a, roots, shift = 0 }) {
  const c = expand(a, roots)
  c[c.length - 1] += shift
  const f = evalPoly(c)
  let real
  if (Math.abs(shift) < 1e-12) real = multiplicities(roots)
  else {
    // sign changes, plus touching zeros where the derivative also vanishes
    const sc = signChanges(c).map((x) => ({ x, m: 1 }))
    const touch = signChanges(derive(c)).filter((x) => Math.abs(f(x)) < 1e-9).map((x) => ({ x, m: 2 }))
    real = [...sc, ...touch].sort((p, q) => p.x - q.x)
  }
  const turning = signChanges(derive(c)).map((x) => [x, f(x)])
  return { c, f, real, turning }
}

const term = (v, p, first) => {
  if (Math.abs(v) < 1e-9) return ''
  const sign = v < 0 ? '-' : first ? '' : '+'
  const mag = Math.abs(v)
  const coef = p > 0 && Math.abs(mag - 1) < 1e-9 ? '' : num(mag, 2)
  const x = p === 0 ? '' : p === 1 ? 'x' : `x^{${p}}`
  return `${sign}${coef}${x}`
}
export function standardTex(c) {
  let s = ''
  const n = c.length - 1
  c.forEach((v, i) => { s += term(v, n - i, s === '') })
  return `y=${s || '0'}`
}
const factor = (r) => (Math.abs(r) < 1e-9 ? 'x' : r < 0 ? `(x+${num(-r, 2)})` : `(x-${num(r, 2)})`)
export function factoredTex(a, roots) {
  const groups = multiplicities(roots)
  const lead = Math.abs(a - 1) < 1e-9 ? '' : Math.abs(a + 1) < 1e-9 ? '-' : num(a, 2)
  return `y=${lead}${groups.map((g) => (g.m > 1 ? `${factor(g.x)}^{${g.m}}` : factor(g.x))).join('')}`
}

export function polyGraph({ deg, a, roots, shift = 0, form, handles = [] }) {
  const { f, real, turning } = analyse({ deg, a, roots, shift })
  const L = 5.6
  const T = 7
  const items = []
  const labels = []
  // end behaviour: an arrow on each tail of the curve, from where it passes 0.55T to where it leaves the window
  const rightUp = a > 0
  const leftUp = deg % 2 === 0 ? rightUp : !rightUp
  const features = [...real.map((r) => r.x), ...turning.map(([x]) => x)]
  if (!features.length) features.push(0)
  const arrows = []
  for (const [dir, up, id] of [[1, rightUp, 'r'], [-1, leftUp, 'l']]) {
    // walk out from the last root or turning point to where the curve leaves the window, then back a little
    const start = dir > 0 ? Math.max(...features) : Math.min(...features)
    let x2 = start
    for (let i = 0; i < 4000 && Math.abs(f(x2)) < T * 0.96; i++) x2 += dir * 0.005
    if (Math.abs(x2 - start) < 0.05) continue
    let x = x2
    for (let i = 0; i < 4000 && Math.abs(f(x)) > T * 0.55 && Math.abs(x - start) > 0.02 && Math.abs(x2 - x) < 1.2; i++) x -= dir * 0.005
    arrows.push([dir, up, id, x, x2])
  }
  for (const [dir, up, id, x, x2] of arrows) {
    const off = dir * 0.28
    items.push({ type: 'arrow', from: [x + off, f(x)], to: [x2 + off, f(x2)], color: C.coral, width: 4 })
    labels.push({ id: `end-${id}`, x: x2 + off, y: f(x2), html: up ? (dir > 0 ? '$x\\to\\infty,\\ y\\to\\infty$' : '$x\\to-\\infty,\\ y\\to\\infty$') : (dir > 0 ? '$x\\to\\infty,\\ y\\to-\\infty$' : '$x\\to-\\infty,\\ y\\to-\\infty$'), color: C.coral, pos: dir > 0 ? (up ? 'se' : 'ne') : (up ? 'sw' : 'nw'), plain: true })
  }
  items.push({ type: 'curve', f: (x) => [x, Math.max(-T * 3, Math.min(T * 3, f(x)))], t: [-L - 1, L + 1], color: C.teal })
  if (turning.length) items.push({ type: 'points', pts: turning.filter(([x, y]) => Math.abs(x) < L && Math.abs(y) < T), color: C.strip, r: 7 })
  const shown = real.filter((r) => Math.abs(r.x) < L)
  const hs = form === 'fact' ? handles : []
  items.push({ type: 'points', pts: shown.filter((r) => !hs.some((h) => Math.abs(h.x - r.x) < 1e-9)).map((r) => [r.x, 0]), color: C.sel, r: 7 })
  for (const h of hs) items.push({ type: 'handle', x: h.x, y: 0, color: C.sel, drag: { param: h.param, axis: 'x' }, r: 10 })
  for (const r of shown) if (r.m > 1) labels.push({ id: `m-${r.x.toFixed(3)}`, x: r.x, y: 0, html: r.m === 2 ? 'double' : 'triple', color: C.sel, pos: 's', plain: true, attached: true })
  const tex = form === 'fact' ? factoredTex(a, roots) : standardTex(expand(a, roots).map((v, i, arr) => (i === arr.length - 1 ? v + shift : v)))
  labels.push({ id: 'eq', x: 'left', y: 'top', html: `$${tex}$`, color: C.teal, pos: 'se', fixed: true })
  return {
    bounds: { left: -L, right: L, bottom: -T, top: T },
    axes: { x: 'x', y: 'y', aspect: 1, xStep: 1, yStep: 1 },
    description: `Graph of ${tex}.`,
    items, labels,
  }
}

const ORD = { 2: 'quadratic', 3: 'cubic', 4: 'quartic' }
export function polyCards({ deg, a, roots, shift = 0, form, rep }) {
  const { real, turning } = analyse({ deg, a, roots, shift })
  const odd = deg % 2 === 1
  const sign = a > 0 ? 'positive' : 'negative'
  const ends = odd
    ? a > 0 ? 'falls on the left and rises on the right' : 'rises on the left and falls on the right'
    : a > 0 ? 'rises at both ends' : 'falls at both ends'
  const count = real.reduce((s, r) => s + r.m, 0)
  const list = real.map((r) => `$${fmt(r.x, 2)}$${r.m === 2 ? ' (double)' : r.m === 3 ? ' (triple)' : ''}`).join(', ')
  const cards = [
    { title: `End behaviour: degree ${deg}, $a$ ${sign}`, tone: 'coral', lines: [`${odd ? 'Odd degree: the ends go opposite ways.' : 'Even degree: both ends go the same way.'} This ${ORD[deg]} ${ends}.`] },
    { title: `Turning points: ${turning.length} (at most ${deg - 1})`, tone: 'teal', lines: [{ 2: 'A quadratic always has exactly 1.', 3: 'A cubic has 0 or 2.', 4: 'A quartic has 1 or 3.' }[deg]] },
    { title: `Real roots: ${real.length ? list : 'none'}`, tone: 'sel', lines: [`At most ${deg}, counting repeats${count && count !== real.length ? `; here ${count} with repeats` : ''}. ${{ 2: 'A quadratic can have none.', 3: 'A cubic always has at least 1.', 4: 'A quartic can have none.' }[deg]}`] },
  ]
  if (form === 'fact') cards.push({ title: 'Factored form shows the roots', lines: ['Each factor $(x-p)$ gives a root at $x=p$, and $a$ sets the stretch and the ends. Lesson 1: $h=at(t-1.7)$ has roots $0$ and $1.7$.'] })
  else cards.push({ title: 'Standard form', lines: [`Adding a constant (here $${fmt(shift, 1)}$) lifts the graph. Real roots appear or disappear; the turning points and ends do not change.`] })
  if (rep !== 'none' && repAllowed(deg, rep)) cards.push({ title: 'Repeated roots', tone: 'sel', lines: [rep === 'triple' ? '$(x-p)^3$: the graph flattens and crosses at $x=p$.' : '$(x-p)^2$: a double root. The graph touches the axis and turns back; the sign does not change there.'] })
  cards.push({ title: `${deg + 1} conditions fix a ${ORD[deg]}`, tone: 'muted', lines: [`Degree ${deg} has ${deg + 1} coefficients. The mall needed 3 counts for a quadratic and 4 for a cubic.`] })
  return cards
}
