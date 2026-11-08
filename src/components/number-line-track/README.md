# Number-line track

A horizontal strip with a particle on a number line, drawn above a v-t graph so the motion and the area under velocity are seen together. First used by the MAI HL U12 concept "Displacement or distance: signed area and |v|" (`src/concepts/mai-hl/u12-signed-area.js`), 8 November 2026.

It is the plain-SVG, shell-side cousin of the deck kit's Motion track (`src/components/motion-track/`). Use this one in concept visuals and SVG lessons; the Motion track stays in the deck kit.

## What it draws

- A number line with arrowheads, STIX tick numbers, O at zero, and `s` at the right end. Ticks thin out (step doubles) until neighbours are at least 30 px apart.
- The particle: an orange dot at `s`, with a direction arrow above it (teal right, coral left) when `|v| > 0.05`.
- The trail so far, above the line: teal while moving right, coral while moving left. Each change of direction moves the trace up a row (three rows at most), so out-and-back reads at a glance.
- Optional ghost marker (dashed ring) with a short label, for the start of an interval.
- Optional odometer box at the right end, showing the distance so far in metres (smaller below 560 px wide).

## Use

```js
import { makeTrack } from '../components/number-line-track/index.js'
const track = makeTrack(hostElement)        // the host sets the height; the strip fills it
track.apply({ min: -1, max: 12, step: 1, s: 7 / 3, v: 5, trail: [[0, 0], [0.05, 0.6], ...], ghost: 0, ghostLabel: 'start', odometer: 71 / 3 })
```

In a concept module, return it from `stage(ctx)` as `track`; the concepts shell creates and applies it.

## Pitfalls met

- The trail is sampled in time (`[[t, s], ...]`). Sample finely (20 per second) so a turn reads as a turn.
- Keep `min` a little below the smallest position so the particle at O is not on the arrowhead.
