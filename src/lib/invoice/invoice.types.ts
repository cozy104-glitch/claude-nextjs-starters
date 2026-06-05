/**
 * 견적서 도메인 타입 (PRD §7.2)
 *
 * 통화/금액은 정수 '원' 단위로 처리해 부동소수 오차를 방지한다 (PRD §9.4).
 */

export type InvoiceStatus = 'draft' | 'published' | 'expired'

/** 발신자/수신자 공통 표현 */
export interface PartyDTO {
  company: string
  contact?: string
  email?: string
}

/** 견적 항목 (LineItem) */
export interface LineItemDTO {
  id: string
  name: string
  description?: string
  quantity: number // 개수 (정수 또는 소수 허용)
  unitPrice: number // 원 단위 정수
  amount: number // quantity * unitPrice (서버 계산)
  order: number
}

/** 합계 영역 (모두 서버에서 파생 계산, Notion 미저장) */
export interface InvoiceTotalsDTO {
  subtotal: number // 항목 amount 합
  discountAmount: number // 할인액
  supplyAmount: number // 공급가액 = subtotal - discount
  vatAmount: number // 부가세 = round(supplyAmount * 0.1)
  total: number // 총액 = supplyAmount + vat
}

/** 견적서 최종 도메인 모델 */
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
