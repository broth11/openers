// Shared drawing helpers for context scenes.
export const PALETTE = {
  sky: '#eaf4fb', skyDusk: '#f6dcc4', night: '#c9d6ea', ground: '#c9d3dc', wall: '#f5f1ea', wallEdge: '#9aa8b4',
  glass: '#d6ecf7', ink: '#0e2233', muted: '#55697b', sel: '#e8890c', teal: '#0f8b8d', coral: '#e4572e', blue: '#1572b8',
  sun: '#f5b82e', wood: '#b88a5a', woodDark: '#8a6440', bench: '#d9c3a5', light: '#ffd75e',
}
export const PEOPLE = ['#1572b8', '#e4572e', '#0f8b8d', '#7b3fe0', '#d0457f', '#e8890c', '#33485a']
export const BEANS = ['#e4572e', '#f5b82e', '#0f8b8d', '#7b3fe0', '#d0457f', '#3fae4a', '#e8890c', '#1572b8']

// Deterministic pseudo-random numbers, so a redraw never shuffles the picture.
export function rand(i, salt = 0) {
  let x = (i + 1) * 374761393 + salt * 668265263
  x = (x ^ (x >>> 13)) * 1274126177
  x = x ^ (x >>> 16)
  return (x >>> 0) / 4294967295
}

// A small standing person, feet at (x, y), height h px.
export function person(api, parent, x, y, h, color) {
  const head = h * 0.2
  api.el('circle', { cx: x, cy: y - h + head, r: head, fill: color }, parent)
  api.el('path', { d: `M ${x - h * 0.2} ${y} L ${x - h * 0.2} ${y - h * 0.48} Q ${x - h * 0.2} ${y - h * 0.6} ${x} ${y - h * 0.6} Q ${x + h * 0.2} ${y - h * 0.6} ${x + h * 0.2} ${y - h * 0.48} L ${x + h * 0.2} ${y} Z`, fill: color }, parent)
}

// Text in the scene's UI font.
export function label(api, parent, x, y, text, { size = 14, weight = 500, fill = PALETTE.muted, anchor = 'start', mono = false, halo = true } = {}) {
  const n = api.el('text', { x, y, 'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor, 'font-family': mono ? 'JetBrains Mono, ui-monospace, monospace' : 'Lexend, system-ui, sans-serif', 'paint-order': 'stroke', stroke: halo ? '#fff' : 'none', 'stroke-width': 3 }, parent)
  n.textContent = text
  return n
}
