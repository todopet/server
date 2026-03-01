# Input Validation Guide

## 목적
- 라우터 계층에서 요청 입력값 검증을 표준화한다.
- 검증 실패 응답을 `buildResponse` 포맷으로 일관되게 반환한다.

## 라이브러리
- `express-validator`

## 파일 구조
- 공통 검증 결과 처리: `src/middlewares/requestValidator.js`
- 도메인별 스키마:
  - `src/validators/authValidator.js`
  - `src/validators/userValidator.js`
  - `src/validators/todoValidator.js`

## 네이밍 규칙
- `{도메인}{대상}{동작}Validator` 형태를 사용한다.
- 예: `oauthRedirectCodeValidator`, `updateTodoValidator`

## 적용 규칙
- 라우트에 `[validator 배열..., requestValidator, 실제 핸들러]` 순서로 연결한다.
- body/param/query 입력값은 가능한 라우터에서 조기 차단한다.
- 검증 실패 시 HTTP 400과 아래 포맷을 사용한다.

```json
{
  "error": {
    "statusCode": 400,
    "result": "ValidationError",
    "reason": "요청 입력값이 올바르지 않습니다.",
    "details": [
      { "field": "nickname", "message": "nickname은 필수입니다." }
    ]
  },
  "data": null
}
```
