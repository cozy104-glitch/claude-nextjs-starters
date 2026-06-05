/**
 * Repository 계층 인터페이스 (PRD §7.3, 3-Layered Architecture).
 *
 * 관심사: Notion API I/O. Service는 이 인터페이스에 의존(DI)해
 * 테스트 시 mock을 주입할 수 있게 한다.
 *
 * 구현체(NotionInvoiceRepository)는 M2 마일스톤에서 @notionhq/client로 작성한다.
 */

/** Notion에서 조회한 raw 견적서 데이터 (매핑 전 형태) */
export interface RawInvoice {
  pageId: string
  properties: Record<string, unknown>
  notes?: string
}

/** Notion에서 조회한 raw 항목 데이터 */
export interface RawLineItem {
  pageId: string
  properties: Record<string, unknown>
}

export interface InvoiceRepository {
  /**
   * 공개 ID(nanoid)로 견적서 raw 데이터를 조회한다.
   * 존재하지 않으면 null을 반환한다 (호출부가 notFound 처리).
   */
  findByPublicId(publicId: string): Promise<RawInvoice | null>

  /**
   * 견적서에 연결된 항목들을 일괄 조회한다 (N+1 방지, PRD §7.1).
   */
  findLineItems(quotePageId: string): Promise<RawLineItem[]>
}
