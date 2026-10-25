// Approved bowl story: hemisphere, three exact design points, paraboloid cavity, disc/washer split.
// Data are interpolation points, not regression observations. Verified in qa/verify-u11-l10-l11.py.
// Calculator guidance: integral template and Equation > SIMUL > 2 unknowns, row entry
// and F1 SOLVE from the verified key log (gdc-online-deck, AASL D3, 23/10/2026).
import { revolution } from '../../components/solid-of-revolution/index.js'
import { commonParams, T, noKeys, integralKeys, sliceReadout } from '../../components/solid-of-revolution/lesson-tools.js'
import { COLORS as C } from '../../kit/style.js'
import { snap } from '../../components/strips/index.js'

const outer = (y) => Math.sqrt(Math.max(0, 6 * y - y * y))
const cavity = (y) => Math.sqrt(Math.max(0, 2 * y - 2))
const B = { left: -3.8, right: 3.8, bottom: -0.65, top: 3.9 }
const wholeSection = [
  { type: 'curve', f: (y) => [-outer(y), y], t: [0, 3], color: C.muted, width: 2, dash: true },
  { type: 'line', x1: -3, x2: 3, y1: 3, y2: 3, color: C.muted, width: 2 },
]
const outerLabels = [{ id: 'circle', x: 2.5, y: 1.3, html: T`$x^2+(y-3)^2=9$`, color: C.strip, pos: 'e' }]
function bowl(v, changes = {}) {
  const a = changes.a ?? 0, b = changes.b ?? 3
  const result = revolution({ id: 'bowl', axis: 'y', a, b, outer, inner: () => 0,
    n: v.n, selected: a + (b - a) * v.selected, angle: v.angle, isolated: v.pieceView === 'one', bounds: B, scale: 5,
    center: [0, 1.5, 0], labels: outerLabels, extra: wholeSection, ...changes })
  result.profile.axes = { nonnegative: { x: false, y: true } }
  return result
}
// Since the point (0,1) gives c=1, use the verified two-unknown solver for a and b.
const key = (s) => `<span class="key">${s}</span>`
const entry = (s) => `<span class="entry">${s}</span>`
const bowlSystemKeys = (shown) => ({
  sections: [
    { goal: 'Solve the two equations for a and b', steps: [
      `${key('MENU')}, wait for the main menu, then ${key('X,θ,T')} (Equation, icon A).`,
      `${key('F1')} (SIMUL), then ${key('F1')} (2 unknowns).`,
      'The point (0, 1) gives c = 1. The remaining equations are $4a-2b=2$ and $4a+2b=2$.',
      `Row 1: ${entry('4')} ${key('EXE')} ${key('(−)')} ${entry('2')} ${key('EXE')} ${entry('2')} ${key('EXE')}.`,
      `Row 2: ${entry('4')} ${key('EXE')} ${entry('2')} ${key('EXE')} ${entry('2')} ${key('EXE')}.`,
      `${key('F1')} (SOLVE).`,
    ] },
  ],
  out: shown('parabola') ? 'X = 0.5, Y = 0, so a = 1/2, b = 0, c = 1.' : '',
  watch: 'The calculator’s X and Y are the model coefficients a and b. Each row contains two coefficients followed by the right-hand side.',
})
export default {
  course: 'mai-hl', unit: 11, lesson: 11, title: 'A hemisphere bowl', engine: 'three',
  bridge: 'Lesson 10: discs about either axis. What changes when the centre is removed?',
  params: {
    ...commonParams,
    n: { ...commonParams.n, min: 3, max: 36, step: 3, value: 6 },
    cut: { type: 'seg', label: 'Bowl view', options: [['open', 'Cutaway'], ['whole', 'Complete']], value: 'open' },
    object: { type: 'seg', label: 'Inspect', options: [['bowl', 'Material'], ['cavity', 'Removed volume']], value: 'bowl' },
  },
  scenes: [
    {
      id: 'hemisphere', short: 'Make the solid', heading: 'Start with a semicircular cross-section. All lengths are in cm.',
      controls: ({ shown }) => shown('hemisphere') ? ['angle', 'selected', 'pieceView'] : ['selected', 'pieceView'],
      prompts: [
        { id: 'hemisphere', q: 'Revolve the shaded right half about the y-axis. What solid will it make?', a: 'A hemisphere of radius 3 cm. The generating region is a quarter-disc.' },
        { id: 'outer-radius', q: T`Use $x^2+(y-3)^2=9$ to express the squared radius $x^2$ in terms of $y$.`, aLines: [T`$x^2=9-(y-3)^2$`, T`$=9-(y^2-6y+9)$`, T`$=6y-y^2$`] },
        { id: 'outer-volume', q: 'Find its volume using discs. Check with the familiar solid formula.', aLines: [T`$V_{\mathrm{outer}}=\pi\int_0^3(6y-y^2)\,dy$`, T`$=18\pi\text{ cm}^3$`] },
      ],
      graph: ({ v, shown }) => bowl(v, { id: 'hemisphere', revealed: shown('hemisphere') }),
      readout: ({ shown }) => shown('outer-volume') ? T`$V_{\mathrm{outer}}=18\pi\approx56.5\text{ cm}^3$` : 'Only the shaded right half is revolved about y.',
      working: ({ shown }) => ({ blocks: [
        ['Circle with centre (h, k) and radius r', T`(x-h)^2+(y-k)^2&=r^2`],
        ['Insert centre (0, 3) and radius 3', T`(x-0)^2+(y-3)^2&=3^2\\x^2+(y-3)^2&=9`],
        ...(shown('outer-radius') ? [
          ['Make x² the subject, expand and simplify', T`x^2&=9-(y-3)^2\\&=9-(y^2-6y+9)\\&=9-y^2+6y-9\\&=6y-y^2`],
        ] : []),
        ...(shown('outer-volume') ? [
          ['Add horizontal discs', T`V_{\mathrm{outer}}&=\pi\int_0^3(6y-y^2)\,dy\\&=18\pi\text{ cm}^3`, true],
          ['Hemisphere formula check', T`\frac23\pi(3)^3&=18\pi\text{ cm}^3`],
        ] : []),
      ], note: shown('outer-radius') ? 'The horizontal radius is x. Its square is 6y − y²; no square root is needed for disc area.' : 'Replace h by 0, k by 3, and r by 3 in the circle formula.' }),
      keys: ({ shown }) => shown('outer-volume') ? integralKeys({ integrand: '6X-X^2', lo: '0', hi: '3', out: '56.54866776 cm³' }) : noKeys(),
    },
    {
      id: 'design', short: 'Design the hollow', heading: 'Three exact design points define the parabolic cross-section.', controls: [],
      prompts: [
        { id: 'parabola', q: T`Find $y=ax^2+bx+c$ through $(-2,3)$, $(0,1)$, and $(2,3)$.`, aLines: [T`$a=\frac12,\quad b=0,\quad c=1$`, T`$y=\frac12x^2+1$`] },
        { id: 'inner-radius', q: 'Write the squared radius of the cavity in terms of y. State its height interval.', aLines: [T`$y=\frac12x^2+1$`, T`$y-1=\frac12x^2$`, T`$r^2=x^2=2y-2$`, T`$1\le y\le3$`] },
      ],
      graph: ({ v, shown }) => {
        const extras = [...wholeSection,
          { type: 'points', pts: [[-2, 3], [0, 1], [2, 3]], color: C.sel },
          ...(shown('parabola') ? [{ type: 'curve', f: (x) => [x, x * x / 2 + 1], t: [-2, 2], color: C.coral }] : []),
          ...(shown('inner-radius') ? [{ type: 'area', var: 'y', from: 1, to: 3, lo: () => 0, hi: cavity, color: C.coral, opacity: 0.22 }] : []),
        ]
        return bowl(v, { id: 'design', revealed: true, pieces: false, angle: 360, turnEnabled: false, extra: extras,
          labels: [
            ...[[-2, 3], [0, 1], [2, 3]].map(([x, y], i) => ({ id: `point-${i}`, x, y, html: `$(${x},${y})$`, color: C.sel, attached: true, pos: i === 1 ? 's' : 'n' })),
            ...(shown('parabola') ? [{ id: 'parabola', x: 1.4, y: 1.98, html: T`$y=\frac12x^2+1$`, color: C.coral, pos: 'e' }] : []),
          ],
        })
      },
      readout: ({ shown }) => shown('inner-radius') ? T`Cavity: $r^2=2y-2$ on $1\le y\le3$` : 'Construct the curve before revealing it.',
      working: ({ shown }) => ({ blocks: [
        ['Start with a quadratic', T`y&=ax^2+bx+c`],
        ['Use (0, 1), then the other two points', T`c&=1\\4a-2b&=2\\4a+2b&=2`],
        ...(shown('parabola') ? [
          ['Solve and write the profile', T`a&=\frac12,\quad b=0,\quad c=1\\y&=\frac12x^2+1`, true],
        ] : []),
        ...(shown('inner-radius') ? [['Rearrange for the squared radius', T`y-1&=\frac12x^2\\2(y-1)&=x^2\\r^2=x^2&=2y-2`], ['Cavity height interval', T`1&\le y\le3`]] : []),
      ], note: 'Use the Casio tab to solve the reduced 2 × 2 system. These exact design points determine the quadratic.' }),
      keys: ({ shown }) => bowlSystemKeys(shown),
    },
    {
      id: 'remove', short: 'Remove the hollow', heading: 'Revolve the cavity profile, then remove its volume.',
      controls: ({ shown }) => shown('cavity') ? [...(shown('material') ? ['object', 'cut'] : []), 'angle'] : [],
      prompts: [
        { id: 'cavity', q: 'Predict the removed shape, then find its volume.', aLines: ['A paraboloid cavity.', T`$V_{\mathrm{cavity}}=\pi\int_1^3(2y-2)\,dy$`, T`$=4\pi\text{ cm}^3$`] },
        { id: 'material', q: 'How much material remains in the bowl?', aLines: [T`$V_{\mathrm{material}}=18\pi-4\pi$`, T`$=14\pi\approx44.0\text{ cm}^3$`] },
      ],
      graph: ({ v, shown }) => {
        const material = shown('material') && v.object === 'bowl'
        return bowl(v, {
          id: material ? 'remove-material' : 'remove-cavity', a: material ? 0 : 1,
          outer: material ? outer : cavity, inner: material ? cavity : () => 0,
          revealed: shown('cavity'), cutaway: material && v.cut === 'open',
          pieces: false,
          extra: [...wholeSection, { type: 'curve', f: (x) => [x, x * x / 2 + 1], t: [-2, 2], color: C.coral }],
          labels: [{ id: 'parabola', x: 1.4, y: 1.98, html: T`$y=\frac12x^2+1$`, color: C.coral }],
        })
      },
      readout: ({ v, shown }) => shown('material') && v.object === 'bowl' ? T`$V_{\mathrm{material}}=14\pi\approx44.0\text{ cm}^3$` : shown('cavity') ? T`$V_{\mathrm{cavity}}=4\pi\approx12.6\text{ cm}^3$` : 'The removed region lies above the parabola and below the rim.',
      working: ({ shown }) => ({ blocks: [
        ...(shown('cavity') ? [['Removed volume', T`V_{\mathrm{cavity}}&=\pi\int_1^3(2y-2)\,dy\\&=4\pi\text{ cm}^3`]] : []),
        ...(shown('material') ? [['Remaining material', T`V_{\mathrm{material}}&=V_{\mathrm{outer}}-V_{\mathrm{cavity}}\\&=18\pi-4\pi\\&=14\pi\text{ cm}^3\\&\approx44.0\text{ cm}^3`, true]] : []),
      ], note: 'The cutaway removes a quarter of the display to expose the interior. Volume calculations refer to the complete bowl.' }),
      keys: ({ shown }) => shown('cavity') ? integralKeys({ integrand: '2X-2', lo: '1', hi: '3', out: '12.56637061 cm³', note: 'This is the removed volume. Subtract it from the hemisphere volume to find material.' }) : noKeys(),
    },
    {
      id: 'washers', short: 'Inside the bowl', heading: 'Move a horizontal slice from the base towards the rim.',
      controls: ({ shown }) => shown('slice-kind') ? ['selected', 'n', 'cut', 'pieceView'] : ['selected', 'pieceView'],
      prompts: [
        { id: 'slice-kind', q: 'Is every cross-section a washer? Move the selected slice and predict.', a: 'Below y = 1: a solid disc. Above y = 1: a washer. The cavity starts at y = 1.' },
        { id: 'washer-area', q: 'Above y = 1, write the area of a material cross-section.', aLines: [T`$A=\pi(R^2-r^2)$`, T`$=\pi[(6y-y^2)-(2y-2)]$`, 'Subtract circle areas.'] },
        { id: 'split-volume', q: 'Add the material directly. Where must the integral split?', a: T`Split at $y=1$: discs on [0, 1], washers on [1, 3]. The total is $14\pi\text{ cm}^3$.` },
      ],
      graph: ({ v, shown }) => bowl(v, {
        id: 'washers', inner: cavity, revealed: true, angle: 360, turnEnabled: false, cutaway: v.cut === 'open', stack: shown('slice-kind'),
        extra: [...wholeSection, { type: 'curve', f: (x) => [x, x * x / 2 + 1], t: [-2, 2], color: C.coral },
          { type: 'line', x1: 0, x2: 2.5, y1: 1, y2: 1, color: C.muted, dash: true }],
        labels: [
          { id: 'bottom', x: 0, y: 1, html: '$y=1$', color: C.muted, pos: 'w' },
          ...(shown('washer-area') ? [{ id: 'outer-radius', x: 2.5, y: 2.4, html: T`$R^2=6y-y^2$`, color: C.strip }, { id: 'inner-radius', x: 1.3, y: 1.845, html: T`$r^2=2y-2$`, color: C.coral, pos: 'w' }] : []),
        ],
      }),
      readout: ({ v, shown }) => {
        const t = snap(0, 3, v.n, 3 * v.selected)
        return shown('slice-kind') ? `$y_i=${t.m.toFixed(2)}$ · ${t.m < 1 ? 'disc in the solid base' : 'washer through the cavity'}` : sliceReadout(0, 3, v, 'y')
      },
      working: ({ shown }) => ({ blocks: [
        ...(shown('washer-area') ? [['Cross-sectional area above y = 1', T`A&=\pi R^2-\pi r^2\\&=\pi(R^2-r^2)`]] : []),
        ...(shown('split-volume') ? [
          ['Solid base', T`V_{\mathrm{base}}&=\pi\int_0^1(6y-y^2)\,dy\\&=\frac{8\pi}{3}`],
          ['Walls above the cavity bottom', T`V_{\mathrm{walls}}&=\pi\int_1^3[(6y-y^2)\\&\qquad-(2y-2)]\,dy\\&=\frac{34\pi}{3}`],
          ['Total material', T`V&=\frac{8\pi}{3}+\frac{34\pi}{3}\\&=14\pi\text{ cm}^3`, true],
        ] : []),
      ], note: 'Do not square R − r. A washer is an outer circle with an inner circle removed.' }),
      keys: noKeys,
    },
  ],
}
