const router = require("express").Router();
const mongoClient = require("../config/mongodb");
const loginCheck = require('../middleware/loginCheck');

//명령어
// 1. 오름차순 -> 내림차순 변경 asc desc
// 2. 특정 id (로그인 되어있어야 함), 특정 api로 검색하는 기능 (account api, ) apiName, id
// 3. 특정 일자 범위 내에 발생한 것들 검색하는 기능 startDate, endDate

// get -> admin일 때랑 일반일 때랑 -> isadmin 추가?

//정규식 추가 -> 
// 로그 불러오기
router.get("/", loginCheck, async (req, res, next) => {//관리자 미들웨어 추가
    // 이 부분에서 함수로 호출하도록 변경
    const isAdmin = req.session.user.isadmin;
    const { id, order, apiName, startDateTime, endDateTime } = req.query;
    const result = {
        data: null,
        message: "",
        status: 204
    };
    console.log("req: ", req);
    try {
        // 이 부분에서 함수를 호출하여 client를 얻도록 수정
        
        let num = -1; // 기본 내림차순으로 설정 (최신순)

        if (!isAdmin) {
            result.message = "관리자만 로그를 볼 수 있습니다.";
            return res.send(result);
        }

        const query = {};

        if (id) {
            query.id = id;
        }

        if (apiName) {
            query.apiName = apiName;
        }

        if (order === "asc") { // 오름차순 (오래된 순부터 요청하는 경우)
            num = 1;
        }

        // 날짜 및 시간 범위 검색
        if (startDateTime && endDateTime) {
            query.time = {
                $gte: new Date(startDateTime),
                $lte: new Date(endDateTime)
            };
        }
        const db = await mongoClient()
        const collection = db.collection("log")
        const queryResult = await collection.find(query).sort({ 'time': num }).toArray();
        result.data = queryResult;
        result.message = "관리자 - 로그 불러오기 성공";
        return res.send(result);

    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
