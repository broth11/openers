# Engines

A lesson names its engine (`engine: 'svg'` by default). The shell looks it up in the `ENGINES` table at the top of `src/main.js`.

## The interface every engine implements

```js
makeEngine(host, { renderLabel, onDrag }) -> {
  engine: 'name',
  apply(spec),   // draw the scene's graph spec; called on every change, so only redraw what changed if it is costly
  clear(),       // remove everything the lesson drew
  destroy(),     // remove the engine from the page
  resize(),      // optional
}
```

- `renderLabel(text)` turns `$maths$` text into markup; use it for labels so they match the rest of the page.
- `onDrag(param, value)` sets a control's value when the student drags something; the shell clamps and rounds it to the control's step.
- Read colours and weights from `src/kit/style.js` and place labels with `src/kit/labels.js`, so every engine looks the same.

## SVG (ready)

`src/kit/svg.js`. Hand-built, no library. Draws the house grid, axes, ticks, and the item types listed in `docs/OPENERS.md`. Use it for anything 2D.

## Adding JSXGraph (when a lesson first needs it)

1. `npm install jsxgraph` (pin the version) and write `src/kit/jsxgraph.js` implementing the interface above.
2. Hide JSXGraph's own grid and axes and draw the house furniture (dotted teal grid, arrowheads, origin circle, STIX ticks) from `style.js`, the same way the SVG engine does.
3. Keep labels in the shared placer, not JSXGraph text, so they look and behave the same.
4. Register it in `ENGINES`, add a row to `docs/CATALOG.md`, and note any pitfalls here.

Useful parts: `functiongraph`, `curve`, `glider` (point locked to a curve), `intersection`, `tangent`, `riemannsum`, `integral`, `implicitcurve` (from v1.7.0, equation as JessieCode text), 3D view.

## Adding three.js (when a lesson first needs 3D)

1. `npm install three` (pin the version) and write `src/kit/three.js` implementing the interface, with orbit controls and the house colours.
2. Labels: project 3D anchor points to the screen and place them with the shared placer.
3. Build the first 3D scene as a component (for example `components/solid-of-revolution/`) so the next 3D opener reuses it.

## Artifacts

Every engine must work in a single-file artifact build: no network requests at run time (bundle libraries, do not load them from a CDN), fonts from Google Fonts only.
