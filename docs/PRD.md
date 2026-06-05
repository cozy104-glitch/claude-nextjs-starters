# 📄 견적서 웹뷰어 MVP — PRD

> **한 줄 요약**: Notion에 입력한 견적서를, 클라이언트가 별도 로그인 없이 고유 웹 링크로 열람하고 PDF로 다운로드하는 서비스.
>
> 본 문서는 `docs/PRD_PROMPT.md`(메타 프롬프트)를 실행해 생성된 **MVP 실행 PRD**입니다. 엔지니어가 그대로 구현에 착수할 수 있도록 작성되었습니다.

| 항목              | 값                                                                              |
| ----------------- | ------------------------------------------------------------------------------- |
| 문서 버전         | v1.0 (MVP)                                                                      |
| 작성일            | 2026-06-04                                                                      |
| 데이터 원천(SSoT) | Notion Database                                                                 |
| 고정 스택         | Next.js 15.5.3 · React 19 · TS5 · TailwindCSS v4 · shadcn/ui · @notionhq/client |
| 배포 타깃         | Vercel (가정)                                                                   |
| 대상 도메인       | B2B SaaS · KRW · 한국어 (가정)                                                  |

---

## 0. 가정 및 의사결정 (요약 — 상세는 §16)

> 메타 프롬프트의 빈 변수에 대해 아래 기본값을 채택했습니다. 변경이 필요하면 §16과 함께 갱신하세요.

| 변수          | 채택값                | 근거                                                                                      |
| ------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| `대상_도메인` | B2B SaaS, KRW, 한국어 | 사내 견적 발행이 가장 흔한 시나리오. 통화/세금 규칙 단순화(부가세 10%).                   |
| `배포_타깃`   | Vercel                | 고정 스택(Next.js)과 정합성 최고. 단, 서버리스 실행 제약(시간/메모리/폰트) 고려 필요(§9). |

---

## 1. 문서 개요

### 1.1 목적

내부 담당자가 **Notion에 입력한 견적서**를, 외부 클라이언트가 **웹으로 즉시 확인하고 PDF로 다운로드**할 수 있게 하는 MVP를 정의한다. 별도 견적 관리 시스템 구축 없이 "Notion을 입력 UI로, 웹을 읽기 전용 렌더러로" 사용하는 것이 핵심이다.

### 1.2 배경

- 견적서를 PDF로 매번 수기 작성/디자인하는 비용이 크다.
- Notion은 이미 사내 문서 도구로 사용 중이라 학습 비용이 없다.
- 클라이언트에게 "예쁜 웹 링크 + 일관된 PDF"를 제공하면 전문성·전환율이 향상된다.

### 1.3 용어 정의

| 용어                | 정의                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| **견적서(Quote)**   | 거래 성사 **전** 가격을 제안하는 문서. 본 MVP의 대상.                        |
| **Invoice(청구서)** | 거래 성사 **후** 대금을 청구하는 문서. **본 MVP 범위 아님**(§15).            |
| **Admin**           | Notion DB에 견적서를 작성/수정하는 내부 담당자(1차 사용자).                  |
| **Client**          | 발급된 링크로 견적서를 열람·다운로드하는 외부 고객(2차 사용자, 로그인 없음). |
| **SSoT**            | Single Source of Truth. 본 MVP에서는 Notion Database.                        |
| **InvoiceDTO**      | Notion API 응답을 앱 내부 도메인 타입으로 변환한 견적서 모델(§7).            |

> ⚠️ 프로젝트명/리포지토리(`invoice-web`)에 "invoice"가 있으나, **MVP 범위는 견적서(Quote)**임. 코드 식별자는 일관성을 위해 `Invoice*`를 사용하되, UI 표기는 "견적서"로 통일한다.

---

## 2. 목표와 비목표

### 2.1 목표 (MVP에서 달성)

- **G1** Notion DB의 견적서 1건을 고유 URL로 발급한다.
- **G2** Client가 로그인 없이 링크로 견적서를 웹에서 열람한다.
- **G3** Client가 동일 레이아웃의 PDF를 다운로드한다.
- **G4** 합계/부가세/할인이 정확히 계산되어 웹·PDF에 동일하게 표시된다.
- **G5** 만료/삭제/오류 상황에서 안전하고 명확한 화면을 보여준다.

### 2.2 비목표 (명시적으로 안 함)

- ❌ Client/Admin 인증·로그인·계정
- ❌ 결제·전자서명·견적 승인 워크플로우
- ❌ 견적서 **편집 UI**(편집은 Notion에서만)
- ❌ 다국어/다중 통화 동시 지원(KRW·한국어 고정)
- ❌ 견적서 버전 관리·변경 이력
- ❌ 이메일/알림 자동 발송

---

## 3. 핵심 사용자 & 사용자 시나리오

### 3.1 User Stories — Admin

- **US-A1** As an Admin, I want Notion DB에 견적서를 작성하면 자동으로 공유 링크가 생기길 원한다, so that 별도 발급 작업 없이 바로 고객에게 보낼 수 있다.
- **US-A2** As an Admin, I want Notion에서 내용을 수정하면 웹에 (재검증 후) 반영되길 원한다, so that 오타·금액 수정이 즉시 통일된다.
- **US-A3** As an Admin, I want 견적서 상태(초안/발행/만료)를 Notion에서 제어하길 원한다, so that 초안이 외부에 노출되지 않는다.

### 3.2 User Stories — Client

- **US-C1** As a Client, I want 받은 링크를 클릭하면 로그인 없이 견적서를 보길 원한다, so that 번거로움 없이 즉시 확인한다.
- **US-C2** As a Client, I want 모바일에서도 견적서가 깨지지 않길 원한다, so that 이동 중에도 확인한다.
- **US-C3** As a Client, I want "PDF 다운로드" 버튼으로 인쇄/보관용 파일을 받길 원한다, so that 내부 결재에 첨부한다.
- **US-C4** As a Client, I want 만료/삭제된 링크일 때 명확한 안내를 보길 원한다, so that 혼란 없이 담당자에게 문의한다.

---

## 4. 사용자 플로우

### 4.1 Admin 플로우 (작성 → 발급)

1. Notion 견적서 DB에서 **새 페이지(견적서 1건)** 생성
2. 메타(견적번호·발행일·유효기한·수신자 등) + 항목(품목·수량·단가) 입력
3. `상태` 속성을 **발행(Published)** 으로 변경
4. 웹 서비스가 해당 페이지를 `/invoice/{pageId 기반 공개 ID}`로 노출
5. Admin이 해당 URL을 복사해 클라이언트에게 전달

```
[Notion DB] --(작성/상태=발행)--> [Notion API]
                                       |
                                  (서버 fetch + 캐시)
                                       v
                              https://.../invoice/{id}
                                       |
                                 (URL 복사 → 고객 전달)
```

### 4.2 Client 플로우 (열람 → PDF)

1. 전달받은 링크 클릭
2. 서버가 Notion에서 견적서를 조회 → 도메인 모델(InvoiceDTO)로 변환 → 렌더
3. 웹에서 견적서 확인(메타·항목·합계)
4. **[PDF 다운로드]** 클릭 → 서버가 PDF 생성 → 파일 응답
5. (만료/삭제/오류 시) 상태별 안내 화면

```
Client → GET /invoice/{id}
  ├─ 정상   → 견적서 뷰 렌더 → [PDF 다운로드] → GET /api/invoice/{id}/pdf → 파일
  ├─ 만료   → "유효기한이 지난 견적서" 안내
  ├─ 미발행 → 404 (초안/비공개는 존재하지 않는 것처럼 처리)
  └─ 삭제/오류 → Not Found / 일시적 오류 안내
```

---

## 5. 기능 요구사항

> 우선순위: **MoSCoW** (Must / Should / Could / Won't). MVP는 Must 전부 + Should 일부.

| ID       | 기능                | 설명                                          | 우선순위   | 인수 기준(Acceptance Criteria)                            |
| -------- | ------------------- | --------------------------------------------- | ---------- | --------------------------------------------------------- |
| **F-01** | 견적서 조회         | `/invoice/{id}`에서 Notion 견적서를 서버 렌더 | Must       | 발행 상태 견적서가 메타·항목·합계와 함께 200으로 렌더된다 |
| **F-02** | Notion→DTO 매핑     | Notion 응답을 `InvoiceDTO`로 변환             | Must       | 누락 속성은 안전 기본값 처리, 타입 검증(Zod) 통과         |
| **F-03** | 금액 계산           | 소계·할인·부가세(10%)·총액 계산               | Must       | 부동소수 오차 없이 정수 원 단위로 일치(§9.4)              |
| **F-04** | PDF 다운로드        | 웹과 동일 레이아웃의 PDF 생성·다운로드        | Must       | 한글 정상 출력, 파일명 규칙 준수, 다운로드 성공           |
| **F-05** | 상태 기반 접근 제어 | 미발행(초안)은 404 처리                       | Must       | `상태≠발행`이면 견적 내용이 노출되지 않는다               |
| **F-06** | 만료 처리           | `유효기한 < 오늘`이면 만료 화면               | Must       | 만료 견적은 본문 대신 만료 안내, PDF 비활성               |
| **F-07** | 에러/Not Found 화면 | 삭제·오류·잘못된 ID 처리                      | Must       | 사용자 친화 메시지, 5xx/4xx 구분                          |
| **F-08** | 캐싱/재검증         | ISR로 Notion 호출 최소화                      | Should     | revalidate 주기 후 수정 내용 반영                         |
| **F-09** | noindex/공유 메타   | 검색 비노출 + OG 메타                         | Should     | `robots: noindex`, 링크 미리보기 정상                     |
| **F-10** | 반응형 뷰           | 모바일/데스크톱 대응                          | Should     | 360px~1280px에서 레이아웃 깨짐 없음                       |
| **F-11** | 인쇄 친화 스타일    | 브라우저 인쇄 시 정돈                         | Could      | `@media print` 적용                                       |
| **F-12** | 조회 로깅           | 열람/다운로드 이벤트 기록                     | Could      | 서버 로그에 이벤트 남김(개인정보 제외)                    |
| **F-13** | 다국어/다중통화     | —                                             | Won't(MVP) | §15 로드맵                                                |

---

## 6. 정보 구조 & 화면 정의

### 6.1 라우트 설계

| 라우트                    | 유형                    | 설명                                |
| ------------------------- | ----------------------- | ----------------------------------- |
| `/invoice/[id]`           | Server Component (Page) | 견적서 웹 뷰(F-01)                  |
| `/api/invoice/[id]/pdf`   | Route Handler (GET)     | PDF 생성·다운로드(F-04)             |
| `/invoice/[id]/not-found` | 특수 화면               | Next `notFound()` → `not-found.tsx` |
| `/invoice/[id]` (error)   | `error.tsx`             | 렌더/네트워크 오류 바운더리         |

> `id`는 Notion `pageId`를 그대로 노출하지 않고 **추측 불가능한 공개 식별자**를 사용(§11). MVP에서는 Notion `publicId`(별도 속성, UUID/nanoid) → pageId 매핑.

### 6.2 화면 상태 정의 (견적서 뷰)

| 상태      | 트리거                | 화면                              |
| --------- | --------------------- | --------------------------------- |
| Loading   | 서버 fetch 중         | 스켈레톤(shadcn `Skeleton`)       |
| Success   | 발행·유효             | 견적서 본문 + [PDF 다운로드] 활성 |
| Expired   | 유효기한 경과         | 만료 안내 + 다운로드 비활성       |
| Not Found | 미발행/삭제/잘못된 id | "견적서를 찾을 수 없습니다"       |
| Error     | Notion/네트워크 5xx   | "일시적 오류, 잠시 후 재시도"     |

### 6.3 견적서 뷰 구성 요소

- 헤더: 발신자(회사 로고/명/연락처), 견적번호, 발행일, 유효기한
- 수신자: 고객사명/담당자/연락처
- 항목 테이블: 품목 · 설명 · 수량 · 단가 · 금액
- 합계 영역: 소계 · 할인 · 공급가액 · 부가세(10%) · **총액**
- 비고/약관(Notion 본문 블록, 선택)
- 액션: **[PDF 다운로드]**

---

## 7. 데이터 모델

### 7.1 Notion Database 스키마 (Quote DB)

| Notion 속성명 | 타입                    | 필수 | 매핑 → DTO 필드  |
| ------------- | ----------------------- | ---- | ---------------- |
| `견적번호`    | Title                   | ✅   | `quoteNumber`    |
| `공개ID`      | Rich text (nanoid)      | ✅   | `publicId`       |
| `상태`        | Select (초안/발행/만료) | ✅   | `status`         |
| `발행일`      | Date                    | ✅   | `issuedAt`       |
| `유효기한`    | Date                    | ✅   | `validUntil`     |
| `수신_회사`   | Rich text               | ✅   | `client.company` |
| `수신_담당자` | Rich text               | –    | `client.contact` |
| `수신_연락처` | Rich text/Email         | –    | `client.email`   |
| `발신_회사`   | Rich text               | ✅   | `issuer.company` |
| `발신_연락처` | Rich text               | –    | `issuer.contact` |
| `통화`        | Select (KRW 고정)       | ✅   | `currency`       |
| `할인액`      | Number                  | –    | `discountAmount` |
| `비고`        | Rich text / page body   | –    | `notes`          |

#### 항목(Line Items) 표현 — 비교 후 권장안

| 방식                                                    | 장점                                    | 단점                           | MVP 채택    |
| ------------------------------------------------------- | --------------------------------------- | ------------------------------ | ----------- |
| **A. 별도 관계형 DB(LineItem DB ↔ Quote DB relation)** | 정규화·필터/집계 용이, 항목별 속성 명확 | 구현·쿼리 복잡(추가 API 호출)  | ✅ **채택** |
| B. 페이지 본문 블록(테이블 블록)                        | 입력 직관적                             | 파싱 취약·검증 어려움          | ❌          |
| C. 단일 JSON 속성                                       | 단순                                    | Notion에서 편집 비직관적·오류↑ | ❌          |

> **권장안: A**. 항목 수정/검증이 안정적이고 Admin이 Notion 테이블처럼 입력 가능. 단, Quote 1건 조회 시 관계형 LineItem을 함께 fetch해야 하므로 **N+1 방지를 위해 relation id 일괄 조회** 전략 적용.

**LineItem DB 스키마**
| 속성 | 타입 | DTO 필드 |
|------|------|----------|
| `품목명` | Title | `name` |
| `설명` | Rich text | `description` |
| `수량` | Number | `quantity` |
| `단가` | Number | `unitPrice` |
| `정렬순서` | Number | `order` |
| `견적서` | Relation → Quote DB | (조인 키) |

#### 합계/세금 계산 위치 — 결정

- **계산은 웹(서버)에서 수행**한다. Notion에 합계를 저장하지 않음.
- 근거: ① SSoT는 "입력값(수량·단가·할인)", 합계는 **파생값**이므로 단일 지점(서버)에서 계산해야 불일치가 없다. ② Notion formula는 관계형 합산이 제한적이고 부가세·반올림 규칙을 코드로 검증(테스트)하기 좋다.

### 7.2 앱 도메인 타입 (TypeScript)

```ts
// 통화/금액은 정수 '원' 단위로 처리해 부동소수 오차 방지 (§9.4)
export type InvoiceStatus = 'draft' | 'published' | 'expired'

export interface PartyDTO {
  company: string
  contact?: string
  email?: string
}

export interface LineItemDTO {
  id: string
  name: string
  description?: string
  quantity: number // 정수 또는 소수 허용(개수)
  unitPrice: number // 원 단위 정수
  amount: number // quantity * unitPrice (서버 계산)
  order: number
}

export interface InvoiceTotalsDTO {
  subtotal: number // 항목 amount 합
  discountAmount: number // 할인액
  supplyAmount: number // 공급가액 = subtotal - discount
  vatAmount: number // 부가세 = round(supplyAmount * 0.1)
  total: number // 총액 = supplyAmount + vat
}

export interface InvoiceDTO {
  publicId: string
  quoteNumber: string
  status: InvoiceStatus
  issuedAt: string // ISO date
  validUntil: string // ISO date
  currency: 'KRW'
  issuer: PartyDTO
  client: PartyDTO
  items: LineItemDTO[]
  totals: InvoiceTotalsDTO
  notes?: string
}
```

### 7.3 매핑 전략 (Notion → DTO)

- 계층: **Repository(Notion API 호출) → Service(검증·계산·도메인 변환) → Page/Route(렌더)** — CLAUDE.md 3-Layered 준수.
- `lib/notion/invoiceRepository.ts`: Notion SDK로 raw 응답 조회(관심사: I/O).
- `lib/notion/invoiceMapper.ts`: raw → `InvoiceDTO` 변환, **Zod 스키마로 검증**. 누락/이상값은 안전 기본값 + 경고 로그.
- `lib/invoice/invoiceService.ts`: 매핑 결과에 합계 계산·상태 판정(만료) 적용.
- 의존성 주입: Service는 Repository 인터페이스(`InvoiceRepository`)에 의존 → 테스트 시 mock 주입.

---

## 8. 시스템 아키텍처

### 8.1 데이터 흐름

```
Notion DB ──@notionhq/client──> [Repository] ──raw──> [Mapper(Zod)]
                                                          │ InvoiceDTO
                                                          v
                                                   [Service: 합계/만료판정]
                                                          │
                          ┌───────────────────────────────┼───────────────┐
                          v                                                 v
              [Page /invoice/[id]] (RSC, ISR 캐시)        [Route /api/.../pdf] (PDF 생성)
                          │                                                 │
                          v                                                 v
                     웹 뷰(HTML)                                      application/pdf
```

### 8.2 캐싱/재검증 전략

- 견적서 페이지: **ISR** (`export const revalidate = 60`) — Notion 호출 최소화. 빈번한 수정은 아니므로 60초~5분 권장(운영 시 조정).
- Admin 즉시 반영이 필요하면 **On-demand revalidation**(`revalidateTag`/`revalidatePath`)을 후속 단계로(MVP는 시간 기반).
- PDF는 캐시하지 않거나 짧은 캐시(요청 시 생성) — 데이터 일관성 우선.

### 8.3 API 응답 표준 (CLAUDE.md 준수)

PDF Route 등 내부 API는 일관 구조 유지:

```ts
// 성공: 파일 응답(Content-Disposition). 오류 시 JSON
{ status: 'error', message: string, data: null }
```

페이지는 RSC이므로 예외를 `notFound()`/`error.tsx`로 흡수.

---

## 9. PDF 다운로드 설계

### 9.1 생성 방식 비교

| 방식                                   | 레이아웃 일치                     | 한글 폰트           | Vercel 서버리스 적합성                                               | 복잡도 | 판정            |
| -------------------------------------- | --------------------------------- | ------------------- | -------------------------------------------------------------------- | ------ | --------------- |
| **A. @react-pdf/renderer (서버 생성)** | 별도 PDF 컴포넌트 필요(웹과 분리) | 폰트 등록 명시(TTF) | ✅ 가볍고 빠름, cold start 양호                                      | 중     | ✅ **MVP 채택** |
| B. Puppeteer/Playwright (HTML→PDF)     | 웹과 100% 일치                    | 시스템/임베드 폰트  | ⚠️ 무거움(크롬 바이너리, 용량/시간 제한, `@sparticuz/chromium` 필요) | 상     | 후속 고려       |
| C. 브라우저 print-to-PDF               | 사용자 환경 의존                  | 사용자 폰트 의존    | 서버 부하 없음                                                       | 하     | 보조 수단(F-11) |

> **권장안: A (@react-pdf/renderer)**. 근거: Vercel 서버리스에서 안정적이고 빠르며 의존성이 가볍다. 단점(웹 화면과 별도 레이아웃 코드)은 **공통 디자인 토큰/데이터(InvoiceDTO)를 공유**해 시각적 일치를 확보. 픽셀 단위 완전 일치가 요구되면 후속에 B로 승급.

### 9.2 한글 폰트

- Pretendard / Noto Sans KR 등 **TTF를 리포지토리에 포함**하고 `Font.register`로 임베딩(서브셋 권장).
- 폰트 미등록 시 한글 깨짐 → 빌드 시 폰트 존재 검증 체크 추가.

### 9.3 페이지네이션 & 파일명

- 항목이 많아 1페이지 초과 시 자동 페이지 분할, 각 페이지 헤더(견적번호)·푸터(페이지 번호) 반복.
- 파일명 규칙: `견적서_{quoteNumber}_{client.company}_{issuedAt}.pdf` (공백/특수문자 새니타이즈).

### 9.4 금액 정밀도 (중요)

- 모든 금액은 **정수 '원' 단위**로 보관·계산(부동소수 회피).
- 부가세: `vatAmount = Math.round(supplyAmount * 0.1)` (원 단위 반올림, 규칙 고정·테스트).
- 웹과 PDF는 **동일한 `invoiceService` 계산 결과**를 사용 → 값 불일치 원천 차단.

---

## 10. 비기능 요구사항

| 분류   | 요구사항           | 목표치                                   |
| ------ | ------------------ | ---------------------------------------- |
| 성능   | 견적서 뷰 로드     | LCP < 2.5s (캐시 hit 기준)               |
| 성능   | PDF 생성 시간      | < 3s (서버), 타임아웃 핸들링             |
| 보안   | 링크 추측 방지     | nanoid(≥21자)·noindex (§11)              |
| 보안   | 데이터 노출        | 미발행/만료 본문 비노출                  |
| 접근성 | 시맨틱 마크업·대비 | WCAG AA 색 대비, 테이블 헤더 명시        |
| 반응형 | 모바일 대응        | 360~1280px 정상                          |
| 안정성 | 외부 API 실패      | Notion 장애 시 graceful 에러 화면        |
| 관측성 | 로깅               | 조회/다운로드/오류 이벤트(개인정보 제외) |

---

## 11. 보안 & 접근 제어

> 인증이 없는 **공개 링크** 모델이므로 "링크를 아는 사람만 접근"이 사실상 유일한 통제선이다.

| 위험                     | 완화책                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- |
| ID 추측으로 타 견적 열람 | Notion `pageId` 직접 노출 금지, **nanoid(≥21자) `공개ID`** 사용              |
| 검색엔진 노출            | `robots: { index: false }`, `X-Robots-Tag: noindex`, sitemap 제외            |
| 초안/내부 견적 노출      | **상태=발행만 200**, 그 외 404(존재 자체를 감춤)                             |
| 만료 후 무기한 열람      | `유효기한` 경과 시 만료 화면, PDF 비활성                                     |
| Notion 토큰 유출         | 서버 전용 env(`NOTION_TOKEN`), 클라이언트 번들 미포함, integration 최소 권한 |
| 무한 PDF 생성 요청       | 기본 rate limit/타임아웃(후속 강화)                                          |

> ⚠️ 공개 링크는 "비밀번호 없는 보안"이다. 민감 견적은 **만료를 짧게** 설정하도록 운영 가이드에 명시.

---

## 12. 에러 처리 & 엣지 케이스

| 케이스                    | 처리                                             |
| ------------------------- | ------------------------------------------------ |
| 잘못된/존재하지 않는 `id` | `notFound()` → 404 화면                          |
| 상태=초안/비공개          | 404 (존재 은닉)                                  |
| 유효기한 경과             | 만료 화면(F-06), 다운로드 차단                   |
| Notion 페이지 삭제됨      | 404                                              |
| Notion API 5xx/타임아웃   | `error.tsx`, 재시도 안내, 서버 로그              |
| 필수 속성 누락(매핑 실패) | Zod 검증 실패 → 안전 기본값 또는 404 + 경고 로그 |
| 항목 0개                  | "항목 없음" 안내, 합계 0원 정상 표시             |
| 항목 과다(수백 행)        | PDF 페이지네이션, 뷰 가상화는 후속               |
| 폰트 로드 실패            | 빌드 검증 + 대체 폰트 fallback                   |
| 음수/이상 금액            | 검증 후 0 또는 거절, 로그                        |

---

## 13. 성공 지표 (KPI)

| 지표                | 정의                            | MVP 목표 |
| ------------------- | ------------------------------- | -------- |
| 열람율              | 발급 링크 중 1회 이상 열람 비율 | ≥ 80%    |
| PDF 다운로드 성공률 | 다운로드 시도 대비 성공         | ≥ 99%    |
| 페이지 로드 시간    | p75 LCP                         | < 2.5s   |
| PDF 생성 시간       | p95                             | < 3s     |
| 오류율              | 5xx / 전체 요청                 | < 1%     |
| 금액 불일치 건수    | 웹 vs PDF 합계 차이             | **0건**  |

---

## 14. 마일스톤 & 범위 (WBS)

| #   | 작업                                           | 산출물                                     | 의존성 |
| --- | ---------------------------------------------- | ------------------------------------------ | ------ |
| M1  | Notion 스키마 구축(Quote/LineItem DB)          | DB 템플릿, env 설정                        | —      |
| M2  | Repository + Mapper(Zod)                       | `invoiceRepository.ts`, `invoiceMapper.ts` | M1     |
| M3  | Service(합계·만료 계산) + 단위 테스트          | `invoiceService.ts`, 테스트                | M2     |
| M4  | 견적서 웹 뷰(`/invoice/[id]`) + 상태 화면      | 페이지·컴포넌트                            | M3     |
| M5  | PDF 생성(@react-pdf/renderer)·폰트·파일명      | `/api/.../pdf`                             | M3     |
| M6  | 보안(noindex·상태/만료 접근제어)·에러 바운더리 | 가드·`error.tsx`·`not-found.tsx`           | M4,M5  |
| M7  | 캐싱(ISR)·반응형·인쇄 스타일·QA                | 최종 빌드                                  | M4~M6  |

> 검증 게이트: 각 M 종료 시 `npm run check-all` & `npm run build` 통과(CLAUDE.md 체크리스트).

---

## 15. Out of Scope & 향후 로드맵

| 항목                              | 단계         |
| --------------------------------- | ------------ |
| Client/Admin 인증·계정            | Phase 2      |
| 결제·전자서명·견적 승인           | Phase 2      |
| 견적 → **Invoice(청구서)** 전환   | Phase 2      |
| 다국어·다중 통화                  | Phase 2      |
| 견적 버전 관리/변경 이력          | Phase 3      |
| 이메일 자동 발송·열람 알림        | Phase 3      |
| On-demand revalidation(즉시 반영) | Phase 2      |
| Puppeteer 기반 픽셀 완전 일치 PDF | 필요 시 승급 |

---

## 16. 가정 및 의사결정 (상세) + Open Questions

### 16.1 채택한 기본값

- **도메인/통화/언어**: B2B SaaS · KRW · 한국어. 부가세 10% 단일 규칙.
- **배포**: Vercel. 서버리스 제약으로 PDF는 경량 라이브러리(@react-pdf/renderer) 채택.
- **항목 표현**: 관계형 LineItem DB(방식 A).
- **합계 계산 위치**: 웹(서버), Notion 미저장.
- **공개 ID**: nanoid 기반 `공개ID` 속성(pageId 비노출).
- **재검증**: 시간 기반 ISR(60s, 운영 조정).

### 16.2 Open Questions (확정 필요)

1. 부가세 면세/영세율 견적이 필요한가? (현재 10% 고정)
2. 발신자 정보(회사/로고)는 견적마다 다른가, 전사 고정인가? (고정이면 env/설정으로 분리)
3. 견적서 통화가 KRW 외 필요해질 시점은? (현재 단일)
4. 즉시 반영(On-demand revalidate)이 MVP에 필수인가, 시간 기반으로 충분한가?
5. 링크 만료 정책(기본 유효기간) 표준값은? (예: 발행 후 30일)

---

### ✅ 구현 착수 전 확인 체크리스트

- [ ] Notion Integration 생성·DB 공유, `NOTION_TOKEN`/DB ID env 설정
- [ ] Quote/LineItem DB 속성이 §7 스키마와 일치
- [ ] `InvoiceDTO` 타입·Zod 스키마 정의
- [ ] 합계 계산 단위 테스트(부가세 반올림 포함) 통과
- [ ] 한글 폰트 TTF 포함·등록
- [ ] noindex·상태/만료 접근제어 적용
- [ ] 웹·PDF 합계 일치 검증(0건 불일치)
- [ ] `npm run check-all` & `npm run build` 통과
