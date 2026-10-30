---
name: openers-slide-deck
description: "Build a lesson slide deck in Ben's Openers style from a lesson opener in broth11/openers: one offline HTML page with context scenes beside the graph (one vertical scale), walk-through working, prediction choices, animated scene labs (Play, Pause, Loop, autoplay on Next), a recap lab, the openers' timeline bar, the five-theme picker, and Casio fx-CG50 calculator slides with real emulator screens and lit keys (the gdc-online-deck kit is built in). Use whenever Ben asks for an Openers deck, GDC or calculator slides in such a deck, a scene deck, a lesson deck built from an opener, 'the deck builder version of the opener', or to revise one built this way. Validated on MAI HL U5 L3 (29/10/2026)."
---

# Openers slide deck

One opener, one `content.json` (written by a small Python generator), one build. The output is a single
self-contained HTML file (~1.4 MB with the picker; fonts and KaTeX embedded, zero network) that works as a
published artifact and as a file. It is the AA SL online-lesson kit (v21) plus five additions taken from the
openers, so everything in that kit still builds. Model: `assets/examples/MAI_U5_L3/make_content.py`
(24 slides, 47 beats, checker PASS at nine sizes, 29/10/2026).

```
assets/deck_template.html   layout, engine, scenes in examples, walk blocks, picks, timeline bar, autoplay hooks
assets/labkit.js            SVG graph kit and the AA SL presets (fixed API, unchanged)
assets/scenekit.js          scenes (Lab.sceneRow, Lab.scenes), sceneLab + SPEC, player, growthFamily recap
assets/themes/, fonts/, katex/   as in the AA SL kit
assets/examples/MAI_U5_L3/  the model generator (coffee, typing, pH scenes + recap); AA SL models kept beside it
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
- **Anatomy**: Title, then per scene its questions (examples) with a live scene lab right after the model is
  found (where the opener has a "Trace the model" beat), then the recap lab when the opener ends on an explorer.
  Your turn is optional; none when the opener has none.
- **Predictions** list their choices under the stem, one choice per row (three rows for three choices, never two and one); the right one turns the answer colour on its reveal. Scene readouts line their equals signs up: the name is right-aligned and the "=" starts the value.
- **Labs autoplay once on arrival by Next** (never by Back or a jump, never under reduced motion), then the
  slider, Play and Loop are free. No autoplay where the opener has no animation beat (pH in U5 L3).
- **Layout**: working left about 2/5; heading, drawing and graph right, one vertical scale.
- **Timeline bar** replaces the dots: one lettered segment per reveal, the openers' kind colours.
- **Calculator**: no GDC slides unless asked; the openers' printed Notes carry the GDC steps. When asked, follow
  the GDC section below.

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

1. **Outline, then stop.** Read the opener module (and its archive notes if any). List per scene: each question,
   its slides after splitting (density budget: 6 reveals, stem 3 lines; long notes force splits), what the
   drawing and graph show per reveal, where each lab sits and whether it autoplays, the recap, any new scene to
   port. Wait for Ben's words.
2. **Verify and write.** Copy `assets/examples/MAI_U5_L3/make_content.py`; sympy on every value before it is
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

## Pitfalls met (29/10/2026)

- A scene row sized by percentage grows past its ratio and squeezes the text column; size it from the frame:
  `h = min(30cqw, 45cqh)`, width `1.6 h` (lab: `min(36cqw, 62cqh)`).
- A slider with step 0.1 snaps small animation increments back: the player keeps its own time.
- The checker moves every slider and fails one that changes no readout: rebuild sliders on a family switch rather
  than hiding them; show the model as a static line, not a readout.
- Cards that change with sliders get fixed-height slots; sweep the states for overflow (U5 L3: 360 states, six sizes).
- Phone (portrait): scene row `min(52cqw, 30cqh)`; recap cards hidden.
