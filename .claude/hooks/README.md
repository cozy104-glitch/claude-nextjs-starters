# Claude Code Slack 알림 훅

Claude Code가 **권한을 요청할 때**와 **작업을 완료했을 때** 모바일 Slack 앱으로 알림을 보냅니다.

## 구성

| 파일 | 역할 |
|------|------|
| `notification-hook.js` | `Notification` 이벤트(권한 요청·입력 대기) 발생 시 🔔 알림 전송 |
| `stop-hook.js` | `Stop` 이벤트(응답 완료) 발생 시 ✅ 알림 전송 |
| `lib/slack.js` | 두 훅이 공유하는 로직 (.env 로드, stdin 파싱, Slack 전송) |

훅 등록은 `.claude/settings.json`의 `hooks` 섹션에서 `node` exec 형식으로 연결됩니다.
이 설정은 Claude Code `/hooks` 메뉴(Project settings 범위)에서 확인·편집할 수 있습니다.

> Node 내장 `fetch`만 사용하므로 `curl`/`jq`/`bash` 설치가 필요 없고 Windows/macOS/Linux에서 동일하게 동작합니다. (Node 18+ 필요)

## 설정 방법

### 1. Slack Incoming Webhook 발급

1. https://api.slack.com/apps → **Create New App** → *From scratch*
2. 앱 이름(예: `Claude Code`)과 알림 받을 워크스페이스 선택
3. 좌측 **Incoming Webhooks** → 토글 **On**
4. 하단 **Add New Webhook to Workspace** → 알림 받을 채널(예: `#claude-code`) 선택 → **Allow**
5. 생성된 URL 복사: `https://hooks.slack.com/services/T.../B.../xxxx`

### 2. 웹훅 URL 등록

프로젝트 루트의 `.env.example`을 `.env`로 복사한 뒤 URL을 채웁니다:

```bash
cp .env.example .env
# .env 안의 SLACK_WEBHOOK_URL 값을 발급받은 URL로 교체
```

`.env`는 `.gitignore`에 의해 커밋되지 않습니다(시크릿 보호). 환경변수 `SLACK_WEBHOOK_URL`이
이미 설정돼 있으면 그 값이 우선 사용됩니다.

### 3. 모바일 푸시 활성화

Slack 모바일 앱 → 해당 채널 → 알림 설정을 **모든 메시지(All)** 로 변경하세요.
기본값(멘션만 알림)에서는 웹훅 메시지가 푸시되지 않을 수 있습니다.

## 동작 테스트

실제 이벤트 없이 모의 페이로드를 주입해 확인할 수 있습니다:

```bash
echo '{"hook_event_name":"Notification","message":"테스트 권한 요청","notification_type":"permission_prompt"}' | node .claude/hooks/notification-hook.js
echo '{"hook_event_name":"Stop","permission_mode":"default","effort":{"level":"high"}}' | node .claude/hooks/stop-hook.js
```

Slack 채널과 모바일 앱에 🔔 / ✅ 메시지가 도착하면 정상입니다.
`SLACK_WEBHOOK_URL`이 없으면 알림을 건너뛰고 경고만 출력하며, Claude Code 동작은 막지 않습니다.
