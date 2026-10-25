// Lesson openers shell.
// Finds every lesson module under lessons/<course>/, builds the Course > Unit > Lesson menu,
// and runs one lesson: scenes (or one open screen), the questions column with reveals,
// controls, the graph stage, and the working / keypress panel that slides in from the right.
// To add a lesson, drop a new module in lessons/<course>/. Nothing here changes.

import 'mathlive/fonts.css'
import 'mathlive/static.css'
import './shell.css'
import { md, tex } from './kit/math.js'
import { makeSvgGraph } from './kit/svg.js'
import { makeThreeGraph } from './kit/three.js'
import { makeInfoBoard } from './components/info-board/index.js'

// Graph engines by name. A lesson sets engine: 'svg' (the default). New engines (jsxgraph, three)
// are added here when a lesson first needs them, with the same apply/clear/destroy interface.
const ENGINES = { svg: makeSvgGraph, three: makeThreeGraph }
import { COURSES, EXPLORERS } from './lessons/courses.js'

const $ = (id) => document.getElementById(id)
const infoBoard = makeInfoBoard($('graph'), md)
const pad = (n) => String(n).padStart(2, '0')
const baseKey = (L) => `${L.course}-u${pad(L.unit)}-l${pad(L.lesson)}`
const keyOf = (L) => baseKey(L) + (L.variant ? `-${L.variant}` : '')

// ---------- registry
const modules = import.meta.glob('./lessons/*/*.js', { eager: true })
// A single-lesson build (npm run artifact) sets VITE_LESSON to one deep-link key
const ONLY = import.meta.env.VITE_LESSON || ''
const LESSONS = Object.values(modules)
  .map((m) => m.default)
  .filter((L) => L && L.course && L.scenes?.length)
  .filter((L) => !ONLY || `${L.course}-u${String(L.unit).padStart(2, '0')}-l${String(L.lesson).padStart(2, '0')}` === ONLY)
  .sort((a, b) => a.course.localeCompare(b.course) || a.unit - b.unit || a.lesson - b.lesson || (a.variant ? 1 : 0) - (b.variant ? 1 : 0))
const byKey = new Map(LESSONS.map((L) => [keyOf(L), L]))
// A variant (for example an SVG version) is the same lesson drawn another way; the default is the plain version.
const MAIN = LESSONS.filter((x) => !x.variant)
const siblingsOf = (x) => LESSONS.filter((y) => baseKey(y) === baseKey(x))
const engineOf = (x) => x.engine || 'svg'
const courseOf = (id) => COURSES.find((c) => c.id === id) || { id, name: id, accent: '#1572b8' }

// ---------- skip unchanged writes (clicks never land on a node that was just replaced)
function setHTML(el, html) {
  if (el.__h !== html) {
    el.innerHTML = html
    el.__h = html
  }
}

// ---------- state
let L = null
let S = null
let graph = null
let raf = 0

function freshState(lesson) {
  const values = {}
  for (const [k, p] of Object.entries(lesson.params || {})) values[k] = p.value
  return { scene: 0, values, revealed: new Set(), chosen: {}, open: false, show: 'work' }
}

const ctx = () => ({ v: S.values, shown: (id) => S.revealed.has(id) })
const scene = () => L.scenes[S.scene]
const controlsOf = (sc) => (typeof sc.controls === 'function' ? sc.controls(ctx()) : sc.controls || [])

// ---------- menu
function renderMenu() {
  const parts = []
  for (const c of COURSES) {
    const ls = MAIN.filter((x) => x.course === c.id)
    if (!ls.length) continue
    parts.push(`<span class="grp">${c.name}</span>`)
    const units = [...new Set(ls.map((x) => x.unit))]
    for (const u of units) {
      parts.push(`<span class="unit">Unit ${u}</span>`)
      for (const x of ls.filter((y) => y.unit === u)) {
        const k = keyOf(x)
        const cur = L && baseKey(L) === baseKey(x)
        parts.push(
          cur
            ? `<span class="cur" aria-current="page"><span class="ln">L${x.lesson}</span>${x.title}</span>`
            : `<a href="#${k}" data-lesson="${k}"><span class="ln">L${x.lesson}</span>${x.title}</a>`,
        )
      }
    }
  }
  parts.push(`<span class="grp sep">Explorers</span>`)
  for (const e of EXPLORERS) {
    parts.push(`<a href="${e.url}" target="_blank" rel="noopener"><span class="dot" style="background:${e.dot}"></span>${e.name}<small>${e.group}</small></a>`)
  }
  setHTML($('pnavMenu'), parts.join(''))
}

// ---------- header and stepper
function renderHeader() {
  const c = courseOf(L.course)
  document.documentElement.style.setProperty('--acc', c.accent)
  $('navDot').style.background = c.accent
  $('eyebrow').textContent = `${c.name} · Unit ${L.unit} · Lesson ${L.lesson}`
  $('lessonTitle').textContent = L.title
  document.title = `U${L.unit} L${L.lesson} ${L.title} · Lesson Openers`
  const sib = siblingsOf(L)
  $('engineSeg').hidden = sib.length < 2
  if (sib.length > 1) {
    setHTML($('engineSeg'), sib.map((x) => `<button type="button" data-variant="${keyOf(x)}" aria-pressed="${x === L}">${x.engineLabel || x.engine || 'SVG'}</button>`).join(''))
  }
  const multi = L.scenes.length > 1
  $('stepper').hidden = !multi
  if (multi) {
    const btns = L.scenes
      .map((sc, i) => `<button type="button" data-scene="${i}" aria-pressed="${i === S.scene}"><span class="sn">${i + 1}</span><span class="st">${sc.short}</span></button>`)
      .join('')
    setHTML(
      $('stepper'),
      `<button type="button" class="arrow" data-step="-1" aria-label="Previous scene" ${S.scene === 0 ? 'disabled' : ''}>‹</button>${btns}<button type="button" class="arrow" data-step="1" aria-label="Next scene" ${S.scene === L.scenes.length - 1 ? 'disabled' : ''}>›</button>`,
    )
  }
}

// Group successive equation lines into a single aligned display. Narrative stays in its own row.
function answerLines(lines) {
  const result = []
  let equations = []
  const flush = () => {
    if (!equations.length) return
    const latex = equations.map((line)=>line.replace(/=|\\approx/, (relation)=>'&'+relation)).join('\\\\[0.35em]')
    result.push(`<div class="answer-line answer-math">${tex(`\\begin{aligned}${latex}\\end{aligned}`, true)}</div>`)
    equations = []
  }
  for (const line of lines) {
    const match = line.match(/^\$([^$]+)\$$/)
    if (match && /=|\\approx/.test(match[1])) equations.push(match[1])
    else { flush(); result.push(`<div class="answer-line">${md(line, { wrap: true })}</div>`) }
  }
  flush()
  return result.join('')
}

// ---------- questions column
function renderQA() {
  const sc = scene()
  const html = (sc.prompts || [])
    .map((p, i) => {
      const shown = S.revealed.has(p.id)
      const chosen = S.chosen[p.id]
      const choices = p.choices
        ? `<div class="choices" role="group" aria-label="Prediction">${p.choices
            .map((c, j) => {
              const st = shown && j === p.correct ? 'ok' : shown && j === chosen ? 'no' : j === chosen ? 'picked' : ''
              return `<button type="button" class="${st}" data-choose="${p.id}" data-j="${j}" aria-pressed="${j === chosen}">${md(c, { wrap: true })}</button>`
            })
            .join('')}</div>`
        : ''
      return `<article class="q${shown ? ' done' : ''}" data-prompt="${p.id}">
        <div class="qn">${i + 1}</div>
        <div class="qb">
          <p class="qq">${md(p.q, { wrap: true })}</p>${choices}
          ${shown ? (p.aLines ? `<div class="qa-ans qa-rows">${answerLines(p.aLines)}</div>` : `<p class="qa-ans">${md(p.a, { wrap: true })}</p>`) : `<button type="button" class="reveal" data-reveal="${p.id}">Show answer</button>`}
        </div>
      </article>`
    })
    .join('')
  setHTML($('qa'), `<h2 class="col-h">Questions</h2>${html}<p class="hint">Write your answer first, then reveal.</p>`)
}

// ---------- controls
function renderControls() {
  const ids = controlsOf(scene())
  const html = ids
    .map((id) => {
      const p = L.params[id]
      const v = S.values[id]
      if (p.type === 'seg') {
        return `<div class="ctl seg-ctl"><span class="lab">${p.label}</span><div class="seg" role="group" aria-label="${p.label}">${p.options
          .map(([val, txt]) => `<button type="button" data-seg="${id}" data-val="${val}" aria-pressed="${val === v}">${txt}</button>`)
          .join('')}</div></div>`
      }
      return `<div class="ctl"><label for="r-${id}"><span>${p.label}</span><output id="o-${id}"></output></label>
        <input type="range" id="r-${id}" data-range="${id}" min="${p.min}" max="${p.max}" step="${p.step}" value="${v}" class="${p.sel ? 'sel' : ''}"></div>`
    })
    .join('')
  setHTML($('controls'), html)
  syncControls()
}

function syncControls() {
  for (const id of controlsOf(scene())) {
    const p = L.params[id]
    if (p.type !== 'range') continue
    const r = $(`r-${id}`)
    const o = $(`o-${id}`)
    if (!r) continue
    if (+r.value !== +S.values[id]) r.value = S.values[id]
    r.style.setProperty('--pct', `${((S.values[id] - p.min) / (p.max - p.min)) * 100}%`)
    setHTML(o, md(p.show ? p.show(S.values[id], S.values) : String(S.values[id])))
  }
}

// ---------- working panel
function renderPanel() {
  const sc = scene()
  const w = sc.working ? sc.working(ctx()) : null
  const k = sc.keys ? sc.keys(ctx()) : null
  const rows = w?.blocks
    ? `<div class="display-working">${w.blocks.map(([label, latex, answer]) => `<section class="work-block${answer ? ' answer' : ''}">
      <h3>${label}</h3><div class="work-equation">${tex(`\\begin{aligned}${latex}\\end{aligned}`, true)}</div>
    </section>`).join('')}</div>${w.note ? `<p class="note">${md(w.note)}</p>` : ''}`
    : w
    ? `<div class="steps">${w.rows
        .map(([lbl, l, ans]) => `<span class="lbl">${lbl}</span><span class="rb${ans ? ' ans' : ''}">${tex(l)}</span>`)
        .join('')}</div>${w.note ? `<p class="note">${md(w.note)}</p>` : ''}`
    : '<p class="note">No working for this scene.</p>'
  const keys = k
    ? `${(k.sections || [{ steps: k.steps }]).map((sec) => `<section class="goal-block">
         ${sec.goal ? `<h3 class="goal">${md(sec.goal)}</h3>` : ''}
         <ol class="casio">${sec.steps.map((s) => `<li><span>${md(s)}</span></li>`).join('')}</ol>
       </section>`).join('')}
       ${k.out ? `<p class="out-line">Display <span class="out">${k.out}</span></p>` : ''}
       ${k.watch ? `<p class="watch"><b>Watch out.</b> ${md(k.watch)}</p>` : ''}`
    : ''
  setHTML(
    $('pnl'),
    `<div class="phead"><div class="seg sm" role="group" aria-label="Panel view">
        <button type="button" data-show="work" aria-pressed="${S.show === 'work'}">Working</button>
        <button type="button" data-show="calc" aria-pressed="${S.show === 'calc'}">Casio fx-CG50</button>
      </div><button type="button" class="pclose" id="pclose" aria-label="Close panel">×</button></div>
     <div class="pbody">${S.show === 'work' ? rows : keys}</div>`,
  )
}

function setOpen(open) {
  S.open = open
  if (open) renderPanel()
  $('page').classList.toggle('panel-open', open)
  $('workBtn').setAttribute('aria-expanded', open)
  $('workBtn').setAttribute('aria-pressed', open)
  requestAnimationFrame(() => graph?.resize?.())
}

// ---------- graph and readout
function renderGraph() {
  const sc = scene()
  setHTML($('heading'), md(sc.heading || ''))
  setHTML($('readout'), sc.readout ? md(sc.readout(ctx())) : '')
  infoBoard.apply(sc.board ? sc.board(ctx()) : null)
  if (graph && sc.graph) graph.apply(sc.graph(ctx()))
}

// Batch updates into one frame. A full render requested earlier in the frame is never dropped.
let pendingFull = false
function update({ full = false } = {}) {
  pendingFull = pendingFull || full
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const doFull = pendingFull
    pendingFull = false
    if (doFull) {
      renderHeader()
      renderMenu()
      renderQA()
      renderControls()
    } else {
      syncControls()
    }
    renderGraph()
    if (S.open) renderPanel()
  })
}

// ---------- navigation
function openLesson(k, { push = true } = {}) {
  const next = byKey.get(k) || MAIN[MAIN.length - 1] || LESSONS[LESSONS.length - 1]
  if (!next) return
  L = next
  S = freshState(L)
  if (graph) graph.clear()
  ensureGraph()
  if (push) history.replaceState(null, '', `#${keyOf(L)}`)
  try { localStorage.setItem('openers:last', keyOf(L)) } catch { // storage blocked: nothing to remember
  }
  $('pnav').open = false
  setOpen(false)
  update({ full: true })
}

function goScene(i) {
  const n = Math.max(0, Math.min(L.scenes.length - 1, i))
  if (n === S.scene) return
  S.scene = n
  update({ full: true })
}

// Same lesson, other engine: keep the scene, values, reveals, and predictions.
function switchVariant(k) {
  const next = byKey.get(k)
  if (!next || next === L) return
  L = next
  history.replaceState(null, '', `#${keyOf(L)}`)
  try { localStorage.setItem('openers:last', keyOf(L)) } catch { // storage blocked: nothing to remember
  }
  ensureGraph()
  update({ full: true })
}

// ---------- graph engine
function onDrag(param, value) {
  const p = L.params[param]
  if (!p) return
  const v = Math.max(p.min, Math.min(p.max, Math.round(value / p.step) * p.step))
  if (v === S.values[param]) return
  S.values[param] = +v.toFixed(6)
  update()
}
function ensureGraph() {
  const engine = engineOf(L)
  if (graph && graph.engine === engine) return
  if (graph) { graph.destroy(); graph = null }
  const msg = $('graphMsg')
  const make = ENGINES[engine]
  if (!make) {
    msg.hidden = false
    msg.textContent = `This lesson asks for the "${engine}" graph engine, which is not in this kit yet.`
    msg.classList.add('err')
    return
  }
  msg.hidden = true
  graph = make($('graph'), { renderLabel: md, onDrag })
  update()
}

// ---------- events
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, a')
  if (!t) return
  if (t.dataset.lesson) { e.preventDefault(); openLesson(t.dataset.lesson); return }
  if (t.dataset.variant) { switchVariant(t.dataset.variant); return }
  if (t.dataset.scene) { goScene(+t.dataset.scene); return }
  if (t.dataset.step) { goScene(S.scene + +t.dataset.step); return }
  if (t.dataset.reveal) { S.revealed.add(t.dataset.reveal); update({ full: true }); return }
  if (t.dataset.choose) {
    if (!S.revealed.has(t.dataset.choose)) { S.chosen[t.dataset.choose] = +t.dataset.j; update({ full: true }) }
    return
  }
  if (t.dataset.seg) { S.values[t.dataset.seg] = t.dataset.val; update({ full: true }); return }
  if (t.dataset.show) { S.show = t.dataset.show; renderPanel(); return }
  if (t.id === 'pclose') { setOpen(false); return }
  if (t.id === 'workBtn') { setOpen(!S.open); return }
  if (t.id === 'resetBtn') { openLesson(keyOf(L), { push: false }); return }
  if (t.id === 'fsBtn') { toggleFs(); return }
})

document.addEventListener('input', (e) => {
  const id = e.target.dataset?.range
  if (!id) return
  S.values[id] = +e.target.value
  update()
})

// close the menu on an outside click
document.addEventListener('pointerdown', (e) => {
  const nav = $('pnav')
  if (nav.open && !nav.contains(e.target)) nav.open = false
})

function toggleFs() {
  const d = document
  if (d.fullscreenElement) d.exitFullscreen?.().catch(() => {})
  else d.documentElement.requestFullscreen?.().catch(() => {})
}
document.addEventListener('fullscreenchange', () => $('fsBtn').setAttribute('aria-pressed', !!document.fullscreenElement))

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target.tagName || '').toLowerCase()
  const inRange = tag === 'input' && e.target.type === 'range'
  if (tag === 'input' && !inRange) return
  if (e.key === 'Escape') { if (S.open) setOpen(false); $('pnav').open = false; return }
  if (inRange) return
  const k = e.key.toLowerCase()
  if (k === 'w') setOpen(!S.open)
  else if (k === 'f') toggleFs()
  else if (e.key === 'ArrowRight' || e.key === 'PageDown') goScene(S.scene + 1)
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goScene(S.scene - 1)
  else if (k === 'r') {
    const p = (scene().prompts || []).find((q) => !S.revealed.has(q.id))
    if (p) { S.revealed.add(p.id); update({ full: true }) }
  }
})

window.addEventListener('hashchange', () => {
  const k = location.hash.slice(1)
  if (byKey.has(k) && (!L || keyOf(L) !== k)) openLesson(k, { push: false })
})

// ---------- start
function start() {
  if (!LESSONS.length) {
    $('lessonTitle').textContent = 'No lessons yet'
    return
  }
  let k = location.hash.slice(1)
  if (!byKey.has(k)) {
    try { k = localStorage.getItem('openers:last') } catch { k = null }
  }
  openLesson(byKey.has(k) ? k : keyOf(MAIN[MAIN.length - 1] || LESSONS[LESSONS.length - 1]))
}

start()
