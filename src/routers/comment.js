const validator = require('../modules/commentValidator');
const router = require("express").Router()
const mysql = require('mysql');
const path = require("path")

const connection = require('../config/mysql');
const loginCheck = require('../middleware/loginCheck');

// 댓글 불러오기
// 댓글 등록하기
// 댓글 수정하기
// 댓글 삭제하기

//------댓글 관련 API-------

//댓글 불러오기 API
router.get("/:postIdx",loginCheck,(req,res,next)=>{
    const postIdx = req.params.postIdx;
    const result = {
        "success" : false, 
        "message" : "",
        "data" :{
            "comments":[],
        }
    }
    try{
        const selectCommentSql = "SELECT * FROM comment WHERE post_idx = ? ORDER BY created_at DESC";
        connection.query(selectCommentSql, postIdx, (err, rows) => {
            if (err) {
                console.error('comment 가져오기 실패 : ', err);
                return next({
                    message : "comment 가져오기 실패",
                    status : 500
                })

            }
        
            // 배열에 각 댓글 정보 추가
            for (let i = 0; i < rows.length; i++) {
                const selectUserSql = "SELECT id FROM user WHERE idx = ? ";
                connection.query(selectUserSql, rows[i].user_idx, (err, selectUserResult) => {
                    if (err) {
                        console.error('해당 사용자 불러오기 실패 : ', err);
                        return next({
                            message : "사용자 불러오기 실패",
                            status : 500
                        })
                    }
                    if (selectUserResult.length == 0) {
                        return next({
                            message : "사용자가 존재하지 않음",
                            status : 404
                        })
                    }
        
                    const comment = { //변경하기
                        commentIdx: rows[i].idx,
                        commentWriterIdx: rows[i].user_idx,
                        commentWriterId: selectUserResult[0].id, // 배열에서 요소를 가져와야 함
                        commentPostIdx: rows[i].post_idx,
                        commentTitle: rows[i].title,
                        commentContent: rows[i].content,
                        commentCreated: rows[i].created_at,
                        commentUpdated: rows[i].updated_at
                    };
        
                    // 배열에 댓글 추가
                    result.data.comments.push(comment);
        
                    // 모든 댓글 정보를 추가한 후에 응답을 보냄
                    if (i === rows.length - 1) {
                        result.success = true;
                        result.message = '게시물 수정 성공';
                        return res.status(200).send(result);
                    }
                });
            }
        });
    }
    catch(error){
        console.error('전체 댓글 불러오기 오류: ', error);
        return next(error);
    }
})


//댓글 등록 API
router.post("/:postIdx", loginCheck, (req,res,next) => {
    const postIdx = req.params.postIdx;
    const { content } = req.body
    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{
    
        if(!validator.contentValidator(content)){ // validator 쓰기
            return next({
                message : '내용이 공백임',
                status : 400
            })
        }

    
        const insertSql = "INSERT INTO comment ( content, user_idx, post_idx) VALUES (?, ?, ?)";
        connection.query(insertSql, [content, req.session.user.idx,postIdx], (err) => {
            if (err) {
                console.error('댓글 등록 오류: ', err);
                return next({
                    message : "댓글 등록 실패",
                    status : 500
                })

            }

            result.success = true;
            result.message = '댓글 등록 성공';
            result.data = {content};
            res.status(200).send(result);

        });
    } catch (error){
        console.error('댓글 등록 오류 발생: ', error);
        return next(error);
    }
})


//댓글 수정 API
router.put("/:idx", loginCheck, (req,res,next) => {
    
    const {content} = req.body
    const commentIdx = req.params.idx
    const userIdx = req.session.user.idx
    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }
    try{

        if(!validator.contentValidator(content)){ // validator 쓰기
            return next({
                message : '내용이 공백임',
                status : 400
            })
        }
    
        const selectUserSql = "SELECT user_idx FROM comment WHERE idx = ?";
        connection.query(selectUserSql, commentIdx, (err, userIdxResult) => {
            if (err) {
                console.error('user_idx 가져오기 실패 : ', err);
                return next({
                    message : 'user_idx 가져오기 실패',
                    status : 500
                })

            }

            // 여기에서 사용자 idx 비교
            if (userIdx !== userIdxResult[0].user_idx) {
                return next({
                    message : "해당 댓글 작성자만 댓글을 수정할 수 있습니다.",
                    status : 403
                })

            }

            const updateSql = "UPDATE comment SET content = ? WHERE idx = ?";
            connection.query(updateSql, [content, commentIdx], (err) => {
                if (err) {
                    console.error('댓글 수정 오류: ', err);
                    return next({
                        message : '댓글 수정 실패',
                        status : 500
                    })
                  
                }

                result.success = true;
                result.message = '댓글 수정 성공';
                result.data = { content };
                res.status(200).send(result);
            });
        });
    } catch (error){
        console.error('댓글 수정 오류 발생: ', error);
        return next(error);
    }
})


//댓글 삭제 
router.delete("/:idx", loginCheck, (req,res,next) => {
  
    const commentIdx = req.params.idx;
    const userIdx = req.session.user.idx;
    const result = {
        "success" : false, 
        "message" : "", 
        "data" : null 
    }
    try{

        const selectUserSql = "SELECT user_idx FROM comment WHERE idx = ?";
        connection.query(selectUserSql, commentIdx, (err, userIdxResult) => {
            if (err) {
                console.error('user_idx 가져오기 실패 : ', err);
                return next({
                    message : 'user_idx 가져오기 실패',
                    status : 500
                })
            }

            // 여기에서 사용자 idx 비교
            if (userIdx !== userIdxResult[0].user_idx) {
                return next({
                    message : '해당 댓글 작성자만 댓글을 삭제할 수 있습니다.',
                    status : 403
                })
            }

            const deleteSql = "DELETE FROM comment WHERE idx = ?";
            connection.query(deleteSql, commentIdx, (err) => {
                if (err) {
                    console.error('댓글 삭제 오류: ', err);
                    return next({
                        message : '댓글 삭제 실패.',
                        status : 500
                    })
                }

                result.success = true;
                result.message = '댓글 삭제 성공';
                res.status(200).send(result);
            });
        });

    } catch (error){
        console.error('댓글 삭제 오류 발생: ', error);
        return next(error);
    }
})

router.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        success: false,
        message: err.message || '서버 오류',
        data: null,
    });
});

module.exports = router