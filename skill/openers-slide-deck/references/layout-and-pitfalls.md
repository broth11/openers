# Layout rules and pitfalls — read before touching deck_template.html or labkit.js

The template was validated on Y1 L15 (28/09/2026, artifact version 15) and recalibrated on
3Blue1Brown frames on 29/09/2026 (unit grid, scale, rhythm, furniture; both L15 decks re-checked). A normal lesson changes
only `content.json` and, if needed, adds a lab preset. Read this file when a slide does not fit,
when you add a preset, or when you are tempted to change a size.

## Type scale — one factor for the whole deck

- Every font size is a `--fs-*` variable in `cqw`/`cqh` with a px floor, multiplied by `--G`.
  The footer uses a fixed `--fs-foot`.
- `fitAll()` finds the **single** largest `--G` at which every slide fits, and applies it to all
  slides. The teacher rejected per-slide growth explicitly ("aucune cohérence"): the same text
  role must be the same size on every slide.
- `--k` (per-slide shrink) is only a phone safety net. It runs on the **active, visible** slide
  only: on a `display:none` slide `overSlide` returns true and shrinks it to 0.55.
- `fitAll` measures hidden slides through `.slide.measure:not(.active){display:flex;visibility:hidden}`.
- **Unit grid (29/09/2026)**: `--u` = 12.5cqh (one Manim unit, 8 units per frame height);
  `--b1..--b4` = `max(4px,1.25cqh)`, `max(8px,3.125cqh)`, `max(12px,6.25cqh)`, `max(20px,12.5cqh)`;
  padding `--padx`/`--pady` 6.25cqh on every side. Spacing uses these tokens, not ad-hoc values.
- **Scale**: `--fs-stem` `min(1.95cqw,3.5cqh)`, `--fs-title` `min(3.23cqw,5.66cqh)`, `--fs-small`
  `min(1.63cqw,2.83cqh)`, `--fs-hero` `min(5.97cqw,10.51cqh)` — Manim 26 / 42 / 21 / 78 on a
  1080 frame. 30/48/24 was tried: `--G` 0.63–0.66.
- **`@property`**: every `--fs-*`, `--b*` and `--pad*` is registered as `<length>`, so it is
  computed once on the frame. Unregistered, a `cqw` inside `.lab-graph` (itself an inline-size
  container) resolved against the graph and rescaled every label and tick.
- **`--G` baselines, kit of 29/09/2026** (1280×800 / 1440×900 / 1470×956 / 1470×830 / 1920×1080 /
  1000×570): Y1 L15 0.987 / 1.000 / 1.000 / 1.000 / 1.000 / 0.999; Y2 L15 0.977 / 0.980 / 0.962 /
  0.994 / 0.996 / 0.988. Old kit at 1280×800: Y1 1.028, Y2 0.984. The rule is `--G ≥ 0.95` at every
  size, the two Mac sizes included.

## Density budget, wide stem — a dense example is split, not shrunk

Budget at 1280×800 (checked by `check_deck.py`): at most **6 working rows** (steps + text blocks)
and a stem of at most **3 lines**. Over budget → split by parts, stem repeated (Y2 L15 example 3:
four slides; example 4: two). A stem over 3 lines in the text column is set full width above the
graph: `fit()` → `s.wideStem()` (also run inside `fitAll`'s measuring pass) adds `.ex.wide`, grid
areas `"stem stem" "work fig" "note fig"`.


The densest slide sets `--G` for everyone. Whole Y1 L15 WE4 would have forced `--G` = 0.88 on
the deck, so it became two slides — (a)(b), then (c) — each repeating the stem. Rule: if one
example pulls `--G` visibly below its neighbours, split it by parts. Build, look at the reported
fit, decide.

## Free space goes to layout, never to type

- Example and lab graphs take the full available height: `height:min(100%,43cqw)` on examples,
  `min(100%,52cqw)` on labs (52: the controls keep ~40 % of a 3:2 screen). On containers of aspect
  ≥ 17/10 (1470×830, 1920×1080, 1000×570) the example graph is capped at **33cqw**: there the text
  is height-bound, and Y2 L15 example 2 held `--G` at 0.946 until the text column got the width
  (34cqw was not enough). A smaller graph makes its labels relatively bigger: re-check collisions. Put the cap in `height`, never `max-width` on an aspect-locked box
  (that broke the square at 1024×768).
- The working is anchored top-left under the stem (`align-self/justify-self:start`), Manim's
  `arrange(DOWN, aligned_edge=LEFT)`; free space stays at the bottom.
- Your turn: the table and the open-question panel share the free height (margin auto).
- Labs: the gap between the title and the control groups grows with free height, capped at 5 %
  of slide height, in JS; `fitAll` resets it before measuring.

## Themes

`deck_template.html` carries the **skyblue** look; a theme is a CSS override appended to it
(`assets/themes/<name>.css`) plus a JSON file giving the lab colours (`window.LAB_THEME`, read by
`labkit.js`), the `\gr`/`\bl` KaTeX colours and whether to embed STIX. Default = `3b1b`.

**3b1b (default, recalibrated 29/09/2026).** Ground `#000` everywhere — slides, labs, Your turn;
`--card`/`--cardline` transparent (no panels, no tints). Panel padding `.3em .15em`, invisible:
it only holds KaTeX's glyph boxes (at 0 the checker fails on fractions). A 2 px `#888` rule `--b1`
under every slide title (`h2::after`). Computer Modern everywhere (KaTeX_Main / KaTeX_Math),
`.katex` at 1em. Text white `#FFFFFF`/`#E4E4E4`, muted `#A0A0A0`. Curves and lines blue
`#58C4DD`, rise/run triangle blue at 16 %, grid `#333` 1 px, axes `#FFF` 2 px, curves 3 px,
dashed 2 px with dash `6 5`, static points white r 5.5, no frame round the window (`LAB_THEME`
`stroke`, `point`, `pointR`, `frame`; widths are Manim px on a 1080 frame, drawn non-scaling as
`max(1px, w/10.8 cqh)`). Yellow `#FFFF00` = answer, handle, slider. Teal `#5CD0B3` = tag.
Scratch pad and help box `#000` with a `#333` border; footer rule `#1A1A1A`. `t2c` roles: blue
`#58C4DD`, red `#FC6255`, teal `#5CD0B3`, pink `#D147BD`, green `#83C167`, grey `#BBBBBB`.
Fixed in both colour schemes.

**goldteal (opt-in, teacher 29/09/2026).** A copy of 3b1b with colour tokens changed only
(Manim hexes verified against ManimGL `default_config.yml`): layout, type, Computer Modern, no
panels, title rule, furniture widths and fade are 3b1b's. Ground `#0E1116` (`--pagebg`,
`--stagebg`, `--ground`, `--code`, `.s-lab`, `.s-turn`, help box, scratch pad; help veil
`rgba(14,17,22,.72)`). Text `#FFFFFF`/`#E4E4E4`, muted `#A0A0A0`, `--foot`/`--hint` `#9A9A9A`.
GOLD_C `#F0AC5F` = answer (`--bl`, `\bl`), `--doton`, slide titles, title-slide h1, handles,
slider accent, "Now, in class" and open-question headings. TEAL_C `#5CD0B3` = curves and lines
(`lab.curve`), rise/run fill at 16 %, title-slide rule, toggle on (text `#0E1116`), "At home"
heading. BLUE_C `#58C4DD` = tag (`--tagtx`, `--tagline`, `--tagbgC` `rgba(88,196,221,.12)`).
Grid `#30343A` 1 px and help/scratch border `#30343A`: a tinted slate (`#2A3038`, saturation
0.25) was tried first and counted as blue in the pixel audit (Y1 example neutral share 29–55 %),
`#30343A` (saturation 0.17) restores 50–82 %. Axes `#FFF`, points white. `t2c` roles as 3b1b;
`teal` equals the curve colour, so `blue` is the contrasting role (Y1 L15 binds `m` blue, `c`
red). Violet `#B189C6` unchanged. Baselines (29/09 kit), `--G` at 1280×800 / 1440×900 /
1470×956 / 1470×830 / 1920×1080 / 1000×570, identical to 3b1b: Y1 L15 0.987 / 1.000 / 1.000 /
1.000 / 1.000 / 0.999; Y2 L15 0.977 / 0.980 / 0.962 / 0.994 / 0.996 / 0.988. Both PASS nine
sizes. Pixel audit (greyscale, 1280×800 example slides): neutral 50–85 %, gold 0.26–1.04 % of
the frame (hue 32, the audit's `orange` bin), the same shares as 3b1b's yellow on the same slides.

**skyblue.** Palette fixed in both colour schemes. Default slide `#F4FAFE`; labs `#F4F1FC`;
Your turn `#EEF8F1`. Ink `#14202B`, muted `#55636F`. STIX Two Text + STIX Two Math. Indigo
`#4230A8` = answer and handle; teal `#0B6E63` = tag.

**bluebrown, greengrey (29/09/2026).** Colour-only copies of 3b1b (strokes, sizes, fonts,
`frame:false` unchanged); `--G` identical to 3b1b on both L15 decks, checker PASS at nine sizes.
Tokens changed: every ground (`--pagebg`/`--stagebg`/`--ground`/`--code`, `.s-lab,.s-turn`,
help box, scratch pad, the `#help` veil), answer (`--bl`, `--doton`, slider `accent-color`, Your
turn headings, JSON `bl`/`handle`), titles white (`h1,h2`, `.s-title h1`, `.s-turn h2`), the
`h2::after` rule, tag tokens, JSON `grid`/`axis`/`ink`/`point`/`muted`/`gr`. bluebrown: ground
`#14110F`, answer `#CD853F`, rule `#736357`, grid/borders `#3A332D`. greengrey: ground
`#1C1C1C`, answer `#83C167`, tag `#FFFF00`, grid/borders `#3A3A3A`, footer rule `#2A2A2A` (the
3b1b `#1A1A1A` vanishes on this ground). With white titles the answer colour covers only
0.01–0.55 % of an example frame (3b1b yellow: 0.56–1.03 %, titles included).

**Adding a theme**: copy `3b1b.css`/`.json`, change tokens only, then run the check on the L15
example. Computer Modern taught two lessons: headings need `line-height:1.25` (at 1.12 the tall
glyphs overflow the h1 by 4 px and `fitAll` shrinks the whole deck to `--G` 0.69), and the
portrait lab graph needs `39cqh` instead of `42cqh`. Any font change: probe `--G` against the
baselines above (skyblue Y1 L15 on the 29/09 kit: 1.000 at 1280×800, 0.951 at both Mac sizes).

## Fixed across themes

- Title slide: hero `max(38px,min(5.97cqw,10.51cqh))` (Manim 78), whole block centred.
- Your turn only: h2 at 1.5 × `--fs-title` in skyblue, at `--fs-title` in 3b1b (same as every
  slide title); section headings at `--fs-stem`.
- Graph ink per theme (see above): primary, secondary dashed, handles/answer lines in the answer
  colour. No other colour in a graph.
- Lab group titles take HTML: write subscripts as `L<sub>1</sub>`, never Unicode `₁` (missing
  from Computer Modern, it falls back to another font).

## Lab layout — nothing moves, everything readable (teacher, 24/10/2026, Y2 L21)

Standing rules from the teacher's corrections of Y2 L21; `sinusoidStory` (kit v20) is the reference. The checker
enforces the first and the size rule (v21); the others are judged on the screenshots and by the reviewer.

- **Nothing moves when a slider moves.** The live model equation sits above the graph in a fixed-height box sized
  for the tallest case; every fraction carries a strut so its height never changes (π/11 and 2π/23 stand equally
  tall); panel rows have fixed heights. `check_deck.py` sweeps every slider and fails on a move > 0.5 px (v6 before
  the fix: 22.7 px when P changed).
- **Each time-above window**: two solid vertical lines through the crossings, a solid double arrow below the level,
  its value centred between the lines. Every window shows its value.
- **Period indicator** level with the maxima, on one side only (no mirrored duplicate), its arrowhead stopping short
  of the max dot.
- **Panels** ("THE STORY", "FROM THE STORY") spread their content over the panel height, with a clear gap under the
  heading; fractions at display size.
- **Show a simplification only when one exists**: b = 2π/23 stays as it is; 2π/22 = π/11.
- **Sizes**: in-graph labels, ticks and panel text ≥ 85 % of the body size (the checker fails below, v21); example
  graphs ≥ 40 % of the slide width (`meta.largeGraphs`).

## Pitfalls met

- **Measuring overflow after `Deck.go()`** includes the per-slide `--k` safety shrink: to see the
  true layout, set `--G` on `#frame` **before** `Deck.go()`.
- **Reading probe output**: a `grep` over lines ending in `| ex:` once hid lab failures; read the
  whole probe line.
- **Python heredocs** writing JS or TeX with backslashes double-escaped `apply_t2c` once; after
  editing `build_deck.py`, run `--selftest`.
- **Colliding label**: in the page, `window.__labDebug` lists the text of each colliding label
  after `g.collisions()`. Move that label's `at` (on the bisector: further out for a narrow angle,
  but not so far that it meets the next label) or the preset's label radius. Y2 L15 29/09:
  18° at 1.7, 29° at 1.8, 11° at 4.2 units, 9° at 4.0, 085° `labelAt` 2.1, the depression θ in
  the `elevation` preset at 2.7.
- **Pixel audit of screenshots**: Chromium renders LCD sub-pixel text, whose colour fringes count
  as orange and blue-teal; take audit screenshots with `--disable-lcd-text`.

- **A flex child shrinking hides overflow.** `.s-turn>*{flex-shrink:0}`; `overSlide` also checks
  `scrollHeight > clientHeight`.
- **Tick numbers collide with labels.** `place()` hides a tick number within 5 px of a label;
  2 px left "1" touching "(0, 3/2)".
- **KaTeX fonts load lazily.** Measurements taken before the fonts are loaded are wrong; the
  template force-loads every face with `document.fonts.load` and re-runs `refit` on
  `loadingdone`. Keep that if you edit the fitting code.
- **`.stem` width**: the stem lives in the text column of the `.ex` grid (`stem fig`); letting it
  span the figure column pushes the graph down.
- **Degree sign**: write `20\,{}^{\circ}\mathrm{C}`, not `°` in maths.
- **`nb()`** keeps an inline formula glued to its trailing punctuation; do not strip it.
- **To look at a failing state**, drive the page in Playwright with `Deck.go(i,"all")` and take a
  screenshot yourself.
- **The checker assumes at least four slides** (it tests arrow-back on slide 4 and taps on slide 3).

## Y1 L15 specifics (reference only)

- WE3 (perpendicular through a point) uses `-bx + ay = -b\,x_B + a\,y_B`, one line from the
  general form, as validated.
- Labs sit **before** the example they prepare: lab `line2pts` → WE1, WE2; lab `lineMC` → WE3.

## Lab presets planned (from the superseded plan — build when the lesson comes)

| Lesson | Preset | Moves | Readouts |
|---|---|---|---|
| ~~Y2 L15 elevation & bearings~~ | `elevation` — **built 28/09/2026** | slider h, observer, depression toggle | θ, d, h, `tan θ = h/d`, depression |
| ~~Y2 L15~~ | `bearing` — **built 28/09/2026** | B round A, C round B, course toggle | bearing (3 figures), back bearing, 2nd bearing, interior angle |
| ~~Y1 L16 quadratics~~ | `parabolaABC` — **built 28/09/2026** | sliders a, b, c | Δ, roots or "no real roots", vertex, completed square |
| ~~Y2 L16 solid geometry~~ | `solidSection` — **built 29/09/2026** | toggle cone/pyramid; sliders r or a, h | oblique solid + its flat right triangle, `l`, `V`, `A` — never 3D |

## Y1 L16 specifics (reference only)

- `check_deck.py` no longer assumes slide 4 has steps: back-navigation uses the first slide with
  more than one step, and the tap test uses the first pair of non-lab slides (a lab swallows taps).
- A lab point that moves with sliders (not draggable): create it with `g.point({x:0,y:0}, {visible})`
  and set `h.x`/`h.y` before `S.refresh()`; `point()` reads its position from the handle object.
- `segment`/`line` evaluate their endpoints before checking `visible`: guard every function they
  call (e.g. `H()` when a = 0) so it never throws.
- Teacher colour rules (28/09/2026, 3b1b): slide titles yellow; Your turn — "Now, in class" and the
  open-question line yellow, "At home" curve blue. A worked-example line can highlight part of an
  expression in the curve blue with `\textcolor{#58C4DD}{…}` when asked.


## Y2 L15 specifics (reference only)

- Kit v4: window `plain`, graph items `north` and `bearing` (`g.north`, `g.bearing`, and figure
  kinds of the same names), presets `bearing` and `elevation`. `check_deck.py` skips a handle
  with no bounding box (hidden in the lab's current mode).
- A bearing arc is a polyline, not an SVG path, so the label placer keeps labels off it; an
  `angle` arc is still a path and is not avoided.
- `g.point(P)` takes a plain `{x, y}` object, never a function: a function gives
  `translate(NaN,NaN)`. For a point that moves with a slider, keep the handle and set `h.y`
  before `S.refresh()` (the elevation preset's `T`).
- Lab `instruction` text overflows the lab slide at every size under 3b1b; leave it out.
- Every `[C]` example ends with one text reveal "GDC (Deg): keys → display; write …" (teacher,
  28/09/2026). `Ans` carries the unrounded value between examples split over two slides.
- Worked-example figures are not to scale, as on the worksheet: a 9° depression drawn at ~19°,
  an 18°/29° pair stretched vertically.
- Teacher rulings, 28/09/2026 (Y2 L15 review):
  - **Solution panel type** (superseded on 29/09/2026 by the 3b1b rhythm: prose line-height 1.5,
    aligned rows 0.5em, blocks 0.6em, example graph 43cqw / 33cqw on 16:9): prose at `--fs-stem` with line-height 1.6, maths at `--fs-stem`×1.04,
    panel gap `max(14px,3.2cqh)`, aligned rows spaced 1.05em (was `--fs-body`, `--fs-math`, 0.8em:
    "difficile à lire, pas assez espacé"). Landscape example graph capped at `43cqw` (was 50) so the
    text column is wider; portrait example graph `min(88cqw,33cqh)`.
  - With larger panel text, the densest example pulls `--G` down for everyone: Y2 L15 Example 4
    became two slides (angles; then sine rule and height). Probe each slide's own `--G` by building
    title + slide + Your turn alone.
  - **Lab controls**: `controlScale` 1.3 on both labs (1.4 overflowed at 1024×768 after the toggle).
  - **Violet for a key intermediate angle** (`#B189C6`, `\textcolor{#B189C6}{…}` in working and
    labels, `color` on an `angle` item): the one angle the whole method turns on (75° in Example 3).
    A deliberate exception to "no third accent", asked for by the teacher.
  - ~~**Angle between two bearings from one point**: state both bearings from that point's north
    line and subtract (back bearing 160° − 085° = 75°).~~ Superseded on 01/10/2026 (below): the
    160° arc crossed the figure and its label floated away from it.
  - Show the continuation of a leg beyond a point as a dashed segment when a back bearing is read there.

- Teacher rulings, 01/10/2026 (Y2 L15 rebuilt, greengrey, validated the same day):
  - **Order**: elevation lab, Ex 2, Ex 4 (2 slides), bearing lab, Ex 1, Ex 3 (4 slides), Your turn.
    Worksheet numbers kept.
  - **"Too many words, not enough calculation on the diagram; angle labels badly placed."** Ex 1:
    no paragraph; at B a muted 180° arc to the dashed south line, then a violet 118° arc (the
    alternate of the violet 118° at A), then a 298° arc in the answer colour. Ex 3a: N̂BC = 20°
    (red arc at B), B̂CS = N̂BC = 20° (dashed south line at C, red arc), B̂CD = 180° − 85° − 20° =
    75° (violet); no side lengths on that slide. Ex 3b2: bearing of D = ĈBD − N̂BC = 66.4° − 20°
    = 046°, the 66.4° arc outside the 20° and 046° arcs.
  - Labels that the placer had pushed to the wrong side of BC: the two 20° now sit outside their
    wedges (`pol(B,14,2.15)`, `pol(C,193,2.2)`), the B label at `pol(B,125,1.15)` clear of the
    reflex 340° arc, "15 km" 1.05 units left of BC's midpoint, "23.198…" off BD's midpoint by
    (+1.0, −0.7). Window for Ex 3 tightened to 9.4 units (was 10.5) to enlarge the figure.
  - `--G` 0.977 at 1280×800; PASS at nine sizes.

## Y2 L17 specifics (reference only)

- Kit v7: preset `cuboidAngle`. Generator `assets/examples/Y2_L17_make_content.py` (hemisphere on a
  cone, cylinder and sphere, cuboid and rectangular pyramid in oblique view, each flat triangle below
  its solid in true shape) and `Y2_L17_verify.py`.
- A vertex label inside the silhouette of an oblique solid (D of a cuboid, D of a pyramid) collides at
  every anchor: drop it from the solid and name it on the flat triangle instead.
- A label under a flat triangle needs at least 1 unit below it inside the window, or the placer pushes
  it into the triangle.
- Angle values (51.8°, 54.5°) are not labelled on the flat triangle: the working states them, and the
  label on the bisector of a 50° angle collides at 1000×570 and 390×844.
- Every example slide at 1280×800 fits with one type scale; the long V and A rows of a composite solid
  overflow at 1024×768 unless broken over two aligned rows.

## Y1 L20 specifics (reference only, 20/10/2026)

- Kit v10: preset `reciprocalAHK`; examples `Y1_L20_make_content.py`, `Y1_L20_verify.py` (goldteal, t2c h red, k blue).
- A table of values goes in a `text` block as `$\begin{array}{c|ccc||ccc}…\end{array}$`, one reveal.
- A `\dfrac` on the first line of the working pokes 4 px above the panel at 16:9 (`overflow panel`): use `\frac` there.
- Prose answers that must not break across a line: `<span class="ans" style="white-space:nowrap">`.
- A point on a steep branch next to an asymptote and another curve may have no free label position at 1000×570: drop its label when the working names it.
- Split examples: 2 (transformation | domain, range, check), 3 (asymptotes | points), 4 (working | answer, check), 5 (picture | algebra), all for `--G` ≥ 0.95 at 1470×830.
- Y2 L15 model still fails at 1440×900 (slide 5 label), as with kits v8–v9.
- Theme `greyline` (trial, 20/10/2026, from a 3Blue1Brown frame): black ground, white text, TEAL_C titles over a grey rule, grey tag (teacher, 20/10/2026), curves GREY_B #BBBBBB, answers/handles YELLOW #FFFF00, At home TEAL_C #5CD0B3; set the title colour on h1, h2, never on --title (it also colours the stem), dashed curves #7A7A7A; t2c red/blue unchanged (asymptotes).

## Y2 L20 specifics (reference only, 21/10/2026)

- Kit v11: presets `sinusoidABCD`, `tanABCD`; `dotted` strokes; window `xticks`/`yticks`; example `eyebrow`;
  figure points take `answer`. Examples `Y2_L20_make_content.py`, `Y2_L20_verify.py` (greengrey, no t2c).
- Teacher's line rule: a dashed line is always an asymptote (red); principal axes, reading lines and measuring
  arrows are dotted grey; curves are never dashed (a "before" curve is solid `grey`).
- Worked examples A–D are original exam-style items (guide G&T archetype 11), not the worksheet's, at the
  caller's request; each split by parts to keep `--G` ≥ 0.95 at 1470×830 (prompt + 6 rows gave 0.73–0.81).
- A label beside a point on a steep sinusoid has no free position at 1000×570: drop it when the working names the
  point (WE A (c)); anchor max labels `n`, min labels `se`, period arrows below the curve.
- A label at the window edge (`y = 1` at xmax) widens `.ex` and triggers the per-slide shrink (`--k` 0.52): keep
  labels inside.
- `--G` at 1280×800: Y2 L20 0.989; the L15 models and Y1 L20 unchanged (0.987 / 0.991 / 0.977); Y2 L15 still fails
  at 1440×900 (the 11° label), as with v8–v10.


## Y2 L20 review (reference only, 23/10/2026, kit v13)

- Standing rules from this review live in `figure-rules.md`; the review stage in `review-checklist.md`.
- A tick label at the window edge ("2π" at xmax = 2π + 0.35) widened `.ex` by 10 px and fired the per-slide shrink to
  `--k` 0.52 on every screen, with no other symptom: the checker now fails on it; fix the window (xmax 6.9).
- Wide lab (`window.aspect`): the graph's viewBox is 1000 × 1000/aspect; labels, collisions and drag use the same
  height. In portrait the aspect falls to `aspectPortrait` (1.3) and the start-point label moves under the band.
- The highlight CSS uses `:has()` on the step rows and `!important` so a `t2c` colour inside `hlstep` turns yellow too.
- `#1f3a93` (a dark blue for a second radius) was 1.69:1 on greengrey; `indigo` `#5C7CFA` is 4.64:1.
- `--G` at 1280×800: Y2 L20 model 0.99 (unchanged by the wide lab).
