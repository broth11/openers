"""MAI HL U12 L1, "The Language of Motion": every value the deck states, checked with sympy.

Run:  python3 qa/verify-mai-hl-u12-l01.py     (exits non-zero on the first wrong value)
"""
import sympy as sp

t = sp.Symbol('t')
R = sp.Rational


def ok(cond, msg):
    if not cond:
        raise AssertionError(msg)
    print('ok  ', msg)


# ---- Scene 1, the toy car: s = 6t - t^2 (m, s), run on to t = 8 ----
s1 = 6 * t - t**2
v1, a1 = sp.diff(s1, t), sp.diff(s1, t, 2)
pos = [s1.subs(t, k) for k in range(9)]
ok(pos == [0, 5, 8, 9, 8, 5, 0, -7, -16], 'S1 positions at t=0..8 are 0, 5, 8, 9, 8, 5, 0, -7, -16')
ok(sp.simplify(v1 - (6 - 2 * t)) == 0 and a1 == -2, 'S1 v = 6 - 2t, a = -2')
ok(sp.solve(v1, t) == [3] and sp.solve(s1, t) == [0, 6], 'S1 v = 0 at t = 3; s = 0 at t = 0 and t = 6')
ok(s1.subs(t, 2) > 0 and v1.subs(t, 2) > 0 and a1 < 0, 'Q1: at t=2, s>0 (right of O), v>0 (moving right), a<0, so v and a disagree')
gaps = [pos[k] - pos[k - 1] for k in range(1, 9)]
ok(gaps[:3] == [5, 3, 1] and gaps[5:] == [-5, -7, -9], 'Q1, Q2, Q4: gaps 5, 3, 1 ... then -5, -7, -9')
ok(v1.subs(t, 3) == 0 and a1 == -2, 'Q2: at t=3, v = 0 and a = -2 m s^-2 (each gap is 2 less)')
ok(abs(pos[1] - pos[0]) + abs(pos[2] - pos[1]) + abs(pos[3] - pos[2]) + abs(pos[4] - pos[3]) + abs(pos[5] - pos[4]) + abs(pos[6] - pos[5]) == 18, 'Q3: distance travelled by t = 6 is 18 m')
ok(s1.subs(t, 6) - s1.subs(t, 0) == 0, 'Q3: change in displacement is 0 m')
ok(s1.subs(t, 7) < 0 and v1.subs(t, 7) < 0 and a1 < 0, 'Q4: at t=7, s<0 (left of O), v<0 (moving left), a<0, so v and a agree: speeding up')
ok(pos[7] + gaps[7] == pos[8] == -16, 'Q4: the next dot, after gap -9, is at -16 m')

# ---- sign diagrams for the replay and the recap ----
sg = lambda e, x: sp.sign(e.subs(t, x))
ok([sg(s1, 3), sg(s1, 7)] == [1, -1] and [sg(v1, 2), sg(v1, 5)] == [1, -1] and sg(a1, 4) == -1, 'S1 sign diagrams: s + then - (zero at 6), v + then - (zero at 3), a - throughout')
cub = t**3 - 6 * t**2 + 9 * t - 1
ok(sp.expand(sp.diff(cub, t) - 3 * (t - 1) * (t - 3)) == 0 and sp.expand(sp.diff(cub, t, 2) - (6 * t - 12)) == 0, 'Cubic: v = 3(t-1)(t-3), a = 6t - 12 (a = 0 at t = 2)')
ok([round(float(r), 2) for r in sp.Poly(cub, t).nroots() if abs(sp.im(r)) < 1e-9 and 0 < sp.re(r) < 5] == [0.12, 2.35, 3.53], 'Cubic: s = 0 at t = 0.12, 2.35, 3.53')
lin = 10 - 2 * t
ok(sp.diff(lin, t) == -2 and sp.diff(lin, t, 2) == 0 and sp.solve(lin, t) == [5], 'Steady speed: v = -2, a = 0, s = 0 at t = 5')

# ---- Scene 2, Michael's ride: s = 1.2 t^3 - 30 t^2 + 285 t (m, min), 0 <= t <= 19 ----
s3 = R(6, 5) * t**3 - 30 * t**2 + 285 * t
v3, a3 = sp.diff(s3, t), sp.diff(s3, t, 2)
ok(sp.expand(v3 - (R(18, 5) * t**2 - 60 * t + 285)) == 0, 'S3 v = 3.6t^2 - 60t + 285')
ok(sp.expand(a3 - (R(36, 5) * t - 60)) == 0, 'S3 a = 7.2t - 60')
ok(sp.discriminant(v3, t) == -504, 'S3 v is never 0 (discriminant -504)')
tm = sp.solve(sp.diff(v3, t), t)[0]
ok(tm == R(25, 3) and v3.subs(t, tm) == 35 and a3.subs(t, tm) == 0, 'Q5: slowest at t = 25/3 min with v = 35 m/min, where a = 0')
ok(s3.subs(t, tm) == R(8875, 9) and round(float(s3.subs(t, tm))) == 986, 'Q5: s = 8875/9, about 986 m')
sv = lambda k: s3.subs(t, k)
ok([sv(7), sv(8), sv(9), sv(10)] == [R(4683, 5), R(4872, 5), R(5049, 5), 1050], 's(7) = 936.6, s(8) = 974.4, s(9) = 1009.8, s(10) = 1050')
ok([float(sv(8) - sv(7)), float(sv(9) - sv(8)), float(sv(10) - sv(9))] == [37.8, 35.4, 40.2], 'Q5: dot gaps 37.8, 35.4, 40.2 (smallest between 8 and 9)')
ok(sv(5) == 825 and sv(15) == 1575 and (sv(15) - sv(5)) / 10 == 75, 'Q6: s(5) = 825, s(15) = 1575, average speed 75 m/min')
avg = lambda a, b: (s3.subs(t, b) - s3.subs(t, a)) / (b - a)
ok(float(avg(9, 11)) == 46.2, 'Q7: average over 9 to 11 is 46.2')
ok(float(avg(R(99, 10), R(101, 10))) == 45.012, 'Q7: average over 9.9 to 10.1 is 45.012')
ok(abs(float(avg(R(999, 100), R(1001, 100))) - 45.00012) < 1e-12, 'Q7: average over 9.99 to 10.01 is 45.00012')
ok(sp.limit(avg(10 - sp.Symbol('h'), 10 + sp.Symbol('h')), sp.Symbol('h'), 0) == 45 and v3.subs(t, 10) == 45, 'Q7: the values approach 45 and v(10) = 45')
ok(sv(10) + v3.subs(t, 10) == 1095, 'Q7: the tangent at t = 10 passes through (10, 1050) and (11, 1095)')
ok(all(sp.expand(s3).subs(t, k) > 0 for k in (1, 5, 19)) and v3.subs(t, 0) == 285, 'S3 never reverses: s > 0 and v > 0 throughout, so s is also the distance travelled')
print('all values verified')
