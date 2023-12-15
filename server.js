//==========package============
const express=require("express")
const session = require("express-session")//
var MySQLStore = require("express-mysql-session")(session); //세션 저장위치 바꿈 -> 지금 당장은 필요없음.

var options = {
    host: "localhost",
    port: 8000,
    user: "Sohyunxxi",
    password: "1234",
    database: "week06",
  };
  
var sessionStore = new MySQLStore(options);

//예외처리를 모듈화해서 밖으로 빼기 (유효성 모듈)

//======Init========
const app = express()
const port = 8000
const maxAge = 1000 * 60 * 10; //10분동안 세션유지


const sessionObj = {
  secret: 'session',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,

};

app.use(session(sessionObj)); //모든 url에 접근시 적용
//======Apis========

// app.get("/",(req,res)=>{
//     res.sendFile(`${__dirname}/public/index.html`)
// })

// app.get("/loginPage",(req,res)=>{
//     res.sendFile(`${__dirname}/public/login.html`)

// })
// app.get("/account",(req,res)=>{
//     res.sendFile(`${__dirname}/public/login.html`)
//     const {idx} = req.body

//     const result={
//         "success":false,
//         "message":"",
//         "data":null
//     }
//     // DB 통신

//     // DB 통신 결과 처리
//     result.success=true
//     result.data={}

//     //값 반환
//     res.send(result)
// })


// 로그인 처리 API
app.post('/login', (req, res) => {
    try{
        const { id, pw } = req.body;

        const idReq = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;
        const pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/;

        const result = {
            "success": false,
            "message": "로그인 실패",
            "data": null
        };

        // DB 통신

        // DB 통신 결과 처리 

        // id 정규표현식
        if(!idReq.test(id)){
            result.message = "아이디는 6자리 이상 12자리 이하의 영어와 숫자 조합으로 작성해주세요.";
            return res.status(400).send(result);
        }
        //pw 정규표현식
        if(!pwReg.test(pw)){
            result.message = "비밀번호는 6자리 이상 16자리 이하의 영어,숫자,특수문자 조합으로 작성해주세요.";
            return res.status(400).send(result);
        }

        //잘못된 비밀번호 입력 -> db에서 가져온 pw 일치 xx
        if(pw!=userPw){
            result.message = "비밀번호가 일치하지 않습니다.";
            return res.status(400).send(result);
        }
        //아이디가 없음 -> ??
        if (!userId) {
            result.message = "해당하는 아이디가 없습니다.";
            return res.status(400).send(result);
        }

        // 로그인 성공
        result.success = true;
        result.message = "로그인 성공";

        // 데이터베이스에서 조회된 정보로 result.data 설정
        result.data = {
            userId: userId,
            userName: userName,
            userIdx: userIdx
        };

        // URL 조립
        const redirectUrl = '/mainPage.jsp';
        const redirectUrlWithQuery = `${redirectUrl}?userId=${id}`;

        // 세션에 사용자 정보 저장
        req.session.user = { userId, userPw, userName, userEmail, userTel, userIdx, userBirth, userGender };

        // 리다이렉트
        res.redirect(redirectUrlWithQuery);
    } catch(error) {
        // 로그인 실패
        result.message = "로그인 실패";
        res.status(500).send(result);
    }
});

// 로그아웃 API
app.post('/logout', (req, res) => { //또는 delete?
    const result = {
        "success" : false, 
        "message" : "" 
    };

    try {
        if (!req.session.userIdx) {
            result.message = '로그인 상태가 아닙니다.';
            return res.status(400).send(result);
        }

        // 이미 로그아웃한 사용자인지 확인하고, 로그인된 경우에만 세션 제거 (세션 파기)
        req.session.destroy((err) => {
            if (err) {
                result.message = '로그아웃 실패';
                res.status(500).send(result);
            } else {
                result.success = true;
                result.message = '로그아웃 성공';
                res.redirect('/login.jsp'); 
                //res.status(200).send(result);
            }
        });
    } catch (error) {
        result.message = "로그아웃 오류 발생";
        res.status(500).send(result);
    }
});

//id 찾기 api
app.get("/account/:findid", (req,res) => {//다른 방식으로 적기 (/ 사용할것)
    const { name, email } = req.body

    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }
    const nameReg = /^[a-zA-Z가-힣]{2,50}$/
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    try{

        if(!nameReg.test(name)){
            result.success = false
            result.message = "이름은 영어나 한글로 2~50자리"
            return res.status(400).send(result)
        }
        
        if(!emailReg.test(email)){
            result.success = false
            result.message = "이메일 양식에 맞춰서 작성, ex) kaka1234@gmail.com"
            return res.status(400).send(result)
        }

        if(foundUser){ //db에서 조회하고 일치하는 경우에 foundUser는 True
            result.success = true
            result.data.id=userId
            result.message = `사용자의 아이디는 ${userId}입니다.`;
            res.redirect('/login.jsp'); 
        }
        else{
            result.message = "해당 사용자를 찾을 수 없습니다."
            res.status(404).send(result);        
        }
       
    } catch (error){
        result.success = false
        result.message = "아이디 찾기 오류 발생"
        res.status(500).send(result)
    }
})

//pw 찾기
app.get("/account/:findpw", (req,res) => { //다른 방식으로 적기 (/ 사용할것)
    const { name, email } = req.body

    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }
    const nameReg = /^[a-zA-Z가-힣]{2,50}$/
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const idReq = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;

    try{

        if(!nameReg.test(name)){
            result.message = "이름은 영어나 한글로 2~50자리"
            return res.status(400).send(result)
        }
        
        if(!emailReg.test(email)){
            result.message = "이메일 양식에 맞춰서 작성, ex) kaka1234@gmail.com"
            return res.status(400).send(result)
        }

        if(!idReq.test(id)){
            result.message = "아이디는 6자리이상 12자리이하 영어숫자 조합"
            return res.status(400).send(result)
        }


        if(foundUser){//db에서 조회하고 일치하는 경우에 foundUser는 True
            result.success = true
            result.pw=userPw
            result.message = "사용자의 비밀번호는 ${userPw}입니다."
            res.redirect('/login.jsp'); 
        }
        else{
            result.message = "해당 사용자를 찾을 수 없습니다."
            res.status(404).send(result);
        }
       
    } catch (error){
        result.success = false
        result.message = "비밀번호 찾기 오류 발생"
        res.status(500).send(result)
    }
})


//------회원 관련 API-------


// 회원가입 API
app.post('/account', (req, res) => {
    const { id, pw, confirmPw, name, email, tel, birth, gender } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };

    const idReq = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;
    const pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/;
    const nameReg = /^[a-zA-Z가-힣]{2,50}$/
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const telReg = /^[0-9]{11}$/
    let genderNum=0//성별
    //유효성 관련 변수
    const idDuplication = false

    try{
        if(!idReq.test(id)){
            result.message = "아이디는 6-12자리 영어 숫자 조합"
            return res.status(400).send(result)
            
        }
        if(!pwReg.test(pw)){
            result.message = "비밀번호는 6-16자리 영어 숫자 특수기호 조합"
            return res.status(400).send(result)
            
        }
        if(!pwReg.test(confirmPw)){
            result.message = "비밀번호는 6-16자리 영어 숫자 특수기호 조합"
            return res.status(400).send(result)
            
        }
        if(!telReg.test(tel)){
            result.message = "전화번호는 11자리 숫자만"
            return res.status(400).send(result)
            
        }
        if(!emailReg.test(email)){
            result.message = "이메일 양식에 맞춰서 작성, ex) kaka1234@gmail.com"
            return res.status(400).send(result)
            
        }

        if(!nameReg.test(name)){
            result.message = "이름은 영어나 한글로 2~50자리"
            return res.status(400).send(result)
            
        }
        if(confirmPw!== pw){
            result.message = "비밀번호가 일치하지 않습니다."
            return res.status(400).send(result)
            
        }
        if(idDuplication){
            result.message = "아이디가 중복입니다."
            return res.status(400).send(result)
            
        }

        result.success = true;
        result.message = '회원가입 성공';
        result.data = { id, name, pw, email, birth, tel, gender }; // 가입된 사용자 정보
        res.redirect('/login.jsp'); 
    }
    catch(error){
        result.message = "회원가입 오류 발생"
        res.status(500).send(result)
    }

});

// 회원정보 보기 API

app.get("/account/:userIdx", (req, res) => { //account:/my 이게 더 나음. 세션으로 검증하면 됨.
    const { id, pw, confirmPw, name, email, tel, birth, gender } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };

    const pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/;
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const telReg = /^[0-9]{11}$/

    try{

        if(!req.session.userIdx){
            result.message = "로그인 되어 있지 않음"
            //return res.status(401).send(result)
            res.redirect('/login.jsp');

        }

        if(!pwReg.test(pw)){
            result.message = "비밀번호 양식이 틀림"
            return res.status(400).send(result)
            
        }
        if(!telReg.test(tel)){
            result.message = "전화번호는 11자리 숫자만"
            return res.status(400).send(result)
            
        }
        if(!emailReg.test(email)){
            result.message = "이메일 양식에 맞지않음, ex) kaka1234@gmail.com"
            return res.status(400).send(result)
            
        }
        if(gender==null){
            result.message = "성별이 비어있음"
            return res.status(400).send(result)
        }



        result.success = true;
        result.message = '정보 불러오기 성공';
        result.data = { id, name, 
            "pw" : pw, 
            "email" : email,
            "birth" : birth,
            "tel" : tel,
            "gender" : gender }; // 가입된 사용자 정보
        res.redirect('/showInfo.jsp');
    }
    catch(error){
        result.message = "회원정보 불러오기 오류 발생"
        res.status(500).send(result)
    }

});

// 회원정보 수정 API

app.put("/account", (req, res) => {
    const { id, pw, confirmPw, name, email, tel, birth, gender } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };

    const pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/;
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const telReg = /^[0-9]{11}$/
    let genderNum=0//성별
    //유효성 관련 변수
    const idDuplication = false

    try{

        if(!req.session.userIdx){
            result.message = "로그인 되어 있지 않음"
            //return res.status(401).send(result)
            res.redirect('/login.jsp');

        }

        if(!pwReg.test(pw)){
            result.message = "비밀번호는 6-16자리 영어 숫자 특수기호 조합"
            return res.status(400).send(result)
            
        }
        if(!pwReg.test(confirmPw)){
            result.message = "비밀번호는 6-16자리 영어 숫자 특수기호 조합"
            return res.status(400).send(result)
            
        }
        if(!telReg.test(tel)){
            result.message = "전화번호는 11자리 숫자만"
            return res.status(400).send(result)
            
        }
        if(!emailReg.test(email)){
            result.message = "이메일 양식에 맞춰서 작성, ex) kaka1234@gmail.com"
            return res.status(400).send(result)
            
        }
        if(confirmPw!== pw){
            result.message = "비밀번호가 일치하지 않습니다."
            return res.status(400).send(result)
            
        }
        if(idDuplication){
            result.message = "아이디가 중복입니다."
            return res.status(400).send(result)
            
        }
        //성별 추가하기

        result.success = true;
        result.message = '정보수정 성공';
        result.data = { id, name, 
            "pw" : pw, 
            "email" : email,
            "birth" : birth,
            "tel" : tel,
            "gender" : gender }; // 가입된 사용자 정보
        res.redirect('/showInfo.jsp');
    }
    catch(error){
        result.message = "회원정보 수정 오류 발생"
        res.status(500).send(result)
    }

});

//회원 탈퇴하기
app.delete("/account", (req, res) => {
    const result = {
        "success": false, 
        "message": ""
    }

    try {

        if (!req.session.userIdx) {
            result.message = "로그인 상태가 아닙니다."
            //return res.status(401).send(result)
            res.redirect('/login.jsp');
        }

        // 세션 파기 (로그아웃과는 별개)
        req.session.destroy((err) => {
            if (err) {
                result.message = '세션 파기 실패';
                res.status(500).send(result);
            } else {
                result.success = true;
                result.message = '세션 파기 성공';
                res.status(200).send(result);
            }
        });

        result.success = true;
        result.message = "회원탈퇴 성공.";
        res.redirect('/login.jsp');

    } catch (error) {
        result.message = "회원탈퇴 오류 발생"
        res.status(500).send(result)
    }
});


//------게시물 관련 API-------

//게시물 목록 불러오기
app.get("/post", (req,res) => {
    const result = {
        "success" : false, 
        "message" : "", 
        "data" : null 
    }
    try{
        if (!req.session.userIdx) {
            result.message = "로그인 상태가 아닙니다."
            //return res.status(401).send(result)
            res.redirect('/login.jsp');
        }
        result.success = true
        result.message = "전체 게시물 불러오기"
        res.status(200).send(result)

    }catch (error){
        result.success = false
        result.message = "전체 게시물 불러오기 오류 발생"
        res.status(500).send(result)
    }
})

//각 게시물 읽기 => 댓글도 받아오기.
app.get("/post/:idx", (req,res) => {
   
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
app.post("/post", (req,res) => {
    
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
app.put("/post/:idx", (req,res) => {
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
app.delete("/post/:idx", (req,res) => {

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

//------댓글 관련 API-------

//댓글 등록 API
app.post("/comment", (req,res) => {

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
app.put("/comment:/idx", (req,res) => {
    
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
app.delete("/comment:/idx", (req,res) => {
  
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


//======Web Server======
app.listen(port, ()=>{
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})

