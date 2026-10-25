import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Site build (npm run build): the full openers page with every lesson, for openers.bensnotes.app.
// Artifact build (npm run artifact): one lesson as one self-contained HTML file, everything inlined.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'artifact' ? [viteSingleFile()] : [],
  build: {
    outDir: mode === 'artifact' ? 'dist-artifact' : 'dist',
    emptyOutDir: true,
    assetsInlineLimit: mode === 'artifact' ? 100000000 : 4096,
    chunkSizeWarningLimit: 2000,
  },
  preview: { host: '127.0.0.1' },
}))
