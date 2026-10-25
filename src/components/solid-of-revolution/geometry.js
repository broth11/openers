import * as THREE from 'three'

// Closed outer/inner surfaces, annular ends, and genuine radial section faces.
export function sweptGeometry({ axis, a, b, outer, inner, sign = 1 }, angle, longitudinal = 40, radial = 48) {
  const vertices = [], groups = []
  const pt = (t, r, u) => {
    const theta = (sign < 0 ? Math.PI : 0) + u * angle
    return axis === 'x' ? [t, r * Math.cos(theta), r * Math.sin(theta)] : [r * Math.cos(theta), t, r * Math.sin(theta)]
  }
  const quad = (p, q, r, s, reverse = false) => {
    if (reverse) vertices.push(...p, ...r, ...q, ...p, ...s, ...r)
    else vertices.push(...p, ...q, ...r, ...p, ...r, ...s)
  }
  for (const [radius, material] of [[outer, 0], [inner, 1]]) {
    const start = vertices.length / 3
    for (let i = 0; i < longitudinal; i++) {
      const t0 = a + (b - a) * i / longitudinal, t1 = a + (b - a) * (i + 1) / longitudinal
      for (let j = 0; j < radial; j++) quad(pt(t0, radius(t0), j / radial), pt(t1, radius(t1), j / radial), pt(t1, radius(t1), (j + 1) / radial), pt(t0, radius(t0), (j + 1) / radial), (axis === 'x') !== (material === 1))
    }
    groups.push([start, vertices.length / 3 - start, material])
  }
  let start = vertices.length / 3
  for (const t of [a, b]) for (let j = 0; j < radial; j++) quad(pt(t, inner(t), j / radial), pt(t, outer(t), j / radial), pt(t, outer(t), (j + 1) / radial), pt(t, inner(t), (j + 1) / radial), (axis === 'x') !== (t === b))
  groups.push([start, vertices.length / 3 - start, 1])
  if (angle < Math.PI * 2 - 0.001) {
    start = vertices.length / 3
    for (const u of [0, 1]) for (let i = 0; i < longitudinal; i++) {
      const t0 = a + (b - a) * i / longitudinal, t1 = a + (b - a) * (i + 1) / longitudinal
      quad(pt(t0, inner(t0), u), pt(t0, outer(t0), u), pt(t1, outer(t1), u), pt(t1, inner(t1), u), (axis === 'y') !== (u === 1))
    }
    groups.push([start, vertices.length / 3 - start, 1])
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  for (const g of groups) geo.addGroup(...g)
  geo.computeVertexNormals()
  return geo
}

