"""Independent exact checks for the three U5 L1 basketball models."""
import sympy as s

t, a, b, c = s.symbols('t a b c')
R = s.Rational
models = {'A': -5*(t-R(3,5))**2+R(19,5),
          'B': -5*t**2+7*t+R(3,2),
          'C': -5*t*(t-R(6,5))+R(12,5)}
assert s.solve(s.Eq(2, a*R(3,5)**2+R(19,5)), a) == [-5]
observations = [(R(1,5), R(27,10)), (R(3,5), R(39,10)), (1,R(7,2))]
system = [a*x*x+b*x+c-y for x,y in observations]
assert s.solve(system, [a,b,c]) == {a:-5,b:7,c:R(3,2)}
assert s.Matrix([[x*x,x,1] for x,_ in observations]).det() != 0
assert s.solve(s.Eq(4-R(12,5), a*R(2,5)*(R(2,5)-R(6,5))), a) == [-5]
assert models['C'].subs(t, 0) == models['C'].subs(t,R(6,5)) == R(12,5)
assert models['C'].subs(t,R(2,5)) == 4
maxima, landings = {}, {}
for name, h in models.items():
    peak = s.solve(s.diff(h,t),t)[0]
    maxima[name] = h.subs(t,peak)
    landings[name] = next(r for r in s.solve(h,t) if r > 0)
    assert h.subs(t,0) > 0
    assert s.diff(h,t,2) == -10
    assert s.simplify(h.subs(t,landings[name])) == 0
    assert s.simplify(h.subs(t,peak)-maxima[name]) == 0
    print(f'{name}: {s.expand(h)}; vertex=({peak},{maxima[name]}); landing={landings[name]} ≈ {float(landings[name]):.9f}')
assert max(maxima,key=maxima.get) == 'C'
assert max(landings,key=lambda n:float(landings[n])) == 'B'
assert [f'{float(landings[n]):.2f}' for n in 'ABC'] == ['1.47','1.59','1.52']
assert [maxima[n] for n in 'ABC'] == [R(19,5),R(79,20),R(21,5)]
print('All exact model, system, maxima, domain, and comparison checks passed.')
