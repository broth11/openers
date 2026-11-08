import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'path'

// Site build (npm run build): the openers page and the concepts page, for openers.bensnotes.app.
// Artifact build (npm run artifact / npm run concept-artifact): one page as one self-contained HTML file.
// VITE_PAGE=concepts picks the concepts page for an artifact build; the default is the openers page.
export default defineConfig(({ mode }) => {
  const artifact = mode === 'artifact'
  const page = process.env.VITE_PAGE === 'concepts' ? 'concepts.html' : 'index.html'
  return {
    base: './',
    plugins: artifact ? [viteSingleFile()] : [],
    build: {
      outDir: artifact ? 'dist-artifact' : 'dist',
      emptyOutDir: true,
      assetsInlineLimit: artifact ? 100000000 : 4096,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        input: artifact ? resolve(__dirname, page) : { main: resolve(__dirname, 'index.html'), concepts: resolve(__dirname, 'concepts.html') },
      },
    },
    preview: { host: '127.0.0.1' },
  }
})
