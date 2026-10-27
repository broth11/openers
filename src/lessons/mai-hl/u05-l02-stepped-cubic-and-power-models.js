// Unit 5 Lesson 2, STEPPED proof of concept (tag: 'stepped'). Same six scenes and same maths as
// u05-l02-cubic-and-power-models.js, reworked to the beat-driven authoring model so Ben can compare
// the two side by side in the menu. The original file is left untouched.
//
// What is different here (see docs/OPENERS-STEPPED.md for the full model):
//   - The left pane POSES questions only. There is no Show answer button and no answer text there.
//   - Each context scene has a `beats` array. Stepping the scene (arrows / dots) advances a beat.
//     A beat optionally `poses` one question id; the graph reads `beat` (via `shown(id)`, which here
//     means "this question has been posed"), exactly as the original graph functions already did.
//   - A posed question's answer lives entirely in the working pane, revealed one `step` at a time
//     with Next / Back. Steps are cumulative. A step may carry a `cue(ctx)` that adds transient
//     items/labels to the graph while that step is showing.
//   - Casio keypresses are per question (`prompt.keys`), reached by the Working / Casio toggle.
//   - Scenes 4 to 6 are the recap explorers, unchanged: cards that follow the controls, no beats.
//
// Every exact value is the same as the original and is checked in qa/verify-u05-l02.py.
import { COLORS as C } from '../../kit/style.js'
import { fmt } from '../../kit/math.js'
import { drawMall, drawJars, drawLamp } from '../../components/context-stage/index.js'
import { polyGraph, polyCards, polyEquation, rootsFor, freeHandles } from '../../components/polynomial/index.js'
import { powerGraph, directCards, inverseCards, topFor, powerTex } from '../../components/power-family/index.js'

// ---------- models (identical to the original)
export const crowd = (t) => 2 * t ** 3 - 27 * t ** 2 + 108 * t + 20
export const quad = (t) => -9 * t ** 2 + 72 * t + 20
export const COUNTS = [[0, 20], [3, 155], [6, 128]]
export const LATE = [9, 263]
const clock = (t) => {
  const m = Math.round((10 + t) * 60)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
const people = (V) => `${Math.round(V * 100).toLocaleString('en-US').replace(/,/g, ' ')}`
const JAR = { h: (s) => 20 * s, w: (s) => 2 * s * s, both: (s) => 0.2 * s ** 3 }
const lux = (d) => 400 / d ** 2

// ---------- calculator panels (identical content, now attached per question)
const k = (s) => `<span class="key">${s}</span>`
const e = (s) => `<span class="entry">${s}</span>`
const row = (n, ...vals) => `Row ${n}: ${vals.map((x) => e(x)).join(` ${k('EXE')} `)} ${k('EXE')}`
const openEquation = `${k('MENU')}, wait for the main menu, then ${k('X,θ,T')} (Equation, icon A)`
const quadKeys = {
  sections: [
    { goal: 'Solve the system of equations', steps: [openEquation, `${k('F1')} (SIMUL), then ${k('F1')} (2 unknowns)`, row(1, '9', '3', '135'), row(2, '36', '6', '108'), `${k('F1')} (SOLVE)`] },
  ],
  out: 'X = −9, Y = 72, so a = −9, b = 72',
  watch: `Subtract the free 20 first: the right-hand sides are ${e('155 − 20')} and ${e('128 − 20')}. The answers are labelled X and Y: X is your a, Y is your b.`,
}
const cubicKeys = {
  sections: [
    { goal: 'Solve the system of equations', steps: [openEquation, `${k('F1')} (SIMUL), then ${k('F2')} (3 unknowns)`, row(1, '27', '9', '3', '135'), row(2, '216', '36', '6', '108'), row(3, '729', '81', '9', '243'), `${k('F1')} (SOLVE)`] },
  ],
  out: 'X = 2, Y = −27, Z = 108, so a = 2, b = −27, c = 108',
  watch: 'The right-hand sides are each count minus d = 20. X, Y, and Z are your a, b, and c.',
}

// ---------- graph functions (unchanged: they already gate on shown(id), which now means "posed")
function mallGraph({ v, shown }) {
  const t = v.time
  const items = [{ type: 'line', x1: t, y1: -110, x2: t, y2: 430, color: C.muted, width: 2, dash: true, ghost: true }]
  const labels = []
  const pts = shown('m1') ? [...COUNTS, LATE] : COUNTS
  if (shown('m1')) {
    items.push({ type: 'curve', f: (x) => [x, quad(x)], t: [-0.3, 10.4], color: C.coral, width: shown('m4') ? 3 : 4, dash: shown('m4') })
    labels.push({ id: 'quad', x: 7.4, y: quad(7.4), html: '$V=-9t^2+72t+20$', color: C.coral, pos: 'sw' })
  }
  if (shown('m4')) {
    items.push({ type: 'curve', f: (x) => [x, crowd(x)], t: [-0.2, 10.4], color: C.teal })
    items.push({ type: 'line', x1: -0.6, y1: crowd(t), x2: t, y2: crowd(t), color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'points', pts: [[t, crowd(t)]], color: C.teal, r: 9, ghost: true })
    labels.push({ id: 'cubic', x: 9.6, y: crowd(9.6), html: '$V=2t^3-27t^2+108t+20$', color: C.teal, pos: 'w' })
  }
  items.push({ type: 'points', pts, color: C.sel, r: 7 })
  for (const [x, y] of pts) labels.push({ id: `c-${x}`, x, y, html: `$(${x},\\,${y})$`, color: C.sel, pos: x === 0 ? 'ne' : 'n', attached: true })
  return {
    bounds: { left: -0.6, right: 10.4, bottom: -110, top: 430 },
    axes: { x: 't', y: 'V', aspect: 48, xStep: 1, yStep: 100 },
    description: 'Shoppers inside the mall, in hundreds, against hours after 10:00, beside a drawing of the mall.',
    items, labels,
    scene: { frac: 0.36, draw: (api) => drawMall(api, { V: crowd(t), clock: clock(t), t, tEnd: 10, roofV: 360 }) },
  }
}

function jarGraph({ v, shown }) {
  const items = []
  const labels = []
  const s = v.size
  const mode = v.grow
  if (shown('j1')) {
    for (const [id, f, name, eq, gate] of [
      ['h', JAR.h, 'taller only', '$N=20h$', 'j2'],
      ['w', JAR.w, 'wider only', '$N=2w^2$', 'j2'],
      ['both', JAR.both, 'same shape', '$N=0.2h^3$', 'j3'],
    ]) {
      const on = id === mode
      items.push({ type: 'curve', f: (x) => [x, f(x)], t: [0, 21], color: on ? C.teal : C.muted, width: on ? 4 : 2, dash: !on })
      const lx = id === 'h' ? 17 : id === 'w' ? 15.5 : 17.5
      labels.push({ id: `j-${id}`, x: lx, y: f(lx), html: shown(gate) ? `${name}: ${eq}` : name, color: on ? C.teal : C.muted, pos: id === 'h' ? 'n' : 'nw', plain: !on })
    }
    items.push({ type: 'line', x1: s, y1: 0, x2: s, y2: JAR[mode](s), color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'points', pts: [[s, JAR[mode](s)]], color: C.sel, r: 9, ghost: true })
  }
  items.push({ type: 'points', pts: [[10, 200]], color: C.strip, r: 7 })
  labels.push({ id: 'ref', x: 10, y: 200, html: '$(10,\\,200)$', color: C.strip, pos: 'nw', attached: true })
  const big = !shown('j1') ? null : mode === 'h' ? { h: s, w: 10 } : mode === 'w' ? { h: 10, w: s } : { h: s, w: s }
  return {
    bounds: { left: -2.6, right: 22.6, bottom: -230, top: 1820 },
    axes: { x: 'size (cm)', y: 'N', aspect: 72, xStep: 5, yStep: 200, nonnegative: true },
    description: 'Number of jelly beans against the size of the jar, beside a drawing of the jars.',
    items, labels,
    scene: {
      frac: 0.48,
      draw: (api) => drawJars(api, {
        ref: { h: 10, w: 10, N: 200 },
        jar: big ? { ...big, N: JAR[mode](s), filled: true } : null,
        target: big ? null : { h: 20, w: 20 },
        maxCm: 20,
      }),
    },
  }
}

function lampGraph({ v, shown }) {
  const d = shown('l1') ? v.dist : 2
  const items = []
  const labels = []
  if (shown('l2')) {
    if (v.cmp === 'on') {
      items.push({ type: 'curve', f: (x) => [x, 200 / x], t: [200 / 480, 6.6], color: C.coral, width: 3, dash: true })
      labels.push({ id: 'cmp', x: 5.6, y: 200 / 5.6, html: 'if $I=\\dfrac{200}{d}$', color: C.coral, pos: 'n' })
    }
    items.push({ type: 'curve', f: (x) => [x, lux(x)], t: [Math.sqrt(400 / 480), 6.6], color: C.teal })
    labels.push({ id: 'law', x: 1.4, y: lux(1.4), html: '$I=\\dfrac{400}{d^2}$', color: C.teal, pos: 'ne' })
  }
  if (shown('l1')) {
    items.push({ type: 'line', x1: d, y1: 0, x2: d, y2: lux(d), color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'points', pts: [[d, lux(d)]], color: C.sel, r: 9, ghost: true })
    items.push({ type: 'points', pts: [[4, 25]], color: C.strip, r: 7 })
    labels.push({ id: 'p4', x: 4, y: 25, html: '$(4,\\,25)$', color: C.strip, pos: 'n', attached: true })
  }
  items.push({ type: 'points', pts: [[2, 100]], color: C.strip, r: 7 })
  labels.push({ id: 'p2', x: 2, y: 100, html: '$(2,\\,100)$', color: C.strip, pos: 'ne', attached: true })
  return {
    bounds: { left: -0.9, right: 6.6, bottom: -20, top: 470 },
    axes: { x: 'd (m)', y: 'I (lux)', aspect: 95, xStep: 1, yStep: 50, nonnegative: true },
    description: 'Light meter reading in lux against distance from the lamp in metres, beside a drawing of the experiment.',
    items, labels,
    scene: { frac: 0.44, draw: (api) => drawLamp(api, { d, I: lux(d), maxD: 6, spread: v.spread === 'on' }) },
  }
}

// ---------- graph cues: small transient overlays a working step can add to the beat's graph.
// A cue highlights the point a step is about, without changing the persistent beat state.
const dot = (x, y, color) => ({ items: [{ type: 'points', pts: [[x, y]], color, r: 11, hollow: true }] })
const mallCue = (x) => dot(x, crowd(x), C.sel)

// ---------- recap state helpers (identical to the original)
const polyState = (v) => {
  const deg = +v.deg
  const a = (v.sign === '-' ? -1 : 1) * v.amag
  const base = [v.p, v.q, v.r, v.s]
  return { deg, a, roots: rootsFor(deg, base, v.rep), shift: v.form === 'std' ? v.shift : 0, form: v.form, rep: v.rep, handles: freeHandles(deg, base, v.rep) }
}
const directState = (v) => ({ k: v.dk, n: +v.dn, doubling: v.ddbl === 'on', table: v.dtab === 'on', notDirect: v.dnot === 'on' })
const inverseState = (v) => {
  const negative = v.iall === 'on'
  const n = negative ? +v.iun : -+v.inn
  return { k: v.ik, n, doubling: v.idbl === 'on', table: v.itab === 'on', asymptotes: v.iasy === 'on', negative }
}
const OFF_ON = [['off', 'Off'], ['on', 'On']]

export default {
  course: 'mai-hl', unit: 5, lesson: 2,
  tag: 'stepped', tagLabel: 'Stepped',
  title: 'Cubic fitting, direct and inverse variation', engine: 'svg',
  bridge: 'Lesson 1: fit a quadratic from three conditions with a system of equations.',
  params: {
    time: { type: 'range', label: 'Clock', min: 0, max: 10, step: 0.05, value: 0, show: (v) => `${clock(v)}  ($t=${v.toFixed(2)}$)`, sel: true, play: { seconds: 12 } },
    deg: { type: 'seg', label: 'Degree', options: [['2', '2'], ['3', '3'], ['4', '4']], value: '3' },
    form: { type: 'seg', label: 'Form', options: [['fact', 'Factored'], ['std', 'Standard']], value: 'fact' },
    sign: { type: 'seg', label: 'Leading coefficient', options: [['+', 'a > 0'], ['-', 'a < 0']], value: '+' },
    amag: { type: 'range', label: 'Size of a', min: 0.1, max: 1.5, step: 0.05, value: 0.4, show: (v, all) => `$a=${all.sign === '-' ? '-' : ''}${fmt(v, 2)}$` },
    rep: { type: 'seg', label: 'Repeated roots', options: [['none', 'None'], ['double', 'Double'], ['two', 'Two doubles'], ['triple', 'Triple']], value: 'none' },
    shift: { type: 'range', label: 'Add a constant', min: -8, max: 8, step: 0.1, value: 0, show: (v) => `$${v >= 0 ? '+' : ''}${fmt(v, 1)}$`, sel: true },
    p: { type: 'range', label: 'p', min: -4.5, max: 4.5, step: 0.1, value: -3.5 },
    q: { type: 'range', label: 'q', min: -4.5, max: 4.5, step: 0.1, value: -1 },
    r: { type: 'range', label: 'r', min: -4.5, max: 4.5, step: 0.1, value: 1.5 },
    s: { type: 'range', label: 's', min: -4.5, max: 4.5, step: 0.1, value: 3.5 },
    grow: { type: 'seg', label: 'Grow', options: [['h', 'Taller only'], ['w', 'Wider only'], ['both', 'Same shape']], value: 'both' },
    size: { type: 'range', label: 'Growing dimension', min: 5, max: 20, step: 0.1, value: 10, show: (v) => `${fmt(v, 1)} cm`, sel: true, play: { seconds: 8 } },
    dn: { type: 'seg', label: 'Power n', options: [['0.5', '½'], ['1', '1'], ['2', '2'], ['3', '3']], value: '3' },
    dk: { type: 'range', label: 'k', min: 0.5, max: 4, step: 0.1, value: 1, show: (v) => `$k=${fmt(v, 1)}$` },
    ddbl: { type: 'seg', label: 'Double x', options: OFF_ON, value: 'on' },
    dtab: { type: 'seg', label: 'Ratio test', options: OFF_ON, value: 'off' },
    dnot: { type: 'seg', label: 'Not direct', options: OFF_ON, value: 'off' },
    dist: { type: 'range', label: 'Distance from the lamp', min: 0.5, max: 6, step: 0.05, value: 2, show: (v) => `${fmt(v, 2)} m`, sel: true, play: { seconds: 8 } },
    spread: { type: 'seg', label: 'Why the square?', options: OFF_ON, value: 'off' },
    cmp: { type: 'seg', label: 'Compare 1/d', options: OFF_ON, value: 'off' },
    inn: { type: 'seg', label: 'Power', options: [['1', '1/x'], ['2', '1/x²'], ['3', '1/x³']], value: '2' },
    iun: { type: 'seg', label: 'n in y = kxⁿ', options: [['-3', '−3'], ['-2', '−2'], ['-1', '−1'], ['1', '1'], ['2', '2'], ['3', '3']], value: '-2' },
    ik: { type: 'range', label: 'k', min: 0.5, max: 4, step: 0.1, value: 2, show: (v) => `$k=${fmt(v, 1)}$` },
    idbl: { type: 'seg', label: 'Double x', options: OFF_ON, value: 'on' },
    itab: { type: 'seg', label: 'Product test', options: OFF_ON, value: 'off' },
    iasy: { type: 'seg', label: 'Asymptotes', options: OFF_ON, value: 'off' },
    iall: { type: 'seg', label: 'As y = kxⁿ', options: OFF_ON, value: 'off' },
  },
  scenes: [
    // ---------- scene 1: mall crowds (4 beats, each poses one question)
    {
      id: 'mall', short: 'Mall crowds',
      heading: 'Shoppers inside a Bangkok mall on a Saturday. Can one curve model the whole day?',
      readout: ({ v, shown }) => {
        const t = v.time
        if (shown('m4')) return `${clock(t)}: the cubic gives $V=${fmt(crowd(t), 1)}$, about ${people(crowd(t))} shoppers`
        if (shown('m1')) return `${clock(t)}: the quadratic gives $V=${fmt(quad(t), 1)}$`
        return `${clock(t)}: $V$ is shoppers inside, in hundreds; $t$ is hours after 10:00.`
      },
      controls: ['time'],
      beats: [
        { poses: 'm1' },
        { poses: 'm2' },
        { poses: 'm3' },
        { poses: 'm4' },
      ],
      prompts: [
        {
          id: 'm1', q: 'Fit $V=at^2+bt+c$ through $(0,20)$, $(3,155)$, and $(6,128)$.',
          steps: [
            { caption: 'Free coefficient', latex: 'V(0)&=20\\\\c&=20' },
            { caption: 'Substitute (3, 155) and (6, 128)', latex: '9a+3b+20&=155\\\\36a+6b+20&=128' },
            { caption: 'Move the constants to one side', latex: '9a+3b&=135\\\\36a+6b&=108' },
            { caption: 'Model', latex: 'V&=-9t^2+72t+20', answer: true, note: 'Three conditions fix the three coefficients of a quadratic.' },
          ],
          keys: quadKeys,
        },
        {
          id: 'm2', q: 'At 19:00 the count is $(9,263)$. What does the quadratic give?',
          choices: ['about $263$', 'more than $263$', 'a negative crowd'], correct: 2,
          steps: [
            { caption: 'Evaluate the quadratic at t = 9', latex: 'V(9)&=-9(9)^2+72(9)+20', cue: () => mallCue(9) },
            { caption: 'Simplify', latex: 'V(9)&=-729+648+20\\\\&=-61', answer: true, note: 'A negative crowd: the quadratic has already turned back down.', cue: () => mallCue(9) },
          ],
        },
        {
          id: 'm3', q: 'Why can no quadratic model the whole day?',
          steps: [
            { caption: 'A quadratic has one turning point', note: 'It rises to a single maximum, then only falls.' },
            { caption: 'The day needs two turning points', note: 'The crowd rises, falls, then rises again: that needs at least a cubic.', answer: true },
          ],
        },
        {
          id: 'm4', q: 'Write down $d$ and three equations for $V=at^3+bt^2+ct+d$. Find the model.',
          steps: [
            { caption: 'Free coefficient', latex: 'V(0)&=20\\\\d&=20' },
            { caption: 'Substitute the other counts', latex: '27a+9b+3c+20&=155\\\\216a+36b+6c+20&=128\\\\729a+81b+9c+20&=263' },
            { caption: 'Move the constants to one side', latex: '27a+9b+3c&=135\\\\216a+36b+6c&=108\\\\729a+81b+9c&=243' },
            { caption: 'Model', latex: 'V&=2t^3-27t^2+108t+20', answer: true, note: 'Turning points at 13:00 and 16:00. The cubic keeps rising after 16:00, so it cannot model closing time either, but it fits every given count.' },
          ],
          keys: cubicKeys,
        },
      ],
      graph: mallGraph,
    },
    // ---------- scene 2: jelly beans (3 beats)
    {
      id: 'jars', short: 'Jelly beans',
      heading: 'A 10 cm jar holds 200 jelly beans. The competition jar is the same shape, 20 cm tall and 20 cm wide.',
      readout: ({ v, shown }) => {
        if (!shown('j1')) return 'Predict before you grow the jar.'
        const s = v.size
        const dims = v.grow === 'h' ? `${fmt(s, 1)} cm tall, 10 cm wide` : v.grow === 'w' ? `10 cm tall, ${fmt(s, 1)} cm wide` : `${fmt(s, 1)} cm tall and wide`
        return `${dims}: $N=${fmt(JAR[v.grow](s), 1)}$ beans`
      },
      controls: ({ shown }) => (shown('j1') ? ['grow', 'size'] : []),
      beats: [
        { poses: 'j1' },
        { poses: 'j2' },
        { poses: 'j3' },
      ],
      prompts: [
        {
          id: 'j1', q: 'Predict: how many beans fit in the competition jar?',
          choices: ['$400$', '$800$', '$1600$'], correct: 2,
          steps: [
            { caption: 'Every length doubles', latex: '10\\text{ cm}\\ \\to\\ 20\\text{ cm}' },
            { caption: 'Volume scales by the cube', latex: '2^3&=8\\\\200\\times 8&=1600', answer: true, note: 'Lengths $\\times 2$, areas $\\times 4$, volumes $\\times 8$.' },
          ],
        },
        {
          id: 'j2', q: 'Use the Grow switch. Which jars give $400$ and $800$?',
          steps: [
            { caption: 'Taller only', latex: 'N&=20h\\\\N(20)&=400', note: 'Doubling the height alone doubles the count: $N\\propto h$.' },
            { caption: 'Wider only', latex: 'N&=2w^2\\\\N(20)&=800', answer: true, note: 'Doubling the width alone makes the base area four times as big: $N\\propto w^2$.' },
          ],
        },
        {
          id: 'j3', q: 'For same-shape jars, $N$ is directly proportional to $h^3$. Write $N$ in terms of $h$.',
          steps: [
            { caption: 'Direct variation', latex: 'N&=kh^3' },
            { caption: 'Substitute (10, 200)', latex: '200&=k(10)^3\\\\k&=\\frac{200}{1000}\\\\&=0.2' },
            { caption: 'Model', latex: 'N&=0.2h^3', answer: true, note: 'Check: $N(20)=0.2(20)^3=1600$.' },
          ],
          keys: {
            sections: [{ goal: 'Evaluate $k$', steps: [`${k('MENU')} ${k('1')} (Run-Matrix)`, `Type ${e('200')} ${k('÷')} ${e('10')} ${k('^')} ${e('3')} ${k('EXE')}`] }],
            out: '0.2',
            watch: 'Type the power with the ^ key, so the calculator divides by 1000, not by 10.',
          },
        },
      ],
      graph: jarGraph,
    },
    // ---------- scene 3: inverse square law (3 beats)
    {
      id: 'lamp', short: 'Inverse square law',
      heading: 'The inverse square law. A light meter reads 100 lux at 2 m from a lamp.',
      readout: ({ v, shown }) => {
        if (!shown('l1')) return 'Predict before you move the meter.'
        const d = v.dist
        return `$d=${fmt(d, 2)}$ m: $I=${fmt(lux(d), 1)}$ lux`
      },
      controls: ({ shown }) => (shown('l2') ? ['dist', 'spread', 'cmp'] : shown('l1') ? ['dist', 'spread'] : []),
      beats: [
        { poses: 'l1' },
        { poses: 'l2' },
        { poses: 'l3' },
      ],
      prompts: [
        {
          id: 'l1', q: 'Predict: what does the meter read at 4 m?',
          choices: ['$50$ lux', '$25$ lux', '$12.5$ lux'], correct: 1,
          steps: [
            { caption: 'Twice as far', latex: '2\\text{ m}\\ \\to\\ 4\\text{ m}' },
            { caption: 'The same light covers four times the area', latex: '2^2&=4\\\\\\frac{100}{4}&=25\\text{ lux}', answer: true, note: 'Spread over $2^2=4$ times the area, so a quarter as bright.' },
          ],
        },
        {
          id: 'l2', q: '$I$ is inversely proportional to $d^2$. Find $k$ and write the model.',
          steps: [
            { caption: 'Inverse square', latex: 'I&=\\frac{k}{d^2}' },
            { caption: 'Substitute (2, 100)', latex: 'k&=100\\times 2^2\\\\&=400' },
            { caption: 'Model', latex: 'I&=\\frac{400}{d^2}', answer: true, note: '$k=I\\times d^2$ is the same for every reading.' },
          ],
        },
        {
          id: 'l3', q: 'How far from the lamp is the reading $16$ lux?',
          steps: [
            { caption: 'Set I = 16', latex: '16&=\\frac{400}{d^2}' },
            { caption: 'Solve for d', latex: 'd^2&=\\frac{400}{16}\\\\&=25\\\\d&=5\\text{ m}', answer: true, note: 'Reject $-5$: a distance is positive.' },
          ],
          keys: {
            sections: [{ goal: 'Find the distance', steps: [`${k('MENU')} ${k('1')} (Run-Matrix)`, `${k('SHIFT')} ${k('x²')} (√), then type ${e('400')} ${k('÷')} ${e('16')} ${k('EXE')}`] }],
            out: '5',
            watch: 'The calculator gives only the positive root here. In a written solution, say why the negative root is rejected.',
          },
        },
      ],
      graph: lampGraph,
    },
    // ---------- scenes 4 to 6: recap explorers, unchanged (no beats, cards follow the controls)
    {
      id: 'poly', short: 'Polynomial recap',
      heading: 'Polynomials: change the degree, the leading coefficient, and the roots. Drag a root along the axis; scroll to zoom, drag the grid to pan.',
      readout: ({ v }) => `$${polyEquation(polyState(v))}$`,
      controls: ({ v }) => (v.form === 'fact' ? ['deg', 'form', 'sign', 'amag', 'rep'] : ['deg', 'form', 'sign', 'amag', 'shift']),
      cardsTitle: 'Polynomial recap',
      cards: ({ v }) => polyCards(polyState(v)),
      graph: ({ v }) => polyGraph(polyState(v)),
    },
    {
      id: 'direct', short: 'Direct family',
      heading: 'Direct variation: $y=kx^n$ with $n>0$.',
      readout: ({ v }) => { const st = directState(v); return `$${powerTex(st.k, st.n)}$: doubling $x$ multiplies $y$ by $2^{${st.n === 0.5 ? '\\frac{1}{2}' : st.n}}=${fmt(2 ** st.n, 3)}$` },
      controls: ['dn', 'dk', 'ddbl', 'dtab', 'dnot'],
      cardsTitle: 'Direct variation recap',
      cards: ({ v }) => directCards(directState(v)),
      graph: ({ v }) => { const st = directState(v); return powerGraph({ ...st, top: topFor(st.n, 4) }) },
    },
    {
      id: 'inverse', short: 'Inverse family',
      heading: 'Inverse variation: $y=\\dfrac{k}{x^n}$. The opener ends here: explore.',
      readout: ({ v }) => {
        const st = inverseState(v)
        const m = -st.n
        return st.n > 0 ? `$${powerTex(st.k, st.n, { negative: true })}$: a positive power is direct variation` : `$${powerTex(st.k, st.n, { negative: st.negative })}$: doubling $x$ divides $y$ by $2^{${m}}=${2 ** m}$`
      },
      controls: ({ v }) => (v.iall === 'on' ? ['iun', 'ik', 'idbl', 'itab', 'iasy', 'iall'] : ['inn', 'ik', 'idbl', 'itab', 'iasy', 'iall']),
      cardsTitle: 'Inverse variation recap',
      cards: ({ v }) => inverseCards(inverseState(v)),
      graph: ({ v }) => {
        const st = inverseState(v)
        return powerGraph({ ...st, top: st.n > 0 ? topFor(st.n, 4) : topFor(-1, 4) })
      },
    },
  ],
}
