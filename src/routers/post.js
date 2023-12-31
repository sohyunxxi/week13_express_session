const router = require("express").Router();
const loginCheck = require('../middleware/loginCheck');
const queryConnect = require('../modules/queryConnect');
const { titleValidator, 
        contentValidator }  = require('../middleware/postValidator');

// 게시물 목록 불러오기 API
router.get("/", loginCheck, async (req, res, next) => {
    const result = {
        success: false,
        message: "",
        data: {
            posts: []  // posts 배열 초기화
        }
    };

    try {
        const query = {
            text: `SELECT post.*, account.id AS account_id
                    FROM post
                    INNER JOIN account ON post.account_idx = account.idx
                    ORDER BY post.created_at DESC`,
        };
        const { rows } = await queryConnect(query);

        result.data.posts = rows.map(row => ({
            postIdx: row.idx,
            postWriterIdx: row.account_idx,
            postingWriterId: row.account_id,
            postingContent: row.content,
            postingTitle: row.title,
            postingDate: row.created_at,
        }));
        result.success = true;
        result.message = "게시물 불러오기 성공";        
        res.send(result);
    } catch (error) {
        console.error('게시물 불러오기 오류: ', error);
        result.message = "게시물 불러오기 실패";
        return next(error);
    }
});

// 게시물 불러오기 API
router.get("/:postIdx", loginCheck, async (req, res, next) => {
    const postIdx = req.params.postIdx;

    const result = {
        success: false,
        message: "",
        data: null // editable 추가하기 -> 세션으로 비교해서 넣기? 
        
    };
    try {
        const query = {
            text: `SELECT post.*, account.id AS account_id
                    FROM post
                    JOIN account ON post.account_idx = account.idx
                    WHERE post.idx = $1;`,
            values: [postIdx],
        };
        const { rows } = await queryConnect(query);
        if (rows.length > 0) {
            const post = {
                postIdx: rows[0].idx,
                postWriterIdx: rows[0].account_idx,
                postingWriterId: rows[0].account_id,
                postingContent: rows[0].content,
                postingTitle: rows[0].title,
                postingDate: rows[0].created_at
            };
            result.success = true;
            result.data = post;
        } else {
            result.success = false;
            result.message = "게시물 불러오기 실패";
            result.data = rows;
        }
        res.send(result);
    } catch (error) {
        console.error('게시물 가져오기 오류 발생: ', error.message);
        result.message = error.message;
        return next(error);
    }
});

// 게시물 쓰기 API
router.post("/", loginCheck, titleValidator, contentValidator, async (req, res, next) => {
    const userIdx = req.session.user.idx;
    const { content, title } = req.body;

    const result = {
        success: false,
        message: "",
        data: null
    };
    try {
        const query = {
            text: 'INSERT INTO post (title, content, account_idx) VALUES ($1, $2, $3)',
            values: [title, content, userIdx],
        };

        const { rowCount } = await queryConnect(query);
        if (rowCount > 0) {
            result.success = true;
            result.data = rowCount;
        } else {
            result.success = false;
            result.message = "게시물 등록 오류";
        }
        res.send(result);
    } catch (e) {
        result.message = e.message;
        return next(e);
    }
});

// 게시물 수정하기 API
router.put("/:postIdx", loginCheck, titleValidator, contentValidator, async (req, res, next) => {
    const postIdx = req.params.postIdx;
    const userIdx = req.session.user.idx;

    const { content, title } = req.body;

    const result = {
        success: false,
        message: "",
        data: null
    };
    try {
        const query = {
            text: 'UPDATE post SET title = $1, content = $2 WHERE idx = $3 AND account_idx = $4',
            values: [title, content, postIdx, userIdx],
        };

        const { rowCount } = await queryConnect(query);

        if (rowCount > 0) {
            result.success = true;
            result.message = "업데이트 성공";
        } else {
            result.success = false;
            result.message = "해당 게시물이나 권한이 없습니다.";
        }
        res.send(result);
    } catch (e) {
        result.message = e.message;
        return next(e);
    }
});

// 게시물 삭제하기 API
router.delete("/:idx", loginCheck, async (req, res, next) => {
    const postIdx = req.params.idx;
    const userIdx = req.session.user.idx;

    const result = {
        "success": false,
        "message": ""
    };
    try {
        const query = {
            text: 'DELETE FROM post WHERE idx = $1 AND account_idx = $2',
            values: [postIdx, userIdx],
        };

        const { rowCount } = await queryConnect(query);
        if (rowCount > 0) {
            result.success = true;
            result.message = "게시물 삭제 성공";
        } else {
            result.success = false;
            result.message = "게시물 삭제 실패. 해당 게시물이나 권한이 없습니다.";
        }
        res.send(result);
    } catch (e) {
        result.message = e.message;        
        return next(e);
    }
});

module.exports = router