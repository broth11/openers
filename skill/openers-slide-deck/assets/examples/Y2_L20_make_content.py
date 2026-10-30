"""Y2 L20 — content.json generator: The Tangent Graph and Transformed Waves (greengrey).

Sources: AASL_Y2_L20_Notes_TangentAndTransformations.tex (tower harvest, unit circle, four numbers, bracket trap)
and the worksheet (groups, open question). Worked examples A-D are original exam-style items built on the
question-writing guide, Geometry & Trigonometry, archetype 11 (reading a sinusoid from its graph); every number
is checked in Y2_L20_verify.py. Kit v11: presets sinusoidABCD and tanABCD, window xticks in multiples of pi,
dotted guide lines (a dashed line is always an asymptote), example "eyebrow" for the non-example slides."""

import json
import math
import sys
from fractions import Fraction

PI = math.pi
EPS = 0.004


def pitex(fr):
    """Fraction of pi -> TeX (\\tfrac{3\\pi}{4})."""
    fr = Fraction(fr)
    if fr == 0:
        return "0"
    s = "-" if fr < 0 else ""
    n, d = abs(fr.numerator), fr.denominator
    num = ("" if n == 1 else str(n)) + "\\pi"
    return s + (num if d == 1 else "\\tfrac{" + num + "}{" + str(d) + "}")


def ticks(lo, hi, den):
    """ticks at k*pi/den for lo <= k*pi/den <= hi (lo, hi in multiples of pi as Fractions)"""
    out, k = [], math.ceil(Fraction(lo) * den)
    while Fraction(k, den) <= Fraction(hi):
        if k:
            out.append([round(k * PI / den, 6), pitex(Fraction(k, den))])
        k += 1
    return out


def win(x0, x1, y0, y1, gx, tick_lo, tick_hi, den, gy=1, ytick=None, **k):
    w = {
        "xmin": round(x0, 4),
        "xmax": round(x1, 4),
        "ymin": y0,
        "ymax": y1,
        "gridx": round(gx, 6),
        "gridy": gy,
        "xticks": ticks(tick_lo, tick_hi, den),
    }
    if ytick:
        w["ytick"] = ytick
    w.update(k)
    return w


def seg(P, Q, **k):
    d = {
        "kind": "segment",
        "from": [round(v, 5) for v in P],
        "to": [round(v, 5) for v in Q],
    }
    d.update(k)
    return d


def lab(at, t, a="c", **k):
    d = {"kind": "label", "at": [round(v, 5) for v in at], "tex": t, "anchor": a}
    d.update(k)
    return d


def pt(at, name=None, a="ne", **k):
    d = {"kind": "point", "at": [round(v, 5) for v in at]}
    if name:
        d.update(label=name, anchor=a)
    d.update(k)
    return d


def fn(expr, dom=None, **k):
    d = {"kind": "fn", "expr": expr}
    if dom:
        d["domain"] = [round(v, 5) for v in dom]
    d.update(k)
    return d


def hline(
    y, W, **k
):  # dotted grey guide line across the window (principal axis, reading line)
    return seg([W["xmin"], y], [W["xmax"], y], dotted=True, **k)


def vas(x, W, **k):  # vertical asymptote: red dashed
    return seg([x, W["ymin"]], [x, W["ymax"]], color="red", dashed=True, **k)


def arrow(P, Q, **k):  # dotted measuring arrow
    return seg(P, Q, dotted=True, arrows=True, **k)


T = lambda s: {"text": s}
ans = lambda s: '<span class="ans" style="white-space:nowrap">' + s + "</span>"


def steps(*rows):
    return {"steps": [{"tex": r} for r in rows]}


EB_T, EB_W = "The tangent graph", "Transformed waves"

# ---------- 2a, 2b — the tower, harvested (Lesson 15)
h = 1.5
stops = [h / math.tan(math.radians(15 * k)) for k in (1, 2, 3, 4, 5)]
WT = {"xmin": -0.6, "xmax": 6.2, "ymin": -0.75, "ymax": 2.6, "plain": True}
tower_base = [
    seg([-0.4, 0], [6.0, 0], color="grey"),
    seg([0, 0], [0, h]),
    pt([0, h], "T", "nw"),
    lab([0, h / 2], "h", "w"),
]
sight = []
for k, dk in enumerate(stops):
    sight += [seg([dk, 0], [0, h], dotted=True, step=2), pt([dk, 0], step=2)]
sight += [
    lab([stops[0], 0], "15^{\\circ}", "s", step=2),
    lab([stops[4], 0], "75^{\\circ}", "s", step=2),
]
stem_t = (
    "Lesson 15: walking towards a tower, you stop each time the angle of elevation of its top has grown by "
    "another $15^{\\circ}$. Are the stops evenly spaced? What happens near the foot?"
)
tower_a = {
    "type": "example",
    "eyebrow": "Harvest · Lesson 15",
    "title": "The tower, harvested",
    "stem": stem_t,
    "blocks": [
        T(
            "In the right triangle of the sight line, $\\tan\\theta = \\frac{h}{d}$, so $d = \\frac{h}{\\tan\\theta}$."
        ),
        T(
            "Stops at $15^{\\circ}, 30^{\\circ}, \\dots, 75^{\\circ}$:<br>$d \\approx 3.73h,\\ 1.73h,\\ h,\\ 0.58h,\\ 0.27h$."
        ),
        T(
            "Gaps $2.00h,\\ 0.73h,\\ 0.42h,\\ 0.31h$: "
            + ans("not evenly spaced")
            + ".<br>Far apart far away, crowded near the foot."
        ),
        T(
            "At the foot there is no triangle left: the angle never reaches $90^{\\circ}$."
        ),
    ],
    "graph": {"window": WT, "items": tower_base + sight},
}
WT2 = win(-0.3, 1.95, -0.7, 5.3, PI / 12, 0, Fraction(1, 2), 4)
tan_pts = [pt([k * PI / 12, math.tan(k * PI / 12)], step=1) for k in (1, 2, 3, 4, 5)]
tower_b = {
    "type": "example",
    "eyebrow": "Harvest · Lesson 15",
    "title": "…turned round: the ratio against the angle",
    "stem": stem_t,
    "blocks": [
        T(
            "Turn the picture round: plot $\\frac{h}{d} = \\tan\\theta$ against the angle. The five stops are the dots."
        ),
        T(
            "As $\\theta \\to \\frac{\\pi}{2}$, $d \\to 0$, so $\\tan\\theta$ grows without bound."
        ),
        T(
            "$\\tan\\frac{\\pi}{2}$ does not exist: $y = \\tan x$ has a "
            + ans("vertical asymptote at $x = \\frac{\\pi}{2}$")
            + "."
        ),
    ],
    "graph": {
        "window": WT2,
        "items": [fn("tan(x)", [0, PI / 2 - 0.05])]
        + tan_pts
        + [
            vas(PI / 2, WT2, step=2),
            lab([PI / 2, 4.6], "x = \\tfrac{\\pi}{2}", "w", color="red", step=2),
        ],
    },
}

# ---------- 3a — tan x from the unit circle; 3b — the graph of y = tan x
WC = {
    "xmin": -1.8,
    "xmax": 1.8,
    "ymin": -1.8,
    "ymax": 1.8,
    "grid": 0.5,
    "xtick": 1,
    "ytick": 1,
}
r2 = math.sqrt(2) / 2
circle = {
    "kind": "path",
    "pts": [
        [round(math.cos(t * 2 * PI / 120), 5), round(math.sin(t * 2 * PI / 120), 5)]
        for t in range(121)
    ],
}
uc = {
    "type": "example",
    "eyebrow": EB_T,
    "title": "The tangent from the unit circle",
    "stem": "Draw the tangent to the unit circle at $A(1,0)$, the line $x = 1$. The point $P$ is at angle $x$.",
    "blocks": [
        T(
            "Extend $OP$ to meet the line $x = 1$ at $Q$: "
            + ans("the height of $Q$ is $\\tan x$")
            + "."
        ),
        T(
            "At $x = \\frac{\\pi}{2}$, $OP$ is vertical, parallel to $x = 1$: no $Q$, an asymptote."
        ),
        T(
            "$P$ at $\\frac{\\pi}{4}$ and the opposite point $P'$ at $\\frac{5\\pi}{4}$ lie on the same line through $O$: same $Q$."
        ),
        steps("\\tan(x + \\pi) &= \\tan x"),
        T("Half a turn changes $P$ but not the line: " + ans("period $\\pi$") + "."),
    ],
    "graph": {
        "window": WC,
        "items": [
            circle,
            {"kind": "line", "through": [[1, 0], [1, 1]], "color": "grey"},
            pt([0, 0], "O", "sw"),
            pt([1, 0], "A", "se"),
            pt([r2, r2]), lab([0.56, 1.0], "P", "c"),
            {"kind": "angle", "O": [0, 0], "P": [1, 0], "Q": [r2, r2]},
            lab([0.42, 0.17], "x", "c"),
            seg([0, 0], [1, 1], step=1),
            pt([1, 1], "Q", "e", step=1),
            seg([1, 0], [1, 1], answer=True, step=1),
            lab([1, 0.5], "\\tan x", "e", step=1),
            seg([0, 0], [0, 1.7], dotted=True, step=2, until=2),
            seg([-r2, -r2], [0, 0], step=3),
            pt([-r2, -r2], "P'", "sw", step=3),
        ],
    },
}
# v13: xmax 6.9 (not 2π + 0.35): the "2π" tick at the edge widened the slide and fired the 52 % shrink (checker now fails on it)
WG = win(-PI - 0.35, 6.9, -4.3, 4.3, PI / 2, -1, 2, 2, ytick=2)
branches = [
    fn("tan(x)", [lo, hi])
    for lo, hi in (
        (-PI, -PI / 2 - EPS),
        (-PI / 2 + EPS, PI / 2 - EPS),
        (PI / 2 + EPS, 3 * PI / 2 - EPS),
        (3 * PI / 2 + EPS, 2 * PI),
    )
]
tg = {
    "type": "example",
    "eyebrow": EB_T,
    "title": "The graph of $y = \\tan x$",
    "stem": "Carry the height of $Q$ across to axes with the angle $x$ horizontal, for $-\\pi \\le x \\le 2\\pi$.",
    "blocks": [
        T(
            "Vertical asymptotes at $x = -\\frac{\\pi}{2},\\ \\frac{\\pi}{2},\\ \\frac{3\\pi}{2}$, where $\\cos x = 0$."
        ),
        T("Zeros at $x = -\\pi,\\ 0,\\ \\pi,\\ 2\\pi$, where $\\sin x = 0$."),
        T(ans("Period $\\pi$") + ": each branch fills the gap between two asymptotes."),
        T(
            "No maximum, no minimum, "
            + ans("no amplitude")
            + ". Range $y \\in \\mathbb{R}$."
        ),
        T(
            "Every branch increases. Reference points $\\left(\\frac{\\pi}{4},\\,1\\right)$ and $\\left(-\\frac{\\pi}{4},\\,-1\\right)$."
        ),
    ],
    "graph": {
        "window": WG,
        "items": branches
        + [vas(x0, WG, step=1) for x0 in (-PI / 2, PI / 2, 3 * PI / 2)]
        + [pt([x0, 0], step=2) for x0 in (-PI, 0, PI, 2 * PI)]
        + [
            arrow([-PI / 2, 3.5], [PI / 2, 3.5], step=3),
            lab([0, 3.5], "\\pi", "n", step=3),
        ]
        + [
            pt([PI / 4, 1], step=5),
            pt([-PI / 4, -1], step=5),
        ],
    },
}

# ---------- labs
WL = win(-PI - 0.15, 2 * PI + 0.15, -5, 5, PI / 4, -1, 2, 2)
lab1 = {
    "type": "lab",
    "preset": "sinusoidABCD",
    "title": "Four numbers move a wave",
    "controlScale": 1.0,
    # v13 (teacher, 23/10/2026): wide layout (the preset's default), window to 4π and b from 1, so that two
    # successive maxima stay in the window for every slider value (the period arrow never vanishes)
    "init": {"window": win(-PI - 0.15, 4 * PI + 0.15, -5, 5, PI / 4, -1, 4, 2), "bRange": [1, 3, 0.5],
             "a": 2, "b": 2, "k": 2, "d": 1},
}
lab2 = {
    "type": "lab",
    "preset": "tanABCD",
    "title": "The same four numbers on the tangent graph",
    "controlScale": 1.0,
    "init": {"window": WL, "a": 1, "b": 1, "k": 0, "d": 0},
}

# ---------- 6 — the four numbers, on y = 3 sin(2(x + pi/6)) + 1
WS = win(-PI / 2 - 0.25, PI + 0.25, -3.6, 5.4, PI / 4, Fraction(-1, 2), 1, 4)
summ = {
    "type": "example",
    "eyebrow": EB_W,
    "title": "Four numbers that move a wave",
    "stem": "$y = a\\sin\\bigl(b(x + c)\\bigr) + d$, from $y = \\sin x$, with $b > 0$. On the graph: "
    "$y = 3\\sin\\left(2\\left(x + \\frac{\\pi}{6}\\right)\\right) + 1$.",
    "blocks": [
        T(
            "$a$: vertical stretch, scale factor $a$ (reflection in the $x$-axis if $a < 0$) $\\to$ amplitude $|a|$."
        ),
        T(
            "$b$: horizontal stretch, scale factor $\\frac{1}{b}$ $\\to$ period $\\frac{2\\pi}{b}$."
        ),
        T(
            "$c$: horizontal translation by $-c$, to the left if $c > 0$ $\\to$ a cycle starts at $x = -c$."
        ),
        T("$d$: vertical translation by $d$ $\\to$ principal axis $y = d$."),
        T(
            "Maximum $d + |a|$, minimum $d - |a|$. For $\\tan$: period $\\frac{\\pi}{b}$, no amplitude."
        ),
    ],
    "graph": {
        "window": WS,
        "items": [
            fn("sin(x)", color="grey"),
            fn("3*sin(2*(x + pi/6)) + 1"),
            arrow([PI / 12, 1], [PI / 12, 4], step=1),
            lab([PI / 12, 2.5], "3", "e", step=1),
            arrow([-5 * PI / 12, -2.6], [7 * PI / 12, -2.6], step=2),
            lab([PI / 12, -2.6], "\\pi", "s", step=2),
            pt(
                [-PI / 6, 1],
                "\\left(-\\tfrac{\\pi}{6},\\,1\\right)",
                "nw",
                answer=True,
                step=3,
            ),
            hline(1, WS, step=4),
            lab([2.2, 1], "y = 1", "n", step=4),
        ],
    },
}

# ---------- 7 — the bracket trap
WB = win(
    -PI / 2 - 0.2, PI + 0.2, -1.9, 1.9, PI / 12, Fraction(-1, 2), 1, 4, gy=0.5, ytick=1
)
brk = {
    "type": "example",
    "eyebrow": EB_W,
    "title": "The bracket matters",
    "stem": "Compare $y = \\sin 2x$ with $y = \\sin\\left(2x + \\frac{\\pi}{3}\\right)$. Which translation takes one onto the other?",
    "blocks": [
        T("Maximum of $\\sin 2x$: $2x = \\frac{\\pi}{2}$, at $x = \\frac{\\pi}{4}$."),
        T(
            "Maximum of $\\sin\\left(2x + \\frac{\\pi}{3}\\right)$: $2x + \\frac{\\pi}{3} = \\frac{\\pi}{2}$, at $x = \\frac{\\pi}{12}$."
        ),
        steps("\\tfrac{\\pi}{4} - \\tfrac{\\pi}{12} &= \\tfrac{\\pi}{6}"),
        steps(
            "\\sin\\left(2x + \\tfrac{\\pi}{3}\\right) &= \\sin\\left(2\\left(x + \\tfrac{\\pi}{6}\\right)\\right)"
        ),
        T(
            "A "
            + ans("translation of $\\frac{\\pi}{6}$ to the left")
            + ", not $\\frac{\\pi}{3}$: factor out $b$ first."
        ),
    ],
    "graph": {
        "window": WB,
        "items": [
            fn("sin(2*x)", color="grey"),
            fn("sin(2*x + pi/3)"),
            pt([PI / 4, 1], step=1),
            pt([PI / 12, 1], step=2),
            arrow([PI / 4, 1.45], [PI / 12, 1.45], step=3),
            lab([PI / 6, 1.45], "\\tfrac{\\pi}{6}", "n", step=3),
        ],
    },
}

# ---------- WE A — f(x) = a sin(bx) read from a grid (archetype 11, Paper 1); two slides
WA = win(-0.35, PI + 0.35, -7.8, 8.2, PI / 8, 0, 1, 4, ytick=2)
stemA = "The graph of $f(x) = a\\sin(bx)$, where $a, b \\in \\mathbb{Z}^{+}$, is shown for $0 \\le x \\le \\pi$."
curveA = [fn("6*sin(4*x)", [0, PI])]
perA = [pt([PI / 8, 6]), pt([5 * PI / 8, 6]), arrow([PI / 8, 7.0], [5 * PI / 8, 7.0]), lab([3 * PI / 8, 7.0], "\\tfrac{\\pi}{2}", "n")]
weA1 = {
    "type": "example", "n": "A", "tag": "NC", "title": "Reading a sine curve from its graph", "stem": stemA,
    "prompt": "(a) Write down the value of $a$. [1]<br>(b) (i) Write down the period of $f$. [1]<br>"
              "&emsp;&ensp;(ii) Hence find the value of $b$. [2]",
    "blocks": [
        T("(a) Maximum $6$, minimum $-6$: " + ans("$a = 6$")),
        T("(b) (i) Maximum at $x = \\frac{\\pi}{8}$, the next at $x = \\frac{5\\pi}{8}$: " + ans("period $\\frac{\\pi}{2}$")),
        steps("\\text{(ii)}\\quad b &= \\frac{2\\pi}{\\pi/2} = \\bl{4}"),
    ],
    "graph": {"window": WA, "items": curveA + [hline(6, WA, step=1, until=1), hline(-6, WA, step=1, until=1)] +
              [dict(it, step=2) for it in perA]},
}
weA2 = {
    "type": "example", "n": "A", "tag": "NC", "title": "…a value of $f$ at a reference angle", "stem": stemA,
    "prompt": "(c) Find $f\\left(\\frac{\\pi}{16}\\right)$. [3]",
    "blocks": [
        steps("\\text{(c)}\\quad f\\left(\\tfrac{\\pi}{16}\\right) &= 6\\sin\\left(4 \\times \\tfrac{\\pi}{16}\\right) = 6\\sin\\tfrac{\\pi}{4}",
              "&= 6 \\times \\tfrac{\\sqrt{2}}{2}", "&= \\bl{3\\sqrt{2}}"),
    ],
    "graph": {"window": WA, "items": curveA + perA + [
        pt([PI / 16, 3 * math.sqrt(2)], answer=True, step=3)]},
}

# ---------- WE B — g(x) = a cos(bx) + d, minimum at x = 0 (sign of a); two slides
WBB = win(-PI / 3 - 0.3, PI + 0.3, -3.6, 8.2, PI / 6, Fraction(-1, 3), 1, 3, ytick=2)
stemB = ("The graph of $g(x) = a\\cos(bx) + d$, where $b > 0$, has a minimum point at $(0,\\,-2)$ and the next "
         "maximum point at $\\left(\\frac{\\pi}{3},\\,6\\right)$.")
curveB = [fn("-4*cos(3*x) + 2", [-PI / 3, PI]),
          pt([0, -2], "(0,\\,-2)", "se"), pt([PI / 3, 6], "\\left(\\tfrac{\\pi}{3},\\,6\\right)", "e")]
weB1 = {
    "type": "example", "n": "B", "tag": "NC", "title": "A minimum at $x = 0$: the sign of $a$", "stem": stemB,
    "prompt": "(a) Find $d$ and $a$. Explain how the graph shows the sign of $a$. [3]",
    "blocks": [
        steps("\\text{(a)}\\quad d &= \\frac{6 + (-2)}{2} = \\bl{2}", "|a| &= \\frac{6 - (-2)}{2} = 4"),
        T("$\\cos 0 = 1$ gives a maximum at $x = 0$, but the graph has a minimum there: reflected, so " + ans("$a = -4$")),
    ],
    "graph": {"window": WBB, "items": curveB + [hline(2, WBB, step=1)]},
}
weB2 = {
    "type": "example", "n": "B", "tag": "NC", "title": "…the period, $b$ and the smallest $k$", "stem": stemB,
    "prompt": "(b) Find $b$. [2]<br>(c) Find the smallest $k > 0$ such that $g(x + k) = g(x)$ for all $x$. [1]",
    "blocks": [
        steps("\\text{(b)}\\quad \\text{period} &= 2 \\times \\tfrac{\\pi}{3} = \\tfrac{2\\pi}{3}", "b &= \\frac{2\\pi}{2\\pi/3} = \\bl{3}"),
        T("(c) One period: " + ans("$k = \\frac{2\\pi}{3}$")),
    ],
    "graph": {"window": WBB, "items": curveB + [hline(2, WBB),
        pt([PI, 6], step=1), arrow([PI / 3, 7.0], [PI, 7.0], step=1), lab([2 * PI / 3, 7.0], "\\tfrac{2\\pi}{3}", "n", step=1)]},
}

# ---------- WE C — all four numbers from a max and the next min, the y-intercept, a cosine form; three slides
WCC = win(-PI / 4 - 0.3, PI + 0.3, -5.0, 6.6, PI / 8, Fraction(-1, 4), 1, 4, ytick=2)
stemC = ("The graph of $h(x) = a\\sin\\bigl(b(x + c)\\bigr) + d$, where $a > 0$, $b > 0$ and $0 < c < \\frac{\\pi}{2}$, "
         "has a maximum point at $\\left(\\frac{\\pi}{8},\\,5\\right)$ and the next minimum point at $\\left(\\frac{5\\pi}{8},\\,-3\\right)$.")
curveC = [fn("4*sin(2*(x + pi/8)) + 1", [-PI / 4, PI]),
          pt([PI / 8, 5], "\\left(\\tfrac{\\pi}{8},\\,5\\right)", "n"), pt([5 * PI / 8, -3], "\\left(\\tfrac{5\\pi}{8},\\,-3\\right)", "se")]
refC = pt([-PI / 8, 1], "\\left(-\\tfrac{\\pi}{8},\\,1\\right)", "nw")
weC1 = {
    "type": "example", "n": "C", "tag": "NC", "title": "All four numbers from a maximum and a minimum", "stem": stemC,
    "prompt": "(a) Find $a$, $b$ and $d$. [4]",
    "blocks": [
        steps("\\text{(a)}\\quad d &= \\frac{5 + (-3)}{2} = \\bl{1}", "a &= \\frac{5 - (-3)}{2} = \\bl{4}",
              "\\text{period} &= 2\\left(\\tfrac{5\\pi}{8} - \\tfrac{\\pi}{8}\\right) = \\pi", "b &= \\frac{2\\pi}{\\pi} = \\bl{2}"),
    ],
    "graph": {"window": WCC, "items": curveC + [
        hline(1, WCC, step=1),
        arrow([PI / 8, -4.1], [5 * PI / 8, -4.1], step=3), lab([3 * PI / 8, -4.1], "\\tfrac{\\pi}{2}", "s", step=3)]},
}
weC2 = {
    "type": "example", "n": "C", "tag": "NC", "title": "…the translation $c$ and the $y$-intercept", "stem": stemC,
    "prompt": "(b) Find $c$. [2]<br>(c) Find the exact $y$-intercept of the graph. [2]",
    "blocks": [
        steps("\\text{(b)}\\quad \\tfrac{\\pi}{8} - \\tfrac{\\pi}{4} &= -\\tfrac{\\pi}{8}"),
        T("A quarter period before the maximum, the curve crosses $y = 1$ going up: that point is $(-c,\\,d)$, so " + ans("$c = \\frac{\\pi}{8}$")),
        steps("\\text{(c)}\\quad h(0) &= 4\\sin\\left(2 \\times \\tfrac{\\pi}{8}\\right) + 1 = 4\\sin\\tfrac{\\pi}{4} + 1", "&= \\bl{2\\sqrt{2} + 1}"),
    ],
    "graph": {"window": WCC, "items": curveC + [hline(1, WCC), dict(refC, answer=True, step=2),
        pt([0, 2 * math.sqrt(2) + 1], "\\left(0,\\,2\\sqrt{2}+1\\right)", "nw", answer=True, step=4)]},
}
weC3 = {
    "type": "example", "n": "C", "tag": "NC", "title": "…the same curve as a cosine", "stem": stemC,
    "prompt": "(d) The function can also be written $h(x) = 4\\cos\\bigl(2(x - q)\\bigr) + 1$. Find the smallest $q > 0$. [2]",
    "blocks": [
        T("A cosine curve starts at a maximum: slide <span style=\"white-space:nowrap\">$y = 4\\cos 2x + 1$</span> to the maximum at $x = \\frac{\\pi}{8}$, a quarter period after $-\\frac{\\pi}{8}$."),
        T(ans("$q = \\frac{\\pi}{8}$") + ", and $h(x) = 4\\cos\\left(2\\left(x - \\frac{\\pi}{8}\\right)\\right) + 1$."),
    ],
    "graph": {"window": WCC, "items": curveC + [hline(1, WCC), refC,
        arrow([-PI / 8, -4.1], [PI / 8, -4.1], step=1), lab([0, -4.1], "\\tfrac{\\pi}{4}", "s", step=1)]},
}

# ---------- WE D — y = 3 tan 2x: period, asymptotes, solutions of f(x) = 3
WD = win(-0.3, PI + 0.3, -6.6, 6.6, PI / 8, 0, 1, 4, ytick=2)
brD = [fn("3*tan(2*x)", [lo, hi]) for lo, hi in ((0, PI / 4 - EPS), (PI / 4 + EPS, 3 * PI / 4 - EPS), (3 * PI / 4 + EPS, PI))]
weD = {
    "type": "example", "n": "D", "tag": "NC", "title": "A transformed tangent graph",
    "stem": "Let $f(x) = 3\\tan 2x$, for $0 \\le x \\le \\pi$.",
    "prompt": "(a) Write down the period of $f$. [1]<br>(b) Write down the equations of the asymptotes. [2]<br>"
              "(c) Solve $f(x) = 3$. [3]",
    "blocks": [
        T("(a) Period $\\frac{\\pi}{b}$: " + ans("$\\frac{\\pi}{2}$")),
        T("(b) $2x = \\frac{\\pi}{2},\\ \\frac{3\\pi}{2}$: " + ans("$x = \\frac{\\pi}{4}$") + " and " + ans("$x = \\frac{3\\pi}{4}$")),
        steps("\\text{(c)}\\quad \\tan 2x &= 1", "2x &= \\tfrac{\\pi}{4}", "x &= \\bl{\\tfrac{\\pi}{8}}"),
        T("Next branch: " + ans("$x = \\frac{5\\pi}{8}$") + " $\\left(\\frac{\\pi}{8} + \\frac{\\pi}{2}\\right)$; the last branch is negative."),
    ],
    "graph": {"window": WD, "items": brD + [
        vas(PI / 4, WD, step=2), vas(3 * PI / 4, WD, step=2),
        hline(3, WD, step=3), lab([WD["xmax"] - 0.6, 3], "y = 3", "n", step=3),
        pt([PI / 8, 3], answer=True, step=4), pt([5 * PI / 8, 3], answer=True, step=5)]},
}

content = {
    "meta": {
        "cohort": "Y2",
        "cohortLabel": "Year 2",
        "lesson": 20,
        "topic": "TangentAndTransformations",
        "topicWords": "The Tangent Graph and Transformed Waves",
        "file": "AASL_Y2_L20_Lesson_TangentAndTransformations.html",
        "artifactTitle": "Y2 L20 The Tangent Graph and Transformed Waves",
        "theme": "greengrey",
        "source": "AASL_Y2_L20_Notes_/Worksheet_TangentAndTransformations.tex (validated L20 documents); "
        "worked examples original, guide G&T archetype 11",
    },
    "slides": [
        {
            "type": "title",
            "eyebrow": "IB Mathematics AA SL · Year 2 · Lesson 20",
            "title": "The Tangent Graph and Transformed Waves",
            "lede": "Online lesson — worked examples and lab",
            "code": "SL 3.7",
            "regime": "NC",
            "regimeText": "no calculator anywhere in this lesson",
        },
        tower_a,
        tower_b,
        uc,
        tg,
        lab1,
        lab2,
        summ,
        brk,
        weA1,
        weA2,
        weB1,
        weB2,
        weC1,
        weC2,
        weC3,
        weD,
        {
            "type": "yourturn",
            "title": "Your turn",
            "sections": [
                {
                    "heading": "Now, in class",
                    "rows": [
                        {"code": "A", "q": "Q1–4", "label": "The tangent graph"},
                        {"code": "B", "q": "Q5–9", "label": "The four numbers"},
                    ],
                },
                {
                    "heading": "At home",
                    "rows": [
                        {"code": "C", "q": "Q10–13", "label": "Reading a graph"},
                        {
                            "code": "D",
                            "q": "Q14–15",
                            "label": "Putting it together (Paper 1 style)",
                        },
                    ],
                },
            ],
            "open": {
                "q": "Q16",
                "text": "Take the graph of $y = \\sin x$ for $0 \\le x \\le 2\\pi$. Judge how steep it is at "
                "$x = 0, \\frac{\\pi}{2}, \\pi, \\frac{3\\pi}{2}, 2\\pi$ and half-way between, and plot that "
                "steepness against $x$. Where is it largest? Where is it zero? Does the new curve look like a graph you know?",
                "how": "Open question — answer it with a drawing.",
                "harvest": "Harvest: L25",
            },
        },
    ],
}

with open(sys.argv[1] if len(sys.argv) > 1 else "content.json", "w") as fh:
    json.dump(content, fh, ensure_ascii=False, indent=1)
print("content.json written")
