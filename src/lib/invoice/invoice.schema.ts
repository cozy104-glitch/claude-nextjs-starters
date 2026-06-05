import { z } from 'zod'

/**
 * 견적서 도메인 모델의 Zod 검증 스키마 (PRD §7.2, F-02).
 *
 * Notion → DTO 매핑 결과를 이 스키마로 검증해, 누락/이상값을 조기에 차단한다.
 * 금액은 정수 '원' 단위이므로 음수/비정수 등 이상값을 검증 단계에서 거른다.
 */

export const partySchema = z.object({
  company: z.string().min(1),
  contact: z.string().optional(),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export const lineItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().nonnegative(),
  unitPrice: z.number().int().nonnegative(),
  amount: z.number().int().nonnegative(),
  order: z.number().int().nonnegative(),
})

export const invoiceTotalsSchema = z.object({
  subtotal: z.number().int().nonnegative(),
  discountAmount: z.number().int().nonnegative(),
  supplyAmount: z.number().int().nonnegative(),
  vatAmount: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
})

export const invoiceStatusSchema = z.enum(['draft', 'published', 'expired'])

export const invoiceSchema = z.object({
  publicId: z.string().min(1),
  quoteNumber: z.string().min(1),
  status: invoiceStatusSchema,
  issuedAt: z.string().min(1),
  validUntil: z.string().min(1),
  currency: z.literal('KRW'),
  issuer: partySchema,
  client: partySchema,
  items: z.array(lineItemSchema),
  totals: invoiceTotalsSchema,
  notes: z.string().optional(),
})

export type InvoiceSchema = z.infer<typeof invoiceSchema>
