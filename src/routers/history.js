const router = require("express").Router();
const mongoClient = require("../config/mongodb");
const isAdmin = require("../middleware/isAdmin");
const loginCheck = require('../middleware/loginCheck');
const dateReq = /^(\d{4})(-\d{2})?(-\d{2})?(T\d{2}(:\d{2}(:\d{2}(\.\d{3})?)?)?(Z)?)?$/;

// 로그 불러오기
router.get("/", loginCheck, isAdmin, async (req, res, next) => {//관리자 미들웨어 추가
    const {id, order, apiName,startDateTime, endDateTime} = req.body;
    const result = {
        data: null,
        message: "",
        status: 204
    };
    try {
        
        let num = -1; 

        const query = {};

        if (id) {
            query.userId = id;
        }

        if (apiName) {
            query.apiName = apiName;
        }

        if (order === "asc") { // 오름차순 (오래된 순부터 요청하는 경우)
            num = 1;
        }

        if (startDateTime && dateReq.test(startDateTime) && endDateTime && dateReq.test(endDateTime)) {
            query.time = {
                $gte: new Date(startDateTime),
                $lte: new Date(endDateTime)
            };
        }
        const db = await mongoClient()
        const collection = db.collection("log")
        const queryResult = await collection.find(query).sort({ time : num }).toArray();

        result.data = queryResult;
        result.message = "관리자 - 로그 불러오기 성공";
        return res.send(result);

    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
