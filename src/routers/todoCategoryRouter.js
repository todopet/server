import { Router } from 'express';
import { TodoCategoryService } from '../services/index.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import requestValidator from '../middlewares/requestValidator.js';
import {
  todoIdParamValidator,
  createCategoryValidator,
  updateCategoryValidator
} from '../validators/todoValidator.js';

const todoCategoryRouter = Router();
const todoCategoryService = new TodoCategoryService();

// TODO 유저에 대한 카테고리 및 todo 전체 조회
todoCategoryRouter.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const category = await todoCategoryService.getCategories(userId);
    return category;
  })
);

// TODO 특정 카테고리 단건 조회
todoCategoryRouter.get(
  '/:id',
  todoIdParamValidator,
  requestValidator,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const category = await todoCategoryService.getCategory(id);
    return category;
  })
);

// TODO 카테고리 저장
todoCategoryRouter.post(
  '/',
  createCategoryValidator,
  requestValidator,
  asyncHandler(async (req, res, next) => {
    const userId = req.currentUserId;
    const { category } = req.body;
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
  updateCategoryValidator,
  requestValidator,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { category } = req.body;
    const result = await todoCategoryService.updateCategory(id, category);
    return result;
  })
);

// TODO 카테고리 목표 종료 처리
todoCategoryRouter.patch(
  '/endCategory/:id',
  todoIdParamValidator,
  requestValidator,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await todoCategoryService.updateEndCategory(id);
    return result;
  })
);

// TODO 카테고리 삭제
todoCategoryRouter.delete(
  '/:id',
  todoIdParamValidator,
  requestValidator,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await todoCategoryService.deleteCategory(id);
    return result;
  })
);

export default todoCategoryRouter;
