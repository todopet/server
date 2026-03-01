# TypeScript 마이그레이션 정책 / DoD (#75)

## 목표 상태
- 저장소의 애플리케이션 소스 파일(`app`, `src`, `api`, `scripts`, `tests`)은 `.ts`를 기본으로 사용한다.
- 신규 파일은 `.ts`만 허용한다.
- `.js` 파일은 기술 부채 대상이며 신규 추가를 금지한다.

## 현재 적용 범위
- `app.ts`
- `src/**/*.ts`
- `api/**/*.ts`
- `scripts/**/*.ts`
- `tests/**/*.ts`

## 운영 규칙
1. 신규 파일 생성 시 `.ts` 확장자만 사용한다.
2. 상대 import는 `.ts` 확장자를 명시한다.
3. 타입 정의 파일은 `src/types/**/*.d.ts`에 모은다.
4. 빌드/검증은 `npm run build`, `npm test`를 PR 기준 필수로 실행한다.

## 완료 기준(Definition of Done)
- [x] 코드베이스의 실행/테스트 대상 JS 파일이 TS로 전환됨
- [x] `npm run build` 성공
- [x] `npm test` 성공
- [x] CI에서 `npm ci -> npm run build -> npm test` 실행
- [x] 신규 파일 TS 강제 규칙 문서화

## 단계별 타입 강화 계획
1. 1단계: 파일 확장자 전환(이번 PR)
2. 2단계: `@ts-nocheck` 제거 우선순위 정의(라우터/서비스/모델)
3. 3단계: 모듈별 명시 타입 도입 및 strict 규칙 실질 적용
4. 4단계: CI에 타입 커버리지/품질 게이트 강화
