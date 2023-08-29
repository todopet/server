const signatureMiddleware = (req, res, next) => {
    const receivedTime = req.headers['x-custom-Time'];

    const checkReceivedTime = new Date(receivedTime); //프론트에서 헤더에 포함되어서 보냄
    const currentTime = new Date().getTime();

    const timeDifference = currentTime - checkReceivedTime;

    const maxTimeDifference = 60 * 1000; // 1분 (밀리초 단위)

    if (timeDifference <= maxTimeDifference) {
        next(); // 유효한 경우
    } else {
        res.status(403).json({ error: 'Invalid request' }); // 유효하지 않은 경우
    }
};

export default signatureMiddleware;
