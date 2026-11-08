// House styles for the concept picture (comparison, 8 November 2026). Every engine (house SVG, JSXGraph,
// Function-Plot, Plotly) and the number-line track read the same theme. Concept modules keep using the
// role colours from src/kit/style.js; the shell maps each role colour to the theme's colour before drawing.
import { COLORS } from '../kit/style.js'

export const THEMES = {
  haese: {
    name: 'Haese classic', dark: false,
    bg: '#ffffff', card: '#ffffff', text: '#0e2233', ink: COLORS.ink, tick: COLORS.tick,
    grid: COLORS.grid, gridOpacity: 0.55, gridDash: 'dot', gridWidth: 1.2,
    mathFont: "'STIX Two Text', 'Cambria Math', serif", tickFont: "'STIX Two Text', serif", tickSize: 17,
    label: { bg: '#ffffff', border: '#000000', radius: 6, weight: 600 },
    roles: { teal: COLORS.teal, coral: COLORS.coral, sel: COLORS.sel, strip: COLORS.strip, muted: COLORS.muted, ink: COLORS.ink },
    areaOpacity: 1, curveScale: 1,
  },
  chalk: {
    name: 'Chalkboard', dark: true,
    bg: '#1f2d27', card: '#1f2d27', text: '#e9f0ea', ink: '#e9f0ea', tick: '#c9d6cd',
    grid: '#e9f0ea', gridOpacity: 0.16, gridDash: 'solid', gridWidth: 1,
    mathFont: "'STIX Two Text', serif", tickFont: "'STIX Two Text', serif", tickSize: 17,
    label: { bg: 'transparent', border: 'transparent', radius: 0, weight: 600 },
    roles: { teal: '#86dcc6', coral: '#f6a28f', sel: '#ffd36e', strip: '#9fcbff', muted: '#a9b8ae', ink: '#e9f0ea' },
    areaOpacity: 0.8, curveScale: 1.1,
  },
  print: {
    name: 'Print minimal', dark: false,
    bg: '#ffffff', card: '#ffffff', text: '#1b1b1b', ink: '#3a3a3a', tick: '#555555',
    grid: '#000000', gridOpacity: 0, gridDash: 'none', gridWidth: 0,
    mathFont: "'STIX Two Text', serif", tickFont: "'Lexend', system-ui, sans-serif", tickSize: 13,
    label: { bg: 'transparent', border: 'transparent', radius: 0, weight: 400 },
    roles: { teal: '#1b1b1b', coral: '#b23a2b', sel: '#d9822b', strip: '#2a64a8', muted: '#8a8a8a', ink: '#3a3a3a' },
    areaOpacity: 0.55, curveScale: 0.6,
  },
  midnight: {
    name: 'Midnight', dark: true,
    bg: '#0d1722', card: '#0d1722', text: '#dfe8f1', ink: '#dfe8f1', tick: '#b9c7d4',
    grid: '#3b6a95', gridOpacity: 0.45, gridDash: 'solid', gridWidth: 1,
    mathFont: "'STIX Two Text', serif", tickFont: "'STIX Two Text', serif", tickSize: 16,
    label: { bg: '#0d1722', border: '#3b6a95', radius: 999, weight: 600 },
    roles: { teal: '#58c4dd', coral: '#fc6255', sel: '#f4d35e', strip: '#83c167', muted: '#8aa1b5', ink: '#dfe8f1' },
    areaOpacity: 0.85, curveScale: 0.9,
  },
  paper: {
    name: 'Graph paper', dark: false,
    bg: '#fbf6e9', card: '#fbf6e9', text: '#2f2b26', ink: '#2f2b26', tick: '#4a4339',
    grid: '#7fb3e0', gridOpacity: 0.7, gridDash: 'solid', gridWidth: 0.9,
    mathFont: "'STIX Two Text', serif", tickFont: "'STIX Two Text', serif", tickSize: 16,
    label: { bg: '#fbf6e9', border: '#2f2b26', radius: 3, weight: 600 },
    roles: { teal: '#1f6f8b', coral: '#d1495b', sel: '#e39b2d', strip: '#00798c', muted: '#7d7468', ink: '#2f2b26' },
    areaOpacity: 0.9, curveScale: 1,
  },
  // The lesson deck builder's default theme (skill/openers-slide-deck/assets/themes/3b1b.json): black ground,
  // Manim colour constants, a receding #333 grid, Computer Modern (MathLive ships the KaTeX fonts), no panels.
  deck: {
    name: 'Deck builder (3Blue1Brown)', dark: true,
    bg: '#000000', card: '#000000', text: '#E4E4E4', ink: '#FFFFFF', tick: '#A0A0A0',
    grid: '#333333', gridOpacity: 1, gridDash: 'solid', gridWidth: 1,
    mathFont: "'KaTeX_Main', 'Latin Modern Roman', serif", tickFont: "'KaTeX_Main', 'Latin Modern Roman', serif", tickSize: 17,
    label: { bg: 'transparent', border: 'transparent', radius: 0, weight: 400 },
    roles: { teal: '#58C4DD', coral: '#FC6255', sel: '#FFFF00', strip: '#83C167', muted: '#A0A0A0', ink: '#FFFFFF' },
    areaOpacity: 0.6, curveScale: 0.75,
  },
}

// role colour (lower-case hex from style.js) -> role name
const ROLE_OF = new Map(Object.entries({ teal: COLORS.teal, coral: COLORS.coral, sel: COLORS.sel, strip: COLORS.strip, muted: COLORS.muted, ink: COLORS.ink }).map(([k, v]) => [v.toLowerCase(), k]))
export const recolour = (c, th) => (c && ROLE_OF.has(String(c).toLowerCase()) ? th.roles[ROLE_OF.get(String(c).toLowerCase())] : c)

// a graph spec in the theme: role colours swapped, area opacity scaled, line widths scaled, theme attached
export function themedGraph(spec, th) {
  return {
    ...spec,
    theme: th,
    items: spec.items.map((it) => ({
      ...it,
      color: recolour(it.color, th),
      ...(it.type === 'area' ? { opacity: (it.opacity ?? 0.2) * th.areaOpacity } : {}),
      ...(it.type === 'curve' && it.width ? { width: Math.max(1.5, it.width * th.curveScale) } : {}),
    })),
    labels: (spec.labels || []).map((lb) => ({ ...lb, color: recolour(lb.color, th) })),
  }
}
export const themedTrack = (spec, th) => ({ ...spec, theme: th })
