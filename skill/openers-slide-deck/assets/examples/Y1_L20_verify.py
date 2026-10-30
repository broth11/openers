"""Y1 L20 — sympy check of every answer in the deck (worksheet worked examples 1-5)."""

from sympy import Eq, limit, oo, simplify, solve, symbols
from sympy import Rational as R

x, y, a = symbols("x y a")

# WE1: y = 3/x, tables and the four limits
f = 3 / x
assert [f.subs(x, v) for v in (R(-1, 100), R(-1, 10), -1, 1, R(1, 10), R(1, 100))] == [
    -300,
    -30,
    -3,
    3,
    30,
    300,
]
assert [f.subs(x, v) for v in (-100, -10, 10, 100)] == [
    R(-3, 100),
    R(-3, 10),
    R(3, 10),
    R(3, 100),
]
assert limit(f, x, 0, "+") == oo and limit(f, x, 0, "-") == -oo
assert limit(f, x, oo) == 0 and limit(f, x, -oo) == 0
assert [f.subs(x, v) for v in (1, -1, 3, -3)] == [3, -3, 1, -1]

# WE2: 1/(x+3) - 2 = 1/(x-(-3)) + (-2); (1,1) -> (-2,-1)
g = 1 / (x + 3) - 2
assert simplify(g - (1 / (x - (-3)) + (-2))) == 0
assert g.subs(x, -2) == -1
assert limit(g, x, oo) == -2 and limit(g, x, -3, "+") == oo
assert solve(Eq(g, -2), x) == []  # range excludes -2

# WE3 (changed 20/10): y = -2/x - 3, asymptotes x = 0, y = -3; points (1,-5), (-1,-1); x-intercept -2/3
h = -2 / x - 3
assert h.subs(x, 1) == -5 and h.subs(x, -1) == -1 and solve(Eq(h, 0), x) == [R(-2, 3)]
assert limit(h, x, oo) == -3 and limit(h, x, 0, "-") == oo and limit(h, x, 0, "+") == -oo

# WE4: asymptotes x = 1, y = 3, through (3,4)
sol = solve(Eq(4, a / (3 - 1) + 3), a)
assert sol == [2]
assert (2 / (x - 1) + 3).subs(x, 3) == 4

# WE5: f(x) = 1/(x-2) + 2 is self-inverse; (4, 5/2) and (5/2, 4) on the curve
F = 1 / (x - 2) + 2
inv = solve(Eq(x, 1 / (y - 2) + 2), y)
assert len(inv) == 1 and simplify(inv[0] - F) == 0
assert F.subs(x, 4) == R(5, 2) and F.subs(x, R(5, 2)) == 4
assert F.subs(x, 3) == 3 and F.subs(x, 1) == 1  # (3,3) and (1,1) on y = x
assert simplify(F.subs(x, F) - x) == 0
from sympy import Rational as Q
assert [f.subs(x, v) for v in (Q(-1,1000), Q(-1,100), Q(-1,10), Q(-1,2), -1, 1, Q(1,2), Q(1,10), Q(1,100), Q(1,1000))] == [-3000, -300, -30, -6, -3, 3, 6, 30, 300, 3000]
assert [f.subs(x, v) for v in (-1000, -100, -10, -5, 5, 10, 100, 1000)] == [Q(-3,1000), Q(-3,100), Q(-3,10), Q(-3,5), Q(3,5), Q(3,10), Q(3,100), Q(3,1000)]
print("Y1 L20: all answers verified")
