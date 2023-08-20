import { Router } from "express";

import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import todoCategoryRouter from "./todoCategoryRouter.js";
import todoContentRouter from "./todoContentRouter.js";
import inventoryRouter from "./inventoryRouter.js";
import itemRouter from "./itemRouter.js";
import myPetRouter from "./myPetRouter.js";
import petRouter from "./petRouter.js";

// 버전1 라우터
const v1Router = Router();

v1Router.use("/", authRouter);
v1Router.use("/user", userRouter);
v1Router.use("/todoCategory", todoCategoryRouter);
v1Router.use("/todoContent", todoContentRouter);
v1Router.use("/inventory", inventoryRouter);
v1Router.use("/item", itemRouter);
v1Router.use("/myPet", myPetRouter);
v1Router.use("/pet", petRouter);

export const v1 = v1Router;
