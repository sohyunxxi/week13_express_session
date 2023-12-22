const validator = require('../modules/postValidator');
const router = require("express").Router()
const mysql = require('mysql');
const path = require("path")

const connection = require('../config/mysql');
const loginCheck = require('../middleware/loginCheck');

// 게시물 불러오기
// 게시물 등록하기
// 게시물 수정하기
// 게시물 삭제하기

//------게시물 관련 API-------

//게시물 목록 불러오기
router.get("/",loginCheck, (req, res, next) => {
    const result = {
        "success": false,
        "message": "",
        "data": {
            "posts": [],  // posts 배열 초기화
        }
    };
    
    try {

        const selectSql = "SELECT * FROM post ORDER BY created_at DESC;";
        connection.query(selectSql, (err, rows) => {
            if (err) {
                console.error('게시물 불러오기 오류: ', err);
                return next({
                    message : "게시물 불러오기 실패",
                    status : 500
                });

            }
            const selectUserSql = "SELECT id FROM user WHERE idx = ?;";
            connection.query(selectUserSql, rows[0].user_idx, (err, userIdResult) => {
                if (err) {
                    console.error('id 가져오기 실패 : ', err);
                    return next({
                        message : "id 불러오기 실패",
                        status : 500
                    });           
                }

                if (userIdResult.length === 0) {
                    return next({
                        message : "사용자가 존재하지 않음",
                        status : 500
                    });
                }

            // 배열에 각 게시물 정보 추가 => 더 나은 방식으로 바꾸기
            for (let i = 0; i < rows.length; i++) {
                const post = {
                    postIdx: rows[i].idx,
                    postWriterIdx: rows[i].user_idx,
                    postingWriterId: userIdResult[0].id,
                    postingContent: rows[i].content,
                    postingTitle: rows[i].title,
                    postingDate: rows[i].created_at  // created_at으로 변경
                };

                // 배열에 게시물 추가
                result.data.posts.push(post);
            }

            result.success = true;
            result.message = "게시물 불러오기 성공";

            return res.status(200).send(result);
        });
    });

    } catch (error) {
        console.error('전체 게시물 불러오기 오류: ', error);
        return next(error);
    }
});


//게시물 불러오기
router.get("/:postIdx",loginCheck, (req, res, next) => {
    const postIdx = req.params.postIdx;

    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {

        const selectSql = "SELECT * FROM post WHERE idx = ?;";
        connection.query(selectSql, postIdx, (err, rows) => {
            if (err) {
                console.error('게시물 불러오기 오류: ', err);
                return next({
                    message : "게시물 불러오기 실패",
                    status : 500
                })

            }

            if (rows.length === 0) {
                return next({
                    message : "게시물이 존재하지 않음",
                    status : 500
                })
            }

            const selectUserSql = "SELECT id FROM user WHERE idx = ?;";
            connection.query(selectUserSql, rows[0].user_idx, (err, userIdResult) => {
                if (err) {
                    console.error('id 가져오기 실패 : ', err);
                    return next({
                        status : 500,
                        message : "아이디 가져오기 실패"
                    })
                }

                if (userIdResult.length === 0) {
                    return next({
                        message : "사용자가 존재하지 않음",
                        status : 500
                    })
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
        console.error('게시물 가져오기 오류 발생: ', error.message);
        return next(error);
    }
});



//게시물 쓰기
router.post("/", loginCheck,(req,res, next) => {
    
    const { content, title } = req.body

    const result = {
        "success" : false, 
        "message" : "", 
        "data" : null 
    }

    try{

        if (!validator.contentValidator(content)) {
            return next({
                message : "내용을 입력해주세요",
                status : 400
            })
        }
    
        if (!validator.titleValidator(title)){
            return next({
                message : "제목을 입력해주세요",
                status : 400
            })
        } 
 
        const insertSql = "INSERT INTO post (title, content, user_idx) VALUES (?, ?, ?)";
        
        connection.query(insertSql, [title, content, req.session.user.idx], (err) => {
            if (err) {
                console.error('게시물 등록 오류: ', err);
                return next({
                    message : "게시물 등록 오류",
                    status : 500
                });
            }

            result.success = true;
            result.message = '게시물 등록 성공';
            result.data = {title, content };
            res.status(200).send(result);

        });

    } catch (error){
        result.message = "게시물 작성 오류 발생"
        return next(error);    
    }
})

//게시물 수정하기
router.put("/:postIdx", loginCheck,(req, res, next) => {
    const postIdx = req.params.postIdx;
    const userIdx = req.session.user.idx;

    const { content, title } = req.body;

    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {

        if (!validator.contentValidator(content)) {
            return next({
                message : '내용을 입력해주세요',
                status : 400
            })
        }
    
        if (!validator.titleValidator(title)) {
            return next({
                message : '제목을 입력해주세요',
                status : 400
            })
        }

        const selectUserSql = "SELECT user_idx FROM post WHERE idx = ?";
        connection.query(selectUserSql, postIdx, (err, userIdxResult) => {
            if (err) {
                console.error('user_idx 가져오기 실패 : ', err);
                return next({
                    message : 'user_idx 가져오기 실패',
                    status : 500
                })
            }

            // 여기에서 사용자 idx 비교
            if (userIdx !== userIdxResult[0].user_idx) {
                result.message = "해당 게시물 작성자만 게시물을 수정할 수 있습니다.";
                return next({
                    message : '해당 작성자가 아님',
                    status : 403
                })
            }

            const updateSql = "UPDATE post SET title = ?, content = ? WHERE idx = ?";
            connection.query(updateSql, [title, content, postIdx], (err) => {
                if (err) {
                    console.error('게시물 수정 오류: ', err);
                    return next({
                        message : '게시물 수정 실패',
                        status : 500
                    })
                }

                result.success = true;
                result.message = '게시물 수정 성공';
                result.data = { title, content };
                res.status(200).send(result);
            });
        });

    } catch (error) {
        console.error('게시물 수정 오류 발생: ', error);
        return next(error);    
    }
});


//게시물 삭제하기
router.delete("/:idx", loginCheck,(req, res, next) => {
    const postIdx = req.params.idx;
    const userIdx = req.session.user.idx;

    const result = {
        "success": false,
        "message": ""
    };

    try {

        const selectUserSql = "SELECT user_idx FROM post WHERE idx = ?";
        connection.query(selectUserSql, postIdx, (err, userIdxResult) => {
            if (err) {
                console.error('user_idx 가져오기 실패 : ', err);
                return next({
                    message : "user_idx 가져오기 실패",
                    status : 500
                })
            }

            // 여기에서 사용자 idx 비교
            if (userIdx !== userIdxResult[0].user_idx) {
                return next({
                    message : "일치하지 않는 작성자",
                    status : 403
                })
            }

            const deleteSql = "DELETE FROM post WHERE idx = ?";
            connection.query(deleteSql, postIdx, (err) => {
                if (err) {
                    console.error('게시물 삭제 오류: ', err);
                    return next({
                        message : "게시물 삭제 오류",
                        status : 500
                    })
                }

                result.success = true;
                result.message = '게시물 삭제 성공';
                res.status(200).send(result);
            });
        });
    } catch (error) {
        console.error('게시물 삭제 오류 발생: ', error);
        return next(error);    
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    res.status(400).send({ success: false, message: err.message });
});

module.exports = router