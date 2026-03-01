// @ts-nocheck
import rateLimit from 'express-rate-limit';
import { buildResponse } from '../misc/utils.ts';

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const tooManyRequestsError = (reason) => ({
  statusCode: 429,
  result: 'TooManyRequests',
  reason
});

const createRateLimiter = ({ windowMs, max, reason }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) =>
      res
        .status(options.statusCode)
        .json(buildResponse(null, tooManyRequestsError(reason)))
  });

const authRateLimiter = createRateLimiter({
  windowMs: toPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: toPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 60),
  reason: '인증 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
});

const signatureRateLimiter = createRateLimiter({
  windowMs: toPositiveInt(process.env.SIGNATURE_RATE_LIMIT_WINDOW_MS, 5 * 60 * 1000),
  max: toPositiveInt(process.env.SIGNATURE_RATE_LIMIT_MAX, 120),
  reason: '민감 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
});

export { authRateLimiter, signatureRateLimiter };
