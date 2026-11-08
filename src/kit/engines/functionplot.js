// Function-Plot engine (D3) for the house graph spec. It redraws the whole chart on every apply, which is how
// the library works. Areas are closed polylines (Function-Plot fills a closed path down to y = 0, so an area
// between f and 0 is drawn as its upper and lower edges, each closed). It has no draggable points, so handles
// are drawn as points and the sliders do the moving. Labels use its text graph type (plain Unicode).
import functionPlot from 'function-plot'
import { COLORS } from '../style.js'
import { curvePoints, plainMath } from './shared.js'

export function makeFunctionPlotGraph(host) {
  const div = document.createElement('div')
  div.className = 'eng-host fplot-host'
  host.append(div)
  let last = null

  function edge(a, which, n = 120) {
    const pts = []
    for (let i = 0; i <= n; i++) { const t = a.from + ((a.to - a.from) * i) / n; pts.push([t, which === 'hi' ? a.hi(t) : a.lo(t)]) }
    return pts
  }

  function apply(spec) {
    last = spec
    const b = spec.bounds
    const T = spec.theme || {}
    Object.entries({ '--fp-bg': T.bg || '#fff', '--fp-ink': T.ink || COLORS.ink, '--fp-tick': T.tick || COLORS.tick, '--fp-grid': T.grid || COLORS.grid,
      '--fp-grid-op': T.gridDash === 'none' ? 0 : (T.gridOpacity ?? 0.45), '--fp-grid-dash': T.gridDash === 'solid' ? 'none' : '1.5 3.5', '--fp-tick-font': T.tickFont || 'STIX Two Text, serif' })
      .forEach(([k, v]) => div.style.setProperty(k, v))
    const data = []
    const fill = (it) => ({ 'fill-opacity': it.opacity ?? 0.2, 'stroke-width': 0 })
    for (const it of spec.items) {
      if (it.type === 'area') {
        for (const which of ['hi', 'lo']) data.push({ fnType: 'points', graphType: 'polyline', closed: true, points: edge(it, which), color: it.color, attr: fill(it), skipTip: true })
      } else if (it.type === 'curve') {
        data.push({ fnType: 'points', graphType: 'polyline', points: curvePoints(it), color: it.color, attr: { 'stroke-width': it.width || 4, 'stroke-dasharray': it.dash ? '8 6' : null }, skipTip: true })
      } else if (it.type === 'line') {
        data.push({ fnType: 'points', graphType: 'polyline', points: [[it.x1, it.y1], [it.x2, it.y2]], color: it.color, attr: { 'stroke-width': it.width || 2, 'stroke-dasharray': it.dash ? '6 5' : null }, skipTip: true })
      } else if (it.type === 'points' || it.type === 'handle') {
        const pts = it.type === 'points' ? it.pts : [[it.x, it.y]]
        data.push({ fnType: 'points', graphType: 'scatter', points: pts, color: it.color, attr: { r: it.type === 'handle' ? 7 : (it.r || 6) }, skipTip: true })
      }
    }
    for (const lb of spec.labels || []) data.push({ graphType: 'text', location: [lb.x, lb.y], text: plainMath(lb.html), color: lb.color, attr: { 'font-size': 19, 'font-family': 'STIX Two Text, serif', 'font-weight': 600 } })
    div.replaceChildren()
    functionPlot({
      target: div, width: host.clientWidth, height: host.clientHeight, grid: true, disableZoom: true,
      xAxis: { domain: [b.left, b.right], label: spec.axes?.x || 'x' }, yAxis: { domain: [b.bottom, b.top], label: spec.axes?.y || 'y' },
      tip: { xLine: false, yLine: false, renderer: () => '' }, data,
    })
  }

  const ro = new ResizeObserver(() => { if (last) apply(last) })
  ro.observe(host)
  return {
    engine: 'function-plot',
    apply,
    clear() { div.replaceChildren() },
    destroy() { ro.disconnect(); div.remove() },
  }
}

