const mongoClient = require("../config/mongodb");
const createLogData = require("../modules/log");

const makeLog = async (req, res, result, next) => {
    const logEntry = createLogData(req, result);

    try {
        const client = await mongoClient();
        const logHistory = client.collection("logs");
        await logHistory.insertOne(logEntry);
    } catch (error) {
        console.error(error);
    }
};

module.exports = makeLog;
