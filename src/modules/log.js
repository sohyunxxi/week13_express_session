const createLogData = (req, result) => {
    return {
        ip: req.ip,
        userId: req.session.user ? req.session.user.id : null,
        apiName: req.originalUrl, 
        restMethod: req.method,
        inputData: req.body,
        outputData: result,
        time: new Date(),
    };
};


module.exports = createLogData;
