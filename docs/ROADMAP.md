# 🗺️ 견적서 웹뷰어 MVP — 개발 로드맵

> 본 로드맵은 [`@/docs/PRD.md`](./PRD.md) v1.0(MVP)을 분석하고 **현재 코드베이스 실제 구현 상태**를 반영해 작성한 실행 계획입니다.
> 작업 추적용 체크박스(`- [ ]`)로 관리하며, 완료 시 체크합니다. 진행 상황 갱신은 `/update-roadmap` 스킬을 사용하세요.

| 항목         | 값                                                                |
| ------------ | ----------------------------------------------------------------- |
| 문서 버전    | v1.0                                                              |
| 작성일       | 2026-06-05                                                        |
| 대응 PRD     | `docs/PRD.md` v1.0 (MVP)                                          |
| 기술 스택    | Next.js 15.5.3 · React 19 · TS5(strict) · Tailwind v4 · shadcn/ui |
| 데이터 원천  | Notion Database (SSoT)                                            |
| 배포 타깃    | Vercel                                                            |

---

## 1. 개요 (제품 목표 및 범위)

내부 담당자(Admin)가 **Notion에 입력한 견적서(Quote)**를, 외부 클라이언트(Client)가 **로그인 없이 고유 웹 링크로 열람**하고 **동일 레이아웃의 PDF로 다운로드**할 수 있게 하는 MVP입니다. Notion을 입력 UI로, 웹을 읽기 전용 렌더러로 사용합니다.

- **범위(In)**: 견적서 웹 뷰, PDF 다운로드, 합계/부가세 계산, 상태(발행/만료/초안) 기반 접근 제어, 에러/Not Found 화면.
- **비범위(Out)**: 인증·계정, 결제·전자서명·승인, 견적 편집 UI(편집은 Notion에서만), 다국어·다중통화, 버전 관리, 이메일 알림. (상세: PRD §2.2, §15)

> ⚠️ 리포명에 "invoice"가 있으나 MVP 대상은 **견적서(Quote)**입니다. 코드 식별자는 `Invoice*`를 쓰되 UI 표기는 "견적서"로 통일합니다.

---

## 2. 현재 코드베이스 상태 (출발점)

> 최근 커밋에서 스타터 데모가 제거되고 견적서 웹뷰어 기반 구조가 구축된 상태입니다. **순수 도메인 로직과 골격은 이미 존재**하며, 로드맵은 이 위에서 시작합니다.

| 영역                          | 상태        | 비고                                                                       |
| ----------------------------- | ----------- | -------------------------------------------------------------------------- |
| `invoice.types.ts`            | ✅ 완료     | `InvoiceDTO` 등 도메인 타입 정의 완료                                       |
| `invoice.schema.ts` (Zod)     | ✅ 완료     | DTO 검증 스키마 정의 완료                                                   |
| `invoiceCalculator.ts`        | ✅ 완료     | 합계·부가세(`round(supply*0.1)`)·만료 판정 순수 로직 구현                   |
| `invoiceService.ts`           | ✅ 완료     | `applyTotals`·`resolveStatus`·`isViewable` 구현                            |
| `env.ts`                      | ✅ 완료     | env 검증 + `requireNotionEnv()` 런타임 가드                                |
| `invoiceRepository.ts`        | 🟡 인터페이스만 | `InvoiceRepository` 인터페이스·raw 타입만 존재, **Notion 구현체 부재**     |
| `invoiceMapper.ts`            | ❌ 부재     | 파일 자체 없음 (M2에서 신규 생성)                                          |
| `page.tsx` (`/invoice/[id]`)  | 🟡 골격     | 데이터 미연결, placeholder 텍스트만 렌더                                   |
| `pdf/route.ts`                | 🟡 골격     | 501(미구현) 반환, 에러 응답 구조만 존재                                    |
| `not-found.tsx` / `error.tsx` | ✅ 완료     | 상태 화면 골격 완료 (만료/Success 화면은 미구현)                           |
| 견적서 뷰 컴포넌트            | ❌ 부재     | 헤더·항목 테이블·합계 영역 컴포넌트 없음                                    |
| PDF 문서 컴포넌트·한글 폰트   | ❌ 부재     | `@react-pdf/renderer` 의존성은 설치됨, TTF·`Font.register` 없음            |
| 테스트 러너                   | ❌ 부재     | `package.json`에 test 스크립트·vitest/jest 미설치                          |
| 의존성                        | ✅ 완료     | @notionhq/client, @react-pdf/renderer, nanoid, zod 모두 설치됨             |

> **ASSUMPTION**: 테스트 프레임워크로 **Vitest**를 채택합니다(Next.js 15 + TS strict 호환성, ESM 친화). 팀이 Jest를 선호하면 P1-T2에서 교체하세요. PRD가 "단위 테스트"·"테스트 가능성"을 강조(§14, KPI: 금액 불일치 0건)하므로 러너 도입을 MVP에 포함합니다.

---

## 3. 성공 지표 (KPI — PRD §13)

| 지표                | 목표      | 검증 작업(Phase) |
| ------------------- | --------- | ---------------- |
| 열람율              | ≥ 80%     | (운영 측정)      |
| PDF 다운로드 성공률 | ≥ 99%     | P2               |
| p75 LCP             | < 2.5s    | P4 (ISR)         |
| p95 PDF 생성 시간   | < 3s      | P2               |
| 5xx 오류율          | < 1%      | P3               |
| **금액 불일치 건수**| **0건**   | P1 (단위 테스트) |

---

## 4. 단계별 계획 (Phase)

각 Phase는 **독립적으로 출하 가능한 가치**를 제공하며, 종료 시 `npm run check-all` & `npm run build` 통과를 게이트로 둡니다(PRD §14, CLAUDE.md).

규모 표기: **S**(반나절 내) · **M**(1~2일) · **L**(3일+). 절대 시간 추정은 팀 속도 제공 시에만 산출합니다.

---

### Phase 0: 사전 준비 (Notion 환경 구성)

- **목표**: 코드가 의존하는 외부 자원(Notion DB, env)을 갖춰 개발을 차단 없이 시작한다.
- **완료 기준(DoD)**: 발행 상태 견적서 1건이 Notion에 존재하고, 로컬 `.env`로 Notion API가 실제 조회된다.
- **주요 작업**:
  - [ ] (P0-T1) Notion Integration 생성 및 DB 공유 — Integration 토큰 발급, Quote/LineItem DB에 Integration 연결 / 의존성: 없음 / 규모: S / 위험도: 낮음
  - [ ] (P0-T2) Quote DB 스키마 구축 — PRD §7.1 속성(견적번호·공개ID·상태·발행일·유효기한·수신/발신·통화·할인액·비고) 생성 / 의존성: P0-T1 / 규모: M / 위험도: 중(속성명·타입이 mapper와 정확히 일치해야 함)
  - [ ] (P0-T3) LineItem DB 스키마 + Quote DB Relation 구축 — 품목명·설명·수량·단가·정렬순서·견적서(relation) / 의존성: P0-T2 / 규모: S / 위험도: 중
  - [ ] (P0-T4) 샘플 견적서 시드 — 발행 상태 1건 + 만료 1건 + 초안 1건, 각 nanoid `공개ID` 부여 / 의존성: P0-T3 / 규모: S / 위험도: 낮음
  - [ ] (P0-T5) `.env` 설정 — `NOTION_TOKEN`·`NOTION_QUOTE_DB_ID`·`NOTION_LINE_ITEM_DB_ID` 입력, `.env.example` 작성 / 의존성: P0-T1~T3 / 규모: S / 위험도: 낮음

> 🔐 **보안**: `NOTION_TOKEN`은 서버 전용 env로만 사용하고 클라이언트 번들에 노출 금지(PRD §11). `env.ts`의 `requireNotionEnv()`가 런타임 누락을 차단함.

---

### Phase 1: 데이터 계층 완성 (MVP 핵심 — Notion → DTO → 화면)

- **목표**: Notion 견적서를 실제로 조회·검증·계산해 웹에서 정확히 렌더한다 (PRD F-01, F-02, F-03, F-05).
- **완료 기준(DoD)**: 발행 견적서가 `/invoice/{publicId}`에서 메타·항목·합계와 함께 200으로 렌더된다. 웹 합계가 단위 테스트로 검증된다(금액 불일치 0건). 미발행은 노출되지 않는다.
- **주요 작업**:
  - [ ] (P1-T1) `NotionInvoiceRepository` 구현 — `InvoiceRepository` 인터페이스 구현, `@notionhq/client`로 `findByPublicId`(공개ID 필터 query)·`findLineItems`(relation 일괄 조회, N+1 방지) / 의존성: P0-T5 / 규모: L / 위험도: 중(Notion 쿼리·필터 정확성) — **에러 핸들링·로깅 필수**
  - [ ] (P1-T2) Vitest 도입 — `vitest` 설치, `test`/`test:watch` 스크립트 추가, `check-all`에 편입 검토 / 의존성: 없음(병렬 가능) / 규모: S / 위험도: 낮음
  - [ ] (P1-T3) `invoiceCalculator` 단위 테스트 — 부가세 반올림(`round`), 할인 음수 방지, 항목 0개, 이상 금액 케이스 / 의존성: P1-T2 / 규모: M / 위험도: 낮음 — **KPI "금액 불일치 0건" 직결**
  - [ ] (P1-T4) `invoiceService` 단위 테스트 — `resolveStatus`(draft/published/만료 승격), `isViewable` 경계값(유효기한 당일) / 의존성: P1-T2 / 규모: S / 위험도: 낮음
  - [ ] (P1-T5) `invoiceMapper.ts` 신규 구현 — raw Notion 응답 → `InvoiceDTO` 변환, **Zod(`invoiceSchema`) 검증**, 누락 속성 안전 기본값 + 경고 로그, `calcLineAmount`로 항목 amount 산출 / 의존성: P1-T1 / 규모: L / 위험도: 높음(Notion 속성 파싱·타입 다양성) — **검증·로깅 필수**
  - [ ] (P1-T6) `invoiceMapper` 단위 테스트 — mock raw 입력으로 매핑·검증·기본값 처리 검증 / 의존성: P1-T5, P1-T2 / 규모: M / 위험도: 중
  - [ ] (P1-T7) Service 조립 함수(`getInvoiceForView`) — Repository(DI 주입) → Mapper → `applyTotals` → `resolveStatus` 파이프라인, null/draft 시 호출부에 신호 / 의존성: P1-T1, P1-T5 / 규모: M / 위험도: 중
  - [ ] (P1-T8) 견적서 뷰 컴포넌트 — 헤더(발신/견적번호/일자)·수신자·항목 테이블·합계 영역(소계·할인·공급가액·부가세·총액), shadcn 컴포넌트 활용 / 의존성: P1-T7 / 규모: L / 위험도: 낮음
  - [ ] (P1-T9) `page.tsx` 데이터 연결 — `getInvoiceForView` 호출, published→본문 렌더 / draft·null→`notFound()`, ISR(`revalidate`) 유지 / 의존성: P1-T7, P1-T8 / 규모: M / 위험도: 중

> 💰 **정밀도(PRD §9.4)**: 모든 금액은 정수 '원' 단위. 웹·PDF는 동일한 `invoiceService` 계산 결과를 사용해 불일치를 원천 차단. 부가세 규칙(`Math.round(supplyAmount * 0.1)`)은 P1-T3에서 테스트로 고정.
> 🏛️ **아키텍처**: Repository는 인터페이스(`InvoiceRepository`)로 주입(DI)해 테스트 시 mock 대체. 계층 책임 분리(Repository=I/O / Mapper=변환·검증 / Service=계산·판정 / Page=렌더) 준수.

---

### Phase 2: PDF 다운로드

- **목표**: 웹과 시각적으로 일치하는 PDF를 서버에서 생성·다운로드한다 (PRD F-04, §9).
- **완료 기준(DoD)**: 발행 견적서에서 PDF 버튼으로 한글 정상 출력 PDF가 규칙적 파일명으로 다운로드된다. 만료/미발행은 PDF가 차단된다. p95 생성 시간 < 3s.
- **주요 작업**:
  - [ ] (P2-T1) 한글 폰트 임베딩 준비 — Pretendard/Noto Sans KR TTF를 리포에 포함(서브셋 권장), `Font.register` 모듈 작성, **빌드 시 폰트 존재 검증** / 의존성: 없음 / 규모: M / 위험도: 중(Vercel 서버리스 폰트 로딩)
  - [ ] (P2-T2) PDF 문서 컴포넌트(`InvoiceDocument`) — `@react-pdf/renderer`로 웹 뷰와 동일 구성·디자인 토큰 공유, 항목 과다 시 자동 페이지네이션(헤더 견적번호·푸터 페이지번호 반복) / 의존성: P2-T1, P1-T8 / 규모: L / 위험도: 중
  - [ ] (P2-T3) `pdf/route.ts` 구현 — `getInvoiceForView`로 DTO 조회 → `isViewable` 차단(만료/미발행 시 404/403) → PDF 렌더 → `application/pdf` 응답, 파일명 `견적서_{quoteNumber}_{client.company}_{issuedAt}.pdf`(새니타이즈) / 의존성: P2-T2, P1-T7 / 규모: M / 위험도: 중 — **에러 핸들링·타임아웃·로깅 필수**
  - [ ] (P2-T4) PDF 다운로드 버튼 — 뷰에 액션 추가, 만료/미발행 시 비활성, 다운로드 상태 표시 / 의존성: P2-T3 / 규모: S / 위험도: 낮음
  - [ ] (P2-T5) 웹·PDF 합계 일치 검증 — 동일 DTO로 양쪽 합계 비교(KPI 0건 불일치), 한글 출력 수동 검증 / 의존성: P2-T2, P2-T4 / 규모: S / 위험도: 낮음

> 💰 **정밀도**: PDF는 별도 계산 금지 — 반드시 `invoiceService` 결과 DTO를 그대로 사용(PRD §9.4).
> 🔐 **보안**: PDF Route도 상태 게이트(`isViewable`)를 거쳐 만료/미발행 본문이 PDF로 유출되지 않게 함.

---

### Phase 3: 보안·접근 제어·에러 처리 강화

- **목표**: 공개 링크 모델의 안전성과 모든 엣지 케이스 화면을 완성한다 (PRD F-05, F-06, F-07, §11, §12).
- **완료 기준(DoD)**: 만료 화면·404·에러 바운더리가 모두 동작하고, noindex가 적용되며, 미발행/만료 본문이 어떤 경로로도 노출되지 않는다.
- **주요 작업**:
  - [ ] (P3-T1) 만료(Expired) 화면 — `resolveStatus`가 expired면 본문 대신 만료 안내 + PDF 비활성 / 의존성: P1-T9 / 규모: S / 위험도: 낮음
  - [ ] (P3-T2) `noindex`·robots 적용 — `robots: { index: false }`, `X-Robots-Tag: noindex`, sitemap 제외 / 의존성: P1-T9 / 규모: S / 위험도: 낮음
  - [ ] (P3-T3) 에러 바운더리 강화 — `error.tsx`에 재시도 안내, Notion 5xx/타임아웃 구분, 서버 로그 기록 / 의존성: P1-T9 / 규모: S / 위험도: 낮음
  - [ ] (P3-T4) 엣지 케이스 처리 — 잘못된 id·삭제·필수 속성 누락(Zod 실패)→404, 항목 0개→"항목 없음"·합계 0원, 음수/이상 금액→0 또는 거절 + 로그 / 의존성: P1-T5, P1-T9 / 규모: M / 위험도: 중
  - [ ] (P3-T5) 접근 제어 통합 검증 — 발행만 200, draft/만료/미존재가 본문·PDF 양쪽에서 차단되는지 일괄 점검 / 의존성: P3-T1, P2-T3 / 규모: S / 위험도: 중

> 🔐 **보안(PRD §11)**: 미발행·삭제·잘못된 id를 **모두 동일한 404로 처리해 존재 자체를 은닉**. nanoid(≥21자) 공개ID로 추측 차단, pageId 비노출.

---

### Phase 4: 캐싱·반응형·관측성·QA (출시 다듬기)

- **목표**: 성능·접근성·관측성 비기능 요구사항을 충족하고 출시 품질을 확보한다 (PRD §8.2, §10, F-08~F-12).
- **완료 기준(DoD)**: ISR로 Notion 호출이 최소화되고, 360~1280px 반응형이 정상이며, 조회/다운로드/오류 이벤트가 로깅되고, KPI 측정 가능한 상태로 배포된다.
- **주요 작업**:
  - [ ] (P4-T1) ISR 캐싱 튜닝 — `revalidate` 주기 운영값 확정(60s~5min), 캐시 hit LCP < 2.5s 확인 / 의존성: P1-T9 / 규모: S / 위험도: 낮음
  - [ ] (P4-T2) 반응형 뷰 — 360~1280px 레이아웃 깨짐 제거, 항목 테이블 모바일 대응 / 의존성: P1-T8 / 규모: M / 위험도: 낮음
  - [ ] (P4-T3) OG·공유 메타 — 링크 미리보기용 OG 태그(F-09) / 의존성: P3-T2 / 규모: S / 위험도: 낮음
  - [ ] (P4-T4) 인쇄 친화 스타일 — `@media print` 적용(F-11, Could) / 의존성: P1-T8 / 규모: S / 위험도: 낮음
  - [ ] (P4-T5) 조회/다운로드 로깅 — 열람·다운로드·오류 이벤트 서버 로그(개인정보 제외, F-12) / 의존성: P1-T9, P2-T3 / 규모: S / 위험도: 낮음
  - [ ] (P4-T6) 접근성 — WCAG AA 색 대비, 시맨틱 마크업, 테이블 헤더 명시 / 의존성: P1-T8 / 규모: S / 위험도: 낮음
  - [ ] (P4-T7) 최종 QA·게이트 — `npm run check-all` & `npm run build` 통과, 출시 체크리스트(PRD 말미) 전수 점검 / 의존성: P4 전체 / 규모: S / 위험도: 낮음

> 📊 **관측성(PRD §10)**: 로깅은 개인정보를 제외한 이벤트 단위로 기록. ML/외부 API 호출(Notion) 실패는 graceful 에러 화면 + 로그로 처리.

---

## 5. 의존성 맵

```
P0(Notion 환경)
  └─> P1-T1 (Repository) ─┐
                          ├─> P1-T5 (Mapper) ─> P1-T6 (Mapper 테스트)
P1-T2 (Vitest) ─┬─> P1-T3 (Calc 테스트)
                ├─> P1-T4 (Service 테스트)
                └─> P1-T6
P1-T1 + P1-T5 ─> P1-T7 (조립 getInvoiceForView)
                    └─> P1-T8 (뷰 컴포넌트) ─> P1-T9 (page 연결)

P1-T8 ─> P2-T2 (PDF 문서) ──┐
P2-T1 (폰트) ──────────────┤
                            └─> P2-T3 (pdf route) ─> P2-T4 (버튼) ─> P2-T5 (합계 일치 검증)
P1-T7 ─> P2-T3

P1-T9 ─> P3-T1 (만료) / P3-T2 (noindex) / P3-T3 (error) / P3-T4 (엣지)
P3-T1 + P2-T3 ─> P3-T5 (접근제어 통합)

P1-T9 / P1-T8 ─> P4-* (캐싱·반응형·메타·인쇄·로깅·접근성) ─> P4-T7 (최종 QA)
```

- 순환 의존성 없음. 모든 의존성은 같은/이전 Phase의 선행 작업으로만 향함.
- **병렬 가능**: P1-T2(Vitest)는 P0와 무관하게 즉시 착수 가능. P2-T1(폰트)은 P2 진입 전 선행 준비 가능.

---

## 6. 위험 요소 및 완화 전략

| 위험                                       | 영향 | 완화책                                                                                     | 관련 작업      |
| ------------------------------------------ | ---- | ------------------------------------------------------------------------------------------ | -------------- |
| Notion 속성명/타입 불일치로 매핑 실패      | 높음 | P0에서 스키마를 PRD §7과 정확히 일치시키고, Mapper에 Zod 검증 + 누락 기본값·경고 로그        | P0-T2, P1-T5   |
| Vercel 서버리스에서 한글 폰트 로딩 실패    | 중   | TTF 리포 포함·서브셋, 빌드 시 폰트 존재 검증, fallback 폰트(PRD §12)                         | P2-T1          |
| 웹·PDF 금액 불일치 (KPI 0건 위반)          | 높음 | 양쪽 모두 단일 `invoiceService` 결과 사용, 정수 원 단위, 단위 테스트로 부가세 규칙 고정      | P1-T3, P2-T5   |
| 미발행/만료 견적 본문·PDF 유출             | 높음 | 페이지·PDF Route 양쪽에 `isViewable` 게이트, 미존재·미발행 동일 404 은닉                     | P3-T5, P2-T3   |
| PDF 생성 시간 초과(서버리스 타임아웃)      | 중   | 경량 `@react-pdf/renderer` 채택, 캐시 미사용·요청 시 생성, 타임아웃 핸들링·로깅              | P2-T3          |
| 공개ID 추측으로 타 견적 열람               | 중   | nanoid(≥21자) 공개ID, pageId 비노출, noindex                                                | P3-T2          |
| ISR 캐시로 Admin 수정 반영 지연            | 낮음 | MVP는 시간 기반 ISR 수용, On-demand revalidation은 Phase 2(향후)로 명시(PRD §15)             | P4-T1          |

---

## 7. 가정 및 미해결 질문

### 7.1 채택한 가정 (ASSUMPTION)

- **ASSUMPTION**: 테스트 러너는 **Vitest** 채택(현재 미설치). 팀이 Jest 선호 시 P1-T2에서 교체.
- **ASSUMPTION**: 한글 폰트는 **Pretendard 또는 Noto Sans KR** 중 1종 임베딩. 브랜드 폰트 지정 시 P2-T1에서 교체.
- **ASSUMPTION**: 발신자(회사/로고) 정보는 견적마다 Notion 속성으로 입력(전사 고정이면 env/설정 분리 — Open Q2).
- (PRD §16.1 승계) 도메인=B2B SaaS·KRW·한국어, 부가세 10% 단일, 항목=관계형 LineItem DB, 합계=서버 계산, ISR=60s.

### 7.2 미해결 질문 (확정 필요 — PRD §16.2)

1. **부가세 면세/영세율** 견적이 필요한가? (현재 10% 고정 — 필요 시 calculator·DTO 확장)
2. **발신자 정보(회사/로고)**는 견적마다 다른가, 전사 고정인가? (고정이면 env/설정으로 분리, 매핑 단순화)
3. KRW 외 **통화** 지원 시점은? (현재 단일, P1 DTO에 영향)
4. **On-demand revalidation**(즉시 반영)이 MVP 필수인가, 시간 기반 ISR로 충분한가? (현재 Phase 2 향후)
5. **링크 만료 기본값** 표준은? (예: 발행 후 30일 — 운영 가이드 필요)

---

## 8. Task Master 연동 안내

본 프로젝트는 Task Master 워크플로우가 활성화되어 있습니다. 본 로드맵의 작업을 태스크로 전환하려면:

```bash
# PRD를 파싱해 태스크 생성 (PRD가 .taskmaster/docs/prd.md에 있어야 함)
task-master parse-prd .taskmaster/docs/prd.md

# 복잡도 분석 후 서브태스크로 확장
task-master analyze-complexity --research
task-master expand --all --research
```

각 Phase 작업은 독립적·명확한 단위로 작성되어 있어 `parse-prd`로 태스크화하기 적합합니다. 단, `tasks.json`·`config.json`은 직접 수정하지 말고 `task-master` 명령으로 관리하세요.

> 각 Phase 종료 시 검증 게이트: `npm run check-all` && `npm run build` 통과 (CLAUDE.md 체크리스트).
