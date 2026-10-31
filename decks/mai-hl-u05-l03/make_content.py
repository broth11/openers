"""MAI HL U5 L3 Exponential and logarithmic models, v22 (Ben, 31/10/2026).

Starts from the v21 content (v1_content.json, written by the v21 generator) and adds the v22 house rules:
  - a title card before each scene (name in large type, the drawing large, the model form beside it)
  - a setup slide per scene: preamble, the given facts as a paragraph, then (Next) the same facts as colour-coded bullets
    in the same place while the matching points and lines appear on the graph in the same colours
  - the question slides carry the facts as a short colour-coded row above the drawing (replaces the heading)
  - IA: what and why as bullets, the experiment as a numbered lab procedure on a notepad
  - slider animations 1.5 times faster (meta.animSpeed)
Every value the new text states is checked with sympy first.
"""
import copy, json, re
import sympy as sp

c = json.load(open("v1_content.json"))
S = c['slides']

# ---- checks on the numbers the new text states ----
k_, c_ = sp.symbols('k c')
assert sp.solve([k_ + c_ - 92, sp.Rational(81, 100) * k_ + c_ - sp.Rational(787, 10)], [k_, c_]) == {k_: 70, c_: 22}
Tf = lambda x: 70 * sp.Rational(9, 10) ** x + 22
assert Tf(0) == 92 and Tf(2) == sp.Rational(787, 10) and abs(float(Tf(9)) - 49.1) < 0.05
Sf = lambda h: 20 + 10 * sp.log(h)
assert Sf(1) == 20 and round(float(Sf(10)), 2) == 43.03
Hf = lambda p: sp.Integer(10) ** (-p)
assert Hf(2) * 1000 == 10                                    # lemon: 10 mmol/L, the graph's x
assert abs(float(Hf(sp.Rational(44, 10)) * 1000) - 0.0398) < 5e-5   # tomato: 0.0398 mmol/L
assert round(float(sp.Integer(10) ** sp.Rational(24, 10))) == 251

# ---- windows (as v21: no scene needs a re-zoom) ----
WIN = copy.deepcopy(S[1]['graph']['window'])
TWIN = copy.deepcopy(S[9]['graph']['window'])
PWIN = copy.deepcopy(S[16]['graph']['window'])
ART = {1: {'xmin': 0, 'xmax': 1, 'ymin': WIN['ymin'], 'ymax': WIN['ymax']},
       2: {'xmin': 0, 'xmax': 1, 'ymin': TWIN['ymin'], 'ymax': TWIN['ymax']},
       3: {'xmin': 0, 'xmax': 1, 'ymin': PWIN['ymin'], 'ymax': PWIN['ymax']}}

# ---- facts (role colours; the same colour marks the point or line on the graph) ----
F = {
    'c0':   {'html': '<b>$92$ °C at $t=0$</b>: the first reading', 'c': 'pink'},
    'c2':   {'html': '<b>$78.7$ °C at $t=2$</b>: two minutes later', 'c': 'indigo'},
    'cu':   {'html': '$t$ is in minutes and $T$ in °C', 'shape': 'none'},
    't1':   {'html': '<b>$20$ wpm at $h=1$</b>: after one hour', 'c': 'pink'},
    't10':  {'html': '<b>$43.03$ wpm at $h=10$</b>: after ten hours', 'c': 'indigo'},
    'tu':   {'html': '$h$ is in hours and $S$ in words per minute', 'shape': 'none'},
    'lem':  {'html': 'Lemon juice: <b>pH $2.0$</b>', 'c': 'pink'},
    'tom':  {'html': 'Tomato: <b>pH $4.4$</b>', 'c': 'indigo'},
    'def':  {'html': 'Definition: <b>$\\mathrm{pH}=-\\log_{10}[\\mathrm{H}^+]$</b>', 'c': 'blue', 'shape': 'cv'},
    'pu':   {'html': '$[\\mathrm{H}^+]$ is in mmol/L on the graph', 'shape': 'none'},
}
SHORT = {'c0': '<b>$92$ °C at $t=0$</b>', 'c2': '<b>$78.7$ °C at $t=2$</b>',
         't1': '<b>$20$ wpm at $h=1$</b>', 't10': '<b>$43.03$ wpm at $h=10$</b>',
         'lem': 'lemon <b>pH $2.0$</b>', 'tom': 'tomato <b>pH $4.4$</b>', 'def': '<b>$\\mathrm{pH}=-\\log_{10}[\\mathrm{H}^+]$</b>'}
GIVEN = {1: ['c0', 'c2'], 2: ['t1', 't10'], 3: ['lem', 'tom', 'def']}
fact = lambda k: copy.deepcopy(F[k])

pt = lambda at, role, step=0, **kw: dict({'kind': 'point', 'at': at, 'step': step, 'color': role}, **kw)
TINT = dict(tint=True)
PCURVE = [{'kind': 'fn', 'expr': '3 - log(x)/log(10)', 'domain': [0.0013, 12.5], 'color': 'blue', 'step': 0}]
PHCURVE1 = lambda step: [dict(PCURVE[0], step=step)]

SCENES = {
    1: dict(
        key='Cooling coffee', title='The Cooling Coffee Cup', head='A coffee on the table', kind='coffee',
        art={'T': 92, 't': 0}, formula='T=k(0.9)^t+c', window=WIN,
        pre='A cup of coffee is left on a table in a room. It loses heat to the air, quickly at first.',
        para='Two readings are taken. At the start, $t=0$, the coffee is $92$ °C. Two minutes later, at $t=2$, it is $78.7$ °C. '
             'Time $t$ is in minutes.',
        facts=['c0', 'c2', 'cu'],
        alt='A cup of coffee on a table and a thermometer beside the graph',
        items=[pt([0, 92], 'pink', 1, label='(0,\\,92)', anchor='ne', **TINT),
               pt([2, 78.7], 'indigo', 1, label='(2,\\,78.7)', anchor='ne', **TINT)],
        states=[[0, {'T': 92, 't': 0}], [1, {'T': 78.7, 't': 2}]]),
    2: dict(
        key='Typing speed', title='The Typing Student', head='A student practises typing', kind='typing',
        art={'S': 43.03, 'h': 10}, formula='S=a+b\\ln h', window=TWIN,
        pre='A student practises typing, and her speed is timed after each stretch of practice.',
        para='After $1$ hour of practice she types $20$ words per minute. After $10$ hours she types $43.03$ words per minute. '
             'The practice time $h$ is in hours.',
        facts=['t1', 't10', 'tu'],
        alt='A laptop and a words-per-minute gauge beside the graph',
        items=[pt([1, 20], 'pink', 1, label='(1,\\,20)', anchor='se', **TINT),
               pt([10, 43.03], 'indigo', 1, label='(10,\\,43.03)', anchor='nw', **TINT)],
        states=[[0, {'S': 20, 'h': 1}], [1, {'S': 43.03, 'h': 10}]]),
    3: dict(
        key='pH scale', title='Lemon, Tomato and Water', head='A pH strip', kind='ph',
        art={}, formula='\\mathrm{pH}=-\\log_{10}[\\mathrm{H}^+]', window=PWIN,
        pre='A pH strip tells how acidic a liquid is. A food-science class tests lemon juice, a tomato, and pure water with one.',
        para='Lemon juice has pH $2.0$ and a tomato has pH $4.4$. Here, $\\mathrm{pH}=-\\log_{10}[\\mathrm{H}^+]$, where $[\\mathrm{H}^+]$ '
             'is the concentration of hydrogen ions. The graph measures it in mmol/L.',
        facts=['lem', 'tom', 'def', 'pu'],
        alt='A pH strip with lemon juice, tomato and water beside the graph',
        items=[pt([10, 2], 'pink', 1, label='\\text{lemon}', anchor='ne', **TINT),
               pt([0.0398, 4.4], 'indigo', 1, label='\\text{tomato}', anchor='ne', **TINT)] + PHCURVE1(1),
        states=[[0, {}]]),
}


def recolour(sl, n):
    g = sl['graph']
    for it in g['items']:
        at = it.get('at')
        if it['kind'] == 'point' and not it.get('answer'):
            if at in ([0, 92], [1, 20]) or (n == 3 and at == [10, 2]):
                it['color'] = 'pink'; it['tint'] = True
            elif at in ([2, 78.7], [10, 43.03]) or (n == 3 and at == [0.0398, 4.4]):
                it['color'] = 'indigo'; it['tint'] = True
            elif it.get('color') == 'red':           # the limitation reading (0.1, -3.03): a reading, not a model
                it['color'] = 'orange'
        elif it['kind'] == 'segment' and it.get('dashed') and it['from'][1] == it['to'][1] == 22:
            it['color'] = 'brown'
        elif it['kind'] == 'label' and it.get('tex') == 'y=22':
            it['color'] = 'brown'
    if n == 3 and not any(i['kind'] == 'fn' for i in g['items']):
        g['items'] = g['items'] + PCURVE         # the definition is given, so its curve is on from the start
    elif n == 3:
        for it in g['items']:
            if it['kind'] == 'fn': it['step'] = 0
    if n == 3 and ('Question 1' in sl['eyebrow'] or 'Question 2' in sl['eyebrow']):
        lab = 'Question 1' in sl['eyebrow']        # labelled where there is room (Q2 has the answer point beside them)
        g['items'] = g['items'] + [pt([10, 2], 'pink', 0, **(dict(label='\\text{lemon}', anchor='ne', **TINT) if lab else {})),
                                   pt([0.0398, 4.4], 'indigo', 0, **(dict(label='\\text{tomato}', anchor='ne', **TINT) if lab else {}))]
    g.pop('heading', None)
    keys = GIVEN[n]
    if n == 3 and 'Question 1' in sl['eyebrow']:     # the definition is not needed to predict; keeps the stem short
        keys = ['lem', 'tom']
    g['given'] = [dict(fact(k), html=SHORT[k]) for k in keys]


by_scene = {1: [], 2: [], 3: []}
recap = None
# Q1 pH, 2 of 2: the two powers on one row (same wording) so the left column fits at --G >= 0.95
for sl in S:
    for b in sl.get('blocks', []):
        w = b.get('walk', {})
        if w.get('tex') == ['10^2&=100', '10^3&=1000', '&\\Rightarrow\\text{about }250\\text{ times stronger}']:
            w['tex'] = ['10^2&=100,\\quad 10^3=1000', '&\\Rightarrow\\text{about }250\\text{ times stronger}']
T = {sl.get('title'): sl for sl in S}
a, b = T['Fit the model (2 of 3)'], T['Fit the model (3 of 3)']
if a['eyebrow'].startswith('Cooling'):
    findc = a['blocks'].pop(1)                    # "Find c" moves to the last slide, so no slide passes six working rows
    b['blocks'].insert(0, findc)
    room = [it for it in a['graph']['items'] if it.get('step') == 2 and it['kind'] in ('segment', 'label')]
    a['graph']['items'] = [it for it in a['graph']['items'] if it not in room]
    for it in b['graph']['items']:
        if it['kind'] in ('segment', 'label') and it.get('step', 0) == 0 and (it.get('dashed') or it.get('tex') == 'y=22'):
            it['step'] = 1
        elif it['kind'] == 'fn':
            it['step'] = 2
pq = T['Exactly how much stronger? (1 of 2)']
for bl in pq['blocks']:
    w = bl['walk']
    if w.get('cap') in ('Lemon', 'Tomato'):
        w['tex'] = [w['tex'][0] + w['tex'][1][1:]]     # [H+]&=10^{-2.0} + &=0.01 -> one row, same wording
for sl in S[1:]:
    sc = sl['eyebrow'].split(' · ')[0]
    n = {'Cooling coffee': 1, 'Typing speed': 2, 'pH scale': 3}.get(sc)
    if n: by_scene[n].append(sl)
    else: recap = sl

out = [S[0]]
for n in (1, 2, 3):
    D = SCENES[n]
    out.append({'type': 'sceneTitle', 'scene': n, 'kicker': f'Scene {n} of 3', 'title': D['title'], 'kind': D['kind'],
                'window': ART[n], 'state': D['art'], 'formula': D['formula'],
                'alt': {'coffee': 'The cup of coffee and its thermometer, drawn large',
                        'typing': 'The laptop and its words-per-minute gauge, drawn large',
                        'ph': 'The pH strip with lemon juice, tomato and water, drawn large'}[D['kind']]})
    out.append({'type': 'example', 'scene': n, 'eyebrow': D['key'] + ' · The situation', 'title': D['head'],
                'setup': {'preamble': D['pre'], 'para': D['para'], 'facts': [fact(k) for k in D['facts']]},
                'stem': '', 'blocks': [],
                'graph': {'window': copy.deepcopy(D['window']),
                          'scene': {'kind': D['kind'], 'alt': D['alt'], 'states': D['states']},
                          'items': D['items']}})
    for sl in by_scene[n]:
        sl.pop('sceneStart', None)
        if sl['type'] == 'example':
            recolour(sl, n)
        out.append(sl)
out.append(recap)

# ---- IA catalogue: eight cases in three groups ----
IA = [
    ('Nature', 'Cooling cups', ['How fast hot water cools in different cups'],
     ['Heat leaves faster when the water is much hotter than the room', 'The temperature levels off at room temperature'],
     [['Set up', ['Fill a glass, a mug and a foam cup with hot tap water', 'Stand a thermometer in each']],
      'Every 2 minutes for 30 minutes, read each one',
      'Also read the room temperature',
      'Plot temperature against time']),
    ('Nature', 'Light fading in water', ['The brightness of a torch beam after it passes through layers of water'],
     ['Each layer absorbs the same fraction of the light', 'So brightness falls exponentially with depth'],
     [['Set up', ['Add 3 drops of milk to a litre of water', 'Pour it into identical clear cups']],
      'Shine a torch through 1, 2, 3 and 4 cups onto a phone light meter',
      'Record the reading for each',
      'Plot brightness against cups']),
    ('Nature', 'Bounce heights', ['The height of a ball on each bounce'],
     ['Each bounce keeps about the same fraction of the height', 'So the heights decay exponentially'],
     ['Film a dropped ball beside a metre rule',
      'Step through the video and read each peak',
      'Record bounce number and height',
      'Plot height against bounce number']),
    ('Nature', 'Diluting lemon juice', ['The pH of lemon juice diluted again and again'],
     ['Each tenfold dilution should raise the pH by about $1$', 'The pH is a log scale'],
     [['Set up', ['Make juice, then 1 in 10, 1 in 100, 1 in 1000', 'Use pH strips']],
      'Read the pH of each',
      'Plot pH against the dilution as a power of $10$',
      'Compare with the model']),
    ('Business and society', 'Car depreciation', ['The asking price of one car model against its age'],
     ['A car loses about the same fraction of its value each year', 'The price falls quickly, then slowly'],
     [['Find the data', ['Choose one model on a used-car site', 'Note price and age for 15 listings']],
      'Record age and price in a table',
      'Plot price against age',
      'Fit an exponential and read the yearly loss']),
    ('Business and society', 'Learning curves', ['The time taken to solve a puzzle on each attempt'],
     ['Early practice brings big gains', 'Later gains shrink, as in the typing scene'],
     ['Pick a skill, such as a cube or a typing test',
      'Do it 5 times a day for 3 weeks',
      'Record the mean score each day',
      'Plot score against day and fit $a+b\\ln x$']),
    ('Business and society', 'Phone battery charging', ['The battery percentage as the phone charges'],
     ['Charging slows as the battery nears full', 'A level-off model fits the second half'],
     ['Start the charge at a low level',
      'Every 5 minutes, read the battery percentage',
      'Stop at 100%',
      'Plot percentage against time']),
    ('Scales', 'Sound and distance', ['The sound level in decibels at increasing distances from a speaker'],
     ['Decibels are a log scale of sound intensity', 'Intensity falls with the square of the distance'],
     [['Set up', ['Play a steady tone from a phone', 'Use a decibel app on another phone']],
      'Read the level at 0.5, 1, 2 and 4 metres',
      'Plot level against the log of distance',
      'Compare the slope with the model']),
    ('Scales', 'Earthquake magnitudes', ['The number of earthquakes of each magnitude in a year, from public data'],
     ['Magnitude is a log scale of energy', 'So a log graph of the counts is a straight line'],
     ['Download a year of quakes from a public catalogue',
      'Count how many fall in each magnitude band',
      'Plot the counts on a log scale',
      'Find the factor for each step up']),
    ('Scales', 'Pitch and frequency', ['The frequency of each fret on a ukulele string'],
     ['Each fret raises the pitch by the same ratio', 'So frequency is exponential in the fret number'],
     ['Read the open string on a tuner app',
      'Read the frequency at each fret up to the 12th',
      'Plot frequency against fret number',
      'Find the ratio per fret and test $2^{1/12}$']),
]
IA = [x for x in IA if x[1] not in ('Phone battery charging', 'Bounce heights')]   # the title list sets the height: 8 pass, 9 do not at 1470x830
cat = {'type': 'lab', 'preset': 'catalogue', 'beat': 'IA', 'eyebrow': 'Beyond the story · Exponential and log models around us',
       'title': 'Where else does it happen?',
       'init': {'headings': ['What is measured', 'Why the model fits'], 'items': [{'group': g, 'title': t, 'what': w, 'why': y, 'exp': e} for g, t, w, y, e in IA]}}
out.append(cat)

# ---- meta ----
c['slides'] = out
c['meta']['animSpeed'] = 1.5
c['meta']['source'] = c['meta']['source'] + '; v22 31/10/2026: title cards, setup decode slides, colour-coded facts, IA notepad'
c['meta']['file'] = 'MAI_HL_U5_L3_Lesson_ExpLogModels_v2.html'
c['meta']['artifactTitle'] = 'MAI HL U5 L3 Exp and Log Models v2'


def deg(o):
    if isinstance(o, str):
        return re.sub(r'\$([^$]+)\$ °C', lambda m: '$' + m.group(1) + '\\,{}^{\\circ}\\mathrm{C}$', o).replace('<b>$', '<b>$')
    if isinstance(o, list): return [deg(x) for x in o]
    if isinstance(o, dict): return {k: deg(v) for k, v in o.items()}
    return o


# degrees inside <b>...</b> and in prose: a bare "°C" is rewritten to the KaTeX form
def deg2(o):
    if isinstance(o, str):
        o = re.sub(r'\$([^$]+)\$ °C', lambda m: '$' + m.group(1) + '\\,{}^{\\circ}\\mathrm{C}$', o)
        o = re.sub(r'<b>\$([^$]+)\$ °C( at \$[^$]+\$)</b>', lambda m: '<b>$' + m.group(1) + '\\,{}^{\\circ}\\mathrm{C}$' + m.group(2) + '</b>', o)
        o = o.replace('in °C', 'in $^{\\circ}\\mathrm{C}$') if False else o
        return o
    if isinstance(o, list): return [deg2(x) for x in o]
    if isinstance(o, dict): return {k: deg2(v) for k, v in o.items()}
    return o


c = deg2(deg(c))
assert '$ °C' not in json.dumps(c, ensure_ascii=False), 'a bare degree sign is left after a maths span'
json.dump(c, open('content.json', 'w'), indent=1, ensure_ascii=False)
print(len(out), 'slides')
for i, s in enumerate(out):
    print(i, s['type'], s.get('preset', ''), s.get('eyebrow', s.get('title', '')), '|', s.get('title', '') if s['type'] != 'sceneTitle' else '')
