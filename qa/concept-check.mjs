// Layout and state check for a concept visual (docs/CONCEPTS.md, Checking).
// Usage: npm run build && npm run serve (another terminal) && node qa/concept-check.mjs mai-hl-u12-signed-area
// Visits every stop at three sizes, writes one screenshot per stop to qa/out/, prints one JSON line per failure.
import { createRequire } from 'module'
import { mkdirSync } from 'fs'
import { execSync } from 'child_process'

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require('playwright')) } catch {
  ({ chromium } = require(execSync('npm root -g').toString().trim() + '/playwright'))
}
const key = process.argv[2] || ''
const base = (process.env.OPENERS_URL || 'http://127.0.0.1:4173/') + 'concepts.html'
const outDir = new URL(process.env.OPENERS_QA_DIR || './out/', new URL('.', import.meta.url))
mkdirSync(outDir, { recursive: true })
const sizes = [[1366, 768], [1920, 1080], [412, 900]]
const browser = await chromium.launch(process.env.OPENERS_CHROME ? { executablePath: process.env.OPENERS_CHROME } : {})
let failures = 0
const fail = (o) => { failures++; console.log(JSON.stringify(o)) }

// what a stop looks like: readout, panel text, control values, labels, and a hash of the drawing
const snapshot = (page) => page.evaluate(() => {
  let h = 0
  const svg = document.querySelector('#graph svg')?.innerHTML || ''
  const trk = document.querySelector('#track svg')?.innerHTML || ''
  for (const ch of svg + trk) h = (h * 31 + ch.charCodeAt(0)) | 0
  return {
    readout: document.getElementById('readout').textContent,
    panel: document.getElementById('panelBody').textContent,
    labels: [...document.querySelectorAll('#graph .dl')].map((n) => n.textContent).sort().join('|'),
    values: JSON.stringify(window.__concept.state().values),
    draw: h,
  }
})

for (const [w, h] of sizes) {
  const size = `${w}x${h}`
  const wide = w > 760
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
  await page.goto(base + '#' + key, { waitUntil: 'load' })
  await page.evaluate(() => { window.__conceptSpeed = 40 })
  await page.waitForTimeout(500)
  const n = await page.evaluate(() => window.__concept.state().n)
  const settle = async () => { await page.waitForFunction(() => !window.__concept.state().playing, null, { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(250) }

  // forward by Next, recording each stop
  const forward = []
  await page.evaluate(() => window.__concept.go(0, 'jump'))
  for (let i = 0; i < n; i++) {
    if (i > 0) await page.click('.cb-arrow[data-adv="1"]')
    await settle()
    const stop = await page.evaluate(() => window.__concept.state())
    // a prediction hides its answer until a choice is made, then the choice is made
    if (await page.locator('.pred').count()) {
      if (await page.locator('.pred-a').count()) fail({ size, stop: i, check: 'prediction answer shown before a choice' })
      await page.click('.pred-c button >> nth=0')
      await settle()
      if (!(await page.locator('.pred-a').count())) fail({ size, stop: i, check: 'prediction answer missing after a choice' })
    }
    await page.screenshot({ path: new URL(`concept-${size}-s${String(i).padStart(2, '0')}.png`, outDir).pathname })
    const m = await page.evaluate((isWide) => {
      const pb = document.getElementById('panelBody')
      const g = document.getElementById('graph').getBoundingClientRect()
      const out = [...document.querySelectorAll('#graph .dl')].filter((d) => {
        const r = d.getBoundingClientRect()
        return r.width && (r.left < g.left - 1 || r.right > g.right + 1 || r.top < g.top - 1 || r.bottom > g.bottom + 1)
      }).map((d) => d.textContent)
      const bar = [...document.querySelectorAll('.cb')].filter((b) => b.scrollWidth > b.clientWidth + 1).map((b) => b.textContent)
      return {
        sideways: document.documentElement.scrollWidth > innerWidth + 1,
        panelScrolls: isWide && pb.scrollHeight > pb.clientHeight + 1,
        labelsOutside: out,
        barLetters: bar,
        readoutClipped: isWide && document.getElementById('readout').scrollWidth > document.getElementById('readout').clientWidth + 1,
      }
    }, wide)
    if (m.sideways) fail({ size, stop: i, check: 'sideways scroll' })
    if (m.panelScrolls) fail({ size, stop: i, check: 'Notice tab scrolls' })
    if (m.labelsOutside.length) fail({ size, stop: i, check: 'label outside the graph', labels: m.labelsOutside })
    if (m.barLetters.length) fail({ size, stop: i, check: 'bar letter does not fit', letters: m.barLetters })
    if (m.readoutClipped) fail({ size, stop: i, check: 'readout clipped' })
    forward.push({ kind: stop.kind, snap: await snapshot(page) })
  }

  // backwards, and by scrambled jumps: every stop must look the same as it did going forwards
  const same = (a, b) => Object.keys(a).filter((k) => a[k] !== b[k])
  for (let i = n - 2; i >= 0; i--) {
    await page.click('.cb-arrow[data-adv="-1"]')
    await settle()
    const d = same(forward[i].snap, await snapshot(page))
    if (d.length) fail({ size, stop: i, check: 'looks different reached by Back', differs: d, was: d.map((k) => forward[i].snap[k]) })
  }
  const order = [...Array(n).keys()].sort((a, b) => ((a * 7 + 3) % n) - ((b * 7 + 3) % n))
  for (const i of order) {
    await page.evaluate((j) => window.__concept.go(j, 'jump'), i)
    await settle()
    const d = same(forward[i].snap, await snapshot(page))
    if (d.length) fail({ size, stop: i, check: 'looks different reached by a jump', differs: d })
  }

  // free play is disposable: move every slider in each Playground, leave, come back
  for (let i = 0; i < n; i++) {
    if (forward[i].kind !== 'P') continue
    await page.evaluate((j) => window.__concept.go(j, 'jump'), i)
    await settle()
    const sliders = await page.locator('#controls input[type=range]').count()
    for (let s = 0; s < sliders; s++) {
      await page.locator('#controls input[type=range]').nth(s).evaluate((el) => { el.value = el.min; el.dispatchEvent(new Event('input', { bubbles: true })) })
    }
    const toggles = await page.locator('#panelBody .mistake').count()
    if (toggles) await page.click('#panelBody .mistake')
    await page.evaluate((j) => { window.__concept.go(j + 1, 'jump'); window.__concept.go(j, 'jump') }, i)
    await settle()
    const d = same(forward[i].snap, await snapshot(page))
    if (d.length) fail({ size, stop: i, check: 'free play survived leaving the stop', differs: d })
  }

  if (errs.length) fail({ size, check: 'page errors', errs })
  console.log(JSON.stringify({ size, stops: n, done: true }))
  await page.close()
}
await browser.close()
console.log(failures ? `FAIL: ${failures}` : 'PASS')
process.exit(failures ? 1 : 0)
