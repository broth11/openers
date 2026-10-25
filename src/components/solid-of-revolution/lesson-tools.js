import { snap } from '../strips/index.js'
import { fmt } from '../../kit/math.js'
export const T = String.raw
export const commonParams = {
  pieceView: { type: 'seg', label: 'Show pieces', options: [['all', 'All pieces'], ['one', 'Selected only']], value: 'all' },
  n: { type: 'range', label: 'Pieces', min: 2, max: 40, step: 1, value: 8 },
  selected: { type: 'range', label: 'Selected piece', min: 0, max: 1, step: 0.01, value: 0.55, sel: true,
    show: (v, all) => `${snap(0, 1, all.n, v).i + 1} of ${all.n}` },
  angle: { type: 'range', label: 'Turn about the axis', min: 0, max: 360, step: 1, value: 360, show: (v) => `${v}°` },
}
export const emptyWork = () => ({ blocks: [], note: 'Write your prediction before revealing the working.' })
export const noKeys = () => ({ sections: [] })
// fx-CG50 key helpers. Key names are the physical key legends (kit: gdc-online-deck, gdc_slide.js).
export const k = (s) => `<span class="key">${s}</span>`
export const e = (s) => `<span class="entry">${s}</span>`
export const PI = `${k('SHIFT')} ${k('×10ˣ')} (π)`
export const X = k('X,θ,T')

// One Run-Matrix ∫dx section, from the verified template: [OPTN] [F4] CALC [F4] ∫dx, cursor starts in the
// integrand, [→] to the lower then the upper limit, one more [→] first after an exponent box.
// π is typed INSIDE the integrand, so the display is the volume itself (typing it outside, or forgetting it,
// shows the plain integral). `leave` is the extra [→] step, only for an integrand that ends in an exponent.
// `again` is for a second integral in the same panel: no need to reopen Run-Matrix.
export function integralSection({ goal, typing, leave = false, lo, hi, shows, again = false }) {
  return {
    goal,
    steps: [
      ...(again
        ? [`${k('OPTN')} ${k('F4')} (CALC) ${k('F4')} (∫dx) again. You are still in Run-Matrix`]
        : [
          `${k('MENU')} ${k('1')}: Run-Matrix. Wait for the screen before pressing anything else`,
          `${k('OPTN')} ${k('F4')} (CALC) ${k('F4')} (∫dx). The template ∫□□ □ dx opens with the cursor in the integrand`,
        ]),
      `Type ${typing}`,
      ...(leave ? [`${k('→')} once to leave the exponent box`] : []),
      `${k('→')} lower limit ${e(lo)}, ${k('→')} upper limit ${e(hi)}`,
      `${k('EXE')}${shows ? `. The display shows ${shows}` : ''}`,
    ],
  }
}
// A panel with one integral: its display goes in `out`, under the section.
export function integralKeys({ goal, typing, leave, lo, hi, out, watch }) {
  return { sections: [integralSection({ goal, typing, leave, lo, hi })], out, watch }
}
export const sliceReadout = (a, b, v, axis) => {
  const t = snap(a, b, v.n, a + (b - a) * v.selected)
  return `$${axis}_i=${fmt(t.m, 3)},\\quad\\Delta ${axis}=${fmt(t.h, 3)}$`
}
