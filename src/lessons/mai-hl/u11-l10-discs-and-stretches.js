// Approved revised scope: discs about BOTH axes, negative profiles, stretches. No washers.
// Mathematics checked in qa/verify-u11-l10-l11.py. Calculator: only verified integral template.
import { revolution } from '../../components/solid-of-revolution/index.js'
import { commonParams, T, emptyWork, noKeys, integralKeys, sliceReadout } from '../../components/solid-of-revolution/lesson-tools.js'
import { COLORS as C } from '../../kit/style.js'

const B = { left: -0.65, right: 4.7, bottom: -0.65, top: 2.8 }
function base(v, changes = {}) {
  const a = changes.a ?? 0, b = changes.b ?? 4
  return revolution({ n: v.n, selected: a + (b - a) * v.selected, angle: v.angle, bounds: B, scale: 4.5, ...changes })
}
const positiveLabels = [{ id: 'function', x: 3.2, y: Math.sqrt(3.2), html: T`$y=\sqrt{x}$`, color: C.strip, pos: 'n' }]
export default {
  course: 'mai-hl', unit: 11, lesson: 10, engine: 'three',
  title: 'Discs and stretches', bridge: 'Lesson 9: add small pieces, choosing their direction',
  params: {
    ...commonParams,
    side: { type: 'seg', label: 'Profile', options: [['above', 'Above'], ['below', 'Below']], value: 'below' },
    axis: { type: 'seg', label: 'Rotate about', options: [['x', 'x-axis'], ['y', 'y-axis']], value: 'x' },
    p: { type: 'range', label: 'Horizontal stretch p', min: 0.5, max: 2, step: 0.25, value: 1 },
    q: { type: 'range', label: 'Vertical stretch q', min: 0.5, max: 2, step: 0.25, value: 1 },
  },
  scenes: [
    {
      id: 'recall', short: 'Small pieces', heading: 'Last lesson: add the areas of thin strips.', controls: ['selected'],
      prompts: [
        { id: 'circle', q: T`A circle has radius $x^2+1$. Write its area.`, a: T`$A=\pi(x^2+1)^2$. Square the entire radius.` },
        { id: 'strip', q: T`Write the approximate area of the orange strip.`, a: T`$\Delta A\approx f(x_i)\Delta x$. Height × thickness.` },
      ],
      graph: ({ v }) => base(v, { id: 'recall', revealed: false, labels: positiveLabels }),
      readout: ({ shown }) => shown('strip') ? T`$\Delta A\approx f(x_i)\Delta x$ · square units` : 'The same small-piece reasoning will build a volume.',
      working: ({ shown }) => ({ blocks: [
        ...(shown('circle') ? [['Circle area', T`A&=\pi r^2\\&=\pi(x^2+1)^2`]] : []),
        ...(shown('strip') ? [['Strip area', T`\Delta A&\approx f(x_i)\Delta x`]] : []),
      ], note: 'The orange strip is one actual partition piece.' }),
      keys: noKeys,
    },
    {
      id: 'x-turn', short: 'Turn about x', heading: T`Rotate the region under $y=\sqrt{x}$ about the x-axis.`,
      controls: ({ shown }) => shown('disc') ? ['angle', 'n', 'selected'] : ['selected'],
      prompts: [
        { id: 'disc', q: 'Predict the shape swept out by the orange rectangle. Identify its radius and thickness.', a: T`A thin disc: radius $\sqrt{x_i}$, thickness $\Delta x$.` },
        { id: 'piece-volume', q: 'Write its approximate volume. Why is the function squared?', a: T`$\Delta V\approx\pi[f(x_i)]^2\Delta x$. The circular face has area $\pi r^2$.` },
        { id: 'x-volume', q: 'Write the volume integral on [0, 4], and evaluate it.', a: T`$V=\pi\int_0^4(\sqrt{x})^2\,dx$ $=8\pi\approx25.1\text{ units}^3$.` },
      ],
      graph: ({ v, shown }) => base(v, { id: 'x-turn', revealed: shown('disc'), dimensions: shown('disc'), stack: true, labels: positiveLabels }),
      readout: ({ v, shown }) => shown('x-volume') ? T`$V=8\pi\approx25.1\text{ units}^3$` : sliceReadout(0, 4, v, 'x'),
      working: ({ shown }) => ({ blocks: [
        ...(shown('piece-volume') ? [['One disc', T`\Delta V&\approx\pi[f(x_i)]^2\Delta x`]] : []),
        ...(shown('x-volume') ? [['Add the discs', T`V&=\pi\int_0^4(\sqrt{x})^2\,dx\\&=\pi\int_0^4x\,dx\\&=8\pi\\&\approx25.1\text{ units}^3`, true]] : []),
      ], note: shown('x-volume') ? 'Special case: the cross-sectional area is linear in x. Every equal-width midpoint disc sum already equals 8π. More discs improve the shape, not this total.' : 'Reveal each answer to see its working.' }),
      keys: ({ shown }) => shown('x-volume') ? integralKeys({ integrand: 'X', lo: '0', hi: '4', out: '25.13274123' }) : noKeys(),
    },
    {
      id: 'negative', short: 'Below the axis', heading: 'Reflect the profile below the x-axis.',
      controls: ({ shown }) => shown('negative-same') ? ['side', 'angle', 'selected'] : ['selected'],
      prompts: [
        { id: 'negative-same', q: T`Predict: does $y=-\sqrt{x}$ on [0, 4] generate a different volume?`, choices: ['Smaller', 'The same', 'Larger'], correct: 1, a: 'The same solid and volume. A full turn reaches the same positions.' },
        { id: 'negative-radius', q: 'How do we express the radius when the profile is below the axis?', a: T`$r=|f(x)|$. Thus $r^2=[f(x)]^2$, and disc volumes are nonnegative.` },
      ],
      graph: ({ v, shown }) => {
        const below = !shown('negative-same') || v.side === 'below'
        return base(v, { id: 'negative', sign: below ? -1 : 1, revealed: shown('negative-same'), bounds: { ...B, bottom: -2.8, top: 2.8 }, labels: [{ id: 'function', x: 3.1, y: (below ? -1 : 1) * Math.sqrt(3.1), html: below ? T`$y=-\sqrt{x}$` : T`$y=\sqrt{x}$`, color: C.strip }] })
      },
      readout: ({ shown }) => shown('negative-radius') ? T`$r=|f(x)|$ · a distance from the axis` : 'Predict before comparing the two full revolutions.',
      working: ({ shown }) => shown('negative-radius') ? { blocks: [['Radius', T`r&=|-\sqrt{x}|\\&=\sqrt{x}`], ['Squared radius', T`r^2&=(-\sqrt{x})^2\\&=x`, true]], note: 'Above-axis and below-axis parts contribute positive volumes.' } : emptyWork(),
      keys: noKeys,
    },
    {
      id: 'y-turn', short: 'Turn about y', heading: T`Return to Lesson 9: the region between $x=y^2$ and the y-axis.`,
      controls: ({ shown }) => shown('y-disc') ? ['angle', 'n', 'selected'] : ['selected'],
      prompts: [
        { id: 'y-disc', q: 'Rotate this region about the y-axis. Which strips make discs? State radius and thickness.', a: T`Horizontal strips. Radius $x=y^2$, thickness $\Delta y$, with $0\le y\le2$.` },
        { id: 'y-volume', q: 'Write the volume integral and evaluate it.', a: T`$V=\pi\int_0^2(y^2)^2\,dy$ $=\frac{32\pi}{5}\approx20.1\text{ units}^3$.` },
      ],
      graph: ({ v, shown }) => base(v, { id: 'y-turn', axis: 'y', b: 2, outer: (y) => y * y, revealed: shown('y-disc'), dimensions: shown('y-disc'), stack: true, bounds: B, labels: [{ id: 'function', x: 2.6, y: Math.sqrt(2.6), html: '$x=y^2$', color: C.strip, pos: 'se' }] }),
      readout: ({ v, shown }) => shown('y-volume') ? T`$V=\frac{32\pi}{5}\approx20.1\text{ units}^3$` : sliceReadout(0, 2, v, 'y'),
      working: ({ shown }) => ({ blocks: [
        ...(shown('y-disc') ? [['Read the horizontal strip', T`r&=y^2\\\text{thickness}&=\Delta y`]] : []),
        ...(shown('y-volume') ? [['Add the discs', T`V&=\pi\int_0^2(y^2)^2\,dy\\&=\pi\int_0^2y^4\,dy\\&=\frac{32\pi}{5}\\&\approx20.1\text{ units}^3`, true]] : []),
      ], note: 'The shaded region has changed from the x-axis example. Choose bounds and thickness from the selected axis.' }),
      keys: ({ shown }) => shown('y-volume') ? integralKeys({ integrand: 'X^4', lo: '0', hi: '2', out: '20.10619298', note: 'The calculator uses X even though the mathematical variable is y. Enter the y-bounds 0 and 2.' }) : noKeys(),
    },
    {
      id: 'stretch', short: 'Stretch', heading: 'A horizontal stretch: length or radius?',
      controls: ({ shown }) => shown('stretch-compare') ? ['axis', 'p', 'q', 'selected'] : ['axis'],
      prompts: [
        { id: 'stretch-compare', q: 'Double horizontal distances. Predict the volume factor about each axis.', a: 'About x: ×2, because length doubles. About y: ×4, because every radius doubles.' },
        { id: 'stretch-rule', q: 'Generalise for horizontal factor p and vertical factor q.', a: T`About x: $pq^2$. About y: $qp^2$. Scale along the axis × perpendicular scale squared.` },
      ],
      graph: ({ v, shown }) => {
        const p = shown('stretch-compare') ? v.p : 1, q = shown('stretch-compare') ? v.q : 1
        const xAxis = v.axis === 'x'
        const b = xAxis ? 4 * p : 2 * q
        return base(v, { id: 'stretch', axis: v.axis, b,
          outer: xAxis ? (x) => q * Math.sqrt(x / p) : (y) => p * (y / q) ** 2,
          angle: 360, turnEnabled: false, revealed: shown('stretch-compare'), pieces: true,
          bounds: { left: -0.8, right: 8.8, bottom: -0.8, top: 4.8 }, scale: 8,
          labels: [{ id: 'function', x: xAxis ? 2.5 * p : p * (1.5) ** 2, y: xAxis ? q * Math.sqrt(2.5) : 1.5 * q,
            html: xAxis ? T`$y=q\sqrt{x/p}$` : T`$x=p(y/q)^2$`, color: C.strip }],
          reference: { a: 0, b: xAxis ? 4 : 2, outer: xAxis ? Math.sqrt : (y) => y * y, inner: () => 0 },
        })
      },
      readout: ({ v, shown }) => shown('stretch-rule') ? `Volume factor: ${v.axis === 'x' ? v.p * v.q ** 2 : v.q * v.p ** 2}` : 'Switch the axis. Decide which distances are radii.',
      working: ({ v, shown }) => shown('stretch-rule') ? { blocks: [
        ['About the x-axis', T`V_{\mathrm{new}}&=pq^2V_{\mathrm{original}}`],
        ['About the y-axis', T`V_{\mathrm{new}}&=qp^2V_{\mathrm{original}}`],
        ['Current factor', `k&=${v.axis === 'x' ? v.p * v.q ** 2 : v.q * v.p ** 2}`, true],
      ], note: 'Transform the interval with the graph. The faint reference mesh shows the original solid. Use Reset to restore all controls.' } : emptyWork(),
      keys: noKeys,
    },
  ],
}
