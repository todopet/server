import { Router } from 'express';
import { UserService } from '../services/index.js';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import asyncHandler from '../middlewares/asyncHandler.js';
import userAuthorization from '../middlewares/userAuthorization.js';
import jwt from '../utils/jwt.js';
import mongoose from 'mongoose';
import { buildResponse } from '../misc/utils.js';
import AppError from '../misc/AppError.js';

dotenv.config();
const authRouter = Router();

const mode = process.env.MODE;
const config = {
  ROOT: process.env.ROOT ?? 'http://localhost:3000',
  PORT: process.env.PORT,
  GOOGLE_CLIENT_ID: !!mode
    ? process.env.GOOGLE_CLIENT_ID
    : process.env.LOCAL_GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: !!mode
    ? process.env.GOOGLE_CLIENT_SECRET
    : process.env.LOCAL_GOOGLE_CLIENT_SECRET,
  GOOGLE_LOGIN_REDIRECT_URI: !!mode
    ? process.env.GOOGLE_LOGIN_REDIRECT_URI
    : process.env.LOCAL_GOOGLE_LOGIN_REDIRECT_URI,
  GOOGLE_SIGNUP_REDIRECT_URI: !!mode
    ? process.env.GOOGLE_SIGNUP_REDIRECT_URI
    : process.env.LOCAL_GOOGLE_SIGNUP_REDIRECT_URI,
  GOOGLE_TOKEN_URL: process.env.GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL: process.env.GOOGLE_USERINFO_URL
};

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const GOOGLE_LOGIN_REDIRECT_URI = 'http://localhost:3001/api/v1/login/redirect';
// const GOOGLE_SIGNUP_REDIRECT_URI =
//     'http://localhost:3001/api/v1/signup/redirect';
// const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
// const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
// const PORT = process.env.PORT;

//const userService = new UserService();

authRouter.use(cookieParser());

//로그인
authRouter.get('/login', (req, res) => {
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${config.GOOGLE_LOGIN_REDIRECT_URI}&response_type=code&scope=email profile`
  );
  // let url = "https://accounts.google.com/o/oauth2/v2/auth";
  // //client_id는 env에 저장
  // url += `?client_id=${GOOGLE_CLIENT_ID}`;
  // url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`;
  // //필수옵션
  // url += `&response_type=code`;
  // //구글에 등록된 유저 정보 email, profile을 가져오겠다 명시
  // url += `&scope=email profile`;
  // //완성된 url로 이동
  // //이 url이 위에서 본 구글 계정을 선택하는 화면임.
  // res.redirect(url);
});

authRouter.get('/login/redirect', async (req, res, next) => {
  try {
    const { code } = req.query;
    console.log('[LOGIN REDIRECT] code =', code);
    console.log('[LOGIN REDIRECT] config =', {
      ROOT: config.ROOT,
      GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
      GOOGLE_LOGIN_REDIRECT_URI: config.GOOGLE_LOGIN_REDIRECT_URI
    });

    // Google token endpoint requires x-www-form-urlencoded
    const tokenParams = new URLSearchParams({
      code,
      client_id: String(config.GOOGLE_CLIENT_ID),
      client_secret: String(config.GOOGLE_CLIENT_SECRET),
      redirect_uri: String(config.GOOGLE_LOGIN_REDIRECT_URI),
      grant_type: 'authorization_code'
    });

    const resp = await axios.post(
      String(config.GOOGLE_TOKEN_URL),
      tokenParams,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const resp2 = await axios.get(String(config.GOOGLE_USERINFO_URL), {
      headers: {
        Authorization: `Bearer ${resp.data.access_token}`
      }
    });

    const userService = new UserService();
    let user = await userService.findByGoogleId(resp2.data.id);

    if (user) {
      // 탈퇴/정지 처리
      if (user.membershipStatus === 'withdrawn') {
        const reason = encodeURIComponent('탈퇴한 회원입니다.');
        return res.redirect(
          `${config.ROOT}/#status=401&result=UnAuthorized&reason=${reason}`
        );
      }

      if (user.membershipStatus !== 'active') {
        const reason = encodeURIComponent('정지된 회원입니다.');
        return res.redirect(
          `${config.ROOT}/#status=401&result=UnAuthorized&reason=${reason}`
        );
      }
    } else {
      user = await userService.addUser(resp2.data);
    }

    const token = jwt.sign(user._id);
    // prod 에서는 secure / sameSite 설정도 같이 넣는 게 좋습니다.
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // https 환경
      sameSite: 'none' // client.vercel.app -> server.vercel.app 크로스 사이트
    });

    console.log('[LOGIN REDIRECT] redirect to', `${config.ROOT}/todo`);
    res.redirect(`${config.ROOT}/todo`);
  } catch (error) {
    console.error('[LOGIN REDIRECT ERROR]', error);
    return next(error);
  }
});

//회원가입
authRouter.get('/signup', (req, res) => {
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${config.GOOGLE_SIGNUP_REDIRECT_URI}&response_type=code&scope=email profile`
  );
});

//구글에 토큰 요청 및 회원 등록
authRouter.get('/signup/redirect', async (req, res, next) => {
  try {
    const { code } = req.query;

    const tokenParams = new URLSearchParams({
      code,
      client_id: String(config.GOOGLE_CLIENT_ID),
      client_secret: String(config.GOOGLE_CLIENT_SECRET),
      redirect_uri: String(config.GOOGLE_SIGNUP_REDIRECT_URI),
      grant_type: 'authorization_code'
    });
    const resp = await axios.post(
      String(config.GOOGLE_TOKEN_URL),
      tokenParams,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    const resp2 = await axios.get(String(config.GOOGLE_USERINFO_URL), {
      headers: {
        Authorization: `Bearer ${resp.data.access_token}`
      }
    });

    const userService = new UserService();
    const user = await userService.addUser(resp2.data); // 회원 정보 추가 및 가져오기
    const token = jwt.sign(user._id.toString()); // 토큰 발급

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.redirect('/api/v1'); // 루트 페이지로 리다이렉트
  } catch (error) {
    console.error('[SIGNUP REDIRECT ERROR]', error);
    return next(error);
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('token'); // 토큰 쿠키 삭제
  res.status(200).json({ status: 200, message: '로그아웃 처리 완료' });
  // res.redirect('/api/v1'); // 로그아웃 후 루트 페이지로 리다이렉트
});

//회원탈퇴
authRouter.post(
  '/withdraw',
  userAuthorization,
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError('ValidationError', 400, '유효하지 않은 사용자입니다.');
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const todoCategories = await mongoose.connection
          .collection('todoCategories')
          .find({ userId: objectUserId }, { projection: { _id: 1 }, session })
          .toArray();

        const categoryIds = todoCategories.map((category) => category._id);

        if (categoryIds.length > 0) {
          await mongoose.connection.collection('todoContents').deleteMany(
            { categoryId: { $in: categoryIds } },
            { session }
          );
        }

        await Promise.all([
          mongoose.connection
            .collection('histories')
            .deleteMany({ userId: objectUserId }, { session }),
          mongoose.connection
            .collection('inventories')
            .deleteMany({ userId: objectUserId }, { session }),
          mongoose.connection
            .collection('myPets')
            .deleteMany({ userId: objectUserId }, { session }),
          mongoose.connection
            .collection('todoCategories')
            .deleteMany({ userId: objectUserId }, { session })
        ]);

        const withdrawResult = await mongoose.connection
          .collection('users')
          .updateOne(
            { _id: objectUserId },
            { $set: { membershipStatus: 'withdrawn' } },
            { session }
          );

        if (withdrawResult.matchedCount === 0) {
          throw new AppError(
            'NotFoundError',
            404,
            '회원 정보를 찾을 수 없습니다.'
          );
        }
      });

      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      });

      return res.status(200).json(buildResponse({ message: '탈퇴 처리 완료' }));
    } catch (error) {
      return next(error);
    } finally {
      await session.endSession();
    }
  })
);

export default authRouter;
