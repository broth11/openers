// Build one concept visual as a single self-contained HTML page for a claude.ai artifact preview.
// Usage: npm run concept-artifact -- mai-hl-u12-signed-area "Signed area and |v|"
//   ->  dist-artifact/concept-mai-hl-u12-signed-area.html
// The artifact host adds its own <!doctype>, <html>, <head> and <body>, so they are stripped here.
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, renameSync } from 'fs'

const key = process.argv[2]
const title = process.argv[3] || key
if (!key) {
  console.error('Give the concept key, for example: npm run concept-artifact -- mai-hl-u12-signed-area')
  process.exit(1)
}
execSync('npx vite build --mode artifact', { stdio: 'inherit', env: { ...process.env, VITE_PAGE: 'concepts', VITE_CONCEPT: key } })
let html = readFileSync('dist-artifact/concepts.html', 'utf8')
html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<\/?body[^>]*>/gi, '')
  .replace(/<meta charset="UTF-8" \/>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '<meta name="claude:viewport-fit-sides" content="cover" />')
  .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
writeFileSync('dist-artifact/concepts.html', html.trim() + '\n')
renameSync('dist-artifact/concepts.html', `dist-artifact/concept-${key}.html`)
console.log(`dist-artifact/concept-${key}.html  ${(html.length / 1024).toFixed(0)} KB`)
