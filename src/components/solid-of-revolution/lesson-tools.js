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
export const noKeys = () => ({ sections: [], out: 'Predict first. Reveal the integral before using the calculator.' })
// Verified integral template and exponent exit from docs/OPENERS.md. No new menu paths.
export function integralKeys({ integrand, lo, hi, out, note = 'Multiply the integral result by π. Volume uses cubic units.' }) {
  return {
    sections: [{ goal: 'Evaluate the volume', steps: [
      'Open Run-Matrix from the main menu.',
      '<span class="key">OPTN</span> <span class="key">F4</span> CALC <span class="key">F4</span> ∫dx.',
      `Enter $${integrand}$ as the integrand, using X for the variable.`,
      'After an exponent, press → to leave its box. Press → to move to the lower limit, then → to the upper limit.',
      `Enter lower limit ${lo} and upper limit ${hi}, then press EXE. Multiply the result by π.`,
    ] }], out, watch: note,
  }
}
export const sliceReadout = (a, b, v, axis) => {
  const t = snap(a, b, v.n, a + (b - a) * v.selected)
  return `$${axis}_i=${fmt(t.m, 3)},\\quad\\Delta ${axis}=${fmt(t.h, 3)}$`
}
