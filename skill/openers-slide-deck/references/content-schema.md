# content.json — schema

One file per lesson. `assets/examples/Y1_L15_content.json` is the validated reference: copy it,
then replace the content. The engine (`deck_template.html`) reads it as-is; nothing else is
configured anywhere.

## meta

```json
"meta": {
  "cohort": "Y1", "cohortLabel": "Year 1", "lesson": 15,
  "topic": "StraightLines", "topicWords": "Straight Lines",
  "file": "AASL_Y1_L15_Lesson_StraightLines.html",
  "artifactTitle": "Y1 L15 Straight Lines",
  "source": "AASL_Y1_L15_Worksheet_StraightLines.tex (Drive <file id>)"
}
```

`source` is traceability only (not displayed): the worksheet filename and its Drive id, or the
mount path if it was read through the device.

Optional `"theme": "skyblue" | "goldteal" | "bluebrown" | "greengrey"` selects an alternative look; absent means `3b1b` (default).
Optional `"t2c": {"m":"blue","c":"red"}` binds up to **three** symbols to a colour role (`blue`,
`red`, `teal`, `pink`, `green`, `grey`, `orange`, `brown`, `indigo` (v13: `#5C7CFA` on dark grounds, `#3B5BDB` in skyblue); yellow is the answer and never a role; `orange`
`#FF862F` was added for G9X's second line and is used on graph items, rarely in `t2c`). The build colours
every whole-token occurrence of the symbol in `steps`, in the `$…$` of `stem`, `prompt` and `text`,
in graph labels and in a bound axis name (`xname`/`yname`). A key matches token by token (`x_B`
also matches `x_{B}`; `x` never matches inside `\exp`); the longest key wins. Not coloured:
`\text{}`, `\mathrm{}` and other text commands, existing `\textcolor`, `\bl{}` (answer), `\gr{}`,
and a prose `<span class="ans">…</span>` — an answer stays wholly yellow. An example may add its
own `"t2c"` on top of the deck's. Y1 L15 binds `m` and `c`; Y2 L15 binds nothing. Hex values come
from the theme JSON's `t2c` block (Manim's colours in 3b1b and goldteal, their darker shades in skyblue; in goldteal `blue` is the
role that contrasts with the teal curves; in bluebrown and greengrey `blue` equals the curve colour,
and in greengrey `green` equals the answer colour — do not bind it there).
v13: the build refuses any colour in the content (role, item colour, highlight, hex written in TeX) under 4.5:1 on
the theme's ground, and names it (Y2 L20: `#1f3a93` on greengrey, 1.69:1). Optional `"highlight": "#hex"` overrides
the theme's highlight colour (`hl` in the theme JSON: `#FFFF00` on dark grounds, `#8A5A00` in skyblue).
`lesson` is the global lesson number (1–89). `topic` is the CamelCase token of the worksheet
filename. `file` follows type-before-topic: `AASL_<COHORT>_L<n>_Lesson_<Topic>.html`.

## slides — in order

### `title` (first slide, exactly one)

```json
{"type":"title","eyebrow":"IB Mathematics AA SL · Year 1 · Lesson 15","title":"Straight Lines",
 "lede":"Online lesson — worked examples and lab","code":"SL 2.1",   // lede: fixed wording
 "regime":"NC","regimeText":"no calculator anywhere in this lesson"}
```

`eyebrow` and `lede` are fixed wording apart from cohort and lesson. `regime` is `NC` or `C`; for a mixed lesson use `C` and say which examples need the GDC in
`regimeText`.

### `example` (one per worked example; a dense one is split — see SKILL.md)

```json
{"type":"example","n":1,"tag":"NC","title":"Gradient from two points",
 "stem":"Find the gradient of the line through $(-1,7)$ and $(3,-5)$.",
 "prompt":"(a) … <br>(b) …",            // optional: the parts, under the stem
 "blocks":[
   {"steps":[{"tex":"m &= \\frac{-5-7}{3-(-1)}"},{"tex":"&= \\frac{-12}{4}"},{"tex":"&= \\bl{-3}"}]},
   {"text":"The gradient is <span class=\"ans\">$-3$</span>."}
 ],
 "graph":{ "window":{…}, "items":[…] }}
```

- `stem`, `prompt`, `text`: HTML with `$…$` inline maths. `<span class="ans">…</span>` colours
  a prose answer in the answer colour (yellow in 3b1b, indigo in skyblue).
- `steps`: each `tex` is one line of an `aligned` block and **must contain one `&`** (the
  alignment point). Each step is one reveal. `\bl{…}` marks the answer (answer colour); `\therefore\quad`
  stays. `\bl{}` cannot span the `&`: colour each side,
  `\bl{\therefore\quad x = 2 \text{ or } x} &= \bl{3}`.
- The answer colour marks **the answer the question asks for** — the value, or the one clause that states the
  conclusion ("there are no real roots") — not the whole paragraph around it.
- **Step highlight** (v13, teacher 23/10/2026): `<span class="hlstep">$a$</span>` in a `text` block (or in a step's
  row) turns the highlight colour while that row is the last one revealed, then returns to its own colour; stepping
  back restores it. Pair it with `"hl": n` on the graph items of that parameter (below). One parameter highlighted at
  a time.
- `eyebrow` (v11, Y2 L20): replaces "Worked Example n · [tag]" above the title, for a slide built like an
  example that is not one — a harvest, a definition, a summary (`"Harvest · Lesson 15"`, `"The tangent graph"`).
  `n` and `tag` are then ignored. Titles may carry `$…$`.
- `title`: a short noun phrase naming the skill ("Gradient from two points"). Take it from the
  worksheet's worked-example heading when there is one; otherwise write it and list it in the
  step-1 outline for the teacher to approve.
- A `text` block is one reveal of its own, after the steps before it.
- `expl` (per step) and `note` (per example) exist in the engine but are **not used** — decision
  "no grey commentary".
- Reveal count of the slide = number of steps + number of text blocks. A graph item's `step: k`
  appears when reveal k is shown; `step` absent = visible from the start.

### graph (on every example)

```json
"window":{"xmin":-8,"xmax":8,"ymin":-8,"ymax":8,"grid":1}
// or, for non-square units:
"window":{"xmin":-3.5,"xmax":14,"ymin":-20,"ymax":225,"gridx":1,"gridy":15,"xtick":2,"ytick":30,
          "xname":"t","yname":"T","xtickFrom":0,"ytickFrom":0}
```

`"xticks": [[value, "tex"], …]` (and `yticks`) replace the numeric ticks of that axis (v11): trig windows in
radians mark `[[1.5708, "\\tfrac{\\pi}{2}"], …]` (Y2 L20 generates them with `ticks()` in its make file). An x tick
number crossed by a curve slides half its width sideways before it is hidden.

`"plain": true` in a window hides the grid, frame, axes and ticks: use it for geometry figures
(a tower, a compass, a triangle of bearings). x and y units need not be equal: a window 11 wide
and 6 tall stretches the figure vertically, which opens narrow angles of elevation enough to
label them — compute label positions in screen space (bisector with y scaled by the ratio).

Item kinds (all accept `step`; `line`/`segment`/`fn` accept `dashed` (asymptotes only) and `dotted` (v11: guide
lines — principal axis, reading line, measuring arrow with `arrows`; never a curve); `point` accepts `answer`; `line` accepts `answer:true`
for the answer colour). Every kind also accepts `color: "<role>"` (a `t2c` role name) or
`colorOf: "<symbol>"` (the colour bound to that symbol in `t2c`, e.g. the given line coloured
like `m`); the only hex accepted is the violet `#B189C6`, and `answer` wins over both.
v13: any item takes `"hl": n` — drawn in the highlight colour while step n is the last one shown (a label's TeX
recoloured whole), in its own colour before (from its `step`) and after (to its `until`); the build splits it into
up to three items. This replaces hand-written yellow copies with `step`/`until`:

| kind | fields |
|---|---|
| `fn` | `expr` in sympy syntax of `x` (`x**2 - 5*x + 6`, `exp(x)`, `log(x)` natural, `1/(x - 2) + 3`), optional `domain: [a, b]`. `build_deck.py` samples it; pieces are cut where it is undefined or crosses an asymptote. Draw asymptotes yourself as dashed `segment`s |
| `line` | `through: [[x,y],[x,y]]` — infinite line |
| `segment` | `from`, `to`; optional `arrows: true` — an arrowhead at each end, for a distance marked on the figure (v9, Y1 L16) |
| `polygon` | `pts: [[x,y],…]` — faint filled triangle (rise/run) |
| `angle` | `O`, `P`, `Q` — arc at O from OP to OQ; a square mark if 90° |
| `point` | `at`, optional `label` (TeX) and `anchor` |
| `label` | `at`, `tex`, `anchor` (`n s e w ne nw se sw c`) |
| `north` | `at`, optional `len` (graph units) — muted north line with an arrowhead and N |
| `arc` | v13: `at`, `from`, `to` (degrees anticlockwise from the positive x-axis), optional `r` (graph x-units), `color` — dotted arc with an arrowhead at `to`: an angle measured from the +x axis to the radius, in the radius's colour; give each angle at one vertex its own `r` (Y2 L20: 0.3 and 0.56) |
| `bearing` | `at`, `deg`, optional `r` (graph units), `from` (start bearing, default 0 = north), `label` (TeX), `labelAt` (label radius as a multiple of `r`, default 1.75), `muted` — clockwise arc with an arrowhead; reflex arcs allowed (298° sweeps almost the whole turn) |

`angle` has no label: add a `label` item on the bisector (at about 1.6–2.5 units for a small
angle, further out for an angle under 15°). A label that cannot fit is moved by auto-placement,
sometimes to the wrong side of a line — look at the screenshot, and drop the label if the working
already states the angle. For a narrow angle or a sum of angles, see SKILL.md "Angle arithmetic
lives on the figure": `bearing` arcs with `from` and hand-placed labels (Y2 L15, 01/10/2026).

Labels are auto-placed: the anchor is a preference, `labkit.place()` moves a label off lines,
points and other labels, and tick numbers within 5 px of a label are hidden.

Keep every point and label at least one grid unit inside the window: the checker does not catch
a point clipped by the graph edge, only the screenshots show it.

### `lab`

```json
{"type":"lab","preset":"line2pts","title":"The gradient triangle",
 "init":{"window":{…},"A":{"x":-1,"y":7},"B":{"x":3,"y":-5},"snap":1}}
```

`preset` names a function in `labkit.js` → `Lab.presets`; `init` is passed to it unchanged.
Optional `controlScale` (e.g. `1.4`) enlarges the text of that lab's right-hand panel — group titles,
readouts, slider labels, toggles — without touching the deck-wide `--G` (teacher, 28/09/2026, Y2 L15:
1.3 on both labs; 1.4 overflowed at 1024×768 after a toggle). The panel text starts at `--fs-small`. Keep readouts short enough not to wrap at that size.
Start draggable handles at least 3 grid units apart in both directions: the checker drags every
handle by the same offset (about 2 units left, 1 down on a 16-unit window) and fails if labels
then collide. Existing presets:

- `line2pts` — `init.A`, `init.B` draggable, `snap`. Readouts: gradient with substitution, `y = mx + c`,
  general form.
- `lineMC` — `init.m`, `init.c` (sliders), `init.mode` (`parallel`|`perpendicular`), `init.P`
  draggable, `init.Pname`. Readouts: both lines, `m₁m₂`, intersection.
- `parabolaABC` — `init.a`, `init.b`, `init.c` (integer sliders: a from −3 to 3, b and c from −6 to 6).
  Readouts: `y = ax²+bx+c`; completed square with vertex; Δ with substitution; Δ's value and the
  nature of the roots; `−b/2a` and `√Δ/2a`; the roots (exact), or "Cannot take the square root of a
  negative discriminant" then *No real roots*; a = 0 reads "Not a quadratic". Graph: parabola,
  dashed axis, vertex, roots. Pick initial values whose Δ sign changes under the checker's
  +1 slider moves only if needed; the Δ-value readout always changes. Built for Y1 L16.

- `bearing` — `init.A` fixed; `init.one = {b1, r1}` and `init.course = {b1, r1, b2, r2}` (bearings
  in degrees, radii in graph units); `init.mode` (`one bearing`|`change of course`). B draggable
  round A, C round B (only in course mode); drags snap to whole degrees and 0.5-unit radii, and are
  refused if a point would leave the window. North lines at every point; arcs with three-figure
  labels; the back-bearing arc at B (muted) in one-bearing mode, the second bearing and the interior
  angle at B in course mode. **Switching the toggle loads that mode's example values.** Readouts:
  bearing of B from A; back bearing with ±180°; bearing of C from B; interior angle AB̂C. Built
  for Y2 L15 (118°; 340° then 085°).
- `elevation` — plain window; `init.F` (x of the foot), `init.scale` (metres per graph unit),
  `init.h`, `hmin`, `hmax`, `hstep` (tower height in m, slider), `init.A` (x of the observer,
  draggable along the ground). Toggle hide/show the angle of depression at T (dashed horizontal,
  arc, θ). Readouts: h and d; tan θ = h/d with the numbers; θ to 1 dp; depression of A from T = θ.
  Built for Y2 L15.
- `system2` (G9X U3 L2) — `init.m1, c1, m2, c2` (sliders, step 0.5: m from −5 to 5, c from −6 to 6),
  optional `init.colors = [line 1, line 2, answer]` (default: theme curve, `#FF862F`, theme
  handle). Readouts per line: `y = mx + c` and general form; then one solution (the point, answer
  colour), "Parallel — no solution" or "Same line — infinitely many". The intersection point and
  its label show only inside the window. On a phone the two line groups sit side by side.
- `compare2` (G9X U3 L3) — two cost models C = a + b·x: `init.a1, b1, a2, b2, x`, `init.names`
  (e.g. `["Plan P","Plan Q"]`), `feeRange`, `rateRange` (`[min, max, step]`), `xStep`, optional
  `init.colors`. A marker slider for x. Readouts: each model; break-even point (or which is always
  cheaper); both costs at x and which is cheaper. Checker moves sliders by +1.3: keep steps ≤ 2.

- `cuboidAngle` (Y2 L17) — plain square window; `init.k` (graph units per cm), `init.O` (corner A of
  the cuboid), `init.T` (the flat triangle's corner A), `init.l, d, h` (sliders, `lRange`, `dRange`,
  `hRange` default `[2, 10, 1]`), `init.mode` (`two lines`|`line and base`). Oblique cuboid (depth at
  30°, half scale; hidden edges dashed) with the triangle shaded; the two lines in the answer colour.
  Toggle `two lines`: face diagonal AH and space diagonal AG, right angle at H, flat triangle with H
  top-left, G right, A below H. Toggle `line and base`: AG and the base, projection AC dashed, right
  angle at C, flat triangle A–C–G. θ on the bisector, further out for a narrow angle. Readouts: the
  leg from A as a surd, tan θ, θ to 1 dp. Validated at k 0.44 in a window 18.6 wide (l, d, h up to 10);
  at extreme sliders (2, 2, 10) a leg label may touch a vertex label.

- `reciprocalAHK` (Y1 L20) — y = a/(x − h) + k: `init.a, h, k` (integer sliders; `aRange`, `hRange`, `kRange`
  default `[-4, 4]`), `init.mode` (`curve only`|`with y = 1/x`). Two live branches, asymptote x = h dashed in
  h's `t2c` colour, y = k in k's (defaults red, blue), the points (h ± 1, k ± a) labelled away from the curve.
  Readouts: the equation; stretch/reflection and translation vector; asymptotes; domain and range; with the
  toggle on, (1, 1) ↦ (h + 1, k + a). a = 0 reads "Not a reciprocal curve". Keep h one step inside its
  range: the checker's +1 slider move must change the readout.

- `sinusoidABCD` (Y2 L20, v11) — y = a sin(b(x + c)) + d: `init.a, b, k, d` (sliders; c = kπ/12; `aRange`, `bRange`,
  `kRange`, `dRange` as `[min, max, step]`, default a, b, d step 0.5 in [−3, 3], [0.5, 3], [−2, 2], k in [−12, 12]).
  Window in radians with `xticks`. Draws y = sin x in the muted colour, the dotted principal axis, the curve, the
  start point (−c, d) in the answer colour, a dotted amplitude arrow (axis to the first max, or min if a < 0) and a
  dotted period arrow between two successive maxima, at their height, labelled with x2 − x1 = period (v12, teacher
  23/10/2026; no drop-line to the axis); the start point's coordinates sit beside the point (under the curve's band when
  |a|b > 4.5). Readouts: equation, amplitude, period, principal axis,
  maximum, minimum. a = 0 reads "Not a wave". Start a ≤ 1.5 and d < max so the checker's +1.3 moves change them.
  v13: `init.layout` `"wide"` (default) — graph full content width on top (`window.aspect` 3 unless set; 1.3 in
  portrait), the two control groups side by side below, thin sliders (4 px track, 14 px thumb, 20 px hit area, focus
  ring); `"square"` — the v12 layout (graph left, controls right). **Ranges keep two maxima in the window for every
  slider value**: the lab logs a console error (the checker fails) naming the b values that leave fewer than two
  maxima. Y2 L20: window −π − 0.15 … 4π + 0.15, `bRange` [1, 3, 0.5]. Any other preset gets the wide graph through
  `window.aspect`.
- `sinusoidStory` (Y2 L21, v15) — a model from the story and the time above a level: `init.max, min, P, tmax, k`
  (sliders; `maxRange` default [40, 80, 2] kept above `minRange` [0, 30, 2], `pRange` [8, 20, 1], `tRange` [0, 20, 0.5],
  `kRange` [0, 80, 2]), `unit` ('min'), `levelColor` (default orange `#FF862F`). Wide graph (`window.aspect` 3 unless set;
  Y2 L21 3.8). Draws the curve, dotted principal axis, the start of a cycle (c, d) in the answer colour, the period arrow
  between two successive maxima (`t2 − t1 = P`), the line H = k, the time above k shaded in every cycle with its crossings,
  and a dotted measuring arrow just under k in each full window (the first labelled). Readouts: d, a, b, c with their
  substitutions, H(t), and `H > k: t2 − t1 = time per cycle` (values to 3 dp with "…", result 3 s.f.; "never" / "always"
  outside the range). Window width ≥ 2 × the largest P (console error otherwise). Start P one step under the top of pRange
  so the checker's +1.3 move changes b.
- `tanABCD` (Y2 L20, v11) — y = a tan(b(x + c)) + d, the same sliders (defaults 1, 1, 0, 0). Branches drawn one by
  one between asymptotes (never joined), asymptotes red dashed, centres as points (the one at (−c, d) in the answer
  colour, no label), dotted y = d. Readouts: equation, period π/b, two asymptotes, the centre, what a does ("— no
  amplitude").

A lab handle hidden in the lab's initial mode is skipped by the checker's drag test; its readouts
must then change under the toggle.

### `yourturn` (last slide, exactly one)

```json
{"type":"yourturn","title":"Your turn",
 "sections":[{"heading":"Now, in class","rows":[{"code":"A","q":"Q1–8","label":"Gradient","time":"7 min"}]},
             {"heading":"At home","rows":[…]}],
 "open":{"q":"Q28","text":"…","how":"Open question — answer it with a drawing.",
         "harvest":"Harvest: L17"}}
```

Groups, question numbers and labels come from the worksheet sections; the times are the ones in
the worksheet or agreed with the teacher, and the "Now, in class" rows must fit the session.
`open.how` is fixed wording: "Open question — answer it with a drawing."  `harvest` (optional since v6: omitted, no line is shown — Y2 L16) names the lesson
where the open question is collected, or "Harvest: not yet scheduled".

G9X: one section `{"heading":"At home","rows":[…]}`, rows without `time`, no `open`. The
template then centres and enlarges the table (`.turn:last-child`) and marks the heading
`class="home"` (curve colour).

### `today`

Present in the engine, **not used** (decision: no Today slide).
