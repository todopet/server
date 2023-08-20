import jwt from "../utils/jwt.js";

const userAuthorization = async (req, res, next) => {
    const auth = req.headers.authorization;
    const userToken = auth?.split(" ")[1];

    if (!userToken || userToken === "null") {
        console.log("authorization 토큰이 없음");
        next();
        return;
    }

    try {
        const { userId } = jwt.verify(userToken);
        req.currentUserId = userId;
        next();
    } catch (err) {
        next(err);
    }
};

export default userAuthorization;
