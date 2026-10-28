# Growth family

Recap explorer for U5 L3: `y = ka^x + c`, `y = ke^(rx) + c`, `y = a + b ln x`.

## API

`import { VIEW, model, equationTex, growthGraph, growthCards } from '../../components/growth-family/index.js'`

State: `{ fam: 'exp'|'nat'|'log', k, a, r, c, la, lb, inv }`.

- `growthGraph(st)` draws the curve (clipped to the view), the asymptote (`y = c`, or `x = 0` for log), and a hollow point at the initial value. With `inv` it adds the inverse as a dashed parametric curve and the line `y = x`.
- `growthCards(st)` returns up to five recap cards: model form, growth or decay, half-life or doubling time, initial value and asymptote, and the inverse or log model.

## Rules

- Curves are drawn over x in ±18 and clipped, so they reach the stage edge on wide screens.
- Family labels in the segmented control are plain text (no LaTeX).
