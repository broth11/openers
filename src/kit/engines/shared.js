// Helpers shared by the library engines (JSXGraph, Function-Plot, Plotly). Each engine takes the same graph
// spec as the house SVG engine (src/kit/svg.js): { bounds, axes, items, labels }. These helpers turn items into
// plain point lists, so each engine only has to draw polylines, polygons, points, and text.

export function polygonOf(a, n = 160) {
  const pts = []
  for (let i = 0; i <= n; i++) { const t = a.from + ((a.to - a.from) * i) / n; pts.push(a.var === 'y' ? [a.hi(t), t] : [t, a.hi(t)]) }
  for (let i = n; i >= 0; i--) { const t = a.from + ((a.to - a.from) * i) / n; pts.push(a.var === 'y' ? [a.lo(t), t] : [t, a.lo(t)]) }
  return pts
}
export function curvePoints(c) {
  const n = c.n || 240
  const pts = []
  for (let i = 0; i <= n; i++) pts.push(c.f(c.t[0] + ((c.t[1] - c.t[0]) * i) / n))
  return pts
}
export const xs = (pts) => pts.map((p) => p[0])
export const ys = (pts) => pts.map((p) => p[1])

// LaTeX in a label to plain Unicode text, for engines that cannot show MathLive markup (Plotly, Function-Plot).
export function plainMath(s) {
  return String(s)
    .replace(/\$([^$]+)\$/g, (m, t) => t
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
      .replace(/\\left|\\right/g, '')
      .replace(/\\int/g, '∫').replace(/\\approx/g, '≈').replace(/\\le/g, '≤').replace(/\\ge/g, '≥')
      .replace(/\\,|\\ |\\quad/g, ' ')
      .replace(/-/g, '−')
      .replace(/[{}]/g, ''))
}

// colour plus opacity as rgba(), for engines that take one fill string
export function rgba(hex, a) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
