import jwt from '../utils/jwt.js';
import { buildResponse } from '../misc/utils.js';

const userAuthorization = async (req, res, next) => {
  // const auth = req.headers.authorization;
  // const Token = req.cookies.token;
  const serverToken = req.headers.token;
  const clientToken = req.cookies.token;
  // const userToken = auth?.split(' ')[1];
  console.log(req);
  console.log(req.headers);
  if (
    (!serverToken || serverToken === 'null') &&
    (!clientToken || clientToken === 'null')
  ) {
    return res.json(
      buildResponse({
        status: 401,
        result: 'Unauthorized',
        reason: '로그인한 유저만 사용할 수 있는 서비스입니다.'
      })
    );
  }

  try {
    const { userId } = jwt.verify(serverToken ?? clientToken);
    // ----
    // return res.json(
    //   buildResponse({
    //     status: 401,
    //     result: 'Unauthorized',
    //     reason: '로그인한 유저만 사용할 수 있는 서비스입니다.',
    //     serverToken123: serverToken,
    //     userIdInfo: userId,
    //   })
    // );
    // ----
    req.currentUserId = userId;

    next();
  } catch (err) {
    return res.json(
      buildResponse({
        status: 401,
        result: 'Unauthorized',
        reason: '로그인한 유저만 사용할 수 있는 서비스입니다.',
        serverToken1: serverToken,
        clientToken1: clientToken,
      })
    );
  }
};

export default userAuthorization;
