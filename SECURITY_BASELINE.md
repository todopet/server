# Security Baseline

## 적용 항목
- 전역 보안 헤더: `helmet`
- 인증 라우트 요청 제한: `express-rate-limit`
- 서명 검증이 필요한 민감 요청 제한: `express-rate-limit`

## Rate Limit 환경변수
- `AUTH_RATE_LIMIT_WINDOW_MS`: 인증 라우트 제한 시간(ms), 기본값 `900000`(15분)
- `AUTH_RATE_LIMIT_MAX`: 인증 라우트 제한 횟수, 기본값 `60`
- `SIGNATURE_RATE_LIMIT_WINDOW_MS`: 서명 보호 라우트 제한 시간(ms), 기본값 `300000`(5분)
- `SIGNATURE_RATE_LIMIT_MAX`: 서명 보호 라우트 제한 횟수, 기본값 `120`

## 응답 포맷
- 제한 초과 시 HTTP `429`
- 응답 body는 기존 API 포맷(`buildResponse`)을 사용
