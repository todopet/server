import { Router } from 'express';
import { RewardService } from '../services/index.js';
import { buildResponse } from '../misc/utils.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const rewardRouter = Router();
const rewardService = new RewardService();

rewardRouter.post(
    '/:userId',
    asyncHandler(async (req, res) => {
        const { userId } = req.params; // URL 파라미터에서 사용자 ID 받음
        const reward = await rewardService.giveReward(userId); // 보상 지급

        if (reward) {
            res.json({ message: 'Reward received', reward });
        } else {
            res.json({ message: 'No reward available' });
        }
    })
);

export default rewardRouter;
