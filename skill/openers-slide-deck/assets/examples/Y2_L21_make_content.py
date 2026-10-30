"""Y2 L21 — content.json generator: Sinusoidal Modelling (greengrey, kit v16), revision round 1, 23/10/2026.

Teacher's decision (r1): the worksheet's worked examples only. Source: AASL_Y2_L21_Worksheet_SinusoidalModelling.tex
(validated 23/10/2026) — Worked Example 1 (greenhouse), Worked Example 2 (water wheel, with its calculator screen and
"What you write"), the groups and the open question Q14. The lab is rebased on Worked Example 1. Every number is
checked in Y2_L21_verify.py. meta.largeGraphs (kit v16): example graphs on the right (>= 40 % of the slide width),
in-graph text at 90 % of the body size; parts split over two slides (stem repeated) so the text keeps its size.
Keys: Rad and INTSECT point to the calculator deck D2; Y-CAL is written inline (D2 lacks it)."""

import json
import math
import sys

PI = math.pi
D2 = "https://claude.ai/artifact/XoFfh976XTgi4hAotKXmsZ"
LEV = "#FF862F"  # the level line, in the text and on the figure (orange role)


def link(txt, title):
    return (
        f'<a href="{D2}" target="_blank" rel="noopener" title="{title}" '
        f'style="color:inherit;text-decoration:underline">{txt}&nbsp;↗</a>'
    )


def lv(s):
    return "\\textcolor{" + LEV + "}{" + s + "}"


R5 = lambda v: round(v, 5)


def seg(P, Q, **k):
    d = {"kind": "segment", "from": [R5(v) for v in P], "to": [R5(v) for v in Q]}
    d.update(k)
    return d


def lab(at, t, a="c", **k):
    d = {"kind": "label", "at": [R5(v) for v in at], "tex": t, "anchor": a}
    d.update(k)
    return d


def pt(at, name=None, a="ne", **k):
    d = {"kind": "point", "at": [R5(v) for v in at]}
    if name:
        d.update(label=name, anchor=a)
    d.update(k)
    return d


def fn(expr, dom=None, **k):
    d = {"kind": "fn", "expr": expr}
    if dom:
        d["domain"] = [R5(v) for v in dom]
    d.update(k)
    return d


def hline(y, x0, x1, **k):
    return seg([x0, y], [x1, y], dotted=True, **k)


def arrow(P, Q, **k):
    return seg(P, Q, dotted=True, arrows=True, **k)


def poly(pts, **k):
    d = {"kind": "polygon", "pts": [[R5(x), R5(y)] for x, y in pts]}
    d.update(k)
    return d


def path(pts, **k):
    d = {"kind": "path", "pts": [[R5(x), R5(y)] for x, y in pts]}
    d.update(k)
    return d


def ticks(vals):
    return [[v, str(v)] for v in vals]


def wheel(cx, cy, R, W):
    """a true circle in a graph of aspect W['aspect']: x-radius scaled by the window's units per pixel"""
    xr = R * (W["xmax"] - W["xmin"]) / (W["ymax"] - W["ymin"]) / W.get("aspect", 1)
    return xr, path(
        [
            [cx + xr * math.cos(2 * PI * i / 120), cy + R * math.sin(2 * PI * i / 120)]
            for i in range(121)
        ]
    )


def shade(f, t1, t2, base, n=60, **k):
    return poly(
        [[t1, base]]
        + [[t1 + (t2 - t1) * i / n, f(t1 + (t2 - t1) * i / n)] for i in range(n + 1)]
        + [[t2, base]],
        **k,
    )


T = lambda s: {"text": s}
ans = lambda s: '<span class="ans" style="white-space:nowrap">' + s + "</span>"
hs = lambda s: '<span class="hlstep">$' + s + "$</span>"
nw = lambda s: '<span style="white-space:nowrap">' + s + "</span>"


def steps(*rows):
    return {"steps": [{"tex": r} for r in rows]}


def part(items, lo, hi):
    """the items of reveal steps lo+1..hi, renumbered from 1; items of steps <= lo stay, static (a part shown on its own slide)"""
    out = []
    for it in items:
        s = it.get("step", 0)
        if s > hi:
            continue
        it = dict(it)
        if s <= lo:
            it.pop("step", None)
            it.pop("hl", None)
            it.pop("until", None)
        else:
            it["step"] = s - lo
            if "hl" in it:
                it["hl"] = it["hl"] - lo
        out.append(it)
    return out


INTSECT = "[F5] G-SOLV → [F5] INTSECT"
YCAL = "[F5] → [F6] ▷ → [F1] Y-CAL"
KEYS_RAD = link("keys", "calculator deck, slide 2: radian mode")
KEYS_INT = link("keys", "calculator deck, slides 7–8: the line and INTSECT")
ASP = 2.2

# ================= Lab — the story to the model, and the time above a level (numbers of Worked Example 1)
labS = {
    "type": "lab",
    "preset": "sinusoidStory",
    "title": "From the story to the model, and the time above a level",
    "controlScale": 1.0,
    "init": {
        "window": {
            "xmin": -1,
            "xmax": 53,
            "ymin": -9,
            "ymax": 50,
            "gridx": 2,
            "gridy": 2,
            "xtick": 6,
            "aspect": 4.7,   # round 5: a little flatter, so the fixed-height equation box costs no type size
            "ytick": 10,
            "xname": "t",
            "yname": "T",
        },
        "max": 31,
        "min": 15,
        "P": 24,
        "tmax": 14,
        "k": 28,
        "unit": "h",
        "maxRange": [20, 40, 1],
        "minRange": [0, 19, 1],
        "pRange": [12, 26, 1],
        "tRange": [0, 24, 0.5],
        "kRange": [0, 40, 1],
        "levelColor": LEV,
    },
}

# ================= Worksheet, Worked Example 1 — the greenhouse
HT = lambda t: 8 * math.sin(PI / 12 * (t - 8)) + 23
stemG = (
    "The temperature inside a greenhouse, $T\\ ^{\\circ}$C, $t$ hours after midnight, is modelled by "
    "$T(t) = a\\sin\\bigl(b(t - c)\\bigr) + d$, for $0 \\le t \\le 24$. The warmest moment of the day is 14:00, at "
    "$31^{\\circ}$C; the coldest is 02:00, at $15^{\\circ}$C; the pattern repeats every $24$ hours."
)
pG = "(a) Find $a$, $b$, $c$ and $d$, given that $a > 0$ and $0 < c < 24$."
WG = {
    "xmin": -2,
    "xmax": 47,
    "ymin": -7,
    "ymax": 40,
    "gridx": 2,
    "gridy": 2,
    "xname": "t",
    "yname": "T",
    "aspect": ASP,
    "xticks": ticks([2, 14, 24]),
    "yticks": ticks([15, 31]),
}
WG2 = {
    "xmin": -1.5,
    "xmax": 27,
    "ymin": -7,
    "ymax": 37,
    "gridx": 2,
    "gridy": 2,
    "xname": "t",
    "yname": "T",
    "aspect": ASP,
    "xticks": ticks([2, 8, 14, 24]),
    "yticks": ticks([15, 23, 31]),
}
curveG = [fn("8*sin(pi/12*(x - 8)) + 23", [0, 24]), pt([14, 31]), pt([2, 15])]
blocksGa = [
    T(
        "Draw the story first: the coldest point at $t = 2$, the warmest at $t = 14$, the principal axis half-way "
        "between them."
    ),
    T(nw(hs("d") + "$\\, = \\frac{31 + 15}{2} = 23$")),
    T(nw(hs("a") + "$\\, = \\frac{31 - 15}{2} = 8$")),
    T(nw(hs("b") + "$\\, = \\frac{2\\pi}{24} = \\frac{\\pi}{12}$")),
    T(nw(hs("c") + "$\\, = 14 - \\frac{24}{4} = 8$")),
    T(
        "So "
        + ans("$T(t) = 8\\sin\\left(\\frac{\\pi}{12}(t - 8)\\right) + 23$")
        + ". Check with the coldest moment: $T(2) = 8\\sin\\left(-\\frac{\\pi}{2}\\right) + 23 = 15$."
    ),
]
itemsGa = [
    pt([2, 15], step=1),
    pt([14, 31], step=1),
    hline(23, 0, 34, step=1),
    lab([33, 23], "d = 23", "s", step=2, hl=2),
    arrow([38, 23], [38, 31], step=3, hl=3),
    lab([38, 27], "a = 8", "e", step=3, hl=3),
    pt([38, 31], step=4),
    arrow([14, 31], [38, 31], step=4, hl=4),
    lab([26, 31], "38 - 14 = 24", "n", step=4, hl=4),
    pt([8, 23], answer=True, step=5, hl=5),
    arrow([8, 18.5], [14, 18.5], step=5, hl=5),
    lab([11, 18.5], "6", "s", step=5, hl=5),
    lab([8, 23], "c = 8", "nw", step=5, hl=5),
    fn("8*sin(pi/12*(x - 8)) + 23", [0, 24], step=6),
    fn("8*sin(pi/12*(x - 8)) + 23", [24, 38], color="grey", step=6),
    pt([2, 15], answer=True, step=6),
]
weG1 = {
    "type": "example",
    "n": 1,
    "tag": "C",
    "title": "A greenhouse: the model",
    "stem": stemG,
    "prompt": pG,
    "blocks": blocksGa[:4],
    "graph": {"window": WG, "items": part(itemsGa, 0, 4)},
}
weG1b = {
    "type": "example",
    "n": 1,
    "tag": "C",
    "title": "…the model: $c$, and a check",
    "stem": stemG,
    "prompt": pG,
    "blocks": blocksGa[4:],
    "graph": {"window": WG, "items": part(itemsGa, 4, 6)},
}
weG2 = {
    "type": "example",
    "n": 1,
    "tag": "C",
    "title": "…the temperature at 05:00",
    "stem": stemG,
    "prompt": "(b) Find the temperature at 05:00.",
    "blocks": [
        T("05:00 is $t = 5$, on the rising side, below the principal axis."),
        steps(
            "T(5) &= 8\\sin\\left(\\tfrac{\\pi}{12}(5 - 8)\\right) + 23",
            "&= \\bl{17.3\\ ^{\\circ}\\text{C}} \\quad (3 \\text{ s.f.})",
        ),
        T(
            "GDC (Rad, "
            + KEYS_RAD
            + "): "
            + YCAL
            + ", X = 5 → 17.34314575; write $T(5) = 17.3^{\\circ}$C."
        ),
    ],
    "graph": {
        "window": WG2,
        "items": curveG
        + [
            hline(23, 0, 25),
            seg([5, 0], [5, 29], dotted=True, step=1),
            lab([5, 29], "t = 5", "n", step=1),
            pt([5, HT(5)], "17.3", "se", answer=True, step=3),
        ],
    },
}
t28 = 10.5788125
pG3 = (
    "(c) Find the first time after midnight at which the temperature reaches $28^{\\circ}$C. "
    "Give the time to the nearest minute."
)
blocksG3 = [
    T(
        "The line $"
        + lv("T = 28")
        + "$ (orange) is first met on the way up, between $t = 8$ and $t = 14$."
    ),
    steps("8\\sin\\left(\\tfrac{\\pi}{12}(t - 8)\\right) + 23 &= " + lv("28")),
    steps("\\therefore\\quad t &= 10.578\\ldots"),
    steps("0.578\\ldots \\times 60 &= 34.7\\ldots \\text{ min}"),
    T("The temperature first reaches $28^{\\circ}$C at " + ans("10:35") + "."),
    T(
        "GDC (Rad): Y2 = 28, "
        + INTSECT
        + ", first crossing → 10.5788125 ("
        + KEYS_INT
        + ")."
    ),
]
itemsG3 = curveG + [
    hline(23, 0, 25),
    seg([0, 28], [26, 28], color="orange", step=1),
    lab([20.5, 28], lv("T = 28"), "n", step=1),
    pt([t28, 28], step=3),
    seg([t28, 0], [t28, 28], dotted=True, step=3),
    lab([t28, 0], "10.58", "s", step=3),
    pt([t28, 28], answer=True, step=5),
    lab([t28, 28], "10{:}35", "nw", step=5),
]
weG3 = {
    "type": "example",
    "n": 1,
    "tag": "C",
    "title": "…the first time it reaches $28^{\\circ}$C",
    "stem": stemG,
    "prompt": pG3,
    "blocks": blocksG3[:3],
    "graph": {"window": WG2, "items": part(itemsG3, 0, 3)},
}
weG3b = {
    "type": "example",
    "n": 1,
    "tag": "C",
    "title": "…$28^{\\circ}$C, to the nearest minute",
    "stem": stemG,
    "prompt": pG3,
    "blocks": blocksG3[3:],
    "graph": {"window": WG2, "items": part(itemsG3, 3, 6)},
}

# ================= Worksheet, Worked Example 2 — the water wheel
HW = lambda t: 3 * math.sin(PI / 20 * (t - 30)) + 2
WW = {
    "xmin": -56,
    "xmax": 85,
    "ymin": -6,
    "ymax": 9,
    "gridx": 5,
    "gridy": 1,
    "xname": "t",
    "yname": "H",
    "aspect": ASP,
    "xticks": ticks([40, 80]),
    "yticks": [[-1, "-1"], [2, "2"], [5, "5"]],
}
cxw = -30
xrw, circw = wheel(cxw, 2, 3, WW)
stemW = (
    "A water wheel has a diameter of $6$ m and its hub is $2$ m above the surface of the river. A point $P$ on the "
    "rim is at the top of the wheel at $t = 0$, and the wheel makes one turn every $40$ seconds. The height of $P$ "
    "above the water, $H$ metres, $t$ seconds later, is $H(t) = 3\\sin\\left(\\frac{\\pi}{20}(t - 30)\\right) + 2$."
)
pW = "(a) Explain where each of the numbers $3$, $\\frac{\\pi}{20}$, $30$ and $2$ comes from."
blocksWa = [
    T("The radius is $3$ m: that is " + hs("a") + "."),
    T("The hub is $2$ m up: that is " + hs("d") + ", the principal axis."),
    T(
        "One turn in $40$ s gives "
        + nw(hs("b") + "$\\, = \\frac{2\\pi}{40} = \\frac{\\pi}{20}$")
        + "."
    ),
    T(
        "$P$ is at the top at $t = 0$, level with the hub going down at $t = 10$, at the bottom at $t = 20$, and level "
        "with the hub <em>going up</em> at "
        + hs("t = 30")
        + " — the number subtracted from $t$."
    ),
    T(
        "Check: $H(0) = 3\\sin\\left(-\\frac{3\\pi}{2}\\right) + 2 = 3 + 2 = 5$, the top of the wheel."
    ),
]
itemsWa = [
    poly([[-55, 0], [-3, 0], [-3, -1.7], [-55, -1.7]]),
    lab([-10, -0.85], "\\text{river}", "c"),
    circw,
    pt([cxw, 2]),
    pt([cxw, 5], color="orange"),
    lab([cxw, 5], "P", "n", color="orange"),
    {"kind": "arc", "at": [cxw, 2], "from": 75, "to": 30, "r": xrw * 1.25},
    fn("3*sin(pi/20*(x - 30)) + 2", [0, 80]),
    pt([0, 5]),
    pt([40, 5]),
    pt([80, 5]),
    seg([cxw, 2], [cxw, 5], step=1, hl=1),
    lab([cxw, 3.5], "3", "w", step=1, hl=1),
    arrow([80, 2], [80, 5], step=1, hl=1),
    lab([80, 5], "a = 3", "n<", step=1, hl=1),
    hline(2, cxw, 82, step=2, hl=2),
    arrow([cxw - xrw * 1.3, 0], [cxw - xrw * 1.3, 2], step=2, hl=2),
    lab([cxw - xrw * 1.3, 1], "2", "w", step=2, hl=2),
    lab([50, 2], "d", "n", step=2, hl=2),
    arrow([0, 5], [40, 5], step=3, hl=3),
    lab([20, 5], "40 - 0 = 40", "n", step=3, hl=3),
    pt([10, 2], step=4),
    pt([20, -1], step=4),
    pt([cxw - xrw, 2], step=4, hl=4),
    lab([cxw - xrw, 2], "t = 30", "w", step=4, hl=4),
    pt([30, 2], "30", "se", answer=True, step=4, hl=4),
    pt([0, 5], answer=True, step=5),
]
weW1 = {
    "type": "example",
    "n": 2,
    "tag": "C",
    "title": "A water wheel: where each number comes from",
    "stem": stemW,
    "prompt": pW,
    "blocks": blocksWa[:3],
    "graph": {"window": WW, "items": part(itemsWa, 0, 3)},
}
weW1b = {
    "type": "example",
    "n": 2,
    "tag": "C",
    "title": "…where $30$ comes from, and a check",
    "stem": stemW,
    "prompt": pW,
    "blocks": blocksWa[3:],
    "graph": {"window": WW, "items": part(itemsWa, 3, 5)},
}
rw = [14.64559054, 25.35440946, 54.64559054, 65.35440946, 94.64559054, 105.3544095]
WW2 = {
    "xmin": -4,
    "xmax": 85,
    "ymin": -6,
    "ymax": 7,
    "gridx": 5,
    "gridy": 1,
    "xname": "t",
    "yname": "H",
    "aspect": ASP,
    "xticks": ticks([80]),
    "yticks": [[2, "2"], [5, "5"]],
}
pW2 = "(b) Find for how long, during each turn, $P$ is under water."
blocksWb = [
    T(
        "Under water means $H < 0$: the river is the $t$-axis, and the shaded stretches are below it."
    ),
    steps("3\\sin\\left(\\tfrac{\\pi}{20}(t - 30)\\right) + 2 &= 0"),
    steps("\\therefore\\quad t &= 14.645\\ldots \\ \\text{ or } \\ 25.354\\ldots"),
    steps(
        "\\text{time under water} &= 25.354\\ldots - 14.645\\ldots",
        "&= \\bl{10.7 \\text{ s}} \\quad (3 \\text{ s.f.})",
    ),
    T(
        "Rounding the crossings first gives $25.4 - 14.6 = 10.8$: wrong. Keep the full values."
    ),
]
itemsWb = [
    shade(HW, rw[0], rw[1], 0, step=1, opacity=0.42),
    shade(HW, rw[2], rw[3], 0, step=1, opacity=0.42),
    fn("3*sin(pi/20*(x - 30)) + 2", [0, 80]),
    hline(2, 0, 80),
    pt([rw[0], 0], step=3),
    pt([rw[1], 0], step=3),
    lab([rw[0] - 1, 0.15], "14.65", "nw", step=3),
    lab([rw[1] + 1, 0.15], "25.35", "ne", step=3),
    arrow([rw[0], -3.6], [rw[1], -3.6], step=5),
    lab([20, -3.6], "10.7", "s", step=5),
    arrow([rw[2], -3.6], [rw[3], -3.6], step=5),
    lab([60, -3.6], "10.7", "s", step=5),
]
weW2 = {
    "type": "example",
    "n": 2,
    "tag": "C",
    "title": "…under water, during each turn",
    "stem": stemW,
    "prompt": pW2,
    "blocks": blocksWb[:3],
    "graph": {"window": WW2, "items": part(itemsWb, 0, 3)},
}
weW2b = {
    "type": "example",
    "n": 2,
    "tag": "C",
    "title": "…under water: the full values, then round",
    "stem": stemW,
    "prompt": pW2,
    "blocks": blocksWb[3:],
    "graph": {"window": WW2, "items": part(itemsWb, 3, 6)},
}
# the calculator screen of Worked Example 2 (worksheet: screen + "What you write")
WS = {"xmin": 0, "xmax": 16, "ymin": 0, "ymax": 10, "plain": True, "aspect": 2.0}
sx0, sx1, sy0, sy1 = 0.4, 15.6, 0.5, 9.6
gx = lambda t: 1.3 + t / 80 * 13.6  # t 0..80 -> screen x
gy = lambda h: 2.6 + (h + 1) / 6.5 * 4.4  # H -1..5.5 -> screen y
scr = [
    seg([sx0, sy0], [sx1, sy0], color="grey"),
    seg([sx1, sy0], [sx1, sy1], color="grey"),
    seg([sx1, sy1], [sx0, sy1], color="grey"),
    seg([sx0, sy1], [sx0, sy0], color="grey"),
    seg([sx0, 8.0], [sx1, 8.0], color="grey"),
    lab([0.8, 8.8], "\\texttt{Rad}", "e", color="grey"),
    seg([gx(0), gy(0)], [gx(80), gy(0)], color="orange"),
    seg([gx(0), gy(-1)], [gx(0), gy(5)], color="grey"),
    path([[gx(t / 2), gy(HW(t / 2))] for t in range(161)]),
]
calc = {
    "type": "example",
    "n": 2,
    "tag": "C",
    "title": "…(b) on the calculator: what you write",
    "stem": pW2,
    "blocks": [
        T("$3\\sin\\left(\\frac{\\pi}{20}(t - 30)\\right) + 2 = 0$"),
        T("a sketch: curve, the water level, the two crossings labelled"),
        T("$t = 14.645\\ldots$, $\\ t = 25.354\\ldots$"),
        T("$25.354\\ldots - 14.645\\ldots = 10.7$ s"),
        T(
            "GDC (Rad): Y2 = 0, "
            + INTSECT
            + " → 14.64559054, [→] → 25.35440946 ("
            + KEYS_INT
            + ")."
        ),
    ],
    "graph": {
        "window": WS,
        "items": scr
        + [
            pt([gx(rw[0]), gy(0)], step=2),
            pt([gx(rw[1]), gy(0)], step=2),
            seg([gx(rw[0]) - 0.35, gy(0)], [gx(rw[0]) + 0.35, gy(0)], step=3),
            seg([gx(rw[0]), gy(0) - 0.45], [gx(rw[0]), gy(0) + 0.45], step=3),
            lab([3.4, 8.8], "\\texttt{INTSECT}", "e", step=3),
            lab([0.8, 1.35], "\\texttt{X=14.64559054}", "e", step=3),
            lab([15.2, 1.35], "\\texttt{Y=0}", "w", step=3),
        ],
    },
}
WW3 = {
    "xmin": -6,
    "xmax": 128,
    "ymin": -6,
    "ymax": 8,
    "gridx": 5,
    "gridy": 1,
    "xname": "t",
    "yname": "H",
    "aspect": ASP,
    "xticks": ticks([40, 80]),
    "yticks": [[2, "2"], [5, "5"]],
}
weW3 = {
    "type": "example",
    "n": 2,
    "tag": "C",
    "title": "…under water in the first two minutes",
    "stem": stemW,
    "prompt": "(c) Find the total time $P$ spends under water during the first $2$ minutes.",
    "blocks": [
        T(
            "$2$ minutes is $120$ s, which is exactly $3$ turns, and each of the three windows lies inside "
            "$0 \\le t \\le 120$:"
        ),
        steps(
            "\\text{total} &= 3 \\times 10.708\\ldots",
            "&= \\bl{32.1 \\text{ s}} \\quad (3 \\text{ s.f.})",
        ),
    ],
    "graph": {
        "window": WW3,
        "items": [
            shade(HW, rw[0], rw[1], 0, opacity=0.42),
            shade(HW, rw[2], rw[3], 0, step=1, opacity=0.42),
            shade(HW, rw[4], rw[5], 0, step=1, opacity=0.42),
            fn("3*sin(pi/20*(x - 30)) + 2", [0, 120]),
            hline(2, 0, 120),
            seg([120, -5], [120, 5.8], dotted=True, step=1),
            lab([120, 5.8], "t = 120", "n<", step=1),
            arrow([rw[0], -2.6], [rw[1], -2.6]),
            lab([20, -2.6], "10.7", "s"),
            arrow([rw[2], -2.6], [rw[3], -2.6], step=1),
            lab([60, -2.6], "10.7", "s", step=1),
            arrow([rw[4], -2.6], [rw[5], -2.6], step=1),
            lab([100, -2.6], "10.7", "s", step=1),
        ],
    },
}

content = {
    "meta": {
        "cohort": "Y2",
        "cohortLabel": "Year 2",
        "lesson": 21,
        "topic": "SinusoidalModelling",
        "topicWords": "Sinusoidal Modelling",
        "file": "AASL_Y2_L21_Lesson_SinusoidalModelling.html",
        "artifactTitle": "Y2 L21 Sinusoidal Modelling",
        "theme": "greengrey",
        "largeGraphs": True,
        "source": "AASL/Claude outputs/AASL_Y2_L21_Worksheet_SinusoidalModelling.tex (worked examples 1-2, the "
        "calculator screen of example 2, groups, Q14), validated 23/10/2026; revision 1 of 23/10/2026",
    },
    "slides": [
        {
            "type": "title",
            "eyebrow": "IB Mathematics AA SL · Year 2 · Lesson 21",
            "title": "Sinusoidal Modelling",
            "lede": "Online lesson — worked examples and lab",
            "code": "SL 3.7 · 3.8",
            "regime": "C",
            "regimeText": "Casio fx-CG50 in radian mode; the keys are in the calculator deck",
        },
        labS,
        weG1,
        weG1b,
        weG2,
        weG3,
        weG3b,
        weW1,
        weW1b,
        weW2,
        weW2b,
        calc,
        weW3,
        {
            "type": "yourturn",
            "title": "Your turn",
            "sections": [
                {
                    "heading": "Now, in class",
                    "rows": [
                        {"code": "A", "q": "Q1–4", "label": "Building the model"},
                        {"code": "B", "q": "Q5–7", "label": "Using the model"},
                    ],
                },
                {
                    "heading": "At home",
                    "rows": [
                        {"code": "C", "q": "Q8–11", "label": "For how long? How many?"},
                        {
                            "code": "D",
                            "q": "Q12–13",
                            "label": "Putting it together (Paper 2 style)",
                        },
                    ],
                },
            ],
            "open": {
                "q": "Q14",
                "text": "The harbour of the notes' Example 2 has depth <span style=\"white-space:nowrap\">$H(t) = 2.8\\sin\\left(\\frac{\\pi}{6}(t - 2)\\right) + 4.6$ m</span>, $t$ hours "
                "after midnight; its wall carries a mark $5.8$ m above the bottom. A photograph is taken at a "
                "random instant between one midnight and the next: what is the chance that it shows the water above "
                "the mark? Draw the $24$ hours as a strip and shade the times above the mark. And for a whole week? "
                "Between 06:00 and 12:00?",
                "how": "Open question — answer it with a drawing.",
                "harvest": "Harvest: L28",
            },
        },
    ],
}
with open(sys.argv[1] if len(sys.argv) > 1 else "content.json", "w") as fh:
    json.dump(content, fh, ensure_ascii=False, indent=1)
print("content.json written")
