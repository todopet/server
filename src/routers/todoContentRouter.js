import { Router } from 'express';
import { TodoContentService } from '../services/index.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const todoContentRouter = Router();
const todoContentService = new TodoContentService();

// 계획(todo) 목록 전체 조회
// TODO: 날짜별로 조회하기. 날짜 데이터 파라미터로 전달받아야 함
todoContentRouter.get(
    '/',
    asyncHandler(async (req, res, next) => {
        const userId = req.currentUserId;
        // const { start, end } = req.body;
        const contents = await todoContentService.getMultipleContents(userId);
        return contents;
    })
);

// 계획(todo) 단건 조회
todoContentRouter.get(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const contents = await todoContentService.getSingleContents(id);
        return contents;
    })
);

// 계획(todo) 저장
todoContentRouter.post(
    '/',
    asyncHandler(async (req, res, next) => {
        const { categoryId, todo } = req.body;
        const result = await todoContentService.addContent({
            categoryId,
            todo
        });
        return result;
    })
);

// 계획(todo) 수정 - 계획 처리
// 여기서 보상 지급, 히스토리 넣기.
todoContentRouter.patch(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const userId = req.currentUserId;
        const { id } = req.params;
        const { todo, status } = req.body;
        // 처리하면 상태 변화 해줘야 함 그리고 보상 줘야함
        // 처리한걸 취소하고 다시 체크하면 보상 주면 안됨
        const response = await todoContentService.updateContent({
            id,
            userId,
            todo,
            status
        });

        return response;
    })
);

// TODO 계획(todo) 삭제
todoContentRouter.delete(
    '/:id',
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const result = await todoContentService.deleteContent(id);
        return result;
    })
);

export default todoContentRouter;
