// Build one lesson as a single self-contained HTML page for a claude.ai artifact preview.
// Usage: npm run artifact -- mai-hl-u11-l09 "U11 L9 Opener"   ->  dist-artifact/mai-hl-u11-l09.html
// The second argument is the artifact's title (a short name); it defaults to the key.
// The artifact host adds its own <!doctype>, <html>, <head> and <body>, so they are stripped here.
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, renameSync, readdirSync } from 'fs'

const key = process.argv[2]
const title = process.argv[3] || key
if (!key) {
  console.error('Give the lesson key, for example: npm run artifact -- mai-hl-u11-l09')
  process.exit(1)
}
execSync('npx vite build --mode artifact', { stdio: 'inherit', env: { ...process.env, VITE_LESSON: key } })
let html = readFileSync('dist-artifact/index.html', 'utf8')
html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<\/?body[^>]*>/gi, '')
  .replace(/<meta charset="UTF-8" \/>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '<meta name="claude:viewport-fit-sides" content="cover" />')
  .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
// A deck lesson has no scenes: its slide deck is a separate file the shell loads in a frame. The artifact is one
// file, so the deck rides along as a string and the shell sets it as the frame's srcdoc.
const m = key.match(/^([a-z0-9-]+?)-u(\d+)-l(\d+)/)
if (m) {
  const dir = `src/lessons/${m[1]}`
  const file = readdirSync(dir).find((f) => f.startsWith(`u${m[2]}-l${m[3]}-`) && f.endsWith('.js'))
  const deck = file && readFileSync(`${dir}/${file}`, 'utf8').match(/deck:\s*'([^']+)'/)
  if (deck) {
    const deckHtml = readFileSync(`public/${deck[1]}`, 'utf8')
    const lit = JSON.stringify(deckHtml).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
    html = `<script>window.__DECK_INLINE=${lit}</script>\n` + html
    console.log(`deck inlined: ${deck[1]}`)
  }
}
writeFileSync('dist-artifact/index.html', html.trim() + '\n')
renameSync('dist-artifact/index.html', `dist-artifact/${key}.html`)
console.log(`dist-artifact/${key}.html  ${(html.length / 1024).toFixed(0)} KB`)
