import { Router } from "express";
import { TodoCategoryService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const todoCategoryRouter = Router();
const todoCategoryService = new TodoCategoryService();

// TODO 유저에 대한 카테고리 전체 조회
// TODO 특정 카테고리 조회
todoCategoryRouter.get(
    "/categories/:userId",
    asyncHandler(async (req, res, next) => {
        const { userId } = req.params;
        const { categoryId } = req.query;
        const category = categoryId
            ? await todoCategoryService.getCategory(categoryId)
            : await todoCategoryService.getCategories(userId);
        res.json(buildResponse(category));
    })
);

// TODO 카테고리 저장
todoCategoryRouter.post(
    "/categories",
    asyncHandler(async (req, res, next) => {
        // userId 추가 필요. 어떻게?
        const { category } = req.body;
        const userId = "64de2c8e7df86d5fccd36ddd";
        const result = await todoCategoryService.addCategory({
            userId,
            category
        });
        res.json(buildResponse(result));
    })
);

// TODO 카테고리 수정
todoCategoryRouter.patch(
    "/categories/:categoryId",
    asyncHandler(async (req, res, next) => {
        const { categoryId } = req.params;
        const { category } = req.body;
        const result = await todoCategoryService.updateCategory(
            categoryId,
            category
        );
        res.json(buildResponse(result));
    })
);

// TODO 카테고리 삭제
todoCategoryRouter.delete(
    "/categories/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await todoCategoryService.deleteCategory(id);
        res.json(buildResponse(result));
    })
);

export default todoCategoryRouter;
