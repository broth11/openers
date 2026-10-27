// Lesson openers shell.
// Finds every lesson module under lessons/<course>/, builds the Course > Unit > Lesson menu,
// and runs one lesson: scenes (or one open screen), the questions column with reveals,
// controls, the graph stage, and the working / keypress panel that slides in from the right.
// To add a lesson, drop a new module in lessons/<course>/. Nothing here changes.

import 'mathlive/fonts.css'
import 'mathlive/static.css'
import './shell.css'
import { md, tex, texWrap } from './kit/math.js'
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
// A lesson's identity in the menu. `tag` (for example 'stepped') makes a second, independent menu
// entry for the same unit and lesson: its own deep link (#mai-hl-u05-l02-stepped) and its own card,
// so a reworked lesson can sit beside the original for comparison without touching it. A `variant`
// is still the same lesson drawn another way, chosen by the header toggle and hidden from the menu.
const baseKey = (L) => `${L.course}-u${pad(L.unit)}-l${pad(L.lesson)}` + (L.tag ? `-${L.tag}` : '')
const keyOf = (L) => baseKey(L) + (L.variant ? `-${L.variant}` : '')

// ---------- registry
const modules = import.meta.glob('./lessons/*/*.js', { eager: true })
// A single-lesson build (npm run artifact) sets VITE_LESSON to one deep-link key
const ONLY = import.meta.env.VITE_LESSON || ''
const LESSONS = Object.values(modules)
  .map((m) => m.default)
  .filter((L) => L && L.course && L.scenes?.length)
  .filter((L) => !ONLY || baseKey(L) === ONLY)
  .sort((a, b) => a.course.localeCompare(b.course) || a.unit - b.unit || a.lesson - b.lesson || (a.tag ? 1 : 0) - (b.tag ? 1 : 0) || (a.variant ? 1 : 0) - (b.variant ? 1 : 0))
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
  return {
    scene: 0, values, revealed: new Set(), chosen: {}, open: false, show: 'work',
    // ---- stepped model (scenes with a `beats` array)
    // beat: index into the scene's beats, advanced with the stepper arrows just like old scenes.
    // step: per posed-question cumulative step position, keyed `${sceneIndex}:${questionId}`.
    // pick: which posed question the working pane is currently showing, per scene.
    beat: 0, step: {}, pick: {},
  }
}

// A scene is "stepped" when it declares a beats array. Old scenes (prompts + shown reveals) keep
// their exact behaviour; the shell branches on this one flag.
const isStepped = (sc) => Array.isArray(sc.beats)

// For stepped scenes, `shown(id)` means "this question has been posed by a beat at or before the
// current beat", so graph/readout code reads the same `shown` it always did. `beat` is the current
// beat index. Old scenes never see `beat` and keep using `shown` as a reveal flag.
function ctx() {
  const sc = L.scenes[S.scene]
  if (isStepped(sc)) {
    const posed = posedSet(sc, S.beat)
    return { v: S.values, beat: S.beat, shown: (id) => posed.has(id), posed }
  }
  return { v: S.values, shown: (id) => S.revealed.has(id) }
}
const scene = () => L.scenes[S.scene]

// The questions a scene's beats pose at or before beat index b, in beat order.
function posedList(sc, b) {
  const out = []
  sc.beats.forEach((beat, i) => { if (i <= b && beat.poses) out.push(beat.poses) })
  return out
}
function posedSet(sc, b) { return new Set(posedList(sc, b)) }
const promptById = (sc, id) => (sc.prompts || []).find((p) => p.id === id)
const stepKey = (id) => `${S.scene}:${id}`
// The ordered working steps for a posed question: prompt.steps = [{ caption, latex, answer, cue }]
const stepsFor = (sc, id) => (promptById(sc, id)?.steps || [])

// A scene with no working and no calculator steps has no panel. A stepped scene has a panel once a
// beat has posed a question that carries steps or keys.
function hasPanel(sc) {
  if (isStepped(sc)) {
    const posed = posedList(sc, S.beat)
    return posed.some((id) => { const p = promptById(sc, id); return p && (p.steps?.length || p.keys) })
  }
  return !!(sc.working || sc.keys)
}
const controlsOf = (sc) => (typeof sc.controls === 'function' ? sc.controls(ctx()) : sc.controls || [])

// The posed question the working pane shows. Defaults to the latest posed question for the scene.
function activePick(sc) {
  const posed = posedList(sc, S.beat).filter((id) => { const p = promptById(sc, id); return p && (p.steps?.length || p.keys) })
  if (!posed.length) return null
  const want = S.pick[S.scene]
  return posed.includes(want) ? want : posed[posed.length - 1]
}

// How many steps of the active question are revealed (cumulative). 0 means nothing stepped yet.
const stepPos = (id) => S.step[stepKey(id)] || 0
// Advance or reverse the active question's working by one step. Cumulative: position N shows 1..N.
function stepWorking(dir) {
  const sc = scene()
  const id = activePick(sc)
  if (!id) return
  const total = stepsFor(sc, id).length
  const k = stepKey(id)
  const n = Math.max(0, Math.min(total, (S.step[k] || 0) + dir))
  if (n === (S.step[k] || 0)) return
  S.step[k] = n
  renderPanel()
  renderGraph() // the active step may carry a graph cue
}
// The graph cue of the active question's current step, if any (merged into the beat's graph spec).
function activeCue() {
  const sc = scene()
  if (!isStepped(sc) || S.show !== 'work') return null
  const id = activePick(sc)
  if (!id) return null
  const pos = stepPos(id)
  if (!pos) return null
  const step = stepsFor(sc, id)[pos - 1]
  return step && step.cue ? step.cue(ctx()) : null
}

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
        const tag = x.tag ? `<span class="tag">${x.tagLabel || x.tag}</span>` : ''
        parts.push(
          cur
            ? `<span class="cur" aria-current="page"><span class="ln">L${x.lesson}</span>${x.title}${tag}</span>`
            : `<a href="#${k}" data-lesson="${k}"><span class="ln">L${x.lesson}</span>${x.title}${tag}</a>`,
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
  $('workBtn').hidden = !hasPanel(scene())
  if (!hasPanel(scene()) && S.open) setOpen(false)
  const multi = L.scenes.length > 1
  $('stepper').hidden = !multi
  if (multi) {
    const btns = L.scenes
      .map((sc, i) => `<button type="button" data-scene="${i}" aria-pressed="${i === S.scene}"><span class="sn">${i + 1}</span><span class="st">${sc.short}</span></button>`)
      .join('')
    // Arrows advance a beat (stepped scenes) or a scene (old scenes), rolling over at the ends.
    const atStart = S.scene === 0 && (!isStepped(scene()) || S.beat === 0)
    const atEnd = S.scene === L.scenes.length - 1 && (!isStepped(scene()) || S.beat === scene().beats.length - 1)
    setHTML(
      $('stepper'),
      `<button type="button" class="arrow" data-adv="-1" aria-label="Back" ${atStart ? 'disabled' : ''}>‹</button>${btns}<button type="button" class="arrow" data-adv="1" aria-label="Next" ${atEnd ? 'disabled' : ''}>›</button>`,
    )
  }
  // A beat ticker under the heading, only on stepped scenes with more than one beat.
  const sc = scene()
  const bt = $('beatBar')
  if (bt) {
    if (isStepped(sc) && sc.beats.length > 1) {
      bt.hidden = false
      setHTML(bt, sc.beats.map((_, i) => `<button type="button" class="beat-dot${i === S.beat ? ' on' : ''}${i < S.beat ? ' past' : ''}" data-beat="${i}" aria-label="Beat ${i + 1}" aria-pressed="${i === S.beat}"></button>`).join(''))
    } else {
      bt.hidden = true
    }
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

// ---------- recap cards: a scene with cards and no prompts shows knowledge that follows the controls
function cardsHtml(sc) {
  const cards = sc.cards(ctx()) || []
  return `<h2 class="col-h">${sc.cardsTitle || 'Key ideas'}</h2>${cards
    .map((c) => `<article class="rc${c.tone ? ' rc-' + c.tone : ''}"><h3>${md(c.title, { wrap: true })}</h3>${(c.lines || [])
      .map((l) => `<p>${md(l, { wrap: true })}</p>`)
      .join('')}${c.html || ''}</article>`)
    .join('')}<p class="hint">Change the controls: the cards follow what is on the graph.</p>`
}

// ---------- questions column
function renderQA() {
  const sc = scene()
  if (sc.cards && !(sc.prompts || []).length) { setHTML($('qa'), cardsHtml(sc)); $('qa').classList.add('recap'); return }
  $('qa').classList.remove('recap')
  if (isStepped(sc)) { renderSteppedQA(sc); return }
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

// Stepped scenes: the left pane poses the questions and never shows answers. Only questions the
// animation has reached (posed by a beat at or before the current beat) appear. A posed question
// with working is selectable; clicking it points the working pane at it.
function renderSteppedQA(sc) {
  const posed = posedList(sc, S.beat)
  const active = activePick(sc)
  const html = posed
    .map((id) => {
      const p = promptById(sc, id)
      if (!p) return ''
      const n = (sc.prompts || []).indexOf(p) + 1
      const chosen = S.chosen[p.id]
      const choices = p.choices
        ? `<div class="choices" role="group" aria-label="Prediction">${p.choices
            .map((c, j) => `<button type="button" class="${j === chosen ? 'picked' : ''}" data-choose="${p.id}" data-j="${j}" aria-pressed="${j === chosen}">${md(c, { wrap: true })}</button>`)
            .join('')}</div>`
        : ''
      const workable = !!(p.steps?.length || p.keys)
      const sel = workable && p.id === active ? ' sel' : ''
      const openAttr = workable ? ` data-pick="${p.id}" role="button" tabindex="0"` : ''
      const cue = workable ? `<p class="q-open">${p.id === active && S.open ? 'Working here →' : 'Open working'}</p>` : ''
      return `<article class="q posed${sel}" data-prompt="${p.id}"${openAttr}>
        <div class="qn">${n}</div>
        <div class="qb">
          <p class="qq">${md(p.q, { wrap: true })}</p>${choices}${cue}
        </div>
      </article>`
    })
    .join('')
  const hint = posed.length
    ? '<p class="hint">Step the scene to pose each question. Open its working on the right.</p>'
    : '<p class="hint">Step the scene to begin.</p>'
  setHTML($('qa'), `<h2 class="col-h">Questions</h2>${html}${hint}`)
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
      const play = p.play ? `<button type="button" class="play-btn" data-play="${id}" aria-label="Play ${p.label}" aria-pressed="${S.playing === id}">${S.playing === id ? '❚❚' : '▶'}</button>` : ''
      return `<div class="ctl"><label for="r-${id}"><span class="lab-l">${play}${p.label}</span><output id="o-${id}"></output></label>
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
  if (isStepped(sc)) { renderSteppedPanel(sc); return }
  const w = sc.working ? sc.working(ctx()) : null
  const k = sc.keys ? sc.keys(ctx()) : null
  const rows = w?.blocks
    ? `<div class="display-working">${w.blocks.map(([label, latex, answer]) => `<section class="work-block${answer ? ' answer' : ''}">
      <h3>${label}</h3><div class="work-equation">${tex(`\\begin{aligned}${latex}\\end{aligned}`, true)}</div>
    </section>`).join('')}</div>${w.note ? `<p class="note">${md(w.note, { wrap: true })}</p>` : ''}`
    : w
    ? `<div class="steps">${w.rows
        .map(([lbl, l, ans]) => `<span class="lbl">${lbl}</span><span class="rb${ans ? ' ans' : ''}">${texWrap(l)}</span>`)
        .join('')}</div>${w.note ? `<p class="note">${md(w.note, { wrap: true })}</p>` : ''}`
    : '<p class="note">No working for this scene.</p>'
  const keys = k
    ? `${(k.sections || [{ steps: k.steps }]).map((sec) => `<section class="goal-block">
         ${sec.goal ? `<h3 class="goal">${md(sec.goal, { wrap: true })}</h3>` : ''}
         <ol class="casio">${sec.steps.map((s) => `<li><span>${md(s, { wrap: true })}</span></li>`).join('')}</ol>
       </section>`).join('')}
       ${k.out ? `<p class="out-line">Display <span class="out">${k.out}</span></p>` : ''}
       ${k.watch ? `<p class="watch"><b>Watch out.</b> ${md(k.watch, { wrap: true })}</p>` : ''}`
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

// Stepped scenes: one posed question at a time, its working stepped cumulatively with Next/Back,
// the Working/Casio toggle scoped to that question.
function renderSteppedPanel(sc) {
  const posed = posedList(sc, S.beat).filter((id) => { const p = promptById(sc, id); return p && (p.steps?.length || p.keys) })
  const active = activePick(sc)
  if (!active) {
    setHTML($('pnl'), `<div class="phead"><span class="ptitle">Working</span><button type="button" class="pclose" id="pclose" aria-label="Close panel">×</button></div><div class="pbody"><p class="note">Step the scene to pose a question, then its working opens here.</p></div>`)
    return
  }
  const p = promptById(sc, active)
  const steps = stepsFor(sc, active)
  const pos = stepPos(active)
  const hasWork = steps.length > 0
  const hasKeys = !!p.keys
  // The toggle shows only the views this question has. Fall back to whichever it has.
  let show = S.show
  if (show === 'work' && !hasWork) show = 'calc'
  if (show === 'calc' && !hasKeys) show = 'work'

  // Question selector: one chip per posed workable question. The active one is pressed.
  const selector = posed.length > 1
    ? `<div class="qsel" role="group" aria-label="Question">${posed.map((id) => {
        const n = (sc.prompts || []).indexOf(promptById(sc, id)) + 1
        return `<button type="button" data-pick="${id}" aria-pressed="${id === active}" class="${id === active ? 'on' : ''}">Q${n}</button>`
      }).join('')}</div>`
    : ''

  const toggle = hasWork && hasKeys
    ? `<div class="seg sm" role="group" aria-label="Panel view">
        <button type="button" data-show="work" aria-pressed="${show === 'work'}">Working</button>
        <button type="button" data-show="calc" aria-pressed="${show === 'calc'}">Casio fx-CG50</button>
      </div>`
    : `<span class="ptitle">${show === 'calc' ? 'Casio fx-CG50' : 'Working'}</span>`

  let body
  if (show === 'work') {
    const shownSteps = steps.slice(0, pos)
    const blocks = shownSteps.length
      ? `<div class="display-working">${shownSteps.map((st, i) => `<section class="work-block${st.answer ? ' answer' : ''}${i === pos - 1 ? ' current' : ''}">
          ${st.caption ? `<h3>${md(st.caption, { wrap: true })}</h3>` : ''}
          ${st.latex ? `<div class="work-equation">${tex(`\\begin{aligned}${st.latex}\\end{aligned}`, true)}</div>` : ''}
          ${st.note ? `<p class="note">${md(st.note, { wrap: true })}</p>` : ''}
        </section>`).join('')}</div>`
      : `<p class="note">Press Next to work through it one step at a time.</p>`
    const controls = `<div class="step-nav">
        <button type="button" class="step-btn" data-wstep="-1" ${pos === 0 ? 'disabled' : ''} aria-label="Back one step">‹ Back</button>
        <span class="step-count">${pos} / ${steps.length}</span>
        <button type="button" class="step-btn" data-wstep="1" ${pos >= steps.length ? 'disabled' : ''} aria-label="Next step">Next ›</button>
      </div>`
    body = `${blocks}${controls}`
  } else {
    const k = typeof p.keys === 'function' ? p.keys(ctx()) : p.keys
    body = k
      ? `${(k.sections || [{ steps: k.steps }]).map((sec) => `<section class="goal-block">
           ${sec.goal ? `<h3 class="goal">${md(sec.goal, { wrap: true })}</h3>` : ''}
           <ol class="casio">${sec.steps.map((s) => `<li><span>${md(s, { wrap: true })}</span></li>`).join('')}</ol>
         </section>`).join('')}
         ${k.out ? `<p class="out-line">Display <span class="out">${k.out}</span></p>` : ''}
         ${k.watch ? `<p class="watch"><b>Watch out.</b> ${md(k.watch, { wrap: true })}</p>` : ''}`
      : '<p class="note">No calculator steps for this question.</p>'
  }

  setHTML(
    $('pnl'),
    `<div class="phead">${toggle}<button type="button" class="pclose" id="pclose" aria-label="Close panel">×</button></div>
     ${selector}
     <div class="pbody">${body}</div>`,
  )
  if (S.show !== show) S.show = show
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
  if (graph && sc.graph) {
    const spec = sc.graph(ctx())
    // A stepped scene's active working step may add a transient cue (extra items and labels).
    const cue = activeCue()
    if (cue && spec) {
      if (cue.items) spec.items = [...(spec.items || []), ...cue.items]
      if (cue.labels) spec.labels = [...(spec.labels || []), ...cue.labels]
    }
    graph.apply(spec)
  }
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
      if (scene().cards) renderQA()
    }
    renderGraph()
    if (S.open) renderPanel()
  })
}

// ---------- navigation
function openLesson(k, { push = true } = {}) {
  const next = byKey.get(k) || MAIN[MAIN.length - 1] || LESSONS[LESSONS.length - 1]
  if (!next) return
  cancelAnimationFrame(playRaf)
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

// ---------- play: a slider with play: { seconds } runs from its current value to its maximum
let playRaf = 0
function stopPlay() {
  cancelAnimationFrame(playRaf)
  if (S && S.playing) { S.playing = null; update({ full: true }) }
}
function startPlay(id) {
  const p = L.params[id]
  if (S.playing === id) { stopPlay(); return }
  cancelAnimationFrame(playRaf)
  if (S.values[id] >= p.max) S.values[id] = p.min
  S.playing = id
  update({ full: true })
  const rate = (p.max - p.min) / ((p.play.seconds || 10) * 1000)
  let last = performance.now()
  const tick = (now) => {
    if (S.playing !== id) return
    const v = Math.min(p.max, S.values[id] + rate * (now - last))
    last = now
    S.values[id] = +v.toFixed(6)
    if (v >= p.max) { S.playing = null; update({ full: true }); return }
    update()
    playRaf = requestAnimationFrame(tick)
  }
  playRaf = requestAnimationFrame(tick)
}

function goScene(i) {
  const n = Math.max(0, Math.min(L.scenes.length - 1, i))
  if (n === S.scene) return
  stopPlay()
  S.scene = n
  S.beat = 0
  update({ full: true })
}

// One beat within a stepped scene; clamps to the scene's beats.
function goBeat(i) {
  const sc = scene()
  if (!isStepped(sc)) return
  const n = Math.max(0, Math.min(sc.beats.length - 1, i))
  if (n === S.beat) return
  stopPlay()
  S.beat = n
  update({ full: true })
}

// The ‹ › arrows and the Left/Right keys. On a stepped scene they walk beats and roll into the next
// or previous scene at the ends; on an old scene they walk scenes, exactly as before.
function advance(dir) {
  const sc = scene()
  if (isStepped(sc)) {
    const next = S.beat + dir
    if (next >= 0 && next < sc.beats.length) { goBeat(next); return }
    const ns = S.scene + dir
    if (ns < 0 || ns >= L.scenes.length) return
    stopPlay()
    S.scene = ns
    S.beat = dir > 0 ? 0 : (isStepped(L.scenes[ns]) ? L.scenes[ns].beats.length - 1 : 0)
    update({ full: true })
    return
  }
  goScene(S.scene + dir)
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
  // A posed-question card (not a button) selects itself in the working pane.
  const card = e.target.closest('[data-pick]')
  if (card && !e.target.closest('button, a')) {
    S.pick[S.scene] = card.dataset.pick
    if (!S.open) setOpen(true)
    update({ full: true })
    return
  }
  const t = e.target.closest('button, a')
  if (!t) return
  if (t.dataset.lesson) { e.preventDefault(); openLesson(t.dataset.lesson); return }
  if (t.dataset.variant) { switchVariant(t.dataset.variant); return }
  if (t.dataset.scene) { goScene(+t.dataset.scene); return }
  if (t.dataset.adv) { advance(+t.dataset.adv); return }
  if (t.dataset.beat) { goBeat(+t.dataset.beat); return }
  if (t.dataset.step) { goScene(S.scene + +t.dataset.step); return } // old scenes (no beats)
  if (t.dataset.reveal) { S.revealed.add(t.dataset.reveal); update({ full: true }); return }
  if (t.dataset.pick) { S.pick[S.scene] = t.dataset.pick; renderPanel(); renderGraph(); return }
  if (t.dataset.wstep) { stepWorking(+t.dataset.wstep); return }
  if (t.dataset.choose) {
    if (isStepped(scene()) || !S.revealed.has(t.dataset.choose)) { S.chosen[t.dataset.choose] = +t.dataset.j; update({ full: true }) }
    return
  }
  if (t.dataset.play) { startPlay(t.dataset.play); return }
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
  if (S.playing === id) { cancelAnimationFrame(playRaf); S.playing = null }
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
  if (k === 'w') { if (hasPanel(scene())) setOpen(!S.open) }
  else if (k === 'f') toggleFs()
  else if (e.key === 'ArrowRight' || e.key === 'PageDown') advance(1)
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') advance(-1)
  else if (isStepped(scene())) {
    // Stepped scenes: S steps the working forward, Shift+S back (if the panel is open on a question).
    if (k === 's') { if (!S.open && hasPanel(scene())) setOpen(true); stepWorking(e.shiftKey ? -1 : 1) }
  } else if (k === 'r') {
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
