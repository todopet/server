import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import authRouter from "./src/router/auth_Router.js";
import cookieParser from "cookie-parser";
import axios from "axios";
import { v1 } from "./src/router/index.js";

const app = express();
const { PORT, DB_URL } = process.env;
const __dirname = path.resolve();

mongoose.connect(DB_URL, {
    dbName: "Todo-Tamers"
});

mongoose.connection.on("connected", () =>
    console.log("정상적으로 MongoDB 서버에 연결되었습니다. " + DB_URL)
);

//CORS 에러방지
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//정적 파일 제공
//app.use(express.static(path.join(__dirname, "public")));

// version 1의 api router 등록
app.use("/api/v1", v1);
app.use("/", authRouter);

app.listen(PORT, function () {
    console.log(`서버가 ${PORT}에서 실행 중....`);
});

export default app;
