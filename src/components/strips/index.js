// Strips: the rectangles behind areas, Riemann sums, and integration openers.
// See README.md in this folder for options, an example, and pitfalls.
//
// All functions work in maths units and return plain data, so any engine can draw the result:
// the SVG engine takes items of type 'rects' and 'rect' directly (see toItems below).

// n equal strips from a to b: width h, left edges L, midpoints m
export function midpoints(a, b, n) {
  const h = (b - a) / n
  return {
    h,
    m: Array.from({ length: n }, (_, i) => a + (i + 0.5) * h),
    L: Array.from({ length: n }, (_, i) => a + i * h),
  }
}

// The typical strip is always one of the drawn strips: the one under slider value p.
// It starts and stops on strip edges, so it never leaves [a, b], and uses that strip's midpoint.
export function snap(a, b, n, p) {
  const h = (b - a) / n
  const i = Math.max(0, Math.min(n - 1, Math.floor((p - a) / h)))
  const lo = a + i * h
  return { i, lo, hi: lo + h, m: lo + h / 2, h }
}

// Midpoint sum of len(t) over n strips on [a, b] (len may be negative: signed area)
export function midpointSum(len, a, b, n) {
  const { h, m } = midpoints(a, b, n)
  return m.reduce((acc, t) => acc + h * len(t), 0)
}

// Strip rectangles as [x1, x2, y1, y2].
//   dir 'v': vertical strips on x in [a, b], from lower(x) to upper(x)
//   dir 'h': horizontal strips on y in [a, b], from left(y) to right(y)
// lower/upper (or left/right) are evaluated at each strip's midpoint.
export function rects(dir, a, b, n, lo, hi) {
  const { h, m, L } = midpoints(a, b, n)
  return m.map((t, i) => (dir === 'v' ? [L[i], L[i] + h, lo(t), hi(t)] : [lo(t), hi(t), L[i], L[i] + h]))
}

// The typical strip as one rectangle [x1, x2, y1, y2], snapped to the strip under p
export function typical(dir, a, b, n, p, lo, hi) {
  const t = snap(a, b, n, p)
  const r = dir === 'v' ? [t.lo, t.hi, lo(t.m), hi(t.m)] : [lo(t.m), hi(t.m), t.lo, t.hi]
  return { ...t, rect: r }
}

// SVG engine items for a strip set and its typical strip.
// drag: { param, axis } makes the typical strip draggable (axis 'x' for vertical strips, 'y' for horizontal).
export function toItems({ dir, a, b, n, p, lo, hi, drag, opacity }) {
  const items = [{ type: 'rects', items: rects(dir, a, b, n, lo, hi), ...(opacity !== undefined ? { opacity } : {}) }]
  let t = null
  if (p !== undefined) {
    t = typical(dir, a, b, n, p, lo, hi)
    const [x1, x2, y1, y2] = t.rect
    items.push({ type: 'rect', x1, x2, y1, y2, ...(drag ? { drag } : {}) })
  }
  return { items, typical: t }
}
