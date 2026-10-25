# Catalog

Everything the kit can already do. Read this before building a new opener, and add to it whenever you build something reusable (same commit).

## Engines

| Engine | Status | Use for | Where |
|---|---|---|---|
| SVG | Ready (default) | Graphs of functions, regions, strips, dragging, diagrams that are not graphs | `src/kit/svg.js` |
| JSXGraph | Planned | Live geometry constructions, points on curves, implicit curves (`implicitcurve`), slope fields | add on first use, see `docs/ENGINES.md` |
| three.js | Planned | Shaded 3D solids, volumes of revolution, planes | add on first use, see `docs/ENGINES.md` |

## Shared kit

| Piece | What it does | Where |
|---|---|---|
| House style | Colours and line weights by role; grid step rule; π tick labels | `src/kit/style.js` |
| Label placer | House-style labels that avoid curves, points, ticks, and each other | `src/kit/labels.js` |
| Maths helpers | MathLive rendering (`tex`, `md`), exact fractions (`Frac`), number formatting (`fmt`, `num`) | `src/kit/math.js` |
| Shell | Menu, scenes, questions and reveals, controls, readout, working and Casio panel, keys, deep links | `src/main.js`, `src/shell.css`, `index.html` |
| Layout check | Every scene, reveal, slider, and size; stability sweep | `qa/check.mjs` |

## Components

| Component | What it does | First used | README |
|---|---|---|---|
| Strips | Riemann and midpoint strips, vertical or horizontal; the snapped typical strip; midpoint sums; SVG items | U11 L9 | `src/components/strips/README.md` |

## Openers

| Lesson | Title | Engine | Components |
|---|---|---|---|
| MAI HL U11 L9 | Area between a curve and the y-axis | SVG | Strips |

## Wanted next (from the syllabus survey, 2026-10-25)

Build each one the first time a lesson needs it, as a component with its own README:
volumes of revolution (three.js), 3D lines and planes, Voronoi diagrams (d3-delaunay), networks and graph algorithms, Markov state diagrams, slope fields and Euler's method, sampling distributions and confidence intervals, tree and Venn diagrams, log-log and semi-log axes, unit circle and the ambiguous case, complex plane rotations, matrix transformations, typed equations (MathLive input to JSXGraph).
