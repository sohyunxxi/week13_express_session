const router = require("express").Router();
const loginCheck = require('../middleware/loginCheck');
const queryConnect = require('../modules/queryConnect');
const contentValidator = require('../middleware/commentValidator');
const makeLog = require("../middleware/makelog");

// 댓글 불러오기 API
router.get("/", loginCheck, async (req, res, next) => {
    const { postIdx } = req.body;
    const userId = req.session.user.id

    const result = {
        success: false,
        message: "",
        data: {
            comments: [],
        },
    };

    try {
        if (!postIdx) {
            return next({
                message: 'postIdx 값이 없음',
                status: 400
            });
        }

        const query = {
            text: `
                SELECT comment.*, account.id AS account_id
                FROM comment
                INNER JOIN account ON comment.account_idx = account.idx
                WHERE comment.post_idx = $1
                ORDER BY comment.created_at DESC
            `,
            values: [postIdx],
        };

        const { rows } = await queryConnect(query);

        result.data.comments = rows.map(row => ({ //테이블 컬럼에 있는 걸로 그냥 주기..
            commentIdx: row.idx,
            commentWriterIdx: row.account_idx,
            commentWriterId: row.account_id,
            commentPostIdx: row.post_idx,
            commentTitle: row.title,
            commentContent: row.content,
            commentCreated: row.created_at
        }));

        result.success = true;
        result.message = "댓글 가져오기 성공";
        const logData = {
            ip: req.ip,
            userId: userId, 
            apiName: '/comment/', 
            restMethod: 'GET', 
            inputData: {postIdx}, 
            outputData: result, 
            time: new Date(), 
        };

        // makeLog 함수에 로그 데이터 전달
        await makeLog(req, res, logData, next);
        res.send(result);
    } catch (error) {
        result.message = error.message;
        console.error(error);
        return next(error);
    }
});

// 댓글 등록 API
router.post("/", loginCheck, contentValidator, async(req,res,next) => {
    const { postIdx, content } = req.body
    const userIdx = req.session.user.idx
    const userId = req.session.user.id

    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{
        if (!postIdx) {
            return next({
                message: 'postIdx 값이 없음',
                status: 400
            });
        }
        const query = {
            text: 'INSERT INTO comment (content, account_idx, post_idx) VALUES ($1, $2, $3)',
            values: [content, userIdx, postIdx],
        };

        const { rowCount } = await queryConnect(query);
       
       if(rowCount==0){
            return next({
                message: '댓글 등록 실패',
                status: 500
            });
        }
        result.success=true
        result.data= rowCount
        result.message = "댓글 등록 성공"

        const logData = {
            ip: req.ip,
            userId: userId, 
            apiName: '/comment/', 
            restMethod: 'POST', 
            inputData: {postIdx, content}, 
            outputData: result, 
            time: new Date(), 
        };

        // makeLog 함수에 로그 데이터 전달
        await makeLog(req, res, logData, next);
        res.send(result) 
    } catch(e){ 
        result.message=e.message
        return next(e);
    }    
});

// 댓글 수정 API
router.put("/:idx", loginCheck, contentValidator, async (req,res,next) => {  
    const {content} = req.body
    const commentIdx = req.params.idx
    const userIdx = req.session.user.idx
    const userId = req.session.user.id

    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{
        const query = {
            text: 'UPDATE comment SET content = $1 WHERE idx = $2 AND account_idx = $3',
            values: [content, commentIdx, userIdx],
        };

        const { rowCount } = await queryConnect(query);

        if(rowCount == 0){
            return next({
                message: '댓글 수정 실패',
                status: 500
            });
        }
        
        result.success=true
        result.data= rowCount
        result.message = "댓글 수정 성공"
            
       
        const logData = {
            ip: req.ip,
            userId: userId, 
            apiName: '/comment/:idx', 
            restMethod: 'PUT', 
            inputData: {content}, 
            outputData: result, 
            time: new Date(), 
        };

        // makeLog 함수에 로그 데이터 전달
        await makeLog(req, res, logData, next);
        res.send(result) 
    } catch(e){
        result.message=e.message
        return next(e);
    }
    
});

// 댓글 삭제 API
router.delete("/:idx", loginCheck, async (req,res,next) => {
    const commentIdx = req.params.idx;
    const userIdx = req.session.user.idx;
    const userId = req.session.user.id

    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{
        const query = {
            text: 'DELETE FROM comment WHERE idx = $1 AND account_idx=$2',
            values: [commentIdx, userIdx],
        };

        const { rowCount } = await queryConnect(query);
        if(rowCount == 0){
            return next({
                message: '삭제 권한 없거나 게시물 존재하지 않음',
                status: 500
            });
        }

        result.success=true
        result.data= rowCount
        result.message = "댓글 삭제 성공"
         const logData = {
            ip: req.ip,
            userId: userId, 
            apiName: '/comment/:idx', 
            restMethod: 'DELETE', 
            inputData: {}, 
            outputData: result, 
            time: new Date(), 
        };

        // makeLog 함수에 로그 데이터 전달
        await makeLog(req, res, logData, next);
         res.send(result)
     } catch(e) {
        result.message=e.message        
        return next(e);
     }
});


module.exports = router