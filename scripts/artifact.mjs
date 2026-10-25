// Build one lesson as a single self-contained HTML page for a claude.ai artifact preview.
// Usage: npm run artifact -- mai-hl-u11-l09 "U11 L9 Opener"   ->  dist-artifact/mai-hl-u11-l09.html
// The second argument is the artifact's title (a short name); it defaults to the key.
// The artifact host adds its own <!doctype>, <html>, <head> and <body>, so they are stripped here.
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, renameSync } from 'fs'

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
writeFileSync('dist-artifact/index.html', html.trim() + '\n')
renameSync('dist-artifact/index.html', `dist-artifact/${key}.html`)
console.log(`dist-artifact/${key}.html  ${(html.length / 1024).toFixed(0)} KB`)
