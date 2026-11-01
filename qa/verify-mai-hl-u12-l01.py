"""MAI HL U12 L1, "The Language of Motion": every value the deck states, checked with sympy.

Run:  python3 qa/verify-mai-hl-u12-l01.py     (exits non-zero on the first wrong value)
"""
import sympy as sp

t = sp.Symbol('t')
R = sp.Rational
ok = lambda cond, msg: (_ for _ in ()).throw(AssertionError(msg)) if not cond else print('ok  ', msg)

# ---- Scene 1, The Toy Car: s = t^2/2 + t - 4 (m, s) ----
s1 = t**2 / 2 + t - 4
v1, a1 = sp.diff(s1, t), sp.diff(s1, t, 2)
pos1 = [s1.subs(t, k) for k in range(5)]
ok(pos1 == [-4, R(-5, 2), 0, R(7, 2), 8], 'S1 positions at t=0..4 are -4, -2.5, 0, 3.5, 8')
ok(sp.simplify(v1 - (t + 1)) == 0 and a1 == 1, 'S1 v = t + 1, a = 1')
ok(sp.solve(s1, t) == [-1 - sp.sqrt(9), -1 + sp.sqrt(9)] or sorted(sp.solve(s1, t)) == [-4, 2], 'S1 reaches O at t = 2')
ok(s1.subs(t, 1) < 0 and v1.subs(t, 1) > 0, 'Q1: at t=1 left of O (s<0) and moving right (v>0)')
gaps1 = [pos1[k + 1] - pos1[k] for k in range(4)]
ok(gaps1 == [R(3, 2), R(5, 2), R(7, 2), R(9, 2)], 'Q2: gaps 1.5, 2.5, 3.5, then 4.5')
ok(pos1[3] + gaps1[3] == 8 == pos1[4], 'Q2: the next dot is at 8 m')
ok(v1.subs(t, 3) > 0 and a1 > 0, 'Q2: v > 0 and increasing, a > 0')

# ---- Scene 2, Turning Round: s = 6t - t^2 ----
s2 = 6 * t - t**2
v2, a2 = sp.diff(s2, t), sp.diff(s2, t, 2)
pos2 = [s2.subs(t, k) for k in range(7)]
ok(pos2 == [0, 5, 8, 9, 8, 5, 0], 'S2 positions at t=0..6 are 0, 5, 8, 9, 8, 5, 0')
ok(sp.simplify(v2 - (6 - 2 * t)) == 0 and a2 == -2, 'S2 v = 6 - 2t, a = -2')
ok(sp.solve(v2, t) == [3] and v2.subs(t, 3) == 0, 'Q3: v = 0 at t = 3')
gaps2 = [pos2[k + 1] - pos2[k] for k in range(6)]
ok(gaps2 == [5, 3, 1, -1, -3, -5], 'Q3: signed gaps 5, 3, 1, -1, -3, -5 (each 2 less)')
ok(sp.integrate(sp.Abs(v2), (t, 0, 6)) == 18 or (s2.subs(t, 3) - s2.subs(t, 0)) + (s2.subs(t, 3) - s2.subs(t, 6)) == 18, 'Q4: distance 18 m')
ok(s2.subs(t, 6) - s2.subs(t, 0) == 0, 'Q4: displacement 0 m')

# ---- Scene 3, Michael's Ride: s = 1.2 t^3 - 30 t^2 + 285 t (m, min), 0 <= t <= 19 ----
s3 = R(6, 5) * t**3 - 30 * t**2 + 285 * t
v3, a3 = sp.diff(s3, t), sp.diff(s3, t, 2)
ok(sp.expand(v3 - (R(18, 5) * t**2 - 60 * t + 285)) == 0, 'S3 v = 3.6t^2 - 60t + 285')
ok(sp.expand(a3 - (R(36, 5) * t - 60)) == 0, 'S3 a = 7.2t - 60')
ok(sp.discriminant(v3, t) == -504, 'S3 v is never 0 (discriminant -504)')
tm = sp.solve(sp.diff(v3, t), t)[0]
ok(tm == R(25, 3) and v3.subs(t, tm) == 35, 'Q5: slowest at t = 25/3 min with v = 35 m/min')
ok(s3.subs(t, tm) == R(8875, 9) and round(float(s3.subs(t, tm))) == 986, 'Q5: s = 8875/9, about 986 m')
sv = lambda k: s3.subs(t, k)
ok([sv(7), sv(8), sv(9), sv(10)] == [R(4683, 5), R(4872, 5), R(5049, 5), 1050], 's(7) = 936.6, s(8) = 974.4, s(9) = 1009.8, s(10) = 1050')
gaps = [sv(8) - sv(7), sv(9) - sv(8), sv(10) - sv(9)]
ok([float(g) for g in gaps] == [37.8, 35.4, 40.2], 'Q5: dot gaps 37.8, 35.4, 40.2 (smallest between 8 and 9)')
ok(sv(5) == 825 and sv(15) == 1575, 'Q6: s(5) = 825, s(15) = 1575')
ok((sv(15) - sv(5)) / (15 - 5) == 75, 'Q6: average speed 75 m/min')
avg = lambda a, b: (s3.subs(t, b) - s3.subs(t, a)) / (b - a)
ok(float(avg(9, 11)) == 46.2, 'Q7: average over 9 to 11 is 46.2')
ok(float(avg(R(99, 10), R(101, 10))) == 45.012, 'Q7: average over 9.9 to 10.1 is 45.012')
ok(abs(float(avg(R(999, 100), R(1001, 100))) - 45.00012) < 1e-12, 'Q7: average over 9.99 to 10.01 is 45.00012')
ok(sp.limit(avg(10 - sp.Symbol('h'), 10 + sp.Symbol('h')), sp.Symbol('h'), 0) == 45 and v3.subs(t, 10) == 45, 'Q7: the values approach 45 and v(10) = 45')
ok(sv(15) == 1575 and v3.subs(t, 10) == 45 and sv(10) == 1050, 'Q7: the tangent at t = 10 passes through (10, 1050) with gradient 45')
print('all values verified')
