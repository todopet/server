import { Router } from "express";
import { TodoCategoryService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const todoCategoryRouter = Router();
const todoCategoryService = new TodoCategoryService();

// TODO 유저에 대한 카테고리 전체 조회
// TODO 특정 카테고리 조회
todoCategoryRouter.get(
    "/:id?",
    asyncHandler(async (req, res, next) => {
        const userId = "64de2fbf9a951f54beeff3ff";
        // const { userId } = req.currentUserId;
        const { id } = req.params;
        const category = id
            ? await todoCategoryService.getCategory(id)
            : await todoCategoryService.getCategories(userId);
        res.json(buildResponse(category));
    })
);

// TODO 카테고리 저장
todoCategoryRouter.post(
    "/",
    asyncHandler(async (req, res, next) => {
        // const userId = "64de2fbf9a951f54beeff3ff";
        // const { userId } = req.currentUserId;
        const { userId, category } = req.body;
        const result = await todoCategoryService.addCategory({
            userId,
            category
        });
        res.json(buildResponse(result));
    })
);

// TODO 카테고리 수정
todoCategoryRouter.patch(
    "/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const { category } = req.body;
        const result = await todoCategoryService.updateCategory(id, category);
        res.json(buildResponse(result));
    })
);

// TODO 카테고리 삭제
todoCategoryRouter.delete(
    "/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await todoCategoryService.deleteCategory(id);
        res.json(buildResponse(result));
    })
);

export default todoCategoryRouter;
