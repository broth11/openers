// The power family y = kx^n in the first quadrant: direct variation (n > 0) and inverse variation
// (n < 0, written y = k/x^|n|). Draws the curve, optional doubling markers at x0 and 2x0, an optional
// "not direct" comparison y = kx^n + c, and builds the recap cards that follow the controls.
// First used in MAI HL U5 L2 (scenes 4 and 6). See README.md.
import { COLORS as C } from '../../kit/style.js'
import { fmt, num } from '../../kit/math.js'

export const power = (k, n) => (x) => k * x ** n
const nTex = (n) => (n === 0.5 ? '\\frac{1}{2}' : String(n))
const kTex = (k) => num(k, 2)

// The equation in the form students write: y = kx^n, or y = k/x^n for inverse variation.
export function powerTex(k, n, { negative = false } = {}) {
  const kk = Math.abs(k - 1) < 1e-9 ? '' : kTex(k)
  if (n > 0) return n === 1 ? `y=${kk}x` : `y=${kk}x^{${nTex(n)}}`
  if (negative) return `y=${kk}x^{${n}}`
  const m = -n
  return m === 1 ? `y=\\frac{${kTex(k)}}{x}` : `y=\\frac{${kTex(k)}}{x^{${m}}}`
}

// Vertical room needed so the doubling markers stay on screen for k up to kMax.
export function topFor(n, kMax, x0 = 1) {
  if (n < 0) return Math.max(6, kMax * 1.6)
  return Math.max(6, kMax * (2 * x0) ** n * 1.12)
}

export function powerGraph({ k, n, x0 = 1, top, right = 4.4, doubling = false, notDirect = false, c = 2, asymptotes = false, negative = false }) {
  const f = power(k, n)
  const items = []
  const labels = []
  // where the curve leaves the top of the window (inverse variation near the y-axis)
  const xStart = n < 0 ? Math.min(0.02 + (k / (top * 1.25)) ** (1 / -n), right) : 0
  const xEnd = n > 0 ? Math.min(right + 1, (top * 1.25 / k) ** (1 / n)) : right + 1
  if (asymptotes && n < 0) {
    items.push({ type: 'line', x1: 0.02, y1: -0.3, x2: 0.02, y2: top * 1.2, color: C.muted, width: 2, dash: true })
    items.push({ type: 'line', x1: 0, y1: 0.03 * top, x2: right + 1, y2: 0.03 * top, color: C.muted, width: 2, dash: true })
    labels.push({ id: 'asy-y', x: 0.05, y: top * 0.9, html: 'never meets the $y$-axis', color: C.muted, pos: 'e', plain: true })
    labels.push({ id: 'asy-x', x: right * 0.8, y: 0.03 * top, html: 'never meets the $x$-axis', color: C.muted, pos: 'n', plain: true })
  }
  if (notDirect && n > 0) {
    items.push({ type: 'curve', f: (x) => [x, f(x) + c], t: [0, Math.min(xEnd, right + 1)], color: C.coral, dash: true, width: 3 })
    items.push({ type: 'points', pts: [[0, c]], color: C.coral, hollow: true })
    labels.push({ id: 'nd', x: Math.min(xEnd, right) * 0.45, y: f(Math.min(xEnd, right) * 0.45) + c, html: `$${powerTex(k, n)}+${c}$`, color: C.coral, pos: 'nw' })
  }
  items.push({ type: 'curve', f: (x) => [x, f(x)], t: [xStart, xEnd], color: C.teal })
  const lx = n > 0 ? Math.min(xEnd, right) * 0.82 : Math.min(right * 0.75, 3.2)
  labels.push({ id: 'curve', x: lx, y: f(lx), html: `$${powerTex(k, n, { negative })}$`, color: C.teal, pos: n > 0 ? 'nw' : 'ne' })
  if (doubling) {
    const y1 = f(x0)
    const y2 = f(2 * x0)
    for (const [x, y] of [[x0, y1], [2 * x0, y2]]) {
      items.push({ type: 'line', x1: x, y1: 0, x2: x, y2: y, color: C.sel, width: 2, dash: true })
      items.push({ type: 'line', x1: 0, y1: y, x2: x, y2: y, color: C.sel, width: 2, dash: true })
    }
    items.push({ type: 'points', pts: [[x0, y1], [2 * x0, y2]], color: C.sel, r: 7 })
    const factor = 2 ** n
    const word = n > 0 ? `\\times ${fmt(factor, 3)}` : `\\div ${fmt(1 / factor, 3)}`
    labels.push({ id: 'p1', x: x0, y: y1, html: `$(${fmt(x0)},\\,${fmt(y1, 3)})$`, color: C.sel, pos: n > 0 ? 'nw' : 'ne', attached: true })
    labels.push({ id: 'p2', x: 2 * x0, y: y2, html: `$(${fmt(2 * x0)},\\,${fmt(y2, 3)})$`, color: C.sel, pos: n > 0 ? 'se' : 'ne', attached: true })
    labels.push({ id: 'fac', x: 1.5 * x0, y: 0, html: `double $x$: $y${word}$`, color: C.sel, pos: 'n', plain: true, fixed: true })
  }
  return {
    bounds: { left: -0.25, right, bottom: -0.06 * top, top },
    axes: { x: 'x', y: 'y', aspect: (1.6 * top * 1.06) / (right + 0.25), xStep: 1, nonnegative: true },
    description: `Graph of ${powerTex(k, n)} for x greater than 0.`,
    items, labels,
  }
}

// Ratio (direct) or product (inverse) test: the third column is k every time.
export function testTable(k, n) {
  const f = power(k, n)
  const rows = [1, 2, 3].map((x) => {
    const y = f(x)
    return `<tr><td>${x}</td><td>${fmt(y, 3)}</td><td class="k">${fmt(n > 0 ? y / x ** n : y * x ** -n, 3)}</td></tr>`
  }).join('')
  const head = n > 0 ? `<th>x</th><th>y</th><th>y ÷ x${n === 1 ? '' : n === 0.5 ? '<sup>½</sup>' : `<sup>${n}</sup>`}</th>` : `<th>x</th><th>y</th><th>y × x${-n === 1 ? '' : `<sup>${-n}</sup>`}</th>`
  return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`
}

const DIRECT_EXAMPLES = {
  0.5: 'Time to fall from a height $h$: $t\\propto\\sqrt{h}$.',
  1: 'Cost and quantity at a fixed price: $C\\propto q$. Distance at a steady speed: $d\\propto t$.',
  2: 'Area of a circle: $A\\propto r^2$. Distance fallen from rest: $d\\propto t^2$.',
  3: 'Volume of similar jars: $N\\propto h^3$. Wind turbine power: $P\\propto v^3$.',
}
const INVERSE_EXAMPLES = {
  1: 'Time for a job and the number of workers: $T\\propto 1/w$. Each share of a bill: $s\\propto 1/n$.',
  2: 'Light, sound, and gravity: $I\\propto 1/d^2$. Can height at a fixed volume: $h\\propto 1/r^2$.',
  3: 'Tidal force between two bodies: $F\\propto 1/d^3$.',
}

export function directCards({ k, n, doubling, table, notDirect }) {
  const nt = nTex(n)
  const def = { title: 'Direct variation', tone: 'teal', lines: [`"$y$ is directly proportional to $x^{${nt}}$" means $y\\propto x^{${nt}}$, so $y=kx^{${nt}}$.`] }
  // cards for the switches that are on come first; the list is capped so the column never scrolls
  const on = []
  if (doubling) on.push({ title: `Double $x$: $y$ is multiplied by $2^{${nt}}=${fmt(2 ** n, 3)}$`, tone: 'sel', lines: ['The factor depends only on the power, never on $k$.'] })
  if (table) on.push({ title: 'Ratio test', tone: 'sel', lines: [`$y\\div x^{${nt}}$ is the same for every pair.`], html: testTable(k, n) })
  if (notDirect) on.push({ title: 'Not direct variation', tone: 'coral', lines: [`$y=kx^{${nt}}+2$ misses the origin, and doubling $x$ no longer multiplies $y$ by $2^{${nt}}$.`] })
  const rest = [
    { title: 'Find $k$ from one pair', lines: [`$k=\\dfrac{y}{x^{${nt}}}$. Here every point gives $k=${kTex(k)}$.`] },
    { title: 'Through the origin', lines: ['When $x=0$, $y=0$. Every direct variation graph starts at $(0,0)$.'] },
    ...(n === 3 ? [{ title: 'A cubic with one term', tone: 'muted', lines: ['$y=kx^3$ is a cubic whose $b$, $c$, and $d$ are all $0$. One pair fixes it; the mall cubic needed four counts.'] }] : []),
    { title: 'Where you meet it', tone: 'muted', lines: [DIRECT_EXAMPLES[n]] },
  ]
  return [def, ...on, ...rest].slice(0, table ? 4 : 5)
}

export function inverseCards({ k, n, doubling, table, asymptotes, negative }) {
  const m = -n
  if (n > 0) {
    return [
      { title: 'Positive power: direct variation', tone: 'teal', lines: [`$y=kx^{${n}}$ rises from the origin. Doubling $x$ multiplies $y$ by $2^{${n}}=${fmt(2 ** n)}$.`] },
      { title: 'One family', tone: 'muted', lines: ['$y=kx^n$ covers both: a positive power is direct variation, a negative power is inverse variation.'] },
    ]
  }
  const pw = m === 1 ? 'x' : `x^{${m}}`
  const def = { title: 'Inverse variation', tone: 'teal', lines: [`"$y$ is inversely proportional to $${pw}$" means $y\\propto 1/${pw}$, so $y=\\frac{k}{${pw}}$.`] }
  const on = []
  if (negative) on.push({ title: 'One family', tone: 'muted', lines: [`$k/${pw}=kx^{${n}}$: inverse variation is a power law with a negative power.`] })
  if (doubling) on.push({ title: `Double $x$: $y$ is divided by $2^{${m}}=${fmt(2 ** m)}$`, tone: 'sel', lines: [m === 2 ? 'Inverse square: halve the distance and the reading is 4 times as large.' : 'The factor depends only on the power, never on $k$.'] })
  if (table) on.push({ title: 'Product test', tone: 'sel', lines: [`$y\\times ${pw}$ is the same for every pair.`], html: testTable(k, n) })
  if (asymptotes) on.push({ title: 'Both axes are asymptotes', tone: 'sel', lines: ['As $x\\to 0$, $y$ grows without bound. As $x$ grows, $y\\to 0$ but never reaches it.'] })
  const rest = [
    { title: 'Find $k$ from one pair', lines: [`$k=y\\times ${pw}$: the product stays the same. Here $k=${kTex(k)}$.`] },
    ...(asymptotes ? [] : [{ title: 'Never touches the axes', lines: ['For $x>0$ the graph falls, but it never meets either axis.'] }]),
    { title: 'Where you meet it', tone: 'muted', lines: [INVERSE_EXAMPLES[m]] },
  ]
  return [def, ...on, ...rest].slice(0, table ? 4 : 5)
}
