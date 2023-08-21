import { Router } from 'express';
import { TodoCategoryService } from '../services/index.js';
import asyncHandler from '../middlewares/asnycHandler.js';

const todoCategoryRouter = Router();
const todoCategoryService = new TodoCategoryService();

// TODO 유저에 대한 카테고리 및 todo 전체 조회
todoCategoryRouter.get(
    '/',
    asyncHandler(async (req, res, next) => {
        // 유저 검증 미들웨어 필요
        const userId = '64e2e0710677448a130fb24e';
        // const { userId } = req.currentUserId;
        const category = await todoCategoryService.getCategories(userId);
        return category;
    })
);

// TODO 특정 카테고리 단건 조회
todoCategoryRouter.get(
    '/:id',
    asyncHandler(async (req, res, next) => {
        // 유저 검증 미들웨어 필요
        // const userId = "64e2e0710677448a130fb24e";
        // const { userId } = req.currentUserId;
        const { id } = req.params;
        const category = await todoCategoryService.getCategory(id);
        return category;
    })
);

// TODO 카테고리 저장
todoCategoryRouter.post(
    '/',
    asyncHandler(async (req, res, next) => {
        // 유저 검증 미들웨어 필요
        // const userId = "64e2e0710677448a130fb24e";
        // const { userId } = req.currentUserId;
        const { userId, category } = req.body;
        const result = await todoCategoryService.addCategory({
            userId,
            category
        });
        return result;
    })
);

// TODO 카테고리 수정
todoCategoryRouter.patch(
    '/:id',
    asyncHandler(async (req, res, next) => {
        // 유저 검증 미들웨어 필요
        const { id } = req.params;
        const { category } = req.body;
        const result = await todoCategoryService.updateCategory(id, category);
        return result;
    })
);

// TODO 카테고리 삭제
todoCategoryRouter.delete(
    '/:id',
    asyncHandler(async (req, res, next) => {
        // 유저 검증 미들웨어 필요
        const { id } = req.params;
        const result = await todoCategoryService.deleteCategory(id);
        return result;
    })
);

export default todoCategoryRouter;
