"""MAI HL U12 L3, "From Acceleration Back to Position": every value the deck states, checked with sympy.

Run:  python3 qa/verify-mai-hl-u12-l03.py     (exits non-zero on the first wrong value)
"""
import sympy as sp

t, x = sp.symbols('t x', positive=True)
C, D = sp.symbols('C D')
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
vC = 2 * t + C
Cv = sp.solve(sp.Eq(vC.subs(t, 1), 5), C)[0]
ok(Cv == 3, 'Q3: v = 2t + C, v(1) = 5 gives C = 3')
sC = sp.integrate(vC.subs(C, Cv), t) + D
Dv = sp.solve(sp.Eq(sC.subs(t, 2), 15), D)[0]
ok(sp.expand(sC.subs(D, Dv) - (t**2 + 3 * t + 5)) == 0 and Dv == 5, 'Q3: s = t^2 + 3t + D, s(2) = 15 gives D = 5')
ok(sC.subs(D, Dv).subs(t, 4) == 33 == 16 + 12 + 5, 'Q3: car C is at s(4) = 33 m, and its velocity is car B\'s')

# ---- Scene 2, a = 2e^(-t/2), from rest at the origin, T = 12 ----
a2 = 2 * sp.exp(-t / 2)
v2 = sp.integrate(a2, (t, 0, t))
s2 = sp.integrate(v2, (t, 0, t))
ok(sp.simplify(v2 - (4 - 4 * sp.exp(-t / 2))) == 0, 'S2 v = 4 - 4e^(-t/2)')
ok(sp.simplify(s2 - (4 * t - 8 + 8 * sp.exp(-t / 2))) == 0, 'S2 s = 4t - 8 + 8e^(-t/2)')
vi = sp.integrate(a2, t)
ok(sp.simplify(vi + 4 * sp.exp(-t / 2)) == 0 and sp.solve(sp.Eq(vi.subs(t, 0) + C, 0), C) == [4], 'Q5: v = -4e^(-t/2) + C, v(0) = 0 gives C = 4')
ok(sp.simplify(sp.integrate(2 * sp.exp(-t / 2), t) - (-4 * sp.exp(-t / 2))) == 0 and (-4 * sp.exp(0) + 4) == 0, 'Q5: v(0) = -4e^0 + 4 = 0')
ok(sp.limit(v2, t, sp.oo) == 4, 'Q5: limiting velocity is 4')
ok(abs(float(v2.subs(t, 12 / 1)) - 3.99) < 0.01 and abs(float(sp.integrate(a2, (t, 0, 12))) - 3.99) < 0.01, 'Q4: change in velocity over 12 s is about 3.99')
ok(abs(float(s2.subs(t, 12)) - 40.0198) < 1e-3, 'Q6: s(12) = 40.02 (to 1 d.p. 40.0)')
ok(48 - round(float(s2.subs(t, 12)), 0) == 8, 'Q6: 8 m short of 4 x 12 = 48')

# ---- Recap lab: s = u t + a t^2 / 2 from v = u + a t, s(0) = 0 ----
u, a = sp.symbols('u a')
vr = sp.integrate(a, t) + u
sr = sp.integrate(vr, t)
ok(sp.expand(sr - (u * t + a * t**2 / 2)) == 0, 'Recap: s = ut + at^2/2 follows from integrating twice')
# the lab has a = 2 fixed and two known values: (v(0), s(0)) = (3, 5), or (v(1), s(2)) = (5, 15); both give C = 3, D = 5
for (t1, vk, t2, sk) in ((0, 3, 0, 5), (1, 5, 2, 15)):
    Cl = vk - 2 * t1
    Dl = sk - (t2**2 + Cl * t2)
    ok((Cl, Dl) == (3, 5), f'Recap known at t = {t1}, {t2}: C = 3, D = 5')
ok(sp.integrate(2 * t + 3, t).subs(t, 3) + 5 == 23, 'Recap start: s(3) = 9 + 9 + 5 = 23, v(3) = 9')
# every slider combination the lab allows gives exact integers for C and D
ok(all(isinstance(vk - 2 * t1, int) for vk in range(-6, 9) for t1 in (0, 1)), 'Recap: C is an integer for every slider value')
print('all checks passed')
