"""AP Statistics Unit 3 closer: Sampling distribution of p-hat, conditions, and confidence intervals (STS 3.A.1 to 3.A.3).
Plan agreed with Ben 4/11/2026 (grill-me). Scene 1: the E-Nose (STS 3.A.1 Part B). Scenes 2 to 4 to follow.
Every value is checked with sympy / exact binomial before it is written. The simulated dots use the same
generator as statkit.js (mulberry32), so the slides show the very tests the lab replays.
"""
import json, math
import sympy as sp

M32 = 2 ** 32
def mulberry(seed):
    a = seed % M32
    def imul(x, y): return (x * y) % M32
    def nxt():
        nonlocal a
        a = (a + 0x6D2B79F5) % M32
        t = a
        t = imul(t ^ (t >> 15), t | 1)
        t = (t ^ ((t + imul(t ^ (t >> 7), t | 61)) % M32)) % M32
        return ((t ^ (t >> 14)) % M32) / 4294967296
    return nxt

def test(n, i, p, seed):
    r = mulberry(seed * 1000003 + n * 7919 + i * 104729 + 17)
    return ''.join('1' if r() < p else '0' for _ in range(n))

# ---------------- numbers (STS 3.A.1 Part B key) ----------------
p, n, k_obs = sp.Rational(1, 2), 24, 17
obs = sp.Rational(k_obs, n)
sig24 = sp.sqrt(p * (1 - p) / n)
assert round(float(obs), 3) == 0.708 and round(float(sig24), 3) == 0.102
z24 = (0.708 - 0.5) / 0.102
assert round(z24, 2) == 2.04
from sympy.stats import Normal, P as Pr, Binomial
Zs = Normal('Z', 0, 1)
tail24 = float(Pr(Zs >= sp.Rational(204, 100)))
assert round(tail24, 3) == 0.021
sig240 = sp.sqrt(p * (1 - p) / 240)
assert round(float(sig240), 3) == 0.032 and round((0.708 - 0.5) / 0.032, 1) == 6.5
assert float(Pr(Zs >= 6.5)) < 1e-9
exact = float(Pr(Binomial('X', 24, p) >= 17))   # the exact chance a guessing machine gets 17 or more right
print('exact P(X>=17) =', round(exact, 4))

NMAX, SEED = 200, 7
tests = [test(24, i, 0.5, SEED) for i in range(NMAX)]
c_obs = sum(1 for t in tests if t.count('1') / 24 >= float(obs) - 1e-9)
pct = 100 * c_obs / NMAX
print('simulated: %d of %d = %.1f%%' % (c_obs, NMAX, pct))

# ---------------- the dotplot, built exactly as the lab builds it ----------------
def pdf(x, s): return math.exp(-0.5 * ((x - 0.5) / s) ** 2) / (s * math.sqrt(2 * math.pi))
def pile(nn, ts):
    m = max(1, math.ceil(0.02 * nn - 1e-9)); b = m / nn; dh = 1 / (NMAX * b); bins = {}; out = []
    for t in ts:
        j = round(t.count('1') / m); bins[j] = bins.get(j, 0) + 1; out.append((j * m / nn, (bins[j] - 0.5) * dh, t.count('1') / nn))
    top = max(1.2 * pdf(0.5, math.sqrt(0.25 / nn)), (max(bins.values()) + 0.6) * dh)
    return out, b, dh, top

DOTS, B, DH, TOP = pile(24, tests)
XT = [[v, str(v)] for v in (0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8)]
def window(top):
    return {'xmin': 0.15, 'xmax': 0.85, 'ymin': round(-0.1 * top, 4), 'ymax': round(top, 4), 'gridx': 0.1, 'gridy': round(10 * top, 3),
            'xticks': XT, 'yticks': [], 'xname': 'p̂', 'yname': ' ', 'labelMask': True}
W24 = window(TOP)

def dot_items(step=0, until=None, hi_from=None, color='teal'):
    """one small disc per simulated test; hi_from: from that step the discs at or beyond the observed p-hat turn pink"""
    r = 0.4 * min(B / 0.7, DH / (W24['ymax'] - W24['ymin'])); rx, ry = r * 0.7, r * (W24['ymax'] - W24['ymin'])
    items = []
    for (x, y, ph) in DOTS:
        ring = [[round(x + rx * math.cos(a), 5), round(y + ry * math.sin(a), 5)] for a in [q / 14 * 2 * math.pi for q in range(14)]]
        beyond = ph >= float(obs) - 1e-9
        base = {'kind': 'polygon', 'pts': ring, 'color': color, 'opacity': 0.9, 'step': step}
        if until is not None: base['until'] = until
        if hi_from is not None and beyond:
            items.append(dict(base, until=hi_from - 1))
            items.append(dict(base, color='pink', step=hi_from))
        else:
            items.append(base)
    return items

def normal_fn(s, role='blue', step=0, until=None):
    it = {'kind': 'fn', 'expr': f'exp(-(x-0.5)**2/(2*{s}**2))/({s}*sqrt(2*pi))', 'domain': [0.15, 0.85], 'color': role, 'step': step}
    if until is not None: it['until'] = until
    return it

def tail(s, top_cap, step):
    xs = [0.708 + (0.85 - 0.708) * i / 40 for i in range(41)]
    return {'kind': 'polygon', 'pts': [[0.708, 0]] + [[round(x, 4), round(pdf(x, s), 5)] for x in xs] + [[0.85, 0]], 'color': 'pink', 'opacity': 0.4, 'step': step}

def obs_line(top, step=0):
    return [{'kind': 'segment', 'from': [0.708, 0], 'to': [0.708, round(0.97 * top, 4)], 'dashed': True, 'color': 'pink', 'step': step}]

def half_line(top, step=0):
    return [{'kind': 'segment', 'from': [0.5, 0], 'to': [0.5, round(0.97 * top, 4)], 'dotted': True, 'color': 'brown', 'step': step}]

# the real test: 17 of 24 right (12 with Parkinson's in the top three rows, 12 without below)
OBS = '111011101111' + '110110101001'
assert OBS.count('1') == 17 and len(OBS) == 24
OBS240 = ''.join('1' if i % 24 < 17 else '0' for i in range(240))
OBS240 = ''.join(OBS240[(i * 7) % 240] for i in range(240))
assert OBS240.count('1') == 170

ENOSE = lambda states: {'kind': 'enose', 'alt': 'The E-Nose and the 24 people it tested, each guess a tick or a cross, beside a graph of sample proportions', 'states': states}
F = {
    'obs':  {'html': '<b>$\\hat p=\\tfrac{17}{24}\\approx 0.708$</b>: correct in the real test', 'c': 'pink', 'shape': 'ln'},
    'p':    {'html': '<b>$p=0.5$</b>: the rate of a machine that only guesses', 'c': 'brown', 'shape': 'ln'},
    'n':    {'html': '<b>$n=24$</b> people: $12$ with Parkinson\'s, $12$ without', 'shape': 'none'},
}
SHORT = {'obs': '<b>$\\hat p=0.708$</b> observed', 'p': 'guessing: <b>$p=0.5$</b>', 'n': '<b>$n=24$</b>'}
given = lambda keys: [dict(F[k], html=SHORT[k]) for k in keys]

S = []
S.append({'type': 'title', 'eyebrow': 'AP Statistics · Unit 3 · Lessons 3.A.1 to 3.A.3 · Closer',
          'title': 'Sampling distribution of p̂, conditions, and confidence intervals',
          'lede': 'Closer: three scenes and a recap', 'code': 'STS 3.A.1–3.A.3', 'regime': 'C', 'regimeText': 'calculator allowed'})

# ---------------- Scene 1: the E-Nose ----------------
S.append({'type': 'sceneTitle', 'scene': 1, 'kicker': 'Scene 1 of 4 · after 3.A.1', 'title': 'The E-Nose',
          'tagline': 'Can a machine smell Parkinson\'s?', 'kind': 'enose', 'window': {'xmin': 0, 'xmax': 1, 'ymin': 0, 'ymax': 1},
          'state': {'n': 24, 'marks': OBS}, 'alt': 'The E-Nose and the 24 people it tested, 17 ticks and 7 crosses'})
S.append({'type': 'example', 'scene': 1, 'eyebrow': 'The E-Nose · The situation', 'title': 'A machine that sniffs',
          'setup': {'preamble': 'Joy can smell Parkinson\'s disease. Researchers at Zhejiang University built an AI-powered E-Nose to do the same, so the test could be used worldwide.',
                    'para': 'They tested the E-Nose on $24$ people, $12$ with Parkinson\'s and $12$ without. It guessed $17$ of the $24$ correctly, so $\\hat p=\\tfrac{17}{24}\\approx 0.708$. '
                            'A machine that only guesses would be right with probability $p=0.5$ on each person.',
                    'facts': [F['obs'], F['p'], F['n']]},
          'stem': '', 'blocks': [],
          'graph': {'window': W24, 'scene': ENOSE([[0, {'n': 24, 'marks': OBS}]]), 'items': obs_line(TOP, 1) + half_line(TOP, 1)}})
S.append({'type': 'example', 'scene': 1, 'q': 1, 'eyebrow': 'The E-Nose · Question 1', 'title': 'A machine that only guesses',
          'stem': 'In a world where the E-Nose only guesses, what would you expect $\\hat p$ to be?',
          'choices': ['Exactly $0.5$ in every test', 'About $0.5$, give or take', 'About $0.708$'], 'correct': 1, 'pickStep': 1,
          'blocks': [{'walk': {'cap': 'Each guess is right half the time', 'tex': ['\\text{expected correct}&=24(0.5)=12', '\\hat p&\\approx\\tfrac{12}{24}=0.5'],
                               'note': 'Chance moves the count up or down from one test to the next, so it is not exactly $0.5$ every time.', 'ans': True}}],
          'graph': {'window': W24, 'given': given(['obs', 'p']), 'scene': ENOSE([[0, {'n': 24, 'marks': '', 'head': 'A guessing machine'}], [1, {'n': 24, 'marks': tests[0]}]]),
                    'items': obs_line(TOP) + half_line(TOP)}})
S.append({'type': 'example', 'scene': 1, 'q': 2, 'eyebrow': 'The E-Nose · Question 2', 'title': 'Simulate a guessing machine',
          'stem': f'Each dot is one simulated test of a guessing machine: its $\\hat p$. In ${NMAX}$ tests, how often is $\\hat p\\ge 0.708$?',
          'choices': ['About half the time', 'About $1$ test in $5$', 'Only a few tests in $100$'], 'correct': 2, 'pickStep': 1,
          'blocks': [{'walk': {'cap': 'Count the dots at or beyond the dashed line', 'tex': [f'\\hat p\\ge 0.708&:\\ {c_obs}\\text{{ of }}{NMAX}', f'&\\approx {pct:.1f}\\%'],
                               'note': 'A guessing machine rarely does this well, so $17$ correct would be surprising if the E-Nose only guessed.', 'ans': True}}],
          'graph': {'window': W24, 'given': given(['obs', 'p']), 'scene': ENOSE([[0, {'n': 24, 'marks': tests[-1]}]]),
                    'items': dot_items(hi_from=1) + obs_line(TOP) + half_line(TOP)}})
S.append({'type': 'example', 'scene': 1, 'q': 3, 'eyebrow': 'The E-Nose · Question 3', 'title': 'The normal model for p̂',
          'stem': 'The dots pile up in a symmetric mound. Find the mean and standard deviation of the normal model for $\\hat p$.',
          'blocks': [{'walk': {'cap': 'Centre: the guessing rate', 'tex': ['\\mu_{\\hat p}&=p=0.5']}},
                     {'walk': {'cap': 'Spread', 'tex': ['\\sigma_{\\hat p}&=\\sqrt{\\tfrac{p(1-p)}{n}}=\\sqrt{\\tfrac{0.5(1-0.5)}{24}}', '&\\approx 0.102']}},
                     {'walk': {'cap': 'The model', 'tex': ['\\hat p&\\sim\\text{Normal}(\\mu_{\\hat p}=0.5,\\ \\sigma_{\\hat p}=0.102)'],
                               'note': 'The curve sits on the pile of simulated tests.', 'ans': True}}],
          'graph': {'window': W24, 'given': given(['p', 'n']), 'scene': ENOSE([[0, {'n': 24, 'marks': tests[-1]}]]),
                    'items': dot_items() + half_line(TOP) + [normal_fn(float(sig24), 'blue', 3)]}})
S.append({'type': 'example', 'scene': 1, 'q': 4, 'eyebrow': 'The E-Nose · Question 4', 'title': 'Luck, or a real nose?',
          'stem': 'Use the normal model. How likely is $\\hat p\\ge 0.708$ for a machine that only guesses?',
          'blocks': [{'walk': {'cap': 'Standardise', 'tex': ['z&=\\frac{0.708-0.5}{0.102}\\approx 2.04']}},
                     {'walk': {'cap': 'The tail beyond $z$', 'tex': ['P(\\hat p\\ge 0.708)&=P(Z\\ge 2.04)\\approx 0.021'],
                               'note': f'Only about a $2.1\\%$ chance by luck alone, close to the ${pct:.1f}\\%$ of the simulations. We are convinced the E-Nose does better than guessing.', 'ans': True}}],
          'graph': {'window': W24, 'given': given(['obs', 'p']), 'scene': ENOSE([[0, {'n': 24, 'marks': OBS}]]),
                    'items': [tail(float(sig24), TOP, 2)] + dot_items(color='teal') + [normal_fn(float(sig24))] + obs_line(TOP) + half_line(TOP)}})

TOP240 = 1.2 * pdf(0.5, float(sig240))
W240 = window(TOP240)
S.append({'type': 'example', 'scene': 1, 'q': 5, 'eyebrow': 'The E-Nose · Question 5', 'title': 'Ten times the people',
          'stem': 'Now $n=240$ people and $170$ correct: still $\\hat p=0.708$. Is a guessing machine more or less likely to reach it?',
          'choices': ['More likely', 'Just as likely: same $\\hat p$', 'Less likely'], 'correct': 2, 'pickStep': 1,
          'blocks': [{'walk': {'cap': 'The spread with $n=240$', 'tex': ['\\sigma_{\\hat p}&=\\sqrt{\\tfrac{0.5(1-0.5)}{240}}\\approx 0.032']}},
                     {'walk': {'cap': 'How far out is $0.708$ now?', 'tex': ['z&=\\tfrac{0.708-0.5}{0.032}\\approx 6.5,\\quad P(Z\\ge 6.5)\\approx 0'],
                               'note': 'Larger $n$, narrower curve: $0.708$ is now almost impossible by luck.', 'ans': True}}],
          'graph': {'window': W240, 'given': [F['obs'] | {'html': SHORT['obs']}, F['p'] | {'html': SHORT['p']}],
                    'scene': ENOSE([[0, {'n': 240, 'marks': '', 'head': '$240$ people'}], [1, {'n': 240, 'marks': OBS240}]]),
                    'items': [normal_fn(float(sig24), 'grey'), {'kind': 'label', 'at': [0.27, round(0.17 * TOP240, 4)], 'tex': 'n=24', 'anchor': 'c', 'color': 'grey'},
                              normal_fn(float(sig240), 'blue', 1), {'kind': 'label', 'at': [0.47, round(0.8 * TOP240, 4)], 'tex': 'n=240', 'anchor': 'w', 'color': 'blue', 'step': 1}]
                             + obs_line(TOP240) + half_line(TOP240)}})
Q5 = S[-1]; Q5b = json.loads(json.dumps(Q5))
Q5['title'] = 'Ten times the people (1 of 2)'; Q5b['title'] = 'Ten times the people (2 of 2)'; Q5b['cont'] = True
Q5['blocks'] = Q5['blocks'][:1]; Q5b['blocks'] = Q5b['blocks'][1:]; [Q5b.pop(k_) for k_ in ('pickStep', 'choices', 'correct')]
for it in Q5b['graph']['items']:
    it['step'] = 0
Q5b['graph']['scene']['states'] = [[0, {'n': 240, 'marks': OBS240}]]
S.append(Q5b)
S.append({'type': 'lab', 'preset': 'pHatLab', 'eyebrow': 'The E-Nose · Lab', 'title': 'Dots become the curve',
          'init': {'p': 0.5, 'obs': float(obs), 'n': 24, 'sims': NMAX, 'seed': SEED, 'seconds': 9, 'nRange': [24, 240, 1]}})

content = {'meta': {'cohort': 'AP', 'cohortLabel': 'AP Statistics', 'lesson': 3, 'topic': 'SamplingDistributionsCloser',
                    'topicWords': 'Sampling distribution of p̂, conditions, and confidence intervals',
                    'file': 'APStats_U3_3A1-3A3_Closer_SamplingDistributions.html',
                    'artifactTitle': 'AP Stats 3.A Closer',
                    'source': 'STS 3.A.1 Part B, 3.A.2, 3.A.3 handout keys (Unit 3 folder); plan agreed with Ben 4/11/2026',
                    'largeGraphs': True, 'animSpeed': 1.5},
           'slides': S}
json.dump(content, open('content.json', 'w'), indent=1, ensure_ascii=False)
for i, s in enumerate(S):
    print(i, s['type'], s.get('preset', ''), s.get('eyebrow', s.get('title', '')))
