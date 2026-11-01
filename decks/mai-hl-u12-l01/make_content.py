"""MAI HL U12 L1, "The Language of Motion": content.json for the openers-slide-deck build (v2, 1 November 2026).

Two scenes (the toy car, Michael's ride), seven questions answered on boards, a replay of the car through the sign
diagrams of s, v and a, and a recap card. Each question slide autoplays its scene to a checkpoint and stops; Next
reveals the answer a step at a time (motion scenes, deck kit v23). The scene-1 car is the old scene 2 run on to t = 8,
so one car covers sides of O, direction, speeding up and slowing down, rest, distance and displacement.

Run from this folder:  python3 make_content.py   (writes content.json; sympy checks the numbers it states)
"""
import copy, json, math
import sympy as sp

t = sp.Symbol('t')
R = sp.Rational

# ---------------------------------------------------------------- models (sympy; the deck samples these)
CAR = 6 * t - t**2                      # position of the car, m, t in s, 0 <= t <= 8
S3 = R(6, 5) * t**3 - 30 * t**2 + 285 * t
V3 = sp.diff(S3, t)
assert [CAR.subs(t, k) for k in range(9)] == [0, 5, 8, 9, 8, 5, 0, -7, -16]
assert sp.diff(CAR, t) == 6 - 2 * t and sp.diff(CAR, t, 2) == -2
assert sp.solve(sp.diff(CAR, t), t) == [3] and sp.solve(CAR, t) == [0, 6]
assert sp.expand(V3 - (R(18, 5) * t**2 - 60 * t + 285)) == 0 and sp.discriminant(V3, t) == -504
assert S3.subs(t, 5) == 825 and S3.subs(t, 15) == 1575 and V3.subs(t, 10) == 45 and S3.subs(t, 10) == 1050
TM = sp.solve(sp.diff(V3, t), t)[0]
assert TM == R(25, 3) and S3.subs(t, TM) == R(8875, 9)
assert sp.diff(S3, t, 2).subs(t, TM) == 0                                   # a = 0 where he is slowest


def table(expr, t1, dt=0.05):
    f = sp.lambdify(t, expr, 'math')
    n = round(t1 / dt)
    return [[round(i * dt, 3), round(f(i * dt), 3)] for i in range(n + 1)]


def sign_segments(expr, T):
    """exact sign diagram on (0, T): [[t0, t1, '+'|'-'|'0'], ...] and the interior zeros, from sympy"""
    expr = sp.expand(expr)
    if expr == 0:
        return [[0, T, '0']], []
    zs = [] if sp.degree(expr, t) < 1 else sorted(c.real for c in map(complex, sp.Poly(expr, t).nroots(n=15)) if abs(c.imag) < 1e-9 and 1e-9 < c.real < T - 1e-9)
    pts = [0] + zs + [T]
    segs = []
    for a, b in zip(pts, pts[1:]):
        v = expr.subs(t, sp.Float((a + b) / 2, 15))
        segs.append([round(a, 4), round(b, 4), '+' if v > 0 else '-'])
    return segs, [round(z, 4) for z in zs]


def case(name, s, T, unit, tunit, vunit, aunit, xmin, xmax, lab, step, seconds):
    """everything the replay and the recap need for one motion: tables of s, v, a, their sign diagrams and zeros"""
    v, a = sp.diff(s, t), sp.diff(s, t, 2)
    c = {'name': name, 'T': T, 'unit': unit, 'tunit': tunit, 'vunit': vunit, 'aunit': aunit, 'dot': 1,
         'xmin': xmin, 'xmax': xmax, 'lab': lab, 'step': step, 'seconds': seconds, 'sdp': 1 if xmax < 100 else 0,
         'pts': table(s, T), 'vpts': table(v, T), 'apts': table(a, T), 'segs': {}, 'zeros': {}}
    for k, ex in (('s', s), ('v', v), ('a', a)):
        c['segs'][k], c['zeros'][k] = sign_segments(ex, T)
    for k, pts in (('s', c['pts']), ('v', c['vpts']), ('a', c['apts'])):
        c[k + 'max'] = max(1, max(abs(y) for _, y in pts)) if k == 'a' else max(abs(y) for _, y in pts)
    return c


CASE_CAR = case('Toy car', CAR, 8, 'm', 's', 'm\\,s^{-1}', 'm\\,s^{-2}', -18, 10, 4, 1, 9)
CASE_RIDE = case("Michael's ride", S3, 19, 'm', 'min', 'm\\,min^{-1}', 'm\\,min^{-2}', -200, 3000, 500, 100, 14)
CASE_CUBIC = case('A cubic', t**3 - 6 * t**2 + 9 * t - 1, 5, 'm', 's', 'm\\,s^{-1}', 'm\\,s^{-2}', -3, 21, 2, 1, 9)
CASE_STEADY = case('Steady speed', 10 - 2 * t, 8, 'm', 's', 'm\\,s^{-1}', 'm\\,s^{-2}', -8, 12, 2, 1, 7)
assert CASE_CAR['zeros'] == {'s': [6.0], 'v': [3.0], 'a': []}
assert CASE_CAR['segs']['v'] == [[0, 3.0, '+'], [3.0, 8, '-']] and CASE_CAR['segs']['a'] == [[0, 8, '-']] and CASE_CAR['segs']['s'] == [[0, 6.0, '+'], [6.0, 8, '-']]
assert CASE_RIDE['zeros']['v'] == [] and CASE_RIDE['zeros']['a'] == [round(25 / 3, 4)] and CASE_RIDE['zeros']['s'] == []
assert CASE_CUBIC['zeros']['v'] == [1.0, 3.0] and CASE_CUBIC['zeros']['a'] == [2.0]
assert CASE_STEADY['segs']['a'] == [[0, 8, '0']] and CASE_STEADY['zeros']['s'] == [5.0]
assert [CASE_CUBIC['pts'][i][1] for i in (0, 20, 60, 100)] == [-1.0, 3.0, -1.0, 19.0]       # s(0), s(1), s(3), s(5)

# ---------------------------------------------------------------- the hill (scene 2), schematic and consistent with the data
# sin(theta) = ALPHA * (1/v - 1/V0): the climb is steepest exactly where the rider is slowest (t = 25/3).
V0, SIN_MAX = 190.0, 0.30
ALPHA = SIN_MAX / (1 / 35 - 1 / V0)
vf, sf = sp.lambdify(t, V3, 'math'), sp.lambdify(t, S3, 'math')
N = 19 * 400
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
ORANGE = 'orange'
M1 = {'pts': table(CAR, 8), 'dot': 1, 'xmin': -18, 'xmax': 10, 'lab': 4, 'unit': 'm', 'tunit': 's'}
M2 = {'pts': table(S3, 19), 'hill': HILL, 'dot': 1, 'unit': 'm', 'tunit': 'min', 'sdp': 0}
STUB = {'pts': [[0, 0], [1, 1]], 'hill': [[0, 50, 260], [1, 950, 260]], 'dot': 1, 'unit': 'm', 'tunit': 's'}   # title cards draw no motion

WIN = {
    1: {'xmin': -0.5, 'xmax': 8.6, 'ymin': -18, 'ymax': 11, 'gridx': 1, 'gridy': 2, 'xtick': 1, 'ytick': 4, 'xname': 't', 'yname': 's', 'xtickFrom': 0, 'aspect': 2.2, 'aspectPortrait': 2.2, 'labelMask': True},
    2: {'xmin': -1.5, 'xmax': 20, 'ymin': -250, 'ymax': 3000, 'gridx': 5, 'gridy': 500, 'xtick': 5, 'ytick': 500, 'xname': 't', 'yname': 's', 'xtickFrom': 0, 'aspect': 2.7, 'aspectPortrait': 2.7, 'labelMask': True},
}
F = {
    'orig':    {'html': 'Displacement <b>$s$</b> is the position relative to the origin <b>$O$</b>: $s>0$ is right, $s<0$ is left', 'shape': 'none'},
    'start1':  {'html': 'The car starts at <b>$O$</b>, moving to the right', 'c': ORANGE},
    'strobe':  {'html': 'The strobe leaves <b>one dot every second</b>; $s$ is in metres, $t$ in seconds', 'shape': 'none'},
    'rows':    {'html': 'Dots made while it moves back drop to a <b>second row</b>', 'shape': 'none'},
    'model':   {'html': 'Position along the road <b>$s(t)=1.2t^3-30t^2+285t$</b>', 'c': 'blue', 'shape': 'cv'},
    'u3':      {'html': '$s$ is measured from the start, in metres; $t$ is in minutes, $0\\le t\\le 19$', 'shape': 'none'},
    'start3':  {'html': 'At <b>$t=0$</b> he is at the start, <b>$s=0$</b>', 'c': ORANGE},
    'strobe3': {'html': 'The dots show his position <b>every minute</b>', 'shape': 'none'},
}
GIVEN = {
    1: [{'html': '<b>$s=0$ at $t=0$</b>', 'c': ORANGE}, {'html': 'a dot every <b>$1$ s</b>', 'shape': 'none'}],
    2: [{'html': '<b>$s(t)=1.2t^3-30t^2+285t$</b>', 'c': 'blue', 'shape': 'cv'}, {'html': 'a dot every <b>$1$ min</b>', 'shape': 'none'}],
}
PTS, KIND = {1: M1, 2: M2}, {1: 'track', 2: 'ride'}
SEC = {1: 1.5, 2: 0.45}                     # seconds of animation per unit of time (before meta.animSpeed)
ALT = {1: 'A toy car on a straight track above the graph of position against time',
       2: 'A cyclist on a hill drawn as he rides, above the graph of distance against time'}
NAME = {1: 'The toy car', 2: "Michael's ride"}


def scene(n, states, frm=None):
    sc = {'kind': KIND[n], 'layout': 'stack', 'alt': ALT[n], 'color': ORANGE, 'sec': SEC[n], 'motion': PTS[n], 'states': states}
    if frm is not None:
        sc['from'] = frm
    return sc


def graph(n, states, items, frm=None):
    base = [{'kind': 'trace', 'pts': 'motion', 'dots': 1, 'dotColor': ORANGE}, {'kind': 'marker', 'pts': 'motion', 'color': ORANGE}]
    return {'window': dict(WIN[n]), 'scene': scene(n, states, frm), 'items': base + items, 'given': [dict(g) for g in GIVEN[n]]}


def walk(cap, tex, note=None, ans=False):
    w = {'cap': cap, 'tex': tex}
    if note:
        w['note'] = note
    if ans:
        w['ans'] = True
    return {'walk': w}


def q(n, k, name, title, stem, blocks, g):
    return {'type': 'example', 'scene': n, 'q': k, 'eyebrow': f'{name} · Question {k}', 'title': title, 'stem': stem, 'blocks': blocks, 'graph': g}


def split(d, cut, stem2, frm2=None):
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
    if frm2 is not None:
        gb['scene']['from'] = frm2
    return [a, b]


def setup(n, head, pre, para, facts, items):
    return {'type': 'example', 'scene': n, 'eyebrow': f'{NAME[n]} · The situation', 'title': head,
            'setup': {'preamble': pre, 'para': para, 'facts': [dict(F[k]) for k in facts]},
            'stem': '', 'blocks': [],
            'graph': {'window': dict(WIN[n]), 'scene': scene(n, [[0, {'t': 0, 'read': 'ts'}], [1, {'t': 0, 'read': 'ts'}]]),
                      'items': [{'kind': 'trace', 'pts': 'motion', 'dots': 1, 'dotColor': ORANGE}, {'kind': 'marker', 'pts': 'motion', 'color': ORANGE}] + items}}


def title_card(n, title):
    d = {'type': 'sceneTitle', 'scene': n, 'kicker': f'Scene {n} of 2', 'title': title, 'kind': KIND[n], 'wide': True, 'color': ORANGE,
         'window': {'xmin': 0, 'xmax': 1, 'ymin': 0, 'ymax': 1}, 'state': {}, 'alt': ALT[n].split(' above')[0] + ', drawn large'}
    d['motion'] = dict(M1) if n == 1 else dict(STUB)
    if n == 1:
        d['motion']['pts'] = [[0, 0], [1, 0]]
    return d


out = [{'type': 'title', 'eyebrow': 'IB Mathematics: Applications and Interpretations HL · Unit 12 · Lesson 1',
        'title': 'The language of motion', 'lede': 'Opener: two scenes, seven questions and a recap, answered on your boards',
        'code': 'MAI HL U12 L1', 'regime': 'C', 'regimeText': 'boards out, calculator allowed'}]

# ================================================================ scene 1: the toy car, run on to t = 8
out.append(title_card(1, 'The Toy Car'))
out.append(setup(1, 'A toy car on a straight line',
                 'A toy car is in motion along a straight line. A strobe light leaves a dot at the car\'s position on each flash, which makes a motion diagram.',
                 'At $t=0$ the car is at the origin $O$ and moving to the right. It slows down, comes to rest for an instant, and reverses direction. '
                 'The strobe flashes every second, and dots made while the car moves back are drawn on a second row, so none are hidden.',
                 ['orig', 'start1', 'strobe', 'rows'],
                 [{'kind': 'point', 'at': [0, 0], 'step': 1, 'color': ORANGE, 'label': '(0,\\,0)', 'anchor': 'ne'}]))
out.extend(split(q(1, 1, NAME[1], 'Right of O, slowing down',
             'At $t=2$ which side of $O$ is the car on, and which way is it moving? The gaps between the dots are shrinking: what does that say about $v$ and $a$?',
             [walk('Which side of $O$?', ['s(t)&>0'], 'When $s(t)>0$, the car is to the right of $O$.'),
              walk('Which way?', ['v(t)&>0'], 'The dots move right and the graph of $s$ rises, so the car is moving to the right.'),
              walk('The gaps', ['\\text{gaps: }&5,\\ 3\\ \\text{m}'], 'The gaps shrink: $v$ is positive but decreasing, so $a<0$.', ans=True)],
             graph(1, [[0, {'t': 2, 'read': 'ts'}]], [], frm=0)), 2, 'What do the shrinking gaps say about $v$ and $a$?'))
out.extend(split(q(1, 2, NAME[1], 'At rest',
             'At $t=3$ the car is instantaneously at rest, at its furthest point from $O$. What is $v$ there, and what is $a$?',
             [walk('Velocity', ['v&=0'], 'The car is instantaneously at rest, and the sign of $v$ changes.'),
              walk('The change in each gap', ['\\text{gaps: }&5,\\ 3,\\ 1\\ \\text{m}', '&\\text{each is }2\\text{ less}'], 'The velocity falls by $2\\ \\text{m s}^{-1}$ each second.'),
              walk('Acceleration', ['a&=-2\\ \\text{m s}^{-2}'], 'It is not zero at rest: $v$ is still changing.', ans=True)],
             graph(1, [[0, {'t': 3, 'read': 'ts'}]],
                   [{'kind': 'point', 'at': [3, 9], 'step': 3, 'answer': True, 'label': '(3,\\,9)', 'anchor': 'ne'}], frm=2)), 2, 'What is $a$ at $t=3$?'))
out.append(q(1, 3, NAME[1], 'Distance and displacement',
             'At $t=6$ the car is back at $O$. What is the distance travelled, and what is the change in displacement?',
             [walk('Distance travelled', ['9+9&=18\\ \\text{m}'], 'Distance accumulates whichever way the car travels.', ans=True),
              walk('Change in displacement', ['s(6)-s(0)&=0-0=0\\ \\text{m}'], 'The change in displacement ignores the detour.', ans=True)],
             graph(1, [[0, {'t': 6, 'read': 't'}], [2, {'t': 6, 'read': 'ts'}]],
                   [{'kind': 'point', 'at': [6, 0], 'step': 2, 'answer': True, 'label': '(6,\\,0)', 'anchor': 'ne'}], frm=3)))
out.extend(split(q(1, 4, NAME[1], 'Left of O, speeding up',
             'At $t=7$ which side of $O$ is the car on, and which way is it moving? Do $v$ and $a$ agree or disagree, and where will the next dot be?',
             [walk('Which side of $O$?', ['s(t)&<0'], 'When $s(t)<0$, the car is to the left of $O$.'),
              walk('Which way?', ['v(t)&<0'], 'The dots move left, so the car is moving to the left.'),
              walk('Agree or disagree?', ['v&<0,\\quad a<0'], 'The signs match, so the car is speeding up.', ans=True),
              walk('The next dot', ['\\text{gaps: }&{-5},\\ {-7}\\ \\text{m}', '\\text{next gap}&={-9}', 's&=-7-9=-16\\ \\text{m}'], 'The gaps grow by $2$ m each second.', ans=True)],
             graph(1, [[0, {'t': 7, 'read': 'ts'}], [4, {'t': 8, 'read': 'ts'}]],
                   [{'kind': 'point', 'at': [8, -16], 'step': 4, 'answer': True, 'label': '(8,\\,-16)', 'anchor': 'nw'}], frm=6)), 2, 'Do $v$ and $a$ agree, and where is the next dot?'))

# ---------------------------------------------------------------- read the car through s, v and a (differentiate, then three segments)
SIGN_WIN = {'aspect': 2}
AR = [{'html': '<b>$v$</b>: velocity', 'c': 'blue', 'shape': 'cv'}, {'html': '<b>$a$</b>: the pull', 'c': 'red', 'shape': 'cv'}]


def signs_slide(title, stem, blocks, states, frm=None, beat='M', given=None):
    sc = {'kind': 'track', 'layout': 'signs', 'alt': 'The car with velocity and acceleration arrows above stacked graphs and sign diagrams of s, v and a',
          'color': ORANGE, 'sec': 1.5, 'motion': CASE_CAR, 'states': states}
    if frm is not None:
        sc['from'] = frm
    return {'type': 'example', 'scene': 1, 'beat': beat, 'eyebrow': f'{NAME[1]} · Read the motion', 'title': title, 'stem': stem, 'blocks': blocks,
            'graph': {'window': dict(SIGN_WIN), 'scene': sc, 'items': [], 'given': given if given is not None else [dict(g) for g in AR]}}


out.append(signs_slide('Find v and a', 'Differentiate $s(t)=6t-t^2$ to find the velocity and the acceleration.',
                       [walk('Velocity is the rate of change of $s$', ['v(t)=s\'(t)&=6-2t']),
                        walk('Acceleration is the rate of change of $v$', ['a(t)=v\'(t)&=-2\\ \\text{m s}^{-2}'], 'The graphs and sign diagrams of $s$, $v$ and $a$ now fill in.', ans=True)],
                       [[0, {'t': 0, 'show': 1, 'full': True, 'arrows': False, 'cursor': False, 'read': 'none'}],
                        [1, {'t': 0, 'show': 2, 'full': True, 'arrows': False, 'cursor': False, 'read': 'none'}],
                        [2, {'t': 0, 'show': 3, 'full': True, 'arrows': False, 'cursor': False, 'read': 'none'}]],
                       beat='D', given=[]))
out.append(signs_slide('Slowing down, then turning', 'Watch the car again. The arrows show $v$ and the pull $a$; the diagrams show their signs.',
                       [walk('From $t=0$ to $t=3$', ['v&>0,\\quad a<0'], 'The arrows point opposite ways: $v$ and $a$ disagree, so the car slows down.'),
                        walk('At $t=3$', ['v&=0'], 'The sign of $v$ changes, so the car turns round. The pull $a=-2$ does not change.', ans=True)],
                       [[0, {'t': 3, 'read': 'ts'}]], frm=0))
out.append(signs_slide('Speeding up, then passing O', 'Keep watching. What do the arrows and the diagrams say now?',
                       [walk('From $t=3$ to $t=6$', ['v&<0,\\quad a<0'], 'Both arrows point left: $v$ and $a$ agree, so the car speeds up.'),
                        walk('At $t=6$', ['s&=0'], 'The sign of $s$ changes, so the car passes through $O$ to the other side.', ans=True)],
                       [[0, {'t': 6, 'read': 'ts'}]], frm=3))
out.append(signs_slide('What each zero tells you', 'Each diagram changes sign at a zero. What does each one mean for the car?',
                       [walk('When $s=0$', [], 'The car is at $O$. If $s$ changes sign, it has crossed to the other side.'),
                        walk('When $v=0$', [], 'The car is at rest. If $v$ changes sign, it turns round.'),
                        walk('When $a=0$', [], 'The pull vanishes, so $v$ is momentarily steady. If $a$ changes sign, speeding up and slowing down swap. This car never has $a=0$.')],
                       [[0, {'t': 8, 'read': 'ts'}]], frm=6))

# ================================================================ scene 2: Michael's ride
out.append(title_card(2, "Michael's Ride"))
out.append(setup(2, 'A ride over a hill',
                 'Michael rides up a hill and down the other side to his friend\'s house. The dots show his position at various times $t$.',
                 'His position along the road, measured from the start, is $s(t)=1.2t^3-30t^2+285t$ metres, for $0\\le t\\le 19$ minutes. '
                 'He never rides backward, so $s$ is also the distance he has travelled. The hill is drawn only as he rides, so its steepness is not visible ahead of him. The picture is a sketch, not to scale.',
                 ['model', 'u3', 'start3', 'strobe3'],
                 [{'kind': 'point', 'at': [0, 0], 'step': 1, 'color': ORANGE, 'label': '(0,\\,0)', 'anchor': 'ne'}]))
SHIFT = float(TM)
out.append(q(2, 5, NAME[2], 'The steepest part',
             'Michael has ridden for $12$ minutes. At what point do you think the hill was steepest? How far had Michael travelled to this point?',
             [walk('Steepest means slowest', ['\\text{gaps from }t=7:&\\ 37.8,\\ 35.4,\\ 40.2\\ \\text{m}'],
                   'The closest dots are between $t=8$ and $t=9$: he rides slowest there, so the hill is steepest.'),
              walk('The steepest moment', ['t&\\approx 8.3\\ \\text{min}', 's&\\approx 986\\ \\text{m}'],
                   'Slowest is $35\\ \\text{m min}^{-1}$ at $t=\\tfrac{25}{3}$, where $s=\\tfrac{8875}{9}$ m.', ans=True)],
             graph(2, [[0, {'t': 12, 'read': 't'}], [2, {'t': 12, 'read': 'ts', 'mark': SHIFT}]],
                   [{'kind': 'point', 'at': [SHIFT, float(S3.subs(t, TM))], 'step': 2, 'answer': True, 'label': '(8.3,\\,986)', 'anchor': 'se'}], frm=0)))
out.append(q(2, 6, NAME[2], 'Average speed',
             'How can we find Michael\'s average speed between $t=5$ and $t=15$ minutes? Find it.',
             [walk('Change in position', ['s(15)-s(5)&=1575-825', '&=750\\ \\text{m}'], 'Also his distance, as he never goes back.'),
              walk('Average speed', ['\\frac{s(15)-s(5)}{15-5}&=\\frac{750}{10}', '&=75\\ \\text{m min}^{-1}'], 'It is the gradient of the chord through the two points.', ans=True)],
             graph(2, [[0, {'t': 15, 'read': 't'}]],
                   [{'kind': 'segment', 'from': [5, 825], 'to': [15, 1575], 'step': 2, 'dashed': True, 'color': 'indigo'},
                    {'kind': 'point', 'at': [5, 825], 'step': 1, 'color': 'indigo', 'label': '(5,\\,825)', 'anchor': 'se'},
                    {'kind': 'point', 'at': [15, 1575], 'step': 1, 'color': 'indigo', 'label': '(15,\\,1575)', 'anchor': 'nw'}], frm=12)))
out.extend(split(q(2, 7, NAME[2], 'Speed at an instant',
             'How can we find Michael\'s speed at a particular instant? Estimate it at $t=10$.',
             [walk('Average from $9$ to $11$', ['\\frac{s(11)-s(9)}{11-9}&=46.2\\ \\text{m min}^{-1}'], 'The chord over a short interval around $t=10$.'),
              walk('Shrink the interval', ['\\text{from }9.9\\text{ to }10.1&:\\ 45.012', '\\text{from }9.99\\text{ to }10.01&:\\ 45.00012'], 'The values approach $45$ as the chord becomes the tangent.'),
              walk('Differentiate $s$', ['v(t)=s\'(t)&=3.6t^2-60t+285', 'v(10)&=360-600+285', '&=45\\ \\text{m min}^{-1}'],
                   'The instantaneous speed is the gradient of the tangent. Worked Example 1 in the notes starts here.', ans=True)],
             graph(2, [[0, {'t': 15, 'read': 'ts'}]],
                   [{'kind': 'point', 'at': [10, 1050], 'step': 1, 'color': 'indigo', 'label': '(10,\\,1050)', 'anchor': 'nw'},
                    {'kind': 'segment', 'from': [9, float(S3.subs(t, 9))], 'to': [11, float(S3.subs(t, 11))], 'step': 1, 'dashed': True, 'color': 'indigo'},
                    {'kind': 'line', 'through': [[10, 1050], [11, 1095]], 'step': 3, 'answer': True}])), 2, 'Now find $v(10)$ exactly.'))

# ================================================================ recap: read any motion through s, v and a
out.append({'type': 'lab', 'preset': 'motionSigns', 'eyebrow': 'Recap · The language of motion', 'title': 'Read any motion',
            'init': {'cases': [CASE_CAR, CASE_RIDE, CASE_CUBIC, CASE_STEADY], 'color': ORANGE,
                     'alt': 'A car on a number line with velocity and acceleration arrows above stacked graphs and sign diagrams of s, v and a'}})

# ---------------------------------------------------------------- numbers the text states, once more
assert float(S3.subs(t, 9)) == 1009.8 and float(S3.subs(t, 11)) == 1102.2
assert (S3.subs(t, 11) - S3.subs(t, 9)) / 2 == R(231, 5)        # 46.2
assert S3.subs(t, 10) + V3.subs(t, 10) == 1095                  # the tangent at t = 10 passes through (11, 1095)
gap = lambda k: CAR.subs(t, k) - CAR.subs(t, k - 1)
assert [gap(1), gap(2), gap(3)] == [5, 3, 1] and [gap(6), gap(7), gap(8)] == [-5, -7, -9]
assert CAR.subs(t, 7) + gap(8) == CAR.subs(t, 8) == -16

meta = {'cohort': 'MAI', 'cohortLabel': 'MAI HL', 'lesson': 1, 'topic': 'LanguageOfMotion', 'topicWords': 'The language of motion',
        'file': 'mai-hl-u12-l01-the-language-of-motion.html', 'artifactTitle': 'MAI HL U12 L1 The Language of Motion',
        'source': 'openers brief approved by Ben 2026-11-01 (Opener brief - Claude Code.md); v2 same day: one car to t = 8, replay and recap; motion scenes are deck kit v23',
        'largeGraphs': True, 'animSpeed': 1.5}
json.dump({'meta': meta, 'slides': out}, open('content.json', 'w'), indent=1, ensure_ascii=False)
print(len(out), 'slides')
for i, s in enumerate(out):
    print(i, s['type'], s.get('eyebrow', s.get('title', '')), '|', s.get('title', ''))
