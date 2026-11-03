# Ladder (a, v, s)

An addition to the Motion track (deck kit v25, `skill/openers-slide-deck/assets/`): three stacked graphs under the strip, **a-t on top, v-t in the middle, s-t at the bottom**, sharing one time axis and one cursor. Shaded area under a becomes the change in v, shaded area under v becomes the change in s. A second layout, `lanes`, draws two cars on two roads over one number line. First used by MAI HL U12 L3, "From Acceleration Back to Position" (`decks/mai-hl-u12-l03/`).

## What it draws

- **`layout: 'ladder'`** on a `track` scene. `scene.motion.panels` holds `a`, `v` and `s`, each `{ymin, ymax, dp, dname, yticks, refs, series: [{pts, area, color, posColor, negColor, sub, opacity}]}`. A series with `area` shades the area under its own curve (running integral in `area`, from sympy), split by sign.
- **State keys:** `t` (cursor), `hide`, `read`, `show` (how many panels), `shade` (which panels shade), `areas` (which panels print the area readout, as `\Delta v = ...`), `vals` (which panels print the current value), `refs` (reference lines such as the limit).
- **`kind: 'lanes'`** (two cars): `motion.cars` gives `{id, color, pts, label}`; lanes at fixed heights, shared number line. Used for "same a, different start".
- **Colours** resolve through `--sc-<role>` CSS variables, so the theme picker recolours the run-time SVG.

## Recap lab `ladderLab`

`{"type": "lab", "preset": "ladderLab", "init": {"T", "a", "t0", "modes", "v", "s", "colors", "prompt", "alt"}}`. The acceleration is fixed. Two sliders set known values of v and s, and a toggle moves them from `t = 0` to `t = t1` and `t = t2` (`modes: {start: {t1, t2, v, s}, known: {...}}`). The working panel finds the constants of integration: `v = ∫ a dt = 2t + C`, `v(t1) = vk: vk = a t1 + C ⇒ C = ...`, `s = ∫ (v) dt = ... + D`, `s(t2) = sk: ... ⇒ D = ...`, then `s(t)` and its value at the t slider. The three graphs follow C and D. The title block, with the prompt as a one-line lede, sits above the ladder; the right pane holds only the sliders and the working, starting at the top of the page. The working and the graph names use `v(t)`, `s(t)`, `a(t)`. The ladder uses about 56 % of the width (capped by 76 % of the height); the first working line is a static `.lab-fixed` (it never changes, so the checker's "readout must change" rule skips it).

## Pieces

- `scenekit.js`: `drawLadder`, `MOTION.lanes`, the `ladderLab` preset.
- `deck_template.html`: `ladder` in the stack detection, `--sc-<role>` variables, `.llab` layout (two columns), `.s-ladder` slides (title block in the left column, ladder full height on the right).
- `build_deck.py`: `role_var` resolves roles in `motion.cars`, `motion.panels` and the lab colours.

## Checks (U12 L3, 2 November 2026)

Every value is in `qa/verify-mai-hl-u12-l03.py` (sympy). Deck checker PASS at nine sizes, lab stability 0.00 px at six sizes.
