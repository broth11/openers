# Catalog

Everything the kit can already do. Read this before building a new opener, and add to it whenever you build something reusable (same commit).

## Engines

| Engine | Status | Use for | Where |
|---|---|---|---|
| SVG | Ready (default) | Graphs of functions, regions, strips, dragging, diagrams that are not graphs | `src/kit/svg.js` |
| JSXGraph | Planned | Live geometry constructions, points on curves, implicit curves (`implicitcurve`), slope fields | add on first use, see `docs/ENGINES.md` |
| three.js | Ready (0.180.0, bundled) | Shaded solids of revolution, orbit, partial turns, cutaways | `src/kit/three.js` |

## Shared kit

| Piece | What it does | Where |
|---|---|---|
| House style | Colours and line weights by role; grid step rule; π tick labels | `src/kit/style.js` |
| Label placer | House-style labels that avoid curves, points, ticks, and each other | `src/kit/labels.js` |
| Maths helpers | MathLive rendering (`tex`, `md`), exact fractions (`Frac`), number formatting (`fmt`, `num`) | `src/kit/math.js` |
| Shell | Menu, scenes, questions and reveals, recap cards (a scene with `cards` and no prompts), controls with optional Play, readout, working and Casio panel (calculator steps grouped under goal headings via `sections`), keys, deep links | `src/main.js`, `src/shell.css`, `index.html` |
| Walk timeline | A walk lesson (`walk: true`) as one flat list of beats: built from the prompts, folded to the state at any beat, drawn as a coloured bottom bar with pause, scrub, and snap-back | `src/kit/timeline.js`, `src/main.js`, `docs/OPENERS-WALK.md` |
| Layout check | Every scene, reveal, slider, and size; stability sweep. Walk lessons also get the timeline, split, determinism, pause, and animation checks | `qa/check.mjs`, `qa/walk-check.mjs` |

## Components

| Component | What it does | First used | README |
|---|---|---|---|
| Strips | Riemann and midpoint strips, vertical or horizontal; the snapped typical strip; midpoint sums; SVG items | U11 L9 | `src/components/strips/README.md` |
| Information board | Given-information cards before a graph/model reveal | U5 L1 | `src/components/info-board/README.md` |
| Projectile height graph | Observations, revealed flights, time cursors, maxima, and ground-contact comparisons | U5 L1 | `src/components/projectile/README.md` |
| Solid of revolution | Paired SVG profiles and shaded discs, washers, cavities, partial turns and orbit | U11 L10/L11 | `src/components/solid-of-revolution/README.md` |
| Context stage | A drawn, animated scene beside the graph on a shared vertical scale (mall crowd, jelly-bean jars, lamp and light meter with the square-spread diagram, cooling coffee with thermometer, typing laptop with wpm gauge, pH strip) | U5 L2, U5 L3 | `src/components/context-stage/README.md` |
| Growth family | Exponential `ka^x+c`, `ke^(rx)+c` and logarithmic `a+b ln x` with asymptote, initial value, half-life or doubling time, and the inverse reflected in `y = x`: recap cards | U5 L3 | `src/components/growth-family/README.md` |
| Polynomial explorer | Degree 2 to 4, factored or standard form, draggable roots, repeated roots, end-behaviour arrows, turning points, recap cards | U5 L2 | `src/components/polynomial/README.md` |
| Power family | `y = kx^n` for positive and negative n: doubling markers, ratio and product tests, asymptotes, recap cards | U5 L2 | `src/components/power-family/README.md` |

## Openers

| Lesson | Title | Engine | Components |
|---|---|---|---|
| MAI HL U11 L9 | Area between a curve and the y-axis | SVG | Strips |
| MAI HL U5 L1 | Three flights, three forms | SVG | Information board, Projectile height graph |
| MAI HL U11 L10 | Discs and stretches | three.js + SVG | Solid of revolution, Strips |
| MAI HL U11 L11 | A hemisphere bowl | three.js + SVG | Solid of revolution, Strips |
| MAI HL U5 L3 | Exponential and logarithmic models, log scales (walk-through) | SVG | Context stage, Growth family |
| MAI HL U5 L2 | Cubic fitting, direct and inverse variation | SVG | Context stage, Polynomial explorer, Power family |

## Wanted next (from the syllabus survey, 2026-10-25)

Build each one the first time a lesson needs it, as a component with its own README:
3D lines and planes, Voronoi diagrams (d3-delaunay), networks and graph algorithms, Markov state diagrams, slope fields and Euler's method, sampling distributions and confidence intervals, tree and Venn diagrams, log-log and semi-log axes, unit circle and the ambiguous case, complex plane rotations, matrix transformations, typed equations (MathLive input to JSXGraph).
