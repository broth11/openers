"""MAI HL U5 L3 online lesson, scene deck: coffee, typing speed, pH, growth-family recap, from the opener
openers/src/lessons/mai-hl/u05-l03-exponential-and-logarithmic-models.js (wording kept; notes kept).
Every value is checked with sympy before it is written."""
import json
import sympy as sp

# ---- sympy checks
k, c = sp.symbols('k c')
sol = sp.solve([sp.Eq(92, k + c), sp.Eq(sp.Rational(787, 10), sp.Rational(81, 100) * k + c)], [k, c])
assert sol == {k: 70, c: 22}
T = lambda t: 70 * sp.Rational(9, 10) ** t + 22
assert T(2) == sp.Rational(787, 10)
TD = sp.log(sp.Rational(2, 5)) / sp.log(sp.Rational(9, 10))
assert round(float(TD), 2) == 8.70
assert round(float(T(8)), 1) == 52.1 and round(float(T(9)), 1) == 49.1
assert sp.Rational(133, 10) / sp.Rational(19, 100) == 70 and sp.Rational(28, 70) == sp.Rational(2, 5)
td = round(float(TD), 4)

HEAD = 'A cup of coffee is left on a table in a room. Readings: $92$ °C at $t=0$ and $78.7$ °C two minutes later.'
WIN = {"xmin": -2.6, "xmax": 31, "ymin": -10, "ymax": 105, "gridx": 5, "gridy": 10, "xtick": 5, "ytick": 20,
       "xname": "t", "yname": "T", "xtickFrom": 0, "ytickFrom": 0}
GIVEN = [{"kind": "point", "at": [0, 92], "label": "(0,\\,92)", "anchor": "ne"},
         {"kind": "point", "at": [2, 78.7], "label": "(2,\\,78.7)", "anchor": "ne"}]
CUP = {"kind": "coffee", "alt": "A cup of coffee on a table and a thermometer beside the graph"}
ROOM = lambda step=0: [{"kind": "segment", "from": [-2.6, 22], "to": [31, 22], "dashed": True, "step": step},
                       {"kind": "label", "at": [24, 22], "tex": "y=22", "anchor": "s", "step": step}]
MODEL = lambda step=0: [{"kind": "fn", "expr": "70*0.9**x + 22", "domain": [0, 31], "color": "blue", "step": step}]


def graph(items, states=None, kind="coffee"):
    win, head, sc, d = {"coffee": (WIN, HEAD, CUP, {"T": 92, "t": 0}), "typing": (TWIN, THEAD, LAP, {"S": 20, "h": 1}),
                        "ph": (PWIN, PHEAD, STRIP, {})}[kind]
    return {"window": win, "heading": head, "scene": dict(sc, states=states or [[0, d]]), "items": items}


# ---- typing speed and pH (checks)
hh = sp.Symbol('h', positive=True); Sf = lambda v: 20 + 10 * sp.log(v)
assert round(float(Sf(10)), 2) == 43.03 and round(float(sp.Rational(2303, 100) / sp.log(10)), 1) == 10.0
assert round(43.03 + 23.03, 2) == 66.06 and round(float(Sf(100)), 1) == 66.1
assert round(float(Sf(sp.Rational(1, 10))), 2) == -3.03 and round(float(Sf(5000))) == 105 and round(float(sp.exp(-2)), 3) == 0.135
assert round(float(-sp.log(sp.Rational(3, 10000), 10)), 2) == 3.52
assert round(float(10 ** sp.Rational(-66, 10) * 10 ** 7), 2) == 2.51 and round(float(10 ** sp.Rational(-44, 10) * 10 ** 5), 2) == 3.98
assert round(float(sp.Rational(1, 100) / 10 ** sp.Rational(-44, 10))) == 251 and round(float(10 ** sp.Rational(24, 10))) == 251
s01 = round(float(Sf(sp.Rational(1, 10))), 4)

THEAD = 'A student practises typing. After $1$ hour she types $20$ words per minute. After $10$ hours, $43.03$.'
TWIN = {"xmin": -10, "xmax": 112, "ymin": -14, "ymax": 76, "gridx": 10, "gridy": 10, "xtick": 20, "ytick": 20,
        "xname": "h", "yname": "S", "xtickFrom": 0, "ytickFrom": 0}
LAP = {"kind": "typing", "alt": "A laptop and a words-per-minute gauge beside the graph"}
TGIVEN = [{"kind": "point", "at": [1, 20], "label": "(1,\\,20)", "anchor": "se"},
          {"kind": "point", "at": [10, 43.03], "label": "(10,\\,43.03)", "anchor": "nw"}]
TMODEL = lambda step=0: [{"kind": "fn", "expr": "20 + 10*log(x)", "domain": [0.03, 112], "color": "blue", "step": step}]

PHEAD = 'The pH scale measures acidity. Lemon juice has pH $2.0$ and a tomato has pH $4.4$. Here, $\\mathrm{pH}=-\\log_{10}[\\mathrm{H}^+]$.'
PWIN = {"xmin": -1.4, "xmax": 12.5, "ymin": -1.2, "ymax": 8.9, "gridx": 1, "gridy": 1, "xtick": 2, "ytick": 1,
        "xname": "[H⁺]", "yname": "pH", "xtickFrom": 0, "ytickFrom": 0}
STRIP = {"kind": "ph", "alt": "A pH strip with lemon juice, tomato and pure water beside the graph"}
PUNIT = [{"kind": "label", "at": [10.6, 0.55], "tex": "\\text{mmol/L}", "anchor": "c"}]
PCURVE = lambda step=0: [{"kind": "fn", "expr": "3 - log(x)/log(10)", "domain": [0.0013, 12.5], "color": "blue", "step": step}]


def walk(cap=None, tex=None, note=None, ans=False):
    w = {}
    if cap: w["cap"] = cap
    if tex: w["tex"] = tex
    if note: w["note"] = note
    if ans: w["ans"] = True
    return {"walk": w}


Q1 = 'Predict: after a very long time, what temperature does the coffee approach?'
PICKS = ['$0$ °C', 'the temperature of the room', '$78.7$ °C']
Q3 = 'It can be drunk at $50$ °C or below. After how many whole minutes is that first true?'
Q2 = 'The model is $T=k(0.9)^t+c$, with $t$ in minutes. Use the two readings to find $k$ and $c$.'
T1 = 'Predict: how fast does she type after $100$ hours?'
TPICKS = ['$43$ wpm, no more gains', 'about $66$ wpm', 'about $270$ wpm']
T2 = 'Fit $S=a+b\\ln h$ through $(1,\\,20)$ and $(10,\\,43.03)$.'
T3 = 'What does the model give at $0.1$ hours and at $5000$ hours? Name one specific limitation.'
P1 = 'Predict: how many times stronger (more $[\\mathrm{H}^+]$) is the lemon juice than the tomato?'
PPICKS = ['about $2$ times', 'about $24$ times', 'about $250$ times']
P2 = 'Find the pH when $[\\mathrm{H}^+]=0.0003$. Find $[\\mathrm{H}^+]$ when the pH is $6.6$. Give the second answer in standard form.'
P3 = 'Find exactly how many times stronger the lemon juice is than the tomato.'
PFOODS = lambda s1, s2: [{"kind": "point", "at": [10, 2], "label": "\\text{lemon}", "anchor": "ne", "step": s1},
                         {"kind": "point", "at": [0.0398, 4.4], "label": "\\text{tomato}", "anchor": "ne", "step": s2}]
slides = [
    {"type": "title", "eyebrow": "IB Mathematics: Applications and Interpretations HL · Unit 5 · Lesson 3",
     "title": "Exponential and logarithmic models, log scales", "lede": "Online lesson: three scenes, then the family",
     "code": "MAI HL U5 L3", "regime": "C", "regimeText": "calculator allowed"},

    {"type": "example", "eyebrow": "Cooling coffee · Question 1 · Predict", "title": "Where does it settle? (1 of 2)",
     "stem": Q1, "choices": PICKS, "correct": 1, "pickStep": 0,
     "blocks": [walk("Heat flows from hot to cool", note="The coffee loses heat to the air in the room, quickly at first.")],
     "graph": graph(GIVEN)},

    {"type": "example", "eyebrow": "Cooling coffee · Question 1 · Predict", "title": "Where does it settle? (2 of 2)",
     "stem": Q1, "choices": PICKS, "correct": 1, "pickStep": 1,
     "blocks": [walk("It levels off", ["&\\text{It approaches the}", "&\\text{temperature of the room}"],
                     "Once it is as warm as the room there is nothing left to lose, so the temperature stops falling. It does not go to $0$ °C.", ans=True)],
     "graph": graph(GIVEN)},

    {"type": "example", "eyebrow": "Cooling coffee · Question 2", "title": "Fit the model (1 of 3)", "stem": Q2,
     "blocks": [walk("The model", ["T&=k(0.9)^t+c"]),
                walk("Substitute $(0,\\,92)$", ["92&=k(0.9)^0+c", "92&=k+c"]),
                walk("Substitute $(2,\\,78.7)$", ["78.7&=k(0.9)^2+c", "78.7&=0.81k+c"])],
     "graph": graph(GIVEN)},

    {"type": "example", "eyebrow": "Cooling coffee · Question 2", "title": "Fit the model (2 of 3)", "stem": Q2,
     "blocks": [walk("Subtract the second equation from the first", ["92-78.7&=k-0.81k", "13.3&=0.19k", "k&=70"]),
                walk("Find $c$", ["c&=92-70", "&=22"], "$c$ is the horizontal asymptote: the temperature of the room, $22$ °C.")],
     "graph": graph(ROOM(2) + GIVEN)},

    {"type": "example", "eyebrow": "Cooling coffee · Question 2", "title": "Fit the model (3 of 3)", "stem": Q2,
     "blocks": [walk("Model", ["T&=70(0.9)^t+22"], "Two readings fix the two unknowns $k$ and $c$.", ans=True)],
     "graph": graph(ROOM() + MODEL(1) + GIVEN)},

    {"type": "lab", "preset": "coffeeScene", "eyebrow": "Cooling coffee · Trace the model", "title": "Watch it cool",
     "init": {"window": WIN, "t": 0, "seconds": 12}},

    {"type": "example", "eyebrow": "Cooling coffee · Question 3", "title": "When can it be drunk? (1 of 2)",
     "stem": Q3,
     "blocks": [walk("Set $T=50$", ["70(0.9)^t+22&=50"]),
                walk("Isolate the power", ["70(0.9)^t&=28", "(0.9)^t&=0.4"])],
     "graph": graph(ROOM() + MODEL() + GIVEN + [
         {"kind": "segment", "from": [-2.6, 50], "to": [31, 50], "dotted": True, "step": 1}])},

    {"type": "example", "eyebrow": "Cooling coffee · Question 3", "title": "When can it be drunk? (2 of 2)",
     "stem": Q3,
     "blocks": [walk("Take logs of both sides", ["t\\ln 0.9&=\\ln 0.4", "t&=\\frac{\\ln 0.4}{\\ln 0.9}=8.70"]),
                walk("Round up to whole minutes", ["t&=9"], "After $8$ minutes it is still $52.1$ °C. After $9$ it is $49.1$ °C. Round up, not to the nearest whole number.", ans=True)],
     "graph": graph(ROOM() + MODEL() + GIVEN + [
         {"kind": "segment", "from": [-2.6, 50], "to": [td, 50], "dotted": True},
         {"kind": "segment", "from": [td, -10], "to": [td, 50], "dotted": True, "step": 1},
         {"kind": "point", "at": [td, 50], "answer": True, "label": "(8.70,\\,50)", "anchor": "ne", "step": 1}],
         states=[[0, {"T": 92, "t": 0}], [1, {"T": 50, "t": td}]])},

    # ---------------- typing speed
    {"type": "example", "eyebrow": "Typing speed · Question 1 · Predict", "title": "Speed after 100 hours (1 of 2)",
     "stem": T1, "choices": TPICKS, "correct": 1, "pickStep": 0,
     "blocks": [walk("From $1$ hour to $10$ hours", ["43.03-20&=23.03"], "Ten times the practice added $23.03$ words per minute.")],
     "graph": graph(TGIVEN, kind="typing")},
    {"type": "example", "eyebrow": "Typing speed · Question 1 · Predict", "title": "Speed after 100 hours (2 of 2)",
     "stem": T1, "choices": TPICKS, "correct": 1, "pickStep": 1,
     "blocks": [walk("From $10$ hours to $100$ hours", ["43.03+23.03&=66.06", "&\\approx 66\\text{ wpm}"],
                     "Another tenfold increase adds about the same again. Steady gains would give about $270$, so the gains are slowing.", ans=True)],
     "graph": graph(TGIVEN + [{"kind": "point", "at": [100, 66.06], "answer": True, "label": "(100,\\,66.1)", "anchor": "nw", "step": 1}], kind="typing")},

    {"type": "example", "eyebrow": "Typing speed · Question 2", "title": "Fit the model (1 of 2)", "stem": T2,
     "blocks": [walk("Substitute $(1,\\,20)$", ["20&=a+b\\ln 1", "20&=a"], "$\\ln 1=0$, so $a$ is the speed at $h=1$."),
                walk("Substitute $(10,\\,43.03)$", ["43.03&=20+b\\ln 10", "23.03&=b\\ln 10"])],
     "graph": graph(TGIVEN, kind="typing")},
    {"type": "example", "eyebrow": "Typing speed · Question 2", "title": "Fit the model (2 of 2)", "stem": T2,
     "blocks": [walk("Solve for $b$", ["b&=\\frac{23.03}{\\ln 10}", "&=10.0"]),
                walk("Model", ["S&=20+10\\ln h"], "Two readings fix two unknowns, as with the coffee.", ans=True)],
     "graph": graph(TMODEL(2) + TGIVEN, kind="typing")},

    {"type": "lab", "preset": "sceneLab", "eyebrow": "Typing speed · Trace the model", "title": "Watch the gains slow",
     "init": {"kind": "typing", "window": TWIN, "start": 1, "seconds": 12}},

    {"type": "example", "eyebrow": "Typing speed · Question 3", "title": "Where the model breaks (1 of 2)", "stem": T3,
     "blocks": [walk("At $0.1$ hours", ["S(0.1)&=20+10\\ln 0.1", "&=-3.03"], "A negative typing speed is impossible."),
                walk("At $5000$ hours", ["S(5000)&=20+10\\ln 5000", "&=105"], "Still rising after 5000 hours, with no ceiling.")],
     "graph": graph(TMODEL() + TGIVEN + [{"kind": "point", "at": [0.1, s01], "color": "red", "label": "(0.1,\\,-3.03)", "anchor": "e", "step": 1}],
                    states=[[0, {"S": 20, "h": 1}], [1, {"S": s01, "h": 0.1}], [2, {"S": 105.17, "h": 5000}]], kind="typing")},
    {"type": "example", "eyebrow": "Typing speed · Question 3", "title": "Where the model breaks (2 of 2)", "stem": T3,
     "blocks": [walk("Limitation", ["&\\text{Negative for }h<0.135", "&\\text{No ceiling at large }h"],
                     "The model gives a negative speed for $h<0.135$, so it fails for very little practice. It also never levels off, so it cannot hold for very long practice. Say which, and say why.", ans=True)],
     "graph": graph(TMODEL() + TGIVEN + [{"kind": "point", "at": [0.1, s01], "color": "red", "label": "(0.1,\\,-3.03)", "anchor": "e"}],
                    states=[[0, {"S": s01, "h": 0.1}]], kind="typing")},

    # ---------------- pH
    {"type": "example", "eyebrow": "pH scale · Question 1 · Predict", "title": "How much stronger? (1 of 2)",
     "stem": P1, "choices": PPICKS, "correct": 2, "pickStep": 0,
     "blocks": [walk("Each pH step is a factor of $10$", note="Lowering the pH by $1$ multiplies $[\\mathrm{H}^+]$ by $10$.")],
     "graph": graph(PUNIT, kind="ph")},
    {"type": "example", "eyebrow": "pH scale · Question 1 · Predict", "title": "How much stronger? (2 of 2)",
     "stem": P1, "choices": PPICKS, "correct": 2, "pickStep": 1,
     "blocks": [walk("The lemon is $2.4$ steps below the tomato", ["10^2&=100", "10^3&=1000", "&\\Rightarrow\\text{about }250\\text{ times stronger}"],
                     "$2.4$ steps lies between $2$ and $3$, so the answer is between $100$ and $1000$: about $250$. Question 3 finds it exactly.", ans=True)],
     "graph": graph(PUNIT, kind="ph")},

    {"type": "example", "eyebrow": "pH scale · Question 2", "title": "Both directions (1 of 2)", "stem": P2,
     "blocks": [walk("Evaluate the pH", ["\\mathrm{pH}&=-\\log_{10}(0.0003)", "&=3.52"]),
                walk("Invert: set $\\mathrm{pH}=6.6$", ["6.6&=-\\log_{10}[\\mathrm{H}^+]", "\\log_{10}[\\mathrm{H}^+]&=-6.6"])],
     "graph": graph(PUNIT + PCURVE(1) + [{"kind": "point", "at": [0.3, 3.5229], "answer": True, "label": "\\mathrm{pH}=3.52", "anchor": "ne", "step": 1}],
                    states=[[0, {}], [1, {"marker": 3.5229}], [2, {"marker": 6.6}]], kind="ph")},
    {"type": "example", "eyebrow": "pH scale · Question 2", "title": "Both directions (2 of 2)", "stem": P2,
     "blocks": [walk("Undo the log with a power of $10$", ["[\\mathrm{H}^+]&=10^{-6.6}", "&=2.51\\times 10^{-7}"],
                     "Undoing $\\log_{10}$ means raising $10$ to the power.", ans=True)],
     "graph": graph(PUNIT + PCURVE() + [{"kind": "point", "at": [0.3, 3.5229], "label": "\\mathrm{pH}=3.52", "anchor": "ne"}],
                    states=[[0, {"marker": 6.6}]], kind="ph")},

    {"type": "lab", "preset": "sceneLab", "eyebrow": "pH scale · Explore", "title": "Move along the scale",
     "init": {"kind": "ph", "window": PWIN, "start": 2}},

    {"type": "example", "eyebrow": "pH scale · Question 3", "title": "Exactly how much stronger? (1 of 2)", "stem": P3,
     "blocks": [walk("Lemon", ["[\\mathrm{H}^+]&=10^{-2.0}", "&=0.01"]),
                walk("Tomato", ["[\\mathrm{H}^+]&=10^{-4.4}", "&=3.98\\times 10^{-5}"]),
                walk("Divide the concentrations", ["\\frac{0.01}{3.98\\times 10^{-5}}&=251"])],
     "graph": graph(PUNIT + PCURVE() + PFOODS(1, 2), states=[[0, {}], [1, {"marker": 2.0}], [2, {"marker": 4.4}]], kind="ph")},
    {"type": "example", "eyebrow": "pH scale · Question 3", "title": "Exactly how much stronger? (2 of 2)", "stem": P3,
     "blocks": [walk("The shortcut: subtract the pH values, then raise $10$ to the difference", ["4.4-2.0&=2.4", "10^{2.4}&=251"],
                     "Compare by subtracting, never by dividing: $4.4\\div 2.0=2.2$ is wrong. The lemon is about $251$ times stronger.", ans=True)],
     "graph": graph(PUNIT + PCURVE() + PFOODS(0, 0), states=[[0, {}]], kind="ph")},

    {"type": "lab", "preset": "growthFamily", "eyebrow": "Family recap", "title": "The growth family",
     "init": {"start": {"fam": "exp", "k": 2, "a": 1.5, "r": 0.3, "c": 1, "la": 1, "lb": 2, "inv": False},
              "window": {"xmin": -7, "xmax": 9, "ymin": -6, "ymax": 9, "grid": 1, "xtick": 2, "ytick": 2}}},
]

content = {"meta": {"cohort": "MAI", "cohortLabel": "MAI HL", "lesson": 3, "topic": "ExpLogModelsScene",
                    "topicWords": "Exponential and logarithmic models",
                    "file": "MAI_HL_U5_L3_Lesson_ExpLogModels.html", "artifactTitle": "MAI HL U5 L3 Exp and Log Models",
                    "source": "openers u05-l03-exponential-and-logarithmic-models.js (github broth11/openers)",
                    "largeGraphs": True},
           "slides": slides}
import re
def deg(o):
    if isinstance(o, str): return re.sub(r'\$([^$]+)\$ °C', lambda m: '$' + m.group(1) + '\\,{}^{\\circ}\\mathrm{C}$', o)
    if isinstance(o, list): return [deg(x) for x in o]
    if isinstance(o, dict): return {k: deg(v) for k, v in o.items()}
    return o
import re as _re
_seen = []
for sl in content["slides"]:
    if sl["type"] != "example": continue
    sc = sl["eyebrow"].split(" · ")[0]
    if sc not in _seen: _seen.append(sc); sl["sceneStart"] = True
    sl["scene"] = _seen.index(sc) + 1
    sl["q"] = int(_re.search(r"Question (\d+)", sl["eyebrow"]).group(1))
    m = _re.search(r"\((\d+) of \d+\)", sl["title"])
    if m and int(m.group(1)) > 1: sl["cont"] = True
content = deg(content)
assert '°C' not in json.dumps(content, ensure_ascii=False), 'a bare °C is left'
json.dump(content, open('content.json', 'w'), ensure_ascii=False, indent=1)
print('content.json written:', len(slides), 'slides')
