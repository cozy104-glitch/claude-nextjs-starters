import type { InvoiceTotalsDTO, LineItemDTO } from './invoice.types'

/** 부가세율 (PRD: KRW 고정, 10% 단일 규칙) */
export const VAT_RATE = 0.1

/**
 * 항목별 금액 계산: amount = quantity * unitPrice (원 단위 반올림).
 * 웹과 PDF가 동일 결과를 쓰도록 단일 지점에서 계산한다 (PRD §9.4).
 */
export function calcLineAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice)
}

/**
 * 견적서 합계를 계산한다 (PRD §7.2, F-03).
 *
 * - subtotal: 항목 amount 합
 * - supplyAmount: 공급가액 = subtotal - discount (음수 방지)
 * - vatAmount: 부가세 = round(supplyAmount * 0.1)  ← 반올림 규칙 고정
 * - total: 총액 = supplyAmount + vat
 *
 * 모든 값은 정수 '원' 단위로 반환해 부동소수 오차를 차단한다.
 */
export function calcInvoiceTotals(
  items: LineItemDTO[],
  discountAmount: number = 0
): InvoiceTotalsDTO {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const safeDiscount = Math.max(0, Math.round(discountAmount))
  const supplyAmount = Math.max(0, subtotal - safeDiscount)
  const vatAmount = Math.round(supplyAmount * VAT_RATE)
  const total = supplyAmount + vatAmount

  return {
    subtotal,
    discountAmount: safeDiscount,
    supplyAmount,
    vatAmount,
    total,
  }
}

/**
 * 유효기한 경과 여부를 판정한다 (PRD F-06).
 * validUntil(ISO date)이 기준일(now) 이전이면 만료로 본다.
 */
export function isExpired(validUntil: string, now: Date = new Date()): boolean {
  const validDate = new Date(validUntil)
  if (Number.isNaN(validDate.getTime())) {
    return false // 날짜 파싱 실패 시 만료로 단정하지 않고 호출부 판단에 위임
  }
  // 유효기한 당일 23:59:59까지 유효한 것으로 처리
  validDate.setHours(23, 59, 59, 999)
  return validDate.getTime() < now.getTime()
}
