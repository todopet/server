import { validationResult } from 'express-validator';
import { buildResponse } from '../misc/utils.js';

const requestValidator = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json(
    buildResponse(null, {
      statusCode: 400,
      result: 'ValidationError',
      reason: '요청 입력값이 올바르지 않습니다.',
      details: errors.array().map(({ path, msg, value }) => ({
        field: path,
        message: msg,
        value
      }))
    })
  );
};

export default requestValidator;
