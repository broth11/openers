"""MAI HL U12 L3, "From Acceleration Back to Position": content.json for the openers-slide-deck build (2 November 2026).

Two scenes and a recap lab, answered on boards.
  Scene 1 "Two Cars, One Push": two cars share one a-t graph (a = 2) but start with different velocities (0 and 3 m/s) from O.
  Scene 2 "The Fading Push": a = 2e^(-0.5t) from rest; the velocity levels off (a limiting velocity of 4 m/s).
  Recap lab: sliders for the starting velocity and a constant acceleration, with a-t, v-t and s-t stacked and the working written with numbers.
Each scene shows a track above the stacked a-t, v-t and s-t graphs (the "ladder", deck kit v25). As time runs, the area under a and under v is
shaded live. Each question autoplays to a checkpoint and stops; the cars stay hidden until the answer is revealed. No formula for constant
acceleration appears anywhere (Ben, 2 November 2026: the goal is a to v to s by integration, not memorised forms).

Run from this folder:  python3 make_content.py   (writes content.json; sympy checks the numbers it states)
"""
import json
import sympy as sp

t = sp.Symbol('t')
R = sp.Rational

# ---------------------------------------------------------------- scene 1: one a-t graph, two cars (both start at O)
A1 = sp.Integer(2)                                   # m s^-2, 0 <= t <= 4
VA, VB = 2 * t, 2 * t + 3                            # car A starts at rest, car B at 3 m/s
SA, SB = sp.integrate(VA, (t, 0, t)), sp.integrate(VB, (t, 0, t))
assert sp.expand(SA - t**2) == 0 and sp.expand(SB - (t**2 + 3 * t)) == 0
area = lambda f, a, b: sp.integrate(f, (t, a, b))
assert area(A1, 0, 4) == 8 == 2 * 4                                   # Q1: the same gain for both cars
assert VA.subs(t, 4) == 8 and VB.subs(t, 4) == 11 and VB.subs(t, 4) - VA.subs(t, 4) == 3
assert area(VA, 0, 4) == 16 == R(1, 2) * 4 * 8 and area(VB, 0, 4) == 28 == R(1, 2) * (3 + 11) * 4    # Q2
assert SA.subs(t, 4) == 16 and SB.subs(t, 4) == 28 and 28 - 16 == 12 == 3 * 4
assert 5 + area(VB, 0, 4) == 33                                       # Q3: car C starts 5 m right of O with B's velocity graph

# ---------------------------------------------------------------- scene 2: a = 2 e^(-t/2), from rest at O, 0 <= t <= 12
A2 = 2 * sp.exp(-t / 2)
V2 = sp.integrate(A2, (t, 0, t)) + 0
V2 = sp.simplify(V2 - V2.subs(t, 0))                                  # v(0) = 0
S2 = sp.integrate(V2, (t, 0, t))                                      # s(0) = 0
assert sp.simplify(V2 - (4 - 4 * sp.exp(-t / 2))) == 0
assert sp.simplify(S2 - (4 * t - 8 + 8 * sp.exp(-t / 2))) == 0
assert sp.limit(V2, t, sp.oo) == 4 and A2.subs(t, 0) == 2 and sp.limit(A2, t, sp.oo) == 0
assert all(A2.subs(t, R(k, 4)) > 0 for k in range(0, 49))
assert abs(float(V2.subs(t, 12)) - 3.99) < 0.005 and float(V2.subs(t, 12)) < 4          # Q4: 3.99, still rising
assert abs(float(S2.subs(t, 12)) - 40.0) < 0.05 and abs(48 - float(S2.subs(t, 12)) - 8) < 0.05  # Q6: 40.0 m, 8 m short of 48
assert sp.simplify(sp.integrate(4 - V2, (t, 0, sp.oo)) - 8) == 0                                 # the missing area is exactly 8


def table(expr, t1, dt=0.05):
    f = sp.lambdify(t, expr, 'math')
    n = round(t1 / dt)
    return [[round(i * dt, 3), round(float(f(i * dt)), 4)] for i in range(n + 1)]


ORANGE, PINK, RED, TEAL = 'orange', 'pink', 'red', 'teal'
T1, T2 = 4, 12


def ser(expr, area_expr, t1, color, sub=None, **kw):
    d = {'pts': table(expr, t1), 'color': color}
    if area_expr is not None:
        d['area'] = table(area_expr, t1)
    if sub:
        d['sub'] = sub
    d.update(kw)
    return d


M1 = {'T': T1, 'ts': 1, 'dot': 1, 'xmin': -3, 'xmax': 33, 'step': 1, 'lab': 4, 'unit': 'm', 'tunit': 's', 'sdp': 0,
      'cars': [{'name': 'A', 'color': ORANGE, 'pts': table(SA, T1)}, {'name': 'B', 'color': PINK, 'pts': table(SB, T1)}],
      'panels': {'a': {'ymin': 0, 'ymax': 4, 'yticks': [2, 4], 'dp': 0, 'dname': '\\Delta v', 'series': [ser(A1, 2 * t, T1, RED)]},
                 'v': {'ymin': 0, 'ymax': 12, 'yticks': [4, 8, 12], 'dp': 0, 'dname': '\\Delta s',
                       'series': [ser(VA, SA, T1, ORANGE, 'A'), ser(VB, SB, T1, PINK, 'B')]},
                 's': {'ymin': 0, 'ymax': 32, 'yticks': [16, 32], 'dp': 0,
                       'series': [ser(SA, None, T1, ORANGE, 'A'), ser(SB, None, T1, PINK, 'B')]}}}
M2 = {'T': T2, 'ts': 2, 'dot': 2, 'xmin': -4, 'xmax': 44, 'step': 4, 'lab': 8, 'unit': 'm', 'tunit': 's', 'sdp': 1, 'pts': table(S2, T2),
      'panels': {'a': {'ymin': 0, 'ymax': 2.4, 'yticks': [1, 2], 'dp': 2, 'dname': '\\Delta v', 'series': [ser(A2, V2, T2, RED)]},
                 'v': {'ymin': 0, 'ymax': 4.8, 'yticks': [2, 4], 'dp': 2, 'dname': '\\Delta s', 'refs': [{'y': 4, 'label': '\\text{limit}'}],
                       'series': [ser(V2, S2, T2, 'blue')]},
                 's': {'ymin': 0, 'ymax': 44, 'yticks': [20, 40], 'dp': 1, 'series': [ser(S2, None, T2, ORANGE)]}}}
# the area readout of a panel reads the series' own cumulative area table
assert M1['panels']['a']['series'][0]['area'][-1][1] == 8 and M1['panels']['v']['series'][0]['area'][-1][1] == 16 and M1['panels']['v']['series'][1]['area'][-1][1] == 28
assert abs(M2['panels']['a']['series'][0]['area'][-1][1] - 3.9901) < 1e-3 and abs(M2['pts'][-1][1] - 40.0198) < 1e-3

F = {
    'o1':   {'html': 'Both cars start at <b>$O$</b>, so <b>$s=0$</b> at $t=0$', 'c': 'brown', 'shape': ''},
    'a1':   {'html': 'Car A starts from rest: <b>$v=0$</b> at $t=0$', 'c': ORANGE, 'shape': ''},
    'b1':   {'html': 'Car B starts at <b>$v=3\\ \\text{m s}^{-1}$</b> at $t=0$', 'c': PINK, 'shape': ''},
    'acc1': {'html': 'Both have the same <b>$a=2\\ \\text{m s}^{-2}$</b>, for $0\\le t\\le 4$ seconds', 'c': RED, 'shape': 'cv'},
    'st2':  {'html': 'At $O$ and at rest: <b>$s=0$</b> and <b>$v=0$</b> at $t=0$', 'c': ORANGE, 'shape': ''},
    'acc2': {'html': 'Acceleration <b>$a(t)=2e^{-0.5t}$</b> in $\\text{m s}^{-2}$, for $0\\le t\\le 12$ seconds', 'c': RED, 'shape': 'cv'},
    'pos2': {'html': 'The acceleration is always positive, but it gets smaller', 'c': 'grey', 'shape': 'none'},
}
GIVEN = {
    1: [{'html': '<b>$a=2$</b> for both cars', 'c': RED, 'shape': 'cv'}, {'html': 'A: <b>$v=0$ at $t=0$</b>', 'c': ORANGE}, {'html': 'B: <b>$v=3$ at $t=0$</b>', 'c': PINK}],
    2: [{'html': '<b>$a(t)=2e^{-0.5t}$</b>', 'c': RED, 'shape': 'cv'}, {'html': '<b>$s=0,\\ v=0$ at $t=0$</b>', 'c': ORANGE}],
}
KIND, MOT, SEC = {1: 'lanes', 2: 'track'}, {1: M1, 2: M2}, {1: 1.5, 2: 0.5}
ALT = {1: 'Two toy cars in two lanes above one number line, over the graphs of acceleration, velocity and position against time, with the areas shaded as time runs',
       2: 'A toy car on a number line above the graphs of acceleration, velocity and position against time, with the areas shaded as time runs'}
NAME = {1: 'Two cars, one push', 2: 'The fading push'}
WIN = {'aspect': 2}


def st(tt, **kw):
    """one scene state: cursor at tt; cars hidden until the reveal; read 't' shows only the clock"""
    d = {'t': tt, 'hide': True, 'read': 't'}
    d.update(kw)
    return d


def scene(n, states, frm=None):
    sc = {'kind': KIND[n], 'layout': 'ladder', 'alt': ALT[n], 'color': ORANGE, 'sec': SEC[n], 'motion': MOT[n], 'states': states}
    if frm is not None:
        sc['from'] = frm
    return sc


def graph(n, states, frm=0):
    return {'window': dict(WIN), 'scene': scene(n, states, frm), 'items': [], 'given': [dict(g) for g in GIVEN[n]]}


def walk(cap, tex, note=None, ans=False):
    w = {'cap': cap, 'tex': tex}
    if note:
        w['note'] = note
    if ans:
        w['ans'] = True
    return {'walk': w}


def q(n, k, title, stem, blocks, g, choices=None, correct=None, pick=0):
    d = {'type': 'example', 'scene': n, 'q': k, 'eyebrow': f'{NAME[n]} · Question {k}', 'title': title, 'stem': stem, 'blocks': blocks, 'graph': g}
    if choices:
        d.update({'choices': choices, 'correct': correct, 'pickStep': pick})
    return d


def setup(n, head, pre, para, facts, s0, s1):
    return {'type': 'example', 'scene': n, 'eyebrow': f'{NAME[n]} · The situation', 'title': head,
            'setup': {'preamble': pre, 'para': para, 'facts': [dict(F[k]) for k in facts]}, 'stem': '', 'blocks': [],
            'graph': {'window': dict(WIN), 'scene': scene(n, [[0, s0], [1, s1]]), 'items': []}}


def title_card(n, title):
    d = {'type': 'sceneTitle', 'scene': n, 'kicker': f'Scene {n} of 2', 'title': title, 'kind': KIND[n], 'wide': True, 'color': ORANGE,
         'window': {'xmin': 0, 'xmax': 1, 'ymin': 0, 'ymax': 1}, 'state': {}, 'alt': ALT[n].split(' above')[0] + ', drawn large'}
    if n == 1:
        d['motion'] = {'cars': [{'name': 'A', 'color': ORANGE, 'pts': [[0, 0], [1, 0]]}, {'name': 'B', 'color': PINK, 'pts': [[0, 0], [1, 0]]}],
                       'dot': 1, 'xmin': -3, 'xmax': 33, 'step': 1, 'lab': 4, 'unit': 'm', 'tunit': 's'}
    else:
        d['motion'] = {'pts': [[0, 0], [1, 0]], 'dot': 1, 'xmin': -4, 'xmax': 44, 'step': 4, 'lab': 8, 'unit': 'm', 'tunit': 's'}
    return d


out = [{'type': 'title', 'eyebrow': 'IB Mathematics: Applications and Interpretations HL · Unit 12 · Lesson 3',
        'title': 'From Acceleration Back to Position', 'lede': 'Opener: two scenes, six questions and a recap, answered on your boards',
        'code': 'MAI HL U12 L3', 'regime': 'C', 'regimeText': 'boards out, calculator allowed'}]

# ================================================================ scene 1: two cars, one a-t graph
out.append(title_card(1, 'Two Cars, One Push'))
out.append(setup(1, 'One acceleration, two cars',
                 'Two toy cars sit at the origin $O$. They get exactly the same push: the same acceleration. The graphs show $a$, $v$ and $s$ against $t$.',
                 'Both cars are at $O$ at $t=0$. Car A starts from rest, and car B starts with a velocity of $3\\ \\text{m s}^{-1}$. '
                 'Both have an acceleration of $a=2\\ \\text{m s}^{-2}$ for $0\\le t\\le 4$ seconds, so there is only one $a$-$t$ graph. The area under each graph is shaded as time runs.',
                 ['o1', 'a1', 'b1', 'acc1'], st(0, hide=False, show=1, read='none'), st(0, hide=False, show=2, read='none')))
out.append(q(1, 1, 'Who gains more velocity?',
             'Both cars feel the same acceleration for $4$ seconds. Which car gains more velocity?',
             [walk('The shaded area is a rectangle', ['2\\times 4&=8'], 'The area under the $a$-$t$ graph is the change in velocity.'),
              walk('Both gain $8\\ \\text{m s}^{-1}$', ['v_A&=0+8=8,\\quad v_B=3+8=11'], None, ans=True)],
             graph(1, [[0, st(4, show=1, shade=['a'])], [1, st(4, show=1, shade=['a'], areas=['a'])], [2, st(4, show=2, shade=['a'], areas=['a'], vals=['v'])]]),
             choices=['Car A, which starts from rest', 'Car B, which is already moving', 'Both gain the same'], correct=2, pick=2))
out.append(q(1, 2, 'Which car is ahead?',
             'Both cars start at $O$. Now watch the two velocities. At $t=4$, which car is ahead, and by how much?',
             [walk('The area under each velocity graph', ['\\text{A: }&\\tfrac12\\times 4\\times 8=16', '\\text{B: }&\\tfrac12(3+11)\\times 4=28'],
                   None),
              walk('The gap', ['28-16&=12\\ \\text{m}'], 'Car B is $12$ m ahead: the extra $3\\ \\text{m s}^{-1}$ for $4$ s is the rectangle $3\\times 4=12$.', ans=True)],
             graph(1, [[0, st(4, show=2, shade=['v'])], [1, st(4, show=2, shade=['v'], areas=['v'])], [2, st(4, show=3, shade=['v'], areas=['v'], vals=['s'], hide=False, read='ts')]])))
out.append(q(1, 3, 'A third car',
             'Car C also has $a=2$. Its velocity is $5\\ \\text{m s}^{-1}$ at $t=1$, and it is at $15$ m at $t=2$. Where is car C at $t=4$?',
             [walk('Integrate to find $v$', ['v&=2t+C', '5&=2+C\\ \\Rightarrow\\ C=3'], None),
              walk('Integrate again to find $s$', ['s&=t^{2}+3t+D', '15&=4+6+D\\ \\Rightarrow\\ D=5'], None),
              walk('Use $t=4$', ['s(4)&=16+12+5=33\\ \\text{m}'], 'Car C has car B\'s velocity graph, shifted $5$ m along.', ans=True)],
             graph(1, [[k, st(4, show=1, shade=['a'], areas=['a'], hide=True)] for k in range(4)])))

# ================================================================ scene 2: the fading push
out.append(title_card(2, 'The Fading Push'))
out.append(setup(2, 'An acceleration that fades',
                 'This toy car starts from rest at $O$. This time the push fades away: the acceleration gets smaller as time goes on, but it never quite reaches zero.',
                 'At $t=0$ the car is at $O$ and at rest. Its acceleration is $a(t)=2e^{-0.5t}$ metres per second squared, for $0\\le t\\le 12$ seconds. '
                 'The area under the $a$-$t$ graph is shaded as time runs.',
                 ['st2', 'acc2', 'pos2'], st(0, hide=False, show=1, read='none'), st(0, hide=False, show=1, read='none')))
out.append(q(2, 4, 'After a long time',
             'The acceleration is always positive. After a long time, what happens to the velocity?',
             [walk('The area under the $a$-$t$ graph', ['\\Delta v&\\approx 3.99\\ \\text{m s}^{-1}'], 'Each second adds a smaller area than the one before.'),
              walk('The velocity rises, then levels off', ['v(12)&\\approx 3.99\\ \\text{m s}^{-1}'], None, ans=True)],
             graph(2, [[0, st(12, show=1, shade=['a'])], [1, st(12, show=1, shade=['a'], areas=['a'])], [2, st(12, show=2, shade=['a'], areas=['a'], vals=['v'])]]),
             choices=['It keeps growing without any limit', 'It rises, then levels off', 'It rises, then falls back to zero'], correct=1, pick=2))
out.append(q(2, 5, 'Heading for what value?',
             'At $t=12$ the velocity is about $3.99\\ \\text{m s}^{-1}$ and still rising. What value is it heading towards?',
             [walk('The area up to time $t$', ['\\Delta v&=4-4e^{-0.5t}'], 'The area under $2e^{-0.5t}$ from $0$ to $t$ is the velocity, because $v(0)=0$.'),
              walk('Let $t$ get large', ['e^{-0.5t}&\\to 0,\\quad v\\to 4\\ \\text{m s}^{-1}'], 'This is the limiting velocity: the velocity gets close to $4$ but never reaches it.', ans=True)],
             graph(2, [[0, st(12, show=2, shade=['a'], areas=['a'], vals=['v'])], [1, st(12, show=2, shade=['a'], areas=['a'], vals=['v'])],
                       [2, st(12, show=2, shade=['a'], areas=['a'], vals=['v'], refs=['v'])]])))
out.append(q(2, 6, 'How far by 12 seconds?',
             'If the car had travelled at exactly $4\\ \\text{m s}^{-1}$ for all $12$ seconds, it would have gone $48$ m. How far has the real car gone?',
             [walk('Steady speed', ['4\\times 12&=48\\ \\text{m}'], None),
              walk('The area under the velocity graph', ['s(12)&\\approx 40.0\\ \\text{m}'], 'The slow start costs the car about $8$ m.', ans=True)],
             graph(2, [[0, st(12, show=2, shade=['v'], refs=['v'])], [1, st(12, show=2, shade=['v'], refs=['v'], areas=['v'])],
                       [2, st(12, show=3, shade=['v'], refs=['v'], areas=['v'], vals=['s'], hide=False, read='ts')]]),
             choices=['More than 48 m', 'Exactly 48 m', 'Less than 48 m'], correct=2, pick=2))

# ================================================================ recap lab
out.append({'type': 'lab', 'preset': 'ladderLab', 'eyebrow': 'Recap · Constants', 'title': 'Find C and D',
            'init': {'T': 6, 'a': 2, 't0': 3,
                     'modes': {'start': {'t1': 0, 't2': 0, 'v': 3, 's': 5}, 'known': {'t1': 1, 't2': 2, 'v': 5, 's': 15}},
                     'v': {'min': -6, 'max': 8, 'step': 1}, 's': {'min': -10, 'max': 30, 'step': 1},
                     'alt': 'A toy car on a number line above the graphs of acceleration, velocity and position against time',
                     'color': ORANGE, 'colors': {'a': RED, 'v': 'blue', 's': ORANGE, 'pos': TEAL, 'neg': PINK},
                     'prompt': 'Which graph moves with $C$? With $D$?'}})

meta = {'cohort': 'MAI', 'cohortLabel': 'MAI HL', 'lesson': 3, 'topic': 'FromAccelerationBackToPosition', 'topicWords': 'From acceleration back to position',
        'file': 'mai-hl-u12-l03-from-acceleration-back-to-position.html', 'artifactTitle': 'MAI HL U12 L3 From Acceleration Back to Position',
        'source': 'openers plan agreed with Ben 2026-11-02 (grill-me pass); the a-v-s ladder is deck kit v25', 'largeGraphs': True, 'animSpeed': 1.5}
json.dump({'meta': meta, 'slides': out}, open('content.json', 'w'), indent=1, ensure_ascii=False)
print(len(out), 'slides')
for i, s in enumerate(out):
    print(i, s['type'], s.get('eyebrow', s.get('title', '')), '|', s.get('title', ''))
