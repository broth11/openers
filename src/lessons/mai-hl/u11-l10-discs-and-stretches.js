// Approved revised scope: discs about BOTH axes, negative profiles, vertical stretches. No washers.
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
    q: { type: 'range', label: 'Vertical stretch q', min: 0.5, max: 2, step: 0.25, value: 1 },
  },
  scenes: [
    {
      id: 'recall', short: 'Small pieces', heading: 'Last lesson: add the areas of thin strips.', controls: ['selected'],
      prompts: [
        { id: 'height', q: T`For $y=\sqrt{x}$, what is the height of the orange strip at $x_i$?`, a: T`The height is $f(x_i)=\sqrt{x_i}$.` },
        { id: 'strip', q: T`Write the approximate area of the orange strip.`, a: T`$\Delta A\approx\sqrt{x_i}\Delta x$. Height × thickness.` },
      ],
      graph: ({ v }) => base(v, { id: 'recall', revealed: false, labels: positiveLabels }),
      readout: ({ shown }) => shown('strip') ? T`$\Delta A\approx f(x_i)\Delta x$ · square units` : 'The same small-piece reasoning will build a volume.',
      working: ({ shown }) => ({ blocks: [
        ...(shown('height') ? [['Height of this strip', T`h&=f(x_i)\\&=\sqrt{x_i}`]] : []),
        ...(shown('strip') ? [['Strip area', T`\Delta A&\approx\sqrt{x_i}\Delta x`]] : []),
      ], note: 'The orange strip is one actual partition piece.' }),
      keys: noKeys,
    },
    {
      id: 'x-turn', short: 'Turn about x', heading: T`Rotate the region under $y=\sqrt{x}$ about the x-axis.`,
      controls: ({ shown }) => shown('disc') ? ['angle', 'n', 'selected'] : ['selected'],
      prompts: [
        { id: 'disc', q: 'Predict the shape swept out by the orange rectangle. Identify its radius and thickness.', a: T`A thin disc: radius $\sqrt{x_i}$, thickness $\Delta x$.` },
        { id: 'piece-volume', q: 'Find the cross-sectional area, then the volume of one thin piece.', a: T`$A=\pi(\sqrt{x_i})^2=\pi x_i$. Then $\Delta V\approx\pi x_i\Delta x$.` },
        { id: 'x-volume', q: 'Write the volume integral on [0, 4], and evaluate it.', a: T`$V=\pi\int_0^4(\sqrt{x})^2\,dx$ $=8\pi\approx25.1\text{ units}^3$.` },
      ],
      graph: ({ v, shown }) => base(v, { id: 'x-turn', revealed: shown('disc'), dimensions: shown('disc'), stack: true, labels: positiveLabels }),
      readout: ({ v, shown }) => shown('x-volume') ? T`$V=8\pi\approx25.1\text{ units}^3$` : sliceReadout(0, 4, v, 'x'),
      working: ({ shown }) => ({ blocks: [
        ...(shown('piece-volume') ? [['Circular face', T`A&=\pi r^2\\&=\pi(\sqrt{x_i})^2\\&=\pi x_i`], ['Thin disc', T`\Delta V&\approx A\Delta x\\&=\pi x_i\Delta x`]] : []),
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
      graph: ({ v, shown }) => base(v, { id: 'y-turn', axis: 'y', scale: 6, b: 2, outer: (y) => y * y, revealed: shown('y-disc'), dimensions: shown('y-disc'), stack: true, bounds: B, labels: [{ id: 'function', x: 2.6, y: Math.sqrt(2.6), html: '$x=y^2$', color: C.strip, pos: 'se' }] }),
      readout: ({ v, shown }) => shown('y-volume') ? T`$V=\frac{32\pi}{5}\approx20.1\text{ units}^3$` : sliceReadout(0, 2, v, 'y'),
      working: ({ shown }) => ({ blocks: [
        ...(shown('y-disc') ? [['Read the horizontal strip', T`r&=y^2\\\text{thickness}&=\Delta y`]] : []),
        ...(shown('y-volume') ? [['Add the discs', T`V&=\pi\int_0^2(y^2)^2\,dy\\&=\pi\int_0^2y^4\,dy\\&=\frac{32\pi}{5}\\&\approx20.1\text{ units}^3`, true]] : []),
      ], note: 'The shaded region has changed from the x-axis example. Choose bounds and thickness from the selected axis.' }),
      keys: ({ shown }) => shown('y-volume') ? integralKeys({ integrand: 'X^4', lo: '0', hi: '2', out: '20.10619298', note: 'The calculator uses X even though the mathematical variable is y. Enter the y-bounds 0 and 2.' }) : noKeys(),
    },
    {
      id: 'stretch', short: 'Vertical stretch', heading: 'Stretch vertically. What changes about each axis?',
      controls: ({ shown }) => shown('stretch-compare') ? ['axis', 'q', 'selected'] : ['axis'],
      prompts: [
        { id: 'stretch-compare', q: 'Double all heights. Predict the volume factor about each axis.', a: 'About x: ×4, because every radius doubles. About y: ×2, because axial length doubles.' },
        { id: 'stretch-rule', q: 'Generalise for a vertical stretch of factor q > 0.', a: T`About x: $q^2$. About y: $q$. Identify which distances are radii.` },
      ],
      graph: ({ v, shown }) => {
        const q = shown('stretch-compare') ? v.q : 1
        const xAxis = v.axis === 'x'
        const b = xAxis ? 4 : 2 * q
        return base(v, { id: 'stretch', axis: v.axis, b,
          outer: xAxis ? (x) => q * Math.sqrt(x) : (y) => (y / q) ** 2,
          angle: 360, turnEnabled: false, revealed: shown('stretch-compare'), pieces: true,
          bounds: { left: -0.8, right: 4.8, bottom: -0.8, top: 4.8 }, scale: 6,
          labels: [{ id: 'function', x: xAxis ? 2.5 : 1.5 ** 2, y: xAxis ? q * Math.sqrt(2.5) : 1.5 * q,
            html: xAxis ? T`$y=q\sqrt{x}$` : T`$x=(y/q)^2$`, color: C.strip }],
          reference: { a: 0, b: xAxis ? 4 : 2, outer: xAxis ? Math.sqrt : (y) => y * y, inner: () => 0 },
        })
      },
      readout: ({ v, shown }) => shown('stretch-rule') ? `Volume factor: ${v.axis === 'x' ? v.q ** 2 : v.q}` : 'A vertical stretch changes all heights by the same factor.',
      working: ({ v, shown }) => shown('stretch-rule') ? { blocks: [
        ['About the x-axis: radii stretch', T`V_{\mathrm{new}}&=q^2V_{\mathrm{original}}`],
        ['About the y-axis: axial length stretches', T`V_{\mathrm{new}}&=qV_{\mathrm{original}}`],
        ['Current factor', `k&=${v.axis === 'x' ? v.q ** 2 : v.q}`, true],
      ], note: 'About x, the interval stays [0, 4]. About y, it becomes [0, 2q]. The faint mesh shows the original solid.' } : emptyWork(),
      keys: noKeys,
    },
  ],
}
