---
name: project-purpose
description: invoice-web 프로젝트의 목적과 PRD 기반 기능 범위
metadata:
  type: project
---

invoice-web은 **Notion DB에 입력한 견적서(Quote)를 클라이언트가 로그인 없이 고유 웹 링크로 열람하고 PDF로 다운로드**하는 MVP다 (`docs/PRD.md` v1.0).

**Why:** PDF 수기 작성 비용 절감 + Notion을 입력 UI로 재사용. SSoT는 Notion Database.

**How to apply:**

- 리포명에 "invoice"가 있으나 MVP 범위는 **견적서(Quote)**다. 코드 식별자는 `Invoice*` 사용, UI 표기는 "견적서".
- 필수 스택 추가: `@notionhq/client`, `@react-pdf/renderer`, `nanoid`. 계산/만료는 서버에서 (Notion 미저장).
- 아키텍처: Repository(Notion I/O) → Mapper(Zod 검증) → Service(합계/만료) → Page/Route. 3-Layered + DI.
- **비목표(제거 근거):** Client/Admin 인증·로그인, 결제·전자서명, 견적 편집 UI(편집은 Notion에서만), 다국어/다중통화, 이메일 알림.
- 금액은 정수 '원' 단위. 부가세 = round(supplyAmount \* 0.1).
