import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      // 자체 tsconfig/package.json을 가진 독립 하위 프로젝트 — 루트 검사 범위에서 제외
      'notion-cms-project/**',
      // Claude Code 훅 스크립트 (Node CommonJS) — 앱 소스가 아니므로 제외
      '.claude/**',
    ],
  },
]

export default eslintConfig
