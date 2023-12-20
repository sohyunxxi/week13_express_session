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
                userPw: userDataFromDB.pw,
                
            };

            // 세션에 사용자 정보 저장
            req.session.user = userDataFromDB;
            res.sendFile(path.join(__dirname, "../../public/mainPage.html"))

        });
    } catch (error) {
        // 로그인 실패
        console.error('로그인 실패: ', error);
        result.message = "로그인 실패";
        res.status(500).send(result);
    }
});

// 로그아웃 API
router.post('/logout', (req, res) => {
    const result = {
        success: false,
        message: ''
    };

    try {
        // 세션이 존재하면 로그인 상태로 간주
        if (!req.session.user) {
            result.message = '로그인 상태가 아닙니다.';
            return res.status(400).send(result);
        }

        // 세션 파기 (로그아웃)
        req.session.destroy((err) => {
            if (err) {
                result.message = '로그아웃 실패';
                res.status(500).send(result);
            } else {
                result.success = true;
                result.message = '로그아웃 성공';
                res.sendFile(path.join(__dirname, "../../public/index.html"));
            }
        });
    } catch (error) {
        result.message = '로그아웃 오류 발생';
        res.status(500).send(result);
    }
});



// id 찾기 API
router.get("/findid", (req, res) => {
    const { name, email } = req.body;

    const result = {
        success: false,
        message: "",
        data: null
    };
    const nameReg = /^[a-zA-Z가-힣]{2,50}$/;
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    try {
        if (!nameReg.test(name) || !emailReg.test(email)) {
            result.success = false;
            result.message = "입력값이 유효하지 않습니다.";
            return res.status(400).send(result);
        }

        // 아이디 찾기 쿼리
        const selectSql = "SELECT id FROM user WHERE name = ? AND email = ?";
        connection.query(selectSql, [name, email], (err, rows) => {
            if (err) {
                console.error('아이디 찾기 오류: ', err);
                result.message = '아이디찾기 실패';
                return res.status(500).send(result);
            }

            if (rows.length === 0) {
                result.success = false;
                result.message = '일치하는 정보가 없습니다.';
                return res.status(404).send(result);
            }

            const foundId = rows[0].id;
            result.success = true;
            result.message = `아이디찾기 성공, 아이디는 ${foundId} 입니다.`;
            result.data = { id: foundId, name, email };
            res.status(200).send(result);
        });

    } catch (error) {
        result.success = false;
        result.message = "아이디 찾기 오류 발생";
        res.status(500).send(result);
    }
});


//pw 찾기
router.get("/findpw", (req,res) => { //다른 방식으로 적기 (/ 사용할것)
    const { name, email, id } = req.body

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

        // 아이디 찾기 쿼리
        const selectSql = "SELECT pw FROM user WHERE name = ? AND email = ? AND id = ?";
        connection.query(selectSql, [name, email, id], (err, rows) => {
            if (err) {
                console.error('비밀번호 찾기 오류: ', err);
                result.message = '비밀번호 찾기 실패';
                return res.status(500).send(result);
            }

            if (rows.length === 0) {
                result.success = false;
                result.message = '일치하는 정보가 없습니다.';
                return res.status(404).send(result);
            }

            const foundPw = rows[0].pw;
            result.success = true;
            result.message = `비밀번호 찾기 성공, 비밀번호는 ${foundPw} 입니다.`;
            result.data = { id: foundPw, name, email };
            res.status(200).send(result);
   });

       
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
router.get("/my", (req, res) => {
    //const { id, pw, name, email, tel } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };

    const pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/;
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const telReg = /^[0-9]{11}$/;

    try {
        if (!req.session.user) {
            result.message = "로그인 되어 있지 않음";            
            return res.status(401).send(result);
        }
        const selectSql = "SELECT * FROM user WHERE idx =?";
        connection.query(selectSql, [req.session.user.idx], (err, rows) => {
            if (err) {
                console.error('정보 불러오기 오류: ', err);
                result.message = '정보 불러오기 실패';
                return res.status(500).send(result);
            }
            const id = rows[0].id;
            const pw = rows[0].pw;
            const email = rows[0].email;
            const name = rows[0].name;
            const address = rows[0].address;
            const birth = rows[0].birth;
            const gender = rows[0].gender;

            result.success = true;
            result.message = "회원정보 불러오기 성공";
            result.data = {
                id: id,
                pw : pw,
                name : name, 
                email : email,
                address : address,
                gender : gender,
                birth : birth
            };

                return res.status(200).send(result);
           

        });

    } catch (error) {
        result.message = "회원정보 불러오기 오류 발생";
        res.status(500).send(result);
    }
});


// 회원정보 수정 API

router.put("/my", (req, res) => {
    const { pw, confirmPw, email, tel, birth, gender, address } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };

    const pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/;
    const emailReg = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const telReg = /^[0-9]{11}$/
    //유효성 관련 변수

    try{

        if(!req.session.user){
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
        if(!pwReg.test(confirmPw)){
            result.message = "비밀번호 불일치"
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

        const updateSql = "UPDATE user SET pw = ?, email = ?, tel = ?, gender = ?, address = ?, birth = ? WHERE idx = ?";
        connection.query(updateSql, [pw, email, tel, gender, address, birth , req.session.user.idx], (err, rows) => {
            if (err) {
                console.error('정보 수정 오류: ', err);
                result.message = '정보 수정 실패';
                return res.status(500).send(result);
            }
            result.success = true;
            result.message = "회원정보 수정 성공";
            result.data = {
                id: req.session.user.id,
                pw : pw,
                name : req.session.user.name, 
                email : email,
                address : address,
                gender : gender,
                birth : birth
            };

                return res.status(200).send(result);
        
        });

    }
    catch(error){
        result.message = "회원정보 수정 오류 발생"
        res.status(500).send(result)
    }

});

//회원 탈퇴하기
router.delete("/my", async (req, res) => {

    const result = {
        success: false,
        message: '',
        data: null,
    };

    try {
        if (!req.session.user) {
            result.message = "로그인 되어 있지 않음";
            return res.status(401).send(result);
        }

        // // 현재 로그인된 사용자와 삭제하려는 사용자의 idx가 일치하는지 확인
        // if (req.session.user.idx !== Number(userIdx)) {
        //     result.message = "자신의 계정만 삭제할 수 있습니다.";
        //     return res.status(403).send(result);
        // }

        const deleteSql = "DELETE FROM user WHERE idx = ?";
        await connection.query(deleteSql, req.session.user.idx );

        // 세션 정보 삭제
        req.session.destroy((err) => {
            if (err) {
                console.error('세션 삭제 오류: ', err);
            }
        });

        result.success = true;
        result.message = "회원정보 삭제 성공";
        return res.status(200).send(result);
    } catch (error) {
        console.error('회원정보 삭제 오류: ', error);
        result.message = "회원정보 삭제 오류 발생";
        return res.status(500).send(result);
    }
});

module.exports = router //이렇게 export를 적어야 import 가능함.

