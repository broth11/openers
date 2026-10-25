# Projectile height against time

First used in MAI HL U5 L1. `flightGraph()` uses the existing SVG engine to draw one or more quadratic flights, known observations, a time cursor, and optional maxima and landing labels.

```js
flightGraph({ shots: [{ id: 'A', a: -5, b: 6, c: 2, color: COLORS.teal, reveal: true,
  known: [[0, 2, 'Release: $(0,2)$', 'nw']], labelAt: 0.95 }], time: 0.6 })
```

- Pass `reveal: false` to show only known observations, without a fitted curve.
- `known` entries are `[time, height, label, preferredPosition]`; the shared placer positions every label.
- `revealPeaks` and `revealLandings` show exact-model features only when the matching comparison answer is revealed.
- Curves start at release (`t=0`) and stop at the positive zero. Time markers stay at the landing point afterwards; never extend a flight below the floor or imply a bounce.
- `height`, `peakTime`, `peakHeight`, and `landingTime` are pure helpers. `landingTime` assumes a downward-opening quadratic starting above the floor or travelling upwards from a floor contact. For the latter, it returns the next floor contact, not t=0.
- The horizontal axis measures time, not horizontal distance. A ball on this graph is a moving time cursor, not a spatial trajectory.
- Axes explicitly show `t (s)` and `h (m)`. Display ratio is 3:1 (one second occupies three times the length of one metre). The two quantities have different units; this does not change the model.
- Reuse house colours and keep axes fixed while the time slider moves. The supplied lessons use an idealised first-flight model; a basket, a catch, and rebounds are outside its domain.
- All known-point labels use the shared placer's `attached` mode. Root-form lessons can use a floor-to-floor bounce, giving two actual zeros directly without shifted height functions or vertex information.
