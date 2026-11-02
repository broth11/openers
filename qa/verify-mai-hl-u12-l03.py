"""MAI HL U12 L3, "From Acceleration Back to Position": every value the deck states, checked with sympy.

Run:  python3 qa/verify-mai-hl-u12-l03.py     (exits non-zero on the first wrong value)
"""
import sympy as sp

t, x = sp.symbols('t x', positive=True)
R = sp.Rational


def ok(cond, msg):
    if not cond:
        raise AssertionError(msg)
    print('ok  ', msg)


# ---- Scene 1, two cars, a = 2, 0 <= t <= 4 ----
a1 = 2
vA = sp.integrate(a1, t) + 0
vB = sp.integrate(a1, t) + 3
sA = sp.integrate(vA, t)
sB = sp.integrate(vB, t)
ok(sp.expand(vA - 2 * t) == 0 and sp.expand(vB - (2 * t + 3)) == 0, 'S1 vA = 2t, vB = 2t + 3')
ok(sp.integrate(a1, (t, 0, 4)) == 8, 'Q1: area under a-t from 0 to 4 is 8 for both cars')
ok(vA.subs(t, 4) == 8 and vB.subs(t, 4) == 11, 'Q1: vA(4) = 8, vB(4) = 11')
ok(sA.subs(t, 4) == 16 and sB.subs(t, 4) == 28, 'Q2: sA(4) = 16, sB(4) = 28')
ok(sB.subs(t, 4) - sA.subs(t, 4) == 12, 'Q2: car B is 12 m ahead')
ok(sB.subs(t, 4) + 5 == 33, 'Q3: car C (starts 5 m right, velocity of B) is at 33 m')

# ---- Scene 2, a = 2e^(-t/2), from rest at the origin, T = 12 ----
a2 = 2 * sp.exp(-t / 2)
v2 = sp.integrate(a2, (t, 0, t))
s2 = sp.integrate(v2, (t, 0, t))
ok(sp.simplify(v2 - (4 - 4 * sp.exp(-t / 2))) == 0, 'S2 v = 4 - 4e^(-t/2)')
ok(sp.simplify(s2 - (4 * t - 8 + 8 * sp.exp(-t / 2))) == 0, 'S2 s = 4t - 8 + 8e^(-t/2)')
ok(sp.limit(v2, t, sp.oo) == 4, 'Q5: limiting velocity is 4')
ok(abs(float(v2.subs(t, 12 / 1)) - 3.99) < 0.01 and abs(float(sp.integrate(a2, (t, 0, 12))) - 3.99) < 0.01, 'Q4: change in velocity over 12 s is about 3.99')
ok(abs(float(s2.subs(t, 12)) - 40.0198) < 1e-3, 'Q6: s(12) = 40.02 (to 1 d.p. 40.0)')
ok(48 - round(float(s2.subs(t, 12)), 0) == 8, 'Q6: 8 m short of 4 x 12 = 48')

# ---- Recap lab: s = u t + a t^2 / 2 from v = u + a t, s(0) = 0 ----
u, a = sp.symbols('u a')
vr = sp.integrate(a, t) + u
sr = sp.integrate(vr, t)
ok(sp.expand(sr - (u * t + a * t**2 / 2)) == 0, 'Recap: s = ut + at^2/2 follows from integrating twice')
ok((vr.subs({u: 3, a: -2})).subs(t, 3) == -3 and sr.subs({u: 3, a: -2, t: 3}) == 0, 'Recap start (u = 3, a = -2, t = 3): v = -3, s = 0')
print('all checks passed')
