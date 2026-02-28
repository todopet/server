import { buildResponse } from '../misc/utils.js';
import crypto from 'crypto';

const SIGNATURE_SECRET = process.env.SIGNATURE_SECRET;
const SIGNATURE_WINDOW_MS = Number(process.env.SIGNATURE_WINDOW_MS ?? 5 * 60 * 1000);
const usedNonces = new Map();

const FORBIDDEN_ERROR = {
  statusCode: 403,
  result: 'Forbidden',
  reason: '유효하지 않은 요청 서명입니다.'
};

const stableStringify = (value) => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const sortedKeys = Object.keys(value).sort();
  const entries = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`
  );
  return `{${entries.join(',')}}`;
};

const createPayload = (timestamp, nonce, body) => {
  const bodyText = stableStringify(body ?? {});
  return `${timestamp}.${nonce}.${bodyText}`;
};

const createSignature = (payload) => {
  return crypto
    .createHmac('sha256', SIGNATURE_SECRET)
    .update(payload)
    .digest('hex');
};

const isValidSignature = (receivedSignature, expectedSignature) => {
  if (!receivedSignature || !expectedSignature) return false;
  const receivedBuffer = Buffer.from(receivedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
};

const cleanupExpiredNonces = (now) => {
  for (const [nonce, expiresAt] of usedNonces.entries()) {
    if (expiresAt <= now) {
      usedNonces.delete(nonce);
    }
  }
};

const signatureMiddleware = (req, res, next) => {
  if (!SIGNATURE_SECRET) {
    console.error('[Signature] SIGNATURE_SECRET is not configured.');
    return res.status(500).json(
      buildResponse(null, {
        statusCode: 500,
        result: 'InternalServerError',
        reason: '서명 검증 설정이 누락되었습니다.'
      })
    );
  }

  const timestampHeader = req.headers['x-timestamp'];
  const nonce = req.headers['x-nonce'];
  const receivedSignature = req.headers['x-signature'];

  const timestamp = Number(timestampHeader);
  const now = Date.now();

  if (!Number.isFinite(timestamp) || !nonce || !receivedSignature) {
    return res.status(403).json(buildResponse(null, FORBIDDEN_ERROR));
  }

  if (Math.abs(now - timestamp) > SIGNATURE_WINDOW_MS) {
    return res.status(403).json(buildResponse(null, FORBIDDEN_ERROR));
  }

  cleanupExpiredNonces(now);
  if (usedNonces.has(nonce)) {
    return res.status(403).json(buildResponse(null, FORBIDDEN_ERROR));
  }

  const payload = createPayload(timestamp, nonce, req.body);
  const expectedSignature = createSignature(payload);

  if (!isValidSignature(receivedSignature, expectedSignature)) {
    return res.status(403).json(buildResponse(null, FORBIDDEN_ERROR));
  }

  usedNonces.set(nonce, now + SIGNATURE_WINDOW_MS);
  return next();
};

export default signatureMiddleware;
