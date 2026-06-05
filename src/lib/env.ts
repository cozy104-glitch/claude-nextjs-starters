import { z } from 'zod'

/**
 * 환경 변수 검증 스키마.
 *
 * - NOTION_* 값은 서버 전용 비밀이므로 절대 클라이언트 번들에 노출하지 않는다 (PRD §11).
 * - 빌드 시점(Next build)에는 Notion 변수가 없을 수 있으므로 optional로 두고,
 *   실제 Notion 호출 직전에 requireNotionEnv()로 런타임 보장한다.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Notion Integration (서버 전용)
  NOTION_TOKEN: z.string().min(1, 'NOTION_TOKEN이 필요합니다').optional(),
  NOTION_QUOTE_DB_ID: z
    .string()
    .min(1, 'NOTION_QUOTE_DB_ID가 필요합니다')
    .optional(),
  NOTION_LINE_ITEM_DB_ID: z
    .string()
    .min(1, 'NOTION_LINE_ITEM_DB_ID가 필요합니다')
    .optional(),
})

/**
 * env 파싱 및 검증을 수행한다.
 *
 * 검증 실패 시 어떤 변수가 잘못되었는지 명시적으로 알리고 프로세스를 중단해
 * 잘못된 설정으로 서버가 기동되는 것을 막는다.
 */
function parseEnv() {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_QUOTE_DB_ID: process.env.NOTION_QUOTE_DB_ID,
    NOTION_LINE_ITEM_DB_ID: process.env.NOTION_LINE_ITEM_DB_ID,
  })

  if (!parsed.success) {
    console.error('❌ 환경 변수 검증 실패:', parsed.error.flatten().fieldErrors)
    throw new Error('환경 변수가 올바르지 않습니다. .env 설정을 확인하세요.')
  }

  return parsed.data
}

export const env = parseEnv()

export type Env = z.infer<typeof envSchema>

/**
 * Notion 관련 필수 env가 모두 채워졌는지 런타임에 보장한다.
 * Repository 계층에서 Notion API 호출 직전에 호출해, 누락 시 명확한 에러를 던진다.
 */
export function requireNotionEnv() {
  if (
    !env.NOTION_TOKEN ||
    !env.NOTION_QUOTE_DB_ID ||
    !env.NOTION_LINE_ITEM_DB_ID
  ) {
    throw new Error(
      'Notion 환경 변수(NOTION_TOKEN, NOTION_QUOTE_DB_ID, NOTION_LINE_ITEM_DB_ID)가 설정되지 않았습니다.'
    )
  }

  return {
    token: env.NOTION_TOKEN,
    quoteDbId: env.NOTION_QUOTE_DB_ID,
    lineItemDbId: env.NOTION_LINE_ITEM_DB_ID,
  }
}
