import { COLORS as C } from '../../kit/style.js'
const vel = t => (t-1)*(t-3)*(t-5)/4
const acc = t => (3*(t-3)**2-4)/4
const lo = 3-2/Math.sqrt(3)
const hi = 3+2/Math.sqrt(3)
const curve = (f,color) => ({ type:'curve', f:t=>[t,f(t)], t:[0,6], color, width:3 })
const bounds = { left:-0.5, right:6.5, bottom:-4.2, top:4.2 }
const graph = (items,labels=[]) => ({bounds, axes:{x:'t',y:'y',aspect:1},items,labels})
export default {
 course:'mai-hl', unit:12, lesson:4, title:'Velocity, acceleration and zero',
 bridge:'Lesson 3: acceleration is the gradient of velocity', engine:'svg', walk:true,
 params:{ marks:{type:'seg',label:'Marker',options:[['on','Show'],['off','Hide']],value:'on'}, c:{type:'range',label:'Velocity shift',min:-1,max:1,step:0.1,value:0,show:v=>`shift = ${v.toFixed(1)}`}, view:{type:'seg',label:'Show',options:[['both','Both'],['velocity','Velocity'],['acceleration','Acceleration']],value:'both'}, t:{type:'range',label:'Time',min:0,max:6,step:0.05,value:2,show:v=>`t = ${v.toFixed(2)}`} },
 scenes:[
  { id:'recall', short:'Velocity', heading:'Read the velocity graph', controls:[],
   prompts:[{id:'rest',q:'At which times is the particle at rest?',choices:['1, 3 and 5','2 and 4','Only 3'],correct:0,steps:[{caption:'Rest means zero velocity',latex:'v&=0\\\\t&=1,3,5',note:'Read the intersections with the time axis.',answer:true,reveals:['rest']}]},
   {id:'slope',q:'At which times is acceleration zero?',steps:[{caption:'Acceleration is the gradient',latex:'a&=v\\prime(t)\\\\a&=0\\quad\\text{at horizontal tangents}',note:'The horizontal tangents occur at approximately $t=1.85$ and $t=4.15$.',answer:true,reveals:['slope']}]}],
   graph:({revealed})=>graph([curve(vel,C.teal),...(revealed('rest')?[{type:'points',pts:[[1,0],[3,0],[5,0]],color:C.sel,r:5}]:[]),...(revealed('slope')?[{type:'points',pts:[[lo,vel(lo)],[hi,vel(hi)]],color:C.coral,r:5}]:[])]),
   readout:()=> 'Velocity against time',
  },
  {id:'match',short:'Match',heading:'Which graph represents acceleration?',controls:[],
   prompts:[{id:'pick',q:'Match the velocity graph to A, B or C. Use its gradient.',choices:['A','B','C'],correct:1,steps:[{caption:'Compare the signs of the gradient',latex:'a&>0,\\ a<0,\\ a>0',note:'Velocity increases, decreases, then increases.',reveals:[]},{caption:'Acceleration is graph B',latex:'&\\text{Graph B}',note:'Its zeros line up with the horizontal tangents of velocity.',answer:true,reveals:['pick']}]}],
   graph:({revealed})=>graph([curve(t=>-acc(t),C.coral),curve(acc,C.teal),curve(t=>0.2*(t-1)*(t-3)*(t-5),C.strip)],
    [{id:'a',x:5.5,y:-acc(5.5),html:'A',color:C.coral,pos:'se'}, {id:'b',x:5.5,y:acc(5.5),html:revealed('pick')?'B ✓':'B',color:C.teal,pos:'ne'},{id:'c',x:5.5,y:0.2*(5.5-1)*(5.5-3)*(5.5-5),html:'C',color:C.strip,pos:'e'}]),
   readout:()=> 'Three candidate acceleration graphs',
  },
  {id:'compare',short:'Connect',heading:'What does each zero tell us?',controls:[],
   prompts:[{id:'vzero',q:'What does a zero of velocity tell us?',steps:[{caption:'Velocity zero',latex:'v&=0\\quad\\text{at rest}',note:'The particle is at rest at that instant.',answer:true}]}, {id:'azero',q:'What does a zero of acceleration tell us about the velocity graph?',steps:[{caption:'Acceleration zero',latex:'a&=0\\quad\\Rightarrow\\quad v\\prime(t)=0',note:'The velocity graph has a horizontal tangent. This need not be a turning point.',answer:true}]}],
   graph:()=>graph([curve(vel,C.teal),curve(acc,C.coral)]), readout:()=> 'Teal: velocity; coral: acceleration',
  },
  {id:'explore',short:'Explore',heading:'Move through the motion',controls:['view','marks','t','c'],
   cards:()=>[{title:'Explore',lines:['Move the time slider and shift velocity. Compare its slope with acceleration.']}],
   graph:({v})=>graph([...(v.view!=='acceleration'?[curve(t=>vel(t)+v.c,C.teal)]:[]),...(v.view!=='velocity'?[curve(acc,C.coral)]:[]),{type:'line',x1:v.t,y1:-4,x2:v.t,y2:4,color:C.sel,dash:true},...(v.marks==='on'?[{type:'points',pts:[...(v.view!=='acceleration'?[[v.t,vel(v.t)+v.c]]:[]),...(v.view!=='velocity'?[[v.t,acc(v.t)]]:[])],color:C.sel,r:4}]:[])]),
   readout:({v})=>`t = ${v.t.toFixed(2)}: velocity ${(vel(v.t)+v.c).toFixed(2)}, acceleration ${acc(v.t).toFixed(2)}`,
  },
 ],
}
