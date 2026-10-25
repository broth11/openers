// Independent volume integration of rendered triangles, including inner-wall orientation.
import assert from 'node:assert/strict'
import { sweptGeometry } from '../src/components/solid-of-revolution/geometry.js'
function volume(g) {
  const a = g.attributes.position.array
  let v = 0
  for (let i = 0; i < a.length; i += 9) {
    const [ax,ay,az,bx,by,bz,cx,cy,cz] = a.slice(i,i+9)
    v += (ax*(by*cz-bz*cy)+ay*(bz*cx-bx*cz)+az*(bx*cy-by*cx))/6
  }
  return v
}
let checks = 0
for (const axis of ['x','y']) for (const angle of [Math.PI/2,Math.PI*1.5,Math.PI*2]) {
  for (const [name,spec,expected] of [
    ['cylinder',{a:0,b:2,outer:()=>2,inner:()=>0},8*Math.PI],
    ['washer',{a:0,b:0.2,outer:()=>3,inner:()=>2},Math.PI],
    ['hemisphere',{a:0,b:3,outer:(t)=>Math.sqrt(6*t-t*t),inner:()=>0},18*Math.PI],
    ['cavity',{a:1,b:3,outer:(t)=>Math.sqrt(2*t-2),inner:()=>0},4*Math.PI],
    ['bowl',{a:0,b:3,outer:(t)=>Math.sqrt(6*t-t*t),inner:(t)=>Math.sqrt(Math.max(0,2*t-2))},14*Math.PI],
  ]) {
    const geo=sweptGeometry({axis,...spec},angle,120,128)
    const actual=volume(geo), want=expected*angle/(2*Math.PI)
    assert(Math.abs(actual-want)/want<0.003, `${axis} ${name} ${angle}: ${actual} vs ${want}`)
    assert(geo.attributes.position.array.every(Number.isFinite))
    geo.dispose(); checks++
  }
}
console.log(`${checks} rendered-mesh volume, orientation, partial-sweep and cavity checks passed`)
