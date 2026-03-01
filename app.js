import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { pathToFileURL } from 'url';
import { v1 } from './src/routers/index.js';
import authRouter from './src/routers/authRouter.js';
import userAuthorization from './src/middlewares/userAuthorization.js';
import { buildResponse } from './src/misc/utils.js';
import AppError from './src/misc/AppError.js';
import { validateEnv } from './src/config/validateEnv.js';

validateEnv();

const app = express();

const config = {
  PORT: process.env.PORT || 3001,
  DB_URL: process.env.DB_URL
};

let isShuttingDown = false;
const isServerlessRuntime = Boolean(process.env.VERCEL);
let dbConnectPromise = null;

mongoose.connection.on('connected', () => {
  console.log('정상적으로 MongoDB 서버에 연결되었습니다.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.error('[MongoDB] disconnected.');
  if (!isShuttingDown && !isServerlessRuntime) {
    process.exit(1);
  }
});

// -------------------- CORS 설정 --------------------
app.use(helmet());

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) || [
    'http://localhost:3000', // 로컬 프론트
    'https://todopetclient.vercel.app' // 배포된 프론트
  ]
);

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Vercel preview domain 허용 (todopetclient-* 포함)
  return /^https:\/\/todopetclient(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
};

const corsOptions = {
  origin(origin, callback) {
    // Postman 같은 non-browser 요청(origin 없음)은 그냥 통과
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    // 허용되지 않은 origin
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // 쿠키 사용
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Timestamp',
    'X-Nonce',
    'X-Signature'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// preflight(OPTIONS) 요청도 cors 적용
app.options('*', cors(corsOptions));

// -------------------- 공통 미들웨어 --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 정적 파일이 필요하면 주석 해제
// app.use(express.static(path.join(__dirname, "public")));

const getHealthPayload = () => {
  const dbStateLabel = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStateLabel[mongoose.connection.readyState] ?? 'unknown';

  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dbState
  };
};

app.get('/health', (req, res) => {
  return res.status(200).json(buildResponse(getHealthPayload()));
});

app.get('/api/v1/health', (req, res) => {
  return res.status(200).json(buildResponse(getHealthPayload()));
});

// -------------------- 라우터 등록 --------------------
app.use('/api/v1', authRouter);
app.use('/api/v1', userAuthorization, v1);

app.use((req, res, next) => {
  next(
    new AppError(
      'NotFoundError',
      404,
      `요청 경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`
    )
  );
});

app.use((err, req, res, next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError
    ? err.httpCode
    : Number.isInteger(err?.statusCode)
      ? err.statusCode
      : 500;

  const error = {
    name: isAppError ? err.name : err?.name ?? 'InternalServerError',
    message:
      statusCode >= 500
        ? '서버 내부 오류가 발생했습니다.'
        : err?.message ?? '요청 처리 중 오류가 발생했습니다.',
    statusCode
  };

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json(buildResponse(null, error));
});
const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnectPromise) {
    dbConnectPromise = mongoose
      .connect(config.DB_URL, {
        dbName: 'Todo-Tamers'
      })
      .catch((err) => {
        console.error('[MongoDB] initial connect failed:', err);
        if (!isServerlessRuntime) {
          process.exit(1);
        }
        throw err;
      })
      .finally(() => {
        dbConnectPromise = null;
      });
  }

  await dbConnectPromise;
};

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(config.PORT, () => {
    console.log(`서버가 ${config.PORT}에서 실행 중....`);
  });

  const gracefulShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`[Server] ${signal} received. shutting down...`);

    server.close(async () => {
      try {
        await mongoose.connection.close(false);
        process.exit(0);
      } catch (err) {
        console.error('[MongoDB] close failed:', err);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

const isDirectRun =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  startServer();
}

export { connectDatabase, startServer };
export default app;
