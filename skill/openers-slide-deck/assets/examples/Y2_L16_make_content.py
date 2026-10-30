import json, math
r4 = lambda v: round(v, 4)
def mid(P, Q): return [r4((P[0]+Q[0])/2), r4((P[1]+Q[1])/2)]
def add(P, v, t=1): return [r4(P[0]+t*v[0]), r4(P[1]+t*v[1])]
VI = '#B189C6'
def vi(t): return '\\textcolor{'+VI+'}{'+t+'}'
def gdc(s): return {"text": "GDC: " + s}
def seg(P, Q, **k): d = {"kind": "segment", "from": P, "to": Q}; d.update(k); return d
def lab(at, t, a='c', **k): d = {"kind": "label", "at": at, "tex": t, "anchor": a}; d.update(k); return d
def pt(at, name=None, a='ne', **k):
    d = {"kind": "point", "at": at}
    if name: d.update(label=name, anchor=a)
    d.update(k); return d
def ang(O, P, Q, **k): d = {"kind": "angle", "O": O, "P": P, "Q": Q}; d.update(k); return d
def ell(c, a, b, t0, t1, n=32, **k):
    pts = [[r4(c[0]+a*math.cos(t0+(t1-t0)*i/n)), r4(c[1]+b*math.sin(t0+(t1-t0)*i/n))] for i in range(n+1)]
    d = {"kind": "path", "pts": pts}; d.update(k); return d

# ---------- Example 1 : cuboid 20 x 15 x 10, oblique (depth at 30 deg, half scale)
s = 0.28
ex_, dep = [20*s, 0], [0.5*15*s*math.cos(math.pi/6), 0.5*15*s*math.sin(math.pi/6)]
A = [0, 0.8]; B = add(A, ex_); C = add(B, dep); D = add(A, dep)
up = [0, 10*s]; E, F, G, Hh = add(A, up), add(B, up), add(C, up), add(D, up)
box = [seg(A, B), seg(B, C), seg(E, F), seg(F, G), seg(G, Hh), seg(Hh, E), seg(A, E), seg(B, F), seg(C, G),
       seg(D, A, dashed=True), seg(D, C, dashed=True), seg(D, Hh, dashed=True),
       lab(mid(A, B), '20\\text{ m}', 's'), lab(mid(B, C), '15\\text{ m}', 'se'), lab(mid(A, E), '10\\text{ m}', 'w'),
       pt(A, 'A', 'sw'), pt(B, 'B', 's'), pt(C, 'C', 'e'), pt(G, 'G', 'ne')]
W1 = {"xmin": -1.8, "xmax": 9.2, "ymin": -6.2, "ymax": 4.8, "plain": True}
stem1 = "A storage room is $20$ m long, $15$ m wide and $10$ m high. Find the length of the longest straight pole that will fit inside it."
a1, b1, c1 = [0, -5.4], [20*s, -5.4], [20*s, -5.4+15*s]
ex1a = {"type": "example", "n": 1, "tag": "C", "title": "A length across a box", "stem": stem1,
  "blocks": [{"steps": [{"tex": "AC^{2} &= 20^{2} + 15^{2} = 625"}, {"tex": "AC &= " + vi("25") + " \\text{ m}"}]}],
  "graph": {"window": W1, "items": box + [seg(A, C, dashed=True, step=1),
     {"kind": "polygon", "pts": [a1, b1, c1], "step": 1}, seg(a1, b1, step=1), seg(b1, c1, step=1), seg(a1, c1, step=1),
     ang(b1, c1, a1, step=1), lab(mid(a1, b1), '20', 's', step=1), lab(mid(b1, c1), '15', 'e', step=1),
     lab(mid(a1, c1), 'AC', 'nw', step=1), lab(a1, 'A', 'w', step=1), lab(b1, 'B', 'se', step=1), lab(c1, 'C', 'ne', step=1),
     lab(mid(a1, c1), vi('AC = 25'), 'nw', step=2)]}}
# the label AC is replaced by AC = 25 at step 2: keep one label only
ex1a["graph"]["items"] = [it for it in ex1a["graph"]["items"] if it.get("tex") != "AC"]
ex1a["graph"]["items"].append(lab(mid(a1, c1), 'AC', 'nw', step=1, until=1))
a2, c2, g2 = [0, -5.0], [25*s, -5.0], [25*s, -5.0+10*s]
ex1b = {"type": "example", "n": 1, "tag": "C", "title": "…the space diagonal", "stem": stem1,
  "blocks": [{"steps": [{"tex": "AG^{2} &= " + vi("AC") + "^{2} + CG^{2} = 625 + 10^{2}"}, {"tex": "AG^{2} &= 725"}, {"tex": "AG &= \\bl{26.9 \\text{ m}}"}]},
             gdc("$\\sqrt{725}$ → $26.925\\ldots$; write $AG = 26.9$ m.")],
  "graph": {"window": W1, "items": box + [seg(A, C, dashed=True, color=VI), seg(A, G, answer=True),
     {"kind": "polygon", "pts": [a2, c2, g2]}, seg(a2, c2, color=VI), seg(c2, g2), seg(a2, g2, answer=True),
     ang(c2, g2, a2), lab(mid(a2, c2), vi('25'), 's'), lab(mid(c2, g2), '10', 'e'),
     lab(a2, 'A', 'w'), lab(c2, 'C', 'se'), lab(g2, 'G', 'ne'),
     lab(mid(a2, g2), 'AG', 'nw', until=2), lab(mid(a2, g2), '\\bl{26.9}', 'nw', step=3)]}}

# ---------- Example 2 : coordinates in an oblique view (x towards the viewer, y right, z up)
k2 = 0.72
def pr(x, y, z): return [r4(k2*(y - 0.75*x)), r4(k2*(z - 0.4*x))]
O3 = pr(0, 0, 0)
axes = [seg(O3, pr(5.2, 0, 0), color="grey"), seg(O3, pr(0, 5.2, 0), color="grey"), seg(O3, pr(0, 0, 6.3), color="grey"),
        seg(O3, pr(-1.8, 0, 0), color="grey", dashed=True), seg(O3, pr(0, -2.2, 0), color="grey", dashed=True),
        lab(pr(5.2, 0, 0), 'x', 'sw'), lab(pr(0, 5.2, 0), 'y', 'e'), lab(pr(0, 0, 6.3), 'z', 'n'), lab(O3, 'O', 'se')]
P3, Q3, R3, M3 = pr(-1, 3, 5), pr(5, -1, 2), pr(5, -1, 5), pr(2, 1, 3.5)
fig2 = axes + [seg(P3, pr(-1, 3, 0), dashed=True), seg(Q3, pr(5, -1, 0), dashed=True), seg(pr(-1, 3, 0), pr(5, -1, 0), dashed=True),
        seg(P3, Q3, answer=True), pt(P3, 'P', 'n'), pt(Q3, 'Q', 'w')]
W2 = {"xmin": -5.4, "xmax": 5.6, "ymin": -7.0, "ymax": 4.8, "plain": True}
W2["xmax"] = W2["xmin"] + (W2["ymax"] - W2["ymin"])
stem2 = "$P$ is the point $(-1,\\,3,\\,5)$ and $Q$ is the point $(5,\\,-1,\\,2)$. Find the distance $PQ$ and the coordinates of the midpoint $M$ of $[PQ]$."
kf = 0.62; Rf = [-1.2, -4.4]; Pf = [r4(Rf[0] + kf*math.sqrt(52)), Rf[1]]; Qf = [Rf[0], r4(Rf[1] - 3*kf)]   # R top left, P top right, Q bottom left (teacher, 29/09)
ex2a = {"type": "example", "n": 2, "tag": "C", "title": "Distance and midpoint from coordinates", "stem": stem2,
  "blocks": [{"steps": [{"tex": "PQ &= \\sqrt{(5-(-1))^{2} + (-1-3)^{2} + (2-5)^{2}}"}, {"tex": "PQ &= \\sqrt{36 + 16 + 9} = \\sqrt{61}"},
                        {"tex": "PQ &= \\bl{7.81}"}]},
             gdc("$\\sqrt{61}$ → $7.8102\\ldots$; write $PQ = \\sqrt{61} = 7.81$.")],
  "graph": {"window": W2, "items": fig2 + [
     seg(P3, R3, dashed=True, step=1), seg(R3, Q3, dashed=True, step=1), pt(R3, 'R', 'w', step=1),
     {"kind": "polygon", "pts": [Pf, Rf, Qf], "step": 1}, seg(Pf, Rf, step=1), seg(Rf, Qf, step=1), seg(Pf, Qf, answer=True, step=1),
     ang(Rf, Qf, Pf, step=1), lab(mid(Pf, Rf), '\\sqrt{36+16}', 'n', step=1), lab(mid(Rf, Qf), '3', 'w', step=1),
     lab(Pf, 'P', 'e', step=1), lab(Rf, 'R', 'nw', step=1), lab(Qf, 'Q', 'sw', step=1),
     lab(mid(Pf, Qf), '\\sqrt{61}', 'se', step=2)]}}
ex2b = {"type": "example", "n": 2, "tag": "C", "title": "…the midpoint", "stem": stem2,
  "blocks": [{"steps": [{"tex": "M &= \\left(\\frac{-1+5}{2},\\ \\frac{3+(-1)}{2},\\ \\frac{5+2}{2}\\right)"},
                        {"tex": "M &= \\bl{(2,\\,1,\\,3.5)}"}]}],
  "graph": {"window": W2, "items": fig2 + [pt(M3, step=1), lab(M3, 'M', 'se', step=1, until=1), lab(M3, '\\bl{M(2,\\,1,\\,3.5)}', 'se', step=2)]}}

# ---------- Example 3 : cone, r = 8, h = 15, l = 17
k3 = 0.36; O = [0, 0]; rr = 8*k3; V = [0, 15*k3]; Rr = [rr, 0]
W3 = {"xmin": -3.8, "xmax": 8.6, "ymin": -3.2, "ymax": 9.2, "plain": True}
W3["ymax"] = W3["ymin"] + (W3["xmax"] - W3["xmin"])
Of = [4.4, 0]; Rf3 = [4.4 + rr, 0]; Vf = [4.4, 15*k3]
ex3 = {"type": "example", "n": 3, "tag": "C", "title": "A cone, from its diameter and slant height",
  "stem": "A cone has base <strong>diameter</strong> $16$ cm and slant height $17$ cm. Find its volume.",
  "blocks": [{"steps": [{"tex": "r &= \\tfrac{1}{2}(16) = 8 \\text{ cm}"}]},
             {"steps": [{"tex": "h^{2} &= l^{2} - r^{2} = 17^{2} - 8^{2} = 225"}, {"tex": "h &= 15 \\text{ cm}"}]},
             {"steps": [{"tex": "V &= \\tfrac{1}{3}\\pi r^{2}h = \\tfrac{1}{3}\\pi (8)^{2}(15)"}, {"tex": "V &= 320\\pi = \\bl{1010 \\text{ cm}^{3}}"}]},
             gdc("$\\frac{1}{3}\\pi \\times 8^2 \\times 15$ → $1005.3\\ldots$; write $V = 1010$ cm³.")],
  "graph": {"window": W3, "items": [
     ell(O, rr, 0.3*rr, math.pi, 2*math.pi), ell(O, rr, 0.3*rr, 0, math.pi, dashed=True),
     seg(V, [-rr, 0]), seg(V, Rr, answer=True), seg(V, O, dashed=True), seg(O, Rr, dashed=True),
     ang(O, Rr, V), pt(O, 'O', 'sw'), pt(V, 'V', 'n'), lab(Rr, 'R', 'e'),
     lab([0, r4(0.62*15*k3)], 'h', 'w'), lab([r4(rr*0.5), r4(-0.3*rr-0.75)], '8', 'c', step=1), lab(mid(V, Rr), '17', 'ne'),
     {"kind": "polygon", "pts": [Of, Rf3, Vf], "step": 2}, seg(Of, Rf3, step=2), seg(Of, Vf, step=2), seg(Vf, Rf3, answer=True, step=2),
     ang(Of, Rf3, Vf, step=2), lab(mid(Of, Rf3), '8', 's', step=2), lab(mid(Of, Vf), 'h', 'w', step=2, until=2), lab(mid(Of, Vf), 'h = 15', 'w', step=3), lab(mid(Vf, Rf3), '17', 'ne', step=2),
     lab(Of, 'O', 'sw', step=2), lab(Rf3, 'R', 'se', step=2), lab(Vf, 'V', 'n', step=2)]}}

# ---------- Example 4 : square pyramid, a = 14, h = 24
k4 = 0.24; M = [0, 0]; s4 = 7*k4; dv = [0.8*s4, 0.5*s4]
def cor(i, j): return [r4(M[0] + i*s4 + j*dv[0]), r4(M[1] + j*dv[1])]
A4, B4, C4, D4 = cor(-1, -1), cor(1, -1), cor(1, 1), cor(-1, 1)
N4 = mid(A4, B4); V4 = [0, r4(24*k4)]
pyr = [seg(A4, B4), seg(B4, C4), seg(D4, A4, dashed=True), seg(D4, C4, dashed=True),
       seg(V4, A4), seg(V4, B4), seg(V4, C4), seg(V4, D4, dashed=True),
       seg(V4, M, dashed=True), seg(M, N4, dashed=True), seg(V4, N4, answer=True),
       pt(M), seg(A4, C4, dashed=True), seg(B4, D4, dashed=True), {"kind": "polygon", "pts": [V4, M, N4]}, pt(N4, 'N', 's'), pt(V4, 'V', 'n'), lab(A4, 'A', 'sw'), lab(B4, 'B', 'se'), 
       lab(mid(A4, B4) if False else [r4(B4[0]+0.1), r4(B4[1]-0.9)], '14', 'c')]
pyr = [it for it in pyr if it.get("tex") != "14"] + [lab(mid(A4, N4), '14', 's')]
W4 = {"xmin": -4.2, "xmax": 8.6, "ymin": -3.0, "ymax": 9.8, "plain": True}
W4["ymax"] = W4["ymin"] + (W4["xmax"] - W4["xmin"])
stem4 = "A right pyramid has a square base of side $14$ cm and vertical height $24$ cm. Find its total surface area."
yl = 2.0
def xon(P): return V4[0] + (P[0]-V4[0])*(V4[1]-yl)/(V4[1]-P[1])
LSOLID = lab([r4((xon(N4)+xon(A4))/2), yl], 'l', 'c')
Mf = [4.6, 0]; Nf = [r4(4.6 + 7*k4), 0]; Vf4 = [4.6, r4(24*k4)]
ex4a = {"type": "example", "n": 4, "tag": "NC", "title": "The total surface area of a pyramid", "stem": stem4,
  "blocks": [{"steps": [{"tex": "MN &= \\tfrac{1}{2}(14) = 7 \\text{ cm}"}]},
             {"steps": [{"tex": "l^{2} &= 24^{2} + 7^{2} = 625"}, {"tex": "l &= 25 \\text{ cm}"}]}],
  "graph": {"window": W4, "items": pyr + [LSOLID,
     {"kind": "polygon", "pts": [Mf, Nf, Vf4], "step": 2}, seg(Mf, Nf, step=2), seg(Mf, Vf4, step=2), seg(Vf4, Nf, answer=True, step=2),
     ang(Mf, Nf, Vf4, step=2), lab(mid(Mf, Nf), '7', 's', step=2), lab(mid(Mf, Vf4), '24', 'w', step=2),
     lab(mid(Vf4, Nf), 'l', 'ne', step=2, until=2), lab(mid(Vf4, Nf), 'l = 25', 'ne', step=3),
     lab(Mf, 'M', 'sw', step=2), lab(Nf, 'N', 'se', step=2), lab(Vf4, 'V', 'n', step=2),
     ]}}
# face VAB drawn flat: base 14, height l = 25
kf4 = 0.24; Af = [3.9, 0]; Bf = [r4(2.8 + 14*kf4), 0]; Nf2 = mid(Af, Bf); Vf5 = [Nf2[0], r4(25*kf4)]
ex4b = {"type": "example", "n": 4, "tag": "NC", "title": "…the four faces and the base", "stem": stem4,
  "blocks": [{"steps": [{"tex": "\\text{one face} &= \\tfrac{1}{2}(14)(25) = 175 \\text{ cm}^{2}"}, {"tex": "\\text{four faces} &= 700 \\text{ cm}^{2}"},
                        {"tex": "\\text{base} &= 14^{2} = 196 \\text{ cm}^{2}"}, {"tex": "\\text{total} &= 700 + 196 = \\bl{896 \\text{ cm}^{2}}"}]}],
  "graph": {"window": W4, "items": [it for it in pyr if (it.get("kind") != "segment" or it.get("to") != N4 or it.get("from") != M) and not (it.get("kind") == "polygon" and M in it["pts"])]
     + [{"kind": "polygon", "pts": [A4, B4, V4]}, LSOLID,
     {"kind": "polygon", "pts": [Af, Bf, Vf5], "step": 1}, seg(Af, Bf, step=1), seg(Bf, Vf5, step=1), seg(Vf5, Af, step=1),
     seg(Vf5, Nf2, dashed=True, step=1), ang(Nf2, Bf, Vf5, step=1), lab(Nf2, '14', 's', step=1), lab([Nf2[0], r4(Vf5[1]*0.32)], 'l', 'e', step=1),
     lab(Af, 'A', 'sw', step=1), lab(Bf, 'B', 'se', step=1), lab(Vf5, 'V', 'n', step=1),
     {"kind": "polygon", "pts": [A4, B4, C4, D4], "step": 3}]}}

lab_solid = {"type": "lab", "preset": "solidSection", "title": "The flat triangle inside a solid", "controlScale": 1.2,
  "init": {"window": {"xmin": -1.6, "xmax": 19.4, "ymin": -5.2, "ymax": 15.8, "plain": True}, "k": 0.34, "O": [4.2, 1.2], "T": [11.4, 1.2],
           "solid": "cone", "cone": {"r": 8, "h": 15}, "pyramid": {"a": 14, "h": 24}, "rRange": [2, 12, 1], "aRange": [2, 24, 2], "hRange": [2, 24, 1]}}

content = {"meta": {"cohort": "Y2", "cohortLabel": "Year 2", "lesson": 16, "topic": "SolidGeometry",
   "topicWords": "Distance, Volume and Surface Area in Three Dimensions",
   "file": "AASL_Y2_L16_Lesson_SolidGeometry.html", "artifactTitle": "Y2 L16 Solid Geometry",
   "t2c": {"h": "red", "l": "green"},
   "source": "AASL_Y2_L16_Worksheet_SolidGeometry.tex (Drive 1jIKJJcXKqXb9n2RFEC3yvLPKEe5J6ek9, folder 1XhBLqO6ydgQg990AwZwkXCYH992Q4Nee)"},
 "slides": [
  {"type": "title", "eyebrow": "IB Mathematics AA SL · Year 2 · Lesson 16", "title": "Distance, Volume and Surface Area in Three Dimensions",
   "lede": "Online lesson — worked examples and lab", "code": "SL 3.1", "regime": "C", "regimeText": "GDC for Examples 1–3; Example 4 needs none"},
  ex1a, ex1b, ex2a, ex2b, lab_solid, ex3, ex4a, ex4b,
  {"type": "yourturn", "title": "Your turn",
   "sections": [{"heading": "Now, in class", "rows": [
      {"code": "A", "q": "Q1–5", "label": "Lengths inside a solid", "time": "10 min"},
      {"code": "B", "q": "Q6–9", "label": "Distance and midpoint in space", "time": "7 min"},
      {"code": "C", "q": "Q12–14", "label": "Volumes", "time": "6 min"}]},
     {"heading": "At home", "rows": [
      {"code": "B", "q": "Q10–11", "label": "Distance and midpoint in space", "time": "10 min"},
      {"code": "C–D", "q": "Q15–21", "label": "Volumes and surface areas", "time": "25 min"},
      {"code": "E", "q": "Q22–24", "label": "Putting it together", "time": "20 min"}]}],
   "open": {"q": "Q25", "text": "Cut a sector from a paper disc of radius $12$ cm and roll it into a cone. Which measurement of the cone is the same whatever sector you choose, and why? Sketch how the volume behaves as the sector opens from very narrow to nearly the whole disc. Is there a best sector?",
     "how": "Open question — answer it with a drawing."}}]}
json.dump(content, open('content.json', 'w'), ensure_ascii=False, indent=1)
print('ok')
