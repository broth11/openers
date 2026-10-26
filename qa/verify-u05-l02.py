"""Independent exact checks for the U5 L2 opener: mall quadratic and cubic, jars, inverse square law."""
import sympy as s

t, a, b, c, d, h, w, k, x = s.symbols('t a b c d h w k x')
R = s.Rational

# Scene 1: three counts give the quadratic, four give the cubic (V in hundreds, t hours after 10:00)
counts = [(0, 20), (3, 155), (6, 128)]
late = (9, 263)
q = a*t**2 + b*t + c
sol = s.solve([q.subs(t, x0) - y0 for x0, y0 in counts], [a, b, c])
assert sol == {a: -9, b: 72, c: 20}
Q = q.subs(sol)
# the simplified system shown in the answer and on the calculator
assert s.solve([9*a + 3*b - 135, 36*a + 6*b - 108], [a, b]) == {a: -9, b: 72}
assert Q.subs(t, 9) == -61
empty = max(r for r in s.solve(Q, t))
assert f'{float(empty):.2f}' == '8.27'
mins = float(empty) * 60 + 600  # minutes after midnight
assert f'{int(mins // 60):02d}:{int(round(mins % 60)):02d}' == '18:16'
cub = a*t**3 + b*t**2 + c*t + d
sol3 = s.solve([cub.subs(t, x0) - y0 for x0, y0 in counts + [late]], [a, b, c, d])
assert sol3 == {a: 2, b: -27, c: 108, d: 20}
V = cub.subs(sol3)
assert s.solve([27*a + 9*b + 3*c - 135, 216*a + 36*b + 6*c - 108, 729*a + 81*b + 9*c - 243], [a, b, c]) == {a: 2, b: -27, c: 108}
assert sorted(s.solve(s.diff(V, t), t)) == [3, 6]
assert [V.subs(t, v) for v in (0, 3, 6, 9, 10)] == [20, 155, 128, 263, 400]
assert Q.subs(t, 4) == 164 and s.solve(s.diff(Q, t), t) == [4]

# Scene 3: a 10 cm jar holds 200 beans
taller, wider, same = 20*h, 2*w**2, R(1, 5)*h**3
assert taller.subs(h, 10) == wider.subs(w, 10) == same.subs(h, 10) == 200
assert (taller.subs(h, 20), wider.subs(w, 20), same.subs(h, 20)) == (400, 800, 1600)
assert s.solve(200 - k*10**3, k) == [R(1, 5)]

# Scene 5: 100 lux at 2 m, inverse square law
I = k/d**2
kk = s.solve(I.subs(d, 2) - 100, k)[0]
assert kk == 400
law = 400/d**2
assert law.subs(d, 4) == 25 and (200/d).subs(d, 4) == 50 and law.subs(d, 8) == R(25, 4)
assert sorted(s.solve(law - 16, d)) == [-5, 5]

# Recap scenes: doubling factors
for n in (R(1, 2), 1, 2, 3):
    assert s.simplify((k*(2*x)**n) / (k*x**n)) == 2**n
for m in (1, 2, 3):
    assert s.simplify((k/(2*x)**m) / (k/x**m)) == R(1, 2**m)
print('All U5 L2 opener checks passed: quadratic', s.expand(Q), '| cubic', s.expand(V), '| N = h^3/5 | I = 400/d^2')
