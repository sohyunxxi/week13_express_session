const router = require("express").Router();
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

//명령어
// 1. 오름차순 -> 내림차순 변경 asc desc
// 2. 특정 id 특정 api로 검색하는 기능 (account api, ) apiName, id
// 3. 특정 일자 범위 내에 발생한 것들 검색하는 기능 startDate, endDate


// MongoDB 연결 설정
const uri = 'mongodb://localhost:27017/logs';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// get -> admin일 때랑 일반일 때랑 -> isadmin 추가?
// post -> 삽입은?

// 로그 불러오기
router.get("/", async (req, res, next) => {
    const { isAdmin, order } = req.body;
    const result = {
        data: null,
        message: "",
    };

    try {
        let num = -1; // 기본 내림차순으로 설정 (최신순)

        if (!isAdmin) {
            result.message = "관리자만 로그를 볼 수 있습니다.";
            return res.status(200).send(result);
        }

        if (order === "asc") { // 오름차순 (오래된 순부터 요청하는 경우)
            num = 1;
        }

        const queryResult = await mongoClient.find().sort({ time: num }).toArray(); // 내림차순 -1 
        result.data = queryResult;
        result.message = "관리자 - 로그 불러오기 성공";;
        return res.status(200).send(result);

    } catch (err) {
        next(err);
    }
});


module.exports = router;