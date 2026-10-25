# Strips

Rectangles under or beside a curve: Riemann sums, the trapezoidal-rule bridge, areas between curves, and areas against the y-axis. First built for U11 L9 (2026-10-25).

## Use

```js
import { midpointSum, toItems, snap } from '../../components/strips/index.js'

// Vertical strips between y = sqrt(x) (bottom) and y = 2 (top), on 0 <= x <= 4,
// with the typical strip under slider p1, draggable along x
const { items, typical } = toItems({
  dir: 'v', a: 0, b: 4, n: v.n, p: v.p1,
  lo: Math.sqrt, hi: () => 2,
  drag: { param: 'p1', axis: 'x' },
})
// items -> spread into the scene's graph items
// typical -> { lo, hi, m, h, rect } for labels and dimension arrows

const sum = midpointSum((x) => 2 - Math.sqrt(x), 0, 4, v.n) // live readout
```

| Function | What it returns |
|---|---|
| `midpoints(a, b, n)` | `{ h, m, L }`: width, midpoints, left edges |
| `snap(a, b, n, p)` | the strip under `p`: `{ i, lo, hi, m, h }` |
| `midpointSum(len, a, b, n)` | the midpoint sum of `len(t)·h` (signed) |
| `rects(dir, a, b, n, lo, hi)` | `[x1, x2, y1, y2]` per strip |
| `typical(dir, a, b, n, p, lo, hi)` | the snapped typical strip with its rectangle |
| `toItems({ dir, a, b, n, p, lo, hi, drag, opacity })` | SVG items (`rects` and the typical `rect`) plus `typical` |

`dir: 'v'` slices on x (vertical strips, `lo`/`hi` are bottom and top); `dir: 'h'` slices on y (horizontal strips, `lo`/`hi` are left and right).

## Rules (Ben, 2026-10-25)

- The typical strip is always one of the drawn strips. Never centre it on the slider value: it would leave the integration bounds at the ends and its length would not match the blue strip under it.
- The slider readout shows the snapped midpoint, not the raw slider value: `show: (v, all) => \`x = ${fmt(snap(0, 4, all.n, v).m, 2)}\``.
- Sums are midpoint sums and converge to the exact integral; hold the exact value back until the matching answer is revealed.
- Strips use the `strip` role and the typical strip the `typical` role in `kit/style.js`; do not set widths or opacities by hand.

## Pitfalls met

- A strip whose length crosses zero (a curve left of the y-axis) has `lo > hi`; the SVG engine normalises the rectangle, and `midpointSum` keeps the sign, which is what a signed-area scene wants.
- With 40 strips the typical strip is thin; its grip (drag handle) still sits on it, so dragging works at any n.
- Labels tied to the typical strip (Δx, Δy) should be `fixed: true` so the placer moves the other labels around them.
