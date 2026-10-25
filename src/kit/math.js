// Math helpers shared by every lesson opener.
// tex(): LaTeX to static markup through MathLive (the same engine as Ben's Notes).
// md(): plain text with $inline$ and $$display$$ math.
// Frac: exact rational arithmetic, so answers stay exact until the first rounding.
import { convertLatexToMarkup } from 'mathlive'

const cache = new Map()

export function tex(latex, display = false) {
  const key = (display ? 'D|' : 'T|') + latex
  if (!cache.has(key)) {
    cache.set(key, convertLatexToMarkup(latex, { mathstyle: display ? 'displaystyle' : 'textstyle' }))
  }
  return cache.get(key)
}

export function md(text) {
  return String(text).replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (m, d, t) =>
    d != null ? `<span class="tx tx-d">${tex(d, true)}</span>` : `<span class="tx">${tex(t)}</span>`,
  )
}

function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

export class Frac {
  constructor(n, d = 1) {
    if (d < 0) { n = -n; d = -d }
    const g = gcd(n, d)
    this.n = n / g
    this.d = d / g
  }
  static of(v) {
    if (v instanceof Frac) return v
    // decimals from sliders: up to 4 places
    let d = 1
    while (Math.abs(Math.round(v * d) - v * d) > 1e-9 && d < 1e4) d *= 10
    return new Frac(Math.round(v * d), d)
  }
  add(o) { o = Frac.of(o); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d) }
  sub(o) { o = Frac.of(o); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d) }
  mul(o) { o = Frac.of(o); return new Frac(this.n * o.n, this.d * o.d) }
  div(o) { o = Frac.of(o); return new Frac(this.n * o.d, this.d * o.n) }
  pow(k) { let r = new Frac(1); for (let i = 0; i < k; i++) r = r.mul(this); return r }
  abs() { return new Frac(Math.abs(this.n), this.d) }
  get value() { return this.n / this.d }
  get isInt() { return this.d === 1 }
  // LaTeX: -\frac{8}{3}
  get latex() {
    if (this.d === 1) return String(this.n).replace('-', '-')
    return (this.n < 0 ? '-' : '') + `\\frac{${Math.abs(this.n)}}{${this.d}}`
  }
  // "= 8/3 ≈ 2.67" style tail, exact first
  exactThenApprox(dp = 3) {
    if (this.d === 1) return this.latex
    const v = this.value
    const r = +v.toFixed(dp)
    return Math.abs(r - v) < 1e-12 ? `${this.latex}=${fmt(v, dp)}` : `${this.latex}\\approx${fmt(v, dp)}`
  }
}

// Number with a true minus sign, trimmed trailing zeros
export function fmt(v, dp = 3) {
  const s = (+v.toFixed(dp)).toString()
  return s.replace('-', '−')
}

// Number for LaTeX (keeps the minus as a LaTeX minus)
export function num(v, dp = 3) {
  return (+v.toFixed(dp)).toString()
}
