"""MAI HL U5 L4 Logistic models, v2 (Ben, 31/10/2026).

Starts from the published v1 content (c0.json, colours turned back into roles) and adds:
  - a title card before each scene (big title, the phone drawing large)
  - a setup slide per scene: preamble, the given facts as a paragraph, then (Next) the same facts as colour-coded bullets
    in the same place while the matching points and lines appear on the graph in the same colours
  - the question slides keep the facts as a short colour-coded list above the drawing (replaces the heading)
  - from scene 4 the graph is re-zoomed to just above 100 %
  - IA: what and why as bullets, the experiment as a numbered lab procedure on a notepad
  - slider animations 1.5 times faster (meta.animSpeed)
"""
import copy, json, math
import sympy as sp

c = json.load(open("v1_content.json"))
S = c['slides']

# ---- checks on the numbers the new text states ----
t = sp.Symbol('t')
k = sp.log(sp.Rational(15, 7)) / 2
L = 80 / (1 + 15 * sp.exp(-k * t))
assert abs(float(k) - 0.381) < 5e-4
assert sp.simplify(L.subs(t, 0) - 5) == 0 and abs(float(L.subs(t, 2)) - 10) < 1e-9
E = lambda x: 5 * 2 ** (x / 2)
assert E(0) == 5 and E(2) == 10

# ---- windows ----
W_OLD = S[1]['graph']['window']
W4 = dict(W_OLD, ymin=-9, ymax=120, gridy=10, ytick=20)                       # scene 4: x as before
W5 = dict(S[13]['graph']['window'], ymin=-9, ymax=120, gridy=10, ytick=20)    # scenes 5-6: x to 22
ART = {'xmin': 0, 'xmax': 1, 'ymin': -14, 'ymax': 112}

# ---- facts (role colours; the same colour marks the point or line on the graph) ----
F = {
    'p0':   {'html': '<b>$5\\%$ at $t=0$</b>: the survey at launch', 'c': 'pink'},
    'p2':   {'html': '<b>$10\\%$ at $t=2$</b>: two years later', 'c': 'indigo'},
    'tyrs': {'html': '$t$ is measured in years since launch', 'shape': 'none'},
    'E':    {'html': 'Forecast <b>$E(t)=5\\cdot 2^{t/2}$</b>', 'c': 'red', 'shape': 'cv'},
    'full': {'html': 'A full region is <b>$100\\%$</b>', 'c': 'brown', 'shape': 'ln'},
    'max':  {'html': 'Never more than <b>$100\\%$</b>', 'c': 'brown', 'shape': 'ln'},
    'Efad': {'html': 'The doubling forecast, <b>faded</b>', 'c': 'grey', 'shape': 'cv'},
    'cap':  {'html': 'Levels off at <b>$80\\%$</b>', 'c': 'green', 'shape': 'ln'},
    'Lcap': {'html': 'Limit <b>$L=80$</b>: the ceiling from the last scene', 'c': 'green', 'shape': 'ln'},
    'gen':  {'html': 'Model <b>$P(t)=\\dfrac{L}{1+Ae^{-kt}}$</b>: three unknowns', 'shape': 'none'},
    'L':    {'html': 'Model <b>$P(t)=\\dfrac{80}{1+15e^{-0.381t}}$</b>', 'c': 'blue', 'shape': 'cv'},
    'k':    {'html': 'Growth rate <b>$k\\approx 0.38$</b>: how steep', 'c': 'blue', 'shape': 'cv'},
    'lim':  {'html': 'Limit <b>$L=80$</b>: where it levels off', 'c': 'green', 'shape': 'ln'},
    'st':   {'html': 'Start <b>$5\\%$</b>: the level at $t=0$', 'c': 'pink'},
}
SHORT = {'p0': '<b>$5\\%$ at $t=0$</b>', 'p2': '<b>$10\\%$ at $t=2$</b>', 'E': '<b>$E(t)=5\\cdot 2^{t/2}$</b>',
         'full': 'full is <b>$100\\%$</b>', 'max': 'at most <b>$100\\%$</b>', 'cap': 'levels off at <b>$80\\%$</b>',
         'L': '<b>$P(t)=\\tfrac{80}{1+15e^{-0.381t}}$</b>', 'k': '<b>$k\\approx 0.38$</b>', 'lim': 'limit <b>$L=80$</b>',
         'Lcap': 'limit <b>$L=80$</b>',
         'st': 'start <b>$5\\%$</b>'}
GIVEN = {1: ['p0', 'p2'], 2: ['E', 'full'], 3: ['p0', 'p2', 'max'], 4: ['p0', 'p2', 'Lcap'], 5: ['L', 'cap'], 6: ['k', 'lim', 'st']}

LEXPR = '80/(1+15*exp(-x*log(Rational(15,7))/2))'
pt = lambda at, role, step=0, **kw: dict({'kind': 'point', 'at': at, 'step': step, 'color': role}, **kw)
hseg = lambda y, x1, role=None, step=0: dict({'kind': 'segment', 'from': [0, y], 'to': [x1, y], 'step': step, 'dashed': True}, **({'color': role} if role else {}))
fn = lambda expr, dom, role, step=0: {'kind': 'fn', 'expr': expr, 'domain': dom, 'step': step, 'color': role}
TINT = dict(tint=True)
P0 = lambda step=0, lab=False: pt([0, 5], 'pink', step, **(dict(label='(0,\\,5)', anchor='ne', **TINT) if lab else {}))
P4 = lambda step=0: pt([4, 18.75], 'orange', step)
P2 = lambda step=0, lab=False: pt([2, 10], 'indigo', step, **(dict(label='(2,\\,10)', anchor='se', **TINT) if lab else {}))

SCENES = {
    1: dict(title='A Promising Start', head='Smartphones arrive', art={'t': 0, 'P': 5, 'Pn': 'E'},
            pre='Smartphones have just gone on sale in a small region. Shops stock them, and the first owners show them off to friends.',
            para='A survey taken at launch, which we call $t=0$, finds that $5\\%$ of residents own a smartphone. '
                 'A second survey two years later, at $t=2$, finds that $10\\%$ own one. Time $t$ is measured in years.',
            facts=['p0', 'p2', 'tyrs'], window=W_OLD,
            items=[P0(1, True), P2(1, True)],
            states=[[0, {'t': 0, 'P': 5, 'dp': 0, 'Pn': 'E', 'G': 5}], [1, {'t': 2, 'P': 10, 'dp': 0, 'Pn': 'E', 'G': 10}]]),
    2: dict(title='Follow the Model', head='A forecast for the region', art={'P': 80, 'Pn': 'E', 'G': 160},
            pre='The region\'s planners want to know how many phones to expect. They trust the doubling model from the first scene.',
            para='Their forecast is $E(t)=5\\cdot 2^{t/2}$, the percentage of residents with a smartphone after $t$ years. '
                 'A region cannot have more owners than residents, so a full region is $100\\%$.',
            facts=['E', 'full'], window=W_OLD,
            items=[P0(), P2(), fn('5*2**(x/2)', [0, 10.4], 'red', 1), hseg(100, 16.5, 'brown', 1)],
            states=[[0, {'t': 4, 'P': 20, 'dp': 0, 'Pn': 'E', 'G': 20}]]),
    3: dict(title='What Should Happen?', head='The region, followed for longer', art={'P': 69, 'Pn': 'A'},
            pre='The forecast passed $100\\%$, which cannot happen. Before choosing a new formula, think about how adoption really spreads.',
            para='We return to the same region and follow it for longer. What we knew still holds: $5\\%$ owned a phone at launch, '
                 '$10\\%$ two years later, and never more than $100\\%$ of residents can own one. The doubling forecast stays on the graph, faded.',
            facts=['p0', 'p2', 'max', 'Efad'], window=W_OLD,
            items=[P0(1), P2(1), hseg(100, 16.5, 'brown', 1), fn('5*2**(x/2)', [0, 10.4], 'grey', 1)],
            states=[[0, {'t': 2, 'P': 10, 'dp': 0, 'Pn': 'A'}]]),
    4: dict(title='Meet the Logistic', head='A model with a ceiling', art={'P': 47, 'Pn': 'P', 'cap': 80},
            formula='P(t)=\\dfrac{L}{1+Ae^{-kt}}',
            pre='The later readings rose and then slowed. A logistic model does that: it grows like the doubling forecast at first, then levels off.',
            para='A logistic model has the form $P(t)=\\dfrac{L}{1+Ae^{-kt}}$, with three unknowns: the limit $L$, a constant $A$, and the growth rate $k$. '
                 'We take $L=80$, the ceiling proposed in the last scene. Then two readings, $5\\%$ at $t=0$ and $10\\%$ at $t=2$, fix $A$ and $k$.',
            facts=['gen', 'Lcap', 'p0', 'p2'], window=W4,
            items=[hseg(100, 16.5), fn('5*2**(x/2)', [0, 10.4], 'grey'), P0(1), P2(1), hseg(80, 16.5, 'green', 1)],
            states=[[0, {'t': 0, 'P': 5, 'dp': 0, 'Pn': 'P'}], [1, {'t': 0, 'P': 5, 'dp': 0, 'Pn': 'P', 'cap': 80}]]),
    5: dict(title='Where Is It Fastest?', head='Planning for the busiest years', art={'P': 40, 'Pn': 'P', 'cap': 80},
            pre='The planners now trust a model that levels off. Next they want to know when the region changes fastest, so shops and networks are ready.',
            para='Adoption in the region follows $P(t)=\\dfrac{80}{1+15e^{-0.381t}}$, with $t$ in years since launch. '
                 'The model levels off at $80\\%$.',
            facts=['L', 'cap'], window=W5,
            items=[hseg(100, 22), fn(LEXPR, [0, 22], 'blue', 1), hseg(80, 22, 'green', 1)],
            states=[[0, {'t': 0, 'P': 5, 'dp': 0, 'Pn': 'P'}], [1, {'t': 0, 'P': 5, 'dp': 0, 'Pn': 'P', 'cap': 80}]]),
    6: dict(title='Explore and Judge', head='Three settings on one model', art={'P': 60, 'Pn': 'P', 'cap': 80},
            pre='The region will soon weigh some proposals. First, see what each part of the model controls.',
            para='A logistic model of this kind has three settings. The growth rate $k$ sets how quickly adoption rises, '
                 'the limit $L$ is the level it settles towards, and the start is the percentage at $t=0$. '
                 'For our region, $k\\approx 0.38$, $L=80$, and the start is $5\\%$.',
            facts=['k', 'lim', 'st'], window=W5,
            items=[hseg(100, 22), fn('80/(1+15*exp(-0.38*x))', [0, 22], 'blue', 1), hseg(80, 22, 'green', 1),
                   pt([0, 5], 'pink', 1)],
            states=[[0, {'t': 8, 'P': 47, 'dp': 0, 'Pn': 'P'}], [1, {'t': 8, 'P': 47, 'dp': 0, 'Pn': 'P', 'cap': 80}]]),
}
NAME = {1: 'A promising start', 2: 'Follow the model', 3: 'What should happen?', 4: 'Meet the logistic',
        5: 'Where is it fastest?', 6: 'Explore and judge'}


def fact(key):
    return copy.deepcopy(F[key])


def recolour(sl, n):
    """the fixed facts in their colours on every question slide; the window re-zoomed from scene 4"""
    g = sl['graph']
    if n >= 4:
        g['window'] = copy.deepcopy(W4 if n == 4 else W5)
    for it in g['items']:
        if it['kind'] == 'point' and it['at'] == [0, 5]:
            it['color'] = 'pink'
        elif it['kind'] == 'point' and it['at'] == [2, 10]:
            it['color'] = 'indigo'
        elif it['kind'] == 'point' and it['at'] == [4, 18.75] and n == 4:
            it['color'] = 'orange'
        elif it['kind'] == 'segment' and it.get('dashed') and it['from'][1] == it['to'][1] == 100 and n in (2, 3):
            it['color'] = 'brown'
        elif it['kind'] == 'segment' and it.get('dashed') and it['from'][1] == it['to'][1] == 80:
            it['color'] = 'green'
        elif it['kind'] == 'segment' and it.get('dotted') and it['from'][1] == -12:   # inflection drop line: to the new floor
            it['from'] = [it['from'][0], g['window']['ymin']]
    g.pop('heading', None)
    g['given'] = [dict(fact(k), html=SHORT[k]) for k in GIVEN[n]]


import re
NAMEFIX = re.compile(r'(?<![A-Za-z\\])L(?=\(|&)')
def rename(o):
    if isinstance(o, dict):
        return {k: (v if k in ('expr', 'pts', 'code') else rename(v)) for k, v in o.items()}
    if isinstance(o, list):
        return [rename(v) for v in o]
    return NAMEFIX.sub('P', o) if isinstance(o, str) else o
S[:] = [rename(sl) for sl in S]
for sl in S:
    for st in ((sl.get('graph') or {}).get('scene') or {}).get('states', []):
        if st[1].get('Pn') == 'L':
            st[1]['Pn'] = 'P'

# market share, not the phone
S[4]['blocks'][0]['walk']['note'] = 'That is more than all of the residents. A market share cannot exceed $100\\%$ of the population.'
# half the limit, now that L names the limit
S[15]['blocks'][0]['walk']['tex'] = ['P&=\\frac{L}{2}=\\frac{80}{2}=40']

# L(8) = 46.75: v1 drew it at 46.8; one decimal is 46.7
def fix468(o):
    if isinstance(o, dict): return {k: fix468(v) for k, v in o.items()}
    if isinstance(o, list): return [fix468(v) for v in o]
    return 46.7 if o == 46.8 else o
S[:] = [fix468(sl) for sl in S]
# scene 4: L is the ceiling assumed in scene 3; A from P(0), k from P(2) (replaces the slide that handed students the model)
A_ = sp.Rational(80, 5) - 1
kk = sp.Symbol('k', positive=True)
k_ = sp.solve(sp.Eq(80 / (1 + A_ * sp.exp(-2 * kk)), 10), kk)[0]
assert A_ == 15 and sp.simplify(sp.exp(-2 * k_) - sp.Rational(7, 15)) == 0 and abs(float(k_) - 0.381) < 5e-4
assert abs(float(L.subs(t, 6)) - 31.7) < 0.05 and abs(float(L.subs(t, 10)) - 60.1) < 0.05
BASE4 = S[10]['graph']
g = copy.deepcopy(BASE4)
g['items'] = [hseg(100, 16.5), fn('5*2**(x/2)', [0, 10.4], 'grey'), P0(), P2(), hseg(80, 16.5, 'green'), fn(LEXPR, [0, 16.5], 'blue', 3)]
g['scene'] = dict(g['scene'], states=[[0, {'t': 0, 'P': 5, 'dp': 0, 'Pn': 'P', 'cap': 80}], [2, {'t': 2, 'P': 10, 'dp': 0, 'Pn': 'P', 'cap': 80}]])
D1 = {'type': 'example', 'scene': 4, 'q': 1, 'eyebrow': 'Meet the logistic · Question 1', 'title': 'Find A and k',
      'stem': 'Take $L=80$, the ceiling from the last scene. Use the two readings to find $A$ and $k$ in $P(t)=\\frac{L}{1+Ae^{-kt}}$.',
      'blocks': [
          {'walk': {'cap': '$A$ from $P(0)=5$', 'tex': ['\\frac{80}{1+A}&=5', '1+A&=16,\\quad A=15']}},
          {'walk': {'cap': '$k$ from $P(2)=10$', 'tex': ['\\frac{80}{1+15e^{-2k}}&=10', '1+15e^{-2k}&=8,\\quad e^{-2k}=\\tfrac{7}{15}']}},
          {'walk': {'cap': 'Solve for $k$', 'tex': ['k&=\\tfrac{1}{2}\\ln\\tfrac{15}{7}\\approx 0.381', 'P(t)&=\\frac{80}{1+15e^{-0.381t}}'], 'ans': True,
                    'note': 'When $L$ is not known, enter the data in the GDC and use logistic regression: it finds $L$, $A$ and $k$ together.'}}],
      'graph': g}
CHK = S[10]
CHK.pop('cont', None)
CHK['q'] = 2; CHK['eyebrow'] = 'Meet the logistic · Question 2'; CHK['title'] = 'Check against later readings'
CHK['stem'] = 'The model used only two readings. Does it agree with the later readings, $32\\%$ at $t=6$ and $60\\%$ at $t=10$?'
CHK['blocks'] = [
    {'walk': {'cap': 'At $t=6$', 'tex': ['P(6)&=\\frac{80}{1+15e^{-2.286}}', '&\\approx 31.7\\%\\quad(\\text{reading: }32\\%)']}},
    {'walk': {'cap': 'At $t=10$', 'tex': ['P(10)&=\\frac{80}{1+15e^{-3.81}}', '&\\approx 60.1\\%\\quad(\\text{reading: }60\\%)'], 'ans': True,
              'note': 'Built from two readings, the model still matches the later ones.'}}]
CHK['graph']['items'] = [it for it in CHK['graph']['items'] if it['kind'] != 'point'] + [
    P0(), P2(), pt([6, 32], None, 1), pt([10, 60], None, 2)]
for it in CHK['graph']['items']:
    if it.get('color') is None: it.pop('color', None)
CHK['graph']['scene']['states'] = [[0, {'t': 2, 'P': 10, 'dp': 0, 'Pn': 'P', 'cap': 80}],
                                   [1, {'t': 6, 'P': 31.7, 'dp': 1, 'Pn': 'P', 'cap': 80}],
                                   [2, {'t': 10, 'P': 60.1, 'dp': 1, 'Pn': 'P', 'cap': 80}]]
S[11]['q'] = 3; S[11]['eyebrow'] = 'Meet the logistic · Question 3'
S[9] = None
D1b = copy.deepcopy(D1)
D1['title'] = 'Find A and k (1 of 2)'; D1b['title'] = 'Find A and k (2 of 2)'; D1b['cont'] = True
D1['blocks'] = D1['blocks'][:2]; D1b['blocks'] = D1b['blocks'][2:]
for it in D1['graph']['items']:
    if it['kind'] == 'fn' and it['color'] == 'blue': it['step'] = 99   # the model curve waits for slide 2
for it in D1b['graph']['items']:
    if it['kind'] == 'fn' and it['color'] == 'blue': it['step'] = 1
D1b['graph']['scene']['states'] = [[0, {'t': 2, 'P': 10, 'dp': 0, 'Pn': 'P', 'cap': 80}]]
D1['graph']['items'] = [it for it in D1['graph']['items'] if it.get('step') != 99]
S[10:10] = [D1, D1b]
S[:] = [x for x in S if x is not None]

out = [S[0]]
lab_trace = next(x for x in S if x.get('preset') == 'sceneLab'); lab_logistic = next(x for x in S if x.get('preset') == 'logisticLab'); catalogue = next(x for x in S if x.get('preset') == 'catalogue')
by_scene = {}
for sl in S:
    if sl.get('type') == 'example':
        by_scene.setdefault(sl['scene'], []).append(sl)

for n in range(1, 7):
    D = SCENES[n]
    out.append({'type': 'sceneTitle', 'scene': n, 'kicker': f'Scene {n} of 6', 'title': D['title'],
                'kind': 'phone', 'window': ART, 'state': D['art'], **({'formula': D['formula']} if D.get('formula') else {}),
                'alt': 'The phone from the lesson, drawn large: it fills as residents adopt smartphones'})
    out.append({'type': 'example', 'scene': n, 'eyebrow': NAME[n] + ' · The situation', 'title': D['head'],
                'setup': {'preamble': D['pre'], 'para': D['para'], 'facts': [fact(k) for k in D['facts']]},
                'stem': '', 'blocks': [],
                'graph': {'window': copy.deepcopy(D['window']),
                          'scene': {'kind': 'phone', 'alt': 'A phone that fills with adoption beside the graph of adoption against time',
                                    'states': D['states']},
                          'items': D['items']}})
    if n == 6:
        lab_logistic['init']['window'] = copy.deepcopy(W5)
        out.append(lab_logistic)
    for sl in by_scene[n]:
        sl.pop('sceneStart', None)
        recolour(sl, n)
        out.append(sl)
    if n == 4:
        lab_trace['init']['window'] = copy.deepcopy(W4)
        out.append(lab_trace)

# ---- IA: bullets, and a notepad procedure ----
IA = {
    'Yeast in sugar water': (
        ['The number of yeast cells in a bottle of warm sugar water', 'Tracked through the height of the foam they make'],
        ['Cells divide quickly while sugar is plentiful', 'The sugar runs low and waste builds up', 'The population levels off at what the bottle can support'],
        [['Set up', ['Mix 250 mL warm water and 2 tbsp sugar in a clear bottle',
                     'Stir in 1 teaspoon of dried yeast', 'Tape a ruler to the side; cover the top loosely']],
         ['Every 15 minutes for 3 hours, read the foam height'],
         ['Record time and height in a table'],
         ['Plot height against time']]),
    'Duckweed on a tray of water': (
        ['The number of duckweed fronds floating on a tray of pond water'],
        ['Every frond buds new fronds', 'As the surface fills, fronds crowd and shade each other', 'Growth slows towards the number the tray can hold'],
        [['Set up', ['Fill a shallow tray with pond water', 'Add 5 fronds and place the tray by a window']],
         ['Each day at the same time', ['Photograph the tray from directly above', 'Count the fronds on the photo']],
         ['Continue for about three weeks'],
         ['Plot the count against days']]),
    'Bean seedling height': (
        ['The height of a bean plant, day by day from planting'],
        ['A seedling grows slowly at first', 'It grows fastest in the middle of its growth', 'It slows as it nears the height its species can reach'],
        [['Plant five beans in separate pots on a windowsill'],
         ['Each day at the same time', ['Measure each stem from soil to tip', 'Record the five heights']],
         ['Find the mean height for each day'],
         ['After six weeks, plot mean height against days']]),
    'Fish in a stocked pond': (
        ['The number of fish after a pond is stocked with a few'],
        ['With food and space to spare, numbers climb quickly', 'Crowding and a limited food supply then slow growth', 'The population settles near what the pond can support'],
        [['Practise mark and recapture on a bowl of dried beans', ['Mark 20 beans and mix them back in', 'Draw a handful and count the marked ones']],
         ['Estimate the total', ['$\\text{total}\\approx 20\\times \\text{handful}\\div\\text{marked}$']],
         ['Repeat monthly on a real pond, with its keeper\'s help'],
         ['Plot the estimates against months']]),
    'Flu in a school': (
        ['The total number of people who have caught flu since the first case'],
        ['Early on, each sick student meets many healthy ones', 'Later, most people have already had it', 'New cases fall away, so the total levels off'],
        [['Set up the game', ['Give one student a card', 'Everyone else starts without one']],
         ['Each round', ['Each card holder taps one random classmate', 'They take a card if they have none']],
         ['Count the card holders after each round'],
         ['Stop when it levels off; plot count against round']]),
    'Streaming subscribers': (
        ['The total number of paying subscribers to a new streaming service'],
        ['Word of mouth speeds growth at first', 'Eventually most people who would subscribe already have', 'The total flattens'],
        [['Find published data', ['Open the company\'s quarterly reports', 'Note totals for 8 to 12 quarters from launch']],
         ['Record quarter number and total in a table'],
         ['Plot subscribers against quarter'],
         ['Mark where the curve bends from speeding up to slowing down']]),
    'Electric cars on the road': (
        ['The share of cars that are electric'],
        ['A few early adopters go first', 'The share climbs quickly as prices fall and chargers spread', 'It slows as the market fills'],
        [['Once a month, same day and time', ['Tally 100 cars in the school car park', 'Count how many are electric']],
         ['Work out the percentage'],
         ['After a year, plot percentage against months'],
         ['Compare with national figures from a transport statistics website']]),
    'A viral video\'s views': (
        ['The total views of a new video, day by day'],
        ['Each viewer may share it, so views surge', 'Most people who would watch it soon have', 'New views dry up and the total levels off'],
        [['Choose a video posted today'],
         ['Each day at the same time', ['Note the total view count', 'Work out the new views since yesterday']],
         ['Continue for two weeks'],
         ['Plot total views against days', ['Mark the day with the most new views']]]),
    'A rumour in a class': (
        ['The number of students who have heard a harmless piece of news'],
        ['Each student who knows tells friends, so it spreads faster and faster', 'Later, few students are left who have not heard', 'The count levels off'],
        [['In the morning, tell one student a harmless message'],
         ['At each break', ['Ask everyone who knows it to raise a hand', 'Count the hands']],
         ['Record the time and the count'],
         ['Plot the count against the time of day']]),
}
for it in catalogue['init']['items']:
    what, why, exp = IA[it['title']]
    it['what'], it['why'] = what, why
    it['exp'] = [s if len(s) == 2 else s[0] for s in exp]
out.append(catalogue)

c['slides'] = out
c['meta']['animSpeed'] = 1.5
c['meta']['source'] = c['meta']['source'] + '; v2 31/10/2026: title cards, setup decode slides, colour-coded facts, zoom from scene 4, IA notepad'
c['meta']['file'] = 'MAI_HL_U5_L4_Lesson_LogisticModels.html'
c['meta']['artifactTitle'] = 'MAI HL U5 L4 Logistic Models'
json.dump(c, open("content.json", "w"), indent=1, ensure_ascii=False)
print(len(out), 'slides')
for i, s in enumerate(out):
    print(i, s['type'], s.get('preset', ''), s.get('eyebrow', s.get('title', '')))
