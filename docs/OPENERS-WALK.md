# How to build an opener: the walk-through model

The walk-through model plays an opener as one curated sequence of beats, like advancing slides: a question is posed, its working appears a step at a time, a graph appears, a slider animates, the next question is posed. A timeline along the bottom shows every beat, so Ben can pause, go back to an earlier point, and return. U5 L3 is the pilot and the live example (`src/lessons/mai-hl/u05-l03-exponential-and-logarithmic-models.js`); its stepped predecessor is kept in `src/lessons/mai-hl/_archive/`. A lesson opts in with `walk: true`. Every other lesson, stepped or not, runs its original shell unchanged, and `docs/OPENERS.md` and `docs/OPENERS-STEPPED.md` still describe them exactly.

## The decisions (Ben, 28 October 2026)

- **One flat timeline.** Every pose, working step, payoff, and animation is its own beat. One key moves forward, one key moves back.
- **Scene is the only boundary.** The first beat of each scene is a scene beat. A story level above scenes is not built; add an optional `story` tag only if a lesson needs it.
- **State is deterministic.** The state at beat N is folded from beats 0 to N (`stateAt` in `src/kit/timeline.js`). Back, a jump on the bar, Resume, and re-selecting the current beat all snap the sliders and switches to that beat's authored state. Free play is disposable. Predictions (the `choices` buttons) are the one exception: they stay as chosen until Reset.
- **Pause** (the Pause button or `P`) unlocks free play at the current beat, with every slider the scene ever offers. The graph and readout still follow the real reveals, so a pause never gives an answer away. Resume (or `Esc`) snaps back to the beat.
- **Animations** play once, only when you arrive by Next. Arriving by Back or a jump shows the finished state with no replay.
- **Two panes**, 2/5 and 3/5. Left: the current question with its working stacked beneath it. Right: the heading, readout, animation, graph, and controls. On a phone the animation stacks on top and the question and working go below.
- **The left pane never scrolls on a wide screen.** When the stack is taller than the pane, the oldest steps fold to their captions. The current step is never folded, and stepping Back opens them again.
- **No working or Casio panel.** The Working and Casio toggle sits at the top of the left pane and appears only for a question that has `keys`. `W`, `S`, and `R` do nothing in a walk lesson.

## The bar

One segment per beat, one fixed colour per beat kind, shaded up to the furthest beat reached. The current beat is ringed. Scene starts are taller and set apart by a gap.

| Kind | Letter | Colour (role in `src/kit/style.js`) | Made by |
|---|---|---|---|
| Scene start | scene number (`1`, `2`, `3`) | ink | the first beat of every scene, built automatically |
| Recap (explore) | `E` | ink | a scene with `cards` and no prompts |
| Question posed | `Q` | strip blue | each prompt, built automatically |
| Working step | `W` | muted | each step without `answer` or `play` |
| Solution | `S` | answer orange | a step with `answer: true` |
| Animation | `A` | curve teal | a step with `play: '<param>'` |

Each segment carries its letter (`beatLetter` in `src/main.js`). Scene starts show their number because `S` is taken by Solution. When segments get narrower than 13 px (a long walk, or a phone) the letters hide and the colours carry the meaning; the walk check enforces this.

Hover, focus, or touch a segment to see the scene and beat name. Press and drag along the bar to scrub. Click the beat you are on to reset it. `BEAT_COLORS` in `src/kit/style.js` and the `--k-*` variables in `src/shell.css` hold the colours; keep them in step.

Keys: Right and Left (or Page Down and Page Up) step a beat, Home and End jump to the ends, `P` pauses, `F` is full screen.

## The lesson module

The module is the stepped shape without a `beats` array. The timeline is built from the prompts in order.

```js
export default {
  course: 'mai-hl', unit: 5, lesson: 3, title: '...', engine: 'svg',
  walk: true,
  params: { cool: { type: 'range', ..., play: { seconds: 12 } } },
  scenes: [
    {
      id: 'coffee', short: 'Cooling coffee',          // short names the scene on the bar
      heading: '...', readout: ({ v, revealed }) => '...',
      controls: ({ revealed }) => (revealed('coffee') ? ['cool'] : []),
      prompts: [
        {
          id: 'c1', q: 'Question text.', choices: ['...'], correct: 1,    // choices and correct are optional
          steps: [
            { caption: 'Substitute', latex: '9a+3b&=135', note: 'Optional sentence.' },
            { caption: 'Model', latex: 'T&=70(0.9)^t+22', answer: true, reveals: ['coffee'] },
            { caption: 'Trace the model', note: 'Watch it settle.', play: 'cool', reveals: ['coffee'] },
          ],
          keys: { sections: [{ goal: '...', steps: ['...'] }], out: '...', watch: '...' }, // optional Casio steps
        },
      ],
      graph: ({ v, shown, revealed, beat }) => ({ bounds, items, labels }),
    },
    { id: 'recap', short: 'Family recap', heading: '...', cards: ({ v }) => [...], graph: ({ v }) => ({ ... }) }, // one explore beat
  ],
}
```

- A scene's beats, in order: the scene beat, then for each prompt a pose beat followed by one beat per step. A scene with `cards` and no prompts is a recap: one scene beat, with the free-play controls.
- `reveals: ['tag']` on a step makes `revealed('tag')` true from that beat on, and false again when you go back past it. The graph and the sliders that trace a model read `revealed`, exactly as in the stepped model. The reveal discipline in `docs/OPENERS-STEPPED.md` applies unchanged: posing a question never shows its answer.
- `play: '<param>'` makes the step an animation beat. The param must be a range with `play: { seconds }`. The beat sets that slider to its maximum, which is where the sweep ends; put the step after the one that reveals the slider.
- `set: { param: value }` on a step is a delta on the slider values from that beat on. Use it to start a beat from a chosen value. Values fold across the whole lesson, because sliders are shared by every scene.
- `cue(ctx)` on a step adds transient graph marks while that step is current.
- `shown(id)` is true once the question is posed; `beat` is the beat's index within its scene.

## Checking

`node qa/check.mjs <lesson-key>` detects a walk lesson (the bottom bar is visible) and runs `qa/walk-check.mjs` at 1366x768, 1440x860, 1920x1080, and a 412-wide phone. It fails on:

- a timeline that is hidden, has two beat kinds of the same colour, or has segments narrower than 2 px
- a split other than 2/5 and 3/5 on a wide screen
- at any beat: sideways scroll, a scrolling left pane (wide screens), a label outside the graph, working that overflows, or a control label that wraps
- a scene's first beat showing a question, working, a model equation, or a computed value; a pose beat that adds any label to the graph, changes the readout, or shows working
- a slider sweep that moves the graph, controls, heading, or pane by more than 0.5 px
- any beat that looks different going back, or after jumping in a scrambled order, than going forward (compared by the readout, pane text, labels, sliders, and a hash of the drawing)
- free play that survives Next then Back, a pause that does not say Resume or unlock sliders, a Resume that does not restore the beat
- an animation that does not play on Next, does not stop on Back, or replays on a jump

Look at one screenshot per scene start in `qa/out/` (`<size>-walk-b<NN>.png`) as well.

## Known edges

- The phone layout is functional but tight: the animation pane is short, and the sticky bar covers part of the question as you scroll. The original shell has the same graph height on phones.
- A pause unlocks the controls a scene offers once it is done. Sliders that trace a curve not yet revealed do nothing visible until the curve is revealed.
- The first version of this shell does not yet carry the 3D camera in the beat state. When a solid-of-revolution lesson moves over, the camera angle and the cutaway switch need to join the folded state so the rewind rule holds for them.
