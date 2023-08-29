import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET || 'Tamers';

const sign = (_id) => {
    try {
        const payload = {
            userId: _id
        };
        const option = {
            algorithm: 'HS256'
            //expiresIn: "1h"
        };
        return jwt.sign(payload, secretKey, option);
    } catch (err) {
        throw new Error('토큰 발행에 실패했습니다');
    }
};

const verify = (userToken) => {
    try {
        const decoded = jwt.verify(userToken, secretKey);
        return { userId: decoded.userId };
    } catch (error) {
        throw new Error('잘못된 토큰입니다.'); // 토큰 검증에 실패한 경우 에러 처리
    }
};

export default { sign, verify };
