"""v1 (29/10/2026), kept as the base of v2: writes v1_content.json, which make_content.py reads.
MAI HL U5 L4 online lesson, scene deck: smartphone adoption, exponential first, then logistic.
Source: the scene plan agreed with Ben (29/10/2026); broth11/openers has no u05-l04 module yet.
Every value is checked with sympy before it is written."""
import json
import re
import sympy as sp

# ---------------------------------------------------------------- sympy checks
t = sp.Symbol('t', real=True)
k = sp.log(sp.Rational(15, 7)) / 2                      # exact growth parameter
E = lambda x: 5 * sp.Integer(2) ** sp.Rational(x, 2)
L = lambda x: 80 / (1 + 15 * sp.exp(-k * x))
Lf = lambda x: float(L(sp.nsimplify(x)))

# the exponential: 5 at t=0, 10 at t=2, doubling every two years
assert E(0) == 5 and E(2) == 10 and E(4) == 20 and E(6) == 40 and E(8) == 80 and E(10) == 160
# the logistic: same two readings, limit 80
assert sp.simplify(L(0)) == 5
assert sp.simplify(L(2)) == 10                          # exp(-2k) = 7/15 exactly
assert round(float(k), 3) == 0.381
assert round(80 / (1 + 15 * float(sp.exp(-0.762))), 1) == 10.0          # the check shown with k rounded to 0.381
assert round(float(15 * sp.exp(-0.762)) + 1, 1) == 8.0
assert sp.limit(L(t), t, sp.oo) == 80
# later readings, whole numbers (they are the logistic values, rounded)
OBS = {4: 19, 6: 32, 8: 47, 10: 60, 12: 69}
for x, v in OBS.items():
    assert round(Lf(x)) == v, (x, Lf(x))
RD = {0: 5, 2: 10, **OBS}
inc = [RD[a + 2] - RD[a] for a in range(0, 12, 2)]
assert inc == [5, 9, 13, 15, 13, 9], inc
# every reading below the exponential forecast from year 4 on
assert all(OBS[x] < float(E(x)) for x in OBS)
# inflection: steepest point of L, at half the limit
tstar = sp.log(15) / k
assert round(float(tstar), 1) == 7.1 and sp.simplify(L(tstar)) == 40
assert round(float(sp.log(15)) / 0.381, 1) == 7.1
dL = sp.diff(L(t), t)
grid = [i / 100 for i in range(0, 2000)]
vals = [float(dL.subs(t, g)) for g in grid]
assert abs(grid[vals.index(max(vals))] - float(tstar)) < 0.02
assert all(v > 0 for v in vals)                                       # never falling
assert round(float(L(16)), 1) == 77.4 and round(float(L(10)), 1) == 60.1
assert round(float(sp.exp(-0.381 * 10)), 3) == 0.022
ts = round(float(tstar), 3)

# scene 6 variants (k 0.38, limit 80, start 5 is the lab's opening model)
def Lp(x, kk, M, P0): return M / (1 + (M - P0) / P0 * float(sp.exp(-kk * x)))
assert round(Lp(8, .38, 80, 5)) == 47
V_K, V_M, V_P = (0.6, 80, 5), (0.38, 95, 5), (0.38, 80, 20)
p_k, p_m, p_p = [round(Lp(8, *v)) for v in (V_K, V_M, V_P)]
assert (p_k, p_m, p_p) == (71, 51, 70), (p_k, p_m, p_p)
assert p_k > 47 and p_m > 47 and p_p > 47

# ---------------------------------------------------------------- windows and graph helpers
WIN_A = {"xmin": -1.8, "xmax": 16.5, "ymin": -14, "ymax": 182, "gridx": 2, "gridy": 20, "xtick": 2, "ytick": 20,
         "xname": "t", "yname": "A", "xtickFrom": 0, "ytickFrom": 0}
WIN_B = {"xmin": -2.4, "xmax": 22, "ymin": -12, "ymax": 140, "gridx": 2, "gridy": 20, "xtick": 4, "ytick": 20,
         "xname": "t", "yname": "A", "xtickFrom": 0, "ytickFrom": 0}
PHONE = {"kind": "phone", "alt": "A phone that fills with adoption beside the graph of adoption against time"}

H1 = 'A region adopts smartphones: $5\\%$ of residents at $t=0$ and $10\\%$ at $t=2$. Time $t$ is in years.'
H2 = 'The forecast $E(t)=5\\cdot 2^{t/2}$ gives the percentage with a phone after $t$ years. Full is $100\\%$.'
H3 = 'The same region, followed for longer. The exponential forecast stays, faded.'
H4 = 'A second model, $L(t)$, fits the same two readings and levels off at $80\\%$.'
H5 = '$L(t)=\\dfrac{80}{1+15e^{-0.381t}}$. Where is adoption increasing fastest?'
H6 = 'A logistic model can change in three ways: growth rate, limit, and starting level.'


def graph(win, heading, items, states):
    return {"window": win, "heading": heading, "scene": dict(PHONE, states=states), "items": items}


def walk(cap=None, tex=None, note=None, ans=False):
    w = {}
    if cap: w["cap"] = cap
    if tex: w["tex"] = tex
    if note: w["note"] = note
    if ans: w["ans"] = True
    return {"walk": w}


def pt(x, y, label=None, anchor="ne", step=0, **kw):
    d = {"kind": "point", "at": [x, y], "step": step}
    if label: d.update(label=label, anchor=anchor)
    d.update(kw)
    return d


def seg(a, b, step=0, **kw):
    return dict({"kind": "segment", "from": list(a), "to": list(b), "step": step}, **kw)


def lab_(x, y, tex, anchor="s", step=0):
    return {"kind": "label", "at": [x, y], "tex": tex, "anchor": anchor, "step": step}


def fn(expr, domain, color=None, step=0, until=None):
    d = {"kind": "fn", "expr": expr, "domain": domain, "step": step}
    if until is not None: d["until"] = until
    if color: d["color"] = color
    return d


XA = (WIN_A["xmin"], WIN_A["xmax"])
XB = (WIN_B["xmin"], WIN_B["xmax"])
EXP = "5*2**(x/2)"
LOG = "80/(1+15*exp(-x*log(Rational(15,7))/2))"
LOG38 = "80/(1+15*exp(-0.38*x))"


def lines_a(step100=0, step80=None):
    items = [seg((0, 100), (XA[1], 100), step100, dashed=True)]
    if step80 is not None:
        items += [seg((0, 80), (XA[1], 80), step80, dashed=True)]
    return items


def lines_b(step80=0):
    return [seg((0, 100), (XB[1], 100), 0, dashed=True),
            seg((0, 80), (XB[1], 80), step80, dashed=True)]


def st(t_, P, G=None, cap=None, dp=0, Pn="A", **kw):
    d = {"t": t_, "P": P, "dp": dp, "Pn": Pn}
    if G is not None: d["G"] = G
    if cap is not None: d["cap"] = cap
    d.update(kw)
    return d


GIVEN = lambda: [pt(0, 5), pt(2, 10)]
OBSP = lambda: [pt(4, 19, None, "ne", 1), pt(6, 32, None, "ne", 1), pt(8, 47, None, "ne", 2),
                pt(10, 60, None, "ne", 2), pt(12, 69, None, "ne", 3)]

# ---------------------------------------------------------------- questions
Q11 = 'If adoption keeps doubling every two years, what model could we use?'
Q12 = 'Predict: what does the model give after four years?'
P12 = ['$15\\%$', '$20\\%$', '$40\\%$']
Q21 = 'Follow the model forward. What does it predict after six years? After eight years?'
Q22 = 'Predict: what does the model give after ten years?'
P22 = ['$100\\%$', '$120\\%$', '$160\\%$']
Q23 = 'What has failed: the calculation, or our assumption?'
P23 = ['The calculation', 'The assumption that adoption can keep doubling', 'Both of them']
Q31 = 'As more residents adopt, what happens to the number still available to adopt? Describe in words how adoption should continue.'
Q32 = 'More readings arrive from the same region. Describe what they show.'
Q33 = 'Must the eventual level of adoption be $100\\%$?'
Q41 = 'A logistic model $L(t)$ must give $5\\%$ at $t=0$, give $10\\%$ at $t=2$, and level off at $80\\%$. Does this one do it?'
Q42 = 'Predict: as $t$ increases, what happens to $e^{-0.381t}$?'
P42 = ['It grows without limit', 'It shrinks towards $0$', 'It stays at $1$']
Q51 = 'Predict: does adoption grow fastest at the beginning, near the ceiling, or somewhere in between?'
P51 = ['At the beginning', 'Near the ceiling', 'Somewhere in between']
Q52 = 'Where is the steepest point, the inflection point? Give the level of adoption and the time.'
Q53 = 'After the inflection point, is adoption falling?'
P53 = ['Yes, adoption falls', 'No, it still rises, but more slowly', 'No, it rises at the same rate']
Q60 = 'The region is considering two different actions. Read both carefully before matching them to a change in the model.'
Q61 = 'Which change to the model could represent the subsidy? Which could represent the earlier launch?'
Q62 = 'Why is a logistic model more plausible here? What could still make its forecast fail?'


CASES = [
    {"group": "Nature", "title": "Yeast in sugar water",
     "what": "The number of yeast cells in a closed bottle of warm sugar water.",
     "why": "Cells divide quickly while there is plenty of sugar. Then the sugar runs low and waste builds up, so the population levels off at what the bottle can support.",
     "exp": "Put warm sugar water and a pinch of yeast in a clear bottle. Every 15 minutes for three hours, measure the height of the foam with a ruler. Foam height tracks how many cells are working. Plot height against time."},
    {"group": "Nature", "title": "Duckweed on a tray of water",
     "what": "The number of duckweed fronds floating on a tray of pond water.",
     "why": "Every frond makes new fronds. As the surface fills, they crowd and shade each other, so growth slows towards the number the tray can hold.",
     "exp": "Start with 5 fronds in a tray by a window. Each day, photograph the tray from above and count the fronds. Keep going for about three weeks, then plot the count against days."},
    {"group": "Nature", "title": "Bean seedling height",
     "what": "The height of a bean plant, measured every day from planting.",
     "why": "A seedling grows slowly at first, fastest in the middle of its life, then slows as it nears the height its species can reach.",
     "exp": "Plant several beans in pots on a windowsill. At the same time each day, measure each stem with a ruler. Average the heights and plot the average against days for six weeks."},
    {"group": "Nature", "title": "Fish in a stocked pond",
     "what": "The number of fish after a pond is stocked with a few.",
     "why": "With food and space to spare, numbers climb quickly. Crowding and a limited food supply then hold the population near what the pond can support.",
     "exp": "Use mark and recapture. Tag 20 fish and release them. Later, catch a second sample and use the fraction that are tagged to estimate the total. Repeat each month. Practise first on a bowl of beans."},
    {"group": "Business and society", "title": "Flu in a school",
     "what": "The total number of people who have caught flu since the first case.",
     "why": "Early on, each sick student meets many healthy ones. Later most people have already had it, so new cases fall away and the total levels off.",
     "exp": "Play it as a class game. One student holds a card. Each round, every card holder taps one random classmate, who takes a card too. Count card holders after each round and plot the count against rounds."},
    {"group": "Business and society", "title": "Streaming subscribers",
     "what": "The total number of paying subscribers to a new streaming service.",
     "why": "Word of mouth speeds growth at first. Eventually most people who would ever subscribe already have, so the total flattens.",
     "exp": "Companies publish subscriber totals each quarter. Collect eight to twelve quarters from the service's first years, plot subscribers against quarter, and find where the curve bends."},
    {"group": "Business and society", "title": "Electric cars on the road",
     "what": "The share of cars in a country that are electric.",
     "why": "A few early adopters go first. The share then climbs quickly as prices fall and chargers spread, and slows as the market fills.",
     "exp": "Once a month, tally 100 cars in the school car park and record how many are electric. Plot the percentage against months for a year."},
    {"group": "Business and society", "title": "A viral video's views",
     "what": "The total views of a new video, day by day.",
     "why": "Each viewer shares it, so views surge. After a while most people who would watch it already have, so new views dry up.",
     "exp": "Pick a video posted today. At the same time each day for two weeks, note its view count. Plot total views against days and find the day with the most new views."},
    {"group": "Business and society", "title": "A rumour in a class",
     "what": "The number of students who have heard a piece of news.",
     "why": "Each student who knows it tells friends, so the number who know grows faster and faster. Later, few students are left who have not heard it.",
     "exp": "Tell one student a harmless message in the morning. At each break, ask everyone who knows it to raise a hand and count. Plot the count against the time of day."},
]

slides = [
    {"type": "title", "eyebrow": "IB Mathematics: Applications and Interpretations HL · Unit 5 · Lesson 4",
     "title": "Logistic models", "lede": "Online lesson: one story, six scenes",
     "code": "MAI HL U5 L4", "regime": "C", "regimeText": "calculator allowed"},

    # ---------------- 1. A promising start
    {"type": "example", "eyebrow": "A promising start · Question 1", "title": "A model that doubles", "stem": Q11,
     "blocks": [walk("Let $E(t)$ be the percentage: start at $5$, double every $2$ years", ["E(0)&=5", "E(2)&=5\\cdot 2=10"]),
                walk("The model", ["E(t)&=5\\cdot 2^{t/2}"],
                     "$t$ years is $t/2$ doublings.", ans=True)],
     "graph": graph(WIN_A, H1, GIVEN() + [fn(EXP, [0, 10.4], "red", 2)],
                    [[0, st(0, 5, 5, Pn="E")], [1, st(2, 10, 10, Pn="E")]])},

    {"type": "example", "eyebrow": "A promising start · Question 2", "title": "Four years on", "stem": Q12,
     "choices": P12, "correct": 1, "pickStep": 1,
     "blocks": [walk("Two more years doubles it again", ["E(4)&=5\\cdot 2^{4/2}", "&=5\\cdot 4=20"],
                     "Adding $5$ again would give $15\\%$. Doubling gives $20\\%$.", ans=True)],
     "graph": graph(WIN_A, H1, GIVEN() + [fn(EXP, [0, 10.4], "red"), pt(4, 20, "(4,\\,20)", "se", 1, answer=True)],
                    [[0, st(2, 10, 10, Pn="E")], [1, st(4, 20, 20, Pn="E")]])},

    # ---------------- 2. Follow the exponential prediction
    {"type": "example", "eyebrow": "Follow the model · Question 1", "title": "Six years and eight years", "stem": Q21,
     "blocks": [walk("After $6$ years", ["E(6)&=5\\cdot 2^{3}", "&=40"], ans=True),
                walk("After $8$ years", ["E(8)&=5\\cdot 2^{4}", "&=80"], ans=True)],
     "graph": graph(WIN_A, H2, GIVEN() + lines_a() + [fn(EXP, [0, 10.4], "red"), pt(4, 20),
                    pt(6, 40, "(6,\\,40)", "nw", 1), pt(8, 80, "(8,\\,80)", "se", 2)],
                    [[0, st(4, 20, 20, Pn="E")], [1, st(6, 40, 40, Pn="E")], [2, st(8, 80, 80, Pn="E")]])},

    {"type": "example", "eyebrow": "Follow the model · Question 2", "title": "Ten years on", "stem": Q22,
     "choices": P22, "correct": 2, "pickStep": 1,
     "blocks": [walk("Two more years doubles it again", ["E(10)&=5\\cdot 2^{5}", "&=160"],
                     "That is more than all of the residents. The phone cannot hold more than $100\\%$.", ans=True)],
     "graph": graph(WIN_A, H2, GIVEN() + lines_a() + [fn(EXP, [0, 10.4], "red"), pt(8, 80, "(8,\\,80)", "se"),
                    pt(10, 160, "(10,\\,160)", "se", 1, answer=True)],
                    [[0, st(8, 80, 80, Pn="E")], [1, st(10, 160, 160, Pn="E")]])},

    {"type": "example", "eyebrow": "Follow the model · Question 3", "title": "The calculation or the assumption?", "stem": Q23,
     "choices": P23, "correct": 1, "pickStep": 2,
     "blocks": [walk("The arithmetic is correct", ["5\\cdot 2^{5}&=160"]),
                walk("The assumption fails", ["&\\text{Adoption cannot keep doubling}"],
                     "Doubling for ever needs more than $100\\%$ of the residents.", ans=True)],
     "graph": graph(WIN_A, H2, GIVEN() + lines_a() + [fn(EXP, [0, 10.4], "red"), pt(10, 160, "(10,\\,160)", "se")],
                    [[0, st(10, 160, 160, Pn="E")]])},

    # ---------------- 3. What should happen instead?
    {"type": "example", "eyebrow": "What should happen? · Question 1", "title": "Who is left to adopt?", "stem": Q31,
     "blocks": [walk("The pool shrinks", ["\\text{available}&=100-\\text{adopted}"],
                     "Every new owner leaves one fewer resident who could still adopt, so new adopters get harder to find.")],
     "graph": graph(WIN_A, H3, GIVEN() + lines_a() + [fn(EXP, [0, 10.4], "grey")],
                    [[0, {"P": 40, "avail": True, "dp": 0}]])},

    {"type": "example", "eyebrow": "What should happen? · Question 2", "title": "Later readings", "stem": Q32,
     "blocks": [walk(None, ["t&=4:\\ 19\\%", "t&=6:\\ 32\\%"]),
                walk(None, ["t&=8:\\ 47\\%", "t&=10:\\ 60\\%"]),
                walk(None, ["t&=12:\\ 69\\%"],
                     "Adoption keeps rising, but it is slowing down.")],
     "graph": graph(WIN_A, H3, GIVEN() + lines_a() + [fn(EXP, [0, 10.4], "grey")] + OBSP(),
                    [[0, st(2, 10)], [1, st(6, 32)], [2, st(10, 60)], [3, st(12, 69)]])},

    {"type": "example", "eyebrow": "What should happen? · Question 3", "title": "Must it reach 100%?", "stem": Q33,
     "blocks": [{"text": "Some residents may never adopt due to cost, access, preference."},
                walk("A proposed limit", ["\\text{saturation level}&=80\\%"],
                     "Suppose adoption levels off at $80\\%$. There is no equation yet, only the behaviour we need: early growth, then slowing towards a ceiling.", ans=True)],
     "graph": graph(WIN_A, H3, GIVEN() + lines_a(0, 2) + [fn(EXP, [0, 10.4], "grey")] + [
         pt(4, 19), pt(6, 32), pt(8, 47), pt(10, 60), pt(12, 69)],
                    [[0, st(12, 69)], [2, st(12, 69, cap=80)]])},

    # ---------------- 4. Meet the logistic model
    {"type": "example", "eyebrow": "Meet the logistic · Question 1", "title": "Check the logistic model (1 of 2)", "stem": Q41,
     "blocks": [walk("The three conditions", ["L(0)&=5", "L(2)&=10", "L(t)&\\to 80\\ \\text{ as }t\\to\\infty"]),
                walk("A logistic model", ["L(t)&=\\frac{80}{1+15e^{-0.381t}}"],
                     "The numerator is the limit. The $15$ and $0.381$ make the other two conditions hold.")],
     "graph": graph(WIN_A, H4, GIVEN() + lines_a(0, 0) + [fn(EXP, [0, 10.4], "grey"), fn(LOG, [0, 16.5], "blue", 2)],
                    [[0, st(0, 5, cap=80, dp=0, Pn="L")]])},

    {"type": "example", "eyebrow": "Meet the logistic · Question 1", "title": "Check the logistic model (2 of 2)", "stem": Q41,
     "blocks": [walk("Check $t=0$", ["L(0)&=\\frac{80}{1+15e^{0}}=\\frac{80}{16}", "&=5"]),
                walk("Check $t=2$", ["L(2)&=\\frac{80}{1+15e^{-0.762}}\\approx\\frac{80}{8}", "&=10"], ans=True)],
     "graph": graph(WIN_A, H4, GIVEN() + lines_a(0, 0) + [fn(EXP, [0, 10.4], "grey"), fn(LOG, [0, 16.5], "blue")],
                    [[0, st(0, 5, cap=80, dp=0, Pn="L")], [2, st(2, 10, cap=80, dp=0, Pn="L")]])},

    {"type": "example", "eyebrow": "Meet the logistic · Question 2", "title": "What the exponential term does", "stem": Q42,
     "choices": P42, "correct": 1, "pickStep": 1,
     "blocks": [walk(None, ["t\\to\\infty:\\quad e^{-0.381t}&\\to 0"]),
                walk("The denominator approaches $1$", ["L(t)&\\to\\frac{80}{1+0}=80"],
                     "$y=80$ is a horizontal asymptote: adoption nears $80\\%$, never reaching it.", ans=True)],
     "graph": graph(WIN_A, H4, GIVEN() + lines_a(0, 0) + [fn(EXP, [0, 10.4], "grey"), fn(LOG, [0, 16.5], "blue"),
                    pt(16, 77.4, None, "ne", 2)],
                    [[0, st(10, 60.1, cap=80, dp=1, Pn="L")], [2, st(16, 77.4, cap=80, dp=1, Pn="L")]])},

    {"type": "lab", "preset": "sceneLab", "eyebrow": "Meet the logistic · Trace the models", "title": "Where do the predictions separate?",
     "init": {"kind": "phone", "window": WIN_A, "start": 0, "seconds": 14}},

    # ---------------- 5. Where is adoption increasing fastest?
    {"type": "example", "eyebrow": "Where is it fastest? · Question 1", "title": "Compare equal intervals (1 of 2)", "stem": Q51,
     "choices": P51, "correct": 2, "pickStep": 0,
     "blocks": [walk("The rise over each $2$ years", ["&0\\to 2:\\ +5", "&2\\to 4:\\ +9", "&4\\to 6:\\ +13"])],
     "graph": graph(WIN_B, H5, lines_b() + [fn(LOG, [0, 22], "blue")] + [pt(0, 5), pt(2, 10), pt(4, 18.75), pt(6, 31.7)] + [seg((0, 5), (2, 5), 1, dotted=True), seg((2, 5), (2, 10), 1, dotted=True),
         seg((2, 10), (4, 10), 1, dotted=True), seg((4, 10), (4, 18.75), 1, dotted=True),
         seg((4, 18.75), (6, 18.75), 1, dotted=True), seg((6, 18.75), (6, 31.7), 1, dotted=True)],
                    [[0, st(0, 5, cap=80, Pn="L")], [1, st(6, 32, cap=80, Pn="L")]])},

    {"type": "example", "eyebrow": "Where is it fastest? · Question 1", "title": "Compare equal intervals (2 of 2)", "stem": Q51,
     "choices": P51, "correct": 2, "pickStep": 1,
     "blocks": [walk("Keep going", ["&6\\to 8:\\ +15", "&8\\to 10:\\ +13", "&10\\to 12:\\ +9"],
                     "The biggest rise is between $t=6$ and $t=8$, in the middle.", ans=True)],
     "graph": graph(WIN_B, H5, lines_b() + [fn(LOG, [0, 22], "blue")] + [pt(0, 5), pt(2, 10), pt(4, 18.75), pt(6, 31.7), pt(8, 46.8), pt(10, 60.1), pt(12, 69.3)] + [seg((0, 5), (2, 5), 0, dotted=True), seg((2, 5), (2, 10), 0, dotted=True),
         seg((2, 10), (4, 10), 0, dotted=True), seg((4, 10), (4, 18.75), 0, dotted=True),
         seg((4, 18.75), (6, 18.75), 0, dotted=True), seg((6, 18.75), (6, 31.7), 0, dotted=True)] + [
         seg((6, 31.7), (8, 31.7), 1, dotted=True), seg((8, 31.7), (8, 46.8), 1, dotted=True),
         seg((8, 46.8), (10, 46.8), 1, dotted=True), seg((10, 46.8), (10, 60.1), 1, dotted=True),
         seg((10, 60.1), (12, 60.1), 1, dotted=True), seg((12, 60.1), (12, 69.3), 1, dotted=True)],
                    [[0, st(6, 32, cap=80, Pn="L")], [1, st(12, 69, cap=80, Pn="L")]])},

    {"type": "example", "eyebrow": "Where is it fastest? · Question 2", "title": "The inflection point (1 of 2)", "stem": Q52,
     "blocks": [walk("Half the limiting level", ["L&=\\frac{80}{2}=40"],
                     "The inflection point is at half the limit."),
                walk("Set $L(t)=40$", ["\\frac{80}{1+15e^{-0.381t}}&=40", "1+15e^{-0.381t}&=\\frac{80}{40}"])],
     "graph": graph(WIN_B, H5, lines_b() + [fn(LOG, [0, 22], "blue"), seg((0, 40), (XB[1], 40), 1, dotted=True)],
                    [[0, st(6, 32, cap=80, Pn="L")], [1, st(6, 32, cap=80, Pn="L")]])},

    {"type": "example", "eyebrow": "Where is it fastest? · Question 2", "title": "The inflection point (2 of 2)", "stem": Q52,
     "blocks": [walk("Solve for $t$", ["15e^{-0.381t}&=\\frac{80}{40}-1", "e^{-0.381t}&=\\frac{1}{15}"]),
                walk("Take logarithms", ["t&=\\frac{\\ln 15}{0.381}\\approx 7.1"], ans=True)],
     "graph": graph(WIN_B, H5, lines_b() + [fn(LOG, [0, 22], "blue"), seg((0, 40), (ts, 40), 0, dotted=True),
                    seg((ts, WIN_B["ymin"]), (ts, 40), 2, dotted=True), pt(ts, 40, None, "ne", 2, answer=True)],
                    [[0, st(6, 32, cap=80, Pn="L")], [2, st(ts, 40, cap=80, dp=1, Pn="L")]])},

    {"type": "example", "eyebrow": "Where is it fastest? · Question 3", "title": "Is adoption falling?", "stem": Q53,
     "choices": P53, "correct": 1, "pickStep": 1,
     "blocks": [walk("Compare the readings", ["&8\\to 10:\\ +13", "&10\\to 12:\\ +9"],
                     "The total keeps rising. What shrinks is the number of new adopters each year.", ans=True)],
     "graph": graph(WIN_B, H5, lines_b() + [fn(LOG, [0, 22], "blue"), pt(8, 46.8), pt(10, 60.1), pt(12, 69.3),
                    seg((8, 46.8), (10, 46.8), 1, dotted=True), seg((10, 46.8), (10, 60.1), 1, dotted=True),
                    seg((10, 60.1), (12, 60.1), 1, dotted=True), seg((12, 60.1), (12, 69.3), 1, dotted=True)],
                    [[0, st(8, 47, cap=80, Pn="L")], [1, st(12, 69, cap=80, Pn="L")]])},

    # ---------------- 6. Explore and judge
    {"type": "lab", "preset": "logisticLab", "eyebrow": "Explore and judge · Explore", "title": "Change the model",
     "init": {"window": WIN_B, "start": {"k": 0.38, "M": 80, "P0": 5, "t": 8}}},

    {"type": "example", "eyebrow": "Explore and judge · Question 1", "title": "Two proposals for the region", "stem": Q60,
     "blocks": [walk("Proposal A: a phone subsidy",
                     None,
                     "The government pays part of the price of every phone. Residents who would have waited buy sooner, and some who could never afford one can now buy."),
                walk("Proposal B: an earlier launch",
                     None,
                     "Smartphones reach the region earlier, so adoption has been under way for longer. At $t=0$, more residents already own a phone than the $5\\%$ in our story.")],
     "graph": graph(WIN_B, H6, lines_b() + [fn(LOG38, [0, 22], "blue")],
                    [[0, st(8, 47, cap=80, Pn="L")]])},

    {"type": "example", "eyebrow": "Explore and judge · Question 2", "title": "Subsidy or earlier launch?", "stem": Q61,
     "blocks": [walk("A subsidy: cheaper phones, faster adoption", ["k&\\text{ increases}"]),
                walk("A subsidy: more residents can afford one", ["\\text{limit}&\\text{ increases}"]),
                walk("An earlier launch: the region starts further along", ["\\text{start}&\\text{ increases}"])],
     "graph": graph(WIN_B, H6, lines_b() + [fn(LOG38, [0, 22], "blue"),
                    fn("80/(1+15*exp(-0.6*x))", [0, 22], "red", 1, 1),
                    fn("95/(1+18*exp(-0.38*x))", [0, 22], "red", 2, 2),
                    fn("80/(1+3*exp(-0.38*x))", [0, 22], "red", 3, 3)],
                    [[0, st(8, 47, cap=80, Pn="L")], [1, st(8, p_k, cap=80, Pn="L")], [2, st(8, p_m, cap=95, Pn="L")], [3, st(8, p_p, cap=80, Pn="L")]])},

    {"type": "example", "eyebrow": "Explore and judge · Question 3", "title": "Why logistic? What could fail?", "stem": Q62,
     "blocks": [walk("Why logistic", ["&\\text{It levels off at a limit}", "&\\text{Growth slows as fewer residents are left}"]),
                walk("What could still fail", ["&\\text{The limit may change}", "&\\text{The growth rate may change}"],
                     "The $80\\%$ limit and the growth rate are assumptions. Prices or new technology could change them.")],
     "graph": graph(WIN_B, H6, lines_b() + [fn(LOG38, [0, 22], "blue"), fn(EXP, [0, 9.4], "red")],
                    [[0, st(8, 47, cap=80, Pn="L")]])},
    # ---------------- 7. Logistic growth around us
    {"type": "lab", "preset": "catalogue", "beat": "IA", "eyebrow": "Beyond the story · Logistic growth around us", "title": "Where else does it happen?",
     "init": {"items": CASES}},
]

content = {"meta": {"cohort": "MAI", "cohortLabel": "MAI HL", "lesson": 4, "topic": "LogisticModelsScene",
                    "topicWords": "Logistic models",
                    "file": "MAI_HL_U5_L4_Lesson_LogisticModels.html", "artifactTitle": "MAI HL U5 L4 Logistic Models",
                    "source": "scene plan agreed with Ben 29/10/2026 (no u05-l04 module in github broth11/openers yet)",
                    "largeGraphs": True},
           "slides": slides}

_seen = []
for sl in content["slides"]:
    if sl["type"] != "example": continue
    sc = sl["eyebrow"].split(" · ")[0]
    if sc not in _seen: _seen.append(sc); sl["sceneStart"] = True
    sl["scene"] = _seen.index(sc) + 1
    sl["q"] = int(re.search(r"Question (\d+)", sl["eyebrow"]).group(1))
    m = re.search(r"\((\d+) of \d+\)", sl["title"])
    if m and int(m.group(1)) > 1: sl["cont"] = True
txt = json.dumps(content, ensure_ascii=False)
assert '—' not in txt and '–' not in txt, 'a dash is left'
json.dump(content, open('v1_content.json', 'w'), ensure_ascii=False, indent=1)
print('content.json written:', len(slides), 'slides')
