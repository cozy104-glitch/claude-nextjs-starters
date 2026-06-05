---
name: reference-starter-quirks
description: 이 스타터의 설정 상호의존성과 빌드 함정
metadata:
  type: reference
---

invoice-web (claude-nextjs-starters 기반) 특이점.

- 소스 루트는 `src/`. tsconfig paths `@/* → ./src/*`.
- 이미 `src/lib/env.ts`에 Zod 기반 env 검증 존재 (NODE_ENV/VERCEL_URL/NEXT_PUBLIC_APP_URL). 확장하여 NOTION 변수 추가하는 방식.
- `.env.example`은 원래 Slack 웹훅(Claude 훅용)만 담고 있었음 — 앱 env와 무관. NOTION 변수 추가 시 혼동 주의.
- tsconfig는 이미 `strict: true`. target ES2017.
- ESLint: flat config + FlatCompat로 next/core-web-vitals + next/typescript + prettier extends.
- `next.config.ts`에 보안 헤더(X-Frame-Options DENY 등) + optimizePackageImports(lucide-react) 이미 설정됨.
- build/dev 모두 `--turbopack` 사용.
- check-all = typecheck && lint && format:check.
- @react-pdf/renderer는 Next 빌드에서 serverExternalPackages 등록 필요(번들 함정). next.config.ts에 추가 완료.
- **줄바꿈(CRLF) 함정 (중요):** 이 저장소는 git에 LF로 저장되나 Windows의 core.autocrlf=true가 체크아웃 시 CRLF로 변환. .prettierrc는 endOfLine:"lf"라서 작업 트리의 모든 원본 파일이 `format:check`에서 오탐 실패. → `.gitattributes`(* text=auto eol=lf) 추가 + repo-local `core.autocrlf=false`로 영구 해결. 신규 파일은 Write 도구가 LF로 쓰므로 무관. 기존 CRLF 파일은 `npm run format`(prettier --write)으로 LF 정규화하면 git diff에는 내용 변경 없이(인덱스가 이미 LF) 잡히지 않음.
- **사고 교훈:** `git checkout-index -f -a`는 워킹트리의 미커밋 변경을 인덱스(원본)로 전부 덮어쓴다. 줄바꿈 정규화 목적으로 절대 쓰지 말 것 — 작업이 통째로 날아간다. LF 정규화는 prettier --write 또는 `git add --renormalize` 후 개별 파일 재작성으로.
- `notion-cms-project/`는 자체 tsconfig/package.json을 가진 독립 하위 프로젝트. 루트 tsconfig exclude + eslint ignore + prettierignore에 등록해야 루트 검사가 침범하지 않음.
- `.claude/hooks/*.js`는 Node CommonJS(require) 스크립트라 eslint `no-require-imports`에 걸림 → eslint ignore에 `.claude/**` 등록.
