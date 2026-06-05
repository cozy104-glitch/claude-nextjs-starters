'use client'

/**
 * 견적서 에러 바운더리 (PRD F-07, §6.2).
 * Notion/네트워크 5xx 등 일시적 오류 시 재시도 안내를 제공한다.
 */
export default function InvoiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // 운영 관측성을 위해 서버 로그로 전파 (개인정보 제외, PRD §10)
  console.error('견적서 렌더 오류:', error.digest ?? error.message)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-xl font-semibold">일시적인 오류가 발생했습니다</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground mt-4 rounded-md px-4 py-2 text-sm"
      >
        다시 시도
      </button>
    </main>
  )
}
