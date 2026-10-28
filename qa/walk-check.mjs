// Layout and behaviour check for walk lessons (lessons with walk: true), called from qa/check.mjs.
// It drives the real page at one viewport size and checks:
//   - the bottom timeline: one segment per beat, one distinct colour per beat kind, scene starts marked
//   - the 2/5 : 3/5 split, no sideways scroll, the left pane never scrolling (wide screens)
//   - every beat reached by a jump: labels inside the graph, no overflowing working or labels that wrap
//   - reveal discipline: a scene's first beat and every question's pose beat add no answer to the graph
//     or the readout, and show no working
//   - determinism: the state at every beat is the same going forward, going back, and after random jumps
//   - slider stability, pause and resume, snap-back after free play, and the one-time animation on Next
import { mkdirSync } from 'fs'

const fingerprint = (page) =>
  page.evaluate(() => {
    const txt = (s) => (document.querySelector(s)?.textContent || '').replace(/\s+/g, ' ').trim()
    const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h }
    return {
      pane: txt('#qa'),
      heading: txt('#heading'),
      readout: txt('#readout'),
      labels: [...document.querySelectorAll('.dl:not([hidden])')].map((n) => n.textContent.trim()).sort(),
      sliders: Object.fromEntries([...document.querySelectorAll('.controls input[type=range]')].map((r) => [r.id, r.value])),
      // the drawing, with the label boxes taken out: the placer reuses its boxes in any order, so each
      // label is compared by name, position, and colour instead of by where it sits in the markup
      graph: (() => {
        const c = document.querySelector('#graph').cloneNode(true)
        c.querySelectorAll('.dl').forEach((n) => n.remove())
        const boxes = [...document.querySelectorAll('#graph .dl:not([hidden])')].map((n) => `${n.dataset.label}@${n.style.transform}/${n.style.color}`).sort()
        return hash(c.innerHTML + boxes.join('|'))
      })(),
      count: txt('#tlCount'),
    }
  })

const diffKeys = (a, b) => Object.keys(a).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]))

export async function walkCheck(page, w, h, outDir) {
  mkdirSync(outDir, { recursive: true })
  const size = `${w}x${h}`
  const wide = w > 860
  let failures = 0
  const report = (name, ok, extra = {}) => {
    if (!ok) failures++
    console.log(JSON.stringify({ size, walk: name, ok, ...(ok ? {} : extra) }))
  }
  const jump = async (i) => { await page.evaluate((k) => document.querySelector(`.tl-b[data-wbeat="${k}"]`).click(), i); await page.waitForTimeout(110) }
  const n = await page.locator('.tl-b').count()
  const kinds = await page.evaluate(() => [...document.querySelectorAll('.tl-b')].map((b) => (b.className.match(/k-(\w+)/) || [])[1]))

  // ---------- the bar itself
  const tl = await page.evaluate(() => {
    const r = document.querySelector('#timeline').getBoundingClientRect()
    const color = (k) => { const el = document.querySelector(`.tl-b.k-${k}`); return el ? getComputedStyle(el).backgroundColor : null }
    const present = ['scene', 'pose', 'step', 'answer', 'animate'].filter((k) => document.querySelector(`.tl-b.k-${k}`))
    const colors = present.map(color)
    const seg = [...document.querySelectorAll('.tl-b')].map((b) => b.getBoundingClientRect().width)
    return { visible: r.height > 0 && r.left >= -1 && r.right <= innerWidth + 1, present, colors, distinct: new Set(colors).size === colors.length, minSeg: Math.min(...seg) }
  })
  report('timeline', n >= 2 && tl.visible && tl.distinct && tl.minSeg >= 2 && tl.present.includes('scene') && tl.present.includes('pose'), { n, ...tl })
  if (wide) {
    const ratio = await page.evaluate(() => {
      const a = document.querySelector('#qa').getBoundingClientRect().width
      const b = document.querySelector('.stage').getBoundingClientRect().width
      return Math.round((a / (a + b)) * 1000) / 1000
    })
    report('split 2/5 : 3/5', Math.abs(ratio - 0.4) < 0.02, { ratio })
  }

  // ---------- every beat, going forward by jumps
  const fwd = []
  let lastSweep = ''
  for (let i = 0; i < n; i++) {
    await jump(i)
    await page.waitForTimeout(60)
    fwd[i] = await fingerprint(page)
    const m = await page.evaluate(() => {
      const de = document.documentElement
      const qa = document.querySelector('#qa')
      const g = document.querySelector('.graph').getBoundingClientRect()
      const out = [...document.querySelectorAll('.dl:not([hidden])')].filter((nn) => {
        const r = nn.getBoundingClientRect()
        return r.left < g.left - 1 || r.right > g.right + 1 || r.top < g.top - 1 || r.bottom > g.bottom + 1
      }).map((nn) => nn.textContent.slice(0, 24))
      const labelWrap = [...document.querySelectorAll('.ctl label, .ctl .lab')].filter((nn) => {
        const lh = parseFloat(getComputedStyle(nn).lineHeight) || 20
        return nn.getBoundingClientRect().height > lh * 1.8
      }).map((nn) => nn.textContent.trim().slice(0, 24))
      return {
        hscroll: de.scrollWidth > de.clientWidth + 1,
        paneScrolls: qa.scrollHeight > qa.clientHeight + 2,
        paneHScroll: qa.scrollWidth > qa.clientWidth + 1,
        workingOverflow: [...document.querySelectorAll('.work-equation')].filter((nn) => nn.scrollWidth > nn.clientWidth + 1).length,
        answerMathOverflow: [...document.querySelectorAll('.answer-math')].some((nn) => nn.scrollWidth > nn.clientWidth + 1),
        labelsOutside: out, labelWrap,
        works: document.querySelectorAll('#qa .work-block').length,
        questions: document.querySelectorAll('#qa .q.posed').length,
        folded: document.querySelectorAll('#qa .work-block.collapsed').length,
      }
    })
    const bad = m.hscroll || m.paneHScroll || m.workingOverflow || m.answerMathOverflow || m.labelsOutside.length || m.labelWrap.length || (wide && m.paneScrolls)
    if (bad) failures++
    if (bad) console.log(JSON.stringify({ size, beat: i + 1, kind: kinds[i], ok: false, ...m }))
    // reveal discipline: a scene's first beat and each pose beat show no working, and add nothing to the graph
    if (kinds[i] === 'scene' && !(await page.locator('#qa.recap').count())) {
      report(`beat ${i + 1} scene start shows no question or working`, m.works === 0 && m.questions === 0, m)
    }
    if (kinds[i] === 'pose' && i > 0) {
      const prev = fwd[i - 1]
      const added = fwd[i].labels.filter((l) => !prev.labels.includes(l))
      const same = fwd[i].readout === prev.readout && JSON.stringify(fwd[i].sliders) === JSON.stringify(prev.sliders)
      report(`beat ${i + 1} pose adds no answer`, m.works === 0 && m.questions === 1 && added.length === 0 && same, { added, readout: [prev.readout, fwd[i].readout], works: m.works })
    }
    // a scene's first beat: no model equation on the graph and no computed value in the readout
    if (kinds[i] === 'scene' && !(await page.locator('#qa.recap').count())) {
      const leak = fwd[i].labels.filter((t) => /[=≈]/.test(t)).length > 0 || /[=≈]\s*-?\d/.test(fwd[i].readout.replace(/t\s*=|d\s*=/g, ''))
      report(`beat ${i + 1} scene start reveals nothing`, !leak, { labels: fwd[i].labels, readout: fwd[i].readout })
    }
    // slider stability: sweep each slider and measure how far the graph, controls, heading, and pane shift
    const sig = (await page.locator('.controls input[type=range]').evaluateAll((els) => els.map((e) => e.id))).join(',')
    if (sig && sig !== lastSweep) {
      lastSweep = sig
      const moved = await page.evaluate(async () => {
        const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        const boxes = () => ['.graph', '.controls', '.stage-head', '#qa'].map((q) => document.querySelector(q).getBoundingClientRect())
        let worst = 0
        for (const el of [...document.querySelectorAll('.controls input[type=range]')]) {
          const id = el.id
          const base = boxes()
          const lo = +el.min, hi = +el.max
          for (let k = 0; k <= 12; k++) {
            const input = document.getElementById(id)
            if (!input) break
            input.value = lo + ((hi - lo) * k) / 12
            input.dispatchEvent(new Event('input', { bubbles: true }))
            await frame()
            boxes().forEach((b, j) => { worst = Math.max(worst, Math.abs(b.top - base[j].top), Math.abs(b.height - base[j].height), Math.abs(b.left - base[j].left)) })
          }
        }
        return Math.round(worst * 10) / 10
      })
      report(`beat ${i + 1} nothing moves while a slider moves`, !wide || moved <= 0.5, { moved })
      await jump(i) // the sweep is free play; the jump snaps it back
      await page.waitForTimeout(60)
    }
    // the recap's switches: click each one and look again
    if (await page.locator('#qa.recap').count() && i === n - 1) {
      const segs = await page.locator('.controls .seg button').count()
      for (let k = segs - 1; k >= 0; k--) {
        const btns = page.locator('.controls .seg button')
        if (k >= await btns.count()) continue
        if (await btns.nth(k).isVisible().catch(() => false)) { await btns.nth(k).click().catch(() => {}); await page.waitForTimeout(100) }
      }
      const r = await page.evaluate(() => ({ hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, paneScrolls: document.querySelector('#qa').scrollHeight > document.querySelector('#qa').clientHeight + 2 }))
      report('recap switches', !r.hscroll && !(wide && r.paneScrolls), r)
      await jump(i)
    }
    if (kinds[i] === 'scene' || i === n - 1 || i % 11 === 5) {
      await page.screenshot({ path: new URL(`${size}-walk-b${String(i + 1).padStart(2, '0')}.png`, outDir).pathname })
    }
  }
  report('every beat fits (no sideways scroll, no scrolling pane, labels inside the graph)', true)

  // ---------- determinism: the same state going back, and after jumps in a scrambled order
  const back = []
  for (let i = n - 1; i >= 0; i--) { await jump(i); await page.waitForTimeout(40); back[i] = await fingerprint(page) }
  const backBad = back.map((f, i) => ({ beat: i + 1, keys: diffKeys(fwd[i], f) })).filter((x) => x.keys.length)
  report('going back reproduces every beat', backBad.length === 0, { first: backBad.slice(0, 3) })
  const order = [...Array(n).keys()].sort((a, b) => ((a * 7) % n) - ((b * 7) % n))
  const jumbled = []
  for (const i of order) { await jump(i); await page.waitForTimeout(40); const f = await fingerprint(page); const d = diffKeys(fwd[i], f); if (d.length) jumbled.push({ beat: i + 1, keys: d }) }
  report('jumping in any order reproduces every beat', jumbled.length === 0, { first: jumbled.slice(0, 3) })

  // ---------- slider snap, pause, and resume at the first beat that has a slider
  const firstSlider = fwd.findIndex((f) => Object.keys(f.sliders).length > 0)
  if (firstSlider >= 0 && firstSlider < n - 1) {
    await jump(firstSlider)
    const before = await fingerprint(page)
    const id = Object.keys(before.sliders)[0]
    const mv = await page.evaluate((sid) => {
      const el = document.getElementById(sid)
      const to = +el.value === +el.max ? el.min : el.max
      el.value = to
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return +to
    }, id)
    await page.waitForTimeout(80)
    const moved = (await fingerprint(page)).sliders[id]
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(150)
    await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(150)
    const after = await fingerprint(page)
    report('free play snaps back to the authored state on Next then Back', +moved === mv && after.sliders[id] === before.sliders[id], { id, authored: before.sliders[id], afterBack: after.sliders[id] })

    const sliders0 = Object.keys(after.sliders).length
    await page.keyboard.press('p'); await page.waitForTimeout(150)
    const paused = await page.evaluate(() => ({ label: document.querySelector('#pauseBtn').textContent.trim(), pressed: document.querySelector('#pauseBtn').getAttribute('aria-pressed'), cls: document.querySelector('#page').classList.contains('paused'), sliders: document.querySelectorAll('.controls input[type=range]').length }))
    report('pause unlocks free play and says Resume', paused.label === 'Resume' && paused.pressed === 'true' && paused.cls && paused.sliders >= sliders0, paused)
    await page.evaluate((sid) => { const el = document.getElementById(sid); if (el) { el.value = el.max === el.value ? el.min : el.max; el.dispatchEvent(new Event('input', { bubbles: true })) } }, id)
    await page.keyboard.press('p'); await page.waitForTimeout(150)
    const resumed = await fingerprint(page)
    const lbl = await page.locator('#pauseBtn').textContent()
    report('resume snaps back to the beat', resumed.sliders[id] === before.sliders[id] && lbl.trim() === 'Pause' && !diffKeys(before, resumed).filter((k) => k !== 'graph').length, { id, authored: before.sliders[id], resumed: resumed.sliders[id], diff: diffKeys(before, resumed) })
  }

  // ---------- animation: plays once on Next, never on a jump or on Back
  const anim = kinds.indexOf('animate')
  if (anim > 0) {
    await jump(anim - 1)
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450)
    const playing = await page.evaluate(() => {
      const btn = document.querySelector('.controls .play-btn[aria-pressed="true"]')
      if (!btn) return { playing: false }
      const r = document.getElementById(btn.dataset.play.replace(/^/, 'r-'))
      return { playing: true, value: +r.value, min: +r.min, max: +r.max }
    })
    report('Next onto an animation beat plays the slider', playing.playing && playing.value > playing.min && playing.value < playing.max, playing)
    await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(200)
    const stopped = await page.locator('.controls .play-btn[aria-pressed="true"]').count()
    const back2 = await fingerprint(page)
    report('Back stops the sweep and restores the previous beat', stopped === 0 && diffKeys(fwd[anim - 1], back2).filter((k) => k !== 'graph').length === 0, { stopped, diff: diffKeys(fwd[anim - 1], back2) })
    await jump(anim); await page.waitForTimeout(250)
    const landed = await page.evaluate(() => ({ playing: document.querySelectorAll('.controls .play-btn[aria-pressed="true"]').length, atMax: [...document.querySelectorAll('.controls input[type=range]')].some((r) => +r.value === +r.max) }))
    report('a jump onto an animation beat shows the finished state with no replay', landed.playing === 0 && landed.atMax, landed)
  }
  return failures
}
