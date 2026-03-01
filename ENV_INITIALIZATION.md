# Env Initialization Order

## 목적
- 실행 경로별로 `.env` 로딩 순서를 명확히 해서 import 시점 env 참조 오류를 방지한다.

## 적용 원칙
- 엔트리포인트에서 `dotenv`를 가장 먼저 로딩한다.
- 라이브러리/미들웨어/라우터 모듈에서는 `dotenv.config()`를 호출하지 않는다.
- 모듈 top-level에서 env 값을 고정 상수로 캐싱하지 않고, 실행 시점에 `process.env`를 읽는다.

## 실행 경로별 순서
1. `app.js`
- `import 'dotenv/config'`를 최상단에 선언한다.
- 이후 라우터/미들웨어를 import한다.
- 따라서 하위 모듈은 `.env` 로딩 이후 평가된다.

2. `app.ts`
- `app.js`를 import하는 래퍼 엔트리다.
- 실제 env 로딩은 `app.js` 최상단에서 수행된다.

3. `api/index.js` (Vercel)
- `app.js`를 import하므로 동일하게 `app.js`의 env 초기화 정책을 따른다.
- 서버리스 환경에서는 플랫폼 주입 env를 우선 사용한다.

## 점검 대상 env 의존 모듈
- `src/routers/authRouter.js`
- `src/utils/jwt.js`
- `src/middlewares/signatureMiddleware.js`

위 모듈은 top-level 캐싱 대신 함수 실행 시점 env 참조 방식으로 정리한다.
