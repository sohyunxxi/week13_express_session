// log.js
const createLogData = (req, result) => {
    return {
        ip: req.ip,
        userId: req.id,
        apiName: req.apiName,
        restMethod: req.restMethod,
        inputData: req.result,
        outputData: result,
        time: new Date(),
    };
};

module.exports = createLogData;
