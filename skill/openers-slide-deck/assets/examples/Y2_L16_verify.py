from sympy import *
# WE1
AC2 = 20**2 + 15**2; assert AC2 == 625 and sqrt(AC2) == 25
AG2 = AC2 + 10**2; assert AG2 == 725
AG = N(sqrt(AG2)); print('AG =', AG); assert f'{float(AG):.3g}' == '26.9'
# WE2
P = Matrix([-1, 3, 5]); Q = Matrix([5, -1, 2])
d = Q - P; assert list(d) == [6, -4, -3] and [x**2 for x in d] == [36, 16, 9]
PQ = sqrt(d.dot(d)); assert PQ == sqrt(61); print('PQ =', N(PQ)); assert f'{float(PQ):.3g}' == '7.81'
M = (P + Q) / 2; assert list(M) == [2, 1, Rational(7, 2)]
# flat triangle for WE2: R = (5,-1,5) above Q at P's height
R = Matrix([5, -1, 5]); PR = (R - P).norm(); RQ = (Q - R).norm()
assert PR == sqrt(52) and RQ == 3 and PR**2 + RQ**2 == 61 and (R - P).dot(Q - R) == 0
# WE3
r = Rational(16, 2); l = 17; h2 = l**2 - r**2; assert r == 8 and h2 == 225; h = sqrt(h2); assert h == 15
V = Rational(1, 3) * pi * r**2 * h; assert V == 320 * pi; print('V =', N(V)); assert f'{float(V):.3g}' == '1.01e+03'
# WE4
MN = Rational(14, 2); l2 = 24**2 + MN**2; assert l2 == 625; L = sqrt(l2); assert L == 25
face = Rational(1, 2) * 14 * L; assert face == 175 and 4 * face == 700 and 14**2 == 196 and 700 + 196 == 896
VB = sqrt(24**2 + 2 * 7**2); print('lateral edge VB =', N(VB), '(not used, > l)')
# lab defaults: cone r=8,h=15 -> l=17, V=1005.3, total = pi*64 + pi*8*17 = 200 pi ; pyramid a=14,h=24 -> 896
assert pi * 8**2 + pi * 8 * 17 == 200 * pi; print('cone total', N(200*pi))
print('all four worked examples verified')
