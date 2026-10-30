import json, math
r=lambda v: round(v,4)
def pol(O,b,d): return [r(O[0]+d*math.sin(math.radians(b))), r(O[1]+d*math.cos(math.radians(b)))]
def bis(P,Q1,Q2,d):
    a=[Q1[0]-P[0],Q1[1]-P[1]]; b=[Q2[0]-P[0],Q2[1]-P[1]]
    la=math.hypot(*a); lb=math.hypot(*b); x=a[0]/la+b[0]/lb; y=a[1]/la+b[1]/lb; L=math.hypot(x,y)
    return [r(P[0]+d*x/L), r(P[1]+d*y/L)]
def bisk(P,Q1,Q2,d,k):
    # bisector in screen space when y is drawn k times larger than x; d in x-units
    a=[Q1[0]-P[0],k*(Q1[1]-P[1])]; b=[Q2[0]-P[0],k*(Q2[1]-P[1])]
    la=math.hypot(*a); lb=math.hypot(*b); x=a[0]/la+b[0]/lb; y=a[1]/la+b[1]/lb; L=math.hypot(x,y)
    return [r(P[0]+d*x/L), r(P[1]+d*y/L/k)]
def mid(P,Q): return [r((P[0]+Q[0])/2), r((P[1]+Q[1])/2)]
D='^{\\circ}'
VI='#B189C6'
def vi(t): return '\\textcolor{'+VI+'}{'+t+'}'
def gdc(s): return {"text": "GDC (Deg): " + s}

# ---------- Example 2 (not to scale, as on the worksheet)
F=[0,0]; T=[0,3.5]; Ac=[10,0]; Z=[10,3.5]
ex2={"type":"example","n":2,"tag":"C","title":"One right-angled triangle",
 "stem":"From the top $T$ of a control tower $32$ m high, the angle of depression of an aircraft $A$ standing on the runway is $9^{\\circ}$. Find the distance of the aircraft from the foot of the tower.",
 "blocks":[{"text":"The depression at the top equals the elevation at the aircraft, and carried down there it becomes an angle of the right-angled triangle."},
  {"steps":[{"tex":"\\tan 9^{\\circ} &= \\frac{32}{d}"},{"tex":"d &= \\frac{32}{\\tan 9^{\\circ}}"},{"tex":"d &= \\bl{202 \\text{ m}}"}]},
  gdc("$32 \\div \\tan 9$ → $202.04\\ldots$; write $d = 202$ m.")],
 "graph":{"window":{"xmin":-2,"xmax":12,"ymin":-5.5,"ymax":8.5,"plain":True},
  "items":[{"kind":"segment","from":[-1.2,0],"to":[11.2,0],"dashed":True},
   {"kind":"segment","from":F,"to":T},{"kind":"segment","from":T,"to":Ac},
   {"kind":"segment","from":T,"to":Z,"dashed":True},
   {"kind":"angle","O":T,"P":Z,"Q":Ac},{"kind":"label","at":bis(T,Z,Ac,4.0),"tex":"9"+D,"anchor":"c"},
   {"kind":"angle","O":F,"P":Ac,"Q":T},
   {"kind":"label","at":mid(F,T),"tex":"32\\text{ m}","anchor":"w"},
   {"kind":"label","at":mid(F,Ac),"tex":"d","anchor":"s"},
   {"kind":"point","at":T,"label":"T","anchor":"nw"},{"kind":"point","at":F,"label":"F","anchor":"sw"},{"kind":"point","at":Ac,"label":"A","anchor":"se"},
   {"kind":"angle","O":Ac,"P":F,"Q":T,"step":1},{"kind":"label","at":bis(Ac,F,T,4.0),"tex":"9"+D,"anchor":"c","step":1}]}}

# ---------- Example 4
K4=11/6; A4=[0,0]; B4=[3.4,0]; F4=[8.3,0]; T4=[8.3,2.7]
ex4a={"type":"example","n":4,"tag":"C","title":"Two elevations of the same point",
 "stem":"From a point $A$ on level ground the angle of elevation of the top $T$ of a chimney is $18^{\\circ}$. From a point $B$, which is $55$ m nearer the chimney on the same straight line, the angle of elevation is $29^{\\circ}$. Find the height of the chimney.",
 "blocks":[{"text":"The $55$ m is not a side of any right-angled triangle here, so the right triangle $TFB$ cannot be started. Work in triangle $ABT$ instead, where the $55$ m is a side. Its angle at $B$ is the supplement of $29^{\\circ}$, because that angle is on the other side of $B$."},
  {"steps":[{"tex":"A\\hat{B}T &= 180^{\\circ} - 29^{\\circ} = 151^{\\circ}"},{"tex":"A\\hat{T}B &= 180^{\\circ} - 18^{\\circ} - 151^{\\circ} = 11^{\\circ}"},
    {"tex":"\\frac{BT}{\\sin 18^{\\circ}} &= \\frac{55}{\\sin 11^{\\circ}}"},{"tex":"BT &= 89.073\\ldots \\text{ m}"}]},
  gdc("$55 \\sin 18 \\div \\sin 11$ → $89.073\\ldots$; keep it as Ans.")],
 "graph":{"window":{"xmin":-1.2,"xmax":9.8,"ymin":-1.9,"ymax":4.1,"plain":True},
  "items":[{"kind":"segment","from":[-0.9,0],"to":[9.5,0],"dashed":True},
   {"kind":"segment","from":F4,"to":T4},{"kind":"segment","from":A4,"to":T4},{"kind":"segment","from":B4,"to":T4},
   {"kind":"angle","O":A4,"P":F4,"Q":T4},{"kind":"label","at":bisk(A4,F4,T4,1.7,K4),"tex":"18"+D,"anchor":"c"},
   {"kind":"angle","O":B4,"P":F4,"Q":T4},{"kind":"label","at":bisk(B4,F4,T4,1.8,K4),"tex":"29"+D,"anchor":"c"},
   {"kind":"angle","O":F4,"P":B4,"Q":T4},
   {"kind":"label","at":mid(A4,B4),"tex":"55\\text{ m}","anchor":"s"},
   {"kind":"label","at":mid(F4,T4),"tex":"h","anchor":"e"},
   {"kind":"point","at":A4,"label":"A","anchor":"sw"},{"kind":"point","at":B4,"label":"B","anchor":"s"},
   {"kind":"point","at":F4,"label":"F","anchor":"se"},{"kind":"point","at":T4,"label":"T","anchor":"ne"},
   {"kind":"angle","O":B4,"P":A4,"Q":T4,"step":2},{"kind":"label","at":bisk(B4,A4,T4,1.35,K4),"tex":"151"+D,"anchor":"c","step":2},
   {"kind":"angle","O":T4,"P":A4,"Q":B4,"step":3},{"kind":"label","at":bisk(T4,A4,B4,4.2,K4),"tex":"11"+D,"anchor":"c","step":3},
   {"kind":"label","at":mid(B4,T4),"tex":"89.07\\text{ m}","anchor":"se","step":5}]}}

ex4b=json.loads(json.dumps(ex4a))
ex4a["blocks"]=[ex4a["blocks"][0],{"steps":ex4a["blocks"][1]["steps"][:2]}]
for it in ex4a["graph"]["items"]:
    if it.get("tex")=="89.07\\text{ m}": it["hide"]=True
ex4a["graph"]["items"]=[it for it in ex4a["graph"]["items"] if not it.get("hide")]
ex4b["title"]="…and the height"
ex4b["blocks"]=[{"steps":[{"tex":"\\frac{BT}{\\sin 18^{\\circ}} &= \\frac{55}{\\sin 11^{\\circ}}"},{"tex":"BT &= 89.073\\ldots \\text{ m}"}]},
  {"text":"Now $BT$ is the hypotenuse of the right-angled triangle $TFB$:"},
  {"steps":[{"tex":"h &= BT \\sin 29^{\\circ}"},{"tex":"h &= \\bl{43.2 \\text{ m}}"}]},
  gdc("$55 \\sin 18 \\div \\sin 11$ → $89.073\\ldots$, then $\\text{Ans} \\times \\sin 29$ → $43.18\\ldots$; write $h = 43.2$ m.")]
for it in ex4b["graph"]["items"]: it.pop("step",None)
for it in ex4b["graph"]["items"]:
    if it.get("tex")=="89.07\\text{ m}": it["step"]=2
ex4b["graph"]["items"].append({"kind":"label","at":[8.3,1.35],"tex":"\\bl{h = 43.2\\text{ m}}","anchor":"e","step":5})
ex4b["graph"]["items"]=[it for it in ex4b["graph"]["items"] if it.get("tex")!="h"]
# ---------- Example 1 (revised 01/10/2026: the 180 + 118 is drawn at B; alternate angles in violet)
A=[0,0]; B=pol(A,118,6); Sb=[B[0],r(B[1]-2.7)]
ex1={"type":"example","n":1,"tag":"NC","title":"A bearing and its back bearing",
 "stem":"The bearing of a buoy $B$ from a jetty $A$ is $118^{\\circ}$. Write down the bearing of $A$ from $B$.",
 "blocks":[{"steps":[{"tex":"\\text{bearing of } A \\text{ from } B &= 180^{\\circ} + "+vi("118^{\\circ}")},
                     {"tex":"&= \\bl{298^{\\circ}}"}]}],
 "graph":{"window":{"xmin":-2.6,"xmax":9.4,"ymin":-7.0,"ymax":5.0,"plain":True},
  "items":[{"kind":"north","at":A,"len":2.8},{"kind":"north","at":B,"len":2.8},{"kind":"segment","from":A,"to":B},
   {"kind":"bearing","at":A,"deg":118,"r":1.1,"color":VI},{"kind":"label","at":pol(A,59,1.9),"tex":vi("118"+D),"anchor":"c"},
   {"kind":"point","at":A,"label":"A","anchor":"w"},{"kind":"point","at":B},{"kind":"label","at":pol(B,330,0.85),"tex":"B","anchor":"c"},
   {"kind":"segment","from":B,"to":Sb,"dashed":True,"step":1},{"kind":"label","at":[Sb[0],Sb[1]-0.25],"tex":"\\mathrm{S}","anchor":"s","step":1},
   {"kind":"bearing","at":B,"deg":180,"r":1.1,"muted":True,"step":1},{"kind":"label","at":pol(B,90,1.9),"tex":"180"+D,"anchor":"c","step":1},
   {"kind":"bearing","at":B,"from":180,"deg":118,"r":1.1,"color":VI,"step":1},{"kind":"label","at":pol(B,239,1.95),"tex":vi("118"+D),"anchor":"c","step":1},
   {"kind":"bearing","at":B,"deg":298,"r":2.65,"color":"green","step":2},{"kind":"label","at":pol(B,135,3.7),"tex":"\\bl{298"+D+"}","anchor":"c","step":2}]}}

# ---------- Example 3 (revised 01/10/2026: angle at C read on the straight line N-S at C, 85 + 75 + 20 = 180;
# the 20 at C is the alternate of the 20 at B; the bearing of D is the 66.4 minus that 20)
Bb=[0,0]; Cc=pol(Bb,340,4.5); Dd=pol(Cc,85,6.6); Sc=[Cc[0],r(Cc[1]-3.3)]
stem3="A helicopter flies $15$ km from its base $B$ on a bearing of $340^{\\circ}$ to a checkpoint $C$. It then flies $22$ km on a bearing of $085^{\\circ}$ to a landing site $D$. Find $BD$, and the bearing of $D$ from $B$."
W3={"xmin":-3.0,"xmax":6.4,"ymin":-1.6,"ymax":7.8,"plain":True}
tri=[{"kind":"segment","from":Bb,"to":Cc},{"kind":"segment","from":Cc,"to":Dd},{"kind":"segment","from":Bb,"to":Dd,"dashed":True},
   {"kind":"point","at":Bb},{"kind":"label","at":pol(Bb,125,1.15),"tex":"B","anchor":"c"},{"kind":"point","at":Cc,"label":"C","anchor":"w"},{"kind":"point","at":Dd,"label":"D","anchor":"e"}]
sides=[{"kind":"label","at":mid(Bb,Cc),"tex":"15\\text{ km}","anchor":"e"},
   {"kind":"label","at":mid(Cc,Dd),"tex":"22\\text{ km}","anchor":"n"},
   {"kind":"label","at":mid(Bb,Dd),"tex":"x\\text{ km}","anchor":"se"}]
norths=[{"kind":"north","at":Bb,"len":2.3},{"kind":"north","at":Cc,"len":2.4}]
a75=[{"kind":"angle","O":Cc,"P":Bb,"Q":Dd,"color":VI},{"kind":"label","at":bis(Cc,Bb,Dd,1.25),"tex":vi("75"+D),"anchor":"c"}]
ex3a={"type":"example","n":3,"tag":"C","title":"A change of course","stem":stem3,
 "blocks":[{"steps":[{"tex":"N\\hat{B}C &= 360^{\\circ} - 340^{\\circ} = 20^{\\circ}"},
    {"tex":"B\\hat{C}S &= N\\hat{B}C = 20^{\\circ}"},
    {"tex":"B\\hat{C}D &= 180^{\\circ} - 85^{\\circ} - 20^{\\circ} = "+vi("75^{\\circ}")}]}],
 "graph":{"window":W3,"items":norths+tri+[
   {"kind":"bearing","at":Bb,"deg":340,"r":0.6,"muted":True},{"kind":"label","at":pol(Bb,215,1.25),"tex":"340"+D,"anchor":"c"},
   {"kind":"bearing","at":Cc,"deg":85,"r":0.9},{"kind":"label","at":pol(Cc,42,1.65),"tex":"85"+D,"anchor":"c"},
   {"kind":"bearing","at":Bb,"from":340,"deg":20,"r":1.9,"color":"red","step":1},{"kind":"label","at":pol(Bb,14,2.15),"tex":"20"+D,"anchor":"c","color":"red","step":1},
   {"kind":"segment","from":Cc,"to":Sc,"dashed":True,"step":2},{"kind":"label","at":[Sc[0],Sc[1]-0.2],"tex":"\\mathrm{S}","anchor":"s","step":2},
   {"kind":"bearing","at":Cc,"from":160,"deg":20,"r":1.9,"color":"red","step":2},{"kind":"label","at":pol(Cc,193,2.2),"tex":"20"+D,"anchor":"c","color":"red","step":2},
   {"kind":"angle","O":Cc,"P":Bb,"Q":Dd,"color":VI,"step":3},{"kind":"label","at":bis(Cc,Bb,Dd,1.25),"tex":vi("75"+D),"anchor":"c","step":3}]}}
ex3a2={"type":"example","n":3,"tag":"C","title":"…the distance $BD$","stem":stem3,
 "blocks":[{"steps":[{"tex":"x^2 &= 15^2 + 22^2 - 2(15)(22)\\cos "+vi("75^{\\circ}")},{"tex":"x &= \\bl{23.2 \\text{ km}}"}]},
  gdc("$\\sqrt{15^2 + 22^2 - 2(15)(22)\\cos 75}$ → $23.198\\ldots$; keep it as Ans, write $x = 23.2$ km.")],
 "graph":{"window":W3,"items":tri+sides+a75+[{"kind":"label","at":[mid(Bb,Dd)[0]+0.9,mid(Bb,Dd)[1]-0.5],"tex":"\\bl{23.2\\text{ km}}","anchor":"c","step":2}]}}
ex3b={"type":"example","n":3,"tag":"C","title":"…the angle at $B$","stem":stem3,
 "blocks":[{"steps":[{"tex":"\\frac{\\sin(C\\hat{B}D)}{22} &= \\frac{\\sin "+vi("75^{\\circ}")+"}{23.198\\ldots}"},
    {"tex":"\\sin(C\\hat{B}D) &= 0.91601\\ldots"},{"tex":"C\\hat{B}D &= 66.4^{\\circ}"}]}],
 "graph":{"window":W3,"items":tri+[{"kind":"label","at":[r(mid(Bb,Cc)[0]-1.05),mid(Bb,Cc)[1]],"tex":"15\\text{ km}","anchor":"c"},sides[1],{"kind":"label","at":[r(mid(Bb,Dd)[0]+1.0),r(mid(Bb,Dd)[1]-0.7)],"tex":"23.198\\ldots","anchor":"c"}]+a75+[
   {"kind":"angle","O":Bb,"P":Cc,"Q":Dd,"step":3},{"kind":"label","at":pol(Bb,10,1.75),"tex":"66.4"+D,"anchor":"c","step":3}]}}
ex3b2={"type":"example","n":3,"tag":"C","title":"…and the answer as a bearing","stem":stem3,
 "blocks":[{"steps":[{"tex":"\\text{bearing of } D \\text{ from } B &= C\\hat{B}D - N\\hat{B}C"},
    {"tex":"&= 66.4^{\\circ} - 20^{\\circ} = 46.4^{\\circ}"},{"tex":"&= \\bl{046^{\\circ}}"}]},
  gdc("$\\sin^{-1}(22 \\sin 75 \\div \\text{Ans})$ → $66.35\\ldots$; write $C\\hat{B}D = 66.4^{\\circ}$, then the bearing.")],
 "graph":{"window":W3,"items":[{"kind":"north","at":Bb,"len":4.0}]+tri+a75+[
   {"kind":"bearing","at":Bb,"from":340,"deg":66.35,"r":2.9,"muted":True},{"kind":"label","at":pol(Bb,30,3.6),"tex":"66.4"+D,"anchor":"c"},
   {"kind":"bearing","at":Bb,"from":340,"deg":20,"r":1.9,"color":"red","step":1},{"kind":"label","at":pol(Bb,328,2.3),"tex":"20"+D,"anchor":"c","color":"red","step":1},
   {"kind":"bearing","at":Bb,"deg":46.35,"r":1.3,"color":"green","step":2},{"kind":"label","at":pol(Bb,23,2.0),"tex":"\\bl{046"+D+"}","anchor":"c","step":3}]}}

content={"meta":{"cohort":"Y2","cohortLabel":"Year 2","lesson":15,"topic":"BearingsAndApplications","topicWords":"Bearings, Elevation and Depression",
  "file":"AASL_Y2_L15_Lesson_BearingsAndApplications.html","artifactTitle":"Y2 L15 Bearings And Applications · Green-Grey","theme":"greengrey",
  "source":"AASL_Y2_L15_Worksheet_BearingsAndApplications.tex (AASL/Year 2/Worksheets & Notes/TeX, device mount; Drive folder 1XhBLqO6ydgQg990AwZwkXCYH992Q4Nee)"},
 "slides":[
  {"type":"title","eyebrow":"IB Mathematics AA SL · Year 2 · Lesson 15","title":"Bearings, Elevation and Depression",
   "lede":"Online lesson — worked examples and lab","code":"SL 3.3","regime":"C","regimeText":"GDC in degree mode; Example 1 needs none"},
  {"type":"lab","preset":"elevation","title":"Elevation and depression","controlScale":1.3,
   "init":{"window":{"xmin":-1,"xmax":15,"ymin":-3,"ymax":13,"plain":True},"F":13,"scale":4,"h":32,"hmin":8,"hmax":40,"hstep":2,"A":3}},
  ex2, ex4a, ex4b,
  {"type":"lab","preset":"bearing","title":"Bearings and back bearings","controlScale":1.3,
   "init":{"window":{"xmin":-8,"xmax":8,"ymin":-8,"ymax":8,"plain":True},"A":{"x":-2,"y":-2},
           "one":{"b1":118,"r1":6},"course":{"b1":340,"r1":5.5,"b2":85,"r2":6.5},"mode":"one bearing"}},
  ex1, ex3a, ex3a2, ex3b, ex3b2,
  {"type":"yourturn","title":"Your turn",
   "sections":[{"heading":"Now, in class","rows":[
      {"code":"A","q":"Q1–6","label":"Reading and writing bearings","time":"5 min"},
      {"code":"B","q":"Q7–11","label":"From a sentence to a figure","time":"12 min"},
      {"code":"D","q":"Q18–19","label":"Triangles with no right angle","time":"8 min"}]},
     {"heading":"At home","rows":[
      {"code":"C","q":"Q12–17","label":"One right-angled triangle","time":"15 min"},
      {"code":"D","q":"Q20–23","label":"Triangles with no right angle","time":"20 min"},
      {"code":"E","q":"Q24–27","label":"Putting it together","time":"25 min"}]}],
   "open":{"q":"Q28","text":"Walk towards a tower, stopping each time the angle of elevation of its top has grown by another $15^{\\circ}$: $15^{\\circ}, 30^{\\circ}, 45^{\\circ}, 60^{\\circ}, 75^{\\circ}$. Are your stops evenly spaced? Then sketch the angle against your distance from the foot: what does it do right at the tower, and very far away?",
     "how":"Open question — answer it with a drawing.","harvest":"Harvest: Y2-3, graph of tan x"}}]}
json.dump(content,open('content.json','w'),ensure_ascii=False,indent=1)
print('ok')
