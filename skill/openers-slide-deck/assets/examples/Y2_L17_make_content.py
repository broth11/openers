import json, math
r4 = lambda v: round(v, 4)
def mid(P, Q): return [r4((P[0]+Q[0])/2), r4((P[1]+Q[1])/2)]
def add(P, v, t=1): return [r4(P[0]+t*v[0]), r4(P[1]+t*v[1])]
VI = '#B189C6'
def vi(t): return '\\textcolor{'+VI+'}{'+t+'}'
def gdc(s): return {"text": s}
def seg(P, Q, **k): d = {"kind": "segment", "from": P, "to": Q}; d.update(k); return d
def lab(at, t, a='c', **k): d = {"kind": "label", "at": at, "tex": t, "anchor": a}; d.update(k); return d
def pt(at, name=None, a='ne', **k):
    d = {"kind": "point", "at": at}
    if name: d.update(label=name, anchor=a)
    d.update(k); return d
def ang(O, P, Q, **k): d = {"kind": "angle", "O": O, "P": P, "Q": Q}; d.update(k); return d
def poly(pts, **k): d = {"kind": "polygon", "pts": pts}; d.update(k); return d
def arcpts(c, a, b, t0, t1, n=32): return [[r4(c[0]+a*math.cos(t0+(t1-t0)*i/n)), r4(c[1]+b*math.sin(t0+(t1-t0)*i/n))] for i in range(n+1)]
def ell(c, a, b, t0, t1, n=32, **k): d = {"kind": "path", "pts": arcpts(c, a, b, t0, t1, n)}; d.update(k); return d
def sq(xmin, ymin, size): return {"xmin": xmin, "xmax": xmin+size, "ymin": ymin, "ymax": ymin+size, "plain": True}
PI = math.pi
CX, CY = 0.5*math.cos(PI/6), 0.5*math.sin(PI/6)      # oblique depth, as in the cuboidAngle lab

# ---------- Example 1 : cone r 5, h 12, point down; hemisphere r 5 on top
k1 = 0.34; r1 = 5*k1; e1 = 0.3*r1
O1 = [0, 0]; V1 = [0, r4(-12*k1)]; R1 = [r4(r1), 0]; Lm = [r4(-r1), 0]
solid1 = [ell(O1, r1, e1, PI, 2*PI), ell(O1, r1, e1, 0, PI, dashed=True), ell(O1, r1, r1, 0, PI),
          seg(Lm, V1), seg(R1, V1), seg(V1, O1, dashed=True), seg(O1, R1, dashed=True),
          pt(O1, 'O', 'nw'), pt(V1, 'V', 's'), lab(R1, 'R', 'e'), lab(mid(O1, R1), '5', 'n'), lab([0, r4(-6*k1)], '12', 'w')]
W1 = sq(-3.2, -5.4, 10.4)
Of = [3.4, 0]; Rf = [r4(3.4+r1), 0]; Vf = [3.4, r4(-12*k1)]
flat1 = [poly([Of, Rf, Vf], step=1), seg(Of, Rf, step=1), seg(Of, Vf, step=1), seg(Vf, Rf, answer=True, step=1), ang(Of, Vf, Rf, step=1),
         lab(mid(Of, Rf), '5', 'n', step=1), lab(mid(Of, Vf), '12', 'w', step=1), lab(Of, 'O', 'nw', step=1), lab(Rf, 'R', 'ne', step=1), lab(Vf, 'V', 's', step=1),
         lab(mid(Vf, Rf), 'l', 'e', step=1, until=1), lab(mid(Vf, Rf), '\\bl{l = 13}', 'e', step=2)]
stem1 = "A solid is made of a cone of radius $5$ cm and height $12$ cm, point down, with a hemisphere of the same radius on top. Find its volume and its total surface area."
ex1a = {"type": "example", "n": 1, "tag": "C", "title": "The surface of a composite solid", "stem": stem1,
  "blocks": [{"text": "The surface is the cone's curved surface and the hemisphere's curved surface — the flat disc of the hemisphere is glued to the mouth of the cone and is not on the list. The cone's surface needs its slant height first:"},
             {"steps": [{"tex": "l^{2} &= 5^{2} + 12^{2} = 169, \\quad l = \\bl{13}"}]}],
  "graph": {"window": W1, "items": solid1 + [seg(V1, R1, answer=True, step=1)] + flat1}}
dome = arcpts(O1, r1, r1, 0, PI); conef = [Lm, V1, R1] + arcpts(O1, r1, e1, 0, -PI)[1:-1]
ex1b = {"type": "example", "n": 1, "tag": "C", "title": "…its volume and surface area", "stem": stem1,
  "blocks": [{"steps": [{"tex": "V &= \\tfrac{2}{3}\\pi (5)^{3} + \\tfrac{1}{3}\\pi (5)^{2}(12)"}, {"tex": "&= \\tfrac{250}{3}\\pi + 100\\pi = \\tfrac{550}{3}\\pi"},
                        {"tex": "V &= \\bl{576 \\text{ cm}^{3}}"},
                        {"tex": "A &= 2\\pi r^{2} + \\pi r l = 50\\pi + 65\\pi = 115\\pi"},
                        {"tex": "A &= \\bl{361 \\text{ cm}^{2}}"}]},
             gdc("GDC: $550\\pi \\div 3$ → $575.95\\ldots$ and $115\\pi$ → $361.28\\ldots$; write $V = 576$ cm³ and $A = 361$ cm².")],
  "graph": {"window": W1, "items": solid1 + [lab(mid(V1, R1), 'l = 13', 'e'),
     poly(dome + [Lm], step=4), poly([Lm, V1, R1], step=4), lab([r4(-r1-0.1), r4(r1*0.6)], '2\\pi r^{2}', 'w', step=4), lab([r4(-r1*0.6), r4(-6*k1)], '\\pi r l', 'w', step=4)]}}

# ---------- Example 2 : cylinder r 4 (h = 18) and sphere r 6
k2 = 0.3; rc = 4*k2; ec = 0.3*rc; hc = 18*k2
B2 = [0, -3.2]; T2 = [0, r4(-3.2+hc)]
cyl = [ell(B2, rc, ec, PI, 2*PI), ell(B2, rc, ec, 0, PI, dashed=True), ell(T2, rc, ec, 0, 2*PI, 64),
       seg([-rc, B2[1]], [-rc, T2[1]]), seg([rc, B2[1]], [rc, T2[1]]), seg(T2, [r4(rc), T2[1]], dashed=True), pt(T2),
       lab([r4(rc+0.15), r4(T2[1]+0.25)], '4', 'ne')]
Sc = [4.6, -0.6]; rs = 6*k2
sph = [ell(Sc, rs, rs, 0, 2*PI, 72), ell(Sc, rs, 0.3*rs, PI, 2*PI), ell(Sc, rs, 0.3*rs, 0, PI, dashed=True),
       seg(Sc, [r4(Sc[0]+rs), Sc[1]], dashed=True), pt(Sc), lab(mid(Sc, [Sc[0]+rs, Sc[1]]), '6', 'n')]
W2 = sq(-2.6, -5.2, 10.4)
stem2 = "A solid cylinder of radius $4$ cm has the same volume as a sphere of radius $6$ cm. Find the height of the cylinder, then its total surface area."
hl = [-rc, r4(B2[1]+hc/2)]
ex2a = {"type": "example", "n": 2, "tag": "C", "title": "A length from a volume", "stem": stem2,
  "blocks": [{"steps": [{"tex": "\\pi (4)^{2} h &= \\tfrac{4}{3}\\pi (6)^{3}"}, {"tex": "\\therefore\\quad 16\\pi h &= 288\\pi"},
                        {"tex": "\\therefore\\quad h &= \\bl{18 \\text{ cm}}"}]}],
  "graph": {"window": W2, "items": cyl + sph + [lab(hl, 'h', 'w', until=2), lab(hl, '\\bl{h = 18}', 'w', step=3)]}}
ex2b = {"type": "example", "n": 2, "tag": "C", "title": "…its total surface area", "stem": stem2,
  "blocks": [{"steps": [{"tex": "A &= 2\\pi r^{2} + 2\\pi r h = 2\\pi(16) + 2\\pi(4)(18)"},
                        {"tex": "&= 32\\pi + 144\\pi = 176\\pi = \\bl{553 \\text{ cm}^{2}}"}]},
             gdc("GDC: $176\\pi$ → $552.92\\ldots$; write $A = 553$ cm².")],
  "graph": {"window": W2, "items": cyl + sph + [lab(hl, 'h = 18', 'w'),
     poly([[-rc, B2[1]], [rc, B2[1]], [rc, T2[1]], [-rc, T2[1]]], step=1)]}}

# ---------- cuboid in oblique view (same projection as the lab)
def cuboid(O, k, l, d, h):
    P = lambda i, j, u: [r4(O[0] + (i*l + j*d*CX)*k), r4(O[1] + (j*d*CY + u*h)*k)]
    return {n: P(*c) for n, c in zip('ABCDEFGH', [(0,0,0),(1,0,0),(1,1,0),(0,1,0),(0,0,1),(1,0,1),(1,1,1),(0,1,1)])}
k3 = 0.4; Q = cuboid([-0.4, 0.6], k3, 12, 8, 5)
box3 = [seg(Q[a], Q[b]) for a, b in ['AB', 'BC', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG']] + \
       [seg(Q[a], Q[b], dashed=True) for a, b in ['DA', 'DC', 'DH']] + \
       [poly([Q['A'], Q['H'], Q['G']]), seg(Q['A'], Q['H'], answer=True), seg(Q['A'], Q['G'], answer=True),
        lab(Q['A'], 'A', 'sw'), lab(Q['B'], 'B', 'se'), lab(Q['C'], 'C', 'e'),
        lab(Q['E'], 'E', 'w'), lab(Q['F'], 'F', 'se'), lab(Q['G'], 'G', 'ne'), lab(Q['H'], 'H', 'n'),
        lab(mid(Q['A'], Q['B']), '12', 's'), lab(mid(Q['B'], Q['C']), '8', 'se'), lab(mid(Q['A'], Q['E']), '5', 'w')]
W3 = sq(-1.8, -6.0, 10.4)
stem3 = "A cuboid $ABCDEFGH$ is $12$ cm long, $8$ cm deep and $5$ cm tall. Find the angle between the diagonal $AH$ of the left-hand face and the space diagonal $AG$."
kf3 = 0.4; Af = [0.6, -5.0]; Df = [r4(0.6+8*kf3), -5.0]; Hf = [Df[0], r4(-5.0+5*kf3)]
ex3a = {"type": "example", "n": 3, "tag": "C", "title": "The angle between two lines", "stem": stem3,
  "blocks": [{"text": "$HG$ is parallel to $AB$, so it is perpendicular to the whole left-hand face $ADHE$ and to every line in it: triangle $AHG$ is right-angled at $H$. $AH$ comes first, from the left-hand face, where the right angle is at $D$."},
             {"steps": [{"tex": "AH^{2} &= 8^{2} + 5^{2} = " + vi("89")}]}],
  "graph": {"window": W3, "items": box3 + [
     poly([Af, Df, Hf], step=1), seg(Af, Df, step=1), seg(Df, Hf, step=1), seg(Af, Hf, answer=True, step=1), ang(Df, Hf, Af, step=1),
     lab(mid(Af, Df), '8', 's', step=1), lab(mid(Df, Hf), '5', 'e', step=1), lab(Af, 'A', 'sw', step=1), lab(Df, 'D', 'se', step=1), lab(Hf, 'H', 'ne', step=1),
     lab(mid(Af, Hf), 'AH', 'nw', step=1, until=1), lab(mid(Af, Hf), vi('\\sqrt{89}'), 'nw', step=2)]}}
kg = 0.36; AH = math.sqrt(89)
Hg = [0.4, -1.9]; Gg = [r4(0.4+12*kg), -1.9]; Ag = [0.4, r4(-1.9-AH*kg)]
def bis(O, P, Q, r):
    u = [P[0]-O[0], P[1]-O[1]]; v = [Q[0]-O[0], Q[1]-O[1]]; lu, lv = math.hypot(*u), math.hypot(*v)
    x, y = u[0]/lu+v[0]/lv, u[1]/lu+v[1]/lv; L = math.hypot(x, y); return [r4(O[0]+r*x/L), r4(O[1]+r*y/L)]
ex3b = {"type": "example", "n": 3, "tag": "C", "title": "…the angle θ", "stem": stem3,
  "blocks": [{"steps": [{"tex": "\\tan\\theta &= \\frac{HG}{AH} = \\frac{12}{" + vi("\\sqrt{89}") + "}"}, {"tex": "\\theta &= \\bl{51.8^{\\circ}}"}]},
             gdc("GDC (Deg): $\\tan^{-1}(12 \\div \\sqrt{89})$ → $51.826\\ldots$; write $\\theta = 51.8^{\\circ}$.")],
  "graph": {"window": W3, "items": box3 + [
     poly([Hg, Gg, Ag]), seg(Hg, Gg), seg(Hg, Ag, color=VI), seg(Ag, Gg, answer=True), ang(Hg, Gg, Ag), ang(Ag, Hg, Gg),
     lab(bis(Ag, Hg, Gg, 0.95), '\\theta', 'c'), lab(mid(Hg, Gg), '12', 'n'), lab(mid(Hg, Ag), vi('\\sqrt{89}'), 'w'),
     lab(Hg, 'H', 'nw'), lab(Gg, 'G', 'ne'), lab(Ag, 'A', 'sw')]}}
# drop the plain θ label once the value is shown
ex3b["graph"]["items"] = [it for it in ex3b["graph"]["items"] if it.get("tex") != '\\theta'] + [lab(bis(Ag, Hg, Gg, 0.95), '\\theta', 'c')]

# ---------- Example 4 : right pyramid on 8 x 6 base, VM = 7
k4 = 0.5; A4 = [-0.8, -0.4]
def bp(i, j): return [r4(A4[0] + (i*8 + j*6*0.42)*k4), r4(A4[1] + j*6*0.36*k4)]
B4, C4, D4 = bp(1, 0), bp(1, 1), bp(0, 1); M4 = mid(A4, C4); V4 = [M4[0], r4(M4[1] + 7*k4)]
pyr = [seg(A4, B4), seg(B4, C4), seg(D4, A4, dashed=True), seg(D4, C4, dashed=True),
       seg(V4, B4), seg(V4, C4), seg(V4, D4, dashed=True), seg(V4, A4, answer=True),
       seg(V4, M4, dashed=True), pt(M4), lab(A4, 'A', 'sw'), lab(B4, 'B', 's'), lab(C4, 'C', 'e'), lab(V4, 'V', 'n'),
       lab(M4, 'M', 'se'), lab(mid(A4, B4), '8', 's'), lab(mid(B4, C4), '6', 'se')]
W4 = sq(-1.8, -5.6, 10.4)
stem4 = "A right pyramid $VABCD$ stands on a rectangular base $8$ cm by $6$ cm. Its apex is $7$ cm above the centre $M$ of the base. Find the angle between the edge $VA$ and the base."
kf = 0.4; Ab = [0.4, -4.5]; Bb = [r4(0.4+8*kf), -4.5]; Cb = [Bb[0], r4(-4.5+6*kf)]; Mb = mid(Ab, Cb)
ex4a = {"type": "example", "n": 4, "tag": "C", "title": "The angle between a line and a plane", "stem": stem4,
  "blocks": [{"text": "The foot of the perpendicular from $V$ is $M$, the middle of the diagonal $AC$; the projection of $VA$ is $AM$, half of that diagonal."},
             {"steps": [{"tex": "AC^{2} &= 8^{2} + 6^{2} = 100, \\quad AC = 10, \\quad AM = " + vi("5")}]}],
  "graph": {"window": W4, "items": pyr + [seg(A4, C4, dashed=True, step=1), seg(A4, M4, color=VI, step=2),
     poly([Ab, Bb, Cb], step=1), seg(Ab, Bb, step=1), seg(Bb, Cb, step=1), seg(Ab, Cb, answer=True, step=1), ang(Bb, Cb, Ab, step=1),
     lab(mid(Ab, Bb), '8', 's', step=1), lab(mid(Bb, Cb), '6', 'e', step=1), lab(Ab, 'A', 'sw', step=1), lab(Bb, 'B', 'se', step=1), lab(Cb, 'C', 'ne', step=1),
     lab(mid(Ab, Mb), 'AC', 'nw', step=1, until=1), lab(mid(Ab, Mb), 'AC = 10', 'nw', step=2), pt(Mb, step=2), lab(Mb, vi('M'), 'se', step=2)]}}
kv = 0.42; Am = [1.0, -4.5]; Mm = [r4(1.0+5*kv), -4.5]; Vm = [Mm[0], r4(-4.5+7*kv)]
ex4b = {"type": "example", "n": 4, "tag": "C", "title": "…the angle α", "stem": stem4,
  "blocks": [{"steps": [{"tex": "\\tan\\alpha &= \\frac{VM}{AM} = \\frac{7}{" + vi("5") + "}"}, {"tex": "\\alpha &= \\bl{54.5^{\\circ}}"}]},
             gdc("GDC (Deg): $\\tan^{-1}(7 \\div 5)$ → $54.462\\ldots$; write $\\alpha = 54.5^{\\circ}$.")],
  "graph": {"window": W4, "items": pyr + [seg(A4, C4, dashed=True), seg(A4, M4, color=VI), poly([A4, M4, V4]),
     poly([Am, Mm, Vm]), seg(Am, Mm, color=VI), seg(Mm, Vm), seg(Am, Vm, answer=True), ang(Mm, Vm, Am), ang(Am, Mm, Vm),
     lab(mid(Am, Mm), vi('5'), 's'), lab(mid(Mm, Vm), '7', 'e'), lab(Am, 'A', 'sw'), lab(Mm, 'M', 'se'), lab(Vm, 'V', 'n'),
     lab(bis(Am, Mm, Vm, 0.95), '\\alpha', 'c')]}}

lab_solid = {"type": "lab", "preset": "solidSection", "title": "The flat triangle inside a solid", "controlScale": 1.2,
  "init": {"window": {"xmin": -1.6, "xmax": 19.4, "ymin": -5.2, "ymax": 15.8, "plain": True}, "k": 0.34, "O": [4.2, 1.2], "T": [11.4, 1.2],
           "solid": "cone", "cone": {"r": 8, "h": 15}, "pyramid": {"a": 14, "h": 24}, "rRange": [2, 12, 1], "aRange": [2, 24, 2], "hRange": [2, 24, 1]}}
lab_cub = {"type": "lab", "preset": "cuboidAngle", "title": "The angle inside a box", "controlScale": 1.2,
  "init": {"window": {"xmin": -2.2, "xmax": 16.4, "ymin": -5.8, "ymax": 12.8, "plain": True}, "k": 0.44, "O": [0.2, 0], "T": [8.4, 0],
           "mode": "two lines", "l": 9, "d": 6, "h": 4, "lRange": [2, 10, 1], "dRange": [2, 10, 1], "hRange": [2, 10, 1]}}
content = {"meta": {"cohort": "Y2", "cohortLabel": "Year 2", "lesson": 17, "topic": "CompositeSolidsAndAngles",
   "topicWords": "Composite Solids and Angles in Space",
   "file": "AASL_Y2_L17_Lesson_CompositeSolidsAndAngles.html", "artifactTitle": "Y2 L17 Composite Solids and Angles",
   "source": "AASL_Y2_L17_Worksheet_CompositeSolidsAndAngles.tex (device mount AASL/Year 2/Worksheets & Notes/TeX)"},
 "slides": [
  {"type": "title", "eyebrow": "IB Mathematics AA SL · Year 2 · Lesson 17", "title": "Composite Solids and Angles in Space",
   "lede": "Online lesson — worked examples and lab", "code": "SL 3.1", "regime": "C", "regimeText": "GDC in degree mode for every example"},
  lab_solid, ex1a, ex1b, ex2a, ex2b, lab_cub, ex3a, ex3b, ex4a, ex4b,
  {"type": "yourturn", "title": "Your turn",
   "sections": [{"heading": "Now, in class", "rows": [
      {"code": "C", "q": "Q13–17", "label": "The angle between two lines", "time": "12 min"},
      {"code": "D", "q": "Q18–23", "label": "The angle between a line and a plane", "time": "15 min"}]},
     {"heading": "At home", "rows": [
      {"code": "A", "q": "Q1–6", "label": "Composite solids", "time": "20 min"},
      {"code": "B", "q": "Q7–12", "label": "Working backwards", "time": "20 min"},
      {"code": "E", "q": "Q24–27", "label": "The whole chain", "time": "30 min"}]}],
   "open": {"q": "Q28", "text": "A space diagonal of a cube makes the same angle with the base, with the front face and with a side face. Find that angle. Then: is there any line through a corner of a box that makes $45^{\\circ}$ with all three faces at that corner? With two of them?",
     "how": "Open question — answer it with a drawing."}}]}
json.dump(content, open('content.json', 'w'), ensure_ascii=False, indent=1)
print('ok')
