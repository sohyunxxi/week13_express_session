const validator = require('../modules/accountValidator');
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


// 회원가입
// 회원정보 불러오기
// 회원정보 수정
// 회원 탈퇴
// 로그인
// 로그아웃
// 아이디 찾기
// 비밀번호 찾기

router.post('/login', (req, res, next) => {
    try {
            const { id, pw } = req.body;
            const result = {
                success: false,
                message: '로그인 실패',
                data: null,
            };

        if (!id || id === "" || id === undefined) throw new Error('아이디 값이 없습니다.');

        if (!pw || pw === "" || pw === undefined) throw new Error('비밀번호 값이 없습니다.');

        if (!validator.idValidator(id)) throw new Error('아이디는 6자리 이상 12자리 이하의 영어와 숫자 조합으로 작성해주세요.');

        if (!validator.pwValidator(pw)) throw new Error('비밀번호는 6자리 이상 16자리 이하의 영어, 숫자, 특수문자 조합으로 작성해주세요.');


        const selectSql = 'SELECT * FROM user WHERE id = ? AND pw = ?';

        connection.query(selectSql, [id, pw], (err, rows) => {
            if (err) {
                console.error('로그인 오류: ', err);
                return next(new Error('로그인 실패'));
            }

            if (rows.length === 0) {
                return next(new Error('해당하는 아이디가 없습니다.'));
            }

            const userDataFromDB = rows[0];
            result.success = true;
            result.message = '로그인 성공';

            result.data = {
                userId: userDataFromDB.id,
                userPw: userDataFromDB.pw,
            };

            req.session.user = userDataFromDB;
            res.sendFile(path.join(__dirname, '../../public/mainPage.html'));
        });

    } catch (error) {
        console.error('로그인 실패: ', error.message);
        return next(error);
    }
});


// 로그아웃 API
router.post('/logout', (req, res, next) => {
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
                console.error('로그아웃 오류: ', err);
                return next(new Error('로그아웃 실패'));
            } else {
                result.success = true;
                result.message = '로그아웃 성공';
                res.sendFile(path.join(__dirname, "../../public/index.html"));
            }
        });
    } catch (error) {
        result.message = '로그아웃 오류 발생';
        return next(error);    
    }
});

// id 찾기 API
router.get("/findid", (req, res, next) => {
    const { name, email } = req.body;

    const result = {
        success: false,
        message: "",
        data: null
    };

    try {
        if (!validator.nameValidator(name) || !validator.emailValidator(email)) {
            throw new Error('입력값이 유효하지 않습니다.');
        }

        // 아이디 찾기 쿼리
        const selectSql = "SELECT id FROM user WHERE name = ? AND email = ?";
        connection.query(selectSql, [name, email], (err, rows) => {
            if (err) {
                console.error('아이디 찾기 오류: ', err);
                return next(new Error('아이디 찾기 실패'));

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
        result.message = "아이디 찾기 오류 발생";
        return next(error);
    }
});


//pw 찾기
router.get("/findpw", (req,res,next) => { //다른 방식으로 적기 (/ 사용할것)
    const { name, email, id } = req.body

    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }
    try{

        if (!validator.nameValidator(name)) throw new Error('이름은 영어나 한글로 2~50자리.');
        
        if (!validator.emailValidator(email)) throw new Error('이메일 양식에 맞춰서 작성, ex) kaka1234@gmail.com');
        
        if (!validator.idValidator(id)) throw new Error('아이디는 6자리이상 12자리이하 영어숫자 조합');
        

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
        result.message = "비밀번호 찾기 오류 발생"
        return next(error);
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

    if (!validator.nameValidator(name)) throw new Error('이름은 영어나 한글로 2~50자리.');
    
    if (!validator.emailValidator(email)) throw new Error('이메일 양식에 맞춰서 작성, ex) kaka1234@gmail.com');
    
    if (!validator.idValidator(id)) throw new Error('아이디는 6자리이상 12자리이하 영어숫자 조합');
    
    if (!validator.telValidator(tel)) throw new Error('이름은 영어나 한글로 2~50자리.');
    
    if (!validator.pwValidator(pw)) throw new Error('비밀번호 입력 오류');
    
    if (!validator.pwValidator(confirmPw)) throw new Error('확인 비밀번호 입력 오류');
    
    if (!validator.birthValidator(birth)) throw new Error('생일 입력값 오류');
    
    if (!validator.genderValidator(gender)) throw new Error('성별 입력값 오류');
    
    if( confirmPw !== pw) throw new Error('비밀번호 일치 안함')
    

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

    //유효성 관련 변수
    try{

        if(!req.session.user){
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }

        if (!validator.idValidator(id)) throw new Error('아이디는 6자리이상 12자리이하 영어숫자 조합');
        
        if(!validator.pwValidator(pw)) throw new Error('비밀번호는 6-16자리 영어 숫자 특수기호 조합');      
        
        if(!validator.pwValidator(confirmPw)) throw new Error('비밀번호는 6-16자리 영어 숫자 특수기호 조합');            
        
        if(!validator.telValidator(tel)) throw new Error('전화번호는 11자리 숫자만');           
        
        if(!validator.emailValidator(email)) throw new Error('이메일 양식에 맞춰서 작성, ex) kaka1234@gmail.com');           
        
        if(confirmPw!== pw) throw new Error('비밀번호가 일치하지 않습니다.');            
        

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

        const deleteSql = "DELETE FROM user WHERE idx = ?";
        connection.query(deleteSql, req.session.user.idx );

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

// Error handling middleware
router.use((err, req, res, next) => {
    res.status(400).send({ success: false, message: err.message });
});

module.exports = router //이렇게 export를 적어야 import 가능함.