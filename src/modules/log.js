//따로 만들어두기
const log = {
    ip: req.ip,
    userId: req.id,
    apiName: req.apiName,
    restMethod: req.restMethod,
    inputData: req.result,
    outputData: result,
    time: new date
  }

  module.exports = log;
