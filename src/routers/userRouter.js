import { Router } from 'express';
import { HistoryService, UserService } from '../services/index.js';
import { buildResponse } from '../misc/utils.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import userAuthorization from '../middlewares/userAuthorization.js';

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

// 유저 정보만 단건 조회
userRouter.get(
  '/user',
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const user = await userService.findUserById(userId);
    return user;
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

// 회원 닉네임 변경
userRouter.patch(
  '/myInfo',
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const { nickname } = req.body;
    const result = await userService.updateUserNickname(userId, nickname);
    return result;
  })
);

// 회원 상태 변경
userRouter.patch(
  '/myStatus',
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const { membershipStatus } = req.body;
    const result = await userService.updateUserMembershipStatus(
      userId,
      membershipStatus
    );
    return result;
  })
);

//회원 검증
userRouter.get(
  '/auth',
  userAuthorization,
  asyncHandler((req, res) => {
    return {
      status: 200,
      result: 'Success',
      message: '토큰 검증 완료'
    };
  })
);
export default userRouter;
