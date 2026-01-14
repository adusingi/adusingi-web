import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist', 'scripts-js/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {},
    rules: {},
  },
]
