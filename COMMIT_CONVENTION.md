# Commit Convention

> TodoPet 프로젝트 커밋 메시지 작성 규칙

## 기본 구조

```
<type>: <subject>

[optional body]

[optional footer]
```

---

## Type (필수)

커밋의 성격을 나타내는 접두사입니다. **소문자**로 작성합니다.

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | feat: 펫 레벨업 알림 기능 추가 |
| `fix` | 버그 수정 | fix: 로그인 시 무한 로딩 문제 해결 |
| `refactor` | 코드 리팩토링 (기능 변경 없음) | refactor: TodoStore 로직 분리 |
| `style` | 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음) | style: Prettier 적용 |
| `design` | UI/UX 디자인 변경 | design: 펫 이미지 크기 조정 |
| `chore` | 빌드, 패키지 매니저 설정 등 | chore: React Query 의존성 추가 |
| `docs` | 문서 수정 | docs: README 설치 가이드 추가 |
| `test` | 테스트 코드 추가/수정 | test: TodoList 컴포넌트 테스트 추가 |
| `perf` | 성능 개선 | perf: PetArea 렌더링 최적화 |
| `build` | 빌드 시스템 수정 | build: Vite 설정 변경 |
| `ci` | CI/CD 설정 변경 | ci: GitHub Actions 워크플로우 추가 |
| `revert` | 이전 커밋 되돌리기 | revert: feat: 펫 레벨업 알림 기능 추가 |

---

## Subject (필수)

커밋의 제목입니다.

### 규칙
1. **50자 이내**로 작성
2. **마침표(.)를 붙이지 않음**
3. **명령형**으로 작성 (과거형 X)
   - ✅ `fix: 이미지 경로 수정`
   - ❌ `fix: 이미지 경로를 수정했습니다`
   - ❌ `fix: 이미지 경로 수정.`

### 예시
```
feat: Todo 완료 시 보상 애니메이션 추가
fix: 인증 실패 시 리다이렉트 처리 누락 문제 해결
refactor: API 엔드포인트 상수화
style: Tailwind 클래스 정렬
```

---

## Body (선택)

상세한 설명이 필요한 경우 작성합니다.

### 규칙
1. Subject와 한 줄 띄우기
2. **무엇을, 왜** 변경했는지 작성
3. 72자마다 줄바꿈

### 예시
```
refactor: TodoStore 로직 분리

Store 간 직접 호출을 제거하고 컴포넌트 레벨에서 조합하도록 수정.
이를 통해 Store 간 결합도를 낮추고 테스트 용이성을 높임.

변경 사항:
- setStatus에서 useToastsStore 직접 호출 제거
- Toast 표시 로직을 컴포넌트로 이동
```

---

## Footer (선택)

이슈 번호, Breaking Change 등을 명시합니다.

### 이슈 참조
```
Fixes #123
Closes #456
Related to #789
```

### Breaking Changes
```
BREAKING CHANGE: API 응답 타입이 res<T>에서 ApiResponse<T>로 변경됨
```

---

## 실전 예시

### 1. 기능 추가 (단순)
```
feat: 펫 경험치 진행바 추가
```

### 2. 버그 수정 (상세)
```
fix: 이미지 파일 경로 오류 수정

joyEmotion.png.png 파일명이 이중 확장자로 되어 있어
이미지 로딩이 실패하는 문제 해결.

변경 사항:
- 파일명: joyEmotion.png.png → joyEmotion.png
- PetArea.styles.tsx import 경로 수정

Fixes #67
```

### 3. 리팩토링 (Breaking Change)
```
refactor: 타입 네이밍 컨벤션 통일

모든 인터페이스명을 PascalCase로 변경.

변경 사항:
- user → User
- category → Category
- todo → Todo
- myPet → MyPet

BREAKING CHANGE: 모든 타입 import 구문 수정 필요
```

### 4. 여러 작업 (Phase 단위)
```
refactor: Phase 0 긴급 버그 수정

1. 이미지 파일 경로 오류 수정
2. 인증 실패 처리 로직 복원
3. 라우팅 중복 경로 제거

Related to #issue-number
```

---

## 커밋 메시지 템플릿

프로젝트 루트에서 다음 명령어를 실행하여 템플릿을 설정할 수 있습니다:

```bash
git config commit.template .gitmessage
```

`.gitmessage` 파일 내용:
```
# <type>: <subject>
#
# <body>
#
# <footer>
#
# --- Type 목록 ---
# feat: 새로운 기능 추가
# fix: 버그 수정
# refactor: 코드 리팩토링
# style: 코드 포맷팅
# design: UI/UX 디자인 변경
# chore: 빌드, 패키지 매니저 설정
# docs: 문서 수정
# test: 테스트 코드
# perf: 성능 개선
# build: 빌드 시스템
# ci: CI/CD 설정
# revert: 커밋 되돌리기
#
# --- 규칙 ---
# 1. Subject는 50자 이내, 마침표 없음
# 2. Body는 72자마다 줄바꿈
# 3. Footer에 이슈 번호 참조 (Fixes #123)
```

---

## Commitlint 설정 (선택)

자동으로 커밋 메시지를 검증하려면:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

`commitlint.config.js`:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'style',
        'design',
        'chore',
        'docs',
        'test',
        'perf',
        'build',
        'ci',
        'revert',
      ],
    ],
  },
};
```

---

## 현재 Phase 0 작업 커밋 예시

```bash
git add .
git commit -m "fix: Phase 0 긴급 버그 수정

1. 이미지 파일 경로 오류 수정
   - joyEmotion.png.png → joyEmotion.png
   - sadEmotion.png.png → sadEmotion.png
   - PetArea.styles.tsx import 수정

2. 인증 실패 처리 로직 복원
   - App.tsx 주석 처리된 로직 활성화
   - useCallback 최적화 적용
   - finally 블록으로 로딩 상태 정리

3. 라우팅 중복 경로 제거
   - routePaths에서 중복된 / 경로 제거"
```

---

## 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [AngularJS Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Udacity Git Commit Message Style Guide](https://udacity.github.io/git-styleguide/)
