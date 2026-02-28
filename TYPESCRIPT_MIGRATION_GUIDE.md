# TypeScript 마이그레이션 가이드

## 개요
이 문서는 TodoPet 서버를 JavaScript에서 TypeScript로 점진적으로 마이그레이션하는 단계별 가이드입니다.

---

## 사전 준비 (필수 수정 사항)

### Critical 이슈 3가지 먼저 수정

#### 1. 전역 에러 핸들러 추가
**파일**: `app.js` (끝부분, listen 전에 추가)

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

#### 2. MongoDB 연결 에러 처리
**파일**: `app.js` (라인 20-26 수정)

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
```

#### 3. 중복 진입점 제거
**작업**: `src/index.js` 파일 삭제

```bash
rm src/index.js
```

---

## 1단계: TypeScript 환경 설정

### 1.1 패키지 설치

```bash
npm install --save-dev typescript @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken ts-node nodemon

# 기타 타입 정의
npm install --save-dev @types/bcrypt
```

### 1.2 tsconfig.json 생성

**파일**: 프로젝트 루트에 `tsconfig.json` 생성

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*",
    "app.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 1.3 package.json 스크립트 수정

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "start:prod": "npm run build && npm run start"
  }
}
```

### 1.4 nodemon 설정

**파일**: 프로젝트 루트에 `nodemon.json` 생성

```json
{
  "watch": ["src", "app.ts"],
  "ext": "ts",
  "exec": "ts-node app.ts"
}
```

---

## 2단계: 점진적 파일 마이그레이션

### 마이그레이션 순서 (의존성 낮은 순서대로)

```
✅ = 완료  🔄 = 진행중  ⏸️ = 대기
```

### 2.1 유틸리티 및 타입 정의 (1-2일)

#### 우선순위 1: 공통 타입 정의
- [ ] `src/types/common.ts` (새로 생성)
- [ ] `src/types/models.ts` (새로 생성)
- [ ] `src/types/express.d.ts` (Express 확장)

#### 우선순위 2: 유틸리티 파일
- [ ] `src/utils/common.js` → `src/utils/common.ts`
- [ ] `src/utils/jwt.js` → `src/utils/jwt.ts`
- [ ] `src/utils/hash_Password.js` → `src/utils/hash_Password.ts`
- [ ] `src/misc/utils.js` → `src/misc/utils.ts`
- [ ] `src/misc/AppError.js` → `src/misc/AppError.ts`
- [ ] `src/misc/commonError.js` → `src/misc/commonError.ts`

---

### 2.2 DB 스키마 (2-3일)

- [ ] `src/db/schemas/userSchema.js` → `src/db/schemas/userSchema.ts`
- [ ] `src/db/schemas/petSchema.js` → `src/db/schemas/petSchema.ts`
- [ ] `src/db/schemas/myPetSchema.js` → `src/db/schemas/myPetSchema.ts`
- [ ] `src/db/schemas/todoCategorySchema.js` → `src/db/schemas/todoCategorySchema.ts`
- [ ] `src/db/schemas/todoContentSchema.js` → `src/db/schemas/todoContentSchema.ts`
- [ ] `src/db/schemas/inventorySchema.js` → `src/db/schemas/inventorySchema.ts`
- [ ] `src/db/schemas/itemSchema.js` → `src/db/schemas/itemSchema.ts`
- [ ] `src/db/schemas/historySchema.js` → `src/db/schemas/historySchema.ts`
- [ ] `src/db/schemas/achieveSchema.js` → `src/db/schemas/achieveSchema.ts`
- [ ] `src/db/schemas/index.js` → `src/db/schemas/index.ts`

---

### 2.3 DB 모델 (3-4일)

- [ ] `src/db/models/userModel.js` → `src/db/models/userModel.ts`
- [ ] `src/db/models/petModel.js` → `src/db/models/petModel.ts`
- [ ] `src/db/models/myPetModel.js` → `src/db/models/myPetModel.ts`
- [ ] `src/db/models/todoCategoryModel.js` → `src/db/models/todoCategoryModel.ts`
- [ ] `src/db/models/todoContentModel.js` → `src/db/models/todoContentModel.ts`
- [ ] `src/db/models/inventoryModel.js` → `src/db/models/inventoryModel.ts`
- [ ] `src/db/models/itemModel.js` → `src/db/models/itemModel.ts`
- [ ] `src/db/models/historyModel.js` → `src/db/models/historyModel.ts`
- [ ] `src/db/models/achieveModel.js` → `src/db/models/achieveModel.ts`
- [ ] `src/db/models/index.js` → `src/db/models/index.ts`

---

### 2.4 서비스 레이어 (4-6일)

- [ ] `src/services/authService.js` → `src/services/authService.ts` (삭제 또는 로직 추가)
- [ ] `src/services/userService.js` → `src/services/userService.ts`
- [ ] `src/services/petService.js` → `src/services/petService.ts`
- [ ] `src/services/myPetService.js` → `src/services/myPetService.ts`
- [ ] `src/services/todoCategoryService.js` → `src/services/todoCategoryService.ts`
- [ ] `src/services/todoContentService.js` → `src/services/todoContentService.ts`
- [ ] `src/services/inventoryService.js` → `src/services/inventoryService.ts`
- [ ] `src/services/itemService.js` → `src/services/itemService.ts`
- [ ] `src/services/historyService.js` → `src/services/historyService.ts`
- [ ] `src/services/rewardService.js` → `src/services/rewardService.ts`
- [ ] `src/services/index.js` → `src/services/index.ts`

---

### 2.5 미들웨어 (1-2일)

- [ ] `src/middlewares/asyncHandler.js` → `src/middlewares/asyncHandler.ts`
- [ ] `src/middlewares/userAuthorization.js` → `src/middlewares/userAuthorization.ts`
- [ ] `src/middlewares/signatureMiddleware.js` → `src/middlewares/signatureMiddleware.ts`

---

### 2.6 라우터 (3-4일)

- [ ] `src/routers/authRouter.js` → `src/routers/authRouter.ts`
- [ ] `src/routers/userRouter.js` → `src/routers/userRouter.ts`
- [ ] `src/routers/petRouter.js` → `src/routers/petRouter.ts`
- [ ] `src/routers/myPetRouter.js` → `src/routers/myPetRouter.ts`
- [ ] `src/routers/todoCategoryRouter.js` → `src/routers/todoCategoryRouter.ts`
- [ ] `src/routers/todoContentRouter.js` → `src/routers/todoContentRouter.ts`
- [ ] `src/routers/inventoryRouter.js` → `src/routers/inventoryRouter.ts`
- [ ] `src/routers/itemRouter.js` → `src/routers/itemRouter.ts`
- [ ] `src/routers/rewardRouter.js` (삭제 또는 활성화)
- [ ] `src/routers/index.js` → `src/routers/index.ts`

---

### 2.7 진입점 (1일)

- [ ] `app.js` → `app.ts`

---

## 3단계: 타입 정의 강화 및 코드 개선

### 3.1 공통 타입 정의

#### `src/types/common.ts` (새로 생성)

```typescript
export interface ApiResponse<T = any> {
  error: string | null;
  data: T | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type MembershipStatus = 'active' | 'withdrawn' | 'suspended';
export type TodoStatus = 'unchecked' | 'reverted' | 'completed';
```

#### `src/types/models.ts` (새로 생성)

```typescript
import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  googleId: string;
  nickname: string;
  membershipStatus: MembershipStatus;
  picture: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPet {
  _id: Types.ObjectId;
  petName: string;
  level: number;
  experience: number;
  hunger: number;
  affection: number;
  cleanliness: number;
  condition: number;
  createdAt: Date;
  updatedAt: Date;
}

// 나머지 모델 인터페이스들...
```

#### `src/types/express.d.ts` (Express 확장)

```typescript
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      currentUserId?: string;
    }
  }
}
```

---

### 3.2 환경 변수 타입 정의

#### `src/types/env.d.ts` (새로 생성)

```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_URL: string;
      JWT_SECRET: string;
      MODE?: string;
      ROOT?: string;

      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      LOCAL_GOOGLE_CLIENT_ID?: string;
      LOCAL_GOOGLE_CLIENT_SECRET?: string;

      GOOGLE_LOGIN_REDIRECT_URI?: string;
      GOOGLE_SIGNUP_REDIRECT_URI?: string;
      LOCAL_GOOGLE_LOGIN_REDIRECT_URI?: string;
      LOCAL_GOOGLE_SIGNUP_REDIRECT_URI?: string;

      GOOGLE_TOKEN_URL?: string;
      GOOGLE_USERINFO_URL?: string;
    }
  }
}

export {};
```

---

## 4단계: 파일별 마이그레이션 가이드

### 예시 1: utils/jwt.js → utils/jwt.ts

**Before (JavaScript)**:
```javascript
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET;

const sign = (_id) => {
  try {
    const payload = { userId: _id };
    const option = { algorithm: 'HS256', expiresIn: '1h' };
    return jwt.sign(payload, secretKey, option);
  } catch (err) {
    throw new Error('토큰 발행에 실패했습니다');
  }
};

const verify = (userToken) => {
  try {
    const decoded = jwt.verify(userToken, secretKey);
    return { userId: decoded.userId };
  } catch (error) {
    throw new Error('잘못된 토큰입니다.');
  }
};

export default { sign, verify };
```

**After (TypeScript)**:
```typescript
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  userId: string;
}

interface SignOptions {
  algorithm: 'HS256';
  expiresIn: string;
}

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error('JWT_SECRET이 환경변수에 설정되지 않았습니다.');
}

const sign = (_id: string): string => {
  try {
    const payload: JwtPayload = { userId: _id };
    const option: SignOptions = {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    };
    return jwt.sign(payload, secretKey, option);
  } catch (err) {
    throw new Error('토큰 발행에 실패했습니다');
  }
};

const verify = (userToken: string): JwtPayload => {
  try {
    const decoded = jwt.verify(userToken, secretKey) as JwtPayload;
    return { userId: decoded.userId };
  } catch (error) {
    throw new Error('잘못된 토큰입니다.');
  }
};

export default { sign, verify };
```

---

### 예시 2: models/userModel.js → models/userModel.ts

**Before (JavaScript)**:
```javascript
import { model } from 'mongoose';
import { userSchema } from '../schemas/index.js';

const User = model('users', userSchema);

class UserModel {
  constructor() {
    this.userProjection = { password: 0, __v: 0 };
  }

  async create(newUser) {
    const existingUser = await User.findOne({ googleId: newUser.googleId });
    if (existingUser) {
      throw new Error('이미 가입되어있는 유저입니다.');
    }
    const createNewUser = await User.create(newUser);
    return createNewUser.toObject();
  }

  async findById(userId) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

export default UserModel;
```

**After (TypeScript)**:
```typescript
import { model, Document, Types } from 'mongoose';
import { userSchema } from '../schemas/index.js';
import { IUser } from '../../types/models.js';

interface UserDocument extends IUser, Document {}

const User = model<UserDocument>('users', userSchema);

interface CreateUserDto {
  googleId: string;
  nickname: string;
  picture: string;
}

class UserModel {
  private userProjection = { password: 0, __v: 0 };

  async create(newUser: CreateUserDto): Promise<IUser> {
    const existingUser = await User.findOne({ googleId: newUser.googleId });
    if (existingUser) {
      throw new Error('이미 가입되어있는 유저입니다.');
    }
    const createNewUser = await User.create(newUser);
    return createNewUser.toObject();
  }

  async findById(userId: string): Promise<IUser> {
    const user = await User.findById(userId).lean<IUser>();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await User.findOne({ googleId }).lean<IUser>();
  }
}

export default UserModel;
```

---

### 예시 3: services/userService.js → services/userService.ts

**Before (JavaScript)**:
```javascript
import { UserModel } from '../db/models/index.js';

class UserService {
  constructor() {
    this.userModel = new UserModel();
  }

  async findUserById(userId) {
    const user = await this.userModel.findById(userId);
    return user;
  }

  async updateUserNickname(userId, newNickname) {
    if (newNickname.length <= 8 && newNickname.length > 0) {
      return await this.userModel.updateNickname(userId, newNickname);
    }
    return null;
  }
}

export default UserService;
```

**After (TypeScript)**:
```typescript
import { UserModel } from '../db/models/index.js';
import { IUser } from '../types/models.js';

class UserService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async findUserById(userId: string): Promise<IUser> {
    return await this.userModel.findById(userId);
  }

  async updateUserNickname(
    userId: string,
    newNickname: string
  ): Promise<IUser | null> {
    const trimmed = newNickname.trim();

    // 검증
    if (trimmed !== newNickname) return null;
    if (trimmed.includes(' ')) return null;
    if (trimmed.length === 0 || trimmed.length > 8) return null;

    return await this.userModel.updateNickname(userId, trimmed);
  }
}

export default UserService;
```

---

## 5단계: 검증 및 테스트

### 5.1 컴파일 확인
```bash
npm run build
```

### 5.2 개발 서버 실행
```bash
npm run dev
```

### 5.3 타입 에러 수정
- 컴파일 에러가 나는 부분을 하나씩 수정
- `any` 타입은 최대한 피하고 구체적인 타입 지정

### 5.4 런타임 테스트
- 모든 API 엔드포인트 테스트
- Postman 또는 Thunder Client로 요청 전송

---

## 6단계: 코드 개선 (TS 마이그레이션 후)

### 6.1 즉시 적용할 개선 사항

#### 1) 에러 처리 표준화
```typescript
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
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
```

#### 2) 응답 형식 통일
```typescript
// src/utils/response.ts
import { ApiResponse } from '../types/common.js';

export const successResponse = <T>(data: T): ApiResponse<T> => ({
  error: null,
  data
});

export const errorResponse = (error: string): ApiResponse<null> => ({
  error,
  data: null
});
```

#### 3) 환경 변수 검증
```typescript
// src/config/validateEnv.ts
const requiredEnvVars = [
  'DB_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
] as const;

export const validateEnv = (): void => {
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

---

### 6.2 점진적 개선 사항

1. **의존성 주입 패턴 도입**
2. **N+1 쿼리 문제 해결**
3. **데이터베이스 인덱스 추가**
4. **입력 값 검증 (express-validator)**
5. **Rate Limiting**
6. **보안 헤더 (Helmet)**

---

## 7단계: 최종 점검

### 체크리스트

- [ ] 모든 `.js` 파일이 `.ts`로 변환됨
- [ ] `npm run build` 성공
- [ ] 타입 에러 0개
- [ ] 모든 API 엔드포인트 정상 동작
- [ ] 환경 변수 검증 적용
- [ ] 에러 핸들링 표준화
- [ ] `.gitignore`에 `dist/` 추가
- [ ] `package.json` 스크립트 업데이트

---

## 예상 소요 시간

| 단계 | 소요 시간 | 비고 |
|------|----------|------|
| 사전 준비 | 30분 | Critical 이슈 수정 |
| 환경 설정 | 1시간 | tsconfig, 패키지 설치 |
| 유틸/타입 정의 | 1-2일 | 기반 작업 |
| DB 스키마 | 2-3일 | Mongoose 타입 정의 |
| DB 모델 | 3-4일 | 타입 안전성 강화 |
| 서비스 레이어 | 4-6일 | 비즈니스 로직 타입화 |
| 미들웨어 | 1-2일 | Express 타입 확장 |
| 라우터 | 3-4일 | 요청/응답 타입 정의 |
| 진입점 | 1일 | app.ts 변환 |
| 검증 및 개선 | 2-3일 | 테스트 및 리팩토링 |
| **총계** | **약 3-4주** | 1인 기준 풀타임 |

---

## 참고 자료

- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Mongoose + TypeScript 가이드](https://mongoosejs.com/docs/typescript.html)
- [Express + TypeScript Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [tsconfig 옵션 설명](https://www.typescriptlang.org/tsconfig)

---

## 도움이 필요할 때

각 단계에서 막히는 부분이 있으면 언제든지 요청하세요:
- 특정 파일 마이그레이션 예시
- 타입 에러 해결 방법
- 아키텍처 개선 방안
- 테스트 코드 작성
