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

//댓글 등록 API
router.post("/comment", (req,res) => {

    const { postingIdx, content } = req.body
    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{

        if(!req.session.userIdx){
            result.message = "로그인 상태가 아님"
            //return res.status(401).send(result)            
            res.redirect('/login.jsp');

        }
    
        if(!content.trim()){
            result.message = "내용이 공백임"
            return res.status(400).send(result)
        }
    
        result.success = true
        result.message = "댓글 쓰기 성공"
        result.data = {
            "commentIdx" : commentIdx,
            "postingIdx" : postingIdx,
            "id" : id,
            "createTime" : createTime,
            "content" : content
        }
        
        res.status(200).send(result)
    } catch (error){
        result.message = "댓글 등록 관련 오류 발생"
        res.status(500).send(result)
    }
})


//댓글 수정 API
router.put("/comment:/idx", (req,res) => {
    
    const {content} = req.body
    const commentIdx = req.body.commentIdx
    const commentWriterIdx = req.body.commentWriterIdx


    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }
    try{

        if(!req.session.userIdx){
            result.message = "로그인 상태가 아님"
            //return res.status(401).send(result)
            res.redirect('/login.jsp');
        }

        if(!content){
            result.message = "내용이 공백임"
            return res.status(400).send(result)
            
        }
    
        if(req.session.userIdx=commentWriterIdx){
            result.message = "해당 댓글 작성자만 수정 가능합니다."
            return res.status(403).send(result)
        }
    
        result.success = true
        result.message = "댓글 수정 성공"
        result.data = {
            "id" : id,
            "content" : content,            
            "commentIdx" : commentIdx,
            "postingIdx" : postingIdx
        }
        res.status(200).send(result)

    } catch (error){
        result.success = false
        result.message = "댓글 수정 오류 발생"
        res.status(500).send(result)
    }
})

//댓글 삭제 
router.delete("/comment:/idx", (req,res) => {
  
    const commentWriterIdx = req.body.commentWriterIdx

    const result = {
        "success" : false, 
        "message" : "", 
        "data" : null 
    }
    try{
        if(!req.session.userIdx){
            result.message = "로그인 상태가 아님"
            //return res.status(401).send(result)            
            res.redirect('/login.jsp');

        }

        if(commentWriterIdx!=req.session.userIdx){
            result.message = "해당 댓글 작성자만 삭제가 가능합니다."
            return res.status(403).send(result)
        }
    
        result.success = true
        result.message = "댓글 삭제 성공"
        res.redirect('/postView.jsp?postIdx=postIdx');

    } catch (error){
        result.message = "댓글 삭제 관련 오류 발생"
        res.status(500).send(result)
    }
})

module.exports = router