//const validator = require('validator');
const router = require("express").Router()
const mysql = require('mysql');
const path = require("path")

const connection = mysql.createConnection({
    host: 'localhost', 
    port: 3306,
    user: 'Sohyunxxi', 
    password: '1234',
    database:"week6"
  });
// 게시물 불러오기
// 게시물 등록하기
// 게시물 수정하기
// 게시물 삭제하기

//------게시물 관련 API-------

//게시물 목록 불러오기
router.get("/", (req, res) => {
    const result = {
        "success": false,
        "message": "",
        "data": {
            "posts": [],  // posts 배열 초기화
        }
    };
    
    try {
        if (!req.session.user) {
            result.message = "로그인 상태가 아닙니다.";
            return res.status(401).send(result);
        }

        const selectSql = "SELECT * FROM post ORDER BY created_at DESC;";
        connection.query(selectSql, (err, rows) => {
            if (err) {
                console.error('게시물 불러오기 오류: ', err);
                result.message = '게시물 불러오기 실패';
                return res.status(500).send(result);
            }

            // 배열에 각 게시물 정보 추가
            for (let i = 0; i < rows.length; i++) {
                const post = {
                    postIdx: rows[i].idx,
                    postWriterIdx: rows[i].user_idx,
                    postingWriterId: rows[i].title,
                    postingContent: rows[i].content,
                    postingTitle: rows[i].created_at,
                    postingDate: rows[i].updated_at  // created_at으로 변경
                };

                // 배열에 게시물 추가
                result.data.posts.push(post);
            }

            result.success = true;
            result.message = "게시물 불러오기 성공";

            return res.status(200).send(result);
        });

    } catch (error) {
        console.error('전체 게시물 불러오기 오류: ', error);
        result.success = false;
        result.message = "전체 게시물 불러오기 오류 발생";
        res.status(500).send(result);
    }
});

//게시물 불러오기
router.get("/:postIdx", (req, res) => {
    const postIdx = req.params.postIdx;

    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!req.session.user) {
            result.message = "로그인 상태가 아님";
            return res.status(401).send(result);
        }

        const selectSql = "SELECT * FROM post WHERE idx = ?;";
        connection.query(selectSql, postIdx, (err, rows) => {
            if (err) {
                console.error('게시물 불러오기 오류: ', err);
                result.message = '게시물 불러오기 실패';
                return res.status(500).send(result);
            }

            if (rows.length === 0) {
                result.message = '게시물이 존재하지 않음';
                return res.status(404).send(result);
            }

            const selectUserSql = "SELECT id FROM user WHERE idx = ?;";
            connection.query(selectUserSql, rows[0].user_idx, (err, userIdResult) => {
                if (err) {
                    console.error('id 가져오기 실패 : ', err);
                    result.message = 'id 가져오기 실패';
                    return res.status(500).send(result);
                }

                if (userIdResult.length === 0) {
                    result.message = '사용자가 존재하지 않음';
                    return res.status(404).send(result);
                }

                // 한 번에 초기화
                result.data = {
                    postIdx: rows[0].idx,
                    postWriterIdx: rows[0].user_idx,
                    postingWriterId: userIdResult[0].id,
                    postingTitle: rows[0].title,
                    postingContent: rows[0].content,
                    postingCreated: rows[0].created_at,
                    postingUpdated: rows[0].updated_at
                };

                result.success = true;
                result.message = "게시물 불러오기 성공";
                res.status(200).send(result);
            });
        });

    } catch (error) {
        console.error('게시물 가져오기 오류 발생: ', error);
        result.success = false;
        result.message = "게시물 가져오기 오류 발생";
        res.status(500).send(result);
    }
});



//게시물 쓰기
router.post("/", (req,res) => {
    
    const { content, title } = req.body

    const result = {
        "success" : false, 
        "message" : "", 
        "data" : null 
    }

    try{
        if(!req.session.user){
            result.message = "로그인 상태가 아님"
            return res.status(401).send(result)
        }
        if(!content.trim()){ //내용 비어있는 경우
            result.message = "내용을 입력해주세요"
            return res.status(400).send(result)
        }
        
        if(!title.trim()){
            result.message = "제목을 입력해주세요."
            return res.status(400).send(result)
        }
        const insertSql = "INSERT INTO post (title, content, user_idx) VALUES (?, ?, ?)";
        connection.query(insertSql, [title, content, req.session.user.idx], (err) => {
            if (err) {
                console.error('게시물 등록 오류: ', err);
                result.message = '게시물 등록 실패';
                return res.status(500).send(result);
            }

            result.success = true;
            result.message = '게시물 등록 성공';
            result.data = {title, content };
            res.status(200).send(result);

        });

    } catch (error){
        result.success = false
        result.message = "게시물 작성 오류 발생"
        res.status(500).send(result)
    }
})

//게시물 수정하기
router.put("/:postIdx", (req, res) => {
    const postIdx = req.params.postIdx;
    const userIdx = req.session.user.idx;

    const { content, title } = req.body;

    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!req.session.user) {
            result.message = "로그인 상태가 아님";
            return res.status(401).send(result)
        }
        if (!title.trim()) {
            result.message = "제목을 입력해주세요.";
            return res.status(400).send(result);
        }

        if (!content.trim()) {
            result.message = "내용을 입력해주세요.";
            return res.status(400).send(result);
        }

        const selectUserSql = "SELECT user_idx FROM post WHERE idx = ?";
        connection.query(selectUserSql, postIdx, (err, userIdxResult) => {
            if (err) {
                console.error('user_idx 가져오기 실패 : ', err);
                result.message = 'user_idx 가져오기 실패';
                return res.status(500).send(result);
            }

            // 여기에서 사용자 idx 비교
            if (userIdx !== userIdxResult[0].user_idx) {
                result.message = "해당 게시물 작성자만 게시물을 수정할 수 있습니다.";
                return res.status(403).send(result);
            }

            const updateSql = "UPDATE post SET title = ?, content = ? WHERE idx = ?";
            connection.query(updateSql, [title, content, postIdx], (err) => {
                if (err) {
                    console.error('게시물 수정 오류: ', err);
                    result.message = '게시물 수정 실패';
                    return res.status(500).send(result);
                }

                result.success = true;
                result.message = '게시물 수정 성공';
                result.data = { title, content };
                res.status(200).send(result);
            });
        });

    } catch (error) {
        console.error('게시물 수정 오류 발생: ', error);
        result.message = "게시물 수정 오류 발생";
        res.status(500).send(result);
    }
});


//게시물 삭제하기
router.delete("/:idx", (req, res) => {
    const postIdx = req.params.idx;
    const userIdx = req.session.user.idx;

    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!req.session.user) {
            result.message = "로그인 상태가 아님";
            return res.status(401).send(result)
        }

        const selectUserSql = "SELECT user_idx FROM post WHERE idx = ?";
        connection.query(selectUserSql, postIdx, (err, userIdxResult) => {
            if (err) {
                console.error('user_idx 가져오기 실패 : ', err);
                result.message = 'user_idx 가져오기 실패';
                return res.status(500).send(result);
            }

            // 여기에서 사용자 idx 비교
            if (userIdx !== userIdxResult[0].user_idx) {
                result.message = "해당 게시물 작성자만 게시물을 삭제할 수 있습니다.";
                return res.status(403).send(result);
            }

            const deleteSql = "DELETE FROM post WHERE idx = ?";
            connection.query(deleteSql, postIdx, (err) => {
                if (err) {
                    console.error('게시물 삭제 오류: ', err);
                    result.message = '게시물 삭제 실패';
                    return res.status(500).send(result);
                }

                result.success = true;
                result.message = '게시물 삭제 성공';
                res.status(200).send(result);
            });
        });
    } catch (error) {
        console.error('게시물 삭제 오류 발생: ', error);
        result.message = "게시물 삭제 오류 발생";
        res.status(500).send(result);
    }
});

module.exports = router