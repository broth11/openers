// Layout check for the openers page: real rendering, every scene, reveal, slider end and switch.
// Usage: npm run build && npm run serve (another terminal) && node qa/check.mjs mai-hl-u11-l09
// Writes one screenshot per scene and size to qa/out/ and prints one JSON line per check.
// Also fails when the graph, heading, controls or questions move more than 0.5 px while a slider sweeps.
import { createRequire } from 'module'
import { mkdirSync } from 'fs'
import { execSync } from 'child_process'

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require('playwright')) } catch {
  ({ chromium } = require(execSync('npm root -g').toString().trim() + '/playwright'))
}
const key = process.argv[2] || ''
const base = process.env.OPENERS_URL || 'http://127.0.0.1:4173/'
const here = new URL('.', import.meta.url)
const outDir = new URL('./out/', here)
mkdirSync(outDir, { recursive: true })

const sizes = [[1366, 768], [1440, 860], [1920, 1080], [412, 900]]
const browser = await chromium.launch()
let failures = 0
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
  await page.goto(base + (key ? '#' + key : ''), { waitUntil: 'load' })
  await page.waitForTimeout(500)
  const n = Math.max(1, await page.locator('#stepper [data-scene]').count())
  const stability = []
  for (let s = 0; s < n; s++) {
    if (await page.locator(`#stepper [data-scene="${s}"]`).count()) { await page.click(`#stepper [data-scene="${s}"]`); await page.waitForTimeout(150) }
    for (const panel of [false, true]) {
      if (panel) { await page.click('#workBtn'); await page.waitForTimeout(600) } else {
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
        const segs = await page.locator('.controls .seg button').count()
        for (let i = segs - 1; i >= 0; i--) { await page.locator('.controls .seg button').nth(i).click(); await page.waitForTimeout(100) }
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
        return { hscroll: de.scrollWidth > de.clientWidth + 1, panelScrolls: pnl.scrollHeight > pnl.clientHeight + 2, questionsScroll: qa.scrollHeight > qa.clientHeight + 2, labelsOutside: out }
      })
      const shift = panel ? 0 : stability.find((x) => x.scene === s + 1)?.moved || 0
      m.shiftWhileSliding = shift
      const bad = m.hscroll || m.panelScrolls || (w > 860 && m.questionsScroll) || m.labelsOutside.length || (w > 860 && shift > 0.5)
      if (bad) failures++
      console.log(JSON.stringify({ size: `${w}x${h}`, scene: s + 1, panel, ok: !bad, ...m }))
      await page.screenshot({ path: new URL(`${w}x${h}-s${s + 1}${panel ? '-panel' : ''}.png`, outDir).pathname })
      if (panel) { await page.click('#pclose'); await page.waitForTimeout(500) }
    }
  }
  if (errs.length) { failures++; console.log(JSON.stringify({ size: `${w}x${h}`, pageErrors: errs })) }
  await page.close()
}
await browser.close()
console.log(failures ? `FAILED: ${failures} check(s)` : 'All layout checks passed')
process.exit(failures ? 1 : 0)
