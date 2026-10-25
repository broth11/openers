# Solid of revolution

Paired house-style SVG profile and genuine shaded three.js solid. First used by MAI HL
U11 L10 (discs and stretches) and L11 (hemisphere bowl), October 2026.

`revolution(options)` returns `{ id, profile, solid }` for the `three` engine. The SVG
and WebGL views share the same `snap()` partition, slice index, midpoint, radius functions,
and interval. `selected` is an axial coordinate; the lesson controls use a normalised 0–1
position, translated by the engine when dragging the actual SVG strip.

```js
import { revolution } from '../../components/solid-of-revolution/index.js'
const spec = revolution({
  id: 'disc', axis: 'x', a: 0, b: 4, outer: Math.sqrt, inner: () => 0,
  n: 8, selected: 2, angle: 360, revealed: shown('disc'),
  bounds: { left: -0.6, right: 4.8, bottom: -0.6, top: 2.8 },
  scale: 4.5,
})
```

## Options

- `axis`: `x` or `y`. Radii are nonnegative distances, not signed function values.
- `outer(t)`, `inner(t)`: radii measured from that axis, with `0 ≤ inner ≤ outer`.
- `sign: -1`: start the generating profile on the negative side of the axis.
- `a`, `b`, `n`, `selected`: interval, partition, actual selected piece.
- `angle`: mathematical sweep, degrees. `turnEnabled: false` hides Play in fixed full-turn scenes.
- `revealed`: hides generated geometry AND its view controls until the prediction reveal.
- `stack`: draw actual midpoint discs/washers; otherwise show a smooth swept solid.
- `pieces`: show matching representative strip and slice. Disable when they add no information.
- `cutaway`: omit a quarter of the displayed revolution and draw radial material faces.
  It is a display section, not a change to the mathematical volume. State that on screen.
- `scale`, `center`: fixed camera framing, in world units. Do not refit on slider changes.
- `reference`: optional original profile/interval drawn as a faint reference mesh.
- `profile`, `bounds`, `labels`, `extra`: SVG profile visibility, fixed bounds, shared labels,
  and additional SVG items. Reveal any completed models and calculated labels explicitly.

## Engine behaviour

`src/kit/three.js` implements apply/clear/destroy/resize, hosts the existing SVG engine,
projects 3D anchors to the existing label placer, and uses OrbitControls. Drag changes the
camera; Play/angle changes the mathematical sweep. Reset view restores the camera, while
the shell's Reset resets lesson predictions and all controls. Front and End-on are view presets.
Libraries and MathLive fonts are locally bundled in the standalone HTML.

The exported `sweptGeometry()` creates outer and inner surfaces, annular ends and radial
section faces. It never caps a cavity with an opaque full disc. Use the face and solid roles
from style.js, with orange reserved for the selected piece. The material appearance follows
the approved Pearson hybrid: blue generating profile, green faces, shaded material, clear cavity.

## Pitfalls and checks

- Sqrt(x) midpoint disc sums already give exactly 8π on [0,4]. Increasing n improves the shape;
  never invent changing numerical convergence. Explain this after the total is revealed.
- At a piecewise cavity bottom, choose partitions that have an actual edge there. The bowl uses
  n = 3,6,...,36 on [0,3], so no selected washer straddles y=1.
- Full mathematical volumes still apply when a cutaway is displayed.
- Use `\\mathrm{...}` in MathLive subscripts; `\\rm` is unsupported by this renderer.
- Axis arrow restrictions may be per-axis: `{ nonnegative: { x: false, y: true } }` supports
  a complete left/right bowl cross-section without an unnecessary downward y arrow.
- Run `qa/verify-u11-l10-l11.py`, the shared layout matrix for both keys, and
  `qa/check-revolutions.mjs` (orbit, animation, reveal gating, slice matching, cavity and mobile).
  Browser tests accept OPENERS_CHROME; Playwright must be available locally or via NODE_PATH.
