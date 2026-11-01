"""MAI HL U12 L1, "The Language of Motion": content.json for the openers-slide-deck build.

Approved brief: Ben, 2026-11-01. Three scenes (the toy car, turning round, Michael's ride), seven questions.
Each scene: title card, setup slide, then its questions. Students answer on boards; every question slide autoplays
its scene to a checkpoint and stops, and Next reveals the answer a step at a time (motion scenes, deck kit v23).

Run from this folder:  python3 make_content.py   (writes content.json; sympy checks the numbers it states)
"""
import json, math
import sympy as sp

t = sp.Symbol('t')
R = sp.Rational

# ---------------------------------------------------------------- models (sympy; the deck samples these)
S1 = t**2 / 2 + t - 4
S2 = 6 * t - t**2
S3 = R(6, 5) * t**3 - 30 * t**2 + 285 * t
V3 = sp.diff(S3, t)
assert [S1.subs(t, k) for k in range(5)] == [-4, R(-5, 2), 0, R(7, 2), 8]
assert [S2.subs(t, k) for k in range(7)] == [0, 5, 8, 9, 8, 5, 0]
assert sp.expand(V3 - (R(18, 5) * t**2 - 60 * t + 285)) == 0 and sp.discriminant(V3, t) == -504
assert S3.subs(t, 5) == 825 and S3.subs(t, 15) == 1575 and V3.subs(t, 10) == 45 and S3.subs(t, 10) == 1050
TM = sp.solve(sp.diff(V3, t), t)[0]
assert TM == R(25, 3) and S3.subs(t, TM) == R(8875, 9)


def table(expr, t1, dt):
    f = sp.lambdify(t, expr, 'math')
    n = round(t1 / dt)
    return [[round(i * dt, 3), round(f(i * dt), 3)] for i in range(n + 1)]


def f_(x):
    """number text for a JSON/TeX string: -2.5 -> -2.5"""
    return ('%g' % x)


# ---------------------------------------------------------------- the hill (scene 3), schematic and consistent with the data
# On a road of slope angle th(t), a rider of steady effort goes at v = c / (sin th + k): steepest where slowest.
# We use the inverse: sin th = ALPHA * (1/v - 1/V0), so the climb is steepest exactly where v is least (t = 25/3).
V0, SIN_MAX = 190.0, 0.30
ALPHA = SIN_MAX / (1 / 35 - 1 / V0)
vf = sp.lambdify(t, V3, 'math')
sf = sp.lambdify(t, S3, 'math')
N = 19 * 400
xs, hs, ds = [0.0], [0.0], [0.0]
for i in range(1, N + 1):
    ta, tb = (i - 1) / 400, i / 400
    d = sf(tb) - sf(ta)
    th = math.asin(ALPHA * (1 / vf((ta + tb) / 2) - 1 / V0))
    xs.append(xs[-1] + d * math.cos(th)); hs.append(hs[-1] + d * math.sin(th)); ds.append(sf(tb))
steepest_t = max(range(N + 1), key=lambda i: (hs[min(i + 1, N)] - hs[i]) / (ds[min(i + 1, N)] - ds[i]) if i < N else -9) / 400
assert abs(steepest_t - 25 / 3) < 0.01, steepest_t          # the steepest section is where he is slowest
kx = 900 / xs[-1]
hmin, hmax = min(hs), max(hs)
ky = 140 / (hmax - hmin)                                   # vertical exaggeration: the picture is schematic, not to scale
HILL = [[round(ds[i], 1), round(50 + xs[i] * kx, 1), round(260 - (hs[i] - hmin) * ky, 1)] for i in range(0, N + 1, 20)]   # every 0.05 min

# ---------------------------------------------------------------- scene motion tables
ORANGE = 'orange'
M1 = {'pts': table(S1, 4, 0.05), 'dot': 1, 'xmin': -6, 'xmax': 10, 'lab': 2, 'unit': 'm', 'tunit': 's'}
M2 = {'pts': table(S2, 6, 0.05), 'dot': 1, 'xmin': -1, 'xmax': 10, 'lab': 1, 'unit': 'm', 'tunit': 's'}
M3 = {'pts': table(S3, 19, 0.05), 'hill': HILL, 'dot': 1, 'unit': 'm', 'tunit': 'min', 'sdp': 0}
STUB = {'pts': [[0, 0], [1, 1]], 'hill': [[0, 50, 260], [1, 950, 260]], 'dot': 1, 'unit': 'm', 'tunit': 's'}   # title cards draw no motion

W1 = {'xmin': -0.5, 'xmax': 4.6, 'ymin': -6, 'ymax': 10, 'gridx': 1, 'gridy': 2, 'xtick': 1, 'ytick': 2, 'xname': 't', 'yname': 's', 'xtickFrom': 0, 'aspect': 2.2, 'aspectPortrait': 2.2, 'labelMask': True}
W2 = {'xmin': -0.5, 'xmax': 6.6, 'ymin': -2, 'ymax': 11, 'gridx': 1, 'gridy': 2, 'xtick': 1, 'ytick': 2, 'xname': 't', 'yname': 's', 'xtickFrom': 0, 'aspect': 2.2, 'aspectPortrait': 2.2, 'labelMask': True}
W3 = {'xmin': -1.5, 'xmax': 20, 'ymin': -250, 'ymax': 3000, 'gridx': 5, 'gridy': 500, 'xtick': 5, 'ytick': 500, 'xname': 't', 'yname': 's', 'xtickFrom': 0, 'aspect': 2.7, 'aspectPortrait': 2.7, 'labelMask': True}

# ---------------------------------------------------------------- facts
F = {
    'orig':    {'html': 'Displacement <b>$s$</b> is the position relative to the origin <b>$O$</b>', 'shape': 'none'},
    'u1':      {'html': '$s>0$ is right of $O$, $s<0$ is left; $s$ in metres, $t$ in seconds', 'shape': 'none'},
    'start1':  {'html': 'At <b>$t=0$</b> the car is at <b>$s=-4$ m</b>', 'c': ORANGE},
    'strobe':  {'html': 'The strobe leaves <b>one dot every second</b>', 'shape': 'none'},
    'start2':  {'html': 'The car starts at <b>$O$</b>, moving to the right', 'c': ORANGE},
    'rows':    {'html': 'Dots made while it moves back drop to a <b>second row</b>', 'shape': 'none'},
    'model':   {'html': 'Position along the road <b>$s(t)=1.2t^3-30t^2+285t$</b>', 'c': 'blue', 'shape': 'cv'},
    'u3':      {'html': '$s$ is measured from the start, in metres; $t$ is in minutes, $0\\le t\\le 19$', 'shape': 'none'},
    'start3':  {'html': 'At <b>$t=0$</b> he is at the start, <b>$s=0$</b>', 'c': ORANGE},
    'strobe3': {'html': 'The dots show his position <b>every minute</b>', 'shape': 'none'},
}
GIVEN = {
    1: [{'html': '<b>$s=-4$ m at $t=0$</b>', 'c': ORANGE}, {'html': 'a dot every <b>$1$ s</b>', 'shape': 'none'}],
    2: [{'html': '<b>$s=0$ at $t=0$</b>', 'c': ORANGE}, {'html': 'a dot every <b>$1$ s</b>', 'shape': 'none'}],
    3: [{'html': '<b>$s(t)=1.2t^3-30t^2+285t$</b>', 'c': 'blue', 'shape': 'cv'}, {'html': 'a dot every <b>$1$ min</b>', 'shape': 'none'}],
}

PTS = {1: M1, 2: M2, 3: M3}
WIN = {1: W1, 2: W2, 3: W3}
KIND = {1: 'track', 2: 'track', 3: 'ride'}
SEC = {1: 1.5, 2: 1.5, 3: 0.45}                 # seconds of animation per unit of time (before meta.animSpeed)
ALT = {1: 'A toy car on a straight track above the graph of position against time',
       2: 'A toy car on a straight track above the graph of position against time',
       3: 'A cyclist on a hill drawn as he rides, above the graph of distance against time'}


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
    return {'type': 'example', 'scene': n, 'q': k, 'eyebrow': f'{name} · Question {k}', 'title': title, 'stem': stem,
            'blocks': blocks, 'graph': g}


def split(d, cut, stem2, frm2=None):
    """one question over two slides (density): blocks[:cut] stay; the rest go to a continuation slide that opens on its first reveal"""
    import copy
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


def setup(n, name, head, pre, para, facts, items, t0=0):
    return {'type': 'example', 'scene': n, 'eyebrow': f'{name} · The situation', 'title': head,
            'setup': {'preamble': pre, 'para': para, 'facts': [dict(F[k]) for k in facts]},
            'stem': '', 'blocks': [],
            'graph': {'window': dict(WIN[n]), 'scene': scene(n, [[0, {'t': t0, 'read': 'ts'}], [1, {'t': t0, 'read': 'ts'}]]),
                      'items': [{'kind': 'trace', 'pts': 'motion', 'dots': 1, 'dotColor': ORANGE}, {'kind': 'marker', 'pts': 'motion', 'color': ORANGE}] + items}}


def title_card(n, title, state=None):
    d = {'type': 'sceneTitle', 'scene': n, 'kicker': f'Scene {n} of 3', 'title': title, 'kind': KIND[n], 'wide': True, 'color': ORANGE,
         'window': {'xmin': 0, 'xmax': 1, 'ymin': 0, 'ymax': 1}, 'state': state or {}, 'alt': ALT[n].split(' above')[0] + ', drawn large'}
    d['motion'] = dict(M1 if n == 1 else M2 if n == 2 else STUB)
    if n < 3:
        d['motion']['pts'] = [[0, -4 if n == 1 else 0], [1, 0]]
    return d


NAME = {1: 'The toy car', 2: 'Turning round', 3: "Michael's ride"}
out = [{'type': 'title', 'eyebrow': 'IB Mathematics: Applications and Interpretations HL · Unit 12 · Lesson 1',
        'title': 'The language of motion', 'lede': 'Opener: three scenes, seven questions, answered on your boards',
        'code': 'MAI HL U12 L1', 'regime': 'C', 'regimeText': 'boards out, calculator allowed'}]

# ================================================================ scene 1
out.append(title_card(1, 'The Toy Car'))
out.append(setup(1, NAME[1], 'A toy car on a straight track',
                 'A toy car is in motion along a straight line. A strobe light leaves a dot at the car\'s position on each flash, which makes a motion diagram.',
                 'The displacement $s$ of the car is its position relative to a fixed origin $O$: $s>0$ is right of $O$ and $s<0$ is left. '
                 'At $t=0$ the car is $4$ m left of $O$ and speeding up. The strobe flashes every second.',
                 ['orig', 'u1', 'start1', 'strobe'],
                 [{'kind': 'point', 'at': [0, -4], 'step': 1, 'color': ORANGE, 'label': '(0,\\,-4)', 'anchor': 'ne'}]))
out.append(q(1, 1, NAME[1], 'Left or right?',
             'The car has been moving for $1$ second. Which side of $O$ is it on, and which way is it moving?',
             [walk('Which side of $O$?', ['s(t)&<0'], 'When $s(t)<0$, the car is to the left of $O$.'),
              walk('Which way?', ['v(t)&>0'], 'The dots move right and the graph of $s$ rises, so the car is moving to the right.', ans=True)],
             graph(1, [[0, {'t': 1, 'read': 'ts'}]], [], frm=0)))
out.extend(split(q(1, 2, NAME[1], 'Where is the next dot?',
             'The gaps between the dots are growing. What does that say about $v$, and what is the sign of $a$? Where will the next dot be?',
             [walk('The gaps', ['\\text{gaps: }&1.5,\\ 2.5,\\ 3.5\\ \\text{m}'], 'The car covers more distance each second.'),
              walk('Velocity and acceleration', ['v&>0\\text{ and increasing}', 'a&>0'], 'The signs of $v$ and $a$ are the same, so the speed is increasing.', ans=True),
              walk('The next dot', ['\\text{next gap}&=3.5+1=4.5', 's&=3.5+4.5=8\\ \\text{m}'], 'The gaps grow by $1$ m each second.', ans=True)],
             graph(1, [[0, {'t': 3, 'read': 'ts'}], [3, {'t': 4, 'read': 'ts'}]],
                   [{'kind': 'point', 'at': [4, 8], 'step': 3, 'answer': True, 'label': '(4,\\,8)', 'anchor': 'w'}], frm=1)), 2, 'Where will the next dot be?', frm2=3))
# ================================================================ scene 2
out.append(title_card(2, 'Turning Round'))
out.append(setup(2, NAME[2], 'The car turns back',
                 'The toy car is back at the start of the track. This time it does not keep going the same way.',
                 'At $t=0$ the car is at $O$ and moving to the right. It slows down, comes to rest for an instant, and reverses direction. '
                 'The strobe still flashes once every second. Dots made while the car moves back are drawn on a second row, so none are hidden.',
                 ['orig', 'start2', 'strobe', 'rows'],
                 [{'kind': 'point', 'at': [0, 0], 'step': 1, 'color': ORANGE, 'label': '(0,\\,0)', 'anchor': 'ne'}]))
out.extend(split(q(2, 3, NAME[2], 'At rest',
             'At $t=3$ the car is instantaneously at rest, at its furthest point from $O$. What is $v$ there, and what is $a$?',
             [walk('Velocity', ['v&=0'], 'The car is instantaneously at rest, and the sign of $v$ changes.'),
              walk('The change in each gap', ['\\text{gaps: }&5,\\ 3,\\ 1\\ \\text{m}', '&\\text{each is }2\\text{ less}'], 'The velocity falls by $2\\ \\text{m s}^{-1}$ each second.'),
              walk('Acceleration', ['a&=-2\\ \\text{m s}^{-2}'], 'It is not zero at rest: $v$ is still changing.', ans=True)],
             graph(2, [[0, {'t': 3, 'read': 'ts'}]],
                   [{'kind': 'point', 'at': [3, 9], 'step': 3, 'answer': True, 'label': '(3,\\,9)', 'anchor': 'ne'}], frm=0)), 2, 'What is $a$ at $t=3$?'))
out.append(q(2, 4, NAME[2], 'Distance and displacement',
             'At $t=6$ the car is back at $O$. What is the distance travelled, and what is the change in displacement?',
             [walk('Distance travelled', ['9+9&=18\\ \\text{m}'], 'Distance accumulates whichever way the car travels.', ans=True),
              walk('Change in displacement', ['s(6)-s(0)&=0-0=0\\ \\text{m}'], 'The change in displacement ignores the detour.', ans=True)],
             graph(2, [[0, {'t': 6, 'read': 't'}], [2, {'t': 6, 'read': 'ts'}]],
                   [{'kind': 'point', 'at': [6, 0], 'step': 2, 'answer': True, 'label': '(6,\\,0)', 'anchor': 'nw'}], frm=3)))
# ================================================================ scene 3
out.append(title_card(3, "Michael's Ride"))
out.append(setup(3, NAME[3], 'A ride over a hill',
                 'Michael rides up a hill and down the other side to his friend\'s house. The dots show his position at various times $t$.',
                 'His position along the road, measured from the start, is $s(t)=1.2t^3-30t^2+285t$ metres, for $0\\le t\\le 19$ minutes. '
                 'He never rides backward, so $s$ is also the distance he has travelled. The hill is drawn only as he rides, so its steepness is not visible ahead of him. The picture is a sketch, not to scale.',
                 ['model', 'u3', 'start3', 'strobe3'],
                 [{'kind': 'point', 'at': [0, 0], 'step': 1, 'color': ORANGE, 'label': '(0,\\,0)', 'anchor': 'ne'}]))
SHIFT = float(TM)
out.append(q(3, 5, NAME[3], 'The steepest part',
             'Michael has ridden for $12$ minutes. At what point do you think the hill was steepest? How far had Michael travelled to this point?',
             [walk('Steepest means slowest', ['\\text{gaps from }t=7:&\\ 37.8,\\ 35.4,\\ 40.2\\ \\text{m}'],
                   'The closest dots are between $t=8$ and $t=9$: he rides slowest there, so the hill is steepest.'),
              walk('The steepest moment', ['t&\\approx 8.3\\ \\text{min}', 's&\\approx 986\\ \\text{m}'],
                   'Slowest is $35\\ \\text{m min}^{-1}$ at $t=\\tfrac{25}{3}$, where $s=\\tfrac{8875}{9}$ m.', ans=True)],
             graph(3, [[0, {'t': 12, 'read': 't'}], [2, {'t': 12, 'read': 'ts', 'mark': SHIFT}]],
                   [{'kind': 'point', 'at': [SHIFT, float(S3.subs(t, TM))], 'step': 2, 'answer': True, 'label': '(8.3,\\,986)', 'anchor': 'se'}], frm=0)))
out.append(q(3, 6, NAME[3], 'Average speed',
             'How can we find Michael\'s average speed between $t=5$ and $t=15$ minutes? Find it.',
             [walk('Change in position', ['s(15)-s(5)&=1575-825', '&=750\\ \\text{m}'], 'Also his distance, as he never goes back.'),
              walk('Average speed', ['\\frac{s(15)-s(5)}{15-5}&=\\frac{750}{10}', '&=75\\ \\text{m min}^{-1}'], 'It is the gradient of the chord through the two points.', ans=True)],
             graph(3, [[0, {'t': 15, 'read': 't'}]],
                   [{'kind': 'segment', 'from': [5, 825], 'to': [15, 1575], 'step': 2, 'dashed': True, 'color': 'indigo'},
                    {'kind': 'point', 'at': [5, 825], 'step': 1, 'color': 'indigo', 'label': '(5,\\,825)', 'anchor': 'se'},
                    {'kind': 'point', 'at': [15, 1575], 'step': 1, 'color': 'indigo', 'label': '(15,\\,1575)', 'anchor': 'nw'}], frm=12)))
out.extend(split(q(3, 7, NAME[3], 'Speed at an instant',
             'How can we find Michael\'s speed at a particular instant? Estimate it at $t=10$.',
             [walk('Average from $9$ to $11$', ['\\frac{s(11)-s(9)}{11-9}&=46.2\\ \\text{m min}^{-1}'], 'The chord over a short interval around $t=10$.'),
              walk('Shrink the interval', ['\\text{from }9.9\\text{ to }10.1&:\\ 45.012', '\\text{from }9.99\\text{ to }10.01&:\\ 45.00012'], 'The values approach $45$ as the chord becomes the tangent.'),
              walk('Differentiate $s$', ['v(t)=s\'(t)&=3.6t^2-60t+285', 'v(10)&=360-600+285', '&=45\\ \\text{m min}^{-1}'],
                   'The instantaneous speed is the gradient of the tangent. Worked Example 1 in the notes starts here.', ans=True)],
             graph(3, [[0, {'t': 15, 'read': 'ts'}]],
                   [{'kind': 'point', 'at': [10, 1050], 'step': 1, 'color': 'indigo', 'label': '(10,\\,1050)', 'anchor': 'nw'},
                    {'kind': 'segment', 'from': [9, float(S3.subs(t, 9))], 'to': [11, float(S3.subs(t, 11))], 'step': 1, 'dashed': True, 'color': 'indigo'},
                    {'kind': 'line', 'through': [[10, 1050], [11, 1095]], 'step': 3, 'answer': True}])), 2, 'Now find $v(10)$ exactly.'))
# ---------------------------------------------------------------- numbers the text states, once more
assert float(S3.subs(t, 9)) == 1009.8 and float(S3.subs(t, 11)) == 1102.2
assert (S3.subs(t, 11) - S3.subs(t, 9)) / 2 == R(231, 5)        # 46.2
assert S3.subs(t, 10) + V3.subs(t, 10) == 1095                  # the tangent at t = 10 passes through (11, 1095)

meta = {'cohort': 'MAI', 'cohortLabel': 'MAI HL', 'lesson': 1, 'topic': 'LanguageOfMotion', 'topicWords': 'The language of motion',
        'file': 'mai-hl-u12-l01-the-language-of-motion.html', 'artifactTitle': 'MAI HL U12 L1 The Language of Motion',
        'source': 'openers brief approved by Ben 2026-11-01 (Opener brief - Claude Code.md); motion scenes are deck kit v23',
        'largeGraphs': True, 'animSpeed': 1.5}
json.dump({'meta': meta, 'slides': out}, open('content.json', 'w'), indent=1, ensure_ascii=False)
print(len(out), 'slides')
for i, s in enumerate(out):
    print(i, s['type'], s.get('eyebrow', s.get('title', '')))
