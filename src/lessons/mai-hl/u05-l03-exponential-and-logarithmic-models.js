// Unit 5 Lesson 3: exponential and logarithmic models, log scales. Walk-through model (`walk: true`),
// see docs/OPENERS-WALK.md: one flat timeline of beats built from the prompts below, a left pane with
// the question and its working, the animation on the right. Three context scenes (coffee, typing, pH)
// then one recap explorer. No Casio panel for this lesson (Ben, 28 October 2026): the printed Notes
// carry the GDC steps, so no scene or question here has `keys`. Every exact value is checked in
// qa/verify-u05-l03.py. The previous stepped version is kept in _archive/ (outside the lesson glob).
import { COLORS as C } from '../../kit/style.js'
import { fmt } from '../../kit/math.js'
import { drawCoffee, drawTyping, drawPhStrip } from '../../components/context-stage/index.js'
import { growthGraph, growthCards, equationTex } from '../../components/growth-family/index.js'

// ---------- models
export const coffee = (t) => 70 * 0.9 ** t + 22
export const typing = (h) => 20 + 10 * Math.log(h)
export const hplus = (pH) => 10 ** -pH // mol/L
const mm = (pH) => 1000 * 10 ** -pH // mmol/L, the graph's x unit
const sci = (x) => { const e = Math.floor(Math.log10(x)); return `${fmt(x / 10 ** e, 2)}\\times 10^{${e}}` }
const T_DRINK = Math.log(28 / 70) / Math.log(0.9) // 8.70 min
const PH_FOODS = [
  { name: 'Lemon juice', pH: 2.0, color: '#e8c52e' },
  { name: 'Tomato', pH: 4.4, color: '#d9432e' },
  { name: 'Pure water', pH: 7.0, color: '#3a8fd0' },
]

// ---------- scene 1: the cooling coffee
function coffeeGraph({ v, revealed }) {
  const t = v.cool
  const live = revealed('coffee')
  const items = []
  const labels = []
  if (revealed('c')) {
    items.push({ type: 'line', x1: -2, y1: 22, x2: 31, y2: 22, color: C.muted, width: 2, dash: true })
    labels.push({ id: 'room', x: 19, y: 22, html: '$y=22$', color: C.muted, pos: 's', plain: true }) // clear of the t axis title in the narrower graph
  }
  if (live) {
    items.push({ type: 'curve', f: (x) => [x, coffee(x)], t: [0, 30], color: C.teal })
    labels.push({ id: 'T', x: 14, y: coffee(14), html: '$T=70(0.9)^t+22$', color: C.teal, pos: 'ne' })
    items.push({ type: 'line', x1: t, y1: -13, x2: t, y2: coffee(t), color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'line', x1: -2, y1: coffee(t), x2: t, y2: coffee(t), color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'points', pts: [[t, coffee(t)]], color: C.teal, r: 9, ghost: true })
  }
  if (revealed('drink')) {
    items.push({ type: 'points', pts: [[T_DRINK, 50]], color: C.sel, r: 8, hollow: true })
    labels.push({ id: 'drink', x: T_DRINK, y: 50, html: `$(${fmt(T_DRINK, 2)},\\,50)$`, color: C.sel, pos: 'ne', attached: true })
  }
  items.push({ type: 'points', pts: [[0, 92], [2, 78.7]], color: C.strip, r: 7 })
  labels.push({ id: 'g0', x: 0, y: 92, html: '$(0,\\,92)$', color: C.strip, pos: 'ne', attached: true })
  labels.push({ id: 'g2', x: 2, y: 78.7, html: '$(2,\\,78.7)$', color: C.strip, pos: 'ne', attached: true })
  return {
    bounds: { left: -2.6, right: 31, bottom: -13, top: 100 },
    axes: { x: 't (min)', y: 'T (°C)', aspect: 5, xStep: 5, yStep: 10, nonnegative: true },
    description: 'Coffee temperature in degrees Celsius against minutes, beside a drawing of the cup and thermometer.',
    items, labels,
    scene: { frac: 0.4, draw: (api) => drawCoffee(api, { T: live ? coffee(t) : 92, t: live ? t : 0, top: 100 }) },
  }
}

// ---------- scene 2: typing speed
function typingGraph({ v, revealed }) {
  const h = v.hours
  const live = revealed('model')
  const items = []
  const labels = []
  if (live) {
    items.push({ type: 'curve', f: (x) => [x, typing(x)], t: [0.03, 110], color: C.teal, n: 600 })
    labels.push({ id: 'S', x: 72, y: typing(72), html: '$S=20+10\\ln h$', color: C.teal, pos: 'se' })
    items.push({ type: 'line', x1: h, y1: -14, x2: h, y2: typing(h), color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'line', x1: -10, y1: typing(h), x2: h, y2: typing(h), color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'points', pts: [[h, typing(h)]], color: C.teal, r: 9, ghost: true })
  }
  if (revealed('p100')) {
    items.push({ type: 'points', pts: [[100, 66.06]], color: C.sel, r: 8, hollow: true })
    labels.push({ id: 'p100', x: 100, y: 66.06, html: '$(100,\\,66.1)$', color: C.sel, pos: 'nw', attached: true })
  }
  if (revealed('neg')) {
    items.push({ type: 'points', pts: [[0.1, typing(0.1)]], color: C.coral, r: 8, hollow: true })
    labels.push({ id: 'neg', x: 0.1, y: typing(0.1), html: `$(0.1,\\,${fmt(typing(0.1), 2)})$`, color: C.coral, pos: 'e', attached: true })
  }
  items.push({ type: 'points', pts: [[1, 20], [10, 43.03]], color: C.strip, r: 7 })
  labels.push({ id: 'g1', x: 1, y: 20, html: '$(1,\\,20)$', color: C.strip, pos: 'se', attached: true })
  labels.push({ id: 'g10', x: 10, y: 43.03, html: '$(10,\\,43.03)$', color: C.strip, pos: 'nw', attached: true })
  return {
    bounds: { left: -10, right: 112, bottom: -14, top: 76 },
    axes: { x: 'h (hours)', y: 'S (wpm)', aspect: 1.2, xStep: 10, yStep: 10 },
    description: 'Typing speed in words per minute against hours of practice, beside a drawing of a laptop and a speed gauge.',
    items, labels,
    scene: { frac: 0.4, draw: (api) => drawTyping(api, { S: live ? typing(h) : 20, h: live ? h : 1, top: 70 }) },
  }
}

// ---------- scene 3: pH
function phGraph({ v, revealed }) {
  const p = v.phv
  const curve = revealed('curve') || revealed('pts')
  const items = []
  const labels = []
  if (curve) {
    items.push({ type: 'curve', f: (t) => [1000 * 10 ** t, -t], t: [-9, Math.log10(0.0125)], color: C.teal, n: 600 })
    labels.push({ id: 'pH', x: 7.2, y: -Math.log10(0.0072), html: '$\\mathrm{pH}=-\\log_{10}[\\mathrm{H}^+]$', color: C.teal, pos: 'ne' })
    items.push({ type: 'line', x1: mm(p), y1: -1.2, x2: mm(p), y2: p, color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'line', x1: -1.4, y1: p, x2: mm(p), y2: p, color: C.sel, width: 2, dash: true, ghost: true })
    items.push({ type: 'points', pts: [[mm(p), p]], color: C.teal, r: 9, ghost: true })
  }
  if (revealed('qa')) {
    items.push({ type: 'points', pts: [[0.3, -Math.log10(0.0003)]], color: C.sel, r: 8, hollow: true })
    labels.push({ id: 'qa', x: 0.3, y: -Math.log10(0.0003), html: '$\\mathrm{pH}=3.52$', color: C.sel, pos: 'ne', attached: true })
  }
  if (revealed('pts')) {
    items.push({ type: 'points', pts: [[mm(2), 2], [mm(4.4), 4.4]], color: C.strip, r: 8 })
    labels.push({ id: 'lemon', x: mm(2), y: 2, html: 'lemon', color: C.strip, pos: 'ne', plain: true, attached: true })
    labels.push({ id: 'tomato', x: mm(4.4), y: 4.4, html: 'tomato', color: C.strip, pos: 'ne', plain: true, attached: true })
  }
  return {
    bounds: { left: -1.4, right: 12.5, bottom: -1.2, top: 8.9 },
    axes: { x: '[H⁺] (mmol/L)', y: 'pH', aspect: 1.05, xStep: 2, yStep: 1, nonnegative: true },
    description: 'pH against hydrogen ion concentration, beside a drawing of a pH strip with a lemon, a tomato, and water.',
    items, labels,
    scene: { frac: 0.42, draw: (api) => drawPhStrip(api, { foods: PH_FOODS, marker: curve ? p : null, top: 8 }) },
  }
}

// ---------- recap state
const OFF_ON = [['off', 'Off'], ['on', 'On']]
const growthState = (v) => ({ fam: v.fam, k: v.gk, a: v.ga, r: v.gr, c: v.gc, la: v.la, lb: v.lb, inv: v.inv === 'on' })

export default {
  course: 'mai-hl', unit: 5, lesson: 3,
  title: 'Exponential and logarithmic models, log scales', engine: 'svg', walk: true,
  bridge: 'Lesson 2: fit a model through stated conditions, then use it both ways.',
  params: {
    cool: { type: 'range', label: 'Time', min: 0, max: 30, step: 0.1, value: 0, show: (v) => `$t=${fmt(v, 1)}$ min`, sel: true, play: { seconds: 12 } },
    hours: { type: 'range', label: 'Practice', min: 1, max: 110, step: 0.5, value: 1, show: (v) => `$h=${fmt(v, 1)}$ h`, sel: true, play: { seconds: 12 } },
    phv: { type: 'range', label: 'Acidity', min: 1.5, max: 7.5, step: 0.05, value: 2, show: (v) => `$\\mathrm{pH}=${fmt(v, 2)}$`, sel: true },
    fam: { type: 'seg', label: 'Family', options: [['exp', 'k·aˣ + c'], ['nat', 'k·e^(rx) + c'], ['log', 'a + b ln x']], value: 'exp' },
    gk: { type: 'range', label: 'k', min: -4, max: 4, step: 0.5, value: 2, show: (v) => `$k=${fmt(v, 1)}$` },
    ga: { type: 'range', label: 'Base a', min: 0.4, max: 2.5, step: 0.05, value: 1.5, show: (v) => `$a=${fmt(v, 2)}$` },
    gr: { type: 'range', label: 'Rate r', min: -0.6, max: 0.6, step: 0.05, value: 0.3, show: (v) => `$r=${fmt(v, 2)}$` },
    gc: { type: 'range', label: 'c', min: -3, max: 3, step: 0.5, value: 1, show: (v) => `$c=${fmt(v, 1)}$` },
    la: { type: 'range', label: 'a', min: -3, max: 3, step: 0.5, value: 1, show: (v) => `$a=${fmt(v, 1)}$` },
    lb: { type: 'range', label: 'b', min: -3, max: 3, step: 0.5, value: 2, show: (v) => `$b=${fmt(v, 1)}$` },
    inv: { type: 'seg', label: 'Show the inverse', options: OFF_ON, value: 'off' },
  },
  scenes: [
    // ---------- scene 1: the cooling coffee
    {
      id: 'coffee', short: 'Cooling coffee',
      heading: 'A cup of coffee is left on a table in a room. Readings: $92$ °C at $t=0$ and $78.7$ °C two minutes later.',
      readout: ({ v, revealed }) => (revealed('coffee')
        ? `$t=${fmt(v.cool, 1)}$ min: $T=${fmt(coffee(v.cool), 1)}$ °C`
        : 'Predict where it settles, then work out the model on the left.'),
      controls: ({ revealed }) => (revealed('coffee') ? ['cool'] : []),
      prompts: [
        {
          id: 'c1', q: 'Predict: after a very long time, what temperature does the coffee approach?',
          choices: ['$0$ °C', 'the temperature of the room', '$78.7$ °C'], correct: 1,
          steps: [
            { caption: 'Heat flows from hot to cool', note: 'The coffee loses heat to the air in the room, quickly at first.' },
            { caption: 'It levels off', latex: '&\\text{It approaches the}\\\\&\\text{temperature of the room}', note: 'Once it is as warm as the room there is nothing left to lose, so the temperature stops falling. It does not go to $0$ °C.', answer: true },
          ],
        },
        {
          id: 'c2', q: 'The model is $T=k(0.9)^t+c$, with $t$ in minutes. Use the two readings to find $k$ and $c$.',
          steps: [
            { caption: 'The model', latex: 'T&=k(0.9)^t+c' },
            { caption: 'Substitute (0, 92)', latex: '92&=k(0.9)^0+c\\\\92&=k+c' },
            { caption: 'Substitute (2, 78.7)', latex: '78.7&=k(0.9)^2+c\\\\78.7&=0.81k+c' },
            { caption: 'Subtract the second equation from the first', latex: '92-78.7&=k-0.81k\\\\13.3&=0.19k\\\\k&=70' },
            { caption: 'Find c', latex: 'c&=92-70\\\\&=22', reveals: ['c'], note: '$c$ is the horizontal asymptote: the temperature of the room, $22$ °C.' },
            { caption: 'Model', latex: 'T&=70(0.9)^t+22', answer: true, reveals: ['c', 'coffee'], note: 'Two readings fix the two unknowns $k$ and $c$.' },
            { caption: 'Trace the model', note: 'Watch the temperature fall quickly at first, then settle toward the room temperature, $22$ °C.', play: 'cool', reveals: ['c', 'coffee'] },
          ],
        },
        {
          id: 'c3', q: 'It can be drunk at $50$ °C or below. After how many whole minutes is that first true?',
          steps: [
            { caption: 'Set T = 50', latex: '70(0.9)^t+22&=50', reveals: ['coffee'] },
            { caption: 'Isolate the power', latex: '70(0.9)^t&=28\\\\(0.9)^t&=0.4' },
            { caption: 'Take logs of both sides', latex: 't\\ln 0.9&=\\ln 0.4\\\\t&=\\frac{\\ln 0.4}{\\ln 0.9}\\\\&=8.70', cue: () => ({ items: [{ type: 'points', pts: [[T_DRINK, 50]], color: C.sel, r: 11, hollow: true }] }) },
            { caption: 'Round up to whole minutes', latex: 't&=9', answer: true, reveals: ['drink'], note: 'After $8$ minutes it is still $52.1$ °C. After $9$ it is $49.1$ °C. Round up, not to the nearest whole number.' },
          ],
        },
      ],
      graph: coffeeGraph,
    },
    // ---------- scene 2: typing speed
    {
      id: 'typing', short: 'Typing speed',
      heading: 'A student practises typing. After $1$ hour she types $20$ words per minute. After $10$ hours, $43.03$.',
      readout: ({ v, revealed }) => (revealed('model')
        ? `$h=${fmt(v.hours, 1)}$ h: $S=${fmt(typing(v.hours), 1)}$ wpm`
        : 'The gains slow down. Predict the speed at $100$ hours, then fit a model on the left.'),
      controls: ({ revealed }) => (revealed('model') ? ['hours'] : []),
      prompts: [
        {
          id: 't1', q: 'Predict: how fast does she type after $100$ hours?',
          choices: ['$43$ wpm, no more gains', 'about $66$ wpm', 'about $270$ wpm'], correct: 1,
          steps: [
            { caption: 'From 1 hour to 10 hours', latex: '43.03-20&=23.03', note: 'Ten times the practice added $23.03$ words per minute.' },
            { caption: 'From 10 hours to 100 hours', latex: '43.03+23.03&=66.06\\\\&\\approx 66\\text{ wpm}', answer: true, reveals: ['p100'], note: 'Another tenfold increase adds about the same again. Steady gains would give about $270$, so the gains are slowing.' },
          ],
        },
        {
          id: 't2', q: 'Fit $S=a+b\\ln h$ through $(1,\\,20)$ and $(10,\\,43.03)$.',
          steps: [
            { caption: 'Substitute (1, 20)', latex: '20&=a+b\\ln 1\\\\20&=a', note: '$\\ln 1=0$, so $a$ is the speed at $h=1$.' },
            { caption: 'Substitute (10, 43.03)', latex: '43.03&=20+b\\ln 10\\\\23.03&=b\\ln 10' },
            { caption: 'Solve for b', latex: 'b&=\\frac{23.03}{\\ln 10}\\\\&=10.0' },
            { caption: 'Model', latex: 'S&=20+10\\ln h', answer: true, reveals: ['model'], note: 'Two readings fix two unknowns, as with the coffee.' },
            { caption: 'Trace the model', note: 'Each extra hour of practice adds less than the one before.', play: 'hours', reveals: ['model'] },
          ],
        },
        {
          id: 't3', q: 'What does the model give at $0.1$ hours and at $5000$ hours? Name one specific limitation.',
          steps: [
            { caption: 'At 0.1 hours', latex: 'S(0.1)&=20+10\\ln 0.1\\\\&=-3.03', reveals: ['model', 'neg'], note: 'A negative typing speed is impossible.' },
            { caption: 'At 5000 hours', latex: 'S(5000)&=20+10\\ln 5000\\\\&=105', note: 'Still rising after 5000 hours, with no ceiling.' },
            { caption: 'Limitation', latex: '&\\text{Negative for }h<0.135\\\\&\\text{No ceiling at large }h', answer: true, note: 'The model gives a negative speed for $h<0.135$, so it fails for very little practice. It also never levels off, so it cannot hold for very long practice. Say which, and say why.' },
          ],
        },
      ],
      graph: typingGraph,
    },
    // ---------- scene 3: pH
    {
      id: 'ph', short: 'pH scale',
      heading: 'The pH scale measures acidity. Lemon juice has pH $2.0$ and a tomato has pH $4.4$. Here, $\\mathrm{pH}=-\\log_{10}[\\mathrm{H}^+]$.',
      readout: ({ v, revealed }) => (revealed('curve') || revealed('pts')
        ? `$\\mathrm{pH}=${fmt(v.phv, 2)}$: $[\\mathrm{H}^+]=${sci(hplus(v.phv))}$ mol/L`
        : 'Predict how many times stronger the lemon is, then work it out on the left.'),
      controls: ({ revealed }) => (revealed('curve') || revealed('pts') ? ['phv'] : []),
      prompts: [
        {
          id: 'p1', q: 'Predict: how many times stronger (more $[\\mathrm{H}^+]$) is the lemon juice than the tomato?',
          choices: ['about $2$ times', 'about $24$ times', 'about $250$ times'], correct: 2,
          steps: [
            { caption: 'Each pH step is a factor of 10', note: 'Lowering the pH by $1$ multiplies $[\\mathrm{H}^+]$ by $10$.' },
            { caption: 'The lemon is 2.4 steps below the tomato', latex: '10^2&=100\\\\10^3&=1000\\\\&\\Rightarrow\\text{about }250\\\\&\\text{times stronger}', answer: true, note: '$2.4$ steps lies between $2$ and $3$, so the answer is between $100$ and $1000$: about $250$. Question 3 finds it exactly.' },
          ],
        },
        {
          id: 'p2', q: 'Find the pH when $[\\mathrm{H}^+]=0.0003$. Find $[\\mathrm{H}^+]$ when the pH is $6.6$. Give the second answer in standard form.',
          steps: [
            { caption: 'Evaluate the pH', latex: '\\mathrm{pH}&=-\\log_{10}(0.0003)\\\\&=3.52', reveals: ['curve', 'qa'] },
            { caption: 'Invert: set pH = 6.6', latex: '6.6&=-\\log_{10}[\\mathrm{H}^+]\\\\\\log_{10}[\\mathrm{H}^+]&=-6.6' },
            { caption: 'Undo the log with a power of 10', latex: '[\\mathrm{H}^+]&=10^{-6.6}\\\\&=2.51\\times 10^{-7}', answer: true, note: 'Undoing $\\log_{10}$ means raising $10$ to the power.' },
          ],
        },
        {
          id: 'p3', q: 'Find exactly how many times stronger the lemon juice is than the tomato.',
          steps: [
            { caption: 'Lemon', latex: '[\\mathrm{H}^+]&=10^{-2.0}\\\\&=0.01', reveals: ['curve', 'pts'] },
            { caption: 'Tomato', latex: '[\\mathrm{H}^+]&=10^{-4.4}\\\\&=3.98\\times 10^{-5}' },
            { caption: 'Divide the concentrations', latex: '\\frac{0.01}{3.98\\times 10^{-5}}&=251' },
            { caption: 'The shortcut: subtract the pH values, then raise 10 to the difference', latex: '4.4-2.0&=2.4\\\\10^{2.4}&=251', answer: true, note: 'Compare by subtracting, never by dividing: $4.4\\div 2.0=2.2$ is wrong. The lemon is about $251$ times stronger.' },
          ],
        },
      ],
      graph: phGraph,
    },
    // ---------- scene 4: recap explorer (no questions)
    {
      id: 'recap', short: 'Family recap',
      heading: 'The family: exponential, natural exponential, and logarithmic models. Change the controls and read the cards. The opener ends here: explore.',
      readout: ({ v }) => `$${equationTex(growthState(v))}$`,
      controls: ({ v }) => (v.fam === 'exp' ? ['fam', 'gk', 'ga', 'gc', 'inv'] : v.fam === 'nat' ? ['fam', 'gk', 'gr', 'gc', 'inv'] : ['fam', 'la', 'lb', 'inv']),
      cardsTitle: 'Growth family recap',
      cards: ({ v }) => growthCards(growthState(v)),
      graph: ({ v }) => growthGraph(growthState(v)),
    },
  ],
}
