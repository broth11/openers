// House style for opener graphs, shared by every engine (SVG now; JSXGraph and three.js when added).
// Change a weight or colour here and every opener follows. A lesson may override one role on one
// expression (lineWidth, fillOpacity, ...), but should not invent new colours.
//
// Values started from the SVG comparison version (2026-10-25) and are tuned by eye on the projector.

export const COLORS = {
  solid: '#659aab', // shaded material
  face: '#98c89c', // circular and cut faces, Pearson hybrid
  teal: '#0f8b8d', // curves (Haese variant)
  coral: '#e4572e', // second boundary
  sel: '#e8890c', // typical strip, its slider, answers
  strip: '#1572b8', // strips
  ink: '#0e2233', // axes, origin, axis titles
  tick: '#33485a', // tick numbers
  muted: '#55697b', // dashed guides, bound labels
  grid: '#0f8b8d', // dotted grid
}

// Walk-through timeline: one fixed colour per beat kind, always the same across lessons (Ben, 28 October
// 2026). Every value is an existing role: scene start is ink, a posed question is the strip blue, the
// payoff step is the answer orange, an animation is the curve teal, and a plain working step is muted.
// shell.css mirrors these as --k-* variables; keep the two in step.
export const BEAT_COLORS = {
  scene: COLORS.ink,
  pose: COLORS.strip,
  step: COLORS.muted,
  answer: COLORS.sel,
  animate: COLORS.teal,
}

// Line weights in screen pixels, by role.
export const ROLES = {
  grid: { lineWidth: 1.2, lineOpacity: 0.55, dotted: true },
  axis: { lineWidth: 1.6 },
  curve: { lineWidth: 4 },
  boundary: { lineWidth: 4 }, // a second boundary curve or line (y = 2)
  edge: { lineWidth: 5 }, // a boundary that lies on an axis (x = 0 as the region's edge)
  guide: { lineWidth: 2, dashed: true }, // dashed guides and bound lines
  strip: { lineWidth: 1.2, lineOpacity: 0.75, fillOpacity: 0.16 },
  typical: { lineWidth: 2.5, fillOpacity: 0.5 },
  region: { fillOpacity: 0.12 },
  point: { pointSize: 12 },
}

export const ORIGIN = { radius: 5.5, lineWidth: 1.3 } // open circle under the axes
export const ARROW = { length: 11, halfWidth: 4.5 } // arrowheads at all four axis ends, px
export const TICKS = { font: 17, minGap: 34 } // tick numbers px; grid lines at least this far apart

// Grid step for a given pixels-per-unit: whole units while the squares stay readable, then 2, 5, 10, ...
export function gridStep(ppu, minGap = TICKS.minGap) {
  const steps = [1, 2, 5, 10, 20, 50, 100]
  for (const s of steps) if (s * ppu >= minGap) return s
  return steps[steps.length - 1]
}

// π tick label as LaTeX: n·π/k in lowest terms (k = 2 gives π/2, π, 3π/2, ...)
export function piTex(n, k) {
  if (n === 0) return '0'
  const g = (a, b) => (b ? g(b, a % b) : Math.abs(a))
  const d = g(n, k)
  const num = n / d
  const den = k / d
  const sign = num < 0 ? '-' : ''
  const a = Math.abs(num)
  const top = a === 1 ? '\\pi' : `${a}\\pi`
  return den === 1 ? `${sign}${top}` : `${sign}\\frac{${top}}{${den}}`
}
