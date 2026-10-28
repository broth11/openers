# Context stage

A drawn, animated scene beside the graph, after the Periodic Models Explorer: the scene sits on the left and the graph on the right, and one slider drives both. First used in MAI HL U5 L2 (mall, jars, lamp).

## How a lesson uses it

A scene's `graph()` returns its usual spec plus `scene: { frac, draw(api) }`. The SVG engine gives the left `frac` of the stage (default 0.4) to the scene and fits the graph in the rest. Below 640 px wide (a phone, or a desktop with the working panel open) the scene moves above the graph.

`draw(api)` receives:

| Field | Meaning |
|---|---|
| `el(tag, attrs, parent?)` | Create an SVG element, inside the scene's clipped group by default |
| `g` | The scene's group |
| `x, y, w, h` | The scene's rectangle in px |
| `Y(value)` | The graph's vertical scale beside the graph (so a level in the scene lines up with the graph), or the same value range over the scene's own height when stacked |
| `stacked` | True when the scene is above the graph |

The scene is redrawn on every change, so it animates with any slider. Give the slider `play: { seconds }` to add a Play button beside it.

## Drawings

| Drawing | Call | Notes |
|---|---|---|
| Mall | `drawMall(api, { V, clock, t, tEnd, roofV, unit })` | Shoppers fill the building up to `Y(V)`; a dashed level line and count follow. The sky turns to evening over the last 40% of the day. The crowd stops at the roof, the level line does not. |
| Jars | `drawJars(api, { ref, jar, target, maxCm })` | Cylindrical jars to scale with jelly beans at a fixed size on screen, so a bigger jar holds visibly more. `target` draws a dashed empty jar with a question mark for a prediction. Height and width dimension lines are drawn for every jar. |
| Lamp | `drawLamp(api, { d, I, maxD, spread })` | Lamp, light meter on a stand on a metre rule, a beam whose brightness follows `I`, and a distance arrow. `spread: true` adds the square-spread diagram (1, 4, and 9 squares at d, 2d, and 3d). |

Shared helpers in `shared.js`: `PALETTE`, `PEOPLE` and `BEANS` colours, `rand(i, salt)` (deterministic, so redraws never shuffle), `person()`, and `label()` (UI font text with a white halo; `halo: false` for text on a dark display).

## Rules

- Scenes use the UI font and the palette here; graph colours still come from `kit/style.js`.
- A scene must not give away an answer before its reveal: draw the prediction state (an empty target jar, the meter fixed at the given distance) until the matching prompt is revealed.
- Keep scene text short; it is clipped to the scene's rectangle.

## Pitfalls met

- The SVG clips everything mathematical to the graph's rectangle, so y tick numbers need room left of the y-axis: give `bounds.left` enough negative room (about 10% of the x range).
- Labels for the graph are placed in an overlay over the graph's rectangle only, so they never drift into the scene.

## Added for U5 L3

| Drawing | Call | Notes |
|---|---|---|
| Coffee | `drawCoffee(api, { T, t, top })` | Cup whose steam fades as `T` falls; thermometer on the graph's Y scale; `t` and `T` readouts. |
| Typing | `drawTyping(api, { S, h, top })` | Laptop with a growing block of text lines; words-per-minute gauge on the graph's Y scale. |
| pH strip | `drawPhStrip(api, { foods, marker, top })` | Coloured pH strip (0 to 8) with foods at their pH and a marker that follows the slider. |
