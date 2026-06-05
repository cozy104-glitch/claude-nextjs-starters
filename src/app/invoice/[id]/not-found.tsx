/**
 * 견적서 Not Found 화면 (PRD F-07, §6.2).
 * 미발행(초안)·삭제·잘못된 ID를 모두 동일하게 처리해 존재를 은닉한다 (PRD §11).
 */
export default function InvoiceNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-xl font-semibold">견적서를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        링크가 올바른지 확인하시거나 담당자에게 문의해 주세요.
      </p>
    </main>
  )
}
