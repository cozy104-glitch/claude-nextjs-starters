# 🤖 Claude Code 개발 지침

**invoice-web**은 Notion DB에 입력한 견적서(Quote)를 클라이언트가 로그인 없이 고유 웹 링크로 열람하고 PDF로 다운로드하는 MVP입니다 (상세: `@/docs/PRD.md`).

> ⚠️ 리포명에 "invoice"가 있으나 MVP 범위는 **견적서(Quote)**입니다. 코드 식별자는 `Invoice*`를 쓰되 UI 표기는 "견적서"로 통일합니다.

## 🛠️ 핵심 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5 (strict)
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style) + Radix UI + Lucide Icons
- **데이터 원천(SSoT)**: Notion Database (`@notionhq/client`)
- **검증**: Zod (Notion → InvoiceDTO 매핑 검증)
- **PDF**: @react-pdf/renderer (서버 생성, 한글 폰트 임베딩)
- **공개 ID**: nanoid (pageId 비노출)
- **Development**: ESLint + Prettier + Husky + lint-staged

## 🏛️ 아키텍처 (3-Layered, `src/lib/invoice/`)

`invoiceRepository`(Notion I/O 인터페이스) → `invoiceMapper`(raw→DTO, Zod 검증) → `invoiceService`(합계/만료 판정) → Page/Route(렌더). Service는 Repository 인터페이스에 의존(DI)해 테스트 시 mock 주입.

- 라우트: `/invoice/[id]`(RSC, ISR), `/api/invoice/[id]/pdf`(Route Handler)
- 금액은 정수 '원' 단위, 부가세 = `round(supplyAmount * 0.1)` (`invoiceCalculator.ts`)
- 합계는 서버에서만 계산(Notion 미저장), 웹·PDF 동일 결과 사용

## 📚 개발 가이드

- **🗺️ 개발 로드맵**: `@/docs/ROADMAP.md`
- **📋 프로젝트 요구사항**: `@/docs/PRD.md`
- **📁 프로젝트 구조**: `@/docs/guides/project-structure.md`
- **🎨 스타일링 가이드**: `@/docs/guides/styling-guide.md`
- **🧩 컴포넌트 패턴**: `@/docs/guides/component-patterns.md`
- **⚡ Next.js 15.5.3 전문 가이드**: `@/docs/guides/nextjs-15.md`
- **📝 폼 처리 완전 가이드**: `@/docs/guides/forms-react-hook-form.md`

## ⚡ 자주 사용하는 명령어

```bash
# 개발
npm run dev         # 개발 서버 실행 (Turbopack)
npm run build       # 프로덕션 빌드
npm run check-all   # 모든 검사 통합 실행 (권장)

# UI 컴포넌트
npx shadcn@latest add button    # 새 컴포넌트 추가
```

## ✅ 작업 완료 체크리스트

```bash
npm run check-all   # 모든 검사 통과 확인
npm run build       # 빌드 성공 확인
```

💡 **상세 규칙은 위 개발 가이드 문서들을 참조하세요**
