# Power family

`y = kx^n` in the first quadrant: direct variation (n > 0) and inverse variation (n < 0, written `y = k/x^m`). First used in MAI HL U5 L2 (direct and inverse recap scenes).

```js
import { powerGraph, directCards, inverseCards, topFor, powerTex } from '../../components/power-family/index.js'
graph: ({ v }) => powerGraph({ k: v.k, n: 3, doubling: true, top: topFor(3, 4) }),
cards: ({ v }) => directCards({ k: v.k, n: 3, doubling: true, table: false, notDirect: false }),
```

- `powerGraph({ k, n, x0 = 1, top, doubling, notDirect, asymptotes, negative })`: the curve, doubling markers at `x0` and `2x0` with the factor (`× 2^n` or `÷ 2^m`), a dashed `y = kx^n + 2` that misses the origin, and dashed asymptotes. `negative: true` writes the label as `y = kx^-m`.
- `topFor(n, kMax)`: a fixed window height for the power, so the k slider never rescales the graph.
- `directCards` / `inverseCards`: recap cards for the questions column (definition, the switches that are on, find k, origin or axes, where you meet it). The list is capped at five cards (four with a table) so the column never scrolls.
- `testTable(k, n)`: the ratio (`y ÷ x^n`) or product (`y × x^m`) table, with the constant column highlighted.

Rules: examples by power are real contexts students meet in MAI (jars, wind power, light, cans, gravity). The doubling factor depends only on the power; the cards say so.
