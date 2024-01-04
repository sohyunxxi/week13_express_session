const client = require("../config/mongodb")

const createLogData = require("../modules/log");

const makeLog = async (req, res, result, next) => {
    const logEntry = createLogData(req, result);
    try {
        const db = await client()
        const logHistory = db.collection("log");
        await logHistory.insertOne(logEntry);
        console.log("MongoDB insertion complete");
    } catch (error) {
        console.error(error);
    } 
};

module.exports = makeLog;
