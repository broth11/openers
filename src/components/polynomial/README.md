# Polynomial explorer

Degree 2, 3, or 4, in factored form `y = a(x - p)(x - q)...` with draggable roots, or in standard form with a constant that lifts the graph. First used in MAI HL U5 L2 (polynomial recap).

```js
import { polyGraph, polyCards, rootsFor, freeHandles } from '../../components/polynomial/index.js'
const base = [v.p, v.q, v.r, v.s]
const st = { deg: 3, a: 0.4, roots: rootsFor(3, base, v.rep), shift: 0, form: 'fact', rep: v.rep, handles: freeHandles(3, base, v.rep) }
graph: () => polyGraph(st), cards: () => polyCards(st)
```

- Roots are lesson params (`p`, `q`, `r`, `s`) that are not shown as sliders; the graph's `handle` items drag them along the x-axis.
- `rep`: `'none' | 'double' | 'two'` (two doubles, degree 4) `| 'triple'` (degree 3 or 4). Merged roots show one handle.
- The graph draws end-behaviour arrows on each tail of the curve (from where it passes 55% of the window height to where it leaves), turning points (blue), real roots (orange), and "double"/"triple" marks. Each end-behaviour statement sits at its own side of the window in two rows ($x\to\infty$, then $y\to\infty$).
- `polyEquation(state)` gives the equation on screen; show it in the readout row above the graph, not as a label on it.
- `polyCards`: end behaviour (odd or even degree, sign of a), turning points (count, at most n - 1), real roots (list, at most n), factored or standard form, repeated roots, and "n + 1 conditions fix a polynomial of degree n".
- `analyse()` finds real roots and turning points numerically (sampling and bisection), so standard form with any constant works.

- The graph sets `zoom: true` (wheel zoom, drag to pan, Reset view), and the curve is drawn far beyond the window so it stays whole when zoomed out.
