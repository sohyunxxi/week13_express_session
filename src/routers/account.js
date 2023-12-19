const validator = require('validator');
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

// 아이디 유효성 검증 함수
const validateId = (id) => {
    return validator.isAlphanumeric(id) && validator.isLength(id, { min: 6, max: 12 });
};

// 비밀번호 유효성 검증 함수
const validatePassword = (password) => {
    return validator.matches(password, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/);
};

// 이메일 유효성 검증 함수
const validateEmail = (email) => {
    return validator.isEmail(email);
};

// 전화번호 유효성 검증 함수
const validateTel = (tel) => {
    return validator.isNumeric(tel) && validator.isLength(tel, { min: 11, max: 11 });
};

module.exports = {
    validateId,
    validatePassword,
    validateEmail,
    validateTel,
};

// 회원가입
// 회원정보 불러오기
// 회원정보 수정
// 회원 탈퇴
// 로그인
// 로그아웃
// 아이디 찾기
// 비밀번호 찾기

router.post('/login', (req, res) => {
    try {
        const { id, pw } = req.body;

        const idReq = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;
        const pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/;

        const result = {
            "success": false,
            "message": "로그인 실패",
            "data": null
        };

        // id 정규표현식
        if (!idReq.test(id)) {
            result.message = "아이디는 6자리 이상 12자리 이하의 영어와 숫자 조합으로 작성해주세요.";
            return res.status(400).send(result);
        }
        // pw 정규표현식
        if (!pwReg.test(pw)) {
            result.message = "비밀번호는 6자리 이상 16자리 이하의 영어,숫자,특수문자 조합으로 작성해주세요.";
            return res.status(400).send(result);
        }

        // DB 통신
        const selectSql = "SELECT * FROM user WHERE id = ? AND pw = ?";
        connection.query(selectSql, [id, pw], (err, rows) => {
            if (err) {
                console.error('로그인 오류: ', err);
                result.message = '로그인 실패';
                return res.status(500).send(result);
            }

            // 아이디가 없음
            if (rows.length === 0) {
                result.message = "해당하는 아이디가 없습니다.";
                return res.status(400).send(result);
            }

            // 로그인 성공
            result.success = true;
            result.message = '로그인 성공';
            result.data = { id, pw };

            // 데이터베이스에서 조회된 정보로 result.data 설정
            const userDataFromDB = rows[0];
            result.data = {
                userId: userDataFromDB.id,
                userName: userDataFromDB.name,

            };

            // URL 조립
            const redirectUrl = '/mainPage.jsp';
            const redirectUrlWithQuery = `${redirectUrl}?userId=${id}`;

            // 세션에 사용자 정보 저장
            req.session.user = userDataFromDB;

            // 리다이렉트
            res.redirect(redirectUrlWithQuery);
        });
    } catch (error) {
        // 로그인 실패
        console.error('로그인 실패: ', error);
        result.message = "로그인 실패";
        res.status(500).send(result);
    }
});


// 로그아웃 API
router.post('/logout', (req, res) => { //또는 delete?
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
router.get("/findid", (req,res) => {//다른 방식으로 적기 (/ 사용할것)
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
router.get("/findpw", (req,res) => { //다른 방식으로 적기 (/ 사용할것)
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
router.post("/", (req, res) => {
    const { id, pw, confirmPw, name, email, tel, birth, address, gender } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };

    const idReq = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;
    const pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/;
    const nameReg = /^[a-zA-Z가-힣]{2,50}$/;
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const telReg = /^[0-9]{11}$/;  
    const birthReg = /^\d{8}$/;
    const genderReg = /^(남성|여성)$/;
  

    if (!idReq.test(id) || !pwReg.test(pw) || !pwReg.test(confirmPw) ||
        !telReg.test(tel) || !emailReg.test(email) || !nameReg.test(name) ||!birthReg.test(birth) || !genderReg.test(gender) ||
        confirmPw !== pw) {
        result.message = "입력값이 유효하지 않습니다.";
        return res.status(400).send(result);
    }

    // 중복 확인

    const checkDuplicate = "SELECT * FROM user WHERE id = ?";
    connection.query(checkDuplicate, [id], (err, rows) => {
        if (err) {
            console.error('회원가입 오류 - 아이디 중복: ', err);
            return res.status(500).send({
                success: false,
                message: '회원가입 실패 - 아이디 중복',
                data: null
            });
        }

        if (rows.length > 0) {
            return res.status(400).send({
                success: false,
                message: "아이디가 이미 사용 중입니다.",
                data: null
            });
        }

        // 회원가입 쿼리
        const insertSql = "INSERT INTO user (name, id, pw, email, birth, tel, address, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        connection.query(insertSql, [name, id, pw, email, birth, tel, address, gender], (err) => {
            if (err) {
                console.error('회원가입 오류: ', err);
                result.message = '회원가입 실패';
                return res.status(500).send(result);
            }

            result.success = true;
            result.message = '회원가입 성공';
            result.data = { id, name, pw, email, birth, tel, gender, address };
            res.sendFile(path.join(__dirname, "../../public/index.html"))
        });
    });
});



// 회원정보 보기 API

router.get("/my", (req, res) => { //account/:my 이게 더 나음. 세션으로 검증하면 됨.
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

router.put("/my", (req, res) => {
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
router.delete("/my", (req, res) => {
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

module.exports = router //이렇게 export를 적어야 import 가능함.

