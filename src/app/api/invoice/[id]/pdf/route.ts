import { NextResponse } from 'next/server'

/**
 * 견적서 PDF 다운로드 Route Handler (PRD F-04, §6.1, §9).
 *
 * 구현 방식: @react-pdf/renderer (서버 생성). 한글 폰트 TTF 임베딩 필요 (PRD §9.2).
 * 데이터 일관성을 위해 PDF는 캐시하지 않고 요청 시 생성한다 (PRD §8.2).
 *
 * API 응답 표준 (CLAUDE.md / PRD §8.3):
 *   - 성공: application/pdf 파일 응답 (Content-Disposition)
 *   - 오류: { status: 'error', message, data: null }
 */
interface PdfRouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: PdfRouteContext) {
  const { id } = await context.params

  try {
    if (!id) {
      return NextResponse.json(
        { status: 'error', message: '잘못된 요청입니다.', data: null },
        { status: 400 }
      )
    }

    // TODO(M5): Service로 InvoiceDTO 조회 → 만료/미발행 차단 → @react-pdf/renderer로 생성.
    //   파일명 규칙: 견적서_{quoteNumber}_{client.company}_{issuedAt}.pdf (새니타이즈)
    return NextResponse.json(
      {
        status: 'error',
        message: 'PDF 생성은 아직 구현되지 않았습니다.',
        data: null,
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('PDF 생성 오류:', error)
    return NextResponse.json(
      { status: 'error', message: '일시적인 오류가 발생했습니다.', data: null },
      { status: 500 }
    )
  }
}
