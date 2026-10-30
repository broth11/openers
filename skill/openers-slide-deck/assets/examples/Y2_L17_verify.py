from sympy import *
sf = lambda v: f'{float(v):.3g}'
# WE1: cone r5 h12 point down + hemisphere r5
l2 = 5**2 + 12**2; assert l2 == 169 and sqrt(l2) == 13
V = Rational(2, 3)*pi*5**3 + Rational(1, 3)*pi*5**2*12
assert Rational(2, 3)*pi*125 == Rational(250, 3)*pi and Rational(1, 3)*pi*25*12 == 100*pi and V == Rational(550, 3)*pi
print('V1', N(V)); assert sf(V) == '576'
A = 2*pi*25 + pi*5*13; assert A == 115*pi and 2*pi*25 == 50*pi and pi*5*13 == 65*pi; print('A1', N(A)); assert sf(A) == '361'
# WE2
h = symbols('h'); hs = solve(Eq(pi*16*h, Rational(4, 3)*pi*6**3), h); assert hs == [18]
assert Rational(4, 3)*6**3 == 288
A2 = 2*pi*16 + 2*pi*4*18; assert A2 == 176*pi and 2*pi*4*18 == 144*pi; print('A2', N(A2)); assert sf(A2) == '553'
# WE3: cuboid 12 x 8 x 5, AH in face ADHE (AD = 8, AE = 5), HG = 12
AH2 = 8**2 + 5**2; assert AH2 == 89
th = atan(12/sqrt(89))*180/pi; print('theta', N(th)); assert f'{float(th):.1f}' == '51.8'
Av, Hv, Gv = Matrix([0, 0, 0]), Matrix([0, 8, 5]), Matrix([12, 8, 5])
assert (Av - Hv).dot(Gv - Hv) == 0
cosang = (Hv - Av).dot(Gv - Av)/((Hv - Av).norm()*(Gv - Av).norm()); assert abs(N(acos(cosang)*180/pi - th)) < 1e-9
# WE4: pyramid 8 x 6, VM = 7
AC2 = 8**2 + 6**2; assert AC2 == 100 and sqrt(AC2)/2 == 5
al = atan(Rational(7, 5))*180/pi; print('alpha', N(al)); assert f'{float(al):.1f}' == '54.5'
# Lab 2 defaults 9 x 6 x 4
print('lab two lines', N(atan(9/sqrt(52))*180/pi), 'lab base', N(atan(4/sqrt(117))*180/pi))
# Open question Q28
c = atan(1/sqrt(2))*180/pi; print('cube diagonal', N(c)); assert f'{float(c):.1f}' == '35.3' and simplify(sin(atan(1/sqrt(2)))**2) == Rational(1, 3)
print('all four worked examples verified')
