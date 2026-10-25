// Three different shots, three useful forms. Model values verified in qa/verify-u05-l01.py.
// No gravity coefficient is supplied: students determine it from each shot's given information.
import { COLORS as C } from '../../kit/style.js'
import { fmt } from '../../kit/math.js'
import { flightGraph, releaseGuide, height, landingTime } from '../../components/projectile/index.js'

export const SHOTS = [
  { id: 'A', a: -5, b: 6, c: 2, color: C.teal, labelAt: 1.05, pos: 'sw' },
  { id: 'B', a: -5, b: 7, c: 1.5, color: C.coral, labelAt: 1.3, pos: 'e' },
  { id: 'C', a: -5, b: 6, c: 2.4, color: C.strip, labelAt: 0.35, pos: 'nw' },
]
const [A, B, D] = SHOTS
const knownA = [[0, 2, 'Release: $(0,2)$', 'w'], [0.6, 3.8, 'Maximum: $(0.6,3.8)$', 'n']]
const knownB = [[0.2, 2.7, '$(0.2,2.7)$', 'nw'], [0.6, 3.9, '$(0.6,3.9)$', 'n'], [1, 3.5, '$(1,3.5)$', 'e']]
const knownC = [[0, 2.4, 'Release: $(0,2.4)$', 'w'], [1.2, 2.4, '$(1.2,2.4)$', 'e'], [0.4, 4, '$(0.4,4)$', 'n']]
const noKeys = { steps: ['Use the given information to choose a form.'], out: 'Choose before calculating.' }
const unchecked = 'Menu sequence not yet checked on the calculator. Use the named screen labels.'
const modelKeys = (formula) => ({
  steps: ['Open GRAPH from MENU.', `Enter $Y_1=${formula}$. Use $X$ in place of $t$.`,
    'Use a window covering $0\\le X\\le1.8$ and $0\\le Y\\le5$, then draw.'],
  out: 'Height against time', watch: unchecked,
})
const givens = {
  intro: 'Each ball follows a quadratic model. Time $t$ is measured from release; height $h$ is above the floor.',
  cards: [
    { title: 'Shooter A', lines: ['Released at $2$ m.', 'Maximum height $3.8$ m at $0.6$ s.'] },
    { title: 'Shooter B', lines: ['At $0.2$ s: $2.7$ m.', 'At $0.6$ s: $3.9$ m.', 'At $1.0$ s: $3.5$ m.'] },
    { title: 'Shooter C', lines: ['Released at $2.4$ m.', 'Back at $2.4$ m at $1.2$ s.', 'At $0.4$ s: $4.0$ m.'] },
  ],
  note: 'Compare the flights as if nothing catches the balls before the floor. Ignore bounces.',
}
const cursor = (shot, t) => t >= landingTime(shot) ? `${shot.id}: on floor` : `${shot.id}: ${fmt(height(shot, t), 2)} m`

export default {
  course: 'mai-hl', unit: 5, lesson: 1,
  title: 'Three shots, three forms', engine: 'svg',
  bridge: 'Unit 4 Lesson 9: choose a model from its features, use it, and judge its domain.',
  params: {
    time: { type: 'range', label: 'Time since release', min: 0, max: 1.7, step: 0.01, value: 0, show: (v) => `$t=${v.toFixed(2)}$ s`, sel: true },
  },
  scenes: [
    {
      id: 'challenge', short: 'Three shots',
      heading: 'Three different shots. Which ball goes highest? Which stays in the air longest?',
      board: () => givens,
      readout: () => 'Only the measurements are known. Build a model for each shot.',
      prompts: [
        { id: 'predict-height', q: 'Whose ball reached the greatest height? Make a prediction.', a: 'Keep your prediction. Compare the three models in Scene 5.' },
        { id: 'predict-time', q: 'Whose ball stayed airborne longest? Will it be the same shooter?', a: 'Record a reason for your prediction. The airtime ends when the ball first reaches the floor.' },
      ],
      working: () => ({ rows: [['Variables', 't\\text{ in seconds},\\ h\\text{ in metres}']], note: 'As with the periodic models in Unit 4, start with the features you know. Here we model one flight, from release to the floor.' }),
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
      working: ({ shown }) => ({ rows: [
        ['Given', '(0,2),\\quad (0.6,3.8)\\text{ is the vertex}'],
        ...(shown('a-form') ? [['Vertex form', 'h_A(t)=a(t-0.6)^2+3.8']] : []),
        ...(shown('a-model') ? [['Substitute', '2=a(0-0.6)^2+3.8'], ['Solve', 'a=\\frac{2-3.8}{0.36}=-5'], ['Model', 'h_A(t)=-5(t-0.6)^2+3.8', true]] : []),
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
      working: ({ shown }) => ({ rows: [
        ['Start', 'h_B(t)=at^2+bt+c'],
        ...(shown('b-system') ? [['At 0.2 s', '0.04a+0.2b+c=2.7'], ['At 0.6 s', '0.36a+0.6b+c=3.9'], ['At 1 s', 'a+b+c=3.5']] : []),
        ...(shown('b-model') ? [['GDC', 'a=-5,\\ b=7,\\ c=1.5'], ['Model', 'h_B(t)=-5t^2+7t+1.5', true]] : []),
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
      heading: 'Shooter C: 2.4 m at release and 1.2 s; 4 m at 0.4 s.',
      readout: ({ shown }) => shown('c-model') ? '$h_C(t)=-5t(t-1.2)+2.4$' : 'The two crossings are at release height, not at floor level.',
      controls: ({ shown }) => shown('c-model') ? ['time'] : [],
      prompts: [
        { id: 'c-form', q: 'Which expression has zeros at $t=0$ and $t=1.2$?', a: '$h_C(t)-2.4$, so $h_C(t)-2.4=at(t-1.2)$.' },
        { id: 'c-model', q: 'Use $(0.4,4)$ to find $a$, then state the height model.', a: '$4-2.4=a(0.4)(-0.8)$ gives $a=-5$. Thus $h_C(t)=-5t(t-1.2)+2.4$.' },
      ],
      graph: ({ v, shown }) => flightGraph({ shots: [{ ...D, known: knownC, reveal: shown('c-model') }], guides: [releaseGuide(2.4)], time: shown('c-model') ? v.time : undefined }),
      working: ({ shown }) => ({ rows: [
        ['Known level', 'h_C(0)=h_C(1.2)=2.4'],
        ...(shown('c-form') ? [['Shift', 'h_C(t)-2.4=at(t-1.2)']] : []),
        ...(shown('c-model') ? [['Substitute', '4-2.4=a(0.4)(0.4-1.2)'], ['Solve', '1.6=-0.32a\\quad\\Rightarrow\\quad a=-5'], ['Model', 'h_C(t)=-5t(t-1.2)+2.4', true]] : []),
      ], note: 'The factor zeros mean return to the release height. To find when the ball reaches the floor, solve h_C(t)=0, not h_C(t)−2.4=0.' }),
      keys: ({ shown }) => shown('c-model') ? modelKeys('-5X(X-1.2)+2.4') : noKeys,
    },
    {
      id: 'compare', short: 'Compare',
      heading: 'Return to your predictions. Compare the three completed models.',
      controls: ['time'],
      readout: ({ v }) => SHOTS.map((shot) => cursor(shot, v.time)).join(' · '),
      prompts: [
        { id: 'highest', q: 'Whose ball reached the greatest height?', a: 'C: $4.20$ m. B: $3.95$ m. A: $3.80$ m.' },
        { id: 'longest', q: 'Whose ball stayed airborne longest?', a: 'B: $1.59$ s. C: $1.52$ s. A: $1.47$ s. Greatest height does not guarantee longest airtime.' },
        { id: 'forms', q: 'Which information made each form useful?', a: 'A: vertex. B: three points. C: two crossings of a known height. Each form is a different way to expose useful features.' },
      ],
      graph: ({ v, shown }) => flightGraph({ shots: SHOTS.map((shot) => ({ ...shot, reveal: true })), time: v.time,
        revealPeaks: shown('highest'), revealLandings: shown('longest') }),
      working: ({ shown }) => ({ rows: [
        ['A · vertex', 'h_A=-5(t-0.6)^2+3.8'],
        ['B · standard', 'h_B=-5t^2+7t+1.5'],
        ['C · factored', 'h_C=-5t(t-1.2)+2.4'],
        ...(shown('highest') ? [['Maxima', 'A:3.80,\\ B:3.95,\\ C:4.20\\text{ m}', true]] : []),
        ...(shown('longest') ? [['Solve', 'h_A(t)=0,\\ h_B(t)=0,\\ h_C(t)=0'], ['Airtimes', 'A:1.47,\\ B:1.59,\\ C:1.52\\text{ s}', true]] : []),
      ], note: 'Move time through 1.47–1.59 s to test the comparison. Each domain runs from release to its positive zero. If a ball is caught or enters a basket, the model stops being a free-flight model at that time.' }),
      keys: ({ shown }) => ({
        steps: ['In GRAPH, enter the three models as $Y_1$, $Y_2$, and $Y_3$.',
          'Use a window covering $0\\le X\\le1.8$ and $0\\le Y\\le5$.',
          'G-Solv MAX: compare the three maximum heights.',
          'G-Solv ROOT: choose the positive zero of each model.'],
        out: shown('longest') ? 'Longest: B ≈ 1.59 s' : 'Compare before revealing.',
        watch: unchecked + ' Only the positive root is in the flight domain.',
      }),
    },
  ],
}
