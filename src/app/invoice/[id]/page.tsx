import { notFound } from 'next/navigation'

/**
 * 견적서 웹 뷰 페이지 (PRD F-01, §6.1).
 *
 * ISR 캐싱으로 Notion 호출을 최소화한다 (PRD §8.2).
 * 운영 시 revalidate 주기는 조정 (60s ~ 5min 권장).
 */
export const revalidate = 60

interface InvoicePageProps {
  params: Promise<{ id: string }>
}

/**
 * TODO(M4): Service 계층을 통해 InvoiceDTO를 조회·렌더한다.
 *   1. repository.findByPublicId(id) → raw
 *   2. mapper로 InvoiceDTO 변환 + Zod 검증 (M2)
 *   3. service.resolveStatus / applyTotals 적용 (M3)
 *   4. 상태별 분기: published → 본문, expired → 만료 안내, draft/null → notFound()
 */
export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params

  // 골격 단계: 아직 데이터 계층이 연결되지 않았으므로 안전하게 404 처리.
  if (!id) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="text-muted-foreground text-sm">
        견적서 뷰 (구현 예정) — publicId: {id}
      </p>
    </main>
  )
}
