import { FlatCompat } from '@eslint/eslintrc'
 
const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})
 
const eslintConfig = [
  ...compat.config({
    extends: ['next'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // nonaktifkan error any agar build lancar
    },
  }),
]
 
export default eslintConfig