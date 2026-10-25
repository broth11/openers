// Semantic paired view. Both renderers consume the SAME snapped partition and functions.
import { midpoints, snap } from '../strips/index.js'
import { COLORS as C } from '../../kit/style.js'

export function revolution({ id, axis = 'x', a = 0, b = 4, outer = Math.sqrt, inner = () => 0,
  n = 8, selected = 2, sign = 1, angle = 360, revealed = true, stack = false,
  cutaway = false, isolated = false, dimensions = false, bounds, labels = [], extra = [], profile = true, pieces = true,
  reference = null, turnEnabled = true, scale = 5, center = null, description = '' }) {
  isolated = isolated && pieces && profile
  const t = snap(a, b, n, selected)
  const { L, m, h } = midpoints(a, b, n)
  const xy = (s, r) => axis === 'x' ? [s, sign * r] : [sign * r, s]
  const rect = (lo, hi, mid) => axis === 'x'
    ? [lo, hi, sign * inner(mid), sign * outer(mid)]
    : [sign * inner(mid), sign * outer(mid), lo, hi]
  const hi = (s) => sign > 0 ? outer(s) : -inner(s)
  const low = (s) => sign > 0 ? inner(s) : -outer(s)
  const [x1, x2, y1, y2] = rect(t.lo, t.hi, t.m)
  return {
    id, description,
    profile: {
      bounds,
      axes: { nonnegative: sign > 0 },
      description: description || 'Generating region and a matching representative slice',
      items: [
        ...(profile ? [
          ...(!isolated ? [{ type: 'area', var: axis, from: a, to: b, lo: low, hi, color: C.teal, opacity: 0.14 }] : []),
          { type: 'curve', f: (s) => xy(s, outer(s)), t: [a, b], color: C.strip },
          { type: 'curve', f: (s) => xy(s, inner(s)), t: [a, b], color: C.coral, width: 2 },
          ...(pieces ? [
            ...(!isolated ? [{ type: 'rects', items: m.map((s, i) => rect(L[i], L[i] + h, s)) }] : []),
            { type: 'rect', x1, x2, y1, y2, drag: { param: 'selected', axis } },
          ] : []),
        ] : []),
        ...(dimensions && profile && pieces ? [
          { type: 'dim', from: xy(t.m, 0), to: xy(t.m, outer(t.m)), color: C.sel },
          { type: 'dim', from: xy(t.lo, outer(t.m) + 0.22), to: xy(t.hi, outer(t.m) + 0.22), color: C.sel },
        ] : []),
        ...extra,
      ],
      labels: [...labels, ...(dimensions && profile && pieces ? [
        { id: 'radius', x: axis === 'x' ? t.m : sign * outer(t.m) / 2, y: axis === 'x' ? sign * outer(t.m) / 2 : t.m, html: '$r$', color: C.sel, pos: axis === 'x' ? 'w' : 'n', plain: true, fixed: true },
        { id: 'thickness', x: axis === 'x' ? t.m : sign * (outer(t.m) + 0.22), y: axis === 'x' ? sign * (outer(t.m) + 0.22) : t.m, html: axis === 'x' ? '$\\Delta x$' : '$\\Delta y$', color: C.sel, pos: axis === 'x' ? 'n' : 'e', plain: true, fixed: true },
      ] : [])],
    },
    solid: { id, axis, a, b, outer, inner, n, typical: t, sign, angle,
      revealed, stack, cutaway, isolated, reference, turnEnabled, scale, center: center || (axis === 'x' ? [(a + b) / 2, 0, 0] : [0, (a + b) / 2, 0]),
      pieces: pieces && profile, description },
  }
}
