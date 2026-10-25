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

// Relations and binary operators where a long expression may break onto a new line (break before),
// and punctuation after which it may break.
const BREAK_BEFORE = ['\\approx', '\\neq', '\\leq', '\\geq', '\\le', '\\ge', '\\times', '\\cdot', '\\pm', '\\to', '\\Rightarrow', '=', '<', '>', '+', '-']
const SIGNS = new Set(['+', '-', '\\pm'])

// Split LaTeX at natural break points only: outside braces, brackets, parentheses, and
// \left...\right, and never at a sign that is unary (start, or right after another operator).
export function splitAtBreaks(latex) {
  const parts = []
  let depth = 0
  let start = 0
  let prevOp = true // true at the start and after any operator: a following + or - is a sign
  let i = 0
  while (i < latex.length) {
    const c = latex[i]
    if (c === '{' || c === '(' || c === '[') { depth++; prevOp = true; i++; continue }
    if (c === '}' || c === ')' || c === ']') { depth--; prevOp = false; i++; continue }
    if (c === '\\') {
      const word = latex.slice(i).match(/^\\[A-Za-z]+|^\\./)[0]
      if (word === '\\left') { depth++; i += word.length; if (latex[i] === '\\') i += latex.slice(i).match(/^\\[A-Za-z]+|^\\./)[0].length; else i++; prevOp = true; continue }
      if (word === '\\right') { depth--; i += word.length; if (latex[i] === '\\') i += latex.slice(i).match(/^\\[A-Za-z]+|^\\./)[0].length; else i++; prevOp = false; continue }
      if (word === '\\begin' || word === '\\end') { depth += word === '\\begin' ? 1 : -1; i += word.length; continue }
      const op = BREAK_BEFORE.find((o) => o === word)
      if (op && depth === 0) {
        if (!(SIGNS.has(op) && prevOp) && i > start) { parts.push(latex.slice(start, i)); start = i }
        prevOp = true
      } else prevOp = !!op
      i += word.length
      continue
    }
    if (c === '^' || c === '_') { prevOp = true; i++; continue }
    if (c === ' ') { i++; continue }
    if (BREAK_BEFORE.includes(c)) {
      if (depth === 0 && !(SIGNS.has(c) && prevOp) && i > start) { parts.push(latex.slice(start, i)); start = i }
      prevOp = true
      i++
      continue
    }
    if (c === ',' && depth === 0) {
      parts.push(latex.slice(start, i + 1))
      start = i + 1
      prevOp = true
      i++
      continue
    }
    prevOp = false
    i++
  }
  parts.push(latex.slice(start))
  return parts.map((p) => p.trim()).filter(Boolean)
}

// One <span class="tx"> per piece, with a <wbr> between pieces so that the line can wrap there.
// A piece that starts with an operator gets an empty group in front, so the operator keeps its
// binary spacing exactly as in the unbroken expression.
function wrapMath(latex, display) {
  const parts = splitAtBreaks(latex)
  if (parts.length < 2) return `<span class="tx${display ? ' tx-d' : ''}">${tex(latex, display)}</span>`
  return parts
    .map((p, i) => {
      const src = i > 0 && !/^,/.test(parts[i - 1].slice(-1)) ? `{}${p}` : p
      return `<span class="tx${display ? ' tx-d' : ''}">${tex(src, display)}</span>`
    })
    .join('<wbr>')
}

// md(text, { wrap: true }) lets long maths break at natural points instead of forcing one
// unbreakable (and so scrolling) line. The default keeps every expression in one piece.
export function md(text, opts = {}) {
  return String(text).replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (m, d, t) => {
    const latex = d != null ? d : t
    if (opts.wrap) return wrapMath(latex, d != null)
    return d != null ? `<span class="tx tx-d">${tex(d, true)}</span>` : `<span class="tx">${tex(t)}</span>`
  })
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
