# Concept visuals

A concept visual is one picture that finishes a student's understanding of one hard idea. It is not a lesson. Ben decided the model on 8 November 2026, after openers grew into 30-minute walk-throughs that taught the whole lesson.

- **One idea, one picture.** "Why is a washer $\pi(R^2-r^2)$ and not $\pi(R-r)^2$?" "Why does $\int v\,dt$ give displacement but not distance?" If it needs two ideas, it is two concepts.
- **3 to 5 minutes.** A student who spends five minutes on it understands the idea and knows the mistake to avoid.
- **Opener or not.** Ben may project one at the start of a lesson, after it, or never. Students use them to review a unit.
- **About 5 to 10 per unit,** chosen for the ideas students find hardest to *see*, not for coverage.
- **MAI HL only** for now. The menu is built so other courses can join later.

Concept visuals live on the openers site at `concepts.html` (deep link `concepts.html#mai-hl-u12-signed-area`), with a Unit menu and then a Concept menu. The openers page and its lessons are unchanged.

## Think, do not fill a template

Every earlier format went off track by forcing every lesson into one shape. A concept visual has a fixed **vocabulary**, not a fixed **script**. Before building one, decide, for this concept:

1. **The one sentence** the student should leave with (`idea` in the module). If you cannot write it, the concept is not ready.
2. **The mistake** students actually make, in the words they make it ("I integrated $v$ for distance"), taken from the unit plan's Exam Tips and Common errors, the question-writing guide, or markschemes.
3. **The picture that makes the sentence obvious.** What, when it moves, shows the idea without words? Start from `docs/CATALOG.md`.
4. **What the student does** with it. Choose what fits:
   - a **prediction**, only when committing first makes the reveal land (at most one per concept);
   - **a few variations** (presets or a slider sweep) when seeing the pattern is the point;
   - **a setup task** ("drag $t_1$ to 6 and $t_2$ to 7") when the insight comes from a specific case;
   - **free play** with things to notice.
5. **What must be said.** Captions are one or two sentences. If the picture needs a paragraph, the picture is wrong.

Most concepts have one scene. Use a second only when the idea has two halves that need different pictures (signed area, then $|v|$).

## Shape: scenes, then I, P, S

```
1  I  P  S      2  I  P  S1  S2
```

The bottom bar shows each scene's number, then its stops. That is all it shows.

- **I, Introduction.** The core visual, set up and usually animated once when you arrive by Next. One short caption. An optional prediction sits here, before the answer is visible.
- **P, Playground.** Every control for the scene is live. The side panel says what to look for, gives setup steps where a specific case teaches something, and carries the wrong-way toggle.
- **S, Summary.** Presets that drive the idea home: a key image, or the controls set to the telling case. Use S1, S2, ... when there is more than one point to land. Cards may sum it up.

A concept can drop a stop it does not need (a scene with no Playground is fine), but keep the order I, P, S.

### Rules for state

- **Each stop has an authored state.** Arriving at a stop by Next, Back, or the bar sets its controls (`set`, folded from the scene's first stop). Back and a jump always look the same as arriving forwards.
- **Free play is disposable.** In P the student moves anything; leaving the stop and coming back restores the authored state.
- **Animations play once, on Next.** Back and a jump show the finished state. On a stop with a prediction, the animation waits and plays when the choice is made.
- **A prediction stays as chosen** until Reset. Its answer and the picture's give-away appear only after a choice.

## The common mistake: the wrong-way toggle

Every concept with a well-known mistake has a **wrong-way toggle** in P (and optionally S). Switched on, the picture is redrawn the wrong way, in the same scale, next to or on top of the right way, with the wrong number beside the right one. It is labelled with the mistake in student words ("Common mistake: $\int v\,dt$ for distance"), and a one-line note says why it fails. The student sees the mistake fail instead of being told it fails.

## Screen

- **The picture is large.** About 70% of the width: graph, track, or solid, plus a live readout and the controls under it.
- **Narrow side panel** (about 30%) with three tabs:
  - **Notice:** the stop's caption, the prediction, "Look for" points, setup steps, and the wrong-way toggle.
  - **Working:** the algebra for this scene, exact first, then rounded.
  - **Casio:** fx-CG50 steps from the verified key log, grouped under goal headings (rules in `docs/OPENERS.md`).
- The Notice tab never scrolls at 1366×768. If it would, cut words.
- **Nothing moves when a value changes.** The readout is a fixed-height box, so a fraction (taller than a decimal) never pushes the graph or controls. Slider values have a fixed width. The check sweeps every slider and fails on a shift over 0.5 px.
- A new scene always opens on the Notice tab. "Look for" and "Try this" are both numbered lists.
- On a phone the picture stacks on top and the panel goes below.
- House style as in `docs/OPENERS.md`: white graph, dotted teal grid, colours by role from `src/kit/style.js`, labels by the shared placer, no em dashes, Oxford commas.

## The module

`src/concepts/<course>/uNN-<slug>.js`, default export:

```js
export default {
  course: 'mai-hl', unit: 12, lesson: 2, slug: 'signed-area',
  title: 'Displacement or distance: signed area and |v|',   // names the skill, not a clever phrase
  idea: 'Signed area under v is displacement; area under |v| is distance.',
  params: {                                                 // shared by every scene
    t: { type: 'range', label: 'Time', min: 0, max: 7, step: 0.01, value: 0, show: (v) => `t = ${v.toFixed(1)}` },
    wrong: { type: 'toggle', label: 'Common mistake: ∫v dt for distance' },  // the wrong-way toggle
  },
  scenes: [
    {
      id: 'signed', title: 'Signed area is displacement',
      controls: ['t'],                        // what P unlocks (a function of ctx is allowed)
      stops: [
        { kind: 'I', caption: '...', set: { t: 0 }, play: { param: 't', to: 7, seconds: 7 } },
        { kind: 'P', caption: '...', look: ['...'], steps: ['...'], mistake: 'wrong' },
        { kind: 'S', caption: '...', set: { t: 6 }, cards: [{ title, html, tone }] },
      ],
      stage: (ctx) => ({ track, graph }),     // ctx: { v, stop, kind, picked, arrived }
      readout: (ctx) => '...',
      working: (ctx) => ({ blocks: [[caption, alignedLatex, isAnswer]], note }),
      keys: (ctx) => ({ sections: [{ goal, steps }], out, watch }),
    },
  ],
}
```

- Param types: `range` (slider, optional `show` formatter, `hidden: true` for a value only animations move), `seg` (switch buttons), and `toggle` (on or off; shown only as a stop's wrong-way toggle).
- `axes.aspect: 'fill'` stretches the horizontal unit so `bounds` fill the graph box at every screen size (a v-t graph over 7 seconds, say).
- `stage` returns `graph`, an SVG engine spec (`docs/OPENERS.md`, Graph spec), and optional `track`, a number-line strip above it (`src/components/number-line-track/`). Other pictures are added as components when a concept first needs them.
- A stop's `predict: { q, choices, correct, a }` adds the one prediction. `ctx.picked` is the chosen index or `null`; gate the give-away on it.
- `mistake: { param, what, why, fix }` on a stop shows that toggle param in the Notice tab. Switched on, it also shows three short lines: **What people do** (the mistake in student words), **Why it fails** (pointing at what the picture now shows), and **Do this instead** (the method, including the calculator fix). The stage reads `ctx.v.wrong`. While the mistake is on, its explanation takes the place of Look for, so the Notice tab still never scrolls. The toggle carries the explanation; a Summary stop may then show the mistake as a preset image to land it.
- `look`, `steps`, captions, and cards accept `$inline$` maths.
- Register the unit in `src/concepts/units.js` if it is new.

## Choosing a unit's concepts

Claude proposes a ranked list from the IB syllabus content and guidance for the unit's codes, the unit plan's skills, Exam Tips and Common errors, and the question-writing guide. Each item names the idea and the mistake. Ben cuts and edits the list. Ben does not see a per-concept brief: the design calls above are the builder's, and Ben reviews the finished visual.

## Reusing openers

Openers and deck lessons stay as they are. Their best scenes are mined: when a concept needs a picture an opener already draws (washers, the motion ladder, area under velocity), port the drawing into a component, then build the concept on it. Do not embed a whole deck.

## Building one

1. Branch from `main`.
2. Write the one sentence, the mistake, and the picture (in the module's header comment).
3. Write `qa/verify-concept-<course>-u<NN>-<slug>.py` with every exact value, and run it.
4. Build the module and any new component (with a README and a `docs/CATALOG.md` row in the same commit).
5. `npm run lint`, `npm run build`, `npm run serve`, then `node qa/concept-check.mjs <key>`. Look at the screenshots in `qa/out/`.
6. `npm run concept-artifact -- <key> "<Title>"` and publish the file in `dist-artifact/` as a private artifact for Ben's preview. Push the branch. Ben approves the merge.

## Checking

`node qa/concept-check.mjs <key>` visits every stop at 1366×768, 1920×1080, and a 412-wide phone, and fails on: sideways scroll, any shift of the picture, readout, or controls while a slider sweeps, a scrolling Notice tab on a wide screen, a label outside the graph, a stop that looks different when reached by Back or a jump than by Next, free play that survives leaving the stop, a prediction whose answer shows before a choice, and a bar letter that does not fit.

## Engines and house styles (comparison, 8 November 2026)

The concepts page has two header switches, kept until Ben chooses:

- **Graph:** the house SVG engine (default), JSXGraph, Function-Plot, or Plotly. Each library engine (`src/kit/engines/`) takes the same graph spec, so a concept module never changes. Only the house engine places labels clear of curves and edges; Function-Plot cannot drag points; Plotly adds about 1.5 MB gzipped and is loaded only when chosen.
- **Style:** six house styles in `src/concepts/themes.js` (Haese classic, Chalkboard, Print minimal, Midnight, Graph paper, and the deck builder's 3Blue1Brown theme). Concept modules keep using the role colours from `src/kit/style.js`; the shell maps each role to the style's colour.

URL options for links and previews: `concepts.html?engine=plotly&style=deck&stop=4&bare=1#<key>` (`bare` shows only the picture).

## Planned

- **Real calculator screens** in the Casio tab: fx-CG50 screen captures taken on Ben's fx-CG Manager emulator, one per step that changes the screen. To be planned with Ben.

## Pilot

Unit 12, Kinematics (7 lessons, with speed folded into Lesson 3). Ten concepts approved on 8 November 2026. Three prototypes in different styles come first, to settle the shell before the rest: **signed area and $|v|$** (wrong-way toggle), **one constant per integration** ($a \to v \to s$), and **circular motion** (vectors).
