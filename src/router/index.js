import { Router } from "express";

import authRouter from "./auth_Router.js";
import todoRouter from "./todo_Router.js";

// 버전1 라우터
const v1Router = Router();

v1Router.use("/", authRouter);
v1Router.use("/todos", todoRouter);

export const v1 = v1Router;
