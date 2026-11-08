// Plotly.js engine for the house graph spec. Areas are filled polygons, curves are line traces, labels are
// annotations (plain Unicode: Plotly needs MathJax for LaTeX, which is not available offline). Handles are
// editable vertical line shapes, so they can be dragged along the t-axis.
import Plotly from 'plotly.js-dist-min'
import { COLORS } from '../style.js'
import { polygonOf, curvePoints, xs, ys, plainMath, rgba } from './shared.js'

export function makePlotlyGraph(host, { onDrag }) {
  const div = document.createElement('div')
  div.className = 'eng-host plotly-host'
  host.append(div)
  let handles = [] // shape index -> param
  let ready = false

  function apply(spec) {
    const b = spec.bounds
    const T = spec.theme || {}
    const L = T.label || { bg: '#fff', border: '#000', radius: 6 }
    const traces = []
    const shapes = []
    handles = []
    for (const it of spec.items) {
      if (it.type === 'area') {
        const p = polygonOf(it, 120)
        traces.push({ x: xs(p), y: ys(p), mode: 'lines', fill: 'toself', fillcolor: rgba(it.color, it.opacity ?? 0.2), line: { width: 0 }, hoverinfo: 'skip' })
      } else if (it.type === 'curve') {
        const p = curvePoints(it)
        traces.push({ x: xs(p), y: ys(p), mode: 'lines', line: { color: it.color, width: it.width || 4, dash: it.dash ? 'dash' : 'solid' }, hovertemplate: 't = %{x:.2f}<br>v = %{y:.2f}<extra></extra>' })
      } else if (it.type === 'line') {
        shapes.push({ type: 'line', x0: it.x1, x1: it.x2, y0: it.y1, y1: it.y2, line: { color: it.color, width: it.width || 2, dash: it.dash ? 'dash' : 'solid' }, editable: false })
      } else if (it.type === 'points') {
        traces.push({ x: it.pts.map((q) => q[0]), y: it.pts.map((q) => q[1]), mode: 'markers', marker: { color: it.color, size: (it.r || 6) * 2 }, hoverinfo: 'skip' })
      } else if (it.type === 'handle') {
        handles[shapes.length] = it.drag?.param
        shapes.push({ type: 'line', x0: it.x, x1: it.x, y0: b.bottom, y1: b.top, line: { color: it.color, width: 6 }, opacity: 0.35, editable: !!it.drag })
        traces.push({ x: [it.x], y: [0], mode: 'markers', marker: { color: T.bg || '#fff', size: 14, line: { color: it.color, width: 3 } }, hoverinfo: 'skip' })
      }
    }
    const axis = (range, step, title) => ({
      range, dtick: step, showgrid: T.gridDash !== 'none', gridcolor: rgba(T.grid || COLORS.grid, T.gridOpacity ?? 0.45), griddash: T.gridDash === 'solid' ? 'solid' : 'dot', gridwidth: T.gridWidth ?? 1.2,
      zeroline: true, zerolinecolor: T.ink || COLORS.ink, zerolinewidth: 1.6, showline: false, ticks: '', fixedrange: true,
      tickfont: { family: T.tickFont || 'STIX Two Text, serif', size: T.tickSize || 16, color: T.tick || COLORS.tick }, title: { text: '' }, _t: title,
    })
    const annotations = (spec.labels || []).map((lb) => ({
      x: lb.x, y: lb.y, text: plainMath(lb.html), showarrow: false, font: { family: 'STIX Two Text, serif', size: 19, color: lb.color },
      bgcolor: L.bg === 'transparent' ? 'rgba(0,0,0,0)' : L.bg, bordercolor: lb.plain || L.border === 'transparent' ? 'rgba(0,0,0,0)' : L.border, borderwidth: 1, borderpad: 2,
      xanchor: lb.pos?.includes('e') ? 'left' : lb.pos?.includes('w') ? 'right' : 'center',
      yanchor: lb.pos?.startsWith('n') ? 'bottom' : lb.pos?.startsWith('s') ? 'top' : 'middle',
    }))
    annotations.push(
      { x: b.right, y: 0, text: `<i>${spec.axes?.x || 'x'}</i>`, showarrow: false, xanchor: 'right', yanchor: 'bottom', font: { family: 'STIX Two Text, serif', size: 21, color: T.ink || COLORS.ink } },
      { x: 0, y: b.top, text: `<i>${spec.axes?.y || 'y'}</i>`, showarrow: false, xanchor: 'left', yanchor: 'top', xshift: 8, font: { family: 'STIX Two Text, serif', size: 21, color: T.ink || COLORS.ink } },
    )
    const layout = {
      margin: { l: 34, r: 8, t: 8, b: 26 }, paper_bgcolor: T.bg || '#fff', plot_bgcolor: T.bg || '#fff', showlegend: false, dragmode: false, hovermode: 'closest',
      xaxis: axis([b.left, b.right], spec.axes?.xStep || 1), yaxis: axis([b.bottom, b.top], spec.axes?.yStep || 1),
      shapes, annotations, width: host.clientWidth, height: host.clientHeight, transition: { duration: 0 },
    }
    delete layout.xaxis._t
    delete layout.yaxis._t
    Plotly.react(div, traces, layout, { displayModeBar: false, responsive: false, edits: { shapePosition: true }, scrollZoom: false })
    if (!ready) {
      ready = true
      div.on('plotly_relayout', (ev) => {
        for (const [key, val] of Object.entries(ev)) {
          const m = key.match(/^shapes\[(\d+)\]\.x0$/)
          if (m && handles[Number(m[1])]) {
            const x1 = ev[`shapes[${m[1]}].x1`] ?? val
            onDrag(handles[Number(m[1])], (val + x1) / 2)
          }
        }
      })
    }
  }

  const ro = new ResizeObserver(() => { if (ready) Plotly.relayout(div, { width: host.clientWidth, height: host.clientHeight }) })
  ro.observe(host)
  return {
    engine: 'plotly',
    apply,
    clear() { Plotly.purge(div) },
    destroy() { ro.disconnect(); Plotly.purge(div); div.remove() },
  }
}
