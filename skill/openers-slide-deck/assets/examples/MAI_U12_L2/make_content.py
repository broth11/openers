"""MAI HL U12 L2, "Displacement and Distance from Velocity": content.json for the openers-slide-deck build (1 November 2026).

Two scenes (the toy car given by its velocity, Michael's ride), six questions answered on boards, and a recap lab.
Each scene shows a track above a standard v-t graph (the s-t graph is hidden). As time runs, the area between the v curve and
the t-axis is shaded, one colour above the axis and one below it, and a readout under the graph gives the area. Each question
autoplays to a checkpoint and stops; the car stays hidden until the answer is revealed (deck kit v24, `area` graph item,
`hide` state, `areaLab` preset).

Run from this folder:  python3 make_content.py   (writes content.json; sympy checks the numbers it states)
"""
import copy, json, math
import sympy as sp

t = sp.Symbol('t')
R = sp.Rational

# ---------------------------------------------------------------- models (sympy; the deck samples these)
V1 = 6 - 2 * t                                  # scene 1: velocity of the car, m/s, 0 <= t <= 8
S1 = sp.integrate(V1, (t, 0, t))                # s(0) = 0
V2 = R(18, 5) * t**2 - 60 * t + 285             # scene 2: velocity of Michael, m/min, 0 <= t <= 15
S2 = sp.integrate(V2, (t, 0, t))                # s(0) = 0 (home)
VR = t**2 - 7 * t + 10                          # recap function
assert sp.expand(S1 - (6 * t - t**2)) == 0 and sp.expand(S2 - (R(6, 5) * t**3 - 30 * t**2 + 285 * t)) == 0
area = lambda v, a, b: sp.integrate(v, (t, a, b))
# scene 1 (Q1 to Q3)
assert area(V1, 0, 3) == 9 == R(1, 2) * 3 * 6
assert area(V1, 3, 6) == -9 == -R(1, 2) * 3 * 6
assert area(V1, 6, 8) == -16 == -R(1, 2) * (6 + 10) * 2
assert [S1.subs(t, k) for k in (3, 6, 8)] == [9, 0, -16]
assert V1.subs(t, 0) == 6 and V1.subs(t, 6) == -6 and V1.subs(t, 8) == -10 and sp.solve(V1, t) == [3]
assert 9 + 9 + 16 == 34 and 9 - 9 - 16 == -16
assert area(V1, 0, 3) - area(V1, 3, 6) - area(V1, 6, 8) == 34 and area(V1, 0, 8) == -16
# scene 2 (Q4 to Q6)
assert sp.discriminant(V2, t) == -504 and min(V2.subs(t, R(k, 4)) for k in range(0, 61)) > 0
assert area(V2, 0, 5) == 825 and area(V2, 5, 15) == 750 and area(V2, 0, 15) == 1575
assert S2.subs(t, 5) == 825 and S2.subs(t, 15) == 1575 and R(750, 10) == 75
assert area(V2, 0, 5) + area(V2, 5, 15) == 1575
# recap function: roots 2 and 5; pieces +26/3, -9/2, +26/3; signed 77/6; total 131/6
assert sp.factor(VR) == (t - 2) * (t - 5) and sp.solve(VR, t) == [2, 5]
pieces = [area(VR, 0, 2), area(VR, 2, 5), area(VR, 5, 7)]
assert pieces == [R(26, 3), -R(9, 2), R(26, 3)]
assert area(VR, 0, 7) == R(77, 6) and sum(abs(p) for p in pieces) == R(131, 6)
assert min(VR.subs(t, R(k, 4)) for k in range(0, 29)) == -R(9, 4)


def table(expr, t1, dt=0.05):
    f = sp.lambdify(t, expr, 'math')
    n = round(t1 / dt)
    return [[round(i * dt, 3), round(f(i * dt), 4)] for i in range(n + 1)]


def cumulative(v, t1, dt=0.05):
    """exact signed area from 0 to t at each step of the table, as numbers"""
    F = sp.integrate(v, (t, 0, t))
    return table(F, t1, dt)


def abs_area(v, T, roots):
    """area under |v| from 0 to x (exact), x a rational in [0, T]; roots are the sign changes of v inside (0, T)"""
    cuts = [0] + [r for r in roots if 0 < r < T] + [T]
    def G(x):
        tot = sp.Integer(0)
        for a, b in zip(cuts, cuts[1:]):
            if x <= a:
                break
            tot += abs(sp.integrate(v, (t, a, min(b, x))))
        return tot
    return G


# ---------------------------------------------------------------- the hill (scene 2), schematic and consistent with the data
T2 = 15
V0, SIN_MAX = 190.0, 0.30
ALPHA = SIN_MAX / (1 / 35 - 1 / V0)
vf, sf = sp.lambdify(t, V2, 'math'), sp.lambdify(t, S2, 'math')
N = T2 * 400
xs, hs, ds = [0.0], [0.0], [0.0]
for i in range(1, N + 1):
    ta, tb = (i - 1) / 400, i / 400
    d = sf(tb) - sf(ta)
    th = math.asin(ALPHA * (1 / vf((ta + tb) / 2) - 1 / V0))
    xs.append(xs[-1] + d * math.cos(th)); hs.append(hs[-1] + d * math.sin(th)); ds.append(sf(tb))
steepest_t = max(range(N), key=lambda i: (hs[i + 1] - hs[i]) / (ds[i + 1] - ds[i])) / 400
assert abs(steepest_t - 25 / 3) < 0.01, steepest_t
kx = 900 / xs[-1]
hmin, hmax = min(hs), max(hs)
ky = 140 / (hmax - hmin)                                   # vertical exaggeration: the picture is a sketch, not to scale
HILL = [[round(ds[i], 1), round(50 + xs[i] * kx, 1), round(260 - (hs[i] - hmin) * ky, 1)] for i in range(0, N + 1, 20)]

# ---------------------------------------------------------------- scene motion tables, windows, facts
ORANGE, POS, NEG = 'orange', 'teal', 'pink'
M1 = {'pts': table(S1, 8), 'vt': table(V1, 8), 'area': cumulative(V1, 8), 'dot': 1, 'xmin': -18, 'xmax': 10, 'lab': 4, 'unit': 'm', 'tunit': 's'}
M2 = {'pts': table(S2, T2), 'vt': table(V2, T2), 'area': cumulative(V2, T2), 'hill': HILL, 'dot': 1, 'unit': 'm', 'tunit': 'min', 'sdp': 0}
assert M1['area'][-1][1] == -16 and [r for r in M1['area'] if r[0] == 3][0][1] == 9 and [r for r in M1['area'] if r[0] == 6][0][1] == 0
assert [r for r in M2['area'] if r[0] == 5][0][1] == 825 and M2['area'][-1][1] == 1575

WIN = {
    1: {'xmin': -0.5, 'xmax': 8.6, 'ymin': -11.5, 'ymax': 7.5, 'gridx': 1, 'gridy': 2, 'xtick': 1, 'ytick': 2, 'xname': 't', 'yname': 'v', 'xtickFrom': 0, 'xtickBottom': True, 'aspect': 2.7, 'aspectPortrait': 2.7, 'labelMask': True},
    2: {'xmin': -1.5, 'xmax': 16.5, 'ymin': -45, 'ymax': 330, 'gridx': 5, 'gridy': 50, 'xtick': 5, 'ytick': 100, 'xname': 't', 'yname': 'v', 'xtickFrom': 0, 'aspect': 2.7, 'aspectPortrait': 2.7, 'labelMask': True},
}
F = {
    'start1':  {'html': 'The car starts at <b>$O$</b>, so <b>$s=0$</b> at $t=0$', 'c': ORANGE},
    'vel1':    {'html': 'Velocity <b>$v(t)=6-2t$</b> in $\\text{m s}^{-1}$, for $0\\le t\\le 8$ seconds', 'c': 'blue', 'shape': 'cv'},
    'above':   {'html': 'Area <b>above</b> the $t$-axis is shaded in one colour', 'c': POS, 'shape': 'none'},
    'below':   {'html': 'Area <b>below</b> the $t$-axis is shaded in another', 'c': NEG, 'shape': 'none'},
    'start2':  {'html': 'He starts at home, so <b>$s=0$</b> at $t=0$', 'c': ORANGE},
    'vel2':    {'html': 'Velocity <b>$v(t)=3.6t^2-60t+285$</b> in $\\text{m min}^{-1}$, for $0\\le t\\le 15$ minutes', 'c': 'blue', 'shape': 'cv'},
    'shade2':  {'html': 'The area under the graph is shaded as he rides', 'c': POS, 'shape': 'none'},
    'unit2':   {'html': '$s$ is the distance from home in metres, $t$ is in minutes', 'shape': 'none'},
}
GIVEN = {
    1: [{'html': '<b>$v(t)=6-2t$</b>', 'c': 'blue', 'shape': 'cv'}, {'html': '<b>$s=0$ at $t=0$</b>', 'c': ORANGE}],
    2: [{'html': '<b>$v(t)=3.6t^2-60t+285$</b>', 'c': 'blue', 'shape': 'cv'}, {'html': '<b>$s=0$ at $t=0$</b>', 'c': ORANGE}],
}
PTS, KIND = {1: M1, 2: M2}, {1: 'track', 2: 'ride'}
SEC = {1: 1.5, 2: 0.45}                     # seconds of animation per unit of time (before meta.animSpeed)
ALT = {1: 'A toy car on a straight track above the graph of velocity against time, with the area under the graph shaded as time runs',
       2: 'A cyclist on a hill above the graph of velocity against time, with the area under the graph shaded as time runs'}
NAME = {1: 'The toy car, reversed', 2: "Michael's ride"}
VF = {1: sp.lambdify(t, V1, 'math'), 2: sp.lambdify(t, V2, 'math')}


def state(tt, hide=True, read='t', frm=0):
    """one scene state: cursor at tt; hide = car/rider and dots hidden; read 't' shows only the clock, 'ts' also the position; frm = the area readout counts from here"""
    return {'t': tt, 'hide': hide, 'read': read, 'areaFrom': frm}


def scene(n, states, frm=None):
    sc = {'kind': KIND[n], 'layout': 'stack', 'alt': ALT[n], 'color': ORANGE, 'sec': SEC[n], 'motion': PTS[n], 'states': states}
    if frm is not None:
        sc['from'] = frm
    return sc


def base_items(n):
    return [{'kind': 'trace', 'pts': 'vt', 'color': 'blue'},
            {'kind': 'area', 'pts': 'vt', 'posColor': POS, 'negColor': NEG, 'opacity': 0.5},
            {'kind': 'marker', 'pts': 'vt', 'color': ORANGE, 'guides': False}]


def checkpoint_line(n, at):
    """a dashed vertical at the previous checkpoint, from the t-axis to the curve"""
    return [{'kind': 'segment', 'from': [at, 0], 'to': [at, round(VF[n](at), 4)], 'dashed': True}] if at else []


def graph(n, states, frm=None, mark=0):
    items = checkpoint_line(n, mark) + base_items(n)
    return {'window': dict(WIN[n]), 'scene': scene(n, states, frm), 'items': items, 'given': [dict(g) for g in GIVEN[n]]}


def walk(cap, tex, note=None, ans=False):
    w = {'cap': cap, 'tex': tex}
    if note:
        w['note'] = note
    if ans:
        w['ans'] = True
    return {'walk': w}


def q(n, k, title, stem, blocks, g):
    return {'type': 'example', 'scene': n, 'q': k, 'eyebrow': f'{NAME[n]} · Question {k}', 'title': title, 'stem': stem, 'blocks': blocks, 'graph': g}


def split(d, cut, stem2):
    """one question over two slides (density): blocks[:cut] stay; the rest go to a continuation slide that opens on its first reveal"""
    a, b = copy.deepcopy(d), copy.deepcopy(d)
    a['title'] += ' (1 of 2)'; b['title'] += ' (2 of 2)'
    a['blocks'], b['blocks'] = d['blocks'][:cut], d['blocks'][cut:]
    b['cont'], b['stem'] = True, stem2
    ga, gb = a['graph'], b['graph']
    ga['items'] = [it for it in ga['items'] if it.get('step', 0) <= cut]
    for it in gb['items']:
        it['step'] = max(0, it.get('step', 0) - cut)
    sts = d['graph']['scene']['states']
    ga['scene']['states'] = [x for x in sts if x[0] <= cut]
    base = [x for x in sts if x[0] <= cut][-1][1]
    gb['scene']['states'] = [[0, base]] + [[r - cut, v] for r, v in sts if r > cut]
    gb['scene'].pop('from', None)
    return [a, b]


def setup(n, head, pre, para, facts):
    st = [[0, state(0, True, 'none')], [1, state(0, True, 'none')]]
    return {'type': 'example', 'scene': n, 'eyebrow': f'{NAME[n]} · The situation', 'title': head,
            'setup': {'preamble': pre, 'para': para, 'facts': [dict(F[k]) for k in facts]},
            'stem': '', 'blocks': [],
            'graph': {'window': dict(WIN[n]), 'scene': scene(n, st), 'items': base_items(n)}}


def title_card(n, title):
    d = {'type': 'sceneTitle', 'scene': n, 'kicker': f'Scene {n} of 2', 'title': title, 'kind': KIND[n], 'wide': True, 'color': ORANGE,
         'window': {'xmin': 0, 'xmax': 1, 'ymin': 0, 'ymax': 1}, 'state': {}, 'alt': ALT[n].split(' above')[0] + ', drawn large'}
    if n == 1:
        d['motion'] = {'pts': [[0, 0], [1, 0]], 'dot': 1, 'xmin': -18, 'xmax': 10, 'lab': 4, 'unit': 'm', 'tunit': 's'}
    else:
        d['motion'] = {'pts': [[0, 0], [1, 1]], 'hill': [[0, 50, 260], [1, 950, 260]], 'dot': 1, 'unit': 'm', 'tunit': 's'}
    return d


out = [{'type': 'title', 'eyebrow': 'IB Mathematics: Applications and Interpretations HL · Unit 12 · Lesson 2',
        'title': 'Displacement and Distance from Velocity', 'lede': 'Opener: two scenes, six questions and a recap, answered on your boards',
        'code': 'MAI HL U12 L2', 'regime': 'C', 'regimeText': 'boards out, calculator allowed'}]

# ================================================================ scene 1: the toy car, given by its velocity
out.append(title_card(1, 'The Toy Car, Reversed'))
out.append(setup(1, 'A car described by its velocity',
                 'This is the toy car from last lesson, but now we only know its velocity. The track shows the number line with the origin $O$, and the graph shows $v$ against $t$.',
                 'At $t=0$ the car is at $O$. Its velocity is $v(t)=6-2t$ metres per second, for $0\\le t\\le 8$ seconds. '
                 'As time runs, the area between the graph and the $t$-axis is shaded, and the readout under the graph gives the area. The car stays hidden until an answer is revealed.',
                 ['start1', 'vel1', 'above', 'below']))
out.append(q(1, 1, 'How far from O?',
             'The car has run for $3$ seconds, and the shaded area so far is shown under the graph. Where is the car?',
             [walk('The shaded area is a triangle', ['\\tfrac12\\times 3\\times 6&=9'], 'The base is $3$ s and the height is $v(0)=6\\ \\text{m s}^{-1}$.'),
              walk('Position', ['s(3)&=s(0)+9=9\\ \\text{m}'], 'The area under the $v$-$t$ graph is the change in position. The car is $9$ m to the right of $O$.', ans=True)],
             graph(1, [[0, state(3)], [2, state(3, False, 'ts')]], frm=0)))
out.extend(split(q(1, 2, 'Position, distance, displacement',
             'From $t=3$ to $t=6$ the shaded area is below the axis. Where is the car, how far has it travelled, and what is its displacement?',
             [walk('The new area is a triangle below the axis', ['-\\tfrac12\\times 3\\times 6&=-9'], 'Area below the $t$-axis counts as negative: the car is moving left.'),
              walk('Position', ['s(6)&=9+(-9)=0'], 'The car is back at $O$.', ans=True),
              walk('Distance and displacement', ['\\text{distance}&=9+9=18\\ \\text{m}', '\\text{displacement}&=9-9=0\\ \\text{m}'], 'Distance adds the sizes of the areas. Displacement adds the signed areas.', ans=True)],
             graph(1, [[0, state(6, True, 't', 3)], [2, state(6, False, 'ts', 3)]], frm=3, mark=3)), 2, 'How far has the car travelled, and what is its displacement?'))
out.extend(split(q(1, 3, 'Total distance and position',
             'From $t=6$ to $t=8$ the shaded area is below the axis again. Where is the car now, and how far has it travelled in total?',
             [walk('The new area is a trapezoid below the axis', ['-\\tfrac12(6+10)\\times 2&=-16'], 'The velocity goes from $-6$ to $-10\\ \\text{m s}^{-1}$ over $2$ s.'),
              walk('Position', ['s(8)&=0+(-16)=-16\\ \\text{m}'], 'The car is $16$ m to the left of $O$.', ans=True),
              walk('Add the areas', ['\\text{displacement}&=9-9-16=-16\\ \\text{m}', '\\text{distance}&=9+9+16=34\\ \\text{m}'],
                   'The signed areas add to the displacement. The sizes of the areas add to the distance.', ans=True)],
             graph(1, [[0, state(8, True, 't', 6)], [2, state(8, False, 'ts', 6)]], frm=6, mark=6)), 2, 'Add the areas. What are the displacement and the distance in total?'))

# scene 1 wrap-up: the whole trip again with the car shown (right = area above the axis, left = area below)
assert V1.subs(t, 3) == 0 and V1.subs(t, 1) > 0 and V1.subs(t, 5) < 0
out.append({'type': 'example', 'scene': 1, 'eyebrow': f'{NAME[1]} · Wrap-up', 'title': 'Direction and the sign of the area', 'beat': 'R1',
            'stem': 'Watch the whole trip again, this time with the car shown. Look at which way it moves and which side of the axis the area is on.',
            'blocks': [walk('The car moves right from $t=0$ to $t=3$', ['v>0\\quad\\text{and}\\quad\\text{area}>0'], 'The graph is above the $t$-axis, the shaded area is positive, and $s$ increases.'),
                       walk('The car moves left from $t=3$ to $t=8$', ['v<0\\quad\\text{and}\\quad\\text{area}<0'], 'At $t=3$ the graph crosses the axis and the car turns round. Below the axis the area is negative, and $s$ decreases.')],
            'graph': graph(1, [[0, state(3, False, 'ts')], [1, state(3, False, 'ts')], [2, state(8, False, 'ts')]], frm=0)})
# the area readout counts from t=0 here, so it is the signed area all the way (+9 at t=3, -16 at t=8)
for it in out[-1]['graph']['scene']['states']:
    it[1]['areaFrom'] = 0

# ================================================================ scene 2: Michael's ride
out.append(title_card(2, "Michael's Ride"))
out.append(setup(2, 'A ride described by his velocity',
                 "This is Michael's ride from last lesson, but now we only know how fast he is going. The graph shows his velocity against time.",
                 'Michael starts at home, so $s=0$ at $t=0$. His velocity is $v(t)=3.6t^2-60t+285$ metres per minute, for $0\\le t\\le 15$ minutes. '
                 'The area under the graph is shaded as time runs. The hill and the rider stay hidden until an answer is revealed.',
                 ['start2', 'vel2', 'shade2', 'unit2']))
out.append(q(2, 4, 'The first five minutes',
             'Michael has ridden for $5$ minutes, and the shaded area so far is shown under the graph. How far has he ridden?',
             [walk('Read the area', ['\\text{area}&=825'], 'The area under the $v$-$t$ graph is the change in position.'),
              walk('Distance from home', ['s(5)&=s(0)+825=825\\ \\text{m}'], 'He starts at home, so this is also how far he has ridden.', ans=True)],
             graph(2, [[0, state(5)], [2, state(5, False, 'ts')]], frm=0)))
out.append(q(2, 5, 'The next ten minutes',
             'Michael rides on to $t=15$. The area from $t=5$ to $t=15$ is shown under the graph. How far did he ride in those ten minutes?',
             [walk('Read the area', ['\\text{area}&=750\\ \\text{m}'], 'It is the change in position from $t=5$ to $t=15$, and he never turns round.', ans=True),
              walk('Average speed', ['\\frac{750}{10}&=75\\ \\text{m min}^{-1}'], 'This is the average speed from the last lesson: the same $750$ m in $10$ minutes.')],
             graph(2, [[0, state(15, True, 't', 5)], [1, state(15, False, 't', 5)]], frm=5, mark=5)))
out.extend(split(q(2, 6, 'Home to the friend\'s house',
             'How far from home is Michael at $t=15$? Is that the same as the distance he rode?',
             [walk('Add the areas', ['s(15)&=s(0)+825+750', '&=1575\\ \\text{m}'], 'He starts at home, so $s(0)=0$.', ans=True),
              walk('Distance or displacement?', ['v&>0\\ \\text{for all }t'], '$v$ is never zero, so he never turns round. The distance he rode and his distance from home agree.', ans=True),
              walk('Position from velocity', ['s(15)&=s(0)+\\text{signed area}'], 'Start position plus the signed area gives the position. Worked Example 1 in the notes starts here.')],
             graph(2, [[0, state(15, True, 't', 5)], [1, state(15, False, 'ts', 5)]], frm=15, mark=5)), 2, 'What is the rule for finding the position from the velocity?'))

# ================================================================ recap: area under any velocity
ROOTS = [2, 5]
G = abs_area(VR, 7, ROOTS)
Fx = lambda x: sp.integrate(VR, (t, 0, x))
exactF = [[int(Fx(R(k, 2)).p), int(Fx(R(k, 2)).q)] for k in range(15)]
exactG = [[int(G(R(k, 2)).p), int(G(R(k, 2)).q)] for k in range(15)]
assert exactF[14] == [77, 6] and exactG[14] == [131, 6]
assert Fx(2) == R(26, 3) and Fx(5) - Fx(2) == -R(9, 2) and G(5) - G(2) == R(9, 2) and Fx(7) - Fx(5) == R(26, 3)
out.append({'type': 'lab', 'preset': 'areaLab', 'eyebrow': 'Recap · Displacement and distance from velocity', 'title': 'Area under any velocity',
            'init': {'window': {'xmin': -0.6, 'xmax': 7.6, 'ymin': -4, 'ymax': 11.5, 'gridx': 1, 'gridy': 2, 'xtick': 1, 'ytick': 2, 'xname': 't', 'yname': 'v', 'xtickFrom': 0},
                     'T': 7, 'vt': table(VR, 7), 'F': exactF, 'G': exactG, 'posColor': POS, 'negColor': NEG, 'start': [1, 6],
                     'cards': ['The change in displacement is the signed area.', 'The total distance is the area under $|v|$.', 'Position = start position + signed area.']}})

meta = {'cohort': 'MAI', 'cohortLabel': 'MAI HL', 'lesson': 2, 'topic': 'DisplacementAndDistanceFromVelocity', 'topicWords': 'Displacement and distance from velocity',
        'file': 'mai-hl-u12-l02-displacement-and-distance-from-velocity.html', 'artifactTitle': 'MAI HL U12 L2 Displacement and Distance from Velocity',
        'source': 'openers brief approved by Ben 2026-11-01 (Opener brief - Claude Code.md); motion scenes with a v-t graph and shaded area are deck kit v24',
        'largeGraphs': True, 'animSpeed': 1.5}
json.dump({'meta': meta, 'slides': out}, open('content.json', 'w'), indent=1, ensure_ascii=False)
print(len(out), 'slides')
for i, s in enumerate(out):
    print(i, s['type'], s.get('eyebrow', s.get('title', '')), '|', s.get('title', ''))
