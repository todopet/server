// @ts-nocheck
import jwt from '../utils/jwt.ts';
import { buildResponse } from '../misc/utils.ts';

const UNAUTHORIZED_ERROR = {
  statusCode: 401,
  result: 'Unauthorized',
  reason: '로그인한 유저만 사용할 수 있는 서비스입니다.'
};

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const userAuthorization = async (req, res, next) => {
  const headerToken = extractBearerToken(req.headers.authorization);
  const clientToken = req.cookies.token;

  if ((!headerToken || headerToken === 'null') && (!clientToken || clientToken === 'null')) {
    return res.status(401).json(buildResponse(null, UNAUTHORIZED_ERROR));
  }

  try {
    const { userId } = jwt.verify(headerToken ?? clientToken);

    req.currentUserId = userId;

    return next();
  } catch (err) {
    return res.status(401).json(buildResponse(null, UNAUTHORIZED_ERROR));
  }
};

export default userAuthorization;
