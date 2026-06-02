// Claude Code 훅 공용 Slack 유틸리티
//
// 두 훅 스크립트(notification-hook.js, stop-hook.js)가 공유하는 로직.
// 외부 의존성(curl/jq/bash) 없이 Node 내장 기능만 사용하여 크로스플랫폼으로 동작한다.

const fs = require('fs')
const path = require('path')

// Claude Code가 주입하는 프로젝트 루트. 없으면 현재 작업 디렉터리로 폴백.
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd()

/**
 * .env 파일을 파싱하여 단순 key-value 객체로 반환한다.
 * KEY=VALUE 형식만 처리하며, 주석(#)과 양쪽 따옴표를 제거한다.
 * @param {string} filePath - .env 파일 경로
 * @returns {Record<string, string>}
 */
function parseEnvFile(filePath) {
  const result = {}

  try {
    if (!fs.existsSync(filePath)) {
      return result
    }

    const content = fs.readFileSync(filePath, 'utf8')

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()

      // 빈 줄 또는 주석 줄 건너뛰기
      if (!line || line.startsWith('#')) {
        continue
      }

      const eqIndex = line.indexOf('=')
      if (eqIndex === -1) {
        continue
      }

      const key = line.slice(0, eqIndex).trim()
      let value = line.slice(eqIndex + 1).trim()

      // 양쪽을 감싼 따옴표 제거
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      result[key] = value
    }
  } catch (error) {
    // 파싱 실패는 치명적이지 않으므로 경고만 남기고 빈 객체 반환
    console.error(`[slack-hook] .env 파싱 실패: ${error.message}`)
  }

  return result
}

/**
 * Slack 웹훅 URL을 로드한다.
 * 우선순위: 프로세스 환경변수 > 프로젝트 루트의 .env 파일.
 * @returns {string | null} 웹훅 URL 또는 미설정 시 null
 */
function loadWebhookUrl() {
  if (process.env.SLACK_WEBHOOK_URL) {
    return process.env.SLACK_WEBHOOK_URL
  }

  const envVars = parseEnvFile(path.join(PROJECT_DIR, '.env'))
  return envVars.SLACK_WEBHOOK_URL || null
}

/**
 * 표준입력(stdin)으로 전달된 훅 페이로드 JSON을 읽어 파싱한다.
 * Claude Code는 훅 실행 시 이벤트 정보를 stdin에 JSON으로 전달한다.
 *
 * 비동기 스트림(process.stdin) 대신 파일 디스크립터 0을 동기 읽기 한다.
 * Windows에서 stdin 파이프를 비동기로 다룰 때 발생하는 libuv assertion 크래시를 피하기 위함.
 * @returns {Record<string, any>} 파싱된 객체 (실패 시 빈 객체)
 */
function readStdinJson() {
  let raw = ''

  // TTY(파이프 입력 없음)인 경우 빈 객체 반환
  if (process.stdin.isTTY) {
    return {}
  }

  try {
    raw = fs.readFileSync(0, 'utf8')
  } catch (error) {
    // 입력이 없거나 읽기 실패 시 빈 객체로 처리
    return {}
  }

  // 선행 BOM 제거 (일부 셸 파이프가 UTF-8 BOM을 덧붙임)
  const cleaned = raw.replace(/^﻿/, '').trim()
  if (!cleaned) {
    return {}
  }

  try {
    return JSON.parse(cleaned)
  } catch (error) {
    console.error(`[slack-hook] stdin JSON 파싱 실패: ${error.message}`)
    return {}
  }
}

/**
 * Slack 채널로 텍스트 메시지를 전송한다.
 * 전송 실패가 Claude Code 흐름을 막지 않도록 모든 예외를 내부에서 처리한다.
 * @param {string} text - 전송할 메시지 본문
 * @param {object} [options] - { iconEmoji, username }
 * @returns {Promise<boolean>} 전송 성공 여부
 */
async function postToSlack(text, options = {}) {
  const webhookUrl = loadWebhookUrl()

  if (!webhookUrl) {
    console.error(
      '[slack-hook] SLACK_WEBHOOK_URL이 설정되지 않았습니다. .env 파일을 확인하세요. (알림 건너뜀)'
    )
    return false
  }

  const payload = { text }
  if (options.iconEmoji) payload.icon_emoji = options.iconEmoji
  if (options.username) payload.username = options.username

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(
        `[slack-hook] Slack 응답 오류: ${response.status} ${response.statusText} ${body}`
      )
      return false
    }

    return true
  } catch (error) {
    // 네트워크 오류 등 — 알림 실패가 작업을 막지 않도록 로깅만 수행
    console.error(`[slack-hook] Slack 전송 실패: ${error.message}`)
    return false
  }
}

/**
 * 사람이 읽기 좋은 현재 시각 문자열(YYYY-MM-DD HH:mm:ss, 로컬 기준)을 반환한다.
 * @returns {string}
 */
function formatTimestamp() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  )
}

/**
 * 프로젝트 디렉터리명을 반환한다 (Slack 메시지에 프로젝트 식별용으로 사용).
 * @returns {string}
 */
function getProjectName() {
  return path.basename(PROJECT_DIR)
}

module.exports = {
  loadWebhookUrl,
  readStdinJson,
  postToSlack,
  formatTimestamp,
  getProjectName,
}
