# Review stage — before the teacher sees any deck (v13, teacher 23/10/2026)

The producer never reviews its own deck. After `check_deck.py` passes, a **fresh subagent that did not build the
deck** reviews it. It receives **only** the HTML path and this file — no content.json, no outline, no conversation.
The producer fixes every failure, rebuilds, re-runs the checker, and sends the new HTML to a fresh reviewer, until
the review passes. Only then is the deck presented. Where subagents are unavailable, the producer runs the same
checklist itself in a separate pass and says so when presenting.

## Brief to pass to the reviewer (verbatim, plus the path)

> Review the online-lesson deck at `<path>`. You did not build it. Do not edit it. Run
> `python3 <skill>/scripts/review_shots.py <path> --out <dir> --size 1470x830` (add `--size 1280x800` and
> `--size 1920x1080` if time allows) and `python3 <skill>/scripts/check_deck.py <path> --shots <dir2>`. Open every
> shot listed in `<dir>/index.txt`. Check items A–F below on every slide and every reveal step. Report each failure
> as `slide n, step k: rule X — what you see — what it should be`, or `PASS` with the number of shots you opened.

## Checklist

**A · Named means drawn.** Everything the stem or working names — point, radius, distance, height, angle, line,
asymptote — is drawn on the figure and labelled, at the step that names it.

**B · One colour per variable.** Each variable has one colour on the figure, in every formula and sentence, and on
the following slides that reuse it. No colour is hard to read on the ground (the build enforces 4.5:1; report any that
still looks faint).

**C · Text and labels.** `check_deck.py` passes, in particular no "text shrunk" line at a computer size. No slide's
text looks smaller than its neighbours'. No label touches a curve, line, point or another label; none is clipped by
the graph edge. Axis names are short; identities are in the text.

**D · Step by step.** No figure appears complete on the first reveal: each case arrives with its working row, and a
measure that changes from case to case shows the current case only. When a parameter is highlighted, exactly one is
yellow (text and graph together); the previous one is back to its own colour. Stepping back (←) restores the earlier
state — check on one slide by comparing shots.

**E · Angles.** Every angle is a dotted arc with an arrowhead, from the positive x-axis to the radius it measures, in
that radius's colour; angles sharing a vertex have different arc radii. (Bearings: clockwise from north instead.)

**F · Period.** On a sinusoid, the period arrow joins two successive maxima, at their height, labelled
`x2 − x1 = period`, with no vertical drop-line. In a lab, the `_min` and `_max` shots both show the arrow, and
`index.txt` has no console error (the preset logs one when a slider value loses the second maximum).

A claimed numerical error must show the computation (code or closed form) that gives the other value.

Rules behind each item: `references/figure-rules.md`.
