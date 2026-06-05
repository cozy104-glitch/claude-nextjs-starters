/**
 * 루트 페이지.
 *
 * 견적서 웹뷰어는 공개 링크(`/invoice/[id]`)로만 접근하는 서비스이므로,
 * 루트는 별도 랜딩 없이 최소 안내만 제공한다 (검색엔진 비노출은 robots에서 처리).
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold">견적서 웹뷰어</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        전달받은 견적서 링크를 통해 접근해 주세요.
      </p>
    </main>
  )
}
