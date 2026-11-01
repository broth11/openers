# Area under velocity

An addition to the Motion track (deck kit v24, `skill/openers-slide-deck/assets/`): a standard **v-t graph** under the track strip, with the area between the curve and the t-axis shaded live as the cursor moves, and a recap lab with two draggable cursors. First used by MAI HL U12 L2, "Displacement and Distance from Velocity" (`decks/mai-hl-u12-l02/`). Approved by Ben, 1 November 2026, with the car hidden until each reveal.

## What it draws

- **Track strip** (top), as in the Motion track (`track` for the car, `ride` for the cyclist). With the state key `hide: true` the strip keeps only the number line (or flat ground) and hides the car, strobe dots, trace and hill. The answer reveal sets `hide: false`, so the car's real position confirms the area.
- **v-t graph** (below). Graph items `trace` (the v curve up to the cursor) and `marker` (`guides: false`, no dotted guides) both take `"pts": "vt"`. The s-t graph is not drawn at all.
- **Shaded area.** Graph item `{"kind": "area", "pts": "vt", "posColor": "teal", "negColor": "pink", "opacity": 0.5}`. One polygon per run of one sign, cut at the cursor, split exactly at each zero of v. Nothing is drawn ahead of the cursor.
- **Readout under the graph.** `area so far = +9` while `areaFrom` is 0, otherwise `area since t = 3 = -9`; it counts from `state.areaFrom`, live with the cursor, and is coloured by its sign. `read: 'none'` hides it. It shows area only, never the position.
- `window.xtickBottom: true` moves the t numbers under the frame, so a curve that dips below the axis never hides them.

## Content

`scene.motion` needs `pts` (position s, sampled), `vt` (`[[t, v], ...]`) and `area` (`[[t, area from 0 to t], ...]`), all at 0.05 steps from sympy. A state is `{t, hide, read, areaFrom}`: `read: 't'` shows only the clock and `'ts'` also the position. Checkpoints work as in the Motion track: arrival by Next animates from `scene.from` to `states[0].t`, Next reveals the answer, Back and jumps show the finished state.

## Recap lab `areaLab`

`{"type": "lab", "preset": "areaLab", "init": {"window", "T", "vt", "F", "G", "posColor", "negColor", "start", "cards"}}`. Two draggable cursors on the t-axis (snap 0.5, kept in order), a toggle between `v` and `|v|` (the curve and shading flip), and readouts of the signed area and the total area. `F` and `G` hold the exact areas from 0 to `t = k / 2` as `[numerator, denominator]` pairs, so every readout is an exact fraction. Three cards unlock with the toggle: switching to `v`, switching to `|v|`, and using both.

## Pieces

- `labkit.js`: `Lab.areaRuns`, figure items `area`, `marker` option `guides`, `trace` and `marker` with `"pts": "vt"`, window option `xtickBottom`.
- `scenekit.js`: the `hide` state in `MOTION.track` and `MOTION.ride`, the area readout in `motionSlide`, the `areaLab` preset.
- `deck_template.html`: `.area-read`, `.ar-card`, timeline letter R for `areaLab`.
- `build_deck.py`: resolves `posColor` and `negColor` roles (and the lab's) to the theme's hex.

## Checks (U12 L2, 1 November 2026)

Every value is in `qa/verify-mai-hl-u12-l02.py` (sympy, 24 checks). Deck checker PASS at nine sizes (`--G` 0.997 at 1280 x 800, every slide at 1.000 or more in the per-slide probe). `node qa/check.mjs mai-hl-u12-l02` passes. U12 L1 rebuilt with the v24 kit still passes the checker.
