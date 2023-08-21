import jwt from '../utils/jwt.js';

const userAuthorization = async (req, res, next) => {
    // const auth = req.headers.authorization;
    const Token = req.cookies.token;
    // const userToken = auth?.split(' ')[1];

    if (!Token || Token === 'null') {
        console.log('authorization 토큰이 없음');
        next();
        return;
    }

    try {
        const { userId } = jwt.verify(Token);
        req.currentUserId = userId;
        console.log(userId);
        next();
    } catch (err) {
        next(err);
    }
};

export default userAuthorization;
