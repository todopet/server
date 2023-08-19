import { Router } from "express";
import { TodoContentService } from "../services/index.js";
import { buildResponse } from "../misc/utils.js";
import asyncHandler from "../middlewares/asnycHandler.js";

const todoContentRouter = Router();
const todoContentService = new TodoContentService();

// ----------------------------- 계획 ----------------------
// TODO 계획(todo) 조회
todoContentRouter.get(
    "/contents/:id",
    asyncHandler(async (req, res, next) => {
        const id = req.params.id;
        const category = id
            ? await todoContentService.getContent(id)
            : await todoContentService.getContents();
        res.json(buildResponse(category));
    })
);

// TODO 계획(todo) 저장
todoContentRouter.post(
    "/:categoryId",
    asyncHandler(async (req, res, next) => {
        const userId = "64de2fbf9a951f54beeff3ff";
        // const { userId } = req.currentUserId;

        const { categoryId } = req.params;
        const { todo } = req.body;
        const result = await todoContentService.addContent({
            userId,
            categoryId,
            todo
        });
        res.json(buildResponse(result));
    })
);

// TODO 계획(todo) 수정 - 계획 처리
todoContentRouter.patch(
    "/:categoryId",
    asyncHandler(async (req, res, next) => {
        const userId = "64de2fbf9a951f54beeff3ff";
        // const { userId } = req.currentUserId;

        const { categoryId } = req.params;
        const { contentId, todo, status } = req.body;
        // content, status...
        // 처리하면 상태 변화 해줘야 함 그리고 보상 줘야함
        // 처리한걸 취소하고 다시 체크하면 보상 주면 안됨
        const response = await todoContentService.updateContent({
            userId,
            categoryId,
            contentId,
            todo,
            status
        });
        const result = response.todos.find(
            (item) => item._id.toString() === contentId
        );
        res.json(buildResponse(result));
    })
);

// TODO 계획(todo) 삭제
todoContentRouter.delete(
    "/:categoryId",
    asyncHandler(async (req, res, next) => {
        const { categoryId } = req.params;
        const { contentId } = req.body;
        console.log("router");
        const result = await todoContentService.deleteContent(
            categoryId,
            contentId
        );
        console.log(result);
        res.json(buildResponse(result));
    })
);

export default todoContentRouter;
