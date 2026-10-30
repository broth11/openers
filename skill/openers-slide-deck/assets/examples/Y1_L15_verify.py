from sympy import *
x,y,t=symbols('x y t')
# WE1
m=Rational(-5-7,3-(-1)); assert m==-3
# WE2
s=solve(Eq(4*x+6*y-9,0),y)[0]; assert expand(s-(-Rational(2,3)*x+Rational(3,2)))==0
# WE3
s=solve(Eq(2*x-5*y+1,0),y)[0]; m1=s.coeff(x); assert m1==Rational(2,5)
m2=-1/m1; assert m2==-Rational(5,2)
L=expand(2*((y+3)-m2*(x-4))); assert expand(L-(5*x+2*y-14))==0
assert (5*4+2*(-3)-14)==0 and m1*m2==-1
# WE4
m=Rational(110-20,6); assert m==15
assert solve(Eq(15*t+20,200),t)==[12]
print("all four worked examples verified")
