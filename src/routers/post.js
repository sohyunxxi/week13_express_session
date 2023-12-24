const validator = require('../modules/postValidator');
const router = require("express").Router();
const connection = require('../config/mysql');
const loginCheck = require('../middleware/loginCheck');
const { Client } = require("pg")
const { titleValidator, contentValidator }  = require('../modules/postValidator');
// 게시물 불러오기
// 게시물 등록하기
// 게시물 수정하기
// 게시물 삭제하기

//------게시물 관련 API-------

//게시물 목록 불러오기
router.get("/", loginCheck, async (req, res, next) => {
    const response = {
        success: false,
        message: "",
        data: {
            posts: []  // posts 배열 초기화
        }
    };

    const client = new Client({
        user: "ubuntu",
        password: "1234",
        host: "localhost",
        database: "week6",
        port: "5432"
    });

    try {
        // 클라이언트 연결
        await client.connect();

        // 게시물 및 사용자 정보 조회 쿼리
        const selectSql = `
            SELECT post.*, account.id AS account_id
            FROM post
            INNER JOIN account ON post.account_idx = account.idx
            ORDER BY post.created_at DESC;
        `;

        // 쿼리 실행
        const { rows } = await client.query(selectSql);

        // 결과 처리
        for (let i = 0; i < rows.length; i++) {
            const post = {
                postIdx: rows[i].idx,
                postWriterIdx: rows[i].account_idx,
                postingWriterId: rows[i].account_id, // 수정: user_id -> account_id
                postingContent: rows[i].content,
                postingTitle: rows[i].title,
                postingDate: rows[i].created_at  // created_at으로 변경
            };

            // 배열에 게시물 추가
            response.data.posts.push(post);
        }

        // 성공 응답 설정
        response.success = true;
        response.message = "게시물 불러오기 성공";

        // 클라이언트에 응답 전송
        res.status(200).send(response);
    } catch (error) {
        console.error('게시물 불러오기 오류: ', error);
        response.message = "게시물 불러오기 실패";
        next(error);
    } finally {
        // 클라이언트 연결 해제
        if (client) await client.end();
    }
});



//게시물 불러오기
router.get("/:postIdx", loginCheck, async (req, res, next) => {
    const postIdx = req.params.postIdx;

    const result = {
        success: false,
        message: "",
        data: null
    };
    const client = new Client({
        user: "ubuntu",
        password: "1234",
        host: "localhost",
        database: "week6",
        port: "5432"
    });

    try {
        await client.connect();
        const selectSql = `
            SELECT post.*, account.id AS account_id
            FROM post
            INNER JOIN account ON post.account_idx = account.idx
            WHERE post.idx = $1;
        `;
        const values = [postIdx];
        const data = await client.query(selectSql, values);
        const row = data.rows;

        if (row.length > 0) {
            const post = {
                postIdx: row[0].idx,
                postWriterIdx: row[0].account_idx,
                postingWriterId: row[0].account_id,
                postingContent: row[0].content,
                postingTitle: row[0].title,
                postingDate: row[0].created_at
            };
            result.success = true;
            result.data = post;
        } else {
            result.success = false;
            result.message = "게시물 불러오기 실패";
            result.data = row;
        }
    } catch (error) {
        console.error('게시물 가져오기 오류 발생: ', error.message);
        result.message = error.message;
    } finally {
        if (client) await client.end(); // 필수
        // 이거 안하면 max 연결횟수 초과해서 db 연결이 안 될 수 있음. 무조건 해줘야 함.
        res.send(result);
    }
});



//게시물 쓰기
router.post("/", loginCheck, titleValidator, contentValidator, async (req, res, next) => {
    const userIdx = req.session.user.idx;
    const { content, title } = req.body;

    const result = {
        success: false,
        message: "",
        data: null
    };
    const client = new Client({
        user: "ubuntu",
        password: "1234",
        host: "localhost",
        database: "week6",
        port: "5432"
    });

    try {
        await client.connect();
        const insertSql = "INSERT INTO post (title, content, account_idx) VALUES ($1, $2, $3)";
        const values = [title, content, userIdx];
        const data = await client.query(insertSql, values);

        if (data.rowCount > 0) {
            result.success = true;
            result.data = data.rows;
        } else {
            result.success = false;
            result.message = "게시물 등록 오류";
        }
    } catch (e) {
        result.message = e.message;
    } finally {
        if (client) await client.end(); // 필수
        // 이거 안하면 max 연결횟수 초과해서 db 연결이 안 될 수 있음. 무조건 해줘야 함.
        res.send(result);
    }
});



//게시물 수정하기
router.put("/:postIdx", loginCheck, titleValidator, contentValidator, async (req, res, next) => {
    const postIdx = req.params.postIdx;
    const userIdx = req.session.user.idx;

    const { content, title } = req.body;

    const result = {
        success: false,
        message: "",
        data: null
    };
    const client = new Client({
        user: "ubuntu",
        password: "1234",
        host: "localhost",
        database: "week6",
        port: "5432"
    });

    try {
        await client.connect();
        const updateSql = "UPDATE post SET title = $1, content = $2 WHERE idx = $3 AND account_idx = $4";
        const values = [title, content, postIdx, userIdx];
        const data = await client.query(updateSql, values);
        const rowCount = data.rowCount; // 업데이트된 행의 수를 가져옴

        // DB 통신 결과 처리
        if (rowCount > 0) {
            result.success = true;
            result.message = "업데이트 성공";
        } else {
            result.success = false;
            result.message = "해당 게시물이나 권한이 없습니다.";
        }

    } catch (e) {
        result.message = e.message;
    } finally {
        if (client) await client.end(); // 필수
        // 이거 안하면 max 연결횟수 초과해서 db 연결이 안 될 수 있음. 무조건 해줘야 함.
        res.send(result);
    }
});



//게시물 삭제하기
router.delete("/:idx", loginCheck, async (req, res, next) => {
    const postIdx = req.params.idx;
    const userIdx = req.session.user.idx;

    const result = {
        "success": false,
        "message": ""
    };
    const client = new Client({
        user: "ubuntu",
        password: "1234",
        host: "localhost",
        database: "week6",
        port: "5432"
    });

    try {
        // 클라이언트 연결
        await client.connect();

        // 게시물 삭제 쿼리
        const deleteSql = "DELETE FROM post WHERE idx = $1 AND account_idx = $2";
        const values = [postIdx, userIdx];
        const data = await client.query(deleteSql, values);
        const rowCount = data.rowCount; // 삭제된 행의 수를 가져옴

        // DB 통신 결과 처리
        if (rowCount > 0) {
            result.success = true;
            result.message = "게시물 삭제 성공";
        } else {
            result.success = false;
            result.message = "게시물 삭제 실패. 해당 게시물이나 권한이 없습니다.";
        }

    } catch (e) {
        result.message = e.message;
    } finally {
        if (client) await client.end(); // 필수
        // 이거 안하면 max 연결횟수 초과해서 db 연결이 안 될 수 있음. 무조건 해줘야 함.
        res.send(result);
    }
});


// Error handling middleware
router.use((err, req, res, next) => {
    res.status(400).send({ success: false, message: err.message });
});

module.exports = router