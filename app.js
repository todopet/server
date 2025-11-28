import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { v1 } from './src/routers/index.js';
import authRouter from './src/routers/authRouter.js';
import userAuthorization from './src/middlewares/userAuthorization.js';

dotenv.config();

const app = express();

const config = {
  PORT: process.env.PORT || 3001,
  DB_URL: process.env.DB_URL
};

// -------------------- MongoDB 연결 --------------------
mongoose.connect(config.DB_URL, {
  dbName: 'Todo-Tamers'
});

mongoose.connection.on('connected', () =>
  console.log('정상적으로 MongoDB 서버에 연결되었습니다.')
);

// -------------------- CORS 설정 --------------------
const allowedOrigins = [
  'http://localhost:3000', // 로컬 프론트
  'https://todopetclient.vercel.app' // 배포된 프론트
];

const corsOptions = {
  origin(origin, callback) {
    // Postman 같은 non-browser 요청(origin 없음)은 그냥 통과
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 허용되지 않은 origin
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // 쿠키 사용
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// -------------------- 라우터 등록 --------------------
app.use('/api/v1', authRouter);
app.use('/api/v1', userAuthorization, v1);

// -------------------- 서버 시작 --------------------
app.listen(config.PORT, function () {
  console.log(`서버가 ${config.PORT}에서 실행 중....`);
});

export default app;
