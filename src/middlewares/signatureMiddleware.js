import { buildResponse } from '../misc/utils.js';

const signatureMiddleware = (req, res, next) => {
  const receivedTime = req.headers['x-custom-data'];
  const checkReceivedTime = (receivedTime - 1000) / 4;
  const maxTimeDifference = 60 * 1000; // 1분 (밀리초 단위)
  const currentTime = Date.now();
  const timeDifference = currentTime - checkReceivedTime;
  if (timeDifference <= maxTimeDifference) {
    next();
  } else {
    return res.json(
      buildResponse({
        status: 403,
        result: 'Forbidden',
        reason: '유효하지 않은 토큰입니다.'
      })
    );
  }
};

export default signatureMiddleware;
