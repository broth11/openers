# Calculator (GDC) slides in an openers deck

Folded in from `gdc-online-deck` v3 (24/10/2026) on 29/10/2026, so the openers deck needs no second skill.
A calculator slide teaches one fx-CG50 skill as numbered steps on the left and the calculator on the right: each
reveal shows the real screen after that step and rings the keys it presses, in order. Validated on G9X U3 L7 and
the AA SL decks D1–D8 (23–24/10/2026), and inside the U5 L3 scene deck (29/10/2026, checker PASS at nine sizes).

What changed from the standalone skill:
- No build step. `scripts/build_deck.py` calls `gdc/src/apply_kit.py` (`patch()`) whenever `content.json` holds a
  `gdc` slide. Never patch `assets/deck_template.html` by hand.
- `apply_kit.py` is adapted to the scene template: the `paintSteps` anchor, and `s.d = d` so the timeline letters a
  calculator slide `G<skill>`, then `W` per step.
- Paths: `kit/` in the old skill is `gdc/` here (`gdc/src/...`, `gdc/captures_lcd/...`); the key log is
  `references/menu_paths_verified.md`.
- Delivery follows the openers deck SKILL.md, not the AA SL or G9X sections of the old skill.

## The kit (in `gdc/`)

```
gdc/src/apply_kit.py     patch(html): adds the gdc slide type (CSS, renderer, slide branch, K key, phone fallback),
                         embeds calc_body.webp; called by build_deck.py
gdc/src/gdc_slide.css    calculator layout; every rule scoped under .s-gdc / .calc
gdc/src/gdc_slide.js     GDC renderer: step markup, key table KP, keypad hotspots, light()
gdc/src/calc_body.webp   629x1333 body, corners transparent; screen rect (50,152) 528x300, keypad region (34,480) 560x776
gdc/src/make_content.py  G9X U3 L7 generator: the model for calculator slides (sympy on every value, lint_steps())
gdc/src/cap.py           saves zoom captures and writes the LCD crops (see Captures)
gdc/captures_lcd/        angle_deg_1..4, angle_rad_1..4: SET UP -> Angle, the only reusable screens
references/menu_paths_verified.md   every key sequence verified on the emulator, with its traps
```

Read `references/menu_paths_verified.md` before planning the steps of a menu already in it.

## Teacher's rules (23/10/2026) — do not reopen

- **The skyblue-only rule is cleared** (teacher, 24/10/2026). A calculator deck is built with the
  default theme picker of the deck kit (any of the five themes; `--theme` sets the one it
  opens in). The calculator body and its LCD screens stay light in every theme, as the real device is,
  and the highlight box on a screen stays indigo. Never mix themes in one deck means one picker per
  deck, not a different look per slide. A native dark build with `--no-picker` is untested with the kit.
- **The calculator is the full emulator body capture** (`calc_body.webp`: silver shell, blue rim,
  CASIO logo, black bezel, real keys). No CSS-drawn frame, no schematic keypad, no keypad-only crop.
- **Screens are real captures** of Casio fx-CG Manager PLUS (fx-CG50 emulator) on the teacher's
  Mac, one per step, never drawn by hand.
- Keys pressed in a step get a **white ring**; with several keys, a **white badge** gives the
  press order ("1", "2,10", "3…").
- **Restore the machine** (24/10/2026): a deck that changes a setting other than the angle unit
  (SET lists, Freq, Q1Q3 Type, Derivative, lists left full) ends its last calculator slide with a
  step or a line telling students to put it back, so "Your turn" and the next deck start from the
  default state.

## Slide content

In `content.json` (`meta.theme` is the theme the deck opens in, e.g. `"3b1b"` or `"skyblue"`), a calculator slide is:

```json
{"type":"gdc","skill":1,"tag":"C","title":"Enter the function and draw it",
 "stem":"Y1: $y=-2x^2+5x+12$",
 "start":{"type":"img","src":"data:image/jpeg;base64,…","alt":"Start screen"},
 "steps":[{"t":"Press [MENU]. The main menu opens.","s":{"type":"img","src":"…","alt":"Main menu"}}]}
```

- Eyebrow is generated: `GDC Skill <skill> · [C]`.
- Step text: `[KEY]` is a key chip and lights that key; `{-2.5}` is a typed entry and lights its
  digits, DOT and NEG (leading minus) or SUB. Key ids: `F1`–`F6 SHIFT OPTN VARS MENU ALPHA SQR POW
  EXIT XTT LOG LN SIN COS TAN FRAC SD LP RP COMMA STO DEL AC MUL DIV ADD SUB DOT EXP NEG EXE UP DOWN
  LEFT RIGHT 0–9`.
- An `img` screen may carry `labels` (`[left%, top%, w%, h%, text, bg?]`, white boxes that
  relabel the F-key menu) and `hl` (`[left%, top%, w%, h%]`, a highlight box).
- Write content from a generator modelled on `gdc/src/make_content.py`: values from sympy, each one
  also read off its capture, displayed in fx-CG50 Norm1 format (10 significant figures, real minus
  sign). Density budget of the deck applies: about 5–6 steps per slide; split otherwise.
- Exact key sequences matter more than prose: every step names the keys actually pressed in the
  capture run, in that order.
- Step text is parsed for `[KEY]` and `{entry}`, and its HTML eats `<` followed by a letter. Inside
  `$…$` in step text: no braces, `\lt` for `<`; keep tall operators (`\int`, `\frac`, `\sum`) in the
  stem. `lint_steps()` refuses the first two and warns on the third (an `\int` in a full step
  column pinned `--G` at 0.6).
- A formatter may rewrite `.py` files after each write (tuples split across lines): edit a step
  file by its content (key, title), never by its line layout.

## Captures — computer use with the emulator

Read the `computer-use` skill first. The teacher must have fx-CG Manager PLUS open on the Mac.

1. Window at 1024×746. Set up the machine state the slide starts from (mode Deg/Rad, menu,
   functions, window, lists) and capture the start screen as `s<NN>_0`.
2. Press one step's keys, then capture with `computer_app_zoom` on the LCD region
   **[30,140,302,300]** of the window at **scale 1** (a scale < 1 saves a smaller file) → 544×320.
   The harness stores each zoom as `<tool-results>/<blob>.jpg` (path printed under the image):
   `gdc/src/cap.py OUT <tool-results> s03_1=<blob> …` copies it to `OUT/raw/` and writes the
   576×324 crop (8,16,536,316) to `OUT/lcd/`.
3. **Typing:** test once whether the Mac keyboard reaches the emulator. With
   `computer_app_key` (background) digits 0–9, Return (= EXE) and the arrow keys work; `.` and `-`
   are refused, so click `[.]`, `[(−)]`, `[−]`. With full-screen control (`computer_type`) they
   type too. Type data and values by keyboard and click only F-keys, SHIFT, OPTN, MENU, DOT, NEG:
   entering 40 values by mouse cost half a deck's tokens.
4. The emulator lags: capture only once the screen shows the step's expected state; if a capture
   is identical to the previous one, wait and capture again. Clicks closer than ≈ 0.5 s are lost or
   doubled: in a `computer_app_batch`, put a `zoom` at scale 0.1 between two clicks.
5. Look at every crop before using it.

Emulator facts (23–24/10/2026; the full list is in `references/menu_paths_verified.md`):
- EXIT from ROOT / Y-ICEPT / MAX / Not Found returns to the function list, not the graph.
- In V-Window, EXE on the x scale lands on dot (no skip); [DOWN] skips it.
- Angle mode: SHIFT MENU, [DOWN]×10 to Angle, F1 Deg / F2 Rad, EXIT. The `angle_rad_1..4`
  captures end on an empty function list: the Rad slide starts from an empty list in Deg.
- A digit pressed right after [MENU] often lands seconds later: wait for the main menu, press the
  digit once, then check the screen before pressing again.
- **Statistics keeps its SET settings** (1Var Freq, 2Var XList/YList) from one calculation and one
  session to the next: check SET before any slide that uses 1-VAR or REG.
- The body image comes from a 648×1358 capture of the whole emulator: background grey 171 and
  its shadow removed by a fixed-range flood fill from the corners (lo 60, hi 8), 2 px erode, 3 px
  blur on alpha, cropped at (12,16). Only redo it if the emulator skin changes; then re-measure
  the screen rect and keypad region by template matching and update the % in `gdc_slide.css`.

## Checks beyond check_deck.py

- **Look at the title slide** at 1280×800 and 1000×570. The checker does not detect text drawn
  over text; every kit CSS rule stays scoped under `.calc` / `.s-gdc` (an unscoped `.keys` once
  threw the title hint across the slide).
- At each size, the rings sit on the keys of the step (badges in order), the screen fills the
  bezel, and the slide's step text matches what the capture shows.
- Press K (screen only, larger, plain bezel) and check one slide; at 390×844 the calculator is
  screen only, above the steps.
- Teacher's screens: MacBook Air 13.6" (1470×956, 1470×830); students: 13" MacBooks.
