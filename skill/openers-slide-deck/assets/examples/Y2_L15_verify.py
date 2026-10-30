from sympy import *
d=lambda a: a*pi/180
# WE1
assert (118+180)%360==298
# WE2
dd=N(32/tan(d(9))); assert abs(dd-202.04)<0.01 and round(dd)==202; print('WE2 d =',dd)
# WE3
NBC=360-340; assert NBC==20                  # 01/10 route: N^BC = 20, alternate B^CS = 20
assert 180-85-NBC==75                         # straight line N-S at C: 85 + 75 + 20 = 180
x=sqrt(15**2+22**2-2*15*22*cos(d(75))); xv=float(N(x)); print('WE3 x =',xv); assert round(xv,1)==23.2
s=N(22*sin(d(75))/x); print('sin CBD =',s); assert abs(s-0.91601)<1e-5  # worksheet prints 0.91614..., a typo
a=float(N(asin(s)*180/pi)); print('CBD =',a); assert round(a,1)==66.4
assert 180-a+75>180  # obtuse option impossible
b=(340+a)%360; print('bearing =',b); assert round(b)==46
assert abs((a-NBC)-b)<1e-9                     # 01/10 route: 66.4 - 20 = 046
# check with coordinates
B=Matrix([0,0]); C=B+15*Matrix([sin(d(340)),cos(d(340))]); D=C+22*Matrix([sin(d(85)),cos(d(85))])
brg=N(atan2(D[0],D[1])*180/pi)%360; print('coord bearing =',brg, 'BD=',N((D-B).norm())); assert abs(brg-b)<1e-6
# WE4
assert 180-29==151 and 180-18-151==11
BT=N(55*sin(d(18))/sin(d(11))); print('BT =',BT); assert abs(BT-89.073)<0.001
h=float(N(BT*sin(d(29)))); print('h =',h); assert round(h,1)==43.2
# cross-check: h = 55/(cot18 - cot29)
assert abs(h-N(55/(cot(d(18))-cot(d(29)))))<1e-9
print('all four worked examples verified')
