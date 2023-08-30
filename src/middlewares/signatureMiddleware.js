const signatureMiddleware = (req, res, next) => {
    const receivedTime = req.headers['x-custom-Data'];
    const checkReceivedTime = (receivedTime - 1000) / 4;
    const maxTimeDifference = 60 * 1000; // 1분 (밀리초 단위)
    const currentTime = Date.now();

    const timeDifference = currentTime - checkReceivedTime;

    if (timeDifference <= maxTimeDifference) {
        next(); // 유효한 경우
    } else {
        res.status(403).json({
            result: 'Forbidden',
            reason: '유효하지 않은 토큰입니다.'
        }); // 유효하지 않은 경우
    }
};

export default signatureMiddleware;
