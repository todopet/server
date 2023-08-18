import { Router } from "express";
import { TodoService } from "../service/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";
// TODO: 나중에 추가 해야됨!

const todoRouter = Router();
const todoService = new TodoService();

// TODO 유저에 대한 카테고리 전체 조회
// TODO 특정 카테고리 조회
todoRouter.get(
    "/categories/:userId",
    asyncHandler(async (req, res, next) => {
        const { userId } = req.params;
        const { categoryId } = req.query;
        const category = categoryId
            ? await todoService.getCategory(categoryId)
            : await todoService.getCategories(userId);
        res.json(buildResponse(category));
    })
);

// TODO 카테고리 저장
todoRouter.post(
    "/categories",
    asyncHandler(async (req, res, next) => {
        // userId 추가 필요. 어떻게?
        const { category } = req.body;
        const userId = "64de2c8e7df86d5fccd36ddd";
        const result = await todoService.addCategory({
            userId,
            category
        });
        res.json(buildResponse(result));
    })
);

// TODO 카테고리 수정
todoRouter.patch(
    "/categories/:categoryId",
    asyncHandler(async (req, res, next) => {
        const { categoryId } = req.params;
        const { category } = req.body;
        const result = await todoService.updateCategory(categoryId, category);
        res.json(buildResponse(result));
    })
);

// TODO 카테고리 삭제
todoRouter.delete(
    "/categories/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await todoService.deleteCategory(id);
        res.json(buildResponse(result));
    })
);

// ----------------------------- 계획 ----------------------
// TODO 계획(todo) 조회
todoRouter.get(
    "/contents/:id",
    asyncHandler(async (req, res, next) => {
        const id = req.params.id;
        const category = id
            ? await TodoService.getContent(id)
            : await TodoService.getContents();
        res.json(buildResponse(category));
    })
);

// TODO 계획(todo) 저장
todoRouter.post(
    "/contents",
    asyncHandler(async (req, res, next) => {
        const { content } = req.body;
        const result = await TodoService.addContent({
            content
        });
        res.json(buildResponse(result));
    })
);

// TODO 계획(todo) 수정 - 계획 처리
todoRouter.patch(
    "/contents/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        // content, status...
        // 처리하면 상태 변화 해줘야 함 그리고 보상 줘야함
        // 처리한걸 취소하고 다시 체크하면 보상 주면 안됨
        const result = await TodoService.updateContent(id, content);
        res.json(buildResponse(result));
    })
);

// TODO 계획(todo) 삭제
todoRouter.delete(
    "/contents/:id",
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await TodoService.deleteContent(id);
        res.json(buildResponse(result));
    })
);

export default todoRouter;
