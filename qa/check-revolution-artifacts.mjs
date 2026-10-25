import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import assert from 'node:assert/strict'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const browser = await chromium.launch({ executablePath: process.env.OPENERS_CHROME })
const out = new URL('./out/artifacts/', import.meta.url)
mkdirSync(out, { recursive: true })
for (const [number, name, scenes] of [[10,'Discs and Stretches',5],[11,'A Hemisphere Bowl',4]]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 860 } })
  const errors = [], external = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.route('http://**/*', (r) => { external.push(r.request().url()); return r.abort() })
  await page.route('https://**/*', (r) => { external.push(r.request().url()); return r.abort() })
  await page.goto(pathToFileURL(resolve(`../../outputs/Unit 11 - Lesson ${number} - Opener - ${name}.html`)).href)
  await page.waitForTimeout(300)
  assert((await page.locator('#eyebrow').innerText()).includes(`LESSON ${number}`))
  for (let i = 0; i < scenes; i++) {
    await page.click(`[data-scene="${i}"]`); await page.waitForTimeout(120)
    while (await page.locator('.reveal').count()) { await page.locator('.reveal').first().click(); await page.waitForTimeout(100) }
    await page.waitForTimeout(200)
    assert.equal(await page.locator('.ML__error').count(), 0)
    await page.screenshot({ path: new URL(`l${number}-s${i + 1}.png`, out).pathname })
    if (await page.locator('.solid-viewport canvas').isVisible()) {
      const png = await page.locator('.solid-viewport canvas').evaluate((c) => c.toDataURL())
      assert(png.length > 10000, 'The genuine WebGL canvas must contain rendered geometry')
      for (const view of ['front','end','reset']) { await page.click(`[data-view="${view}"]`); await page.waitForTimeout(80) }
    }
  }
  assert.deepEqual(errors, [])
  assert(external.every((url) => /fonts\.(googleapis|gstatic)\.com/.test(url)), `External runtime assets: ${external.join(', ')}`)
  console.log(`L${number}: standalone file works with network blocked; ${scenes} scenes, reveals, camera presets, WebGL and maths passed`)
  await page.close()
}
await browser.close()
