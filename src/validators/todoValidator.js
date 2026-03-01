import { body, param, query } from 'express-validator';

const todoIdParamValidator = [
  param('id')
    .exists({ checkFalsy: true })
    .withMessage('id 파라미터는 필수입니다.')
    .bail()
    .isMongoId()
    .withMessage('id는 올바른 ObjectId 형식이어야 합니다.')
];

const todoDateRangeValidator = [
  query('start')
    .optional()
    .isISO8601()
    .withMessage('start는 ISO8601 날짜 형식이어야 합니다.'),
  query('end')
    .optional()
    .isISO8601()
    .withMessage('end는 ISO8601 날짜 형식이어야 합니다.')
];

const createTodoValidator = [
  body('categoryId')
    .exists({ checkFalsy: true })
    .withMessage('categoryId는 필수입니다.')
    .bail()
    .isMongoId()
    .withMessage('categoryId는 올바른 ObjectId 형식이어야 합니다.'),
  body('todo')
    .exists({ checkFalsy: true })
    .withMessage('todo는 필수입니다.')
    .bail()
    .isString()
    .withMessage('todo는 문자열이어야 합니다.')
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('todo는 1자 이상 100자 이하여야 합니다.'),
  body('date')
    .exists({ checkFalsy: true })
    .withMessage('date는 필수입니다.')
    .bail()
    .isISO8601()
    .withMessage('date는 ISO8601 날짜 형식이어야 합니다.')
];

const updateTodoValidator = [
  ...todoIdParamValidator,
  body('todo')
    .optional()
    .isString()
    .withMessage('todo는 문자열이어야 합니다.')
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('todo는 1자 이상 100자 이하여야 합니다.'),
  body('status')
    .optional()
    .isIn(['unchecked', 'reverted', 'completed'])
    .withMessage('status는 unchecked, reverted, completed 중 하나여야 합니다.'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('date는 ISO8601 날짜 형식이어야 합니다.'),
  body()
    .custom((value) => {
      if (!value || typeof value !== 'object') return false;
      return (
        Object.prototype.hasOwnProperty.call(value, 'todo') ||
        Object.prototype.hasOwnProperty.call(value, 'status') ||
        Object.prototype.hasOwnProperty.call(value, 'date')
      );
    })
    .withMessage('todo, status, date 중 하나 이상은 포함되어야 합니다.')
];

const createCategoryValidator = [
  body('category')
    .exists({ checkFalsy: true })
    .withMessage('category는 필수입니다.')
    .bail()
    .isString()
    .withMessage('category는 문자열이어야 합니다.')
    .bail()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('category는 1자 이상 50자 이하여야 합니다.')
];

const updateCategoryValidator = [
  ...todoIdParamValidator,
  ...createCategoryValidator
];

export {
  todoIdParamValidator,
  todoDateRangeValidator,
  createTodoValidator,
  updateTodoValidator,
  createCategoryValidator,
  updateCategoryValidator
};
