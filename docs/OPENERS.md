# How to build an opener

The method and the code contract for every opener. Claude reads this through `CLAUDE.md`, Codex through `AGENTS.md`. Lesson planning (whether a lesson gets an opener, and the outline Ben approves) lives in Ben's lesson skills; this file covers how the opener itself is built.

## What an opener is

The first 5 to 10 minutes of class: one live visual Ben projects and drives while students predict, answer, and write. Every opener is on one student site (`openers.bensnotes.app`) with a deep link per lesson (`#mai-hl-u11-l09`), so students can come back to any lesson's key visual. Each lesson can also be built as a single private artifact for preview or sharing.

### What it must do

- **Bridge from a recent lesson.** Show the relationship between what students just learned and today's idea. Start where students already are, live, then move.
- **Make students commit before they see.** Prediction choices, questions with hidden answers, exact values held back until the matching answer is revealed.
- **Show a limit of the old method.** The case where last lesson's method stops working or becomes impractical, so today's method is needed.
- **End with something to explore.** A final scene with controls students can push to edge cases.

The U11 L9 pilot's four scenes are the pattern to reach for, not a template: Last lesson, Same object new view (with a prediction), Only one way works, Your turn.

## Reuse first

1. Read `docs/CATALOG.md`. If a component already does what the scene needs, use it.
2. If a scene needs something new and reusable (a 3D solid, a Voronoi diagram, a network), build it as a component in `src/components/<name>/` with a `README.md` (what it does, options, a working example, rules, pitfalls met) and add it to the catalog. Then use it in the lesson.
3. Lesson modules hold content (questions, scenes, numbers). Drawing code that another lesson could use belongs in a component, not in the lesson.

## The lesson module

`src/lessons/<course>/uNN-lNN-<slug>.js`, default export:

```js
export default {
  course: 'mai-hl', unit: 11, lesson: 9,
  title: 'Area between a curve and the y-axis',
  bridge: 'Lesson 8: area between curves',
  engine: 'svg',                                // the default; see docs/ENGINES.md
  params: {                                     // every control, shared across scenes
    n: { type: 'range', label: 'Strips', min: 1, max: 40, step: 1, value: 6, show: (v) => String(v) },
    p1: { type: 'range', label: 'Typical strip at', min: 0, max: 4, step: 0.01, value: 1.5, show: (v, all) => `x = ${v}`, sel: true },
    dir: { type: 'seg', label: 'Slice', options: [['v', 'Vertical'], ['h', 'Horizontal']], value: 'v' },
  },
  scenes: [
    {
      id: 'recall', short: 'Last lesson',
      heading: 'Text with $math$',
      controls: ['n', 'p1'],                    // or ({ v }) => [...]
      prompts: [
        { id: 'r1', q: 'Question', a: 'Answer' },
        // For separate, well-spaced equation rows use aLines: ['...', '...'] instead of a.
        { id: 'r2', q: 'Predict…', choices: ['smaller', 'the same', 'larger'], correct: 1, a: 'Answer' },
      ],
      graph: ({ v, shown }) => ({ bounds, items, labels }),
      readout: ({ v, shown }) => 'one line beside the heading',
      working: ({ v }) => ({ rows: [['Label', 'latex', isAnswer]], note: 'text' }),
      keys: ({ v }) => ({ steps: ['html'], out: 'display value', watch: 'common trap' }),
    },
  ],
}
```

- `v` holds the control values; `shown(id)` is true once a prompt's answer is revealed.
- `show: (value, allValues)` formats a slider's readout.
- Optional `board: (ctx) => ({ intro, cards: [{ title, lines }], note })` replaces the graph with a given-information board. It uses the shared Information board component. No equations or completed curves need be shown before students have constructed a model.
- `working()` may return `blocks: [[caption, alignedLatex, isAnswer], ...]` instead of `rows`. Each caption sits above display mathematics; use `&` before the equals sign and `\\` for continuation lines. Split long substitutions vertically. The working must never require horizontal scrolling; the layout check measures each display block and the drawer itself.
- Text accepts `$inline$` and `$$display$$` LaTeX, rendered by MathLive.
- Add a new course to `src/lessons/courses.js`.

### Graph spec (SVG engine)

- `bounds`: the region that must be visible. The stage keeps a 1:1 grid and grows the shorter range to fit.
- Optional `axes: { x, y, aspect, xStep, yStep, nonnegative }` names quantities and units, sets a deliberate horizontal display ratio (default 1), and can restrict axes to positive directions. `aspect: 3` means one horizontal unit is three times the screen length of one vertical unit. Record the ratio when the quantities have different units, as with time and height. Omit `xStep` and `yStep` for the automatic grid. Defaults remain the pilot's x/y, 1:1, double-ended axes.
- `items`, drawn in layers (see `src/kit/svg.js`):
  - `{ type: 'area', var: 'x' | 'y', from, to, lo, hi, color, opacity }` shaded region between two functions
  - `{ type: 'rects', items: [[x1, x2, y1, y2], ...], color, opacity }` many strips
  - `{ type: 'line', x1, y1, x2, y2, color, width, dash }`
  - `{ type: 'curve', f: (t) => [x, y], t: [a, b], color, width, dash }`
  - `{ type: 'rect', x1, x2, y1, y2, color, drag: { param, axis } }` the typical strip, draggable
  - `{ type: 'dim', from: [x, y], to: [x, y], color }` a dimension arrow
  - `{ type: 'points', pts: [[x, y], ...], color, r }`
- `labels`: `{ id, x, y, html, color, pos, plain, fixed }`. See "Labels" below.

## House style (fixed by the kit)

- Graph on white always: dotted teal grid at whole units (thinning to 2, 5, 10 as the window grows), axes with arrowheads at all four ends, open origin circle, STIX tick numbers with true minus signs and no 0, axis titles x and y.
- Colours and line weights come from `src/kit/style.js`, by role. Curves teal `#0f8b8d`, second boundary coral `#e4572e`, strips accent blue, orange `#e8890c` only for the typical strip, its slider, and answers. Never invent a colour.
- Function labels: white box, thin rounded black border, text in the curve colour, using the source's notation (`y=\sqrt{x}`, `x=y^2`).
- Page: questions column on the left (answers hidden until revealed, in class and at home), stage in the centre, working and Casio fx-CG50 panel sliding in from the right. Keys: arrows change scene, R reveals the next answer, W opens the panel, F full screen, Esc closes the panel.

## Rules learned on the pilot

- **A typical strip is always one of the drawn strips** (`components/strips`, `snap()`): it starts and stops on strip edges, never leaves the bounds, and uses the same midpoint as the blue strip under it. The slider readout shows that midpoint.
- **Strip sums are midpoint sums**, shown live, converging to the exact value.
- **Exact first, then rounded.** Working rows use "=" while exact and "≈" only from the first rounding (`Frac.exactThenApprox()` in `src/kit/math.js`).
- **Labels are placed by the shared placer, never by hand** (`src/kit/labels.js`, ported from labkit in the aasl-online-lesson-deck skill). Give each label an anchor on the thing it names and a preferred `pos`; the placer tries it, then 23 other directions, and takes the first box clear of curves, lines, points, axes, tick numbers, and other labels. Marks tied to one spot (Δx above its strip) are `fixed: true` and placed first. `x: 'left' | 'right'`, `y: 'top' | 'bottom'` pin a label to that edge of the view. Labels are placed again when the maths fonts load.
- **Nothing moves when a slider moves.** The readout has a fixed one-line row; keep it to one line, and never let a slider change the height of the heading, the questions column, or the controls. The check fails on a shift over 0.5 px.
- **Long maths in answers is split** into separate `$...$` chunks so the column can wrap.
- **MathLive has no `\dots`.** Type three plain dots inside the maths.
- **Every calculator panel says what is being found** (Ben, 2026-10-25). Return `keys()` as `sections: [{ goal, steps }]`, one section per task, and start each `goal` with a verb that names the result: "Draw the model", "Find the maximum height", "Find the x-intercepts", "Solve the system of equations", "Evaluate $H(2)$". Steps restart at 1 under each goal. A flat `steps` list is still accepted, but new and changed openers use sections. `out` stays below the last section.
- **Calculator steps** are Casio fx-CG50, built from the current numbers, ending with the display value and an orange Watch out for the classic trap. Take every sequence from the verified key log in the gdc-online-deck skill (`references/menu_paths_verified.md`). The Run-Matrix ∫dx template is [OPTN] [F4] CALC [F4] ∫dx; the cursor starts in the integrand; [→] moves to the lower then the upper limit, with one more [→] first after an exponent box or Abs. Abs is [OPTN] [F6] ▷ [F4] NUMERIC [F1]. The fx-CG50 integrates in X only. A step not in the log is never flagged on screen (Ben, 2026-10-25: students must not see "not yet checked"); list it in a comment at the top of the lesson file and tell Ben in the hand-off.
- **Words**: no em dashes, Oxford commas, plain direct voice.
- **Every exact value** (areas, antiderivatives, limits) is checked with sympy before committing.
- **U5 L1 planning decisions (Ben, 2026-10-25, revised after preview):** three basketball flights in five scenes: givens and comparison questions; vertex form; standard form from three points; actual root form using C's floor-to-floor bounce; comparison/recap. The opening scene supplies only information needed to determine the models. Demonstrate simultaneous equations once, with a full 3×3 system; use one coefficient substitution in the other two forms. A height–time graph is not a spatial ball trajectory. Stop each flight at its next floor contact; hold its cursor there afterwards.
- **Reveal discipline:** model curves and solved coefficients appear only after the model answer is revealed. The working/calculator drawer follows the same reveal state. Initial comparison questions defer their answers to the recap, and do not expose full models via the drawer.
- **Point labels (Ben, 2026-10-25):** coordinate labels must sit close to the point they name. Use `attached: true`: the placer ignores that label's own dot as an obstacle, tries all nearby directions before distant ones, and prioritises coordinate labels over function names. If unavoidable displacement exceeds 22 px, a thin leader connects the box to its actual point. Never put a coordinate label far away without a connection.
- **Use actual roots for the factored-form scene (Ben, 2026-10-25):** Ben rejected the release-height crossing setup and rejected maximum/vertex information for this scene. U5 L1 C is one bounce with known floor contacts at t=0 and t=1.7 and one observation h(0.2)=1.5. Use h_C=at(t-1.7) directly, giving a=-5. No shifted function, symmetry argument, maximum height, or vertex time is supplied for C. All opening givens, questions, graphs, working, and recap must agree with the bounce scenario.
- **Working flows vertically (Ben, 2026-10-25):** use available vertical space, display maths, and equals-sign alignment. Captions go above calculations rather than taking a separate left column. Break chained equalities and long substitutions into multiple aligned lines; no horizontal scrolling to read working.
- **Left-pane answers (Ben, 2026-10-25):** successive equation rows also align their equals signs. Use `aLines` with separate maths-only rows; the shell groups them into an aligned display with generous row spacing. Keep explanatory text in its own row.
- **Comparison feature labels (Ben, 2026-10-25):** vertex and root values always have colour-matched leader lines to their actual points. Root labels sit in increasing-time order in one row below the x-axis, with room reserved below the axis. Vertex labels form an ordered row above the maxima. Use the shared placer's `rail: { group, side: 'above' | 'below' }` plus `leader: true`; anchors stay on the mathematical features, and ordinary function labels avoid the reserved rows.

## Build, check, preview

```bash
npm install
npm run dev                                     # live on your machine, no network needed
npm run lint
npm run build && npm run serve                  # site build at http://127.0.0.1:4173
node qa/check.mjs mai-hl-u11-l09                # layout check (second terminal)
npm run artifact -- mai-hl-u11-l09 "U11 L9 Opener"   # one self-contained file in dist-artifact/
```

The check drives every scene, reveal, slider end, and switch at 1366x768, 1440x860, 1920x1080, and a 412-wide phone, with the panel open and closed. It fails on page errors, sideways page scroll, a scrolling panel or questions column, a label outside the graph, or anything shifting more than 0.5 px while a slider sweeps. Look at one screenshot per scene in `qa/out/`.

- **Claude** publishes the artifact build as a private artifact for Ben to preview at once.
- **Codex** (or Ben) previews with `npm run dev`.
- **Pushing a branch** builds a Cloudflare preview; merging into `main` puts it live on `openers.bensnotes.app`. Work on a branch; merge only when Ben approves.
- When you build something reusable, update its component README and `docs/CATALOG.md` in the same commit.

## Revolution rules (U11 L10/L11, October 2026)

- Coordinate-system viewing rotation and mathematical revolution are separate controls.
- For discs, keep signed profiles separate from nonnegative radii.
- A horizontal scale p and vertical scale q multiply volume by pq² about x and qp² about y.
- A full semicircle about its diameter generates a sphere. For the upright hemisphere bowl,
  show its full semicircular cross-section but shade only the quarter-disc generating region.
- Three exact parabolic design points are interpolation, not statistical regression.
- A cutaway explicitly states that values refer to the complete solid.
- Cavity bottoms can change washers into discs. Keep partition boundaries aligned there.
- Midpoint sums are not always changing approximations: sqrt(x) disc sums are exact for all n.
- Per-axis nonnegative arrow options support negative x with nonnegative y.

### U11 preview corrections (Ben, October 2026)

- An unrevealed 3D pane is entirely blank: hide its heading, labels, axis, hint, controls and
  placeholder together, preserving layout space. Do not show partial rendering furniture.
- Start L10 from the height of the function actually displayed, sqrt(x). Rotate that strip,
  identify radius sqrt(x), derive its circular face area, and then form the disc volume.
  Do not retrieve an unrelated radius expression such as x²+1.
- L10 stretch exploration is vertical only: q² about x and q about y, with appropriate intervals.
- L11 explicitly reveals the circle rearrangement and expansion before the volume integral.
  Likewise show the steps rearranging the cavity parabola into radius squared.

### Selected pieces and doubled profiles (Ben, October 2026)

- L10's recall includes the area integral from 0 to 4. Its stretch scene focuses on x only,
  with f(x)=sqrt(x) and g(x)=2f(x) both sketched before the volume prediction. The generated
  solids toggle between f and g at the same camera scale. This supersedes the two-axis
  vertical-stretch comparison in the preceding preview.
- A shared All pieces / Selected only switch isolates the same actual partition slice in
  2D and 3D. Keep curve outlines as context; remove other strips, region fill and solids.
- Selected orange discs/washers are opaque with dashed circular rims and thickness edges.
  Keep surrounding surfaces faint and their end faces very faint to avoid many overlapping
  translucent caps obscuring the selected piece. Avoid triangulated reference wireframes.

### Algebra, spacing and calculator guidance (Ben, October 2026)

- Use prompt `aLines` for separate equations or continuation lines. The shell renders rows with
  real vertical gaps, so stacked fractions/integrals cannot touch the following expression.
  The layout matrix checks those gaps as well as overflow.
- An unused or not-yet-revealed Casio panel stays blank, with no prediction message, placeholder
  or empty Display label. Omit `out` until there is an actual result to show.
- Show the rearrangement from y=f(x) to x=g(y), then square the horizontal radius, before
  introducing a y-axis volume integral. Avoid starting with an already rearranged expression.
- Circle working begins with (x-h)²+(y-k)²=r² and identifies the supplied centre and radius.
  Substitute those values explicitly before isolating and expanding x².
- L11's three-point parabola uses c=1 from (0,1), then 4a−2b=2 and 4a+2b=2. Casio guidance
  uses the verified two-unknown route: MENU, XθT (Equation), F1 SIMUL, F1 2 unknowns; each
  row's entries followed by EXE; F1 SOLVE. Source: gdc-online-deck verified key log, AASL D3,
  23 October 2026 (also distributed in the course toolkit's gdc-online-deck.zip).
