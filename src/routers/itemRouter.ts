// @ts-nocheck
import { Router } from 'express';
import { ItemService } from '../services/index.ts';
import { buildResponse } from '../misc/utils.ts';
import asyncHandler from '../middlewares/asyncHandler.ts';

const itemRouter = Router();
const itemService = new ItemService();

// item 조회
itemRouter.get(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await itemService.getItem(id);
        return result;
    })
);

// item 저장
itemRouter.post(
    '/',
    asyncHandler(async (req, res, next) => {
        const {
            name,
            description,
            image,
            status,
            effect,
            experience,
            probability
        } = req.body;
        const result = await itemService.addItem({
            name,
            description,
            image,
            status,
            effect,
            experience,
            probability
        });
        return result;
    })
);

// item 수정
itemRouter.patch(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const {
            name,
            description,
            image,
            status,
            effect,
            experience,
            probability
        } = req.body;
        const result = await itemService.updateItem(id, {
            name,
            description,
            image,
            status,
            effect,
            experience,
            probability
        });
        return result;
    })
);

// item 삭제
itemRouter.delete(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await itemService.deleteItem(id);
        return result;
    })
);

export default itemRouter;
