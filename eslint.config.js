import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'dist-artifact/**', 'qa/out/**', 'node_modules/**'] },
  js.configs.recommended,
  { files: ['src/**/*.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: globals.browser } },
  { files: ['qa/**/*.mjs', 'scripts/**/*.mjs'], languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node, ...globals.browser } } },
]
