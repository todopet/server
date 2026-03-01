import { Router } from 'express';
import { BadgeService } from '../services/index.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const badgeRouter = Router();
const badgeService = new BadgeService();

// badge 전체 조회
badgeRouter.get(
    '/',
    asyncHandler(async (req, res, next) => {
        const result = await badgeService.getAllBadges();
        return result;
    })
);

// badge 저장
badgeRouter.post(
    '/',
    asyncHandler(async (req, res, next) => {
        const {
            category,
            condition,
            title,
            description,
            url
        } = req.body;
        const result = await badgeService.addBadge({
            category,
            condition,
            title,
            description,
            url
        });
        return result;
    })
);

// badge 수정
badgeRouter.patch(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const {
            category,
            condition,
            title,
            description,
            url
        } = req.body;
        const result = await badgeService.updateBadge(id, {
            category,
            condition,
            title,
            description,
            url
        });
        return result;
    })
);

// badge 삭제
badgeRouter.delete(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await badgeService.deleteBadge(id);
        return result;
    })
);

export default badgeRouter;
