// 게시물 불러오기
// 게시물 등록하기
// 게시물 수정하기
// 게시물 삭제하기
const router = require("express").Router()

//------게시물 관련 API-------

//게시물 목록 불러오기
router.get("/", (req, res) => {
    const result = {
        "success": false,
        "message": "",
        "data": {
            "posts": [],  // posts 배열 초기화
            "comments": []  // comments 배열 초기화
        }
    };

    try {
        if (!req.session.userIdx) {
            result.message = "로그인 상태가 아닙니다.";
            res.redirect('/login.jsp');
        }
        result.success = true;
        result.message = "전체 게시물 불러오기";
        res.status(200).send(result);
    } catch (error) {
        result.success = false;
        result.message = "전체 게시물 불러오기 오류 발생";
        res.status(500).send(result);
    }
});

//각 게시물 읽기 => 댓글도 받아오기.
router.get("/idx", (req,res) => {
   
    const postIdx = req.params.postIdx;
    const userIdx = req.session.userIdx;

    const result = {
        "success" : false,
        "message" : "", 
        "data" : null 
    }
    const post = {
        postIdx: null,
        postWriterIdx: null,
        postingWriterId: null,
        postingContent: null,
        postingTitle: null,
        postingDate: null
    };

    const comment= {
        commentIdx: null,
        postingKey: null,
        commentUserId: null,
        commentContent: null,
        commentDate: null
    };
    
    try{
        if(!userIdx){
            result.message = "로그인 상태가 아님"
            //return res.status(401).send(result)
            res.redirect('/login.jsp');
        }
        
        result.success = true
        result.message = "전체 게시물과 댓글 불러오기 성공"
        
        //db에서 가져온 댓글 데이터 게시물 데이터 넣기 --> 잘 모르겠음...
        result.data.posts.push(post);
        result.data.comments.push(comment);

        res.status(200).send(result)
    } catch (error){
        result.success = false
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//게시물 쓰기
router.post("/new", (req,res) => {
    
    const { content, title } = req.body

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
        if(!content.trim()){ //내용 비어있는 경우
            result.message = "내용을 입력해주세요"
            return res.status(400).send(result)
        }
        
        if(!title.trim()){
            result.message = "제목을 입력해주세요."
            return res.status(400).send(result)
        }
    
        result.success = true
        result.message = "게시물 작성 성공"
        result.data = {
            "userIdx": userIdx,
            "postIdx": postIdx,
            "content": content,
            "title": title
        }
        res.redirect(`/postView?postIdx=${postIdx}`);
    } catch (error){
        result.success = false
        result.message = "게시물 작성 오류 발생"
        res.status(500).send(result)
    }
})

//게시물 수정하기
router.put("/idx", (req,res) => {
    const { content, title } = req.body
    
    const result = {
        "success" : false,
        "message" : "", 
        "data" : null 
    }
    const postIdx = req.body.postIdx
    const postWriterIdx = req.body.postWriterIdx
    const userIdx = req.session.idx
    try{
        if(!req.session.userIdx){
            result.message = "로그인 상태가 아님"
            //return res.status(401).send(result)
            res.redirect('/login.jsp');
        }
        if(userIdx!==postWriterIdx){
            result.message = "해당 게시물 작성자만 게시물을 수정할 수 있습니다."
            return res.status(403).send(result)
        }
  
        if(!title.trim()){
            result.message = "제목을 입력해주세요."
            return res.status(400).send(result)
        }

        if(!content.trim()){ //내용 비어있는 경우
            result.message = "내용을 입력해주세요"
            return res.status(400).send(result)
        }
       
        result.success = true
        result.message = "게시물 수정 성공"
        result.data = {
            "postIdx" : postIdx,
            "title" : title,
            "content" : content,
        }
        res.redirect(`/postView?postIdx=${postIdx}`);
    } catch (error){
        result.message = "게시물 수정 오류 발생"
        res.status(500).send(result)
    }
})

//게시물 삭제하기
router.delete("/idx", (req,res) => {

    const postIdx = req.body.postIdx
    const userIdx = req.session.userIdx

    const result = {
        "success" : false, 
        "message" : "" 
    }
    try{
        if(!req.session.userIdx){
            result.message = "로그인 상태가 아님"
            //return res.status(401).send(result)
            res.redirect('/login.jsp');
        }

        if(userIdx!=postIdx){
            result.message = "해당 게시글 작성자만 삭제 가능합니다."
            return res.status(403).send(result)
        }

        result.success = true
        result.message = "게시물 삭제 성공"
        res.redirect('/mainPage.jsp');

    } catch (error){
        result.message = "게시물 삭제 오류 발생"
        res.status(500).send(result)
    }
})
module.exports = router