import jwt from "../utils/jwt.js";

const userAuthorization = (req, res, next) => {
    // request 헤더로부터 { authorization: 'Bearer jwt-token' }을 받음
    const auth = req.headers.authorization;
    const userToken = auth?.split(" ")[1];

    // 토근이 없을 때에도 다음 미들웨어로 넘어가기
    if (!userToken || userToken === "null") {
        console.log("authorization 토큰이 없음");
        next();
        return;
    }

    try {
        const { userId } = jwt.verify(userToken);

        // 미들웨어 다음 순서로 실행될 콜백함수에서 사용할 userId
        req.currentUserId = userId;
        next();
    } catch (err) {
        next(err);
    }
};

export default userAuthorization;