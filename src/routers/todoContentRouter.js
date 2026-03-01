import { Router } from 'express';
import { TodoContentService } from '../services/index.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import signatureMiddleware from '../middlewares/signatureMiddleware.js';
import requestValidator from '../middlewares/requestValidator.js';
import {
  todoDateRangeValidator,
  todoIdParamValidator,
  createTodoValidator,
  updateTodoValidator
} from '../validators/todoValidator.js';
const todoContentRouter = Router();
const todoContentService = new TodoContentService();

// 계획(todo) 목록 전체 조회
// TODO: 날짜별로 조회하기. 날짜 데이터 파라미터로 전달받아야 함
todoContentRouter.get(
  '/',
  todoDateRangeValidator,
  requestValidator,
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const start = req.query.start;
    const end = req.query.end;
    const contents = await todoContentService.getMultipleContents(
      userId,
      start,
      end
    );
    return contents;
  })
);

// 계획(todo) 단건 조회
todoContentRouter.get(
  '/:id',
  todoIdParamValidator,
  requestValidator,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const contents = await todoContentService.getSingleContents(id);
    return contents;
  })
);

// 계획(todo) 저장
todoContentRouter.post(
  '/',
  createTodoValidator,
  requestValidator,
  signatureMiddleware,
  asyncHandler(async (req, res, next) => {
    const { categoryId, todo, date } = req.body;
    const result = await todoContentService.addContent({
      categoryId,
      todo,
      date
    });
    return result;
  })
);

// 계획(todo) 수정 - 계획 처리 및 보상 지급, 히스토리 등록
todoContentRouter.patch(
  '/:id',
  updateTodoValidator,
  requestValidator,
  signatureMiddleware,
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const { id } = req.params;
    const { todo, status, date } = req.body;
    console.log(todo, status, date);
    const response = await todoContentService.updateContent({
      id,
      userId,
      todo,
      status,
      date
    });

    return response;
  })
);

// TODO 계획(todo) 삭제
todoContentRouter.delete(
  '/:id',
  todoIdParamValidator,
  requestValidator,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await todoContentService.deleteContent(id);
    return result;
  })
);

export default todoContentRouter;
