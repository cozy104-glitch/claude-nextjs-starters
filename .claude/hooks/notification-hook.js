#!/usr/bin/env node
// Claude Code Notification 훅 - 권한 요청 및 사용자 입력 대기 알림
//
// Claude Code가 Notification 이벤트(권한 요청, 입력 대기 등)를 발생시킬 때 실행되어
// 모바일 Slack 앱으로 알림을 전송한다. permission_prompt / idle_prompt 등 모든 알림을 전달한다.

const {
  readStdinJson,
  postToSlack,
  formatTimestamp,
  getProjectName,
} = require('./lib/slack')

async function main() {
  try {
    const event = readStdinJson()

    // Notification 페이로드에서 필요한 정보 추출
    const message = event.message || '(메시지 없음)'
    const notificationType = event.notification_type || 'notification'
    const projectName = getProjectName()
    const timestamp = formatTimestamp()

    const text = [
      `🔔 *Claude Code 알림* (${notificationType})`,
      `• 프로젝트: ${projectName}`,
      `• 내용: ${message}`,
      `• 시간: ${timestamp}`,
    ].join('\n')

    await postToSlack(text, { iconEmoji: ':bell:', username: 'Claude Code' })
  } catch (error) {
    // 알림 실패가 Claude Code 흐름을 막지 않도록 로깅만 수행
    console.error(`[notification-hook] 처리 중 오류: ${error.message}`)
  }

  // Notification 훅은 결정권이 없으므로 항상 정상 종료한다.
  // (process.exit를 강제 호출하지 않고 이벤트 루프가 비면 자연 종료 — Windows libuv 크래시 회피)
  process.exitCode = 0
}

main()
