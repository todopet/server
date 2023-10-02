import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import { v1 } from './src/routers/index.js';
import authRouter from './src/routers/authRouter.js';
import userAuthorization from './src/middlewares/userAuthorization.js';
dotenv.config();

const app = express();
const config = {
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL
};

mongoose.connect(config.DB_URL, {
    dbName: 'Todo-Tamers'
});

mongoose.connection.on('connected', () =>
    console.log('정상적으로 MongoDB 서버에 연결되었습니다. ')
);

const corsOptions = {
    origin: 'https://todopet.vercel.app/',
    // origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true
};
//CORS 에러방지
// app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // 클라이언트 도메인
//     res.header(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept'
//     );
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH'); // 필요한 HTTP 메서드 추가
//     res.header('Access-Control-Allow-Credentials', 'true'); // credentials 허용
// });
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//정적 파일 제공
//app.use(express.static(path.join(__dirname, "public")));

// version 1의 api router 등록
app.use('/api/v1', authRouter);
app.use('/api/v1', userAuthorization, v1);

app.listen(config.PORT, function () {
    console.log(`서버가 ${config.PORT}에서 실행 중....`);
});

export default app;
