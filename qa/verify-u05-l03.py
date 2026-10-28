# Checks every exact value in the U5 L3 opener with sympy. Run: python3 qa/verify-u05-l03.py
import sympy as sp
t = sp.symbols('t')
# coffee
k, c = sp.symbols('k c')
sol = sp.solve([k + c - 92, sp.Rational(81, 100) * k + c - sp.Rational(787, 10)], [k, c])
assert sol == {k: 70, c: 22}, sol
T = lambda x: 70 * sp.Rational(9, 10) ** x + 22
assert T(0) == 92 and T(2) == sp.Rational(787, 10)
t50 = sp.log(sp.Rational(2, 5)) / sp.log(sp.Rational(9, 10))
assert abs(float(t50) - 8.6967) < 1e-3
assert float(T(8)) > 50 > float(T(9)) and round(float(T(8)), 1) == 52.1 and round(float(T(9)), 1) == 49.1
# typing
S = lambda h: 20 + 10 * sp.log(h)
assert S(1) == 20 and round(float(S(10)), 2) == 43.03
b = (sp.Rational(4303, 100) - 20) / sp.log(10)
assert round(float(b), 1) == 10.0
assert round(float(S(100)), 2) == 66.05 and round(float(S(sp.Rational(1, 10))), 2) == -3.03 and round(float(S(5000)), 0) == 105
assert round(43.03 + 23.03, 2) == 66.06
assert abs(float(sp.exp(-2)) - 0.1353) < 1e-3 and S(sp.exp(-2)) == 0
# pH
H = lambda p: sp.Integer(10) ** (-p)
assert round(float(-sp.log(sp.Rational(3, 10000), 10)), 2) == 3.52
assert f"{float(H(sp.Rational(66, 10))):.2e}" == "2.51e-07"
assert f"{float(H(sp.Rational(44, 10))):.2e}" == "3.98e-05"
assert round(float(sp.Rational(1, 100) / H(sp.Rational(44, 10))), 0) == 251
assert round(float(sp.Integer(10) ** sp.Rational(24, 10)), 0) == 251 and round(4.4 / 2.0, 1) == 2.2
print('all U5 L3 opener values check out')
