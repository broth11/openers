"""Independent exact checks for both approved openers. Run with Python + SymPy."""
import sympy as s
x, y = s.symbols('x y', real=True)
p, q = s.symbols('p q', positive=True)
i, n = s.symbols('i n', integer=True, positive=True)
checks = []
def check(name, actual, expected):
    assert s.simplify(actual - expected) == 0, (name, actual, expected)
    checks.append(name)
check('area integral',s.integrate(s.sqrt(x),(x,0,4)),s.Rational(16,3))
check('doubled x profile volume',s.integrate(s.pi*(2*s.sqrt(x))**2,(x,0,4)),32*s.pi)
check('x disc volume', s.integrate(s.pi*x, (x,0,4)), 8*s.pi)
check('negative profile squared', (-s.sqrt(x))**2, x)
check('midpoint sum already exact', s.summation(s.pi*(i-s.Rational(1,2))*4/n*4/n,(i,1,n)),8*s.pi)
check('y disc volume',s.integrate(s.pi*y**4,(y,0,2)),32*s.pi/5)
check('x stretches',s.integrate(s.pi*q**2*x/p,(x,0,4*p)),8*s.pi*p*q**2)
check('y stretches',s.integrate(s.pi*p**2*(y/q)**4,(y,0,2*q)),32*s.pi*q*p**2/5)
a,b,c=s.symbols('a b c')
solution=s.solve([4*a-2*b+c-3,c-1,4*a+2*b+c-3],(a,b,c))
for k,v in [(a,s.Rational(1,2)),(b,0),(c,1)]: check('three point coefficient '+str(k),solution[k],v)
R2=6*y-y*y; r2=2*y-2
check('outer circle expansion',9-(y-3)**2,R2)
check('hemisphere',s.integrate(s.pi*R2,(y,0,3)),18*s.pi)
check('removed cavity',s.integrate(s.pi*r2,(y,1,3)),4*s.pi)
check('base',s.integrate(s.pi*R2,(y,0,1)),8*s.pi/3)
check('walls',s.integrate(s.pi*(R2-r2),(y,1,3)),34*s.pi/3)
check('remaining material',s.integrate(s.pi*R2,(y,0,1))+s.integrate(s.pi*(R2-r2),(y,1,3)),14*s.pi)
# Prove the cavity stays inside the hemisphere over its whole height interval.
assert s.minimum(R2-r2,y,s.Interval(1,3)) == 5
# Every washer partition boundary at y=1 is an actual edge, never a straddling slice.
for count in range(3,37,3):
    assert s.Rational(1,1)/s.Rational(3,count) == count//3
print(f'{len(checks)} symbolic checks plus containment and partition checks passed')
