// Concept visuals shell (docs/CONCEPTS.md).
// Finds every concept module under concepts/<course>/, builds the Unit and Concept menus, and runs one
// concept: a large picture (optional number-line track above an SVG graph), a readout and controls under
// it, a narrow side panel (Notice, Working, Casio), and a bottom bar of scenes and stops (1 I P S ...).
// State is deterministic: each stop's control values fold from its scene's first stop. Free play in P is
// thrown away on leaving the stop. Animations play once, when a stop is reached by Next (or, on a stop
// with a prediction, when the prediction is made).

import 'mathlive/fonts.css'
import 'mathlive/static.css'
import './concepts.css'
import { md, tex } from '../kit/math.js'
import { makeSvgGraph } from '../kit/svg.js'
import { makeTrack } from '../components/number-line-track/index.js'
import { CONCEPT_COURSES } from './units.js'

const $ = (id) => document.getElementById(id)
const pad = (n) => String(n).padStart(2, '0')
const keyOf = (c) => `${c.course}-u${pad(c.unit)}-${c.slug}`

// ---------- registry
const modules = import.meta.glob('./*/*.js', { eager: true })
const ONLY = import.meta.env.VITE_CONCEPT || ''
const CONCEPTS = Object.values(modules)
  .map((m) => m.default)
  .filter((c) => c && c.course && c.slug && c.scenes?.length)
  .filter((c) => !ONLY || keyOf(c) === ONLY)
  .sort((a, b) => a.course.localeCompare(b.course) || a.unit - b.unit || a.lesson - b.lesson || (a.order || 0) - (b.order || 0))
const byKey = new Map(CONCEPTS.map((c) => [keyOf(c), c]))
const courseOf = (id) => CONCEPT_COURSES.find((c) => c.id === id) || { id, name: id, units: {} }
const unitName = (c) => courseOf(c.course).units?.[c.unit]?.name || `Unit ${c.unit}`
const lessonName = (c) => courseOf(c.course).units?.[c.unit]?.lessons?.[c.lesson] || ''

function setHTML(el, html) {
  if (el.__h !== html) { el.innerHTML = html; el.__h = html }
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

// ---------- state
let C = null // the concept
let FLAT = [] // [{ si, pi, stop, scene }] in bar order
let st = null // { i, values, picked: {}, tab, arrived, playing }
let graph = null
let track = null
let anim = 0

function stopLetter(scene, pi) {
  const s = scene.stops[pi]
  if (s.kind !== 'S') return s.kind
  const nS = scene.stops.filter((x) => x.kind === 'S').length
  if (nS < 2) return 'S'
  return 'S' + (scene.stops.slice(0, pi + 1).filter((x) => x.kind === 'S').length)
}

// The authored values at flat index i: defaults, then each stop's `set` in this scene up to i, with an
// animation's end value folded in (so arriving at P after an animated I shows the finished picture).
function valuesAt(i) {
  const values = {}
  for (const [k, p] of Object.entries(C.params || {})) values[k] = p.value
  const { si } = FLAT[i]
  for (let j = 0; j <= i; j++) {
    if (FLAT[j].si !== si) continue
    const s = FLAT[j].stop
    Object.assign(values, s.set || {})
    if (s.play && (j < i || !s.predict || st?.picked[stopId(j)] != null)) values[s.play.param] = s.play.to
  }
  return values
}
const stopId = (i) => `${FLAT[i].scene.id}:${FLAT[i].pi}`

function ctx() {
  const f = FLAT[st.i]
  return { v: st.values, stop: f.stop, kind: f.stop.kind, si: f.si, pi: f.pi, picked: st.picked[stopId(st.i)] ?? null, playing: !!anim }
}

// ---------- menus
function buildMenus() {
  const units = [...new Map(CONCEPTS.map((c) => [`${c.course}|${c.unit}`, c])).values()]
  $('unitSel').innerHTML = units.map((c) => `<option value="${c.course}|${c.unit}">${esc(courseOf(c.course).name)} · Unit ${c.unit}: ${esc(unitName(c))}</option>`).join('')
  $('unitSel').onchange = () => {
    const [course, unit] = $('unitSel').value.split('|')
    const first = CONCEPTS.find((c) => c.course === course && String(c.unit) === unit)
    if (first) location.hash = keyOf(first)
  }
  $('conceptSel').onchange = () => { location.hash = $('conceptSel').value }
}
function fillConceptMenu() {
  const list = CONCEPTS.filter((c) => c.course === C.course && c.unit === C.unit)
  $('unitSel').value = `${C.course}|${C.unit}`
  const groups = new Map()
  for (const c of list) { if (!groups.has(c.lesson)) groups.set(c.lesson, []); groups.get(c.lesson).push(c) }
  $('conceptSel').innerHTML = [...groups].map(([l, cs]) =>
    `<optgroup label="Lesson ${l}${lessonName(cs[0]) ? ': ' + esc(lessonName(cs[0])) : ''}">${cs.map((c) => `<option value="${keyOf(c)}">${esc(c.title)}</option>`).join('')}</optgroup>`).join('')
  $('conceptSel').value = keyOf(C)
}

// ---------- open a concept
function open(c) {
  stopAnim()
  C = c
  FLAT = []
  c.scenes.forEach((scene, si) => scene.stops.forEach((stop, pi) => FLAT.push({ si, pi, stop, scene })))
  st = { i: 0, values: {}, picked: {}, tab: 'notice' }
  st.values = valuesAt(0)
  document.title = `${c.title} · Concepts`
  $('eyebrow').textContent = `Unit ${c.unit} · ${unitName(c)} · Lesson ${c.lesson}`
  setHTML($('title'), md(c.title))
  setHTML($('idea'), md(c.idea || ''))
  fillConceptMenu()
  if (graph) graph.destroy()
  graph = makeSvgGraph($('graph'), { renderLabel: md, onDrag })
  buildBar()
  go(0, 'next') // opening a concept plays its first animation
}

// ---------- navigation
function go(i, how) {
  stopAnim()
  const was = FLAT[st.i]?.si
  st.i = Math.max(0, Math.min(FLAT.length - 1, i))
  if (FLAT[st.i].si !== was) st.tab = 'notice' // a new scene always opens on Notice
  st.values = valuesAt(st.i)
  const s = FLAT[st.i].stop
  const canPlay = s.play && how === 'next' && (!s.predict || st.picked[stopId(st.i)] != null)
  if (canPlay) startAnim(s.play)
  render()
}
function startAnim(play) {
  const p = C.params[play.param]
  const from = st.values[play.param] === play.to ? (FLAT[st.i].stop.set?.[play.param] ?? p.value) : st.values[play.param]
  const t0 = performance.now()
  const ms = ((play.seconds || 4) * 1000) / (window.__conceptSpeed || 1) // the layout check speeds animations up
  const tick = (now) => {
    const u = Math.min(1, (now - t0) / ms)
    st.values[play.param] = from + (play.to - from) * u
    render()
    anim = u < 1 ? requestAnimationFrame(tick) : 0
    if (!anim) render()
  }
  st.values[play.param] = from
  anim = requestAnimationFrame(tick)
}
function stopAnim() { if (anim) cancelAnimationFrame(anim); anim = 0 }

function onDrag(param, value) {
  if (FLAT[st.i].stop.kind !== 'P' || anim) return
  setParam(param, value)
}
function setParam(param, value) {
  const p = C.params[param]
  if (!p) return
  if (p.type === 'range') {
    const snapped = Math.round((value - p.min) / p.step) * p.step + p.min
    value = Math.max(p.min, Math.min(p.max, Number(snapped.toFixed(6))))
  }
  st.values[param] = value
  render()
}

// ---------- bar
function buildBar() {
  const html = C.scenes.map((scene, si) => {
    const stops = scene.stops.map((s, pi) => {
      const i = FLAT.findIndex((f) => f.si === si && f.pi === pi)
      return `<button type="button" class="cb k-${s.kind}" data-i="${i}" title="${esc(scene.title)}: ${stopName(s.kind)}">${stopLetter(scene, pi)}</button>`
    }).join('')
    return `<div class="cb-scene"><span class="cb-n" title="${esc(scene.title)}">${si + 1}</span>${stops}</div>`
  }).join('')
  setHTML($('barTrack'), html)
}
const stopName = (k) => ({ I: 'Introduction', P: 'Playground', S: 'Summary' })[k]

// ---------- render
function controlHTML(name) {
  const p = C.params[name]
  const val = st.values[name]
  if (p.type === 'range') {
    return `<label class="ctl"><span class="ctl-l">${md(p.label)}</span><input type="range" data-p="${name}" min="${p.min}" max="${p.max}" step="${p.step}" value="${val}"><span class="ctl-v">${md(p.show ? p.show(val, st.values) : String(val))}</span></label>`
  }
  if (p.type === 'seg') {
    return `<div class="ctl"><span class="ctl-l">${md(p.label)}</span><div class="seg">${p.options.map(([k, l]) => `<button type="button" data-p="${name}" data-val="${k}" aria-pressed="${val === k}">${md(l)}</button>`).join('')}</div></div>`
  }
  return ''
}
function toggleHTML(name) {
  const p = C.params[name]
  const on = !!st.values[name]
  return `<button type="button" class="mistake" data-toggle="${name}" aria-pressed="${on}"><span class="sw" aria-hidden="true"></span><span>${md(p.label, { wrap: true })}</span></button>`
}

function render() {
  const f = FLAT[st.i]
  const c = ctx()
  const scene = f.scene
  // picture
  const pic = scene.stage(c)
  $('track').hidden = !pic.track
  if (pic.track) { if (!track) track = makeTrack($('track')); track.apply(pic.track) }
  graph.apply(fillAspect(pic.graph))
  setHTML($('readout'), `<span>${md(scene.readout ? scene.readout(c) : '')}</span>`)
  // controls: only in the Playground
  const names = f.stop.kind === 'P' ? (typeof scene.controls === 'function' ? scene.controls(c) : scene.controls || []) : []
  const controls = names.filter((n) => C.params[n] && !C.params[n].hidden && C.params[n].type !== 'toggle')
  setHTML($('controls'), controls.map(controlHTML).join(''))
  for (const inp of $('controls').querySelectorAll('input[type=range]')) {
    if (document.activeElement !== inp) inp.value = st.values[inp.dataset.p]
  }
  // heading over the picture: scene and stop
  setHTML($('stopHead'), `<span class="sh-n">${f.si + 1}</span> ${md(scene.title)} <span class="sh-k k-${f.stop.kind}">${stopName(f.stop.kind)}</span>`)
  renderPanel(c)
  // bar
  for (const b of $('barTrack').querySelectorAll('.cb')) {
    const i = Number(b.dataset.i)
    b.classList.toggle('on', i === st.i)
    b.classList.toggle('done', i < st.i)
    b.setAttribute('aria-current', i === st.i ? 'step' : 'false')
  }
  $('barCount').textContent = `${st.i + 1} / ${FLAT.length}`
}

// axes.aspect: 'fill' stretches the horizontal unit so the bounds fill the graph's box exactly
function fillAspect(spec) {
  if (spec.axes?.aspect !== 'fill') return spec
  const box = $('graph')
  const w = box.clientWidth || 800
  const h = box.clientHeight || 400
  const b = spec.bounds
  const aspect = Math.max(1, Math.min(10, (w / (b.right - b.left)) / (h / (b.top - b.bottom))))
  return { ...spec, axes: { ...spec.axes, aspect: Math.round(aspect * 100) / 100 } }
}

function renderPanel(c) {
  const f = FLAT[st.i]
  const s = f.stop
  const scene = f.scene
  const tabs = [['notice', 'Notice'], ...(scene.working ? [['work', 'Working']] : []), ...(scene.keys ? [['casio', 'Casio']] : [])]
  if (!tabs.some(([k]) => k === st.tab)) st.tab = 'notice'
  setHTML($('tabs'), tabs.map(([k, l]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${st.tab === k}">${l}</button>`).join(''))
  let html = ''
  if (st.tab === 'notice') {
    html += `<p class="cap">${md(s.caption || '', { wrap: true })}</p>`
    if (s.predict) {
      const picked = c.picked
      html += `<div class="pred"><p class="pred-q">${md(s.predict.q, { wrap: true })}</p><div class="pred-c">${s.predict.choices.map((ch, i) =>
        `<button type="button" data-pick="${i}" class="${picked == null ? '' : i === s.predict.correct ? 'right' : i === picked ? 'wrong' : 'dim'}" aria-pressed="${picked === i}">${md(ch)}</button>`).join('')}</div>`
      if (picked != null) html += `<p class="pred-a">${md(s.predict.a, { wrap: true })}</p>`
      html += '</div>'
    }
    if (s.play && (!s.predict || c.picked != null)) html += `<button type="button" class="replay" data-replay="1"${c.playing ? ' disabled' : ''}>▶ Play again</button>`
    const m = s.mistake ? (typeof s.mistake === 'string' ? { param: s.mistake } : s.mistake) : null
    const explaining = !!(m?.what && st.values[m.param]) // with the mistake on, its explanation takes the place of Look for
    if (m) {
      html += toggleHTML(m.param)
      if (explaining) {
        html += `<div class="why"><p><b>What people do.</b> ${md(m.what, { wrap: true })}</p>${m.why ? `<p><b>Why it fails.</b> ${md(m.why, { wrap: true })}</p>` : ''}${m.fix ? `<p class="fix"><b>Do this instead.</b> ${md(m.fix, { wrap: true })}</p>` : ''}</div>`
      }
    }
    if (s.look?.length && !explaining) html += `<h3>Look for</h3><ol class="look">${s.look.map((x) => `<li>${md(x, { wrap: true })}</li>`).join('')}</ol>`
    if (s.steps?.length) html += `<h3>Try this</h3><ol class="try">${s.steps.map((x) => `<li>${md(x, { wrap: true })}</li>`).join('')}</ol>`
    if (s.cards?.length) html += s.cards.map((cd) => `<div class="card t-${cd.tone || 'muted'}"><h4>${md(cd.title)}</h4><p>${md(cd.html, { wrap: true })}</p></div>`).join('')
    if (s.kind === 'S' && f.stop.set && 'wrong' in f.stop.set && f.stop.set.wrong) html += '<p class="flag">The picture shows the mistake.</p>'
  } else if (st.tab === 'work') {
    const w = scene.working(c)
    html += w.blocks.map(([cap, latex, ans]) => `<div class="wb${ans ? ' ans' : ''}"><p class="wb-c">${md(cap)}</p><div class="wb-m">${tex(`\\begin{aligned}${latex}\\end{aligned}`, true)}</div></div>`).join('')
    if (w.note) html += `<p class="note">${md(w.note, { wrap: true })}</p>`
  } else {
    const k = scene.keys(c)
    html += (k.sections || []).map((sec) => `<div class="ks"><h3>${md(sec.goal)}</h3><ol>${sec.steps.map((x) => `<li>${md(x)}</li>`).join('')}</ol></div>`).join('')
    if (k.out) html += `<p class="out">${md(k.out)}</p>`
    if (k.watch) html += `<p class="watch"><b>Watch out.</b> ${md(k.watch, { wrap: true })}</p>`
  }
  setHTML($('panelBody'), html)
}

// ---------- events
document.addEventListener('input', (e) => {
  const p = e.target.dataset?.p
  if (p && e.target.type === 'range') setParam(p, Number(e.target.value))
})
document.addEventListener('click', (e) => {
  const t = e.target.closest('button')
  if (!t) return
  if (t.dataset.i != null && t.classList.contains('cb')) { const i = Number(t.dataset.i); go(i, i === st.i + 1 ? 'next' : 'jump') }
  else if (t.dataset.adv) { const d = Number(t.dataset.adv); go(st.i + d, d > 0 ? 'next' : 'back') }
  else if (t.dataset.tab) { st.tab = t.dataset.tab; render() }
  else if (t.dataset.replay) { const s = FLAT[st.i].stop; st.values = valuesAt(st.i); st.values[s.play.param] = s.set?.[s.play.param] ?? C.params[s.play.param].value; startAnim(s.play); render() }
  else if (t.dataset.toggle) setParam(t.dataset.toggle, !st.values[t.dataset.toggle])
  else if (t.dataset.val != null && t.dataset.p) setParam(t.dataset.p, t.dataset.val)
  else if (t.dataset.pick != null && st.picked[stopId(st.i)] == null) {
    st.picked[stopId(st.i)] = Number(t.dataset.pick)
    const s = FLAT[st.i].stop
    if (s.play) startAnim(s.play)
    render()
  } else if (t.id === 'resetBtn') { st.picked = {}; st.tab = 'notice'; go(0, 'jump') }
  else if (t.id === 'fsBtn') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.() }
})
document.addEventListener('keydown', (e) => {
  if (e.target.matches?.('input, select, textarea')) return
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(st.i + 1, 'next'); e.preventDefault() }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(st.i - 1, 'back'); e.preventDefault() }
  else if (e.key === 'Home') go(0, 'jump')
  else if (e.key === 'End') go(FLAT.length - 1, 'jump')
  else if (e.key === 'f' || e.key === 'F') $('fsBtn').click()
})

// the graph box changes size (window, full screen, phone): redraw so a filled aspect stays filled
let rq = 0
new ResizeObserver(() => { if (st && !rq) rq = requestAnimationFrame(() => { rq = 0; render() }) }).observe($('graph'))

function route() {
  const key = location.hash.slice(1)
  const c = byKey.get(key) || CONCEPTS[0]
  if (!c) { setHTML($('title'), 'No concepts yet'); return }
  if (c !== C) open(c)
}
buildMenus()
window.addEventListener('hashchange', route)
route()
// for the layout check
window.__concept = { go: (i, how = 'jump') => go(i, how), state: () => ({ i: st.i, n: FLAT.length, values: { ...st.values }, kind: FLAT[st.i].stop.kind }), stopAnim }
