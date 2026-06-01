---
description: 'check-all과 build를 실행해 작업 완료를 검증하고 실패 항목을 수정합니다'
allowed-tools:
  [
    'Bash(npm run check-all:*)',
    'Bash(npm run typecheck:*)',
    'Bash(npm run lint:*)',
    'Bash(npm run format:check:*)',
    'Bash(npm run build:*)',
    'Read',
    'Edit',
  ]
---

# Claude 명령어: Check

작업 완료 전 모든 검사를 통과하는지 확인합니다.

## 사용법

```
/check
```

## 프로세스

1. `npm run check-all` 실행 (typecheck → lint → format:check 통합)
2. 실패 시 원인을 분석하고 해당 파일을 수정
3. 수정 후 `npm run check-all` 재실행하여 통과 확인
4. `npm run build` 실행하여 프로덕션 빌드 성공 확인
5. 남은 에러/경고를 항목별로 요약 보고

## 검사 항목

- **typecheck**: `tsc --noEmit` — 타입 오류 검출
- **lint**: `eslint .` — 코드 품질/규칙 위반
- **format:check**: `prettier --check .` — 포맷팅 일관성
- **build**: `next build --turbopack` — 빌드 성공 여부

## 수정 규칙

- 포맷팅 실패는 `npm run format`으로 일괄 정리 후 재확인
- lint 자동 수정 가능 항목은 `npm run lint:fix` 활용
- 타입 오류는 임의의 `any` 캐스팅 대신 정확한 타입으로 해결
- 빌드 실패는 에러 메시지의 파일/라인을 직접 확인 후 수정

## 참고사항

- 모든 검사 통과 + 빌드 성공이 작업 완료의 기준
- 검사를 우회하기 위한 규칙 비활성화(eslint-disable 등)는 지양
