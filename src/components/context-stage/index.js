// Context stage: a drawn, animated scene beside the graph (the Periodic Models Explorer pattern).
// A lesson's graph() returns scene: { frac, draw(api) } alongside its usual spec; the SVG engine
// reserves the left part of the stage (the top part below 640 px wide) and calls draw with:
//   api.el(tag, attrs, parent?)   create an SVG element (inside the scene's clipped group by default)
//   api.g                         the scene's group
//   api.x, api.y, api.w, api.h    the scene's rectangle in px
//   api.Y(value)                  the graph's vertical scale (shared beside the graph; its own scale over
//                                 the same range when stacked above the graph)
//   api.stacked                   true on narrow screens
// The helpers below are shared by every scene. See README.md.

export { PALETTE, PEOPLE, BEANS, rand, person, label } from './shared.js'
export { drawMall } from './mall.js'
export { drawJars } from './jars.js'
export { drawLamp } from './lamp.js'
