"""MAI HL U5 L6 Correlation: Pearson's r and Spearman's r_s (Ben, 31/10/2026).

Written from scratch (no v1 content): title; four scenes (title card, setup, questions, lab); two calculator
slides in scene 3 (real fx-CG50 captures, students rank by hand); recap explorer; IA catalogue.
Every number the slides state is computed here: r and r_s with sympy (exact) and numpy (data checks).

Casio steps NOT yet checked by Ben (flagged in the report, never on screen):
  - the SET list picking for 2Var XList and YList (one capture per run, keys inferred from menu_paths_verified.md);
  - rank entry by keyboard (DOT key clicked for 3.5).
Verified on the emulator 31/10/2026: [F2] CALC [F3] REG [F1] X [F1] ax+b gives r (0.93526507 and 0.99402979).
Run:  python3 make_content.py   (writes content.json next to it; CAPS points at the scratch captures)
"""
import base64, json, os, sys
import numpy as np
import sympy as sp

CAPS = os.environ.get('CAPS', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'caps', 'lcd'))


def img(name, alt, **kw):
    b = base64.b64encode(open(f'{CAPS}/{name}.jpg', 'rb').read()).decode()
    return dict({'type': 'img', 'src': 'data:image/jpeg;base64,' + b, 'alt': alt}, **kw)


# ---------------------------------------------------------------- exact checks
def pearson_exact(xs, ys):
    n = len(xs)
    xs = [sp.nsimplify(v) for v in xs]; ys = [sp.nsimplify(v) for v in ys]
    mx, my = sum(xs) / n, sum(ys) / n
    sxy = sum((a - mx) * (b - my) for a, b in zip(xs, ys))
    sxx = sum((a - mx) ** 2 for a in xs); syy = sum((b - my) ** 2 for b in ys)
    return sxy / sp.sqrt(sxx * syy)


def ranks(v):
    out = []
    for a in v:
        less = sum(1 for b in v if b < a); eq = sum(1 for b in v if b == a)
        out.append(sp.Rational(2 * less + eq + 1, 2))        # average of the places less+1 .. less+eq
    return out


r_np = lambda x, y: float(np.corrcoef(x, y)[0, 1])

# scene 3: eight sprinters
HX = [2, 3, 5, 6, 8, 9, 11, 14]
HY = ['0.12', '0.31', '0.52', '0.52', '0.68', '0.74', '0.80', '0.83']
HYf = [float(v) for v in HY]
rx, ry = ranks(HX), ranks(HY)
assert [str(v) for v in rx] == ['1', '2', '3', '4', '5', '6', '7', '8']
assert [str(v) for v in ry] == ['1', '2', '7/2', '7/2', '5', '6', '7', '8']
R_SPR = pearson_exact(HX, HY); RS_SPR = pearson_exact(rx, ry)
assert abs(float(R_SPR) - 0.93526507) < 1e-8 and abs(float(RS_SPR) - 0.99402979) < 1e-8
assert round(float(R_SPR), 3) == 0.935 and round(float(RS_SPR), 3) == 0.994 and RS_SPR > R_SPR

# scene 1: revision hours and marks (20 students). y = 4x + 18 + s*e, marks whole numbers
E = [0.6, -1.1, 0.3, 1.4, -0.7, -0.2, 0.9, -1.3, 0.5, 1.0, -0.4, -0.9, 1.2, 0.1, -0.6, 0.8, -1.0, 0.4, -0.3, 0.7]
X1 = [0.75 * (i + 1) for i in range(20)]
marks = lambda s: [int(round(4 * x + 18 + s * e)) for x, e in zip(X1, E)]
Y_TIGHT, Y_WIDE = marks(7), marks(20)
assert round(r_np(X1, Y_TIGHT), 2) == 0.95 and round(r_np(X1, Y_WIDE), 2) == 0.73
assert min(Y_WIDE) >= 0 and max(Y_WIDE) <= 100
LAB_SPREAD = {'min': 0, 'max': 20, 'step': 1, 'start': 0, 'seconds': 8, 'auto': True}
r0 = r_np(X1, [4 * x + 18 for x in X1]); assert abs(r0 - 1) < 1e-12

# scene 2: a plant, y = 0.4 * 1.55^x
XP = list(range(1, 11)); YP = [round(0.4 * 1.55 ** x, 2) for x in XP]
assert all(b > a for a, b in zip(YP, YP[1:]))
assert round(r_np(XP, YP), 3) == 0.888
OUT = (11, 5)
assert round(r_np(XP + [OUT[0]], YP + [OUT[1]]), 3) == 0.704
assert round(float(pearson_exact(ranks(XP), ranks(YP))), 3) == 1.0       # r_s = 1: always rising

# scene 4: ice cream and sunburn, twelve months
TEMP = [14, 15, 18, 22, 26, 30, 33, 32, 28, 22, 17, 14]
SALES = [38, 44, 53, 72, 95, 118, 138, 126, 97, 70, 47, 40]
BURN = [4, 6, 8, 15, 22, 38, 43, 40, 27, 18, 9, 6]
R_IC = r_np(SALES, BURN); assert round(R_IC, 2) == 0.99 and r_np(TEMP, SALES) > 0.97 and r_np(TEMP, BURN) > 0.97
HOT = [t >= 26 for t in TEMP]

# ---------------------------------------------------------------- windows and helpers
def win(xmax, ymax, **kw):
    return dict({'xmin': -xmax * 0.12, 'xmax': xmax, 'ymin': -ymax * 0.09, 'ymax': ymax * 1.03, 'xname': 'x', 'yname': 'y',
                 'xtickFrom': 0, 'ytickFrom': 0}, **kw)

W1 = win(17, 100, gridx=1, gridy=10, xtick=2, ytick=20)
W1 = dict(W1, xmin=-2, xmax=17, ymin=-8, ymax=104)
W2 = {'xmin': -1.5, 'xmax': 12.5, 'ymin': -4, 'ymax': 40, 'gridx': 1, 'gridy': 5, 'xtick': 2, 'ytick': 10, 'xname': 'x', 'yname': 'y', 'xtickFrom': 0, 'ytickFrom': 0}
W3 = {'xmin': -2, 'xmax': 16, 'ymin': -0.12, 'ymax': 1.0, 'gridx': 2, 'gridy': 0.1, 'xtick': 2, 'ytick': 0.2, 'xname': 'x', 'yname': 'y', 'xtickFrom': 0, 'ytickFrom': 0,
      'yticks': [[0.2, '0.2'], [0.4, '0.4'], [0.6, '0.6'], [0.8, '0.8']]}   # explicit: a 0.2 step prints 0.6000000000000001
W4 = {'xmin': -15, 'xmax': 155, 'ymin': -5, 'ymax': 50, 'gridx': 10, 'gridy': 5, 'xtick': 20, 'ytick': 10, 'xname': 'x', 'yname': 'y', 'xtickFrom': 0, 'ytickFrom': 0}
WL1 = dict(W1, ymax=110, ymin=-10)
WL2 = {'xmin': -1.5, 'xmax': 13.5, 'ymin': -4, 'ymax': 42, 'gridx': 1, 'gridy': 5, 'xtick': 2, 'ytick': 10, 'xname': 'x', 'yname': 'y', 'xtickFrom': 0, 'ytickFrom': 0}
WR = {'xmin': -1, 'xmax': 13, 'ymin': -1, 'ymax': 13, 'gridx': 1, 'gridy': 1, 'xtick': 2, 'ytick': 2, 'xname': 'x', 'yname': 'y', 'xtickFrom': 0, 'ytickFrom': 0}
ART = {'xmin': 0, 'xmax': 1, 'ymin': 0, 'ymax': 1}


def pts(xs, ys, color, step=0, until=None, **kw):
    out = []
    for a, b in zip(xs, ys):
        d = {'kind': 'point', 'at': [a, b], 'step': step, 'color': color}
        if until is not None: d['until'] = until
        out.append(dict(d, **kw))
    return out


def facts(*specs):
    return [dict(html=h, **kw) for h, kw in specs]


def walk(cap=None, tex=None, note=None, ans=False):
    w = {}
    if cap: w['cap'] = cap
    if tex: w['tex'] = tex
    if note: w['note'] = note
    if ans: w['ans'] = True
    return {'walk': w}


S = [{'type': 'title', 'eyebrow': 'IB Mathematics: Applications and Interpretations HL · Unit 5 · Lesson 6',
      'title': 'Correlation', 'lede': 'Online lesson: four scenes and a recap', 'code': 'MAI HL U5 L6',
      'regime': 'C', 'regimeText': 'calculator allowed'}]
NSC = 4


def scene_title(n, title, pts_, alt, cols=None):
    S.append({'type': 'sceneTitle', 'scene': n, 'kicker': f'Scene {n} of {NSC}', 'title': title, 'kind': 'scatter', 'window': ART,
              'state': {'pts': pts_, **({'cols': cols} if cols else {}), 'bare': True}, 'alt': alt})


def setup(n, name, title, pre, para, fts, window, items):
    S.append({'type': 'example', 'scene': n, 'eyebrow': name + ' · The situation', 'title': title,
              'setup': {'preamble': pre, 'para': para, 'facts': fts}, 'stem': '', 'blocks': [],
              'graph': {'window': dict(window, aspect=1.4), 'items': items}})


def question(n, q, name, title, stem, blocks, window, items, given=None, choices=None, correct=None, cont=False, prompt=None):
    d = {'type': 'example', 'scene': n, 'q': q, 'eyebrow': f'{name} · Question {q}', 'title': title, 'stem': stem,
         'blocks': blocks, 'graph': {'window': dict(window, aspect=1.4), 'items': items}}
    if prompt: d['prompt'] = prompt
    if choices: d.update(choices=choices, correct=correct, pickStep=1)
    if cont: d['cont'] = True
    S.append(d)


def norm(xs, ys, xm, ym):
    return [[a / xm, b / ym] for a, b in zip(xs, ys)]


# ================================================================ scene 1
N1 = 'How tight is the cloud?'
scene_title(1, 'How Tight Is the Cloud?', norm(X1, Y_TIGHT, 16, 100), 'A scatter diagram of twenty points rising in a tight cloud')
F1 = facts(('<b>20 students</b>: one point for each', {'c': 'pink'}),
           ('$x$: hours of revision each week', {'shape': 'none'}),
           ('$y$: test mark out of $100$', {'shape': 'none'}))
G1 = facts(('<b>20 students</b>', {'c': 'pink'}), ('$x$ hours revised, $y$ mark', {'shape': 'none'}))
setup(1, N1, 'Revision and marks',
      'A teacher wonders whether students who revise more score higher on the unit test.',
      'She asks 20 students how many hours they revise each week, $x$, and records each test mark out of $100$, $y$. '
      'Every student is one point on a scatter diagram.', F1, W1, pts(X1, Y_TIGHT, 'pink', 1))
question(1, 1, N1, 'Read the cloud', 'Predict: which value of $r$ matches this scatter diagram?',
         [walk('The points hug a rising line', ['r&\\approx 0.95'], 'The correlation coefficient $r$ is found on the GDC. A value near $1$ means a tight, rising, straight pattern.', True)],
         W1, pts(X1, Y_TIGHT, 'pink'), G1, ['$r=0.3$', '$r=0.7$', '$r=0.95$'], 2)
question(1, 1, N1, 'A scale for $|r|$', 'How do we put a word on the size of $r$? Use $|r|$, the size without the sign.',
         [walk('Strength from $|r|$', ['0\\text{ to }0.25&:\\ \\text{very weak}', '0.25\\text{ to }0.5&:\\ \\text{weak}',
                                       '0.5\\text{ to }0.75&:\\ \\text{moderate}', '0.75\\text{ to }0.9&:\\ \\text{strong}',
                                       '0.9\\text{ to }1&:\\ \\text{very strong}'],
               'The sign gives the direction: $+$ rises, $-$ falls. This scatter is a very strong positive correlation.')],
         W1, pts(X1, Y_TIGHT, 'pink'), G1, cont=True)
question(1, 2, N1, 'Spread the points', 'A second school finds the same trend, but the points are more spread out. Predict what happens to $r$.',
         [walk('Same trend, more scatter', ['r_{\\text{before}}&=0.95', 'r_{\\text{after}}&=0.73'],
               '$r$ falls as the points spread out. It stays positive because the trend still rises.', True)],
         W1, pts(X1, Y_TIGHT, 'pink', 0, 0) + pts(X1, Y_WIDE, 'orange', 1), G1,
         ['$r$ rises', '$r$ falls, still positive', '$r$ falls and turns negative'], 1)
S.append({'type': 'lab', 'preset': 'scatterLab', 'eyebrow': N1 + ' · Spread the points', 'title': 'Spread and correlation',
          'init': {'window': WL1, 'start': 'Revision', 'spread': LAB_SPREAD,
                   'sets': [{'name': 'Revision', 'pts': [[x, 4 * x + 18] for x in X1], 'noise': E}]}})

# ================================================================ scene 2
N2 = 'A curve that only goes up'
scene_title(2, 'A Curve That Only Goes Up', norm(XP, YP, 11, 34), 'A plant’s height each week: points rising along an upward curve')
F2 = facts(('<b>10 weeks</b> of heights: one point each', {'c': 'pink'}), ('$x$: the week, $y$: height in cm', {'shape': 'none'}),
           ('Taller <b>every single week</b>', {'shape': 'none'}))
G2 = facts(('<b>10 weeks</b> of heights', {'c': 'pink'}), ('$x$ week, $y$ height in cm', {'shape': 'none'}))
setup(2, N2, 'A seedling', 'A gardener measures a seedling at the end of each week.',
      'Over 10 weeks she records $x$, the week number, and $y$, the height in centimetres. The plant is taller every week than the week before.',
      F2, W2, pts(XP, YP, 'pink', 1))
question(2, 1, N2, 'Always rising', 'Predict: the plant rises every week. What is $r$?',
         [walk('GDC: linear regression', ['r&=0.888'], None, True),
          walk('Always rising, but not a line', None, 'A relationship that only rises, or only falls, is monotonic. $r$ only rewards a straight line, so it stays below $1$.')],
         W2, pts(XP, YP, 'pink'), G2, ['$r=1$', '$r$ just under $1$', '$r$ near $0.5$'], 1)
question(2, 2, N2, 'One odd point', 'A sensor glitch records the plant at only $5$ cm in week 11. Predict what happens to $r$.',
         [walk('One point changes it', ['r_{\\text{before}}&=0.888', 'r_{\\text{after}}&=0.704'], 'One unusual point, an outlier, can drag $r$ a long way.', True)],
         W2, pts(XP, YP, 'pink') + [{'kind': 'point', 'at': list(OUT), 'step': 1, 'color': 'orange', 'label': '(11,\\,5)', 'anchor': 'se'}], G2,
         ['$r$ rises', '$r$ falls', '$r$ stays the same'], 1)
S.append({'type': 'lab', 'preset': 'scatterLab', 'eyebrow': N2 + ' · Drag the outlier', 'title': 'One point and correlation',
          'init': {'window': WL2, 'start': 'Plant', 'extra': {'at': list(OUT), 'on': True},
                   'sets': [{'name': 'Plant', 'pts': [[a, b] for a, b in zip(XP, YP)]}]}})

# ================================================================ scene 3
N3 = 'Eight sprinters'
scene_title(3, 'Eight Sprinters', norm(HX, HYf, 15, 0.9), 'Eight athletes: a rising scatter that levels off')
F3 = facts(('<b>8 athletes</b>: one point for each', {'c': 'orange'}), ('$x$: hours of training each week', {'shape': 'none'}),
           ('$y$: improvement in 100 m time, in seconds', {'shape': 'none'}))
G3 = facts(('<b>8 athletes</b>', {'c': 'orange'}), ('$x$ hours, $y$ seconds gained', {'shape': 'none'}))
setup(3, N3, 'Training and improvement', 'A coach follows eight sprinters through a season.',
      'For each athlete she records $x$, the hours of training each week, and $y$, how many seconds faster the athlete runs 100 m. '
      'More training helps, but the gains slow down.', F3, W3, pts(HX, HYf, 'orange', 1))
TBL = '$\\begin{array}{c|cccccccc}x&2&3&5&6&8&9&11&14\\\\ \\hline y&0.12&0.31&0.52&0.52&0.68&0.74&0.80&0.83\\end{array}$'
question(3, 1, N3, 'Rank by hand', 'On paper, rank $x$ and $y$, smallest first. Two athletes tie on $y$: what rank does each get?',
         [walk('Ranks of $x$ (hours)', ['\\text{rank}&:\\ 1,\\ 2,\\ 3,\\ 4,\\ 5,\\ 6,\\ 7,\\ 8']),
          walk('Ranks of $y$ (improvement)', ['\\text{rank}&:\\ 1,\\ 2,\\ \\mathbf{3.5,\\ 3.5},\\ 5,\\ 6,\\ 7,\\ 8'],
               'The tied athletes share places 3 and 4, so each takes the average, $\\frac{3+4}{2}=3.5$.', True)],
         W3, pts(HX, HYf, 'orange'), G3, prompt=TBL)
question(3, 2, N3, 'Which is larger?', 'Next the GDC finds $r$ for the data, then the same calculation on the ranks. Predict which is larger.',
         [walk('Check both on the GDC', None, 'First $r$ for the data, then $r$ for the ranks. The second is called Spearman’s $r_s$.')],
         W3, pts(HX, HYf, 'orange'), G3, ['$r$ of the data is larger', '$r$ of the ranks is larger', 'They are equal'], 1)

lcd = lambda n, a, **kw: img(n, a, **kw)
S.append({'type': 'gdc', 'skill': 1, 'tag': 'C', 'title': 'Find $r$ for the data',
          'stem': 'Hours $x$ are in List 1 and improvements $y$ in List 2.',
          'start': lcd('p0', 'List 1 holds the hours and List 2 the improvements'),
          'steps': [{'t': 'Press [F2] CALC.', 's': lcd('p1', 'The CALC menu: 1-VAR, 2-VAR, REG, SET')},
                    {'t': 'Press [F6] SET. 2Var XList is List 1 and 2Var YList is List 2.', 's': lcd('pset', 'SET: 2Var XList List 1, 2Var YList List 2')},
                    {'t': 'Press [EXIT], then [F3] REG.', 's': lcd('p2', 'The REG menu')},
                    {'t': 'Press [F1] X, the straight-line fit.', 's': lcd('p3', 'ax+b or a+bx')},
                    {'t': 'Press [F1] ax+b. Read $r=0.935$ to 3 s.f.', 's': lcd('p4', 'LinearReg: r = 0.93526507', hl=[3, 46, 72, 11])}]})
S.append({'type': 'gdc', 'skill': 2, 'tag': 'C', 'title': 'Find $r_s$ from the ranks',
          'stem': 'Your ranks of $x$ are in List 3 and your ranks of $y$ in List 4. The tied ranks are $3.5$.',
          'start': lcd('s0', 'Ranks entered in List 3 and List 4; the CALC menu is open'),
          'steps': [{'t': 'Press [F6] SET. [DOWN] twice, [F1] LIST, {3} [EXE] for 2Var XList. Then [DOWN], [F1] LIST, {4} [EXE] for 2Var YList.', 's': lcd('s1', 'SET: 2Var XList List 3, 2Var YList List 4')},
                    {'t': 'Press [EXIT], then [F3] REG.', 's': lcd('s2', 'The REG menu')},
                    {'t': 'Press [F1] X.', 's': lcd('s3', 'ax+b or a+bx')},
                    {'t': 'Press [F1] ax+b. Read $r_s=0.994$ to 3 s.f. Afterwards set SET back to List 1 and List 2.', 's': lcd('s4', 'LinearReg: r = 0.99402979', hl=[3, 46, 72, 11])}]})
question(3, 3, N3, 'What does $r_s>r$ suggest?', 'The GDC gives $r=0.935$ and $r_s=0.994$. What does $r_s>r$ suggest?',
         [walk('The ranks line up better', ['r_s&=0.994', 'r&=0.935'],
               'It suggests the data rise steadily but along a curve, or an outlier is dragging $r$ down. Always check the scatter.', True)],
         W3, pts(HX, HYf, 'orange'), G3,
         ['A perfect straight line', 'A steady rise along a curve', '$r_s$ is never larger than $r$'], 1)
S.append({'type': 'lab', 'preset': 'scatterLab', 'eyebrow': N3 + ' · Move one athlete', 'title': 'Two coefficients, one scatter',
          'init': {'window': W3, 'start': 'Sprinters', 'rs': True, 'dragIndex': 7,
                   'sets': [{'name': 'Sprinters', 'pts': [[a, b] for a, b in zip(HX, HYf)]}]}})

# ================================================================ scene 4
N4 = 'Ice cream and sunburn'
scene_title(4, 'Ice Cream and Sunburn', norm(SALES, BURN, 150, 48), 'Twelve months of ice cream sales against sunburn cases: a rising band')
F4 = facts(('<b>12 months</b>: one point for each', {'c': 'pink'}), ('$x$: ice creams sold each day', {'shape': 'none'}),
           ('$y$: sunburn cases at the clinic', {'shape': 'none'}))
G4 = facts(('<b>12 months</b>', {'c': 'pink'}), ('$x$ ice creams, $y$ sunburn cases', {'shape': 'none'}))
setup(4, N4, 'A coastal town', 'A seaside town keeps two records through the year.',
      'Each month it notes $x$, the ice creams sold per day, and $y$, the sunburn cases seen at the clinic. That gives 12 points.',
      F4, W4, pts(SALES, BURN, 'pink', 1))
question(4, 1, N4, 'Cause?', 'The scatter has $r=0.99$. Does eating ice cream cause sunburn?',
         [walk('A high $r$ is not a cause', ['r&=0.99'], 'Correlation says the variables move together. It never says that one causes the other.', True)],
         W4, pts(SALES, BURN, 'pink'), G4,
         ['Yes: a high $r$ shows one causes the other', 'No: they have nothing to do with each other', 'They move together, but $r$ cannot say why'], 2)
question(4, 2, N4, 'A third variable', 'Something else changes through the year. What could be behind both?',
         [walk('Colour each month by temperature', None, 'Hot months have more ice cream and more sunburn: the weather drives both. A third variable can produce a strong $r$.', True)],
         W4, pts(SALES, BURN, 'pink', 0, 0) + [dict(k, step=1) for k in
             [{'kind': 'point', 'at': [a, b], 'color': 'orange' if h else 'indigo'} for a, b, h in zip(SALES, BURN, HOT)]], G4)

# ================================================================ recap
sc = lambda xs, ys, fx, fy: [[round(a * fx, 4), round(b * fy, 4)] for a, b in zip(xs, ys)]
S.append({'type': 'lab', 'preset': 'scatterLab', 'beat': 'R', 'eyebrow': 'Recap · Explore every scene', 'title': 'Strength, shape and cause',
          'init': {'window': WR, 'start': 'Sprints', 'rs': True, 'cards': True, 'extra': {'at': [11, 1], 'on': False, 'toggle': True},
                   'sets': [{'name': 'Marks', 'pts': sc(X1, Y_TIGHT, 0.8, 0.1)},
                            {'name': 'Plant', 'pts': sc(XP, YP, 1, 10 / 33)},
                            {'name': 'Sprints', 'pts': sc(HX, HYf, 0.8, 12)}]}})

# ================================================================ IA
IA = [
    ('Body, sport and school', 'Sleep and reaction time',
     ['Hours of sleep the night before', 'Reaction time online, in ms'],
     ['One reading per person per day', 'Caffeine could affect both'],
     [['Set up', ['One online test, one device']], ['Each morning for 20 days', ['Take the test 5 times', 'Note the mean']], ['Tabulate sleep and mean time'], ['Plot time against sleep']]),
    ('Body, sport and school', 'Practice and free throws',
     ['Minutes of practice that week', 'Free throws scored out of 20'],
     ['Skills improve with practice', 'Gains may slow: compare $r$, $r_s$'],
     [['Set up', ['Mark one shooting spot']], ['Each week for 8 weeks', ['Log the practice minutes', 'Take 20 shots']], ['Tabulate minutes and score'], ['Plot score against minutes']]),
    ('Body, sport and school', 'Jump height and sprint time',
     ['Vertical jump, in cm', 'Time over 20 m, in s'],
     ['Do better jumpers run faster?', 'Expect a negative correlation'],
     [['Set up', ['Chalk a wall, mark 20 m']], ['For 15 students', ['Best of 3 jumps', 'One timed sprint']], ['Tabulate jump and time'], ['Plot time against jump']]),
    ('Body, sport and school', 'Homework time and marks',
     ['Hours of homework in a week', 'Mark on the next test, in %'],
     ['A familiar claim to test', 'Marks are ranked: try $r_s$'],
     [['Set up', ['Survey one class, anonymously']], ['Collect 30 pairs'], ['Tabulate hours and marks'], ['Plot mark against hours']]),
    ('Environment and business', 'Temperature and drink sales',
     ['Daily high, in \u00b0C', 'Cold drinks sold that day'],
     ['Sales rise, then level off', 'A curve suggests $r_s>r$'],
     [['Find the data', ['Canteen daily sales', 'Daily highs online']], ['Match 30 days'], ['Tabulate the pairs'], ['Plot sales against temperature']]),
    ('Environment and business', 'Plant growth and light',
     ['Light level, in lux (phone app)', 'Height gained in a week, in mm'],
     ['Plants need light, but not endless', 'Compare $r$ with $r_s$'],
     [['Set up', ['Six seedlings, six light levels']], ['Measure the light at each'], ['After a week, measure growth'], ['Plot growth against lux']]),
    ('Environment and business', 'Rainfall and bus delay',
     ['Daily rainfall, in mm', 'Extra minutes on the bus ride'],
     ['More rain may mean more delay', 'Roadworks could confound'],
     [['Find the data', ['Download daily rainfall', 'Time the bus each day']], ['Record 30 school days'], ['Tabulate the pairs'], ['Plot delay against rainfall']]),
    ('Environment and business', 'Price and canteen sales',
     ['Price of an item, in baht', 'Items sold per day'],
     ['Demand tends to fall as price rises', 'Prices are not set at random'],
     [['Find the data', ['Canteen prices and daily sales']], ['Match 20 days'], ['Tabulate the pairs'], ['Plot sales against price']]),
]
S.append({'type': 'lab', 'preset': 'catalogue', 'beat': 'IA', 'eyebrow': 'Beyond the story · Correlation in an IA',
          'title': 'Where else could you look for a relationship?',
          'init': {'headings': ['What is measured', 'Why correlation fits'],
                   'items': [{'group': g, 'title': t, 'what': w, 'why': y, 'exp': e} for g, t, w, y, e in IA]}})

content = {'meta': {'cohort': 'MAI', 'cohortLabel': 'MAI HL', 'lesson': 6, 'topic': 'Correlation', 'topicWords': 'Correlation',
                    'file': 'MAI_HL_U5_L6_Lesson_Correlation.html', 'artifactTitle': 'MAI HL U5 L6 Correlation',
                    'source': 'scene plan agreed with Ben 31/10/2026; handoff in Unit 5 - Lesson 6 - HANDOFF.md',
                    'largeGraphs': True, 'animSpeed': 1.5},
           'slides': S}
json.dump(content, open('content.json', 'w'), indent=1, ensure_ascii=False)
print(len(S), 'slides')
for i, s in enumerate(S):
    print(i, s['type'], s.get('preset', ''), s.get('eyebrow', s.get('title', '')))
