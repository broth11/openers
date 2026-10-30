"""Y2 L20 — sympy check of every number shown in the deck (tangent graph and transformed waves)."""

from sympy import (
    FiniteSet,
    Interval,
    cos,
    diff,
    limit,
    maximum,
    minimum,
    oo,
    periodicity,
    pi,
    simplify,
    sin,
    solveset,
    sqrt,
    symbols,
    tan,
)
from sympy import (
    Rational as R,
)

x = symbols("x", real=True)

# --- Tower (harvest of L15): d = h / tan(theta), h = 1; stops 15..75 degrees
ds = [1 / tan(k * pi / 12) for k in (1, 2, 3, 4, 5)]
assert [simplify(v) for v in ds] == [
    simplify(2 + sqrt(3)),
    sqrt(3),
    1,
    sqrt(3) / 3,
    simplify(2 - sqrt(3)),
]
shown = [3.73, 1.73, 1.00, 0.58, 0.27]
assert all(abs(float(v) - s_) < 0.005 for v, s_ in zip(ds, shown))
gaps = [ds[i] - ds[i + 1] for i in range(4)]
assert [round(float(gp), 2) for gp in gaps] == [2.00, 0.73, 0.42, 0.31]
assert limit(tan(x), x, pi / 2, "-") == oo

# --- tan x: period pi, zeros, asymptotes, reference points
assert periodicity(tan(x), x) == pi
assert simplify(tan(x + pi) - tan(x)) == 0
assert tan(pi / 4) == 1 and tan(-pi / 4) == -1 and tan(5 * pi / 4) == 1
assert solveset(sin(x), x, Interval(-pi, 2 * pi)) == FiniteSet(-pi, 0, pi, 2 * pi)
assert solveset(cos(x), x, Interval(-pi, 2 * pi)) == FiniteSet(
    -pi / 2, pi / 2, 3 * pi / 2
)

# --- Summary slide: y = 3 sin(2(x + pi/6)) + 1 (notes, section C)
f = 3 * sin(2 * (x + pi / 6)) + 1
assert maximum(f, x, Interval(-pi, pi)) == 4 and minimum(f, x, Interval(-pi, pi)) == -2
assert f.subs(x, pi / 12) == 4 and f.subs(x, -pi / 6) == 1
assert periodicity(f, x) == pi
assert simplify(cos(x) - sin(x + pi / 2)) == 0

# --- Bracket trap: sin(2x + pi/3) = sin(2(x + pi/6)); maxima pi/4 and pi/12; slide pi/6
assert simplify(sin(2 * x + pi / 3) - sin(2 * (x + pi / 6))) == 0
assert sin(2 * (pi / 4)) == 1 and sin(2 * (pi / 12) + pi / 3) == 1
assert pi / 4 - pi / 12 == pi / 6

# --- WE A: f(x) = 6 sin(4x); a = 6, period pi/2, b = 4, f(pi/16) = 3 sqrt 2
fA = 6 * sin(4 * x)
assert maximum(fA, x, Interval(0, pi)) == 6 and minimum(fA, x, Interval(0, pi)) == -6
assert periodicity(fA, x) == pi / 2 and 2 * pi / (pi / 2) == 4
assert fA.subs(x, pi / 8) == 6 and fA.subs(x, 5 * pi / 8) == 6  # max to next max
assert simplify(fA.subs(x, pi / 16) - 3 * sqrt(2)) == 0

# --- WE B: g(x) = a cos(bx) + d, minimum (0, -2), next maximum (pi/3, 6)
d_B = R(6 + (-2), 2)
amp_B = R(6 - (-2), 2)
per_B = 2 * (pi / 3)
b_B = 2 * pi / per_B
assert (d_B, amp_B, per_B, b_B) == (2, 4, 2 * pi / 3, 3)
gB = -4 * cos(3 * x) + 2
assert gB.subs(x, 0) == -2 and gB.subs(x, pi / 3) == 6
assert (
    diff(gB, x).subs(x, 0) == 0 and diff(gB, x, 2).subs(x, 0) > 0
)  # (0, -2) is a minimum
assert periodicity(gB, x) == 2 * pi / 3  # smallest k > 0
assert gB.subs(x, 2 * pi / 3) == -2

# --- WE C: h(x) = a sin(b(x + c)) + d, max (pi/8, 5), next min (5pi/8, -3), a, b > 0, 0 < c < pi/2
d_C = R(5 + (-3), 2)
a_C = R(5 - (-3), 2)
per_C = 2 * (5 * pi / 8 - pi / 8)
b_C = 2 * pi / per_C
assert (d_C, a_C, per_C, b_C) == (1, 4, pi, 2)
ref = pi / 8 - per_C / 4
assert ref == -pi / 8
c_C = -ref
assert 0 < c_C < pi / 2
hC = 4 * sin(2 * (x + pi / 8)) + 1
assert (
    hC.subs(x, pi / 8) == 5
    and hC.subs(x, 5 * pi / 8) == -3
    and hC.subs(x, -pi / 8) == 1
)
assert diff(hC, x).subs(x, -pi / 8) > 0  # going up through the axis
assert simplify(hC.subs(x, 0) - (2 * sqrt(2) + 1)) == 0
assert simplify(hC - (4 * cos(2 * (x - pi / 8)) + 1)) == 0  # cosine form, q = pi/8
assert all(
    simplify(hC - (4 * cos(2 * (x - q)) + 1)) != 0
    for q in (pi / 16, -pi / 8 + pi / 2 - pi)
)  # no smaller q>0 shown

# --- WE D: f(x) = 3 tan(2x), 0 <= x <= pi
fD = 3 * tan(2 * x)
assert periodicity(fD, x) == pi / 2
assert solveset(cos(2 * x), x, Interval(0, pi)) == FiniteSet(pi / 4, 3 * pi / 4)
assert solveset(tan(2 * x) - 1, x, Interval(0, pi)) == FiniteSet(pi / 8, 5 * pi / 8)
assert fD.subs(x, pi / 8) == 3 and fD.subs(x, 5 * pi / 8) == 3
assert all(
    fD.subs(x, v) < 0 for v in (R(13, 16) * pi, R(7, 8) * pi, R(15, 16) * pi)
)  # last branch negative
print("Y2 L20: all answers verified")
