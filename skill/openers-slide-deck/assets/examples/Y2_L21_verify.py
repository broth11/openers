"""Y2 L21 r1 — sympy check of every number in the deck (worksheet worked examples 1-2, the lab's initial state)."""
from sympy import *
import numpy as np
t = symbols('t', real=True)
def roots(expr, lo, hi):
    f = lambdify(t, expr); out = []; xs = np.linspace(lo, hi, 20001)
    for x0, x1 in zip(xs[:-1], xs[1:]):
        if f(x0) == 0 or f(x0) * f(x1) < 0: out.append(float(nsolve(expr, t, (x0 + x1) / 2)))
    return out
def ok(c, m):
    print(('OK  ' if c else 'BAD ') + m)
    if not c: raise SystemExit(1)
# WE1 greenhouse: max 31 at 14, min 15 at 2, period 24
d, a, b, c = Rational(31 + 15, 2), Rational(31 - 15, 2), 2*pi/24, 14 - Rational(24, 4)
ok((d, a, b, c) == (23, 8, pi/12, 8), 'WE1 d a b c = 23 8 pi/12 8')
ok(38 - 14 == 24 and Rational(24, 4) == 6, 'WE1 period arrow 38 - 14 = 24, quarter period 6')
T = a*sin(b*(t - c)) + d
ok(T.subs(t, 2) == 15 and T.subs(t, 14) == 31 and T.subs(t, 8) == 23 and T.subs(t, 38) == 31, 'WE1 T(2)=15 T(14)=31 T(8)=23 T(38)=31')
ok(sin(-pi/2) == -1, 'WE1 check 8 sin(-pi/2) + 23 = 15')
v = T.subs(t, 5); ok(abs(float(v) - 17.34314575) < 1e-8 and f'{float(v):.3g}' == '17.3' and float(v) < 23, f'WE1 T(5) = {float(v)} -> 17.3, below the axis')
ok(simplify(v - (23 - 4*sqrt(2))) == 0, 'WE1 T(5) = 23 - 4 sqrt 2')
r = roots(T - 28, 0, 24); print('  T = 28:', r)
ok(abs(r[0] - 10.5788125) < 1e-6 and 8 < r[0] < 14, 'WE1 first crossing 10.5788125, between 8 and 14')
ok(f'{(r[0] - 10)*60:.3g}' == '34.7' and round((r[0] - 10)*60) == 35, 'WE1 0.578... x 60 = 34.7 -> 10:35')
ok(f'{r[0]:.2f}' == '10.58', 'WE1 graph label 10.58')
# lab initial state (max 31, min 15, P 24, tmax 14, k 28): time above 28 per cycle
ok(abs((r[1] - r[0]) - (12 - 24*asin(Rational(5, 8)).evalf()/pi.evalf())) < 1e-9, f'lab: above 28 per cycle = {r[1]-r[0]:.6f} = {r[1]-r[0]:.3g} h')
# WE2 water wheel
Hw = 3*sin(pi/20*(t - 30)) + 2
ok(Rational(6, 2) == 3 and 2*pi/40 == pi/20, 'WE2 a = 3, b = 2pi/40 = pi/20')
ok(Hw.subs(t, 0) == 5 and Hw.subs(t, 10) == 2 and Hw.subs(t, 20) == -1 and Hw.subs(t, 30) == 2 and Hw.subs(t, 40) == 5, 'WE2 H(0)=5 H(10)=2 H(20)=-1 H(30)=2 H(40)=5')
ok(diff(Hw, t).subs(t, 10) < 0 and diff(Hw, t).subs(t, 30) > 0, 'WE2 going down at 10, going up at 30')
ok(3*sin(-3*pi/2) + 2 == 5, 'WE2 check 3 sin(-3pi/2) + 2 = 3 + 2 = 5')
r = roots(Hw, 0, 120); print('  H = 0:', r)
ok(len(r) == 6 and abs(r[0] - 14.64559054) < 1e-7 and abs(r[1] - 25.35440946) < 1e-7, 'WE2 crossings 14.64559054, 25.35440946 (six in 0..120)')
ok(f'{r[0]:.2f}' == '14.65' and f'{r[1]:.2f}' == '25.35', 'WE2 graph labels 14.65, 25.35')
ww = r[1] - r[0]; ok(f'{ww:.3g}' == '10.7' and f'{3*ww:.3g}' == '32.1' and abs(ww - 10.708) < 1e-3, f'WE2 10.7 s, 3 x 10.708... = 32.1 s ({ww})')
ok(round(25.4 - 14.6, 1) == 10.8, 'WE2 rounding first: 25.4 - 14.6 = 10.8')
ok(all(0 <= x <= 120 for x in r) and 120 == 3*40, 'WE2 120 s = 3 turns, all windows inside')
print('ALL OK')
