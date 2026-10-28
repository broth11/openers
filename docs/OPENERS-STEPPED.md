# How to build an opener: the stepped model (candidate)

This is a parallel authoring spec, logged while building the U5 L2 proof of concept
(`src/lessons/mai-hl/u05-l02-stepped-cubic-and-power-models.js`, tag `stepped`). It is NOT yet the
house rule. If Ben prefers it after previewing, fold the relevant parts into `docs/OPENERS.md` and
migrate lessons; until then, `docs/OPENERS.md` stays authoritative and old lessons are untouched.

## Why this exists

In the original model, one "Show answer" click did three things at once: it revealed the left-pane
answer, advanced the graph, and filled the working panel. Ben wanted those pulled apart so he can
drive the animation and the working independently at the board, and so the left pane never gives the
answer away.

## The idea in one paragraph

The **scene animation is the master**. Each scene is a short ordered timeline of **beats**. Stepping
a beat may **pose a question** in the left pane. The left pane only ever poses questions: it shows no
answers and has no reveal button. A posed question's answer lives entirely in the **working pane**,
revealed one **step** at a time with Next / Back, scoped to one question at a time. A working step
may carry a transient **graph cue**, and may **reveal** a persistent graphic. So two things advance
independently: beats (persistent, unlock questions) and working steps (bounded by what the beats
have posed).

## Reveal discipline (the rule that matters most)

Posing a question must NOT reveal its answer, in the left pane, the graph, or the readout. This was
the whole point of the rework, and it is easy to get wrong because the first cut keyed graphics on
"posed". The rule:

- **Givens show from the scene start.** The data the problem provides (given points, axes, the
  context drawing) is on screen before any beat. "Commit before you see the answer" means before the
  answer, not before the problem.
- **Answers wait for the working step that derives them.** A fitted curve, a solved point, a model
  label, and the live cursor that traces a model appear only when the working reaches the step that
  produces them. The shell exposes `revealed(tag)` for exactly this, separate from `posed(id)`.
- **A step reveals by naming tags.** `{ ..., reveals: ['quad'] }` on a step makes `revealed('quad')`
  true once that step is shown; the graph gates the quadratic on it. Reveals are cumulative with the
  step position and un-reveal when you step back.
- **Lock the slider until its curve is revealed.** A `controls` function returns the tracing slider
  (Clock, Distance, Growing dimension) only once the curve it would trace is revealed, so a student
  cannot drag out the answer during the prediction phase. The readout states the setup until then
  and never prints a computed model value early.
- **Predictions are answers too.** The (4, 25) point a "predict the reading at 4 m" question asks
  for is revealed by that question's own working, never when it is posed.
- **A context explorer is not the graph.** A drawn manipulative beside the graph (the growing jar,
  the moving lamp) is a separate explorer once its controls are unlocked: every switch position
  draws a real, complete object that responds to the slider, and it never collapses to a dashed
  placeholder just because a particular graph curve has not been revealed yet. The reveal discipline
  governs the mathematical graph (curves, solved points, model labels, the cursor that traces a
  model), not the physical picture of the situation. Gate the two separately: unlock the explorer
  once the scene has something to explore, but keep each graph curve waiting for its own step. In
  U5 L2 jars, the Grow switch and size slider always show a filled jar; only the matching graph
  curve waits for its working.

The layout check enforces this: on every stepped scene, with all questions posed but no working
stepped, it fails if any model equation is on the graph or any computed value is in the readout. It
also fails on any control label that wraps to a second line (which would shove its slider down).

## What changed in the shell (`src/main.js`)

Backward compatible. A scene is "stepped" only if it declares a `beats` array; everything else runs
the original path unchanged. The whole U11 and U5-L1 set, and the original U5 L2, are unaffected.

- **State.** `S.beat` (current beat in the scene), `S.step` (per-question cumulative step position,
  keyed `sceneIndex:questionId`), `S.pick` (which posed question the panel shows, per scene).
- **`ctx()` for stepped scenes** returns `{ v, beat, shown, posed }`. Crucially, `shown(id)` now
  means "this question has been posed by a beat at or before the current beat". Graph functions that
  already gated on `shown('m1')` keep working verbatim; they just read posed-state instead of
  reveal-state. New graph code may read `beat` directly.
- **Arrows / Left-Right keys** call `advance()`, which walks beats within a stepped scene and rolls
  into the next or previous scene at the ends. The scene chips still jump to a scene. A beat ticker
  (`#beatBar`) under the heading shows one dot per beat.
- **Left pane** (`renderSteppedQA`): only posed questions appear, question text and any prediction
  choices only, never answers. A posed question with working is selectable and points the panel at
  itself.
- **Working pane** (`renderSteppedPanel`): one posed question at a time, chosen by Q-chips. Steps are
  cumulative (position N shows steps 1..N). Next / Back live at the panel foot with an `N / total`
  counter. Each question keeps its own position when you switch away and back. The Working / Casio
  toggle is scoped to the selected question and only shows the views that question has.
- **Graph cue.** `renderGraph` merges the active step's `cue(ctx)` (extra `items` / `labels`) into
  the beat's graph spec. The cue is transient: it is only on while that step is the current one.
- **Keys.** Arrows step beats. `S` / `Shift+S` step the working forward / back (opening the panel if
  needed). `W`, `F`, `Esc` unchanged. `R` still reveals on old scenes; it does nothing on stepped
  scenes (there is nothing to reveal).

## Lesson module shape (stepped context scene)

```js
{
  id: 'mall', short: 'Mall crowds',
  heading: '…',
  readout: ({ v, shown }) => '…',        // shown(id) === "posed", as above
  controls: ({ shown }) => shown('j1') ? ['grow', 'size'] : [],
  beats: [                                // the scene timeline; one entry per beat
    { poses: 'm1' },                      // a beat may pose one question id, or none
    { poses: 'm2' },
    { },                                  // a beat with no question just moves the visual
    { poses: 'm4' },
  ],
  prompts: [
    {
      id: 'm1', q: 'Question text (posed in the left pane, no answer here).',
      choices: ['…'], correct: 1,         // optional prediction, same as before
      steps: [                            // the ordered, cumulative working for THIS question
        { caption: 'Free coefficient', latex: 'c&=20' },
        { caption: 'Substitute', latex: '9a+3b+20&=155\\\\36a+6b+20&=128' },
        { caption: 'Model', latex: 'V&=-9t^2+72t+20', answer: true, note: 'optional note' },
      ],
      keys: { sections: [{ goal: '…', steps: ['…'] }], out: '…', watch: '…' }, // per-question Casio
    },
  ],
  graph: ({ v, shown, beat }) => ({ bounds, items, labels, scene }),
}
```

### A working step

```js
{ caption, latex, answer, note, cue, reveals }
```

- `caption` sits above the display maths (same look as the original `blocks` captions). Optional.
- `latex` is one aligned display block; use `&` before the relation and `\\` for continuation lines,
  exactly as the original `working().blocks` did. Optional: a step may be prose only (caption +
  note) with no maths.
- `answer: true` marks the payoff step (highlighted).
- `note` wraps below the maths. Use it for the sentence of explanation, especially on a narrow panel.
- `cue: (ctx) => ({ items?, labels? })` adds transient graph marks while this step is current. Keep
  it to a highlight (a hollow point, a guide line), not a new curve; persistent curves belong to the
  graph function gated on a reveal.
- `reveals: ['tag', ...]` makes `revealed('tag')` true from this step onward (cumulative, and it
  un-reveals on stepping back). This is how a persistent graphic (the fitted curve, the solved
  point, the model label) and its tracing slider appear exactly when the working derives them. The
  graph function reads `revealed(tag)`; givens read nothing and show from the start. Put the reveal
  on the step that produces the thing: the "Model" step reveals the curve, the prediction's answer
  step reveals the predicted point.

### Recap scenes are unchanged

A scene with `cards` and no `beats` stays a pure explorer: cards follow the controls, no questions,
no working. In U5 L2 stepped these are scenes 4 to 6 (polynomial, direct, inverse), identical to the
original. Mixing stepped context scenes and card recap scenes in one lesson is expected.

### A second menu entry for the same lesson

`tag: 'stepped'` (with an optional `tagLabel`) gives a lesson its own menu card and deep link
(`#mai-hl-u05-l02-stepped`) beside the original, for A/B comparison without touching it. A `tag` is
different from a `variant`: a variant is the same lesson drawn by another engine, chosen by the
header toggle and hidden from the menu; a tag is a separate menu entry. `npm run artifact -- <key>`
accepts the tagged key.

## Authoring rules carried over (still apply)

Everything in `docs/OPENERS.md` under House style, Rules learned on the pilot, and the per-unit
notes still holds: house colours and the shared label placer, exact-then-rounded working, every
exact value checked in sympy, no em dashes, Oxford commas, the calculator key log in the
gdc-online-deck skill, and "nothing moves when a slider moves". The stepped model changes how
answers are revealed, not the maths or the look.

## New rules learned building the stepped U5 L2

- **The left pane never carries the answer.** Question text and an optional prediction only. If you
  find yourself wanting to put a result in the left pane, it belongs in a working step.
- **Prose conclusions go in `note`, not `\text{…}` latex.** A wide `\text{...}` line does not wrap
  and overflows the panel at phone width (the layout check caught this on m3). Put the sentence in
  `caption` / `note`, which wrap, and keep `latex` for actual maths.
- **One idea per step.** A step is one caption plus one short aligned block. Split long
  substitutions across steps rather than packing one tall block, so Next / Back tracks the teaching.
- **The answer step is the last step.** Mark it `answer: true`. Cumulative stepping means reaching it
  shows the whole derivation above it.
- **Cues are highlights, not scenery.** Anything that should persist once posed (a fitted curve, a
  solved coefficient) is drawn by the beat's graph function gated on `shown(id)`. A cue only points
  at the step's focus and disappears when you step past it.
- **Keep per-question Casio on the question.** `prompt.keys` (object or `(ctx) => object`), same
  shape as the old scene-level `keys`. The toggle shows Casio only when the selected question has it.

## Build, check, preview

Same commands as `docs/OPENERS.md`. The layout check (`qa/check.mjs`) was extended to drive stepped
scenes: it walks every beat, then for each posed question opens the panel, steps the working fully
out (its tallest state), and fails on panel horizontal scroll, panel vertical scroll, or a
`.work-equation` overflow. It also no longer hangs on recap scenes whose control set changes when a
segmented toggle is clicked (it re-reads the live control count each step). Run:

```bash
npm run build && npm run serve
node qa/check.mjs mai-hl-u05-l02-stepped     # the stepped proof of concept
node qa/check.mjs mai-hl-u05-l02             # the original, to confirm no regression
npm run artifact -- mai-hl-u05-l02-stepped "U5 L2 Opener (Stepped)"
```

## Open questions for Ben

- Backward into a stepped scene lands on its first beat, not its last. Fine, or should it land on
  the end so you can walk it in reverse?
- The step key is `S`. Some keyboards may prefer Space or Enter. Easy to change in the keydown
  handler.
- Should recap scenes (4 to 6) ever get beats, or stay pure explorers? Current answer: stay pure.
