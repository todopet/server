import { body, param } from 'express-validator';

const rankCountValidator = [
  param('count')
    .exists({ checkFalsy: true })
    .withMessage('count 파라미터는 필수입니다.')
    .bail()
    .isInt({ min: 1, max: 100 })
    .withMessage('count는 1 이상 100 이하의 정수여야 합니다.')
];

const nicknameValidator = [
  body('nickname')
    .exists({ checkFalsy: true })
    .withMessage('nickname은 필수입니다.')
    .bail()
    .isString()
    .withMessage('nickname은 문자열이어야 합니다.')
    .bail()
    .trim()
    .isLength({ min: 1, max: 8 })
    .withMessage('nickname은 1자 이상 8자 이하여야 합니다.')
    .bail()
    .matches(/^\S+$/)
    .withMessage('nickname에는 공백을 포함할 수 없습니다.')
];

const membershipStatusValidator = [
  body('membershipStatus')
    .exists({ checkFalsy: true })
    .withMessage('membershipStatus는 필수입니다.')
    .bail()
    .isIn(['active', 'withdrawn', 'suspended'])
    .withMessage(
      'membershipStatus는 active, withdrawn, suspended 중 하나여야 합니다.'
    )
];

export { rankCountValidator, nicknameValidator, membershipStatusValidator };
