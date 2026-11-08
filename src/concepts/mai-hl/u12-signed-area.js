// MAI HL Unit 12, Lesson 2. Concept: displacement or distance.
//
// The one sentence: signed area under v is displacement; area under |v| is distance.
// The mistake (unit plan, L2 Exam Tip; C§4 first named discriminator): integrating v where |v| is needed,
//   so the area below the axis is subtracted from the distance.
// The picture: a car on a number line above its v-t graph. The area so far is shaded as time runs, teal
//   above the axis and coral below, and the car is always at the signed area. Then the coral area folds
//   up to make |v|, and the odometer reads the total area. The wrong-way toggle folds it back down.
// What the student does: watch one run (scene 1), then one prediction before the fold (scene 2), then set
//   two intervals (with and without a turn) and flip the mistake on and off.
//
// v(t) = (t − 2)(t − 6) = t² − 8t + 12 on 0 ≤ t ≤ 7, s(0) = 0. Every exact value is checked in
// qa/verify-concept-mai-hl-u12-signed-area.py. The function is not used in the L2 Notes, Practice, or
// Mastery Check.
// Calculator: the Run-Matrix ∫dx template and Abs as given in docs/OPENERS.md (Calculator steps).
import { COLORS as C } from '../../kit/style.js'
import { k, e, X } from '../../components/solid-of-revolution/lesson-tools.js'

const T = String.raw
const v = (t) => t * t - 8 * t + 12
const S = (t) => (t ** 3) / 3 - 4 * t * t + 12 * t // s(t) = ∫₀ᵗ v, since s(0) = 0
const ROOTS = [2, 6]
const TMAX = 7
// signed area of v on [a, b], and the area of |v| (split at the roots inside)
const signed = (a, b) => S(b) - S(a)
const total = (a, b) => {
  const cuts = [a, ...ROOTS.filter((r) => r > a && r < b), b]
  let sum = 0
  for (let i = 1; i < cuts.length; i++) sum += Math.abs(signed(cuts[i - 1], cuts[i]))
  return sum
}

// exact value when it is a whole number of 24ths (every value on the half-second grid), else 2 dp
function q(x) {
  const n = Math.round(x * 24)
  if (Math.abs(x * 24 - n) > 1e-6) return `\\approx ${x.toFixed(2)}`
  const g = (a, b) => (b ? g(b, a % b) : Math.abs(a))
  const d = g(n, 24) || 1
  const num = n / d
  const den = 24 / d
  const sgn = num < 0 ? '-' : ''
  return den === 1 ? `${num}` : `${sgn}\\frac{${Math.abs(num)}}{${den}}`
}
const eqv = (x) => (q(x).startsWith('\\approx') ? q(x) : `=${q(x)}`)

// shaded runs of one sign from a to b: teal where v > 0, coral where v < 0; `fold` lifts the coral part
// towards |v| (0 = v, 1 = |v|)
function runs(a, b, fold = 0, colours = {}) {
  const cuts = [a, ...ROOTS.filter((r) => r > a && r < b), b]
  const items = []
  for (let i = 1; i < cuts.length; i++) {
    const lo = cuts[i - 1]
    const hi = cuts[i]
    if (hi - lo < 1e-6) continue
    const neg = v((lo + hi) / 2) < 0
    const f = neg ? (t) => v(t) * (1 - 2 * fold) : v
    items.push({ type: 'area', var: 'x', from: lo, to: hi, lo: (t) => Math.min(0, f(t)), hi: (t) => Math.max(0, f(t)),
      color: neg ? (colours.neg || C.coral) : (colours.pos || C.teal), opacity: 0.32 })
  }
  return items
}
const trail = (a, b) => {
  const pts = []
  const n = Math.max(2, Math.round((b - a) * 20))
  for (let i = 0; i <= n; i++) { const t = a + ((b - a) * i) / n; pts.push([t, S(t)]) }
  return pts
}

const graphBase = {
  bounds: { left: -0.5, right: 7.6, bottom: -5.2, top: 13 },
  axes: { x: 't', y: 'v', aspect: 'fill', xStep: 1, yStep: 2 },
}
const vCurve = (fold = 0, dashFrom = TMAX) => [
  { type: 'curve', f: (t) => [t, v(t)], t: [0, TMAX], color: C.teal, width: 4, dash: fold > 0 },
  ...(fold > 0 ? [{ type: 'curve', f: (t) => [t, v(t) < 0 ? v(t) * (1 - 2 * fold) : v(t)], t: [0, dashFrom], color: C.strip, width: 4 }] : []),
]
const cursor = (t, param) => [
  { type: 'line', x1: t, x2: t, y1: -5, y2: 12.6, color: C.sel, width: 2, dash: true, ghost: true },
  param ? { type: 'handle', x: t, y: 0, color: C.sel, drag: { param, axis: 'x' } } : { type: 'points', pts: [[t, 0]], color: C.sel, r: 7 },
]

const casioDistance = (a, b) => ({
  sections: [
    { goal: `Find the distance travelled for $${a}\\le t\\le ${b}$`, steps: [
      `${k('MENU')} ${k('1')}: Run-Matrix. Wait for the screen before pressing anything else`,
      `${k('OPTN')} ${k('F4')} (CALC) ${k('F4')} (∫dx). The cursor starts in the integrand`,
      `${k('OPTN')} ${k('F6')} (▷) ${k('F4')} (NUMERIC) ${k('F1')} (Abs)`,
      `Type ${X} ${k('x²')} ${k('−')} ${e('8')} ${X} ${k('+')} ${e('12')}`,
      `${k('→')} once to leave Abs`,
      `${k('→')} lower limit ${e(a)}, ${k('→')} upper limit ${e(b)}`,
      `${k('EXE')}. The display shows ${Number(total(a, b).toFixed(9))}`,
    ] },
  ],
  watch: 'Without Abs the calculator returns the displacement, and the area below the axis is subtracted.',
})

export default {
  course: 'mai-hl', unit: 12, lesson: 2, slug: 'signed-area',
  title: 'Displacement or distance: signed area and |v|',
  idea: 'Signed area under $v$ is displacement. Area under $|v|$ is distance.',
  params: {
    t: { type: 'range', label: 'Time', min: 0, max: TMAX, step: 0.05, value: 0, show: (x) => `t = ${x.toFixed(2)} s` },
    fold: { type: 'range', label: 'Fold to |v|', min: 0, max: 1, step: 0.01, value: 0, hidden: true },
    t1: { type: 'range', label: 'From', min: 0, max: TMAX, step: 0.5, value: 0, show: (x) => `t₁ = ${x}`, },
    t2: { type: 'range', label: 'To', min: 0, max: TMAX, step: 0.5, value: 6, show: (x) => `t₂ = ${x}` },
    wrong: { type: 'toggle', label: 'Common mistake: $\\int v\\,dt$ for distance', value: false },
  },
  scenes: [
    {
      id: 'signed', title: 'Signed area is displacement',
      controls: ['t'],
      stops: [
        { kind: 'I', caption: 'The car starts at O. As time runs, the area between the graph of $v$ and the $t$-axis is shaded: teal above the axis, coral below.',
          set: { t: 0 }, play: { param: 't', to: TMAX, seconds: 9 } },
        { kind: 'P', caption: 'Drag the orange cursor along the $t$-axis. Compare the shaded area with where the car is.',
          look: [
            'While the area is teal the car moves right. While it is coral the car moves back.',
            'At $t=2$ and $t=6$, $v=0$. The car stops and turns.',
            'The car is always at the signed area from $0$ to $t$, because it started at O.',
          ],
          steps: ['Set $t=2$. The area is $\\frac{32}{3}$: the furthest right the car gets.', 'Set $t=6$. The signed area is $0$, and the car is back at O.'] },
        { kind: 'S', caption: 'At $t=6$ the coral area cancels the teal area exactly. The displacement is $0$, but the car has clearly moved.',
          set: { t: 6 },
          cards: [
            { title: 'Displacement is the signed area', html: '$\\int_0^6 v\\,dt=\\frac{32}{3}-\\frac{32}{3}=0$', tone: 'teal' },
            { title: 'Position', html: '$s(6)=s(0)+\\int_0^6 v\\,dt=0+0=0$', tone: 'muted' },
          ] },
      ],
      stage: ({ v: p }) => {
        const t = p.t
        const parts = [[0, 2], [2, 6], [6, TMAX]].filter(([a]) => t > a + 1e-6)
        return {
          track: { min: -1, max: 12, step: 1, s: S(t), v: v(t), trail: trail(0, t) },
          graph: {
            ...graphBase,
            items: [...runs(0, t), ...vCurve(), ...cursor(t, 't')],
            labels: [
              { id: 'v', x: 6.9, y: v(6.9), html: '$v=(t-2)(t-6)$', color: C.teal, pos: 'nw' },
              ...parts.map(([a, b]) => {
                const end = Math.min(t, b)
                const area = signed(a, end)
                return { id: `a${a}`, x: (a + end) / 2, y: area >= 0 ? 2.2 : -2.6, html: `$${area >= 0 ? '+' : ''}${q(area).replace('\\approx ', '')}$`, color: area >= 0 ? C.teal : C.coral, plain: true, fixed: true }
              }),
            ],
          },
        }
      },
      readout: ({ v: p }) => `$t=${p.t.toFixed(2)}$  ·  signed area $${eqv(signed(0, p.t)).replace(/^=/, '')}$  ·  position $s${eqv(S(p.t))}$ m`,
      working: () => ({ blocks: [
        ['Position from velocity, with $s(0)=0$', T`s(t)&=\int v\,dt\\&=\frac{t^3}{3}-4t^2+12t+c\\s(0)=0\Rightarrow c&=0`],
        ['Split at the roots of $v$: $t=2$ and $t=6$', T`\int_0^2 v\,dt&=\frac{32}{3}\\\int_2^6 v\,dt&=-\frac{32}{3}`],
        ['Displacement over $0\\le t\\le 6$', T`\int_0^6 v\,dt&=\frac{32}{3}-\frac{32}{3}\\&=0\text{ m}`, true],
      ], note: 'The car is at O again at t = 6, so its displacement is 0, even though it has travelled.' }),
      keys: () => ({ sections: [
        { goal: 'Find the displacement for $0\\le t\\le 6$', steps: [
          `${k('MENU')} ${k('1')}: Run-Matrix. Wait for the screen before pressing anything else`,
          `${k('OPTN')} ${k('F4')} (CALC) ${k('F4')} (∫dx). The cursor starts in the integrand`,
          `Type ${X} ${k('x²')} ${k('−')} ${e('8')} ${X} ${k('+')} ${e('12')}`,
          `${k('→')} lower limit ${e('0')}, ${k('→')} upper limit ${e('6')}`,
          `${k('EXE')}. The display shows 0`,
        ] },
      ], watch: 'The fx-CG50 integrates in X: type X for t.' }),
    },
    {
      id: 'distance', title: 'Distance needs |v|',
      controls: ['t1', 't2'],
      stops: [
        { kind: 'I', caption: 'Over $0\\le t\\le 6$ the car ends where it started, so its displacement is $0$ m.',
          set: { t1: 0, t2: 6, fold: 0, wrong: false },
          predict: { q: 'How far did the car actually travel in those 6 seconds?', choices: ['$0$ m', '$\\frac{32}{3}$ m', '$\\frac{64}{3}$ m'], correct: 2,
            a: '$\\frac{64}{3}\\approx 21.3$ m. It went $\\frac{32}{3}$ m right, then $\\frac{32}{3}$ m back. Distance counts both, so the coral area folds up above the axis: that is the graph of $|v|$.' },
          play: { param: 'fold', to: 1, seconds: 2.5 } },
        { kind: 'P', caption: 'Drag the two orange handles to choose an interval. The odometer shows the distance on that interval.',
          set: { fold: 1 },
          look: [
            'Distance is never less than the size of the displacement.',
            'They are equal only when $v$ has no root inside the interval, so the car never turns.',
            'By hand: split at the roots of $v$ inside the interval and add the sizes of the areas.',
          ],
          steps: ['Set $0\\le t\\le 7$: displacement $\\frac{7}{3}$, distance $\\frac{71}{3}$.', 'Set $6\\le t\\le 7$: no turn inside, so the two agree.', 'Switch on the common mistake and compare the two numbers under the graph.'],
          mistake: { param: 'wrong',
            what: 'For distance, they use $\\int v\\,dt$: the same integral as for displacement.',
            why: 'Where $v<0$ the car moves back. The integral counts that coral area as negative, so the trip back is subtracted, not added.',
            fix: 'Integrate $|v|$ (Abs on the calculator), or split at the roots of $v$ and add the sizes of the pieces.' } },
        { kind: 'S', caption: 'The whole trip: the car ends $\\frac{7}{3}$ m right of O, but the odometer reads $\\frac{71}{3}$ m.',
          set: { t1: 0, t2: 7, fold: 1, wrong: false },
          cards: [
            { title: 'Displacement', html: '$\\int_0^7 v\\,dt=\\frac{32}{3}-\\frac{32}{3}+\\frac{7}{3}=\\frac{7}{3}$', tone: 'teal' },
            { title: 'Distance', html: '$\\int_0^7 |v|\\,dt=\\frac{32}{3}+\\frac{32}{3}+\\frac{7}{3}=\\frac{71}{3}$', tone: 'sel' },
          ] },
        { kind: 'S', caption: 'The mistake: $\\int_0^7 v\\,dt$ subtracts the coral area and gives $\\frac{7}{3}$ for the distance. On the calculator, put $v$ inside Abs.',
          set: { t1: 0, t2: 7, fold: 1, wrong: true },
          cards: [
            { title: 'In the markscheme', html: 'M1 is for using $|v|$, or for splitting into separate integrals. $\\int v\\,dt$ for distance loses every later mark.', tone: 'coral' },
          ] },
      ],
      stage: ({ v: p, stop, picked }) => {
        const a = Math.min(p.t1, p.t2)
        const b = Math.max(p.t1, p.t2)
        const waiting = stop.predict && picked == null
        const fold = p.wrong ? 0 : p.fold
        const dist = total(a, b)
        return {
          track: { min: -1, max: 12, step: 1, s: S(b), v: 0, trail: trail(a, b), ghost: S(a), ghostLabel: 'start',
            odometer: waiting ? null : dist },
          graph: {
            ...graphBase,
            items: [
              ...runs(a, b, fold, p.wrong ? { neg: C.coral } : {}),
              ...vCurve(fold),
              ...(p.wrong ? [{ type: 'curve', f: (t) => [t, -v(t)], t: [2, 6], color: C.strip, width: 3, dash: true }] : []),
              ...cursor(a, stop.kind === 'P' ? (p.t1 <= p.t2 ? 't1' : 't2') : null),
              ...cursor(b, stop.kind === 'P' ? (p.t1 <= p.t2 ? 't2' : 't1') : null),
            ],
            labels: [
              { id: 'v', x: 6.9, y: v(6.9), html: '$v$', color: C.teal, pos: 'se' },
              ...(fold > 0.5 ? [{ id: 'abs', x: 4, y: 4 * fold, html: '$|v|$', color: C.strip, pos: 'n' }] : []),
              ...(p.wrong && a < 6 && b > 2 ? [{ id: 'sub', x: (Math.max(a, 2) + Math.min(b, 6)) / 2, y: -2.7, html: 'subtracted', color: C.coral, plain: true, fixed: true }] : []),
            ],
          },
        }
      },
      readout: ({ v: p, stop, picked }) => {
        const a = Math.min(p.t1, p.t2)
        const b = Math.max(p.t1, p.t2)
        if (stop.predict && picked == null) return `$${a}\\le t\\le ${b}$  ·  displacement $${q(signed(a, b))}$ m  ·  distance $?$`
        if (p.wrong) return `$${a}\\le t\\le ${b}$  ·  the mistake: $\\int v\\,dt${eqv(signed(a, b))}$ m  ·  odometer $${q(total(a, b))}$ m`
        return `$${a}\\le t\\le ${b}$  ·  displacement $${q(signed(a, b))}$ m  ·  distance $${q(total(a, b))}$ m`
      },
      working: ({ v: p }) => {
        const a = Math.min(p.t1, p.t2)
        const b = Math.max(p.t1, p.t2)
        const inside = ROOTS.filter((r) => r > a && r < b)
        const cuts = [a, ...inside, b]
        const pieces = cuts.slice(1).map((c, i) => signed(cuts[i], c))
        const split = pieces.map((_, i) => T`\left|\int_{${cuts[i]}}^{${cuts[i + 1]}} v\,dt\right|`).join('+')
        return { blocks: [
          [`Roots of $v$ inside $${a}\\le t\\le ${b}$`, inside.length ? T`t&=${inside.join(',\\ ')}` : T`&\text{none}`],
          ['Displacement', T`\int_{${a}}^{${b}} v\,dt&=${q(signed(a, b))}`],
          ['Distance: split at the roots, add the sizes', T`\int_{${a}}^{${b}} |v|\,dt&=${split}\\&=${pieces.map((x) => q(Math.abs(x))).join('+')}\\&=${q(total(a, b))}\text{ m}`, true],
        ], note: inside.length ? 'Each piece has one sign, so its size is the distance on that piece.' : 'No root inside: the car never turns, so the distance is the size of the displacement.' }
      },
      keys: ({ v: p }) => casioDistance(Math.min(p.t1, p.t2), Math.max(p.t1, p.t2)),
    },
  ],
}
