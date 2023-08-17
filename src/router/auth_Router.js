import { Router } from "express";
import UserService from "../service/user_Service";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import axios from "axios";
//import jwt from "../utils/jwt.js";

dotenv.config();
const authRouter = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_LOGIN_REDIRECT_URI = "http://localhost:3000/login/redirect";
const GOOGLE_SIGNUP_REDIRECT_URI = "http://localhost:3000/signup/redirect";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const PORT = process.env.PORT;

//const authService = new AuthService();


authRouter.use(cookieParser());

authRouter.get("/", (req, res) => {
    res.send(`
  <h1>OAuth</h1>
  <a href="/login">Log in<a>
  <a href="/signup">Sign up</a>
  `);
});

//로그인
authRouter.get("/login", (req, res) => {
    res.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}&response_type=code&scope=email profile`
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

authRouter.get("/login/redirect", async (req, res) => {
    const { code } = req.query;
    console.log(`code: ${code}`);

    const resp = await axios.post(GOOGLE_TOKEN_URL, {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
        grant_type: "authorization_code"
    });
    const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${resp.data.access_token}`
        }
    });
    res.json(resp2.data);
});

//회원가입
authRouter.get("/signup", (req, res) => {
    res.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}&response_type=code&scope=email profile`
    );
});

//구글에 토큰 요청 및 회원 등록
authRouter.get("/signup/redirect", async (req, res) => {
    const { code } = req.query;
    console.log(`code: ${code}`);

    //access_token, refresh_token 등의 구글 토큰 정보 가져오기
    const resp = await axios.post(GOOGLE_TOKEN_URL, {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI,
        grant_type: "authorization_code"
    });
    const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${resp.data.access_token}`
        }
    });

    const userService = new UserService();
    const newUser = await userService.addUser(resp2.data);
    res.json(newUser);
});

export default authRouter;
