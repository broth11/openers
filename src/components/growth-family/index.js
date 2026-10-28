// Growth family recap explorer: y = k a^x + c, y = k e^(rx) + c, and y = a + b ln x, with an optional
// inverse (the reflection in y = x), the horizontal or vertical asymptote, the initial value, and the
// recap cards that follow the controls. First used in MAI HL U5 L3 (scene 4). See README.md.
import { COLORS as C } from '../../kit/style.js'
import { fmt, num } from '../../kit/math.js'

export const VIEW = { left: -7, right: 9, bottom: -6, top: 9 }
const PAD = 0.4
// The stage keeps a 1:1 grid, so on a wide screen it shows far more x than VIEW asks for. Curves are
// drawn across x in +-LIM and kept within the y range so nothing runs through the tick numbers.
const LIM = 18

// the part of a parametric curve that stays inside the view
function visible(p, t0, t1, n = 2400) {
  let a = null
  let b = null
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n
    const [x, y] = p(t)
    if (Number.isFinite(x) && Number.isFinite(y) && x >= -LIM && x <= LIM && y >= VIEW.bottom - PAD && y <= VIEW.top + PAD) {
      if (a === null) a = t
      b = t
    }
  }
  return a === null ? null : [a, b]
}

// the explicit form of each family, and its inverse as a parametric curve (x(t), y(t))
export function model(st) {
  if (st.fam === 'log') return { f: (x) => st.la + st.lb * Math.log(x), t: [0.0005, LIM], inv: (t) => [st.la + st.lb * Math.log(t), t], invT: [0.0005, VIEW.top + 6] }
  const g = st.fam === 'nat' ? (x) => st.k * Math.exp(st.r * x) + st.c : (x) => st.k * st.a ** x + st.c
  const inv = (t) => [g(t), t]
  return { f: g, t: [-LIM, LIM], inv, invT: [VIEW.bottom - 6, VIEW.top + 6], reflect: true }
}

const sgn = (v, dp = 2) => (v < 0 ? `-${num(Math.abs(v), dp)}` : `+${num(v, dp)}`)
export function equationTex(st) {
  if (st.fam === 'log') return `y=${num(st.la, 1)}${st.lb < 0 ? '-' : '+'}${num(Math.abs(st.lb), 1)}\\ln x`
  const k = st.k === 1 ? '' : st.k === -1 ? '-' : num(st.k, 1)
  const tail = st.c === 0 ? '' : sgn(st.c, 1)
  return st.fam === 'nat' ? `y=${k}e^{${num(st.r, 2)}x}${tail}` : `y=${k}(${num(st.a, 2)})^{x}${tail}`
}
const inverseTex = (st) => (st.fam === 'log'
  ? `y=e^{(x${st.la < 0 ? '+' : '-'}${num(Math.abs(st.la), 1)})/${num(st.lb, 1)}}`
  : `x=${st.fam === 'nat' ? `${num(st.k, 1)}e^{${num(st.r, 2)}y}` : `${num(st.k, 1)}(${num(st.a, 2)})^{y}`}${st.c === 0 ? '' : sgn(st.c, 1)}`)

export function growthGraph(st) {
  const m = model(st)
  const items = []
  const labels = []
  const flat = st.fam === 'log' ? st.lb === 0 : st.k === 0
  if (st.inv) {
    items.push({ type: 'line', x1: -LIM, y1: -LIM, x2: LIM, y2: LIM, color: C.muted, width: 2, dash: true })
    const r = visible(m.inv, ...m.invT)
    if (r && !flat) {
      items.push({ type: 'curve', f: m.inv, t: r, color: C.coral, width: 3, dash: true, n: 400 })
      const tl = r[0] + (r[1] - r[0]) * 0.8
      const [lx, ly] = m.inv(tl)
      labels.push({ id: 'inv', x: lx, y: ly, html: `$${inverseTex(st)}$`, color: C.coral, pos: 'ne' })
    }
  }
  if (st.fam === 'log') {
    const r = visible((x) => [x, m.f(x)], ...m.t)
    if (r && !flat) {
      items.push({ type: 'curve', f: (x) => [x, m.f(x)], t: r, color: C.teal, n: 400 })
      const lx = r[0] + (r[1] - r[0]) * 0.7
      labels.push({ id: 'f', x: lx, y: m.f(lx), html: `$${equationTex(st)}$`, color: C.teal, pos: 'se' })
    }
    items.push({ type: 'line', x1: 0, y1: VIEW.bottom, x2: 0, y2: VIEW.top, color: C.muted, width: 2, dash: true })
    items.push({ type: 'points', pts: [[1, st.la]], color: C.sel, r: 8, hollow: true })
    labels.push({ id: 'a1', x: 1, y: st.la, html: `$(1,\\,${num(st.la, 1)})$`, color: C.sel, pos: 'se', attached: true })
  } else {
    items.push({ type: 'line', x1: -LIM, y1: st.c, x2: LIM, y2: st.c, color: C.muted, width: 2, dash: true })
    labels.push({ id: 'asy', x: -4.5, y: st.c, html: `$y=${num(st.c, 1)}$`, color: C.muted, pos: st.k >= 0 ? 'se' : 'ne', plain: true })
    const r = visible((x) => [x, m.f(x)], ...m.t)
    if (r) {
      items.push({ type: 'curve', f: (x) => [x, m.f(x)], t: r, color: C.teal, n: 400 })
      const lx = Math.max(r[0], Math.min(r[1], r[0] + (r[1] - r[0]) * 0.72))
      labels.push({ id: 'f', x: lx, y: m.f(lx), html: `$${equationTex(st)}$`, color: C.teal, pos: st.k >= 0 ? 'nw' : 'sw' })
    }
    const y0 = m.f(0)
    items.push({ type: 'points', pts: [[0, y0]], color: C.sel, r: 8, hollow: true })
    labels.push({ id: 'y0', x: 0, y: y0, html: `$(0,\\,${num(y0, 2)})$`, color: C.sel, pos: 'ne', attached: true })
  }
  return {
    bounds: { ...VIEW },
    description: `Graph of ${st.fam === 'log' ? 'a logarithmic' : 'an exponential'} model${st.inv ? ' with its inverse' : ''}.`,
    items, labels,
  }
}

const half = (ratio) => Math.log(0.5) / Math.log(ratio)
const dbl = (ratio) => Math.log(2) / Math.log(ratio)

export function growthCards(st) {
  const cards = []
  if (st.fam === 'log') {
    const { la: a, lb: b } = st
    cards.push({ title: 'Logarithmic model', tone: 'teal', lines: [`$y=a+b\\ln x$ is defined only for $x>0$. The $y$-axis is a vertical asymptote: as $x\\to 0$, $y\\to ${b >= 0 ? '-' : ''}\\infty$.`] })
    cards.push({ title: `$a$ is the value at $x=1$`, tone: 'sel', lines: [`$\\ln 1=0$, so $y(1)=a=${num(a, 1)}$. Here $y(1)=${num(a, 1)}$.`] })
    cards.push({ title: 'Slow growth, no limit', lines: b === 0 ? ['$b=0$ gives the constant $y=a$.'] : [`Each time $x$ is multiplied by $10$, $y$ changes by $b\\ln 10=${fmt(b * Math.LN10, 2)}$. There is no horizontal asymptote, but ${b > 0 ? 'the climb' : 'the fall'} keeps slowing.`] })
    if (st.inv) cards.push({ title: 'Inverse: the exponential', tone: 'coral', lines: ['Swap $x$ and $y$: $x=a+b\\ln y$, so $y=e^{(x-a)/b}$. The vertical asymptote $x=0$ becomes the horizontal asymptote $y=0$.'] })
    else cards.push({ title: 'Where you meet it', tone: 'muted', lines: ['Diminishing returns: practice and skill, dose and effect, and the time to reach a level in an exponential model.'] })
    return cards.slice(0, 5)
  }
  const nat = st.fam === 'nat'
  const ratio = nat ? Math.exp(st.r) : st.a
  const flat = st.k === 0 || Math.abs(ratio - 1) < 1e-9
  cards.push(nat
    ? { title: 'The $e^{rx}$ form', tone: 'teal', lines: [`$ke^{rx}+c$ is $ka^x+c$ with $a=e^{r}=${fmt(Math.exp(st.r), 3)}$. Here $r=${num(st.r, 2)}$ is the continuous rate: ${st.r > 0 ? 'growth' : st.r < 0 ? 'decay' : 'none'}.`] }
    : { title: 'Exponential model', tone: 'teal', lines: [`$y=ka^x+c$: each step of $1$ in $x$ multiplies the gap from $c$ by $a=${num(st.a, 2)}$.`] })
  if (flat) {
    cards.push({ title: 'No change', lines: [st.k === 0 ? '$k=0$ leaves only the constant $y=c$.' : '$a=1$ multiplies by $1$ every step, so $y$ stays constant.'] })
  } else {
    cards.push({ title: ratio > 1 ? 'Growth: the gap grows' : 'Decay: the gap shrinks', lines: [`The gap $y-c$ is multiplied by $${fmt(ratio, 3)}$ for each step in $x$, so it ${ratio > 1 ? 'grows' : 'shrinks'}.`] })
    cards.push({ title: ratio > 1 ? 'Doubling time' : 'Half-life', tone: 'sel', lines: [ratio > 1 ? `The gap from $c$ doubles every $\\dfrac{\\ln 2}{\\ln a}=${fmt(dbl(ratio), 2)}$ steps.` : `The gap from $c$ halves every $\\dfrac{\\ln 0.5}{\\ln a}=${fmt(half(ratio), 2)}$ steps.`] })
  }
  cards.push({ title: 'Initial value and asymptote', lines: [`$y(0)=k+c=${num(st.k, 1)}${sgn(st.c, 1)}=${num(st.k + st.c, 2)}$. The line $y=${num(st.c, 1)}$ is the horizontal asymptote: the curve closes in on it${st.k === 0 ? '' : ' but never reaches it'}.`] })
  if (st.inv) cards.push({ title: 'Inverse: the logarithm', tone: 'coral', lines: ['Solving for $x$ undoes the exponential with a logarithm. The horizontal asymptote $y=c$ becomes the vertical asymptote $x=c$.'] })
  return cards.slice(0, 5)
}
