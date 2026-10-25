// Height against time, not a spatial basketball trajectory.
// Equations and data belong to the lesson; this component draws a flight and its observations.
export const height = (shot, t) => shot.a * t * t + shot.b * t + shot.c
export const peakTime = (shot) => -shot.b / (2 * shot.a)
export const peakHeight = (shot) => height(shot, peakTime(shot))
export const landingTime = (shot) => (-shot.b - Math.sqrt(shot.b ** 2 - 4 * shot.a * shot.c)) / (2 * shot.a)

export function flightGraph({ shots, time, guides = [], revealPeaks = false, revealLandings = false }) {
  const items = [...guides]
  const labels = []
  for (const shot of shots) {
    if (shot.reveal) {
      const land = landingTime(shot)
      items.push({ type: 'curve', f: (t) => [t, height(shot, t)], t: [0, land], color: shot.color })
      const anchor = shot.labelAt ?? 0.95
      labels.push({ id: `curve-${shot.id}`, x: anchor, y: height(shot, anchor), html: `$h_${shot.id}(t)$`, color: shot.color, pos: shot.pos || 'e' })
      if (time !== undefined) {
        const t = Math.min(time, land)
        items.push({ type: 'points', pts: [[t, height(shot, t)]], color: shot.color, r: 10 })
      }
      if (revealPeaks) {
        const t = peakTime(shot), h = peakHeight(shot)
        items.push({ type: 'points', pts: [[t, h]], color: shot.color })
        labels.push({ id: `peak-${shot.id}`, x: t, y: h, html: `${shot.id}: $${+h.toFixed(2)}$ m`, color: shot.color, leader: true, rail: { group: 'vertices', side: 'above' } })
      }
      if (revealLandings) {
        items.push({ type: 'points', pts: [[land, 0]], color: shot.color })
        labels.push({ id: `land-${shot.id}`, x: land, y: 0, html: `${shot.id}: $${land.toFixed(2)}$ s`, color: shot.color, leader: true, rail: { group: 'roots', side: 'below' } })
      }
    }
    for (const [i, observation] of (shot.known || []).entries()) {
      const [t, h, text, pos] = observation
      items.push({ type: 'points', pts: [[t, h]], color: shot.color })
      labels.push({ id: `known-${shot.id}-${i}`, x: t, y: h, html: text, color: shot.color, pos: pos || 'ne', attached: true })
    }
  }
  return {
    bounds: { left: -0.18, right: 1.95, bottom: revealLandings ? -1.5 : -0.55, top: 4.95 },
    axes: { x: 't (s)', y: 'h (m)', aspect: 3, xStep: 0.5, yStep: 1, nonnegative: true },
    description: 'Ball height in metres against time in seconds since the flight began. Each curve stops at its next ground contact.',
    items, labels,
  }
}
