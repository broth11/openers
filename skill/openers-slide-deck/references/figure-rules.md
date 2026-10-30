# Figure rules — standing (teacher, 23/10/2026, Y2 L20 review)

Decks only. LaTeX notes keep their own rules (`aa-sl-graphs` is not affected). The worked reference is
`AASL_Y2_L20_Lesson_TangentAndTransformations.html` (validated 23/10/2026), slides 2, 3, 4, 6, 8; its earlier
version `_versions/…_20261021.html` shows what each rule corrects.

## 1 · Period of a sinusoid

- Measured **between two successive maxima**: both points marked, a dotted double arrow at their height, its label
  the calculation `x_max2 − x_max1 = period` (e.g. `13π/12 − π/12 = π`), above the arrow, or under the curve when
  the top of the window leaves no room.
- **No vertical drop-line** from a maximum to the axis.
- A lab's ranges keep two maxima inside the window **for every slider value**. Rule of thumb: window width ≥ 2 × the
  longest period the `b` slider reaches (L20: −π … 4π with `b` 1 … 3). `sinusoidABCD` checks this itself and logs a
  console error, which fails the checker.

## 2 · One colour per variable

- A variable keeps one colour on the figure, in every formula and prose `$…$`, and on the following slides that
  reuse it (L20: `h` blue `#58C4DD`, `d` orange `#FF862F`; the second radius `indigo` `#5C7CFA`). Bind it with
  `t2c` (deck or example) and `colorOf` rather than writing hexes.
- Every colour reaches **4.5:1 on the deck's ground**. The build refuses one that does not (L20: `#1f3a93` on
  greengrey was 1.69:1).

## 3 · Step-by-step highlight

- When a step introduces a parameter or term, its letter in the text and its feature on the graph turn the
  highlight colour (yellow on dark grounds); the previous one returns to its own colour. One highlighted at a time;
  stepping back restores the earlier state.
- Text: `<span class="hlstep">$a$</span>`. Graph: `"hl": n` on each item of that parameter (arrow, its label, its
  points). L20 slide 8: a (amplitude arrow), b (period arrow and maxima), c (start point), d (principal axis).

## 4 · Figures build step by step

- A figure is never shown complete on the first reveal. **One reveal step per case**: the case's point, line, label
  and measure appear together with its working row.
- A measure that changes from case to case is shown for the current case only (`until`), so the change is visible.
  L20 slide 2: one angle per step (stop, sight line, angle label, its `d` arrow); the previous `d` arrow goes.

## 5 · Everything named is drawn

- Every object the text names — radius, distance, height, angle, point — is drawn and labelled on the figure, in its
  variable's colour. Reading the text and finding the object missing is a fault.

## 6 · Angles

- An angle is a **dotted arc with an arrowhead**, from the positive x-axis to the radius it measures, in that
  radius's colour: item `arc` {`at`, `from`, `to`, `r`, `color`}.
- Several angles at one vertex take **different radii** (L20 slide 4: `x` at r 0.3, `x + π` at r 0.56).
- Bearings keep `bearing` (clockwise from north); geometry sums keep the Y2 L15 rules in SKILL.md.

## 7 · Axis labels short

- Axis names stay short (`h/d` written as `\tfrac{h}{d}`, `θ`); the identity (`h/d = tan θ`) goes in the text, not
  on the axis.

## 8 · Screens

- The teacher presents **on a computer, never on a phone**. Judge the deck at 1280×800, 1440×900, 1470×830 and
  1920×1080; the phone width (390×844) must only not break. The checker's text-size failures count at the computer
  sizes and are warnings below them.

## 9 · Text size

- No slide may lose type size silently. The per-slide emergency shrink (`--k`) is a phone safety net; at a computer
  size it is a failure (`check_deck.py`: "text shrunk"). L20 slide 5 (21/10) was cut to 52 % because a "2π" tick
  label at the window edge overflowed by 10 px: move the window edge (L20: xmax 6.9), do not accept the shrink.

## 10 · Wide sinusoid lab

- `sinusoidABCD` defaults to `layout: "wide"`: graph full content width on top (~60–65 % of the usable height,
  x up to 4π), sliders and read-off panel side by side underneath, thin sliders (4 px track, 14 px thumb, ≥ 20 px hit
  area, visible focus ring). `layout: "square"` restores the v12 layout. Other presets may use `window.aspect`.
