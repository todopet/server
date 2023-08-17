import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();

const secretKey = process.env.GOOGLE_CLIENT_SECRET || 'secret-Key';

const sign = (user) => {
  try {
    const payload = {
      userId: user.userEmail
    };
    const option = {
      algorithm : "HS256",
    };
    return jwt.sign(payload, secretKey, option);
  } catch (err) {
    res.status(400).json({
      result: 'fail-tokenSign',
      reason: '토큰 발행에 실패했습니다',
    });
  }
};

const verify = (userToken, res) => {
  return jwt.verify(userToken, secretKey, (error, decoded) => {
    if(error) {
      res.status(401).json({
        result: 'fail-invalidToken',
        reason: '잘못된 토큰입니다.',
      });
    }
    return {userId: decoded.userId};
  });
};

export default { sign, verify };