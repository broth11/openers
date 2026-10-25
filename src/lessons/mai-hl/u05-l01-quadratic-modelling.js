// Three different shots, three useful forms. Model values verified in qa/verify-u05-l01.py.
// No gravity coefficient is supplied: students determine it from each shot's given information.
import { COLORS as C } from '../../kit/style.js'
import { fmt } from '../../kit/math.js'
import { flightGraph, height, landingTime } from '../../components/projectile/index.js'

export const SHOTS = [
  { id: 'A', a: -5, b: 6, c: 2, color: C.teal, labelAt: 1.05, pos: 'sw' },
  { id: 'B', a: -5, b: 7, c: 1.5, color: C.coral, labelAt: 1.3, pos: 'e' },
  { id: 'C', a: -5, b: 8.5, c: 0, color: C.strip, labelAt: 1.25, pos: 'e' },
]
const [A, B, D] = SHOTS
const knownA = [[0, 2, 'Release: $(0,2)$', 'w'], [0.6, 3.8, 'Maximum: $(0.6,3.8)$', 'n']]
const knownB = [[0.2, 2.7, '$(0.2,2.7)$', 'nw'], [0.6, 3.9, '$(0.6,3.9)$', 'n'], [1, 3.5, '$(1,3.5)$', 'e']]
const knownC = [[0, 0, 'Bounce: $(0,0)$', 'ne'], [1.7, 0, 'Floor: $(1.7,0)$', 'ne'], [0.2, 1.5, '$(0.2,1.5)$', 'nw']]
const noKeys = { steps: ['Use the given information to choose a form.'], out: 'Choose before calculating.' }
// fx-CG50 steps. Verified on the emulator 25/10/2026 for shooter A (Graph entry, V-Window, DRAW, G-Solv MAX
// gave X=0.6, Y=3.8) and the Equation > SIMUL > 3 unknowns screen; menu paths also from the log in the
// gdc-online-deck skill (references/menu_paths_verified.md).
// NOT YET RUN on the emulator (follow the log's patterns; kept off the student screen at Ben's request):
// simultaneous-equation row entry and SOLVE, B and C entry and MAX, compare-scene MAX with several graphs and ROOT.
const k = (s) => `<span class="key">${s}</span>`
const e = (s) => `<span class="entry">${s}</span>`
const typed = {
  A: `${k('(−)')} ${e('5')} ${k('(')} ${k('X,θ,T')} ${k('−')} ${e('0')}${k('.')}${e('6')} ${k(')')} ${k('x²')} ${k('+')} ${e('3')}${k('.')}${e('8')}`,
  B: `${k('(−)')} ${e('5')} ${k('X,θ,T')} ${k('x²')} ${k('+')} ${e('7')} ${k('X,θ,T')} ${k('+')} ${e('1')}${k('.')}${e('5')}`,
  C: `${k('(−)')} ${e('5')} ${k('X,θ,T')} ${k('(')} ${k('X,θ,T')} ${k('−')} ${e('1')}${k('.')}${e('7')} ${k(')')}`,
}
const openGraph = `${k('MENU')} ${k('5')}: Graph. Wait for the function list before pressing anything else`
const setWindow = `${k('SHIFT')} ${k('F3')} (V-Window). Type ${e('0')} ${k('EXE')} ${e('1')}${k('.')}${e('8')} ${k('EXE')} ${e('0')}${k('.')}${e('2')} ${k('EXE')}, then ${k('↓')} to skip the dot row. Type ${e('0')} ${k('EXE')} ${e('5')} ${k('EXE')} ${e('1')} ${k('EXE')}, then ${k('EXIT')}`
const draw = `${k('F6')} (DRAW). Wait for the whole curve before pressing another key`
const modelKeys = (id, top, x, y) => ({
  sections: [
    { goal: 'Enter the model', steps: [
      openGraph,
      `On the ${e('Y1')} row press ${k('AC')} to clear the old function, then type ${typed[id]}. Press ${k('EXE')} to store it`,
    ] },
    { goal: 'Set the window and draw the graph', steps: [setWindow, draw] },
    { goal: 'Find the maximum height', steps: [
      `${k('F5')} (G-Solv) ${k('F2')} (MAX), then ${k('EXE')} to show the coordinates`,
    ] },
  ],
  out: `Maximum: X = ${x}, Y = ${y}`,
  watch: `Check that ${e('Y1')} reads ${top} before you draw. Keys pressed while a curve is drawing are lost, so wait for the whole curve. Use ${k('X,θ,T')} wherever the model has $t$.`,
})
const simulRow = (n, ...vals) => `Row ${n}: ${vals.map((x) => e(x)).join(` ${k('EXE')} `)} ${k('EXE')}`
const simulKeys = {
  sections: [
    { goal: 'Enter the three equations', steps: [
      `${k('MENU')}, wait for the main menu, then ${k('X,θ,T')} (Equation, icon A)`,
      `${k('F1')} (SIMUL), then ${k('F2')} (3 unknowns). A grid opens with columns a, b, c, d`,
      simulRow(1, '0.04', '0.2', '1', '2.7'),
      simulRow(2, '0.36', '0.6', '1', '3.9'),
      simulRow(3, '1', '1', '1', '3.5'),
    ] },
    { goal: 'Solve the system of equations', steps: [`${k('F1')} (SOLVE)`] },
  ],
  out: 'X = −5, Y = 7, Z = 1.5, so a = −5, b = 7, c = 1.5',
  watch: 'The grid columns are labelled a, b, c, d (the coefficients and the right-hand side), but the answers are labelled X, Y, Z. X is your a, Y is your b, and Z is your c. Enter the 1 for the coefficient of c in every row.',
}
const givens = {
  intro: 'Each ball follows a quadratic model. Start each clock when its flight begins; height $h$ is above the floor.',
  cards: [
    { title: 'Shooter A', lines: ['Released at $2$ m.', 'Maximum height $3.8$ m at $0.6$ s.'] },
    { title: 'Shooter B', lines: ['At $0.2$ s: $2.7$ m.', 'At $0.6$ s: $3.9$ m.', 'At $1.0$ s: $3.5$ m.'] },
    { title: 'Player C · a bounce', lines: ['Bounces off the floor at $t=0$.', 'Returns to the floor at $1.7$ s.', 'At $0.2$ s: $1.5$ m.'] },
  ],
  note: 'Nothing catches the balls mid-flight. For C, model only the flight between the two stated floor contacts.',
}
const cursor = (shot, t) => t >= landingTime(shot) ? `${shot.id}: on floor` : `${shot.id}: ${fmt(height(shot, t), 2)} m`

export default {
  course: 'mai-hl', unit: 5, lesson: 1,
  title: 'Three flights, three forms', engine: 'svg',
  bridge: 'Unit 4 Lesson 9: choose a model from its features, use it, and judge its domain.',
  params: {
    time: { type: 'range', label: 'Time since flight began', min: 0, max: 1.8, step: 0.01, value: 0, show: (v) => `$t=${v.toFixed(2)}$ s`, sel: true },
  },
  scenes: [
    {
      id: 'challenge', short: 'Three shots',
      heading: 'Two shots and a bounce. Which ball goes highest? Which stays in the air longest?',
      board: () => givens,
      readout: () => 'Only the measurements are known. Build a model for each shot.',
      prompts: [
        { id: 'predict-height', q: 'Whose ball reached the greatest height? Make a prediction.', a: 'Keep your prediction. Compare the three models in Scene 5.' },
        { id: 'predict-time', q: 'Whose ball stayed airborne longest? Will it be the same player?', a: 'Record a reason for your prediction. Compare A and B with C’s known airtime.' },
      ],
      working: () => ({ blocks: [['Variables', 't&:\\text{ seconds}\\\\h&:\\text{ metres above the floor}']], note: 'As with the periodic models in Unit 4, start with the features you know. Here we model one flight, from release to the floor.' }),
      keys: () => noKeys,
    },
    {
      id: 'vertex', short: 'Vertex form',
      heading: 'Shooter A: released at 2 m; maximum 3.8 m at 0.6 s.',
      readout: ({ shown }) => shown('a-model') ? '$h_A(t)=-5(t-0.6)^2+3.8$' : 'Use the maximum first. Which form makes it visible?',
      controls: ({ shown }) => shown('a-model') ? ['time'] : [],
      prompts: [
        { id: 'a-form', q: 'Write a form that uses the known maximum directly.', a: '$h_A(t)=a(t-0.6)^2+3.8$. The vertex is $(0.6,3.8)$.' },
        { id: 'a-model', q: 'Use the release height to find the remaining coefficient.', a: '$2=0.36a+3.8$, so $a=-5$. The curve now shows the whole first flight.' },
      ],
      graph: ({ v, shown }) => flightGraph({ shots: [{ ...A, known: knownA, reveal: shown('a-model') }], time: shown('a-model') ? v.time : undefined }),
      working: ({ shown }) => ({ blocks: [
        ['Given', 'h_A(0)&=2\\\\\\text{Vertex}&=(0.6,3.8)'],
        ...(shown('a-form') ? [['Vertex form', 'h_A(t)&=a(t-0.6)^2+3.8']] : []),
        ...(shown('a-model') ? [['Substitute', '2&=0.36a+3.8'], ['Solve', 'a&=\\frac{2-3.8}{0.36}\\\\&=-5'], ['Model', 'h_A(t)&=-5(t-0.6)^2\\\\&\\quad+3.8', true]] : []),
      ], note: 'Vertex information fixes the horizontal and vertical shifts. One other point fixes the remaining coefficient.' }),
      keys: ({ shown }) => shown('a-model') ? modelKeys('A', '−5(x−0.6)²+3.8', '0.6', '3.8') : noKeys,
    },
    {
      id: 'standard', short: 'Three points',
      heading: 'Shooter B: three measured points, with no vertex or release height supplied.',
      readout: ({ shown }) => shown('b-model') ? '$h_B(t)=-5t^2+7t+1.5$' : '$(0.2,2.7)$, $(0.6,3.9)$, and $(1,3.5)$',
      controls: ({ shown }) => shown('b-model') ? ['time'] : [],
      prompts: [
        { id: 'b-system', q: 'Substitute the three points into $h_B(t)=at^2+bt+c$.', a: '$0.04a+0.2b+c=2.7$; $0.36a+0.6b+c=3.9$; $a+b+c=3.5$.' },
        { id: 'b-model', q: 'Solve the three equations together on the GDC. State the model.', a: '$a=-5$, $b=7$, and $c=1.5$. Hence $h_B(t)=-5t^2+7t+1.5$.' },
      ],
      graph: ({ v, shown }) => flightGraph({ shots: [{ ...B, known: knownB, reveal: shown('b-model') }], time: shown('b-model') ? v.time : undefined }),
      working: ({ shown }) => ({ blocks: [
        ['Start', 'h_B(t)&=at^2+bt+c'],
        ...(shown('b-system') ? [['Three equations', '0.04a+0.2b+c&=2.7\\\\0.36a+0.6b+c&=3.9\\\\a+b+c&=3.5']] : []),
        ...(shown('b-model') ? [['GDC solution', 'a&=-5\\\\b&=7\\\\c&=1.5'], ['Model', 'h_B(t)&=-5t^2+7t+1.5', true]] : []),
      ], note: 'This is the one full simultaneous-equations demonstration: three known points, three unknown coefficients. Use the equation solver, not regression.' }),
      keys: ({ shown }) => shown('b-system') ? { ...simulKeys, out: shown('b-model') ? simulKeys.out : 'Reveal the model after solving.' } : noKeys,
    },
    {
      id: 'factored', short: 'Factored form',
      heading: 'C’s bounce: floor at 0 s and 1.7 s; height 1.5 m at 0.2 s.',
      readout: ({ shown }) => shown('c-model') ? '$h_C(t)=-5t(t-1.7)$' : 'The two floor contacts are zeros of the height function.',
      controls: ({ shown }) => shown('c-model') ? ['time'] : [],
      prompts: [
        { id: 'c-form', q: 'The height is zero at $t=0$ and $t=1.7$. Write its factored form.', a: '$h_C(t)=at(t-1.7)$. Both factors come from actual floor contacts.' },
        { id: 'c-model', q: 'Use the point $(0.2,1.5)$ to find $a$ and the model.', a: '$1.5=a(0.2)(-1.5)$, so $a=-5$. Hence $h_C(t)=-5t(t-1.7)$.' },
      ],
      graph: ({ v, shown }) => flightGraph({ shots: [{ ...D, known: knownC, reveal: shown('c-model') }], time: shown('c-model') ? v.time : undefined }),
      working: ({ shown }) => ({ blocks: [
        ['Known roots', 'h_C(0)&=0\\\\h_C(1.7)&=0'],
        ...(shown('c-form') ? [['Factored form', 'h_C(t)&=a(t-0)(t-1.7)\\\\&=at(t-1.7)']] : []),
        ...(shown('c-model') ? [['Substitute', '1.5&=a(0.2)(0.2-1.7)\\\\&=-0.3a'], ['Coefficient', 'a&=\\frac{1.5}{-0.3}\\\\&=-5'], ['Height model', 'h_C(t)&=-5t(t-1.7)', true]] : []),
      ], note: 'The roots are actual floor contacts. Model this one bounce on $0\\le t\\le1.7$; stop before the next bounce.' }),
      keys: ({ shown }) => shown('c-model') ? modelKeys('C', '−5x(x−1.7)', '0.85', '3.6125') : noKeys,
    },
    {
      id: 'compare', short: 'Compare',
      heading: 'Return to your predictions. Compare the three completed models.',
      controls: ['time'],
      readout: ({ v }) => SHOTS.map((shot) => cursor(shot, v.time)).join(' · '),
      prompts: [
        { id: 'highest', q: 'Whose ball reached the greatest height?', a: 'B: $3.95$ m. A: $3.80$ m. C: approximately $3.61$ m.' },
        { id: 'longest', q: 'Whose ball stayed airborne longest?', a: 'C: $1.70$ s. B: $1.59$ s. A: $1.47$ s. Greatest height does not guarantee longest airtime.' },
        { id: 'forms', q: 'Which information made each form useful?', a: 'A: vertex. B: three points. C: two roots. Each form exposes useful features directly.' },
      ],
      graph: ({ v, shown }) => flightGraph({ shots: SHOTS.map((shot) => ({ ...shot, reveal: true })), time: v.time,
        revealPeaks: shown('highest'), revealLandings: shown('longest') }),
      working: ({ shown }) => ({ blocks: [
        ['A · vertex', 'h_A&=-5(t-0.6)^2+3.8'],
        ['B · standard', 'h_B&=-5t^2+7t+1.5'],
        ['C · factored', 'h_C&=-5t(t-1.7)'],
        ...(shown('highest') ? [['Maximum heights', 'A&:3.80\\text{ m}\\\\B&:3.95\\text{ m}\\\\C&\\approx3.61\\text{ m}', true]] : []),
        ...(shown('longest') ? [['Airtimes', 'A&:1.47\\text{ s}\\\\B&:1.59\\text{ s}\\\\C&:1.70\\text{ s}', true]] : []),
      ], note: 'Move time through 1.47–1.70 s to test the comparison. A and B start at release; C starts at its first floor contact. Each model stops at the next floor contact.' }),
      keys: ({ shown }) => ({
        sections: [
          { goal: 'Enter the three models', steps: [
            openGraph,
            `${e('Y1')}: ${k('AC')} if the row is not empty, type ${typed.A}, then ${k('EXE')}. The cursor drops to ${e('Y2')}`,
            `${e('Y2')}: type ${typed.B}, then ${k('EXE')}`,
            `${e('Y3')}: type ${typed.C}, then ${k('EXE')}`,
          ] },
          { goal: 'Set the window and draw all three graphs', steps: [setWindow, draw] },
          { goal: 'Find each maximum height', steps: [
            `${k('F5')} (G-Solv) ${k('F2')} (MAX). Use ${k('↑')} or ${k('↓')} to pick a graph, ${k('EXE')} to take it, then ${k('EXE')} for the coordinates. ${k('F5')} ${k('F2')} again for the next graph`,
          ] },
          { goal: 'Find when each ball lands (the positive zero)', steps: [
            `${k('F5')} ${k('F1')} (ROOT) for the zeros, then ${k('→')} for the next zero. Read the positive one`,
          ] },
        ],
        out: shown('longest') ? 'Longest: C = 1.70 s' : 'Compare before revealing.',
        watch: `For C, 0 s starts the bounce and 1.7 s ends it, so its first zero is $0$. Switch off any graph you are not testing, or pick the right one with ${k('↑')} ${k('↓')} each time.`,
      }),
    },
  ],
}
