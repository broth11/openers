# Motion track

A scene for the deck kit (`skill/openers-slide-deck/assets/`, deck kit v23) that shows an object moving on a track above a standard s-t graph, with a trace that grows only as time passes. First used by MAI HL U12 L1, "The Language of Motion" (`decks/mai-hl-u12-l01/`). Approved by Ben, 1 November 2026.

## What it draws

- **Track strip** (top). Scene kind `track`: a car on a road above a number line (O marked, positive to the right). Scene kind `ride`: a cyclist on a hill that is drawn only as far as the rider has gone.
- **Strobe dots.** One dot per `motion.dot` time units, left on the number line (or on the hill) as the object moves. On `track`, dots made while the object moves backward drop to a second row so none are hidden. A thin trace line joins them.
- **s-t graph** (below, wide, `window.aspect`). The curve is traced up to the cursor, with a dot at each strobe time and a coloured marker with dotted guides to the axes. The marker, dots and the readout (`t = 1 s`, `s = -2.5 m`) share one colour (`scene.color`, a role such as `orange`).
- **Nothing ahead of the cursor.** Dots, trace, graph curve and hill are all cut at the current time `t`. The hill's steepness is therefore never visible ahead of the rider.

## Playing

- Each question slide has `scene.from` (the previous checkpoint) and `states[0].t` (this checkpoint). Arriving by Next animates from `from` to `t` and stops. Students answer on boards.
- Next then reveals the answer a step at a time. A later state with a larger `t` (for example Q2's last step, which lands the next dot) animates from the previous state's `t` when reached by Next.
- Back, the timeline bar, or a jump shows the finished state with no replay. Reduced motion jumps straight to the checkpoint.
- `scene.sec` is the seconds of animation per unit of time (before `meta.animSpeed`).

## Content (one example slide)

```json
{"graph": {"window": {"xmin": -0.5, "xmax": 4.6, "ymin": -6, "ymax": 10, "aspect": 2.2, "xname": "t", "yname": "s"},
  "scene": {"kind": "track", "layout": "stack", "color": "orange", "sec": 1.5, "from": 0,
            "motion": {"pts": [[0, -4], [0.05, -3.9], "..."], "dot": 1, "xmin": -6, "xmax": 10, "lab": 2, "unit": "m", "tunit": "s"},
            "states": [[0, {"t": 1, "read": "ts"}]]},
  "items": [{"kind": "trace", "pts": "motion", "dots": 1, "dotColor": "orange"}, {"kind": "marker", "pts": "motion", "color": "orange"}]}}
```

- `motion.pts`: `[[t, s], ...]` at 0.05 steps, sampled by the generator with sympy. `"pts": "motion"` on a graph item reuses it.
- `ride` also takes `motion.hill`: `[[distance, X, Y], ...]` in strip units (1000 wide, 290 high). The generator builds it from `sin(theta) = alpha (1/v - 1/V0)`, so the climb is steepest exactly where the rider is slowest. It is schematic: the vertical scale is exaggerated.
- State keys: `t` (cursor), `read` (`"ts"`, `"t"` or `"none"`: keep `s` hidden until its reveal), `mark` (a time to ring on the hill and label "steepest").
- `sceneTitle` slides take `kind`, `motion`, `color` and `wide: true`; they draw the object large on a bare track or flat ground.
- A question that needs more than the density budget is split with `cont` (the generator's `split`); the continuation can carry its own `from` so the last reveal still animates.

- Labels on the s-t graph do not move (`window.labelMask`): each keeps its anchor on a ground-coloured backing and the curve passes behind it. Set `aspectPortrait` equal to `aspect` so the graph does not depend on window orientation.

## Read the motion (signs layout) and the recap lab

- `scene.layout = "signs"`: the track strip draws a velocity arrow (blue) and the pull, which is the acceleration (red), each pointing the way its sign points, with `v = 0` or `a = 0` marked by a dot. Below it, three stacked panels show `s`, `v` and `a` against `t`, each with its sign diagram (`+`, `-` or `0` bands, zeros marked and labelled), cut at the cursor unless `full`.
- U12 L1 uses it after Q4 for a differentiate slide and three replay segments (slowing down then turning, speeding up then passing O, what each zero tells you). It ends with the recap lab `motionSigns`: Toy car, Michael's ride, a cubic (Haese Example 5, where `a = 0`) and steady speed (`a = 0` throughout).
- The car faces the way it last moved: right while `v > 0`, flipped to face left while `v < 0`.

## Pieces

- `scenekit.js`: `Lab.motionSlide`, scene kinds `track` and `ride`, `motionArt` (title cards).
- `labkit.js`: `Lab.interp`, and `Lab.figure(el, spec, shownFn, ctx)` with the graph items `trace` and `marker`.
- `deck_template.html`: layout `graph.scene.layout = "stack"`, `go()`/`next()` hooks (`fig.enter`, `fig.stepped`, `fig.stop`), phone layout.
- `build_deck.py`: resolves `scene.color`, `dotColor` and title-card `color` roles to the theme's hex.

## Checks (U12 L1, 1 November 2026)

Deck checker PASS at nine sizes except warnings on the 390 x 844 phone (emergency text shrink on two stacked slides); `--G` 0.984 at 1280 x 800; all values in `qa/verify-mai-hl-u12-l01.py`.
