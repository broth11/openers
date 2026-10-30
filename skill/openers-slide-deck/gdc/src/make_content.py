"""U3 L7 GDC deck: content.json for the gdc slide type.
Screens are captures from Casio's fx-CG Manager PLUS (fx-CG50), 23/10/2026, cropped to the LCD in lcd/.
Every value in the step text comes from sympy here and was checked against the captures."""

import base64, re
import json
import os

import sympy as sp

x = sp.symbols("x")
F = -2 * x**2 + 5 * x + 12  # Y1 (teacher, 22/10/2026)
L = x + 4  # Y2, chosen here

MINUS = "−"


def cg(v):
    """fx-CG50 Norm1 display: 10 significant figures, trailing zeros dropped, real minus sign."""
    v = float(v)
    if abs(v) < 1e-12:
        return "0"
    return f"{v:.10g}".replace("-", MINUS)


# ---- verified values (each one also read off its capture) ------------------
roots = sorted(sp.solve(F, x), key=float)  # -3/2, 4    -> s10_2, s10_3
xv = sp.Rational(5, 4)
yv = F.subs(x, xv)  # maximum                           -> s12_3
assert sp.diff(F, x).subs(x, xv) == 0 and yv == sp.Rational(121, 8)
yint = F.subs(x, 0)  # 12                               -> s11_4
ints = sorted(sp.solve(sp.Eq(F, L), x), key=float)  # 1 -+ sqrt(5) -> s15_2, s15_3
assert [sp.simplify(r) for r in roots] == [sp.Rational(-3, 2), 4]
P1 = (float(ints[0]), float(L.subs(x, ints[0])))
P2 = (float(ints[1]), float(L.subs(x, ints[1])))
print("roots", roots, "max", (xv, yv), "yint", yint, "ints", P1, P2)

HERE = os.path.dirname(os.path.abspath(__file__))
def shot(name, alt):
    with open(os.path.join(HERE, "lcd", name + ".jpg"), "rb") as fh:
        src = "data:image/jpeg;base64," + base64.b64encode(fh.read()).decode()
    return {"type": "img", "src": src, "alt": alt}


LINT_TALL = ("\\int", "\\frac", "\\dfrac", "\\sum")
def lint_steps(texts):
    """Step text is parsed by gdc_slide.js: {..} = typed keys, and the HTML eats '<' + letter.
    Refuse what breaks it (errors). Tall operators only warn: on a full step column they overflow
    (--G falls to 0.6, D6 slide 5); move such maths to the stem if the build shows it. Returns the list of problems (empty = clean)."""
    bad = []
    for t in texts:
        for m in re.findall(r"\$[^$]*\$", t):
            if "{" in m or "}" in m: bad.append(f"braces in step maths: {m}")
            if "<" in m: bad.append(f"'<' in step maths (use \\lt): {m}")
            for op in LINT_TALL:
                if op in m: print(f"lint warning: {op} in step text may overflow a full slide (--G 0.6); stem is safer: {m}")
        # D7 retro (24/10/2026): the same [KEY] twice in one step gives it two order badges ("3,4"),
        # read as two presses. Allowed only as one adjacent run, e.g. "[F6] [F6]".
        chips = [(m.group(1), m.start(), m.end()) for m in re.finditer(r"\[([A-Z0-9]+)\]", t)]
        for key in {c[0] for c in chips}:
            occ = [c for c in chips if c[0] == key]
            if len(occ) > 1 and any(t[a[2]:b[1]].strip() for a, b in zip(occ, occ[1:])):
                bad.append(f"[{key}] twice in one step, not adjacent (two badges): {t}")
    return bad


def slide(nn, skill, title, steps, stem):
    _bad = lint_steps([st[0] for st in steps])
    assert not _bad, "\n".join(_bad)
    """steps: list of (text, alt); capture sNN_k is step k, sNN_0 the start screen."""
    return {
        "type": "gdc",
        "skill": skill,
        "tag": "C",
        "title": title,
        "start": shot(f"s{nn:02d}_0", "Start screen"),
        "steps": [
            {"t": t, "s": shot(f"s{nn:02d}_{k}", a)}
            for k, (t, a) in enumerate(steps, 1)
        ],
        "stem": stem,
    }


ANS = lambda t: f'<span class="ans">{t}</span>'
FN = "$y=-2x^2+5x+12$"
WIN = "Choose: $-3\\le x\\le 6$ and $-5\\le y\\le 18$."

slides = [
    {
        "type": "title",
        "eyebrow": "Grade 9 Accelerated Mathematics",
        "title": "Graphing with the GDC",
        "lede": "Calculator skills, one key at a time",
        "code": "Unit 3 · Lesson 7",
        "regime": "C",
        "regimeText": "Casio fx-CG50, Graph menu",
    },
    # ---- 1 enter and draw ----
    slide(
        2,
        1,
        "Enter the function and draw it",
        [
            ("Press [MENU]. The main menu opens.", "Main menu, Run-Matrix selected"),
            (
                "Press [5] to open Graph. The list of functions appears.",
                "Empty list of functions, Y1 to Y6",
            ),
            (
                "Type the function in Y1: [NEG] {2} [XTT] [SQR] [ADD] {5} [XTT] [ADD] {12}",
                "Y1 being typed",
            ),
            (
                "Press [EXE] to store it. The = sign of Y1 is highlighted and the cursor moves to Y2.",
                "Y1 stored, Y2 selected",
            ),
            (
                "Press [F6] (DRAW). Only two small pieces show: the window is too small.",
                "Graph in the initial window",
            ),
        ],
        f"Y1: {FN}",
    ),
    slide(
        3,
        1,
        "If the line does not say Y1",
        [
            (
                "This line says X1, not Y1: its type is X=. The curve would come out wrong.",
                "List of type X=",
            ),
            (
                "Keep the cursor on that line. Press [F3] (TYPE).",
                "TYPE menu: Y=, r=, Param, X=",
            ),
            ("Press [F1] (Y=). The line now says Y1.", "List back to type Y="),
            ("Type the function again and press [EXE].", "Y1 stored"),
            (
                "Go back to Y1. [F1] (SELECT) switches it on and off. Press it once: = is no longer highlighted, so Y1 will not be drawn.",
                "Y1 not selected",
            ),
            ("Press [F1] again: = is highlighted, so Y1 will be drawn.", "Y1 selected"),
        ],
        "Troubleshooting: look at the start of each line.",
    ),
    # ---- 2 window ----
    slide(
        4,
        2,
        "Change the window: STANDRD",
        [
            (
                "Press [SHIFT], then [F3] (V-WIN). The View Window opens.",
                "View Window, initial values",
            ),
            (
                "Press [F3] (STANDRD). Both axes now run from −10 to 10.",
                "View Window, standard values",
            ),
            ("Press [EXIT] to go back.", "List of functions"),
            (
                "Press [F6] (DRAW). Both x-intercepts show, but the top is cut off.",
                "Graph in the standard window",
            ),
        ],
        "STANDRD is a quick first look.",
    ),
    slide(
        5,
        2,
        "Type the window: x-values",
        [
            (
                "Press [SHIFT], then [F3] (V-WIN). The cursor is on Xmin.",
                "View Window, Xmin selected",
            ),
            (
                "Type {-3} and press [EXE]. Xmin is set and the cursor moves to max.",
                "Xmin −3",
            ),
            ("Type {6} and press [EXE] for Xmax.", "Xmax 6"),
            (
                "Type {1} and press [EXE] for the x scale. The cursor moves to dot.",
                "x scale 1, dot selected",
            ),
        ],
        WIN,
    ),
    slide(
        6,
        2,
        "Type the window: y-values",
        [
            ("Press [DOWN] to skip dot: the calculator works it out.", "Ymin selected"),
            ("Type {-5} and press [EXE] for Ymin.", "Ymin −5"),
            ("Type {18} and press [EXE] for Ymax.", "Ymax 18"),
            ("Type {2} and press [EXE] for the y scale.", "y scale 2"),
            ("Press [EXIT].", "List of functions"),
            (
                "Press [F6] (DRAW). The top and both x-intercepts are on the screen.",
                "Graph in the typed window",
            ),
        ],
        WIN,
    ),
    # ---- 3 zoom ----
    slide(
        7,
        3,
        "Zoom out",
        [
            ("Press [SHIFT], then [F2] (ZOOM).", "ZOOM menu"),
            (
                "Press [F4] (OUT). A pointer appears in the middle.",
                "Select center position",
            ),
            (
                "Press [EXE]. Each axis now covers twice as much: the whole top shows, but the curve is small.",
                "Zoomed out",
            ),
        ],
        "Start from the standard window.",
    ),
    slide(
        8,
        3,
        "Zoom in",
        [
            ("Press [SHIFT], then [F2] (ZOOM).", "ZOOM menu"),
            (
                "Press [F3] (IN). The pointer appears in the middle.",
                "Select center position",
            ),
            (
                "Use [RIGHT] and [UP] to move the pointer to about (1, 8).",
                "Pointer near (1, 8)",
            ),
            (
                "Press [EXE]. The graph is redrawn twice as large around that point.",
                "Zoomed in",
            ),
        ],
        "The pointer marks the centre of the new window.",
    ),
    slide(
        9,
        3,
        "Zoom box",
        [
            ("Press [SHIFT], then [F2] (ZOOM).", "ZOOM menu"),
            ("Press [F1] (BOX). A cursor appears.", "Select range start point"),
            (
                "Use the arrow keys to move it to one corner, about (0, 13).",
                "Cursor near (0, 13)",
            ),
            ("Press [EXE] to fix that corner.", "Select range end point"),
            (
                "Move to the opposite corner, about (2.5, 16.5). A box follows the cursor.",
                "Box drawn",
            ),
            (
                "Press [EXE]. Only the boxed part, the top of the curve, fills the screen.",
                "Boxed part enlarged",
            ),
        ],
        "Draw a box round the part you want to see.",
    ),
    # ---- 4 intercepts ----
    slide(
        10,
        4,
        "The x-intercepts",
        [
            ("Press [F5] (G-SOLV).", "G-Solv menu"),
            ("Press [F1] (ROOT). The first x-intercept appears.", "ROOT, first root"),
            ("Press [RIGHT] for the next one.", "ROOT, second root"),
            (
                "The x-intercepts are "
                + ANS(f"({cg(roots[0])}, 0) and ({cg(roots[1])}, 0)")
                + ".",
                "ROOT, second root",
            ),
        ],
        f"{FN}, window from Skill 2.",
    ),
    slide(
        11,
        4,
        "The y-intercept",
        [
            (
                "Press [EXIT] to leave ROOT. The list of functions shows.",
                "List of functions",
            ),
            ("Press [F6] (DRAW).", "Graph in the typed window"),
            ("Press [F5] (G-SOLV).", "G-Solv menu"),
            ("Press [F4] (Y-ICEPT).", "Y-ICEPT"),
            ("The y-intercept is " + ANS(f"(0, {cg(yint)})") + ".", "Y-ICEPT"),
        ],
        f"{FN}, window from Skill 2.",
    ),
    # ---- 5 max / min ----
    slide(
        12,
        5,
        "The maximum",
        [
            (
                "The curve opens down, so its top point is a maximum.",
                "Graph in the typed window",
            ),
            ("Press [F5] (G-SOLV).", "G-Solv menu"),
            ("Press [F2] (MAX). The cursor jumps to the highest point.", "MAX"),
            (
                "The maximum is "
                + ANS(cg(yv))
                + ", at "
                + ANS(f"({cg(xv)}, {cg(yv)})")
                + ".",
                "MAX",
            ),
        ],
        f"{FN}, window from Skill 2.",
    ),
    slide(
        13,
        5,
        "When there is no minimum",
        [
            ("Press [EXIT], [F6] (DRAW), then [F5] (G-SOLV).", "G-Solv menu"),
            ("Press [F3] (MIN). The calculator finds no lowest point.", "Not Found"),
            ("Opens down: a maximum only. Opens up: a minimum only.", "Not Found"),
            ("A line goes on for ever both ways: no maximum, no minimum.", "Not Found"),
        ],
        "What does MIN do here?",
    ),
    # ---- 6 line and intersections ----
    slide(
        14,
        6,
        "Add a line",
        [
            ("Press [EXIT] until the list of functions shows.", "List of functions"),
            ("Press [DOWN] to Y2 and type the line: [XTT] [ADD] {4}", "Y2 being typed"),
            ("Press [EXE] to store it.", "Y1 and Y2 stored"),
            ("Press [F6] (DRAW). Count the meeting points: two.", "Curve and line"),
        ],
        "Y2: $y=x+4$",
    ),
    slide(
        15,
        6,
        "Where the graphs meet",
        [
            ("Press [F5] (G-SOLV).", "G-Solv menu"),
            (
                "Press [F5] (INTSECT). The first meeting point appears.",
                "INTSECT, first point",
            ),
            ("Press [RIGHT] for the second one.", "INTSECT, second point"),
            (
                "To 3 s.f., the graphs meet at "
                + ANS(
                    f"({P1[0]:.3g}, {P1[1]:.3g}) and ({P2[0]:.3g}, {P2[1]:.3g})"
                ).replace("-", MINUS)
                + ".",
                "INTSECT, second point",
            ),
        ],
        f"{FN} and $y=x+4$",
    ),
    {
        "type": "yourturn",
        "title": "Your turn",
        "sections": [
            {
                "heading": "Now, on your calculator",
                "rows": [
                    {
                        "code": "A",
                        "q": "",
                        "label": "Enter $y=x^2-2x-6$ and choose a window that shows its vertex and both $x$-intercepts.",
                    },
                    {
                        "code": "B",
                        "q": "",
                        "label": "Find its $x$-intercepts, its $y$-intercept and its minimum.",
                    },
                    {
                        "code": "C",
                        "q": "",
                        "label": "Add $y=-x+2$ and find where the two graphs meet.",
                    },
                ],
            }
        ],
    },
]

# Your turn answers, for the teacher only (not on the slides)
Q, M = x**2 - 2 * x - 6, -x + 2
print(
    "your turn:",
    [cg(r) for r in sorted(sp.solve(Q, x), key=float)],
    "yint",
    Q.subs(x, 0),
    "min",
    (1, Q.subs(x, 1)),
    "meet",
    [(cg(r), cg(M.subs(x, r))) for r in sorted(sp.solve(sp.Eq(Q, M), x), key=float)],
)

content = {
    "meta": {
        "cohort": "G9X",
        "theme": "skyblue",
        "cohortLabel": "Grade 9 Accelerated",
        "lesson": 7,
        "topic": "GDCGraphing",
        "topicWords": "Graphing with the GDC",
        "file": "U3_L7_Lesson_GDCGraphing.html",
        "artifactTitle": "G9X U3 L7 Graphing with the GDC",
        "source": "Teacher request 22/10/2026; screens captured from fx-CG Manager PLUS (fx-CG50) 23/10/2026",
    },
    "slides": slides,
}
with open(os.path.join(HERE, "content.json"), "w") as fh:
    json.dump(content, fh, ensure_ascii=False, indent=1)
print("slides", len(slides))
