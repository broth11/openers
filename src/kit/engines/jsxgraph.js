// JSXGraph engine for the house graph spec. Objects persist between applies (keyed by type and order), so a
// glider being dragged is never deleted mid-drag. Handles are gliders on the t-axis: true draggable points.
import JXG from 'jsxgraph'
import '../../../node_modules/jsxgraph/distrib/jsxgraph.css' // the package does not export its stylesheet
import { COLORS } from '../style.js'
import { polygonOf, curvePoints, xs, ys } from './shared.js'

let uid = 0
export function makeJsxGraph(host, { renderLabel, onDrag }) {
  const div = document.createElement('div')
  div.id = `jxg-${++uid}`
  div.className = 'eng-host jxg-host'
  host.append(div)
  let board = null
  let axisLine = null
  let bounds = null
  let dragging = null
  const objs = new Map() // key -> { obj, data }

  let themeId = null
  function ensureBoard(spec) {
    const b = spec.bounds
    const T = spec.theme || {}
    const same = bounds && b.left === bounds.left && b.right === bounds.right && b.top === bounds.top && b.bottom === bounds.bottom && themeId === (T.name || '')
    if (board && same) return
    themeId = T.name || ''
    div.style.background = T.bg || '#fff'
    if (board) { JXG.JSXGraph.freeBoard(board); objs.clear() }
    bounds = b
    board = JXG.JSXGraph.initBoard(div.id, {
      boundingbox: [b.left, b.top, b.right, b.bottom], keepAspectRatio: false, axis: false, grid: false,
      showCopyright: false, showNavigation: false, pan: { enabled: false }, zoom: { enabled: false, wheel: false },
      defaultAxes: {},
    })
    const ticks = (step) => ({ ticksDistance: step, insertTicks: false, minorTicks: 0, majorHeight: 8, drawLabels: true, drawZero: false,
      label: { offset: [-4, -14], anchorX: 'middle', fontSize: T.tickSize || 16, strokeColor: T.tick || COLORS.tick, cssStyle: `font-family: ${T.tickFont || 'STIX Two Text, serif'}` } })
    board.create('grid', [], { majorStep: [spec.axes?.xStep || 1, spec.axes?.yStep || 1], minorElements: 0, major: { face: 'line', strokeColor: T.grid || COLORS.grid, strokeOpacity: T.gridOpacity ?? 0.55, dash: T.gridDash === 'solid' ? 0 : 1, strokeWidth: T.gridDash === 'none' ? 0 : (T.gridWidth ?? 1.2), visible: T.gridDash !== 'none' } })
    board.create('axis', [[0, 0], [1, 0]], { strokeColor: T.ink || COLORS.ink, strokeWidth: 1.6, firstArrow: true, lastArrow: true, name: spec.axes?.x || 'x', withLabel: true,
      label: { position: 'rt', offset: [-12, 16], fontSize: 21, strokeColor: T.ink || COLORS.ink, cssStyle: 'font-style: italic; font-family: STIX Two Text, serif' }, ticks: { ...ticks(spec.axes?.xStep || 1), strokeColor: T.ink || COLORS.ink } })
    board.create('axis', [[0, 0], [0, 1]], { strokeColor: T.ink || COLORS.ink, strokeWidth: 1.6, firstArrow: true, lastArrow: true, name: spec.axes?.y || 'y', withLabel: true,
      label: { position: 'rt', offset: [10, -6], fontSize: 21, strokeColor: T.ink || COLORS.ink, cssStyle: 'font-style: italic; font-family: STIX Two Text, serif' },
      ticks: { ...ticks(spec.axes?.yStep || 1), label: { offset: [-10, 0], anchorX: 'right', fontSize: T.tickSize || 16, strokeColor: T.tick || COLORS.tick, cssStyle: `font-family: ${T.tickFont || 'STIX Two Text, serif'}` } } })
    axisLine = board.create('line', [[0, 0], [1, 0]], { visible: false, fixed: true })
  }

  function keep(key, make, update) {
    let e = objs.get(key)
    if (!e) { e = { obj: make() }; objs.set(key, e) } else update(e.obj)
    e.seen = true
    return e.obj
  }
  const dataCurve = (key, pts, attrs) => keep(key,
    () => { const c = board.create('curve', [xs(pts), ys(pts)], attrs); return c },
    (c) => { c.dataX = xs(pts); c.dataY = ys(pts); c.setAttribute(attrs) })

  function apply(spec) {
    ensureBoard(spec)
    board.suspendUpdate()
    for (const e of objs.values()) e.seen = false
    const count = {}
    const k = (t) => `${t}:${(count[t] = (count[t] || 0) + 1)}`
    for (const it of spec.items) {
      if (it.type === 'area') dataCurve(k('area'), polygonOf(it), { fillColor: it.color, fillOpacity: it.opacity ?? 0.2, strokeWidth: 0, highlight: false, fixed: true })
      else if (it.type === 'curve') dataCurve(k('curve'), curvePoints(it), { strokeColor: it.color, strokeWidth: it.width || 4, dash: it.dash ? 2 : 0, highlight: false, fixed: true, fillOpacity: 0 })
      else if (it.type === 'line') dataCurve(k('line'), [[it.x1, it.y1], [it.x2, it.y2]], { strokeColor: it.color, strokeWidth: it.width || 2, dash: it.dash ? 2 : 0, highlight: false, fixed: true })
      else if (it.type === 'points') it.pts.forEach(([x, y]) => keep(k('point'),
        () => board.create('point', [x, y], { name: '', fixed: true, size: (it.r || 6) / 1.6, fillColor: it.color, strokeColor: it.color, highlight: false }),
        (p) => p.setPosition(JXG.COORDS_BY_USER, [x, y])))
      else if (it.type === 'handle') {
        const key = `handle:${it.drag?.param}`
        keep(key, () => {
          const g = board.create('glider', [it.x, 0, axisLine], { name: '', size: 6, fillColor: spec.theme?.bg || '#fff', strokeColor: it.color, strokeWidth: 3, highlightFillColor: '#fff', highlightStrokeColor: it.color })
          g.on('down', () => { dragging = key })
          g.on('up', () => { dragging = null })
          g.on('drag', () => onDrag(it.drag.param, g.X()))
          return g
        }, (g) => { if (dragging !== key) g.setPosition(JXG.COORDS_BY_USER, [it.x, 0]) })
      }
    }
    for (const lb of spec.labels || []) {
      const off = { n: [0, 16], s: [0, -16], e: [12, 0], w: [-12, 0], ne: [10, 12], nw: [-10, 12], se: [10, -12], sw: [-10, -12] }[lb.pos || 'n'] || [0, 0]
      const html = renderLabel(lb.html)
      const L = spec.theme?.label || { bg: '#fff', border: '#000', radius: 6, weight: 600 }
      const css = `font-family: STIX Two Text, serif; font-weight: ${L.weight}; padding: 1px 7px; border-radius: ${L.radius}px; white-space: nowrap; background: ${L.bg}; border: 1px solid ${lb.plain ? 'transparent' : L.border};`
      keep(`label:${lb.id}`,
        () => board.create('text', [lb.x, lb.y, html], { display: 'html', parse: false, useMathJax: false, useKatex: false, fixed: true, anchorX: 'middle', anchorY: 'middle', offset: off, strokeColor: lb.color, fontSize: 19, cssStyle: css, highlight: false }),
        (t) => { t.setCoords(lb.x, lb.y); if (t.plaintext !== html) t.setText(html); t.setAttribute({ strokeColor: lb.color, offset: off, cssStyle: css }) })
    }
    for (const [key, e] of objs) if (!e.seen) { board.removeObject(e.obj); objs.delete(key) }
    board.unsuspendUpdate()
  }

  const ro = new ResizeObserver(() => { if (board) { board.resizeContainer(host.clientWidth, host.clientHeight, false, true); board.setBoundingBox([bounds.left, bounds.top, bounds.right, bounds.bottom], false); board.update() } })
  ro.observe(host)
  return {
    engine: 'jsxgraph',
    apply,
    clear() { if (board) { for (const e of objs.values()) board.removeObject(e.obj); objs.clear() } },
    destroy() { ro.disconnect(); if (board) JXG.JSXGraph.freeBoard(board); div.remove() },
  }
}
