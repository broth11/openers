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
const unchecked = 'Menu sequence not yet checked on the calculator. Use the named screen labels.'
const modelKeys = (formula) => ({
  steps: ['Open GRAPH from MENU.', `Enter $Y_1=${formula}$. Use $X$ in place of $t$.`,
    'Use a window covering $0\\le X\\le1.8$ and $0\\le Y\\le5$, then draw.'],
  out: 'Height above floor against time', watch: unchecked,
})
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
      keys: ({ shown }) => shown('a-model') ? modelKeys('-5(X-0.6)^2+3.8') : noKeys,
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
      keys: ({ shown }) => shown('b-system') ? {
        steps: ['Open EQUATION, choose simultaneous equations, and select three unknowns.',
          'Use the columns for $a$, $b$, $c$, and the right-hand side.',
          'Row 1: $0.04,\\ 0.2,\\ 1,\\ 2.7$.',
          'Row 2: $0.36,\\ 0.6,\\ 1,\\ 3.9$.',
          'Row 3: $1,\\ 1,\\ 1,\\ 3.5$. Solve.'],
        out: shown('b-model') ? 'a = −5, b = 7, c = 1.5' : 'Reveal the model after solving.',
        watch: unchecked + ' The coefficient of c is 1 in every row.',
      } : noKeys,
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
      keys: ({ shown }) => shown('c-model') ? modelKeys('-5X(X-1.7)') : noKeys,
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
        steps: ['In GRAPH, enter the three models as $Y_1$, $Y_2$, and $Y_3$.',
          'Use a window covering $0\\le X\\le1.8$ and $0\\le Y\\le5$.',
          'G-Solv MAX: compare the three maximum heights.',
          'G-Solv ROOT: choose the positive zero of each model.'],
        out: shown('longest') ? 'Longest: C = 1.70 s' : 'Compare before revealing.',
        watch: unchecked + ' For C, 0 s starts the bounce; 1.7 s ends it.',
      }),
    },
  ],
}
