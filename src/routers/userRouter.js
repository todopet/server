import { Router } from 'express';
import { HistoryService, UserService } from '../services/index.js';
import { buildResponse } from '../misc/utils.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const userRouter = Router();
const userService = new UserService();
const historyService = new HistoryService();

// 랭킹 순위 전달 받기.
userRouter.get(
    '/rank',
    asyncHandler(async (req, res, next) => {
        const ranking = await historyService.getRanking();
        return ranking;
    })
);

// 마이페이지 정보 전달 받기
userRouter.get(
    '/',
    asyncHandler(async (req, res, next) => {
        const userId = req.currentUserId;
        const user = await userService.getUserInfo(userId);
        return user;
    })
);

export default userRouter;
