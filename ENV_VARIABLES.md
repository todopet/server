# Environment Variables

## 필수 환경변수
- `DB_URL`: MongoDB 연결 문자열
- `JWT_SECRET`: JWT 서명/검증 키

## 선택 환경변수
- `PORT`: 서버 포트 (기본값 `3001`)
- `VERCEL`: 서버리스 런타임 플래그
- `MODE`: 운영 모드 구분값
- `ROOT`: 클라이언트 기본 URL
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `LOCAL_GOOGLE_CLIENT_ID`
- `LOCAL_GOOGLE_CLIENT_SECRET`
- `GOOGLE_LOGIN_REDIRECT_URI`
- `GOOGLE_SIGNUP_REDIRECT_URI`
- `LOCAL_GOOGLE_LOGIN_REDIRECT_URI`
- `LOCAL_GOOGLE_SIGNUP_REDIRECT_URI`
- `GOOGLE_TOKEN_URL`
- `GOOGLE_USERINFO_URL`
- `ALLOWED_ORIGINS`: 허용 origin 목록(쉼표 구분), 예: `https://todopetclient.vercel.app,http://localhost:3000`
- `SIGNATURE_SECRET`: 요청 서명(HMAC) 검증 키 (서명 보호 라우트에서 필요)
- `SIGNATURE_WINDOW_MS`: 서명 유효 시간(ms), 기본값 `300000`

## 검증 정책
- 서버 시작 시 `src/config/validateEnv.ts`의 `validateEnv()`가 실행됩니다.
- 필수 환경변수 중 하나라도 누락되면 앱은 즉시 예외를 발생시키고 시작되지 않습니다.
- `SIGNATURE_SECRET`이 누락되면 서버는 시작되지만, 서명 보호 라우트 요청 시 오류가 발생할 수 있습니다.
