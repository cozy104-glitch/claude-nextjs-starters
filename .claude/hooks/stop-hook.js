#!/usr/bin/env node
// Claude Code Stop 훅 - 작업 완료 알림
//
// Claude가 응답을 마치고 멈출 때 실행되어 모바일 Slack 앱으로 작업 완료 알림을 전송한다.

const {
  readStdinJson,
  postToSlack,
  formatTimestamp,
  getProjectName,
} = require('./lib/slack')

async function main() {
  try {
    const event = readStdinJson()

    // Stop 페이로드에는 message가 없으므로 모드/노력 수준 등 가용 정보를 활용
    const permissionMode = event.permission_mode || 'default'
    const effortLevel = (event.effort && event.effort.level) || 'unknown'
    const projectName = getProjectName()
    const timestamp = formatTimestamp()

    const text = [
      `✅ *Claude Code 작업 완료*`,
      `• 프로젝트: ${projectName}`,
      `• 모드: ${permissionMode} / effort: ${effortLevel}`,
      `• 시간: ${timestamp}`,
    ].join('\n')

    await postToSlack(text, {
      iconEmoji: ':white_check_mark:',
      username: 'Claude Code',
    })
  } catch (error) {
    // 알림 실패가 Claude Code 흐름을 막지 않도록 로깅만 수행
    console.error(`[stop-hook] 처리 중 오류: ${error.message}`)
  }

  // 알림 용도이므로 작업을 차단하지 않고 항상 정상 종료한다.
  // (process.exit를 강제 호출하지 않고 이벤트 루프가 비면 자연 종료 — Windows libuv 크래시 회피)
  process.exitCode = 0
}

main()
