// Layout check for the openers page: real rendering, every scene, reveal, slider end and switch.
// Usage: npm run build && npm run serve (another terminal) && node qa/check.mjs mai-hl-u11-l09
// Writes one screenshot per scene and size to qa/out/ and prints one JSON line per check.
// Also fails when the graph, heading, controls or questions move more than 0.5 px while a slider sweeps.
import { createRequire } from 'module'
import { mkdirSync } from 'fs'
import { execSync } from 'child_process'
import { walkCheck } from './walk-check.mjs'

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require('playwright')) } catch {
  ({ chromium } = require(execSync('npm root -g').toString().trim() + '/playwright'))
}
const key = process.argv[2] || ''
const base = process.env.OPENERS_URL || 'http://127.0.0.1:4173/'
const here = new URL('.', import.meta.url)
const outDir = new URL(process.env.OPENERS_QA_DIR || './out/', here)
mkdirSync(outDir, { recursive: true })

const sizes = [[1366, 768], [1440, 860], [1920, 1080], [412, 900]]
const browser = await chromium.launch(process.env.OPENERS_CHROME ? { executablePath: process.env.OPENERS_CHROME } : {})
let failures = 0
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
  await page.goto(base + (key ? '#' + key : ''), { waitUntil: 'load' })
  await page.waitForTimeout(500)
  // Walk lessons (walk: true) have the bottom timeline instead of scene chips: qa/walk-check.mjs.
  if (await page.locator('#timeline:not([hidden]) .tl-b').count()) {
    failures += await walkCheck(page, w, h, outDir)
    if (errs.length) { failures++; console.log(JSON.stringify({ size: `${w}x${h}`, pageErrors: errs })) }
    await page.close()
    continue
  }
  const n = Math.max(1, await page.locator('#stepper [data-scene]').count())
  const stability = []
  for (let s = 0; s < n; s++) {
    if (await page.locator(`#stepper [data-scene="${s}"]`).count()) { await page.click(`#stepper [data-scene="${s}"]`); await page.waitForTimeout(150) }
    // Stepped scenes: walk every beat so each posed question is exercised, ending on the last beat
    // (all questions posed). The panel pass below then steps each one's working to its tallest state.
    const stepped = await page.locator('#beatBar:not([hidden]) .beat-dot').count() > 1
    if (stepped) {
      const lastDot = page.locator('#beatBar .beat-dot').last()
      if (await lastDot.isVisible()) { await lastDot.click(); await page.waitForTimeout(200) }
      else { for (let b = 1; b < await page.locator('#beatBar .beat-dot').count(); b++) await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200) }
    }
    // Reveal discipline: with every question posed but NO working stepped yet, no model equation
    // (a function label carries an "=" / "≈") may be on the graph, and no answer value may be in the
    // readout. Answers must wait for the working step that derives them, never appear on posing.
    if (stepped) {
      const leak = await page.evaluate(() => {
        const eqLabels = [...document.querySelectorAll('.dl:not([hidden])')]
          .map((n) => n.textContent.trim())
          .filter((t) => /[=≈]/.test(t))
        const readout = document.querySelector('#readout')?.textContent || ''
        const readoutLeak = /[=≈]\s*-?\d/.test(readout.replace(/t\s*=|d\s*=/g, '')) // a computed value, not "t ="
        return { eqLabels, readoutLeak, readout: readout.slice(0, 80) }
      })
      const bad = leak.eqLabels.length > 0 || leak.readoutLeak
      if (bad) failures++
      console.log(JSON.stringify({ size: `${w}x${h}`, scene: s + 1, revealDiscipline: !bad, ...(bad ? leak : {}) }))
    }
    for (const panel of [false, true]) {
      // a scene without working or calculator steps hides its Working button: nothing to open
      if (panel && !(await page.locator('#workBtn').isVisible())) continue
      if (panel) {
        await page.click('#workBtn'); await page.waitForTimeout(600)
        // Stepped panel: for each posed question, step its working fully out (tallest state) and
        // check overflow/scroll there, which is where a stepped scene is most at risk.
        const picks = await page.locator('.qsel button').count()
        const nq = Math.max(1, picks)
        for (let qi = 0; qi < nq; qi++) {
          if (picks && await page.locator('.qsel button').nth(qi).isVisible()) { await page.locator('.qsel button').nth(qi).click(); await page.waitForTimeout(120) }
          let guard = 0
          while (await page.locator('.step-btn[data-wstep="1"]:not([disabled])').count() && await page.locator('.step-btn[data-wstep="1"]').isVisible() && guard++ < 20) {
            await page.locator('.step-btn[data-wstep="1"]').click(); await page.waitForTimeout(90)
          }
          if (await page.locator('.step-btn').count()) {
            const sm = await page.evaluate(() => {
              const pnl = document.querySelector('.pnl')
              const body = document.querySelector('.pbody')
              return {
                panelHScroll: pnl.scrollWidth > pnl.clientWidth + 1,
                panelScrolls: pnl.scrollHeight > pnl.clientHeight + 2,
                bodyScrolls: body ? body.scrollHeight > body.clientHeight + 2 : false,
                workingOverflow: [...document.querySelectorAll('.work-equation')].filter((n) => n.scrollWidth > n.clientWidth + 1).length,
              }
            })
            const sbad = sm.panelHScroll || sm.panelScrolls || sm.workingOverflow
            if (sbad) failures++
            console.log(JSON.stringify({ size: `${w}x${h}`, scene: s + 1, steppedQ: qi + 1, ok: !sbad, ...sm }))
          }
        }
      } else {
        if (await page.locator('.choices button').count()) { await page.locator('.choices button').first().click(); await page.waitForTimeout(60) }
        while (await page.locator('.reveal').count()) { await page.locator('.reveal').first().click(); await page.waitForTimeout(60) }
        // nothing moves when a slider moves (rule from aasl-online-lesson-deck): sweep each slider
        // over its range and record how far the graph, its heading and the controls shift
        const moved = await page.evaluate(async () => {
          const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
          const boxes = () => ['.graph', '.controls', '.stage-head', '.qa'].map((q) => document.querySelector(q).getBoundingClientRect())
          let worst = 0
          for (const el of [...document.querySelectorAll('.controls input[type=range]')]) {
            const id = el.id
            const base = boxes()
            const lo = +el.min, hi = +el.max
            for (let i = 0; i <= 12; i++) {
              const input = document.getElementById(id)
              if (!input) break
              input.value = lo + ((hi - lo) * i) / 12
              input.dispatchEvent(new Event('input', { bubbles: true }))
              await frame()
              boxes().forEach((b, j) => { worst = Math.max(worst, Math.abs(b.top - base[j].top), Math.abs(b.height - base[j].height), Math.abs(b.left - base[j].left)) })
            }
            const input = document.getElementById(id)
            if (input) { input.value = input.max; input.dispatchEvent(new Event('input', { bubbles: true })); await frame() }
          }
          return Math.round(worst * 10) / 10
        })
        stability.push({ scene: s + 1, moved })
        // Click each segmented control. A toggle (for example Factored/Standard) can change which
        // controls show, so re-read the live count each step and skip indices that no longer exist.
        const segs = await page.locator('.controls .seg button').count()
        for (let i = segs - 1; i >= 0; i--) {
          const btns = page.locator('.controls .seg button')
          if (i >= await btns.count()) continue
          const b = btns.nth(i)
          if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await page.waitForTimeout(100) }
        }
      }
      const m = await page.evaluate(() => {
        const de = document.documentElement
        const pnl = document.querySelector('.pnl')
        const qa = document.querySelector('.qa')
        const g = document.querySelector('.graph').getBoundingClientRect()
        const out = [...document.querySelectorAll('.dl:not([hidden])')].filter((n) => {
          const r = n.getBoundingClientRect()
          return r.left < g.left - 1 || r.right > g.right + 1 || r.top < g.top - 1 || r.bottom > g.bottom + 1
        }).map((n) => n.textContent.slice(0, 24))
        const answerMathOverflow = [...document.querySelectorAll('.answer-math')].some((n)=>n.scrollWidth>n.clientWidth+1)
        const answerRowsClash = [...document.querySelectorAll('.qa-rows')].some((g) => [...g.children].some((n,i,rows) => i > 0 && n.getBoundingClientRect().top - rows[i-1].getBoundingClientRect().bottom < 4))
        const workingOverflow = [...document.querySelectorAll('.work-equation')].filter((n) => n.scrollWidth > n.clientWidth + 1).length
        // A control label that wraps to a second line changes its row height and shoves the slider
        // down: a label taller than ~1.8 of its own line-height has wrapped.
        const labelWrap = [...document.querySelectorAll('.ctl label, .ctl .lab')].filter((n) => {
          const lh = parseFloat(getComputedStyle(n).lineHeight) || 20
          return n.getBoundingClientRect().height > lh * 1.8
        }).map((n) => n.textContent.trim().slice(0, 24))
        return { answerMathOverflow, answerRowsClash, hscroll: de.scrollWidth > de.clientWidth + 1, panelHScroll: pnl.scrollWidth > pnl.clientWidth + 1, workingOverflow, panelScrolls: pnl.scrollHeight > pnl.clientHeight + 2, questionsScroll: qa.scrollHeight > qa.clientHeight + 2, labelsOutside: out, labelWrap }
      })
      const shift = panel ? 0 : stability.find((x) => x.scene === s + 1)?.moved || 0
      m.shiftWhileSliding = shift
      const bad = m.answerMathOverflow || m.answerRowsClash || m.hscroll || m.panelHScroll || m.workingOverflow || m.panelScrolls || (w > 860 && m.questionsScroll) || m.labelsOutside.length || m.labelWrap.length || (w > 860 && shift > 0.5)
      if (bad) failures++
      console.log(JSON.stringify({ size: `${w}x${h}`, scene: s + 1, panel, ok: !bad, ...m }))
      await page.screenshot({ path: new URL(`${w}x${h}-s${s + 1}${panel ? '-panel' : ''}.png`, outDir).pathname })
      if (panel) {
        if (await page.locator('#pclose').isVisible()) await page.click('#pclose')
        else await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }
    }
  }
  if (errs.length) { failures++; console.log(JSON.stringify({ size: `${w}x${h}`, pageErrors: errs })) }
  await page.close()
}
await browser.close()
console.log(failures ? `FAILED: ${failures} check(s)` : 'All layout checks passed')
process.exit(failures ? 1 : 0)
