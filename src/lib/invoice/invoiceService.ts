import type { InvoiceDTO, InvoiceStatus } from './invoice.types'
import { calcInvoiceTotals, isExpired } from './invoiceCalculator'

/**
 * Service 계층 (PRD §7.3): 매핑된 데이터에 합계 계산·상태(만료) 판정을 적용한다.
 *
 * 의존성 주입 원칙: 실제 구현은 InvoiceRepository 인터페이스에 의존하도록 작성한다.
 * 본 함수들은 도메인 규칙(계산/만료)을 담당하는 순수 로직이라 Repository 없이 단위 테스트 가능.
 */

/**
 * 매핑된 견적서에 합계 계산을 적용해 완전한 InvoiceDTO를 만든다.
 */
export function applyTotals(
  invoice: Omit<InvoiceDTO, 'totals'>,
  discountAmount: number = 0
): InvoiceDTO {
  const totals = calcInvoiceTotals(invoice.items, discountAmount)
  return { ...invoice, totals }
}

/**
 * 견적서의 최종 노출 상태를 판정한다 (PRD F-05, F-06).
 *
 * - draft: 미발행 → 호출부에서 404 처리 (존재 은닉)
 * - published이지만 유효기한 경과 → expired로 승격
 * - 그 외 → 원래 상태 유지
 */
export function resolveStatus(
  rawStatus: InvoiceStatus,
  validUntil: string,
  now: Date = new Date()
): InvoiceStatus {
  if (rawStatus === 'draft') {
    return 'draft'
  }
  if (rawStatus === 'published' && isExpired(validUntil, now)) {
    return 'expired'
  }
  return rawStatus
}

/**
 * 외부에 견적 본문을 노출해도 되는 상태인지 판정한다.
 * published만 본문 노출 (PRD §11: 상태=발행만 200).
 */
export function isViewable(status: InvoiceStatus): boolean {
  return status === 'published'
}
