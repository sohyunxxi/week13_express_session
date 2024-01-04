const createLogData = (req, result) => {
    return {
        ip: req.ip,
        userId: req.body.id,  // 사용자 ID가 요청 본문에 있다고 가정
        apiName: req.route.path,  // API 엔드포인트 경로를 apiName으로 가정
        restMethod: req.method,
        inputData: req.body,  // 요청 본문을 입력 데이터로 가정
        outputData: result,
        time: new Date(),
    };
};


module.exports = createLogData;
