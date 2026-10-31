---
name: openers-slide-deck
description: "Build a lesson slide deck in Ben's Openers style from a lesson opener in broth11/openers: one offline HTML page with context scenes beside the graph (one vertical scale), walk-through working, prediction choices, animated scene labs (Play, Pause, Loop, autoplay on Next), a recap lab, the openers' timeline bar, the five-theme picker, and Casio fx-CG50 calculator slides with real emulator screens and lit keys (the gdc-online-deck kit is built in). Use whenever Ben asks for an Openers deck, GDC or calculator slides in such a deck, a scene deck, a lesson deck built from an opener, 'the deck builder version of the opener', or to revise one built this way. Every scene opens with a title card and a setup slide that decodes the situation into colour-coded key facts. Validated on MAI HL U5 L3 (29/10/2026) and U5 L4 (31/10/2026)."
---

# Openers slide deck

One opener, one `content.json` (written by a small Python generator), one build. The output is a single
self-contained HTML file (~1.4 MB with the picker; fonts and KaTeX embedded, zero network) that works as a
published artifact and as a file. It is the AA SL online-lesson kit (v21) plus five additions taken from the
openers, so everything in that kit still builds. Model for new decks: `assets/examples/MAI_U5_L4/`
(v22 house rules: 38 slides with title cards, setup slides, colour-coded facts and the notepad IA slide; checker PASS
at nine sizes, 31/10/2026). `assets/examples/MAI_U5_L3/make_content.py` is the older v21 model (no title cards).

```
assets/deck_template.html   layout, engine, scenes in examples, walk blocks, picks, timeline bar, autoplay hooks
assets/labkit.js            SVG graph kit and the AA SL presets (fixed API, unchanged)
assets/scenekit.js          scenes (Lab.sceneRow, Lab.scenes), sceneLab + SPEC, player, growthFamily recap, scatterLab + scene 'scatter' (U5 L6)
assets/themes/, fonts/, katex/   as in the AA SL kit
assets/examples/MAI_U5_L4/  the v22 model: make_content.py (reads v1_content.json, writes content.json), phone scene
assets/examples/MAI_U5_L3/  the v21 model generator (coffee, typing, pH scenes + recap); AA SL models kept beside it
gdc/src/                    the calculator kit (gdc-online-deck v3), apply_kit.py adapted to this template
gdc/captures_lcd/           angle_deg_1..4, angle_rad_1..4: the only reusable screens
scripts/build_deck.py       content.json -> <file>.html + artifact.html; applies the GDC kit when a gdc slide exists
scripts/add_theme_picker.py picker (answer points recolour per theme: '#4230a8' maps to the handle role)
scripts/check_deck.py       nine-size checker, unchanged; scripts/review_shots.py every reveal step
references/content-schema.md, layout-and-pitfalls.md, figure-rules.md, review-checklist.md   base kit, still valid
references/gdc-slides.md, menu_paths_verified.md   calculator slides: rules, captures, checks, verified key sequences
```

Work in a scratch copy of this folder, never inside it. Needs `sympy` and `playwright`
(`pip install --break-system-packages`; Chromium is preinstalled).

## Decisions (Ben, 29/10/2026)

- **Source = the opener module**, `src/lessons/<course>/u<UU>-l<LL>-*.js` in `broth11/openers`, with its
  `qa/verify-*.py`. Every prompt, step, caption, latex line and note is transcribed in order, wording kept.
  Notes stay (this reverses the AA SL "no grey commentary" rule). Values are re-checked with sympy in the generator.
- **The scene style carries over**: the drawings, one slider driving drawing and graph together, and the walk
  rhythm (question posed, working revealed a step at a time, payoff, animation). The openers' light palette does
  not: decks use the five deck themes, opening in 3b1b, with the picker.
- **Anatomy** (v21; v22 below adds a title card and a setup slide before each scene's questions): Title, then per scene its questions (examples) with a live scene lab right after the model is
  found (where the opener has a "Trace the model" beat), then the recap lab when the opener ends on an explorer.
  Your turn is optional; none when the opener has none.
- **Predictions** list their choices under the stem, one choice per row (three rows for three choices, never two and one); the right one turns the answer colour on its reveal. Scene readouts line their equals signs up: the name is right-aligned and the "=" starts the value.
- **Labs autoplay once on arrival by Next** (never by Back or a jump, never under reduced motion), then the
  slider, Play and Loop are free. No autoplay where the opener has no animation beat (pH in U5 L3).
- **Layout**: working left about 2/5; heading, drawing and graph right, one vertical scale.
- **Timeline bar** replaces the dots: one lettered segment per reveal, the openers' kind colours.
- **Calculator**: no GDC slides unless asked; the openers' printed Notes carry the GDC steps. When asked, follow
  the GDC section below.

## Scene structure, colour and zoom (Ben, 31/10/2026, v22): house rules

Every scene runs: **title card → setup slide → questions (→ lab)**. The setup slide carries the scene beat, so
question slides no longer use `sceneStart`; the generator drops it.

- **Title card** `{"type": "sceneTitle", "scene": n, "kicker": "Scene n of N", "title": "The Cooling Coffee Cup",
  "kind": "<scene kind>", "window": {...}, "state": {...}, "alt": "..."}`: a blank slide with the scene name in large
  type (title case, a story name, not a question label) and the scene's drawing large. `formula` (TeX) puts a key
  formula in title type beside the drawing, for the scene that introduces it (U5 L4: the general logistic). The
  phone draws as an object in real phone proportions (about 1:2); another scene kind draws with `Lab.sceneArt`,
  `state.bare` hides its readouts. Timeline: a big numbered scene button.
- **Setup slide**: an example with `"setup": {"preamble", "para", "facts": [...]}` and `"blocks": []`. Reveal 0: a
  one- or two-sentence preamble setting the scene, then the given facts as a paragraph. Next (reveal 1): the
  paragraph fades and the same facts appear as bullets **in the same place**, while the matching points and lines
  appear on the graph (items at `step: 1`). Timeline beats P (the situation) and K (key facts). The scene heading
  above the drawing goes; the left column holds the setup.
- **Facts** `{"html": "...", "c": "<role>", "shape": ""|"ln"|"cv"|"none"}`: the whole statement is in the role
  colour; the marker is a dot (a point), `ln` (a dashed line), `cv` (a curve) or `none` (uncoloured, e.g. units).
  `<b>` bolds the key value. The graph item for that fact uses the same role, so (0, 5) in pink is the pink dot.
- **Question slides** carry the scene's facts as `graph.given` (short forms, one row above the drawing) in place of
  `graph.heading`. Use short html there ("$5\%$ at $t=0$"): a long given row shrinks the deck's type.
- **Colour roles for facts**: blue and red stay the model curves. Readings take pink, indigo, orange; reference
  lines brown or green; a faded old model grey. The picker recolours pink, indigo, brown and teal too (v22). A point
  label can take its point's colour with `"tint": true`. A slide's `t2c` now also colours walk blocks (tex, cap,
  note), so derived quantities can keep their reading's colour (u_0 pink, u_2 indigo).
- **Zoom to the story**: once a scene no longer needs high values, re-window the graph to just above the meaningful
  maximum (U5 L4: 182 → 120 from scene 4, where adoption is a percentage). Below about 135 the phone's two readouts
  share one row; beside a gauge only t is shown (the lab readout carries the level).
- **Show how a model's parameters come from the data**; never hand students a fitted model. Prefer the standard
  route (a known limit, then one reading per remaining parameter) and add a one-line GDC regression note for the
  case where the parameters are not known. Verify every value with sympy in the generator.
- **Wording**: say what the quantity is ("a market share cannot exceed 100% of the population"), not what the
  drawing does ("the phone cannot hold more").
- **Slider animations** run 1.5 times their v21 speed by default; `meta.animSpeed` overrides (1 = v21 speed).

## Internal assessment tie-ins (Ben, 30/10/2026)

Every time a deck is planned, ask whether the lesson's topic could seed an IB MAI Internal Assessment
(the exploration: a real situation, data the student collects or finds, a model, a judgement). Put the answer
in the outline you show Ben, as one line, so he can say yes or no. It is a recurring feature of some decks,
not all: add it only when the topic gives students real scope to model something they can measure.

When it applies, the deck ends with one catalogue slide, timeline label **IA**:

```json
{"type": "lab", "preset": "catalogue", "beat": "IA", "eyebrow": "Beyond the story · ...", "title": "Where else does it happen?",
 "init": {"items": [{"group": "Nature", "title": "...", "what": "...", "why": "...", "exp": "..."}]}}
```

- 8 to 10 cases in two or three groups (nature, business and society). The left list holds the titles; the panes
  hold `what` (what is measured), `why` (why the model fits), and `exp`, shown in the box headed
  "How could I conduct an experiment to measure?".
- v22 format (Ben, 31/10/2026): `what` and `why` are lists of short statements (bullets, every statement a bullet).
  `exp` is a list of steps, each a string or `[step, [sub-steps]]`; it renders as a lab procedure on a paper notepad
  (red header, ruled lines, margin, numbering 1, 1.1, 1.2) in every theme. Keep steps short: the tallest case sets the
  slide height, and the notepad was the deck's limiting slide until its steps were trimmed (U5 L4: 0.82 → 0.96).
  A plain string in `what`, `why` or `exp` still renders the v21 way.
- The IA button in the timeline is as large as the scene buttons.
- The pane headings default to "What grows" and "Why it levels off" (logistic wording). For other topics set `init.headings`, e.g. `"headings": ["What is measured", "Why the model fits"]` (U5 L3).
- Title cards (`sceneTitle`) draw the coffee, typing and pH scenes without their readouts; the unit labels (°C, wpm, pH) stay, anchored above the scale.
- Each `exp` is something a student could really do: what to measure, how often, for how long, what to plot.
  Prefer a classroom or home method; if the real thing cannot be run, name the public data to collect or a
  safe simulation. No lab hazards.
- Click a case, or press Up and Down. Every case shares one grid cell, so the tallest one sets the height and
  the density check covers them all. The checker clicks each case.
- `beat` overrides the timeline letter (default IA).

## Content additions (on top of references/content-schema.md)

Example slide:
- `blocks` may hold `{"walk": {"cap": "...", "tex": ["lhs&=rhs", ...], "note": "...", "ans": true}}`: one reveal
  per block, caption, aligned rows, muted note; `ans` paints the maths in the answer colour and makes an S beat.
- `choices` (2 to 4 strings), `correct` (index), `pickStep` (reveal that marks it; 0 = never marked).
- `graph.heading` (the opener's scene sentence) and `graph.scene = {"kind": "coffee", "alt": "...",
  "states": [[reveal, {state}], ...]}`; the scene shows the last state reached. Keep an answer out of the scene
  until its reveal.
- Timeline keys, filled by the generator: `scene` (number), `sceneStart` (first example of a scene: its stem
  becomes reveal 1, the scene heading alone is the scene beat), `q` (question number), `cont` (a "k of n" slide,
  k > 1: it opens on its first reveal). Graph item `step`s, scene states and `pickStep` count from the first
  block; the engine adds the offset.
- `meta.largeGraphs: true` (labels, ticks and lab text at 0.9 of body; the checker fails anything under 85 %).
- Degrees in maths: `\,{}^{\circ}\mathrm{C}` (a bare `\,^{\circ}` fails in KaTeX). The model converts `$92$ °C`.

Scatter and correlation decks (MAI HL U5 L6, 31/10/2026): there is no drawing beside the graph, so example slides use a
plain `graph` (points as `point` items in role colours, `until` swaps a data set at a reveal) and a title card with
`"kind": "scatter"` (`state.pts` in 0..1). `Lab.presets.scatterLab` is the one lab: `init.sets` (datasets, a toggle when more
than one), `spread` (a slider that scales a fixed noise pattern, autoplays once), `extra` (one draggable outlier, optional
On/Off toggle), `dragIndex` (one data point made draggable), `rs` (a second readout: Spearman, ties take the average
rank), `cards` (the four recap cards). Every readout must change under the checker's moves, so no word readout.
Model generator: `decks/mai-hl-u05-l06/make_content.py` in broth11/openers.

Lab slides: `{"type":"lab","preset":"sceneLab","eyebrow":"Typing speed · Trace the model","title":"...",
"init":{"kind":"typing","window":{...},"start":1,"seconds":12}}` and `{"preset":"growthFamily","init":{"start":{...},
"window":{...}}}`.

## Adding a scene (new opener)

1. Port the opener's drawing from `src/components/context-stage/<name>.js` into `Lab.scenes.<kind>(a, state)` in
   `scenekit.js`: SVG 600 x 1000 units, `a.Y(v)` = the graph's vertical scale, `a.el(tag, attrs)`, and
   `a.text(x, y, html, cls, anchor)` for text (HTML overlay at 0.9 body; never SVG text). Natural colours for
   objects; theme variables for text, ticks and tubes (`sc-tick`, `sc-read`, `sc-unit`, `--sc-curve`, `--sc-red`,
   `--bl`). No tick numbers on the scene's scale: the graph's own ticks sit beside it.
2. Add a `SPEC.<kind>` entry: slider (`name, min, max, step, start, dp`), `play`, `auto`, `seconds`, `group`,
   `eq` (static model line), `outTitle`, `f`, `pt(v, f)` (the moving point), `static(g, w)` (curve and given
   points), `reads` (two readouts that change with the slider), `scene(v, f)` (slider value to scene state).
3. In the generator: a window, a heading, given points and the model as graph items, the scene states per reveal.

## Workflow (stop where it says stop)

1. **Outline, then stop.** Read the opener module (and its archive notes if any). List per scene: its title-card name,
   the setup preamble and key facts with their colours, the graph window (zoomed to the story), each question,
   its slides after splitting (density budget: 6 reveals, stem 3 lines; long notes force splits), what the
   drawing and graph show per reveal, where each lab sits and whether it autoplays, the recap, any new scene to
   port. Wait for Ben's words.
2. **Verify and write.** Start from `assets/examples/MAI_U5_L4/` (its SCENES table, facts and recolour pass); sympy on every value before it is
   written; the generator fills the timeline keys and the degree conversion.
3. **Build and check.**
   ```bash
   python3 <skill>/scripts/build_deck.py content.json --out build            # opens in 3b1b, picker included
   python3 <skill>/scripts/build_deck.py content.json --out probe --probe --probe-size 1470x830   # per-slide --G
   python3 <skill>/scripts/check_deck.py build/<file>.html --shots build/shots
   ```
   `--G >= 0.95` at 1280x800, 1470x830 and 1470x956. Fix until PASS. Look at the shots: the scene's level
   lines up with the graph, labels clear, the bar letters match the opener's beats.
4. **Review.** `scripts/review_shots.py <html> --out review --size 1470x830` and the checklist in
   `references/review-checklist.md`, by a fresh reviewer when one can be spawned, else as a separate pass, said so.
5. **Deliver, then stop.** Publish `build/artifact.html` (load `artifact-design` first; icon `slides`) and send
   the HTML file. Archive only where Ben says.

## GDC (calculator) slides

Everything for calculator slides is in this skill; `gdc-online-deck` is not needed. Read
`references/gdc-slides.md` (teacher's rules, slide content, captures with the emulator, extra checks) and
`references/menu_paths_verified.md` before planning any calculator step. A slide
`{"type":"gdc","skill":1,"tag":"C","title":"...","stem":"...","start":{img},"steps":[{"t":"Press [SHIFT] [MENU]...","s":{img}}]}`
needs no build step: `build_deck.py` patches the template with `gdc/src/apply_kit.py` whenever a gdc slide is
present. The timeline letters it `G<skill>` then `W` per step. Screens are real captures of fx-CG Manager PLUS
(computer-use skill; `gdc/src/cap.py` crops them), never drawn. Tested 29/10/2026 with the angle captures in the
U5 L3 deck: checker PASS at nine sizes.

## Pitfalls met (29/10/2026, 31/10/2026)

- A plain graph (no `graph.scene`) is square and as wide as its column, so it overflows the slide and pulls --G to 0.6.
  Give example-slide windows `"aspect": 1.4` (a wide graph); labs size their own. A `graph.given` row above a plain graph
  overflows the same way, so a scatter deck puts the facts on the setup slide. Lab titles are not rendered by KaTeX:
  no `$` in a lab `title`. Fractional tick steps (0.2) print 0.6000000000000001: give `yticks` explicitly.

- A setup slide with no blocks leaves an empty work panel; the template hides it (`.s-setup .panel.work:empty`).
- Point labels near a steep curve or another reading touch them; on crowded setup slides colour the points and
  label only where there is room (U5 L4 labels (0, 5) and (2, 10) on scene 1 only). The checker catches touching labels.
- Over six working rows on one slide (a three-step derivation with two-row maths) pulls the deck's --G under 0.95:
  split into "(1 of 2)" and "(2 of 2)" with `cont`. Run `--probe` to find the slide.

- A scene row sized by percentage grows past its ratio and squeezes the text column; size it from the frame:
  `h = min(30cqw, 45cqh)`, width `1.6 h` (lab: `min(36cqw, 62cqh)`).
- A slider with step 0.1 snaps small animation increments back: the player keeps its own time.
- The checker moves every slider and fails one that changes no readout: rebuild sliders on a family switch rather
  than hiding them; show the model as a static line, not a readout.
- Cards that change with sliders get fixed-height slots; sweep the states for overflow (U5 L3: 360 states, six sizes).
- Phone (portrait): scene row `min(52cqw, 30cqh)`; recap cards hidden.


## scatterLab updates (31/10/2026)
- `rslider {min,max,step,start,seconds,auto}` with a set's `noise` rebuilds the points so r equals the slider exactly (standardised x plus a noise vector made orthogonal to x). `fit: true` draws the least-squares line live.
- `scene` kind `scatter` (`scatterArt`) draws title-card art that follows the graph's window (`state.win`, `pts`, `xname`, `yname`, `bare`), so cards match the graph's proportions.
- Graph `xname`/`yname` are plain text (not TeX); the title-card art wraps them in `\text{}`.
