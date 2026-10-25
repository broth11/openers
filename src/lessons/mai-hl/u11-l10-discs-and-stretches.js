// Approved revised scope: discs about BOTH axes, negative profiles, vertical stretches. No washers.
// Mathematics checked in qa/verify-u11-l10-l11.py. Calculator: the verified Run-Matrix integral template
// ([OPTN] [F4] CALC [F4] ∫dx, [→] to each limit, one more [→] after an exponent; key log AASL D6, 23/10/2026).
// Steps NOT yet pressed on the emulator, so not in the key log (never flagged on screen; see hand-off):
//   [MENU] [1] for Run-Matrix (keypad menu map, same wording as U11 L9);
//   π as [SHIFT] [×10ˣ] typed inside the integrand (π on that key is logged for Graph, AASL D2).
// The exponent box ([^] then one [→] to leave it) is logged (AASL D1, D6).
import { revolution } from '../../components/solid-of-revolution/index.js'
import { commonParams, T, emptyWork, noKeys, integralKeys, sliceReadout, k, e, PI, X } from '../../components/solid-of-revolution/lesson-tools.js'
import { COLORS as C } from '../../kit/style.js'

const B = { left: -0.65, right: 4.7, bottom: -0.65, top: 2.8 }
function base(v, changes = {}) {
  const a = changes.a ?? 0, b = changes.b ?? 4
  return revolution({ n: v.n, selected: a + (b - a) * v.selected, angle: v.angle, isolated: v.pieceView === 'one', bounds: B, scale: 5.5, ...changes })
}
const positiveLabels = [{ id: 'function', x: 3.2, y: Math.sqrt(3.2), html: T`$y=\sqrt{x}$`, color: C.strip, pos: 'n' }]
export default {
  course: 'mai-hl', unit: 11, lesson: 10, engine: 'three',
  title: 'Discs and stretches', bridge: 'Lesson 9: add small pieces, choosing their direction',
  params: {
    ...commonParams,
    side: { type: 'seg', label: 'Profile', options: [['above', 'Above'], ['below', 'Below']], value: 'below' },
    model: { type: 'seg', label: '3D profile', options: [['f', 'f(x)'], ['g', 'g(x) = 2f(x)']], value: 'f' },
  },
  scenes: [
    {
      id: 'recall', short: 'Small pieces', heading: 'Last lesson: add the areas of thin strips.', controls: ['selected', 'pieceView'],
      prompts: [
        { id: 'height', q: T`For $y=\sqrt{x}$, what is the height of the orange strip at $x_i$?`, a: T`The height is $f(x_i)=\sqrt{x_i}$.` },
        { id: 'strip', q: T`Write the approximate area of the orange strip.`, a: T`$\Delta A\approx\sqrt{x_i}\Delta x$. Height × thickness.` },
        { id: 'area-integral', q: 'Write the integral giving the area under the curve from 0 to 4.', a: T`$A=\int_0^4\sqrt{x}\,dx$.` },
      ],
      graph: ({ v }) => base(v, { id: 'recall', revealed: false, labels: positiveLabels }),
      readout: ({ shown }) => shown('strip') ? T`$\Delta A\approx f(x_i)\Delta x$ · square units` : 'The same small-piece reasoning will build a volume.',
      working: ({ shown }) => ({ blocks: [
        ...(shown('height') ? [['Height of this strip', T`h&=f(x_i)\\&=\sqrt{x_i}`]] : []),
        ...(shown('strip') ? [['Strip area', T`\Delta A&\approx\sqrt{x_i}\Delta x`]] : []),
        ...(shown('area-integral') ? [['Area under the curve', T`A&=\int_0^4\sqrt{x}\,dx`, true]] : []),
      ], note: 'The orange strip is one actual partition piece.' }),
      keys: noKeys,
    },
    {
      id: 'x-turn', short: 'Turn about x', heading: T`Rotate the region under $y=\sqrt{x}$ about the x-axis.`,
      controls: ({ shown }) => shown('disc') ? ['angle', 'n', 'selected', 'pieceView'] : ['selected', 'pieceView'],
      prompts: [
        { id: 'disc', q: 'Predict the shape swept out by the orange rectangle. Identify its radius and thickness.', a: T`A thin disc: radius $\sqrt{x_i}$, thickness $\Delta x$.` },
        { id: 'piece-volume', q: 'Find the cross-sectional area, then the volume of one thin piece.', aLines: [T`$A=\pi(\sqrt{x_i})^2=\pi x_i$`, T`$\Delta V\approx\pi x_i\Delta x$`] },
        { id: 'x-volume', q: 'Write the volume integral on [0, 4], and evaluate it.', aLines: [T`$V=\pi\int_0^4(\sqrt{x})^2\,dx$`, T`$=8\pi\approx25.1\text{ units}^3$`] },
      ],
      graph: ({ v, shown }) => base(v, { id: 'x-turn', revealed: shown('disc'), dimensions: shown('disc'), stack: true, labels: positiveLabels }),
      readout: ({ v, shown }) => shown('x-volume') ? T`$V=8\pi\approx25.1\text{ units}^3$` : sliceReadout(0, 4, v, 'x'),
      working: ({ shown }) => ({ blocks: [
        ...(shown('piece-volume') ? [['Circular face', T`A&=\pi r^2\\&=\pi(\sqrt{x_i})^2\\&=\pi x_i`], ['Thin disc', T`\Delta V&\approx A\Delta x\\&=\pi x_i\Delta x`]] : []),
        ...(shown('x-volume') ? [['Add the discs', T`V&=\pi\int_0^4(\sqrt{x})^2\,dx\\&=\pi\int_0^4x\,dx\\&=8\pi\\&\approx25.1\text{ units}^3`, true]] : []),
      ], note: shown('x-volume') ? 'Special case: the cross-sectional area is linear in x. Every equal-width midpoint disc sum already equals 8π. More discs improve the shape, not this total.' : 'Reveal each answer to see its working.' }),
      keys: ({ shown }) => shown('x-volume') ? integralKeys({ goal: 'Find the volume about the x-axis', typing: `${PI} ${X}`, lo: '0', hi: '4', out: '25.13274123',
        watch: 'π is typed inside the integral, so the display is the volume itself. Leave it out and the display shows 8, the plain integral.' }) : noKeys(),
    },
    {
      id: 'negative', short: 'Below the axis', heading: 'Reflect the profile below the x-axis.',
      controls: ({ shown }) => shown('negative-same') ? ['side', 'angle', 'selected', 'pieceView'] : ['selected', 'pieceView'],
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
      id: 'y-turn', short: 'Turn about y', heading: T`Rotate the region beside $y=\sqrt{x}$ about the y-axis, for $0\le y\le2$.`,
      controls: ({ shown }) => shown('y-disc') ? ['angle', 'n', 'selected', 'pieceView'] : ['selected', 'pieceView'],
      prompts: [
        { id: 'y-disc', q: 'Which strips make discs about the y-axis? State their thickness.', a: T`Horizontal strips, with thickness $\Delta y$.` },
        { id: 'y-form', q: T`Starting with $y=\sqrt{x}$, write $x$ and then $x^2$ in terms of $y$.`, aLines: [T`$y^2=x$`, T`$x=y^2$`, T`$x^2=y^4$`] },
        { id: 'y-volume', q: 'Write the volume integral and evaluate it.', aLines: [T`$V=\pi\int_0^2y^4\,dy$`, T`$=\frac{32\pi}{5}\approx20.1\text{ units}^3$`] },
      ],
      graph: ({ v, shown }) => base(v, { id: 'y-turn', axis: 'y', scale: 7, b: 2, outer: (y) => y * y, revealed: shown('y-disc'), dimensions: shown('y-disc'), stack: true, bounds: B, labels: [{ id: 'function', x: 2.6, y: Math.sqrt(2.6), html: shown('y-form') ? '$x=y^2$' : T`$y=\sqrt{x}$`, color: C.strip, pos: 'se' }] }),
      readout: ({ v, shown }) => shown('y-volume') ? T`$V=\frac{32\pi}{5}\approx20.1\text{ units}^3$` : sliceReadout(0, 2, v, 'y'),
      working: ({ shown }) => ({ blocks: [
        ...(shown('y-disc') ? [['Horizontal disc thickness', T`\text{thickness}&=\Delta y`]] : []),
        ...(shown('y-form') ? [['Rewrite the function', T`y&=\sqrt{x}\\y^2&=x\\x&=y^2`], ['Square the horizontal radius', T`r^2&=x^2\\&=(y^2)^2\\&=y^4`]] : []),
        ...(shown('y-volume') ? [['Add the discs', T`V&=\pi\int_0^2(y^2)^2\,dy\\&=\pi\int_0^2y^4\,dy\\&=\frac{32\pi}{5}\\&\approx20.1\text{ units}^3`, true]] : []),
      ], note: 'The shaded region has changed from the x-axis example. Choose bounds and thickness from the selected axis.' }),
      keys: ({ shown }) => shown('y-volume') ? integralKeys({ goal: 'Find the volume about the y-axis', typing: `${PI} ${X} ${k('^')} ${e('4')}`, leave: true, lo: '0', hi: '2', out: '20.10619298',
        watch: 'The calculator integrates in X only, so X stands for y here. The limits are still the y-values 0 and 2.' }) : noKeys(),
    },
    {
      id: 'stretch', short: 'Double the height', heading: T`Compare $f(x)=\sqrt{x}$ and $g(x)=2f(x)$. Rotate about x.`,
      controls: ({ shown }) => shown('stretch-compare') ? ['model', 'selected', 'pieceView'] : ['selected', 'pieceView'],
      prompts: [
        { id: 'stretch-compare', q: 'Both regions revolve about the x-axis on [0, 4]. Predict the volume factor when the height doubles.', a: 'Every radius doubles. Circle areas, and therefore the volume, are multiplied by 4.' },
        { id: 'stretch-rule', q: T`Generalise: if $g(x)=qf(x)$ with $q>0$, what is the volume factor about x?`, a: T`The factor is $q^2$: the radius scale is squared.` },
      ],
      graph: ({ v, shown }) => {
        const doubled = shown('stretch-compare') && v.model === 'g'
        const factor = doubled ? 2 : 1
        const result = base(v, { id: 'stretch', axis: 'x', outer: (x) => factor*Math.sqrt(x),
          angle: 360, turnEnabled: false, revealed: shown('stretch-compare'), stack: true,
          bounds: { left: -0.8, right: 4.8, bottom: -0.8, top: 4.8 }, scale: 7.5,
          labels: [
            { id: 'f', x: 3.2, y: Math.sqrt(3.2), html: T`$f(x)=\sqrt{x}$`, color: C.strip, pos: 'se' },
            { id: 'g', x: 2.8, y: 2*Math.sqrt(2.8), html: T`$g(x)=2f(x)$`, color: C.coral, pos: 'n' },
          ],
          extra: [{ type: 'curve', f: (x) => [x,(doubled?1:2)*Math.sqrt(x)], t: [0,4], color: doubled?C.strip:C.coral }],
        })
        // Keep both supplied curves visible; only the chosen generating strip/disc changes.
        result.profile.items.find((item)=>item.type==='curve').color = doubled ? C.coral : C.strip
        return result
      },
      readout: ({ v, shown }) => shown('stretch-compare') ? (v.model==='g' ? T`Showing $g$: $V_g=32\pi$ cubic units` : T`Showing $f$: $V_f=8\pi$ cubic units`) : 'Same interval [0, 4]. Every height on g is twice the height on f.',
      working: ({ shown }) => ({ blocks: [
        ...(shown('stretch-compare') ? [
          ['Original profile', T`V_f&=\pi\int_0^4[f(x)]^2\,dx\\&=8\pi`],
          ['Doubled profile', T`V_g&=\pi\int_0^4[2f(x)]^2\,dx\\&=4\pi\int_0^4[f(x)]^2\,dx\\&=4V_f\\&=32\pi`, true],
        ] : []),
        ...(shown('stretch-rule') ? [['Vertical stretch by q, about x', T`V_g&=q^2V_f`]] : []),
      ], note: 'The length interval stays [0, 4]. Toggle f and g to compare their solids at the same camera scale.' }),
      keys: ({ shown }) => shown('stretch-compare') ? integralKeys({ goal: 'Find the volume of the doubled solid', typing: T`${PI} ${e('4')} ${X}, because $[2\sqrt{x}]^2=4x$`, lo: '0', hi: '4', out: '100.5309649',
        watch: 'Compare with 25.13274123 for f. This display is four times as large, which is the factor $q^2=2^2$.' }) : noKeys(),
    },
  ],
}
