"""MAI HL U12 L2, "Displacement and Distance from Velocity": every value the deck states, checked with sympy.

Run:  python3 qa/verify-mai-hl-u12-l02.py     (exits non-zero on the first wrong value)
"""
import sympy as sp

t = sp.Symbol('t')
R = sp.Rational


def ok(cond, msg):
    if not cond:
        raise AssertionError(msg)
    print('ok  ', msg)


area = lambda v, a, b: sp.integrate(v, (t, a, b))

# ---- Scene 1, the toy car: v = 6 - 2t (m/s), s(0) = 0, 0 <= t <= 8 ----
v1 = 6 - 2 * t
s1 = sp.integrate(v1, (t, 0, t))
ok(sp.expand(s1 - (6 * t - t**2)) == 0, 'S1 s = 6t - t^2: the same motion as U12 L1 scene 1')
ok(v1.subs(t, 0) == 6 and sp.solve(v1, t) == [3] and v1.subs(t, 6) == -6 and v1.subs(t, 8) == -10, 'S1 v(0) = 6, v = 0 at t = 3, v(6) = -6, v(8) = -10')
ok(area(v1, 0, 3) == 9 == R(1, 2) * 3 * 6, 'Q1: area from 0 to 3 is +9 (triangle, base 3, height 6), so s(3) = 9, 9 m right of O')
ok(area(v1, 3, 6) == -9 == -R(1, 2) * 3 * 6, 'Q2: area from 3 to 6 is -9 (triangle, base 3, height 6, below the axis)')
ok(s1.subs(t, 6) == 9 + (-9) == 0, 'Q2: s(6) = 9 + (-9) = 0, the car is back at O')
ok(area(v1, 0, 3) - area(v1, 3, 6) == 18 and area(v1, 0, 6) == 0, 'Q2: distance 9 + 9 = 18 m, displacement 9 - 9 = 0 m')
ok(area(v1, 6, 8) == -16 == -R(1, 2) * (6 + 10) * 2, 'Q3: area from 6 to 8 is -16 (trapezoid, parallel sides 6 and 10, width 2)')
ok(s1.subs(t, 8) == -16 == 0 + (-16), 'Q3: s(8) = -16, 16 m left of O')
ok(area(v1, 0, 8) == 9 - 9 - 16 == -16, 'Q3: displacement 9 - 9 - 16 = -16 m')
ok(area(v1, 0, 3) - area(v1, 3, 6) - area(v1, 6, 8) == 9 + 9 + 16 == 34, 'Q3: distance 9 + 9 + 16 = 34 m (unsigned areas)')

# ---- Scene 2, Michael's ride: v = 3.6 t^2 - 60 t + 285 (m/min), s(0) = 0, 0 <= t <= 15 ----
v2 = R(18, 5) * t**2 - 60 * t + 285
s2 = sp.integrate(v2, (t, 0, t))
ok(sp.expand(s2 - (R(6, 5) * t**3 - 30 * t**2 + 285 * t)) == 0, 'S2 s = 1.2t^3 - 30t^2 + 285t: the same ride as U12 L1 scene 3')
ok(sp.discriminant(v2, t) == -504 and v2.subs(t, 0) > 0, 'S2 v is never zero (discriminant -504), so v > 0 for all t')
ok(area(v2, 0, 5) == 825 and s2.subs(t, 5) == 825, 'Q4: the area from 0 to 5 is 825 and s(5) = 825 m')
ok(area(v2, 5, 15) == 750, 'Q5: the area from 5 to 15 is 750 m')
ok(R(750, 10) == 75 and (s2.subs(t, 15) - s2.subs(t, 5)) / 10 == 75, 'Q5: average speed 750 / 10 = 75 m/min (U12 L1 Q6)')
ok(area(v2, 0, 15) == 825 + 750 == 1575 and s2.subs(t, 15) == 1575, 'Q6: s(15) = 825 + 750 = 1575 m')
ok(area(v2, 0, 15) == sum(abs(area(v2, a, b)) for a, b in ((0, 5), (5, 15))), 'Q6: v > 0, so the distance ridden equals the distance from home')

# ---- Recap lab: v = t^2 - 7t + 10 on 0 <= t <= 7 ----
vr = t**2 - 7 * t + 10
ok(sp.factor(vr) == (t - 2) * (t - 5) and sp.solve(vr, t) == [2, 5], 'Recap: v = (t - 2)(t - 5), roots t = 2 and t = 5')
p = [area(vr, 0, 2), area(vr, 2, 5), area(vr, 5, 7)]
ok(p == [R(26, 3), -R(9, 2), R(26, 3)], 'Recap: pieces +26/3 (0 to 2), -9/2 (2 to 5), +26/3 (5 to 7)')
ok(area(vr, 0, 7) == R(77, 6), 'Recap: signed area 0 to 7 = 77/6')
ok(sum(abs(x) for x in p) == R(131, 6), 'Recap: total area 0 to 7 = 131/6')
ok(vr.subs(t, 0) == 10 and vr.subs(t, 7) == 10 and vr.subs(t, R(7, 2)) == -R(9, 4), 'Recap: v(0) = 10, v(7) = 10, minimum -9/4 at t = 3.5')
G = lambda x: sum(abs(area(vr, a, min(b, x))) for a, b in ((0, 2), (2, 5), (5, 7)) if x > a)
Fx = lambda x: area(vr, 0, x)
ok(Fx(6) - Fx(1) == -R(5, 6) and G(6) - G(1) == R(49, 6), 'Recap start (t1 = 1, t2 = 6): signed area -5/6, total area 49/6')
ok(all(G(R(k, 2)) >= abs(Fx(R(k, 2))) for k in range(15)), 'Recap: the total area is never less than the size of the signed area')
