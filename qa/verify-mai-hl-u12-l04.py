import sympy as s
t=s.symbols('t', real=True)
v=(t-1)*(t-3)*(t-5)/4
a=(3*(t-3)**2-4)/4
assert s.simplify(s.diff(v,t)-a)==0
assert s.solve(v,t)==[1,3,5]
assert s.solve(a,t)==[3-2*s.sqrt(3)/3,3+2*s.sqrt(3)/3]
print('Velocity roots and acceleration roots verified.')
