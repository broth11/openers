// Reveal discipline and standalone/offline behaviour, beyond the shared layout checker.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { mkdirSync } from 'node:fs'

const browser = await chromium.launch({ executablePath: process.env.OPENERS_CHROME })
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.route('**/fonts.googleapis.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
const base = process.env.OPENERS_URL || 'http://127.0.0.1:4195/'
await page.goto(base + '#mai-hl-u05-l01')
await page.locator('.board-card').first().waitFor()
assert.equal(await page.locator('.board-card').count(), 3)
await page.click('#workBtn')
await page.waitForTimeout(550)
assert(!/a=-5|h_A\(t\)=|h_B\(t\)=|h_C\(t\)=/.test(await page.locator('#pnl').innerText()))
await page.click('#pclose')
await page.waitForTimeout(500)
for (const [scene, answer] of [[1,'a-model'],[2,'b-model'],[3,'c-model']]) {
  await page.click(`[data-scene="${scene}"]`)
  await page.waitForTimeout(150)
  // The only pre-reveal SVG paths are marker definitions; no flight curve.
  assert.equal(await page.locator('.sg path[stroke-linejoin="round"]').count(), 0)
  await page.click('#workBtn')
  await page.waitForTimeout(550)
  assert(!(await page.locator('#pnl').innerText()).includes('a=−5'))
  await page.click('#pclose')
  await page.waitForTimeout(500)
  while (await page.locator('.reveal').count()) {
    await page.locator('.reveal').first().click()
    await page.waitForTimeout(70)
  }
  assert.equal(await page.locator(`[data-reveal="${answer}"]`).count(), 0)
  assert.equal(await page.locator('.sg path[stroke-linejoin="round"]').count(), 1)
}
await page.click('[data-scene="4"]')
await page.waitForTimeout(200)
assert.equal(await page.locator('.sg path[stroke-linejoin="round"]').count(), 3)
assert(!(await page.locator('#qa').innerText()).includes('1.59'))
await page.click('[data-reveal="highest"]')
await page.waitForTimeout(100)
assert((await page.locator('#qa').innerText()).includes('4.20'))
await page.click('[data-reveal="longest"]')
await page.waitForTimeout(100)
assert((await page.locator('#qa').innerText()).includes('1.59'))
const flightHeights = await page.evaluate(() => {
  const input = document.getElementById('r-time')
  input.value = '1.5'
  input.dispatchEvent(new Event('input', { bubbles: true }))
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(document.getElementById('readout').textContent))))
})
assert(flightHeights.includes('A: on floor') && flightHeights.includes('B: 0.75 m') && flightHeights.includes('C: 0.15 m'))
await page.click('#resetBtn')
await page.waitForTimeout(150)
assert.equal(await page.locator('.qa-ans').count(), 0)
assert(await page.locator('.info-board').isVisible())

if (process.argv[2]) {
  const offline = await browser.newContext({ viewport: { width: 1366, height: 768 }, offline: true })
  const local = await offline.newPage()
  local.on('pageerror', (e) => errors.push(e.message))
  await local.goto(pathToFileURL(process.argv[2]).href, { waitUntil: 'load' })
  assert.equal(await local.evaluate(() => document.compatMode), 'CSS1Compat')
  assert.equal(await local.locator('.board-card').count(), 3)
  assert.equal(await local.locator('[data-scene]').count(), 5)
  mkdirSync('qa/out', { recursive: true })
  await local.screenshot({ path: 'qa/out/standalone-initial.png' })
  for (const [scene, label] of [[1,'vertex'],[2,'standard'],[3,'factored'],[4,'recap']]) {
    await local.click(`[data-scene="${scene}"]`)
    await local.waitForTimeout(120)
    while (await local.locator('.reveal').count()) { await local.locator('.reveal').first().click(); await local.waitForTimeout(70) }
    await local.screenshot({ path: `qa/out/standalone-${label}.png` })
  }
  await offline.close()
}
assert.deepEqual(errors, [])
await browser.close()
console.log('Reveal gating, 3×3 model scene, comparison values, domain behaviour, reset, and offline standalone passed.')
