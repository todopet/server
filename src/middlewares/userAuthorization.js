import jwt from '../utils/jwt.js';

const userAuthorization = async (req, res, next) => {
    // const auth = req.headers.authorization;
    // const Token = req.cookies.token;
    const Token = req.headers.token;
    // const userToken = auth?.split(' ')[1];

    if (!Token || Token === 'null') {
        console.log('authorization 토큰이 없음');
        next();
        return;
    }

    try {
        const { userId } = jwt.verify(Token);
        console.log(userId);
        req.currentUserId = userId;
        console.log(req.currentUserId);
        next();
    } catch (err) {
        next(err);
    }
};

export default userAuthorization;
