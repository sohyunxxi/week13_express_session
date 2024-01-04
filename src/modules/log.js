const createLogData = (req, result) => {
    return {
        ip: req.ip,
        userId: req.session.user ? req.session.user.id : null,
        apiName: req.originalUrl, 
        restMethod: req.method,
        inputData: req.body,  // 요청 본문을 입력 데이터로 가정
        outputData: result,
        time: new Date(),
    };
};


module.exports = createLogData;
