# Exact values for the MAI HL U12 concept "Displacement or distance: signed area and |v|".
# v(t) = (t - 2)(t - 6) = t^2 - 8t + 12 on 0 <= t <= 7, s(0) = 0.
# Run: python3 qa/verify-concept-mai-hl-u12-signed-area.py
from sympy import symbols, integrate, Abs, Rational as R, solve, simplify, diff
t = symbols('t', real=True)
v = t**2 - 8*t + 12
s = integrate(v, (t, 0, t))
checks = [
  ('roots of v', sorted(solve(v, t)), [2, 6]),
  ('s(t)', simplify(s - (t**3/3 - 4*t**2 + 12*t)), 0),
  ('s(2) furthest right', s.subs(t, 2), R(32, 3)),
  ('s(4)', s.subs(t, 4), R(16, 3)),
  ('s(6) back at O', s.subs(t, 6), 0),
  ('s(7)', s.subs(t, 7), R(7, 3)),
  ('area 0..2', integrate(v, (t, 0, 2)), R(32, 3)),
  ('area 2..6', integrate(v, (t, 2, 6)), R(-32, 3)),
  ('area 6..7', integrate(v, (t, 6, 7)), R(7, 3)),
  ('displacement 0..7', integrate(v, (t, 0, 7)), R(7, 3)),
  ('distance 0..7', integrate(Abs(v), (t, 0, 7)), R(71, 3)),
  ('displacement 0..6', integrate(v, (t, 0, 6)), 0),
  ('distance 0..6', integrate(Abs(v), (t, 0, 6)), R(64, 3)),
  ('displacement 6..7', integrate(v, (t, 6, 7)), R(7, 3)),
  ('distance 6..7', integrate(Abs(v), (t, 6, 7)), R(7, 3)),
  ('v(0)', v.subs(t, 0), 12),
  ('v(7)', v.subs(t, 7), 5),
  ('min v at t=4', (solve(diff(v, t), t), v.subs(t, 4)), ([4], -4)),
]
bad = 0
for name, got, want in checks:
    ok = got == want if isinstance(want, (list, tuple)) else simplify(got - want) == 0
    bad += not ok
    print(('PASS ' if ok else 'FAIL ') + name, got)
for k in ['71/3', '64/3', '32/3', '7/3']:
    a, b = map(int, k.split('/')); print(k, '≈', round(a / b, 2))
raise SystemExit(bad)
