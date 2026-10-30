"""Y1 L20 — content.json generator (worksheet AASL_Y1_L20_Worksheet_Reciprocal.tex, worked examples 1-5).
Greyline (validated 20/10/2026); t2c h -> red, k -> blue. Vertical asymptote dashed red, horizontal dashed blue; an asymptote that
is an axis is drawn as that axis in colour (notes' convention)."""

import json
import sys


def seg(P, Q, **k):
    d = {"kind": "segment", "from": P, "to": Q}
    d.update(k)
    return d


def lab(at, t, a="c", **k):
    d = {"kind": "label", "at": at, "tex": t, "anchor": a}
    d.update(k)
    return d


def pt(at, name=None, a="ne", **k):
    d = {"kind": "point", "at": at}
    if name:
        d.update(label=name, anchor=a)
    d.update(k)
    return d


def fn(expr, dom=None, **k):
    d = {"kind": "fn", "expr": expr}
    if dom:
        d["domain"] = dom
    d.update(k)
    return d


def win(x0, x1, y0, y1):
    return {"xmin": x0, "xmax": x1, "ymin": y0, "ymax": y1, "grid": 1}


def vas(x, W, **k):
    return seg([x, W["ymin"]], [x, W["ymax"]], color="red", dashed=True, **k)


def has(y, W, **k):
    return seg([W["xmin"], y], [W["xmax"], y], color="blue", dashed=True, **k)


def yaxis(W, **k):
    return seg([0, W["ymin"]], [0, W["ymax"]], color="red", **k)  # asymptote x = 0


def xaxis(W, **k):
    return seg([W["xmin"], 0], [W["xmax"], 0], color="blue", **k)  # asymptote y = 0


T = lambda s: {"text": s}
ans = lambda s: '<span class="ans" style="white-space:nowrap">' + s + "</span>"


def steps(*rows):
    return {"steps": [{"tex": r} for r in rows]}


vec = lambda a, b: "\\begin{pmatrix} " + a + " \\\\ " + b + " \\end{pmatrix}"

# ---------- Worked Example 1 — y = 3/x, two slides (close to 0, far from 0)
stem1 = (
    "Complete a table of values of $y = \\dfrac3x$ close to $0$ and far from $0$. Describe the behaviour "
    "of $y$ in each of the four directions, and write down the asymptotes."
)
W1 = win(-6.5, 6.5, -6.5, 6.5)
def tab(rows):
    """one array, x/y rows stacked: positive values on top, negative below, columns aligned"""
    n = len(rows[0][0])
    body = " \\\\[0.4em] \\hline ".join(
        "x & " + " & ".join(xs) + " \\\\ y & " + " & ".join(ys) for xs, ys in rows)
    return "$\\begin{array}{c|" + "r" * n + "} " + body + " \\end{array}$"
tab_near = tab([(["1", "0.5", "0.1", "0.01", "0.001"], ["3", "6", "30", "300", "3000"]),
                (["-1", "-0.5", "-0.1", "-0.01", "-0.001"], ["-3", "-6", "-30", "-300", "-3000"])])
tab_far = tab([(["5", "10", "100", "1000"], ["0.6", "0.3", "0.03", "0.003"]),
               (["-5", "-10", "-100", "-1000"], ["-0.6", "-0.3", "-0.03", "-0.003"])])

curve1 = [fn("3/x", step=1)]
ex1a = {"type": "example", "n": 1, "tag": "NC", "title": "Behaviour from a table — close to 0", "stem": stem1,
  "blocks": [T(tab_near), T("Read each table from left to right."),
             T("As $x \\to 0^{+}$, $y \\to +\\infty$;<br>as $x \\to 0^{-}$, $y \\to -\\infty$.<br>So the line "
               + ans("$x = 0$") + " is a vertical asymptote.")],
  "graph": {"window": W1, "items": curve1 + [
     pt([1, 3], "(1,\\,3)", "ne", step=1), pt([-1, -3], "(-1,\\,-3)", "sw", step=1),
     yaxis(W1, step=3), lab([0, 5.4], "x = 0", "e", color="red", step=3)]}}
ex1b = {"type": "example", "n": 1, "tag": "NC", "title": "Behaviour from a table — far from 0", "stem": stem1,
  "blocks": [T(tab_far),
             T("As $x \\to +\\infty$, $y \\to 0$ from above;<br>as $x \\to -\\infty$, $y \\to 0$ from below.<br>So the line "
               + ans("$y = 0$") + " is a horizontal asymptote."),
             T("Asymptotes: " + ans("$x = 0$") + " and " + ans("$y = 0$") + ". The stretch by $3$ has not moved them.")],
  "graph": {"window": W1, "items": [fn("3/x"), yaxis(W1), lab([0, 5.4], "x = 0", "e", color="red"),
     pt([3, 1], "(3,\\,1)", "ne", step=1), pt([-3, -1], "(-3,\\,-1)", "sw", step=1),
     xaxis(W1, step=2), lab([-5.2, 0], "y = 0", "n", color="blue", step=2)]}}

# ---------- Lab — before Example 2
W_lab = win(-7, 7, -7, 7)
lab_slide = {
    "type": "lab",
    "preset": "reciprocalAHK",
    "title": "Moving the reciprocal curve",
    "controlScale": 1.0,
    "init": {"window": W_lab, "a": 2, "h": 4, "k": 1, "hRange": [-5, 5], "kRange": [-5, 5], "mode": "curve only"},
}

# ---------- Worked Example 2 — y = 1/(x+3) - 2
W2 = win(-7.5, 4.5, -7.5, 4.5)
ex2a = {
    "type": "example",
    "n": 2,
    "tag": "NC",
    "title": "Asymptotes, domain and range from a transformation",
    "stem": (
        "Describe the transformation that maps the graph of $y = \\dfrac1x$ onto the graph of "
        "$y = \\dfrac{1}{x+3} - 2$. Write down the asymptotes, the domain and the range."
    ),
    "blocks": [
        steps(
            "\\frac{1}{x+3} - 2 &= \\frac{1}{x-(-3)} + (-2)",
            "a = 1,\\quad h &= -3,\\quad k = -2",
        ),
        T(
            "There is no stretch, so the transformation is a single "
            + ans("translation by $" + vec("-3", "-2") + "$")
            + ": $3$ units left, $2$ units down. The plus sign inside the bracket moves the curve to the left."
        ),
        T(
            "The asymptotes travel with the curve, from $x = 0$ and $y = 0$ to "
            + ans("$x = -3$")
            + " and "
            + ans("$y = -2$")
            + "."
        ),
    ],
    "graph": {
        "window": W2,
        "items": [
            fn("1/x", dashed=True),
            lab([2.6, 0.9], "y = \\tfrac1x", "n"),
            fn("1/(x + 3) - 2", step=3),
            vas(-3, W2, step=4),
            has(-2, W2, step=4),
            lab([-3, 3.4], "x = -3", "w", color="red", step=4),
            lab([-6.2, -2], "y = -2", "n", color="blue", step=4),
        ],
    },
}

ex2b = {
    "type": "example",
    "n": 2,
    "tag": "NC",
    "title": "…domain, range and a check",
    "stem": ex2a["stem"],
    "blocks": [
        T(
            "Domain "
            + ans("$x \\in \\mathbb{R},\\ x \\neq -3$")
            + ". Range "
            + ans("$y \\in \\mathbb{R},\\ y \\neq -2$")
            + "."
        ),
        T(
            "Check with one point: $(1,1)$ on $y = \\tfrac1x$ goes to $(-2,-1)$, and indeed $\\tfrac{1}{-2+3} - 2 = -1$."
        ),
    ],
    "graph": {"window": W2, "items": [
        fn("1/x", dashed=True), lab([-5.5, -0.18], "y = \\tfrac1x", "s"), fn("1/(x + 3) - 2"),
        vas(-3, W2), has(-2, W2),
        lab([-3, 3.4], "x = -3", "w", color="red"), lab([-6.2, -2], "y = -2", "n", color="blue"),
        pt([1, 1], "(1,\\,1)", "ne", step=2), pt([-2, -1], step=2)]},  # its coordinates are in the check sentence; no room for a label at 1000x570
}

# ---------- Worked Example 3 — y = -2/x - 3 (teacher's change, 20/10/2026; the worksheet has -2/x)
W3 = win(-5.5, 5.5, -8.5, 2.5)
stem3 = "Sketch the graph of $y = -\\dfrac2x - 3$, showing its asymptotes, its intercepts and one point on each branch."
asy3 = [yaxis(W3), has(-3, W3), lab([0, 1.6], "x = 0", "e", color="red"), lab([-4.4, -3], "y = -3", "s", color="blue")]
ex3a = {
    "type": "example",
    "n": 3,
    "tag": "NC",
    "title": "Sketching with one point per branch",
    "stem": stem3,
    "blocks": [
        steps("-\\frac{2}{x} - 3 &= -2 \\times \\frac{1}{x} + (-3)"),
        T("A vertical stretch, scale factor $2$, a reflection in the $x$-axis, then a translation by $"
          + vec("0", "-3") + "$."),
        T("The stretch and the reflection leave the asymptotes in place; the translation moves the horizontal one "
          "down $3$ units: " + ans("$x = 0$") + " and " + ans("$y = -3$") + "."),
    ],
    "graph": {"window": W3, "items": [dict(it, step=3) for it in asy3]},
}
ex3b = {
    "type": "example",
    "n": 3,
    "tag": "NC",
    "title": "…intercepts and one point on each branch",
    "stem": stem3,
    "blocks": [
        T("The reflection puts the branches top-left and bottom-right of $(0,-3)$, where the asymptotes meet."),
        T("One point on each branch: at $x = 1$, $y = -5$; at $x = -1$, $y = -1$."),
        T("No $y$-intercept: $x = 0$ is excluded. On the $x$-axis, $y = 0$:"),
        steps("-\\frac{2}{x} - 3 &= 0", "\\therefore\\quad -2 &= 3x",
              "\\therefore\\quad x &= \\bl{-\\tfrac{2}{3}}"),
    ],
    "graph": {"window": W3, "items": asy3 + [
        fn("-2/x - 3", step=1, answer=True),
        pt([1, -5], "(1,\\,-5)", "e", step=2), pt([-1, -1], "(-1,\\,-1)", "w", step=2),
        pt([-0.6667, 0], "\\left(-\\tfrac23,\\,0\\right)", "nw", step=6)]},
}

# ---------- Worked Example 4 — asymptotes x = 1, y = 3 through (3,4)
W4 = win(-4, 7, -2, 9)
ex4a = {
    "type": "example",
    "n": 4,
    "tag": "NC",
    "title": "An equation from its asymptotes",
    "stem": (
        "The graph of $y = \\dfrac{a}{x-h} + k$ has asymptotes $x = 1$ and $y = 3$, and passes through the "
        "point $(3,4)$. Find $a$, $h$ and $k$."
    ),
    "blocks": [
        T(
            "The asymptotes give $h$ and $k$ directly: $h = 1$ and $k = 3$. So $y = \\frac{a}{x-1} + 3$, "
            "and the point $(3,4)$ gives $a$:"
        ),
        steps(
            "4 &= \\frac{a}{3-1} + 3",
            "\\therefore\\quad 1 &= \\frac{a}{2}",
            "\\therefore\\quad a &= \\bl{2}",
        ),
    ],
    "graph": {"window": W4, "items": [
        vas(1, W4), has(3, W4),
        lab([1, 8], "x = 1", "e", color="red"), lab([-3, 3], "y = 3", "n", color="blue"),
        pt([3, 4], "(3,\\,4)", "ne")]},
}
ex4b = {
    "type": "example",
    "n": 4,
    "tag": "NC",
    "title": "…the equation, and a check",
    "stem": ex4a["stem"],
    "blocks": [
        T("So " + ans("$a = 2$, $h = 1$, $k = 3$") + ", and $y = \\dfrac{2}{x-1} + 3$."),
        T(
            "Check the picture: $(3,4)$ lies to the right of $x = 1$ and above $y = 3$, on the top-right branch, "
            "as a positive $a$ requires."
        ),
    ],
    "graph": {"window": W4, "items": ex4a["graph"]["items"] + [fn("2/(x - 1) + 3", step=1, answer=True)]},
}

# ---------- Worked Example 5 — f(x) = 1/(x-2) + 2, two slides (picture, algebra)
stem5 = (
    "Let $f(x) = \\dfrac{1}{x-2} + 2$, for $x \\neq 2$. Show that $f$ is self-inverse."
)
W5 = win(-3.5, 7.5, -3.5, 7.5)
base5 = [
    {"kind": "line", "through": [[0, 0], [1, 1]], "color": "grey"},
    lab([6.2, 6.2], "y = x", "se"),
]
asy5 = [
    vas(2, W5),
    has(2, W5),
    lab([2, -2.6], "x = 2", "e", color="red"),
    lab([-2.4, 2], "y = 2", "n", color="blue"),
]
pair5 = [
    pt([2.5, 4]),
    pt([4, 2.5], "\\left(4,\\tfrac52\\right)", "e"),
    lab([2.5, 4], "\\left(\\tfrac52,4\\right)", "nw"),
    seg([2.5, 4], [4, 2.5], dashed=True),
]
ex5a = {
    "type": "example",
    "n": 5,
    "tag": "NC",
    "title": "A self-inverse function — the picture",
    "stem": stem5,
    "blocks": [
        T(
            "<strong>The picture first.</strong> The asymptotes $x = 2$ and $y = 2$ meet at $(2,2)$, a point of the line $y = x$."
        ),
        T(
            "The curve is $y = \\tfrac1x$ translated by $"
            + vec("2", "2")
            + "$, along the mirror line, so it is still "
            "symmetric about $y = x$:"
        ),
        T(
            "the point $\\left(4,\\tfrac52\\right)$ has its mirror image $\\left(\\tfrac52,4\\right)$ on the curve too."
        ),
    ],
    "graph": {
        "window": W5,
        "items": base5
        + [fn("1/(x - 2) + 2")]
        + [dict(it, step=1) for it in asy5]
        + [pt([2, 2], step=1)]
        + [pt([3, 3], step=2), pt([1, 1], step=2)]
        + [dict(it, step=3) for it in pair5],
    },
}
ex5b = {
    "type": "example",
    "n": 5,
    "tag": "NC",
    "title": "A self-inverse function — the algebra",
    "stem": stem5,
    "blocks": [
        T(
            "<strong>The algebra confirms it.</strong> Swap $x$ and $y$, then solve for $y$:"
        ),
        steps(
            "x &= \\frac{1}{y-2} + 2",
            "\\therefore\\quad x - 2 &= \\frac{1}{y-2}",
            "\\therefore\\quad y - 2 &= \\frac{1}{x-2}",
            "\\therefore\\quad y &= \\frac{1}{x-2} + 2",
        ),
        T(
            "So $f^{-1}(x) = \\dfrac{1}{x-2} + 2 = f(x)$: "
            + ans("$f$ is self-inverse")
            + "."
        ),
    ],
    "graph": {
        "window": W5,
        "items": base5
        + [fn("1/(x - 2) + 2")]
        + asy5
        + [pt([3, 3]), pt([1, 1])]
        + pair5,
    },
}

content = {
    "meta": {
        "cohort": "Y1",
        "cohortLabel": "Year 1",
        "lesson": 20,
        "topic": "Reciprocal",
        "topicWords": "The Reciprocal Function",
        "file": "AASL_Y1_L20_Lesson_Reciprocal.html",
        "artifactTitle": "Y1 L20 The Reciprocal Function",
        "theme": "greyline",
        "t2c": {"h": "red", "k": "blue"},
        "source": "AASL/Year 1/Worksheets & Notes/TeX/AASL_Y1_L20_Worksheet_Reciprocal.tex (device mount)",
    },
    "slides": [
        {
            "type": "title",
            "eyebrow": "IB Mathematics AA SL · Year 1 · Lesson 20",
            "title": "The Reciprocal Function and its Asymptotes",
            "lede": "Online lesson — worked examples and lab",
            "code": "SL 2.8",
            "regime": "NC",
            "regimeText": "no calculator anywhere in this lesson",
        },
        ex1a,
        ex1b,
        lab_slide,
        ex2a,
        ex2b,
        ex3a,
        ex3b,
        ex4a,
        ex4b,
        ex5a,
        ex5b,
        {
            "type": "yourturn",
            "title": "Your turn",
            "sections": [
                {
                    "heading": "Now, in class",
                    "rows": [
                        {"code": "A", "q": "Q1–5", "label": "Behaviour from a table"},
                        {"code": "B", "q": "Q6–10", "label": "Reading a graph"},
                        {
                            "code": "C",
                            "q": "Q11–16",
                            "label": "Transformations of y = 1/x",
                        },
                    ],
                },
                {
                    "heading": "At home",
                    "rows": [
                        {"code": "D", "q": "Q17–21", "label": "Sketching"},
                        {
                            "code": "E",
                            "q": "Q22–25",
                            "label": "An equation from a description",
                        },
                        {"code": "F", "q": "Q26–28", "label": "Self-inverse functions"},
                    ],
                },
            ],
            "open": {
                "q": "Q29",
                "text": "Plot $y = \\dfrac{x+1}{x}$ from its table. Which two lines does it approach? "
                "Does it look like a curve you have already met, moved somewhere else? Which one, and which transformation?",
                "how": "Open question — answer it with a drawing.",
                "harvest": "Harvest: L21",
            },
        },
    ],
}

with open(sys.argv[1] if len(sys.argv) > 1 else "content.json", "w") as fh:
    json.dump(content, fh, ensure_ascii=False, indent=1)
print("content.json written")
