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

// 댓글 불러오기
// 댓글 등록하기
// 댓글 수정하기
// 댓글 삭제하기

//------댓글 관련 API-------

//댓글 불러오기 API
router.get("/:postIdx",(req,res)=>{
    const postIdx = req.params.postIdx;
    const result = {
        "success" : false, 
        "message" : "",
        "data" :{
            "comments":[],
        }
    }
    try{
        if (!req.session.user) {
            result.message = "로그인 되어 있지 않음";
            return res.status(401).send(result);
        }

        const selectCommentSql = "SELECT * FROM comment WHERE post_idx = ? ORDER BY created_at DESC";
        connection.query(selectCommentSql, postIdx, (err, rows) => {
            if (err) {
                console.error('comment 가져오기 실패 : ', err);
                result.message = 'comment 가져오기 실패';
                return res.status(500).send(result);
            }
        
            // 배열에 각 댓글 정보 추가
            for (let i = 0; i < rows.length; i++) {
                const selectUserSql = "SELECT id FROM user WHERE idx = ? ";
                connection.query(selectUserSql, rows[i].user_idx, (err, selectUserResult) => {
                    if (err) {
                        console.error('해당 사용자 불러오기 실패 : ', err);
                        result.message = "해당 사용자 불러오기 실패";
                        return res.status(500).send(result);
                    }
                    if (selectUserResult.length == 0) {
                        result.message = "사용자가 존재하지 않음";
                        return res.status(404).send(result);
                    }
        
                    const comment = {
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
        result.success = false;
        result.message = "전체 댓글 불러오기 오류 발생";
        res.status(500).send(result)
    }
})


//댓글 등록 API
router.post("/:postIdx", (req,res) => {
    const postIdx = req.params.postIdx;
    const { content } = req.body
    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{

        if (!req.session.user) {
            result.message = "로그인 되어 있지 않음";
            return res.status(401).send(result);
        }
    
        if(!content.trim()){
            result.message = "내용이 공백임"
            return res.status(400).send(result)
        }

    
        const insertSql = "INSERT INTO comment ( content, user_idx, post_idx) VALUES (?, ?, ?)";
        connection.query(insertSql, [content, req.session.user.idx,postIdx], (err) => {
            if (err) {
                console.error('댓글 등록 오류: ', err);
                result.message = '댓글 등록 실패';
                return res.status(500).send(result);
            }

            result.success = true;
            result.message = '댓글 등록 성공';
            result.data = {content};
            res.status(200).send(result);

        });
    } catch (error){
        result.message = "댓글 등록 관련 오류 발생"
        res.status(500).send(result)
    }
})


//댓글 수정 API
router.put("/:idx", (req,res) => {
    
    const {content} = req.body
    const commentIdx = req.params.idx
    const userIdx = req.session.user.idx
    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }
    try{

        if (!req.session.user) {
            result.message = "로그인 되어 있지 않음";
            return res.status(401).send(result);
        }

        if(!content.trim()){
            result.message = "내용이 공백임"
            return res.status(400).send(result)
        }
    
        const selectUserSql = "SELECT user_idx FROM comment WHERE idx = ?";
        connection.query(selectUserSql, commentIdx, (err, userIdxResult) => {
            if (err) {
                console.error('user_idx 가져오기 실패 : ', err);
                result.message = 'user_idx 가져오기 실패';
                return res.status(500).send(result);
            }

            // 여기에서 사용자 idx 비교
            if (userIdx !== userIdxResult[0].user_idx) {
                result.message = "해당 댓글 작성자만 댓글을 수정할 수 있습니다.";
                return res.status(403).send(result);
            }

            const updateSql = "UPDATE comment SET content = ? WHERE idx = ?";
            connection.query(updateSql, [content, commentIdx], (err) => {
                if (err) {
                    console.error('댓글 수정 오류: ', err);
                    result.message = '댓글 수정 실패';
                    return res.status(500).send(result);
                }

                result.success = true;
                result.message = '댓글 수정 성공';
                result.data = { content };
                res.status(200).send(result);
            });
        });
    } catch (error){
        result.success = false
        result.message = "댓글 수정 오류 발생"
        res.status(500).send(result)
    }
})

//댓글 삭제 
router.delete("/:idx", (req,res) => {
  
    const commentIdx = req.params.idx;
    const userIdx = req.session.user.idx;
    const result = {
        "success" : false, 
        "message" : "", 
        "data" : null 
    }
    try{
        if (!req.session.user) {
            result.message = "로그인 되어 있지 않음";
            return res.status(401).send(result);
        }

        const selectUserSql = "SELECT user_idx FROM comment WHERE idx = ?";
        connection.query(selectUserSql, commentIdx, (err, userIdxResult) => {
            if (err) {
                console.error('user_idx 가져오기 실패 : ', err);
                result.message = 'user_idx 가져오기 실패';
                return res.status(500).send(result);
            }

            // 여기에서 사용자 idx 비교
            if (userIdx !== userIdxResult[0].user_idx) {
                result.message = "해당 댓글 작성자만 댓글을 삭제할 수 있습니다.";
                return res.status(403).send(result);
            }

            const deleteSql = "DELETE FROM comment WHERE idx = ?";
            connection.query(deleteSql, commentIdx, (err) => {
                if (err) {
                    console.error('댓글 삭제 오류: ', err);
                    result.message = '댓글 삭제 실패';
                    return res.status(500).send(result);
                }

                result.success = true;
                result.message = '댓글 삭제 성공';
                res.status(200).send(result);
            });
        });

    } catch (error){
        result.message = "댓글 삭제 관련 오류 발생"
        res.status(500).send(result)
    }
})

module.exports = router