---
name: decision-kept-components
description: 스타터 정제 시 유지/제거한 구성 요소와 근거
metadata:
  type: feedback
---

invoice-web 스타터 정제(2026-06-05) 시 내린 유지/제거 결정.

**Why:** 서브에이전트라 사용자에게 직접 질문 불가 → 애매한 것은 유지하고 "확인 필요"로 보고하는 원칙.

**How to apply (유지):**

- `components/ui/*` shadcn 컴포넌트 + 대응 `@radix-ui/*` 패키지: 전량 유지 (디자인 시스템 자산, 미사용이라도 보호).
- `sonner` + `ui/sonner.tsx`: 유지 (PDF 다운로드 피드백 토스트로 유용).
- `next-themes` + `theme-provider`/`theme-toggle`: 유지하되 데모 헤더 제거로 토글 진입점 사라짐 → 사용자 확인 보류 항목.
- `react-hook-form`/`@hookform/resolvers`/`ui/form.tsx`: 편집 UI는 비목표지만 shadcn 자산이라 유지.

**How to apply (제거 — 근거 명확):**

- `usehooks-ts`: 실코드 사용처가 데모 `header.tsx`의 useMediaQuery 1곳뿐 → 데모 제거 후 고아 → uninstall.
- 데모 페이지/컴포넌트: login/signup, sections(hero/features/cta), layout(header/footer/container), navigation, \*-form.tsx → PRD 인증·랜딩 비목표.
- `public/*.svg` (next/vercel/file/globe/window): Next.js 기본 데모 자산.
