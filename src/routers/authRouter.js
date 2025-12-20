import { Router } from 'express';
import {
  UserService,
  InventoryService,
  MyPetService,
  HistoryService,
  TodoCategoryService,
  TodoContentService
} from '../services/index.js';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import axios from 'axios';
import asyncHandler from '../middlewares/asyncHandler.js';
import userAuthorization from '../middlewares/userAuthorization.js';
import jwt from '../utils/jwt.js';
import mongoose from 'mongoose';
import { buildResponse } from '../misc/utils.js';

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
  asyncHandler(async (req, res) => {
    const userId = req.currentUserId;

    const inventoryService = new InventoryService();
    const myPetService = new MyPetService();
    const userService = new UserService();
    const historyService = new HistoryService();
    const todoCategoryService = new TodoCategoryService();
    const todoContentService = new TodoContentService();

    try {
      // 사용자의 인벤토리, 펫보관함, 히스토리 삭제 및 탈퇴처리
      await historyService.deleteAllHistoryByUserId(userId);
      await inventoryService.deleteInventoryByUserId(userId);
      await myPetService.deletePetStorageByUserId(userId);
      await todoContentService.deleteAllTodoContentsByUserId(userId);
      await todoCategoryService.deleteAllTodoCategoiesByUserId(userId);

      // WithdrawUserAndToken 메서드를 호출하여 새로운 토큰 얻기
      const newToken = await userService.WithdrawUserAndToken(userId);

      // 기존 토큰 삭제 및 새로운 토큰 저장
      res.clearCookie('token');
      res.cookie('token', newToken);

      res.status(200).json({ message: '탈퇴 처리 완료' });
    } catch (error) {
      res.status(500).json({ error: '사용자 탈퇴 실패' });
    }
  })
);

export default authRouter;
