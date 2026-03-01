// @ts-nocheck
import { query } from 'express-validator';

const oauthRedirectCodeValidator = [
  query('code')
    .exists({ checkFalsy: true })
    .withMessage('code 쿼리 파라미터는 필수입니다.')
    .bail()
    .isString()
    .withMessage('code는 문자열이어야 합니다.')
];

export { oauthRedirectCodeValidator };
