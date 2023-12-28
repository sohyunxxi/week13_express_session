const validator = require('../modules/commentValidator');
const router = require("express").Router();
const loginCheck = require('../middleware/loginCheck');
const contentValidator = require('../modules/commentValidator');
const pool = require('../config/postgresql')
const queryConnect = require('../modules/queryConnect');



// 댓글 불러오기
// 댓글 등록하기
// 댓글 수정하기
// 댓글 삭제하기

//------댓글 관련 API-------

//댓글 불러오기 API
//postidx 비어있는지 체크

router.get("/", loginCheck, async (req, res, next) => {
    const {postIdx} = req.body
    const result = {
        success: false,
        message: "",
        data: {
            comments: [],
        },
    };

    try {
        const selectCommentSql = `
            SELECT comment.*, account.id AS account_id
            FROM comment
            INNER JOIN account ON comment.account_idx = account.idx
            WHERE comment.post_idx = $1
            ORDER BY comment.created_at DESC
        `;
        const values = [postIdx];
        const data = await pool.query(selectCommentSql, values);
        const rows = data.rows;

        // 배열에 각 댓글 정보 추가
        for (let i = 0; i < rows.length; i++) {
            const comment = {
                commentIdx: rows[i].idx,
                commentWriterIdx: rows[i].account_idx,
                commentWriterId: rows[i].account_id,
                commentPostIdx: rows[i].post_idx,
                commentTitle: rows[i].title,
                commentContent: rows[i].content,
                commentCreated: rows[i].created_at
            };

            // 배열에 댓글 추가
            result.data.comments.push(comment);
        }

        result.success = true;
        result.message = "댓글 가져오기 성공";
        res.status(200).send(result); // 이 부분 수정
    } catch (e) {
        result.message = e.message;
        console.log(e)
    } finally {
        
    }
});



//postidx 비어있는지 체크
//댓글 등록 API
router.post("/", loginCheck, contentValidator, async(req,res,next) => { // 헷갈릴수있어서 body로 받도록 수정
    const {postIdx,content} = req.body
    const userIdx = req.session.user.idx
    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{
        const insertSql = "INSERT INTO comment (content, account_idx, post_idx) VALUES ($1, $2, $3)";
        const values = [content, userIdx, postIdx];
       const data = await pool.query(insertSql, values) // query는 비동기 함수니까 await
       const row = data.rowCount
       
       if(row>0){
        result.success=true
        result.data= row
        result.message = "댓글 등록 성공"
        }
        else{
            result.success=false
            result.message = "댓글 등록 실패"
            console.log(data)
        }
    } catch(e){ // 쓰레기통 구현하면 이 내용들 줄일  수 있음.
        result.message=e.message
    } finally{
        res.send(result) 
    }
    
})


//댓글 수정 API
router.put("/:idx", loginCheck, contentValidator, async (req,res,next) => {
    
    const {content} = req.body
    const commentIdx = req.params.idx
    const userIdx = req.session.user.idx
    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{
        const updateSql = "UPDATE comment SET content = $1 WHERE idx = $2 AND account_idx = $3";
        const values = [content, commentIdx,userIdx]
        const data = await pool.query(updateSql, values) // query는 비동기 함수니까 await
       const row = data.rowCount //data는 별에 별 내용이 다 들어가 있어서 테이블은 rows만.


        // DB 통신 결과 처리
        if(row>0){
            result.success=true
            result.data= row
            result.message = "댓글 수정 성공"
        }
        else{
            result.success=true
            result.message = "댓글 수정 실패"
        }
        
    
    } catch(e){ // 쓰레기통 구현하면 이 내용들 줄일  수 있음.
        result.message=e.message
    } finally{
        res.send(result) 
    }
    
})



//댓글 삭제 
router.delete("/:idx", loginCheck, async (req,res,next) => {
  
    const commentIdx = req.params.idx;
    const userIdx = req.session.user.idx;
    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{
        const deleteSql = "DELETE FROM comment WHERE idx = $1 AND account_idx=$2";
        const values = [commentIdx,userIdx]
        const data = await pool.query(deleteSql, values) // query는 비동기 함수니까 await
        const row = data.rowCount //data는 별에 별 내용이 다 들어가 있어서 테이블은 rows만.
 
 
         // DB 통신 결과 처리
         if(row>0){
             result.success=true
             result.data= row
             result.message = "게시물 삭제 성공"

         }
         else{
             result.success=true
             result.message = "삭제 권한 없거나 게시물 존재하지 않음"
         }
         
     
     } catch(e){ // 쓰레기통 구현하면 이 내용들 줄일  수 있음.
         result.message=e.message
     } finally{
         res.send(result) 
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