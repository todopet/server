# TodoPet Server - 코드 분석 및 개선 사항 리포트

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [심각도 높음 - 즉시 수정 필요](#2-심각도-높음---즉시-수정-필요)
3. [심각도 중간 - 기능 개선 필요](#3-심각도-중간---기능-개선-필요)
4. [심각도 낮음 - 코드 품질 개선](#4-심각도-낮음---코드-품질-개선)
5. [아키텍처 개선 제안](#5-아키텍처-개선-제안)
6. [보안 개선 사항](#6-보안-개선-사항)
7. [성능 최적화 제안](#7-성능-최적화-제안)
8. [파일별 상세 개선 사항](#8-파일별-상세-개선-사항)

---

## 1. 프로젝트 개요

- **프로젝트명**: TodoPet Server (할일 관리 + 펫 육성 게임)
- **기술 스택**: Express.js, MongoDB (Mongoose), JWT, Google OAuth
- **분석 일자**: 2026-02-14

---

## 2. 심각도 높음 - 즉시 수정 필요

### 2.1. 중복 진입점 파일 (app.js vs src/index.js)

**위치**: `app.js`, `src/index.js`

**문제점**:
- 두 파일이 거의 동일한 역할을 하지만 설정이 다름
- `app.js`는 여러 origin을 허용하고, `src/index.js`는 단일 origin만 허용
- `src/index.js`에서 `cookieParser`를 import 했지만 사용하지 않음
- 어떤 파일이 실제 진입점인지 혼란을 줌

**개선 방안**:
```javascript
// 하나의 진입점만 유지하고 나머지는 삭제
// 환경변수로 CORS origin을 관리
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
```

---

### 2.2. 전역 에러 핸들러 미구현

**위치**: `app.js`

**문제점**:
- Express 앱에 전역 에러 핸들러가 없음
- `asyncHandler`가 `next(err)`를 호출하지만 처리할 핸들러가 없음
- 서버 크래시 가능성이 있음

**현재 코드**:
```javascript
// app.js 끝 부분
app.listen(config.PORT, function () {
  console.log(`서버가 ${config.PORT}에서 실행 중....`);
});
```

**개선 방안**:
```javascript
// 404 핸들러
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    data: null
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.httpCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    data: null
  });
});

app.listen(config.PORT, function () {
  console.log(`서버가 ${config.PORT}에서 실행 중....`);
});
```

---

### 2.3. MongoDB 연결 에러 처리 미흡

**위치**: `app.js:20-26`

**문제점**:
- 연결 성공 이벤트만 처리하고 에러 이벤트는 처리하지 않음
- DB 연결 실패 시 서버가 정상 시작된 것처럼 보임

**현재 코드**:
```javascript
mongoose.connect(config.DB_URL, { dbName: 'Todo-Tamers' });
mongoose.connection.on('connected', () =>
  console.log('정상적으로 MongoDB 서버에 연결되었습니다.')
);
```

**개선 방안**:
```javascript
mongoose.connect(config.DB_URL, { dbName: 'Todo-Tamers' })
  .then(() => console.log('MongoDB 연결 성공'))
  .catch((err) => {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 에러:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB 연결이 끊어졌습니다. 재연결 시도 중...');
});
```

---

### 2.4. 사용되지 않는 AuthService 클래스

**위치**: `src/services/authService.js`

**문제점**:
- 클래스가 비어있음 (로직 없음)
- import는 되어 있지만 사용되지 않음

**현재 코드**:
```javascript
import { UserModel } from "../db/models/index.js";

class AuthService {}
export default AuthService;
```

**개선 방안**:
- 삭제하거나, authRouter의 로직을 이 서비스로 이동시켜 분리

---

### 2.5. 라우터 응답 불일치 문제

**위치**: `src/routers/userRouter.js:12-18`, `src/routers/inventoryRouter.js:11-18`

**문제점**:
- 일부 라우터는 `return` 으로 반환하고 일부는 `res.json(buildResponse(result))`를 직접 호출
- 일관성이 없어 유지보수가 어려움

**예시 1 - userRouter.js (return 사용)**:
```javascript
userRouter.get('/rank', asyncHandler(async (req, res, next) => {
  const ranking = await historyService.getRanking();
  return ranking;  // asyncHandler가 buildResponse로 감싸줌
}));
```

**예시 2 - inventoryRouter.js (직접 호출)**:
```javascript
inventoryRouter.get('/', asyncHandler(async (req, res, next) => {
  const inventoryId = await inventoryService.getInventoryIdByUserId(userId);
  const result = await inventoryService.getInventoryById(inventoryId);
  res.json(buildResponse(result));  // 직접 호출
}));
```

**개선 방안**:
- 모든 라우터에서 `return` 방식으로 통일
- `asyncHandler`가 자동으로 `buildResponse`를 적용하도록

---

## 3. 심각도 중간 - 기능 개선 필요

### 3.1. JWT 토큰 만료 시간 고정

**위치**: `src/utils/jwt.js:15`

**문제점**:
- 토큰 만료 시간이 1시간으로 하드코딩됨
- 환경에 따라 다르게 설정할 수 없음

**현재 코드**:
```javascript
const option = {
  algorithm: 'HS256',
  expiresIn: '1h'
};
```

**개선 방안**:
```javascript
const option = {
  algorithm: 'HS256',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h'
};
```

---

### 3.2. signatureMiddleware 보안 취약점

**위치**: `src/middlewares/signatureMiddleware.js`

**문제점**:
- 시간 기반 검증만 사용 (쉽게 우회 가능)
- 예측 가능한 알고리즘: `(receivedTime - 1000) / 4`
- HMAC 서명 등 더 안전한 방식이 필요

**현재 코드**:
```javascript
const receivedTime = req.headers['x-custom-data'];
const checkReceivedTime = (receivedTime - 1000) / 4;
```

**개선 방안**:
```javascript
import crypto from 'crypto';

const signatureMiddleware = (req, res, next) => {
  const timestamp = req.headers['x-timestamp'];
  const signature = req.headers['x-signature'];
  const secret = process.env.SIGNATURE_SECRET;

  // 타임스탬프 검증 (5분 이내)
  const now = Date.now();
  if (Math.abs(now - parseInt(timestamp)) > 5 * 60 * 1000) {
    return res.status(403).json({ error: 'Request expired' });
  }

  // HMAC 서명 검증
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}:${req.method}:${req.path}`)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  next();
};
```

---

### 3.3. userAuthorization에서 잘못된 HTTP 상태 코드

**위치**: `src/middlewares/userAuthorization.js:15-22, 31-37`

**문제점**:
- 401 Unauthorized 상황인데 `res.json()`으로 200 OK를 반환
- 클라이언트가 실제 에러인지 구분하기 어려움

**현재 코드**:
```javascript
return res.json(
  buildResponse({
    status: 401,
    result: 'Unauthorized',
    reason: '로그인한 유저만 사용할 수 있는 서비스입니다.'
  })
);
```

**개선 방안**:
```javascript
return res.status(401).json({
  error: '로그인한 유저만 사용할 수 있는 서비스입니다.',
  data: null
});
```

---

### 3.4. 서비스 인스턴스 중복 생성

**위치**: 여러 서비스 및 라우터 파일

**문제점**:
- `UserService`, `InventoryService` 등이 여러 곳에서 중복 인스턴스화
- 메모리 낭비 및 순환 의존성 위험

**현재 코드 예시**:
```javascript
// userService.js
constructor() {
  this.inventoryService = new InventoryService();
  this.myPetService = new MyPetService();
  // ...
}

// authRouter.js
const inventoryService = new InventoryService();
const myPetService = new MyPetService();
```

**개선 방안**:
- 의존성 주입(Dependency Injection) 패턴 도입
- 또는 싱글톤 패턴 사용

```javascript
// services/container.js
class ServiceContainer {
  constructor() {
    this.services = new Map();
  }

  register(name, factory) {
    this.services.set(name, { factory, instance: null });
  }

  get(name) {
    const service = this.services.get(name);
    if (!service.instance) {
      service.instance = service.factory(this);
    }
    return service.instance;
  }
}

export const container = new ServiceContainer();
```

---

### 3.5. 하드코딩된 값들

**위치**: 여러 파일

| 파일 | 라인 | 하드코딩된 값 | 설명 |
|------|------|-------------|------|
| `src/utils/common.js` | 2 | `maxVolume = 50` | 인벤토리 최대 용량 |
| `src/services/todoContentService.js` | 67 | `history.length < 10` | 하루 최대 보상 횟수 |
| `src/services/myPetService.js` | 125 | `0.05` | 분당 스탯 감소량 |
| `src/services/myPetService.js` | 187 | `level < 5` | 최대 레벨 |
| `src/db/models/historyModel.js` | 51 | `$limit: 10` | 랭킹 표시 수 |

**개선 방안**:
```javascript
// config/gameSettings.js
export const GAME_CONFIG = {
  INVENTORY_MAX_VOLUME: parseInt(process.env.INVENTORY_MAX || '50'),
  DAILY_REWARD_LIMIT: parseInt(process.env.DAILY_REWARD_LIMIT || '10'),
  PET_STAT_DECAY_RATE: parseFloat(process.env.PET_DECAY_RATE || '0.05'),
  PET_MAX_LEVEL: parseInt(process.env.PET_MAX_LEVEL || '5'),
  RANKING_DISPLAY_COUNT: parseInt(process.env.RANKING_COUNT || '10')
};
```

---

### 3.6. 날짜 처리 문제

**위치**: `src/services/userService.js:52-55`

**문제점**:
- 수동으로 9시간을 더해 한국 시간을 계산 (비표준 방식)
- dayjs나 timezone 플러그인을 사용하는 것이 권장됨

**현재 코드**:
```javascript
date: formatDateToString(
  new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
)
```

**개선 방안**:
```javascript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const koreanDate = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD');
```

---

### 3.7. 회원 탈퇴 후 토큰 처리 문제

**위치**: `src/routers/authRouter.js:221-227`

**문제점**:
- 탈퇴 후 새로운 토큰을 발급하는 이상한 로직
- 탈퇴 시에는 토큰을 삭제만 하면 됨

**현재 코드**:
```javascript
const newToken = await userService.WithdrawUserAndToken(userId);
res.clearCookie('token');
res.cookie('token', newToken);  // 왜 새 토큰을 발급?
```

**개선 방안**:
```javascript
await userService.withdrawUser(userId);
res.clearCookie('token', {
  httpOnly: true,
  secure: true,
  sameSite: 'none'
});
res.status(200).json({ message: '탈퇴 처리 완료' });
```

---

## 4. 심각도 낮음 - 코드 품질 개선

### 4.1. 불필요한 import 문

**위치**: 여러 파일

| 파일 | 불필요한 import |
|------|----------------|
| `src/index.js:4` | `path` - 사용하지 않음 |
| `src/index.js:7` | `axios` - 사용하지 않음 |
| `src/routers/authRouter.js:17` | `mongoose` - 사용하지 않음 |
| `src/routers/todoCategoryRouter.js:2` | `todoContentSchema` import 후 미사용 |
| `src/routers/petRouter.js:3` | `buildResponse` - import 후 미사용 |
| `src/routers/myPetRouter.js:4` | `buildResponse` - import 후 미사용 |

---

### 4.2. 사용되지 않는 변수 및 코드

**위치**: 여러 파일

```javascript
// src/services/myPetService.js:170-175 - 아무 작업도 하지 않는 코드
updatedPet.pets[0].pet.experience;
updatedPet.pets[0].pet.level;
updatedPet.pets[0].pet.hunger;
updatedPet.pets[0].pet.affection;
updatedPet.pets[0].pet.cleanliness;
updatedPet.pets[0].pet.condition;

// src/db/models/userModel.js:81 - 빈 함수
async findInfoByUserId(userId) {}

// src/routers/userRouter.js:14 - next 파라미터 사용하지 않음
asyncHandler(async (req, res, next) => {  // next 불필요
```

---

### 4.3. 주석 처리된 코드 정리 필요

**위치**: 여러 파일

- `src/index.js:34-42` - CORS 관련 주석 코드
- `src/routers/authRouter.js:43-51` - 환경 변수 주석
- `src/routers/authRouter.js:61-71` - URL 생성 주석
- `src/routers/rewardRouter.js` - 전체 파일이 주석 처리됨
- `src/db/models/index.js:30-48` - 여러 주석 코드

---

### 4.4. 일관성 없는 코딩 스타일

**문제점**:

1. **메서드명 불일치**:
   - `findById` vs `findByPetStorageId` (동일한 동작)
   - `deleteMany` vs `deleteAllHistoryByUserId`

2. **에러 메시지 언어 혼용**:
   - 한글: `'이미 가입되어있는 유저입니다.'`
   - 영어: `'Inventory not found'`

3. **비동기 처리 방식 혼용**:
   - 일부: `async/await`
   - 일부: `.then()` 체인

4. **들여쓰기 및 포맷팅 불일치**:
   - 일부 파일 4칸, 일부 2칸 들여쓰기

---

### 4.5. 타입 불일치

**위치**: 스키마와 실제 사용 비교

```javascript
// todoContentSchema.js - categoryId가 String
categoryId: { type: String, required: true }

// todoCategorySchema.js - userId가 ObjectId
userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }

// 일관성 없음 - 둘 다 ObjectId 또는 둘 다 String이어야 함
```

---

## 5. 아키텍처 개선 제안

### 5.1. 계층 분리 개선

**현재 구조 문제점**:
- 라우터에서 비즈니스 로직 직접 수행 (authRouter.js)
- 서비스에서 다른 서비스를 직접 인스턴스화

**개선된 구조**:
```
src/
├── config/           # 설정 파일 (새로 추가)
│   ├── database.js
│   ├── cors.js
│   └── gameSettings.js
├── controllers/      # 컨트롤러 계층 (새로 추가)
│   ├── authController.js
│   └── ...
├── middlewares/
├── services/
├── repositories/     # 데이터 접근 계층 (models 대체)
├── models/           # Mongoose 모델만 정의
└── utils/
```

### 5.2. 에러 처리 표준화

```javascript
// errors/AppError.js
export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

### 5.3. 응답 형식 표준화

```javascript
// utils/response.js
export const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
  error: null
});

export const errorResponse = (error, message = 'Error') => ({
  success: false,
  message,
  data: null,
  error: {
    code: error.errorCode || 'UNKNOWN_ERROR',
    details: error.message
  }
});
```

---

## 6. 보안 개선 사항

### 6.1. 환경 변수 검증

**현재**: 환경 변수 누락 시 undefined로 동작

**개선**:
```javascript
// config/validateEnv.js
const requiredEnvVars = [
  'DB_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};
```

### 6.2. Rate Limiting 추가

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100 요청
  message: { error: 'Too many requests' }
});

app.use('/api/', limiter);
```

### 6.3. 입력 값 검증 추가

```javascript
import { body, param, validationResult } from 'express-validator';

// 예시: 카테고리 생성 시 검증
todoCategoryRouter.post('/',
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('카테고리명은 1-50자 사이여야 합니다'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  asyncHandler(async (req, res, next) => {
    // ...
  })
);
```

### 6.4. Helmet 미들웨어 추가

```javascript
import helmet from 'helmet';
app.use(helmet());
```

---

## 7. 성능 최적화 제안

### 7.1. 데이터베이스 인덱스 추가

```javascript
// schemas/historySchema.js
historySchema.index({ userId: 1, createdAt: -1 });

// schemas/todoContentSchema.js
todoContentSchema.index({ categoryId: 1, createdAt: -1 });

// schemas/inventorySchema.js
inventorySchema.index({ userId: 1 });
```

### 7.2. Mongoose lean() 일관적 사용

일부 쿼리에서 `.lean()` 누락:
```javascript
// src/db/models/itemModel.js:7
async findById(id) {
  return await Item.findById(id);  // .lean() 누락
}
```

### 7.3. N+1 쿼리 문제 해결

**위치**: `src/services/inventoryService.js:20-28`

**현재 코드 (N+1 문제)**:
```javascript
const itemsWithInfo = await Promise.all(
  inventory.items.map(async (item) => {
    const itemInfo = await this.itemModel.findById(item.item);  // N번 쿼리
    return { ...item, info: itemInfo };
  })
);
```

**개선 방안 (1번 쿼리)**:
```javascript
const itemIds = inventory.items.map(item => item.item);
const itemInfos = await Item.find({ _id: { $in: itemIds } }).lean();
const itemInfoMap = new Map(itemInfos.map(item => [item._id.toString(), item]));

const itemsWithInfo = inventory.items.map(item => ({
  ...item,
  info: itemInfoMap.get(item.item.toString())
}));
```

### 7.4. Mongoose Population 활용

```javascript
// 현재: 수동으로 아이템 정보 조회
// 개선: populate 사용

inventorySchema.virtual('populatedItems', {
  ref: 'items',
  localField: 'items.item',
  foreignField: '_id'
});

// 사용
const inventory = await Inventory
  .findById(id)
  .populate('items.item')
  .lean();
```

---

## 8. 파일별 상세 개선 사항

### 8.1. app.js

| 라인 | 문제 | 개선 방안 |
|------|------|----------|
| 20-22 | DB 연결 에러 처리 없음 | try-catch 또는 .catch() 추가 |
| 35-45 | CORS origin 함수가 복잡함 | cors 패키지의 배열 옵션 활용 |
| 66 | 에러 핸들러 미들웨어 없음 | 전역 에러 핸들러 추가 |
| - | 보안 헤더 없음 | helmet 미들웨어 추가 |
| - | request 로깅 없음 | morgan 미들웨어 추가 |

### 8.2. src/routers/authRouter.js

| 라인 | 문제 | 개선 방안 |
|------|------|----------|
| 11 | cookieParser 중복 import | app.js에서 이미 적용됨, 제거 |
| 17 | mongoose import 미사용 | 제거 |
| 23-41 | config 객체가 복잡함 | 별도 config 파일로 분리 |
| 54 | authRouter에서 cookieParser 중복 사용 | 제거 |
| 74-143 | login/redirect 로직이 너무 김 | authService 또는 controller로 분리 |
| 107-127 | 사용자 생성이 라우터에서 수행됨 | userService.addUser에서 처리 (이미 됨) |
| 153-191 | signup/redirect가 login/redirect와 거의 동일 | 공통 함수로 추출 |
| 213-232 | try-catch가 asyncHandler 내부에 또 있음 | 불필요, asyncHandler가 처리함 |
| 219 | 오타: `deleteAllTodoCategoiesByUserId` | `deleteAllTodoCategoriesByUserId`로 수정 |

### 8.3. src/routers/userRouter.js

| 라인 | 문제 | 개선 방안 |
|------|------|----------|
| 14-17 | next 파라미터 미사용 | 제거 |
| 66-76 | userAuthorization 중복 사용 | 이미 v1에 적용됨, 불필요 |

### 8.4. src/services/userService.js

| 라인 | 문제 | 개선 방안 |
|------|------|----------|
| 13-17 | 생성자에서 많은 서비스 인스턴스화 | DI 패턴 적용 |
| 44-80 | addUser에서 기본 데이터 생성이 너무 많음 | 별도 초기화 서비스로 분리 |
| 52-54 | 수동 시간 계산 | dayjs timezone 사용 |
| 103-107 | 주석 처리된 코드 | 제거 |
| 109-125 | 닉네임 검증 로직이 복잡함 | validator 함수로 분리 |
| 161-176 | 날짜 비교 로직이 복잡함 | dayjs로 간소화 |

### 8.5. src/services/myPetService.js

| 라인 | 문제 | 개선 방안 |
|------|------|----------|
| 125 | 매직 넘버 `0.05` | 상수로 추출 |
| 157-257 | updatePetWithItemEffect 함수가 너무 김 | 여러 함수로 분리 |
| 170-175 | 아무 작업도 하지 않는 코드 | 제거 |
| 187, 204, 227 | 레벨 5 하드코딩 | 상수로 추출 |
| 210-224, 233-249 | 중복 코드 | 공통 함수로 추출 |

### 8.6. src/services/inventoryService.js

| 라인 | 문제 | 개선 방안 |
|------|------|----------|
| 20-28, 54-62 | N+1 쿼리 문제 | $in 쿼리로 개선 |
| 69-84, 109-119, 121-139 | 비슷한 함수들이 많음 | 리팩토링 필요 |
| 175 | 사용되지 않는 변수 `usedItems` | 사용하거나 제거 |

### 8.7. src/middlewares/asyncHandler.js

| 라인 | 문제 | 개선 방안 |
|------|------|----------|
| 7-15 | 복잡한 조건문 | 간소화 가능 |

```javascript
// 개선된 버전
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next))
    .then((data) => {
      if (!res.headersSent && data !== undefined) {
        res.json(buildResponse(data));
      }
    })
    .catch(next);
```

### 8.8. src/db/models/index.js

| 라인 | 문제 | 개선 방안 |
|------|------|----------|
| 8 | 오타: `AcheiveModel` | `AchieveModel`로 수정 |
| 27 | export에도 오타 | 동일하게 수정 |
| 30-48 | 주석 처리된 코드가 많음 | 정리 필요 |

---

## 9. package.json 개선

### 현재 문제점:
1. `nodemon`이 dependencies에 있음 (devDependencies로 이동 필요)
2. `crypto`는 Node.js 내장 모듈이므로 설치 불필요
3. 테스트 프레임워크 없음
4. 린팅 도구 없음

### 개선된 package.json:
```json
{
  "name": "todopet-server",
  "version": "1.0.0",
  "main": "app.js",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon --watch 'src/*' ./app.js",
    "test": "jest",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dayjs": "^1.11.9",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.0.0",
    "express-validator": "^7.0.0",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.1",
    "mongoose": "^7.4.3",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "eslint": "^8.50.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.1"
  }
}
```

---

## 10. 우선순위별 작업 리스트

### 즉시 수정 (Critical)
1. [ ] 전역 에러 핸들러 추가
2. [ ] MongoDB 연결 에러 처리 추가
3. [ ] 중복 진입점 파일 정리 (app.js 또는 src/index.js 중 하나 선택)
4. [ ] userAuthorization에서 올바른 HTTP 상태 코드 반환

### 단기 개선 (1-2주)
1. [ ] 하드코딩된 값들 환경 변수/상수로 추출
2. [ ] 불필요한 import 및 주석 코드 제거
3. [ ] 라우터 응답 방식 통일
4. [ ] 빈 AuthService 정리
5. [ ] signatureMiddleware 보안 강화

### 중기 개선 (1개월)
1. [ ] 서비스 의존성 주입 패턴 도입
2. [ ] 에러 처리 표준화
3. [ ] 입력 값 검증 추가
4. [ ] N+1 쿼리 문제 해결
5. [ ] 데이터베이스 인덱스 추가

### 장기 개선 (2-3개월)
1. [ ] 테스트 코드 작성
2. [ ] API 문서화 (Swagger)
3. [ ] 로깅 시스템 구축
4. [ ] CI/CD 파이프라인 구축
5. [ ] 컨트롤러 계층 분리

---

## 11. 추가 권장 사항

### 11.1. 로깅 시스템 도입
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 11.2. API 문서화
```javascript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TodoPet API',
      version: '1.0.0'
    }
  },
  apis: ['./src/routers/*.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

### 11.3. 테스트 환경 구축
```javascript
// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js']
};
```

---

## 마무리

이 프로젝트는 기본적인 구조는 잘 잡혀있으나, 초기 개발 단계에서 발생하는 일반적인 문제들이 있습니다. 위에 나열된 개선 사항들을 단계적으로 적용하면 더 안정적이고 유지보수하기 쉬운 코드베이스를 만들 수 있습니다.

가장 중요한 것은 **전역 에러 핸들러 추가**, **MongoDB 연결 에러 처리**, **HTTP 상태 코드 정상화**입니다. 이 세 가지를 먼저 수정하시는 것을 권장드립니다.
