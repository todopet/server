import { Router } from "express";
import { UserService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const userRouter = Router();
const userService = new UserService();

export default userRouter;
