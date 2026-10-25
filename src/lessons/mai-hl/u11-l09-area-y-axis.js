// MAI HL Unit 11 Lesson 9: Area between a curve and the y-axis.
// Engine: SVG (kit/svg.js). Strips come from components/strips.
// Bridge from Lesson 8 (area between curves with vertical strips): slice the same region sideways,
// get the same area from a different integral, then meet a region where only horizontal strips work.
// Every exact value below is checked with sympy (8/3, 8/3, 27/4, and the antiderivatives).

import { COLORS as C } from '../../kit/style.js'
import { midpoints, snap } from '../../components/strips/index.js'
import { Frac, fmt, num } from '../../kit/math.js'

const sqrt = Math.sqrt
const g3 = (y) => y ** 3 - 6 * y ** 2 + 9 * y
const g4 = (y) => 4 * y - y * y
const F4 = (y) => Frac.of(y).pow(2).mul(2).sub(Frac.of(y).pow(3).div(3)) // 2y^2 - y^3/3

// y-values where y^3 - 6y^2 + 9y = p on 0 <= y <= 3 (two roots for 0 < p < 4)
function cubicRoots(p) {
  const bis = (a, b) => {
    let fa = g3(a) - p
    for (let i = 0; i < 60; i++) {
      const m = (a + b) / 2
      const fm = g3(m) - p
      if ((fa <= 0) === (fm <= 0)) { a = m; fa = fm } else b = m
    }
    return (a + b) / 2
  }
  return [bis(0, 1), bis(1, 3)]
}

// fx-CG50 steps from the verified key log (gdc-online-deck, references/menu_paths_verified.md):
// Run-Matrix ∫dx template ([OPTN] [F4] CALC [F4] ∫dx, cursor starts in the integrand, [RIGHT] to the
// lower then the upper limit; from an exponent or Abs, one more [RIGHT] first; verified 23/10/2026, AASL D6)
// and Abs ([OPTN] [F6] ▷ [F4] NUMERIC [F1] Abs, same source). Leaving a √ with [RIGHT] is inferred
// from the exponent rule and still needs a check on the calculator.
const k = (s) => `<span class="key">${s}</span>`
const e = (s) => `<span class="entry">${s}</span>`
const integral = (typing, leave, lo, hi) => [
  `${k('MENU')} ${k('1')}: Run-Matrix. Wait for the screen before pressing anything else`,
  `${k('OPTN')} ${k('F4')} (CALC) ${k('F4')} (∫dx). The template ∫□□ □ dx opens with the cursor in the integrand`,
  `Type ${typing}`,
  ...(leave ? [leave] : []),
  `${k('→')} lower limit ${e(lo)}, ${k('→')} upper limit ${e(hi)}`,
  `${k('EXE')}`,
]
const casioNum = (x) => String(+x.toPrecision(10)).replace('-', '\u2212')

const graphs = {
  recall({ v }) {
    const { h, m, L } = midpoints(0, 4, v.n)
    const t = snap(0, 4, v.n, v.p1)
    const top = 2
    return {
      bounds: { left: -0.9, right: 4.9, bottom: -0.7, top: 2.9 },
      items: [
        { type: 'area', var: 'x', from: 0, to: 4, lo: sqrt, hi: () => top, color: C.teal, opacity: 0.12 },
        { type: 'rects', items: m.map((x, i) => [L[i], L[i] + h, sqrt(x), top]) },
        { type: 'curve', f: (x) => [x, sqrt(x)], t: [0, 4.4], color: C.teal },
        { type: 'line', x1: 0, y1: top, x2: 4.4, y2: top, color: C.coral, width: 4 },
        { type: 'rect', x1: t.lo, x2: t.hi, y1: sqrt(t.m), y2: top, drag: { param: 'p1', axis: 'x' } },
        { type: 'dim', from: [t.lo, top + 0.18], to: [t.hi, top + 0.18] },
        { type: 'dim', from: [t.hi + 0.1, sqrt(t.m)], to: [t.hi + 0.1, top] },
      ],
      labels: [
        { id: 'lc', x: 1.1, y: sqrt(1.1), html: '$y=\\sqrt{x}$', color: C.teal, pos: 'se' },
        { id: 'lt', x: 4.4, y: top, html: '$y=2$', color: C.coral, pos: 'ne' },
        { id: 'ls', x: t.hi + 0.14, y: (sqrt(t.m) + top) / 2, html: 'height $=2-\\sqrt{x}$', color: C.sel, pos: 'e' },
        { id: 'lw', x: t.m, y: top + 0.18, html: '$\\Delta x$', color: C.sel, pos: 'n', plain: true, fixed: true },
      ],
    }
  },

  sideways({ v }) {
    const { h, m, L } = midpoints(0, 2, v.n)
    const t = snap(0, 2, v.n, v.p2)
    const len = t.m * t.m
    return {
      bounds: { left: -0.9, right: 4.9, bottom: -0.7, top: 2.9 },
      items: [
        { type: 'area', var: 'y', from: 0, to: 2, lo: () => 0, hi: (y) => y * y, color: C.teal, opacity: 0.12 },
        { type: 'rects', items: m.map((y, i) => [0, y * y, L[i], L[i] + h]) },
        { type: 'curve', f: (y) => [y * y, y], t: [0, 2.1], color: C.teal },
        { type: 'line', x1: 0, y1: 2, x2: 4.4, y2: 2, color: C.coral, width: 2, dash: true },
        { type: 'line', x1: 0, y1: 0, x2: 0, y2: 2, color: C.coral, width: 5 },
        { type: 'rect', x1: 0, x2: len, y1: t.lo, y2: t.hi, drag: { param: 'p2', axis: 'y' } },
        { type: 'dim', from: [len + 0.22, t.lo], to: [len + 0.22, t.hi] },
        ...(len > 0.25 ? [{ type: 'dim', from: [0, t.lo - 0.1], to: [len, t.lo - 0.1] }] : []),
      ],
      labels: [
        { id: 'lc', x: 4.4, y: sqrt(4.4), html: '$x=y^2$', color: C.teal, pos: 'se' },
        { id: 'la', x: 0, y: 1, html: '$x=0$', color: C.coral, pos: 'w' },
        t.lo < 0.3
          ? { id: 'ls', x: 0.6, y: t.hi, html: 'length $=y^2-0$', color: C.sel, pos: 'ne' }
          : { id: 'ls', x: Math.max(0.6, len / 2), y: t.lo - 0.1, html: 'length $=y^2-0$', color: C.sel, pos: 's' },
        { id: 'lw', x: len + 0.3, y: t.m, html: '$\\Delta y$', color: C.sel, pos: 'e', plain: true, fixed: true },
      ],
    }
  },

  oneway({ v }) {
    const n = v.n
    const items = [
      { type: 'area', var: 'y', from: 0, to: 3, lo: () => 0, hi: g3, color: C.teal, opacity: 0.12 },
    ]
    const after = [
      { type: 'curve', f: (y) => [g3(y), y], t: [-0.15, 3.15], color: C.teal },
      { type: 'line', x1: 0, y1: 0, x2: 0, y2: 3, color: C.coral, width: 5 },
    ]
    const labels = [{ id: 'lc', x: 4, y: 1, html: '$x=y^3-6y^2+9y$', color: C.teal, pos: 'e' }]
    if (v.dir === 'v') {
      const { h, m, L } = midpoints(0, 4, n)
      items.push({ type: 'rects', items: m.map((x, i) => { const [a, b] = cubicRoots(x); return [L[i], L[i] + h, a, b] }) })
      const t = snap(0, 4, n, v.p3x)
      const [y1, y2] = cubicRoots(t.m)
      after.push(
        { type: 'rect', x1: t.lo, x2: t.hi, y1, y2, drag: { param: 'p3x', axis: 'x' } },
        { type: 'points', pts: [[t.m, y1], [t.m, y2]] },
      )
      labels.push(
        { id: 'l1', x: t.lo, y: y1, html: '$y_1=\\ ?$', color: C.sel, pos: 'sw' },
        { id: 'l2', x: t.lo, y: y2, html: '$y_2=\\ ?$', color: C.sel, pos: 'nw' },
      )
    } else {
      const { h, m, L } = midpoints(0, 3, n)
      items.push({ type: 'rects', items: m.map((y, i) => [0, g3(y), L[i], L[i] + h]) })
      const t = snap(0, 3, n, v.p3y)
      after.push(
        { type: 'rect', x1: 0, x2: g3(t.m), y1: t.lo, y2: t.hi, drag: { param: 'p3y', axis: 'y' } },
        { type: 'dim', from: [0, t.hi + 0.1], to: [g3(t.m), t.hi + 0.1] },
      )
      labels.push({ id: 'ls', x: g3(t.m) + 0.15, y: t.m, html: 'length $=y^3-6y^2+9y$', color: C.sel, pos: 'e' })
    }
    return { bounds: { left: -0.9, right: 6.6, bottom: -0.5, top: 3.5 }, items: [...items, ...after], labels }
  },

  explore({ v }) {
    const lo = Math.min(v.c, v.d)
    const hi = Math.max(v.c, v.d)
    const items = [
      { type: 'area', var: 'y', from: lo, to: hi, lo: () => 0, hi: (y) => Math.max(0, g4(y)), color: C.teal, opacity: 0.16 },
      { type: 'area', var: 'y', from: lo, to: hi, lo: (y) => Math.min(0, g4(y)), hi: () => 0, color: C.coral, opacity: 0.2 },
    ]
    if (hi > lo) {
      const { h, m, L } = midpoints(lo, hi, v.n)
      items.push({ type: 'rects', items: m.map((y, i) => [0, g4(y), L[i], L[i] + h]), opacity: 0.1 })
    }
    items.push(
      { type: 'line', x1: -5.4, y1: lo, x2: 5.4, y2: lo, color: C.muted, width: 2, dash: true },
      { type: 'line', x1: -5.4, y1: hi, x2: 5.4, y2: hi, color: C.muted, width: 2, dash: true },
      { type: 'curve', f: (y) => [g4(y), y], t: [-1.4, 5.4], color: C.teal },
    )
    return {
      bounds: { left: -5.4, right: 5.4, bottom: -1.4, top: 5.4 },
      items,
      labels: [
        { id: 'lc', x: 4, y: 2, html: '$x=4y-y^2$', color: C.teal, pos: 'e' },
        { id: 'lhi', x: 'left', y: hi, html: `$y=${num(hi)}$`, color: C.muted, pos: 'ne', plain: true },
        { id: 'llo', x: 'left', y: lo, html: `$y=${num(lo)}$`, color: C.muted, pos: 'se', plain: true },
      ],
    }
  },
}

export default {
  course: 'mai-hl',
  unit: 11,
  lesson: 9,
  title: 'Area between a curve and the y-axis',
  bridge: 'Lesson 8: area between curves',

  params: {
    n: { type: 'range', label: 'Strips', min: 1, max: 40, step: 1, value: 6, show: (v) => String(v) },
    p1: { type: 'range', label: 'Typical strip at', min: 0, max: 4, step: 0.01, value: 1.5, show: (v, all) => `x = ${fmt(snap(0, 4, all.n, v).m, 2)}`, sel: true },
    p2: { type: 'range', label: 'Typical strip at', min: 0, max: 2, step: 0.01, value: 1.2, show: (v, all) => `y = ${fmt(snap(0, 2, all.n, v).m, 2)}`, sel: true },
    dir: { type: 'seg', label: 'Slice', options: [['v', 'Vertical'], ['h', 'Horizontal']], value: 'v' },
    p3x: { type: 'range', label: 'Typical strip at', min: 0, max: 4, step: 0.01, value: 2, show: (v, all) => `x = ${fmt(snap(0, 4, all.n, v).m, 2)}`, sel: true },
    p3y: { type: 'range', label: 'Typical strip at', min: 0, max: 3, step: 0.01, value: 0.8, show: (v, all) => `y = ${fmt(snap(0, 3, all.n, v).m, 2)}`, sel: true },
    c: { type: 'range', label: 'Lower bound', min: -1, max: 5, step: 0.5, value: 0, show: (v) => `y = ${fmt(v, 1)}` },
    d: { type: 'range', label: 'Upper bound', min: -1, max: 5, step: 0.5, value: 4, show: (v) => `y = ${fmt(v, 1)}` },
  },

  scenes: [
    // 1. Last lesson: vertical strips, top minus bottom
    {
      id: 'recall',
      short: 'Last lesson',
      heading: 'Last lesson we sliced vertically. Find the area between $y=\\sqrt{x}$ and $y=2$.',
      controls: ['n', 'p1'],
      prompts: [
        { id: 'r1', q: 'Each vertical strip has width $\\Delta x$. What is its height?', a: 'Top minus bottom: $2-\\sqrt{x}$' },
        { id: 'r2', q: 'Write the area as an integral and find its value.', a: '$A=\\int_0^4\\left(2-\\sqrt{x}\\right)dx$ $=\\frac{8}{3}\\approx2.67$' },
      ],
      graph: (ctx) => graphs.recall(ctx),
      readout({ v, shown }) {
        const { h, m } = midpoints(0, 4, v.n)
        const s = m.reduce((acc, t) => acc + h * (2 - sqrt(t)), 0)
        return `Sum of ${v.n} strip${v.n === 1 ? '' : 's'} <b>≈ ${fmt(s, 4)}</b>` + (shown('r2') ? ` · exact area <b>$\\frac{8}{3}$</b>` : '')
      },
      working() {
        return {
          rows: [
            ['Strip', 'width\\ \\Delta x,\\ \\text{height}\\ 2-\\sqrt{x}'],
            ['Strip area', '\\left(2-\\sqrt{x}\\right)\\Delta x'],
            ['Add up', 'A=\\int_0^4\\left(2-\\sqrt{x}\\right)dx'],
            ['', '=\\left[2x-\\frac{2}{3}x^{3/2}\\right]_0^4'],
            ['', '=8-\\frac{16}{3}'],
            ['', '=\\frac{8}{3}\\approx2.67', true],
          ],
        }
      },
      keys() {
        return {
          steps: integral(`${e('2')} ${k('−')} ${k('SHIFT')} ${k('x²')} (√) ${k('X,θ,T')}`, `${k('→')} once to leave the √`, '0', '4'),
          out: '2.666666667',
          watch: 'The cursor must leave the √ before the limits, or the 0 and 4 end up under the root.',
        }
      },
    },

    // 2. Same region, horizontal strips
    {
      id: 'sideways',
      short: 'Turn it sideways',
      heading: 'Same region. This time slice it horizontally.',
      controls: ['n', 'p2'],
      prompts: [
        { id: 's1', q: 'Predict: with horizontal strips, the area will be…', choices: ['smaller', 'the same', 'larger'], correct: 1, a: 'The same. It is the same region, only cut a different way.' },
        { id: 's2', q: 'A horizontal strip has height $\\Delta y$. What is its length?', a: 'Right minus left. The curve $y=\\sqrt{x}$ is $x=y^2$, so the length is $y^2-0=y^2$.' },
        { id: 's3', q: 'Write the area as an integral in $y$.', a: '$A=\\int_0^2 y^2\\,dy$ $=\\frac{8}{3}$. Same area, a simpler integral.' },
      ],
      graph: (ctx) => graphs.sideways(ctx),
      readout({ v, shown }) {
        const { h, m } = midpoints(0, 2, v.n)
        const s = m.reduce((acc, t) => acc + h * t * t, 0)
        return `Sum of ${v.n} strip${v.n === 1 ? '' : 's'} <b>≈ ${fmt(s, 4)}</b>` + (shown('s3') ? ` · exact area <b>$\\frac{8}{3}$</b>` : '')
      },
      working() {
        return {
          rows: [
            ['Strip', '\\text{height}\\ \\Delta y,\\ \\text{length}\\ y^2-0'],
            ['Strip area', 'y^2\\,\\Delta y'],
            ['Add up', 'A=\\int_0^2 y^2\\,dy'],
            ['', '=\\left[\\frac{y^3}{3}\\right]_0^2'],
            ['', '=\\frac{8}{3}\\approx2.67', true],
          ],
          note: 'Last lesson: $\\int_0^4\\left(2-\\sqrt{x}\\right)dx=\\frac{8}{3}$. Same region, same area.',
        }
      },
      keys() {
        return {
          steps: integral(`${k('X,θ,T')} ${k('x²')}`, null, '0', '2'),
          out: '2.666666667',
          watch: 'The fx-CG50 integrates in <b>X</b> only. For $\\int_0^2 y^2\\,dy$ type X² and keep the <b>y</b> limits 0 and 2.',
        }
      },
    },

    // 3. Only one way works
    {
      id: 'oneway',
      short: 'Only one way',
      heading: 'Find the area between $x=y^3-6y^2+9y$ and the $y$-axis, for $0\\le y\\le3$.',
      controls: ({ v }) => (v.dir === 'v' ? ['dir', 'n', 'p3x'] : ['dir', 'n', 'p3y']),
      prompts: [
        { id: 'o1', q: 'Try a vertical strip at $x=p$. Where does it start and stop?', a: 'Where $y^3-6y^2+9y=p$. Those two $y$-values come from solving a cubic, so there is no simple formula for the strip height.' },
        { id: 'o2', q: 'Which strips give a formula you can integrate?', choices: ['vertical', 'horizontal', 'both'], correct: 1, a: 'Horizontal. The length of a horizontal strip is $y^3-6y^2+9y$, read straight from the equation.' },
        { id: 'o3', q: 'Find the area.', a: '$A=\\int_0^3\\left(y^3-6y^2+9y\\right)dy$ $=\\frac{27}{4}=6.75$' },
      ],
      graph: (ctx) => graphs.oneway(ctx),
      readout({ v, shown }) {
        let s
        if (v.dir === 'v') {
          const { h, m } = midpoints(0, 4, v.n)
          s = m.reduce((acc, t) => { const [a, b] = cubicRoots(t); return acc + h * (b - a) }, 0)
        } else {
          const { h, m } = midpoints(0, 3, v.n)
          s = m.reduce((acc, t) => acc + h * g3(t), 0)
        }
        return `Sum of ${v.n} strip${v.n === 1 ? '' : 's'} <b>≈ ${fmt(s, 4)}</b>` + (shown('o3') ? ` · exact area <b>$\\frac{27}{4}$</b>` : '')
      },
      working({ v }) {
        if (v.dir === 'v') {
          const p = snap(0, 4, v.n, v.p3x).m
          const [y1, y2] = cubicRoots(p)
          return {
            rows: [
              ['Strip at', `x=${num(p, 2)}`],
              ['Solve', `y^3-6y^2+9y=${num(p, 2)}`],
              ['Ends', `y_1\\approx${num(y1, 3)},\\ y_2\\approx${num(y2, 3)}`],
              ['Height', `y_2-y_1\\approx${num(y2 - y1, 3)}`, true],
            ],
            note: 'Every vertical strip needs its own cubic solved. The heights exist, but there is no formula in $x$ to integrate.',
          }
        }
        return {
          rows: [
            ['Strip', '\\text{length}\\ y^3-6y^2+9y'],
            ['Add up', 'A=\\int_0^3\\left(y^3-6y^2+9y\\right)dy'],
            ['', '=\\left[\\frac{y^4}{4}-2y^3+\\frac{9y^2}{2}\\right]_0^3'],
            ['', '=\\frac{81}{4}-54+\\frac{81}{2}'],
            ['', '=\\frac{27}{4}=6.75', true],
          ],
        }
      },
      keys() {
        return {
          steps: integral(`${k('X,θ,T')} ${k('^')} ${e('3')} ${k('→')} ${k('−')} ${e('6')} ${k('X,θ,T')} ${k('x²')} ${k('+')} ${e('9')} ${k('X,θ,T')}`, null, '0', '3'),
          out: '6.75',
          watch: 'After X^3, press → to leave the exponent before typing −6X², or the calculator reads X^(3−6X²+9X).',
        }
      },
    },

    // 4. Explore: bounds that cross the y-axis
    {
      id: 'explore',
      short: 'Your turn',
      heading: 'Area between $x=4y-y^2$ and the $y$-axis. Move the bounds.',
      controls: ['c', 'd', 'n'],
      prompts: [
        { id: 'e1', q: 'Write the integral for the area from $y=0$ to $y=4$, and evaluate it.', a: '$\\int_0^4\\left(4y-y^2\\right)dy$ $=\\left[2y^2-\\frac{y^3}{3}\\right]_0^4$ $=\\frac{32}{3}\\approx10.7$' },
        { id: 'e2', q: 'Move the upper bound to $y=5$. Why does the integral go down?', a: 'For $y>4$ the curve is left of the $y$-axis, so those strips count as negative. For total area, integrate $\\left|4y-y^2\\right|$.' },
        { id: 'e3', q: 'When should you integrate with respect to $y$?', a: 'When the boundaries are easier to write as $x=f(y)$: curves given as $x=...$, regions against the $y$-axis, or when a vertical strip would hit more than one curve.' },
      ],
      graph: (ctx) => graphs.explore(ctx),
      readout({ v }) {
        const lo = Math.min(v.c, v.d)
        const hi = Math.max(v.c, v.d)
        const I = F4(hi).sub(F4(lo))
        const cuts = [lo, ...[0, 4].filter((t) => t > lo && t < hi), hi]
        let T = new Frac(0)
        for (let i = 0; i + 1 < cuts.length; i++) T = T.add(F4(cuts[i + 1]).sub(F4(cuts[i])).abs())
        const sign = cuts.length > 2 || I.value < 0
        return `$\\int_{${num(lo)}}^{${num(hi)}}\\left(4y-y^2\\right)dy=${I.exactThenApprox(2)}$` + (sign ? ` · total area <b>$${T.exactThenApprox(2)}$</b>` : '')
      },
      working({ v }) {
        const lo = Math.min(v.c, v.d)
        const hi = Math.max(v.c, v.d)
        const I = F4(hi).sub(F4(lo))
        return {
          rows: [
            ['Strip', '\\text{length}\\ 4y-y^2'],
            ['Add up', `\\int_{${num(lo)}}^{${num(hi)}}\\left(4y-y^2\\right)dy`],
            ['', `=\\left[2y^2-\\frac{y^3}{3}\\right]_{${num(lo)}}^{${num(hi)}}`],
            ...(F4(lo).n === 0 ? [] : [['', `=${F4(hi).latex}-\\left(${F4(lo).latex}\\right)`]]),
            ['', `=${I.exactThenApprox(2)}`, true],
          ],
          note: 'Where the curve is left of the $y$-axis (coral), $4y-y^2<0$ and those strips subtract.',
        }
      },
      keys({ v }) {
        const lo = Math.min(v.c, v.d)
        const hi = Math.max(v.c, v.d)
        return {
          steps: integral(`${e('4')} ${k('X,θ,T')} ${k('−')} ${k('X,θ,T')} ${k('x²')}`, null, casioNum(lo), casioNum(hi)),
          out: casioNum(F4(hi).sub(F4(lo)).value),
          watch: `This is the signed integral. For total area, put the integrand inside Abs: ${k('OPTN')} ${k('F6')} (▷) ${k('F4')} (NUMERIC) ${k('F1')} (Abs), type 4X−X², then one extra ${k('→')} to leave Abs before the limits.`,
        }
      },
    },
  ],
}
