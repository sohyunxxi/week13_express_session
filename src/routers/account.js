const validator = require('../modules/accountValidator');
const router = require("express").Router()
const loginCheck = require('../middleware/loginCheck');
const pool = require('../config/postgresql')
const queryConnect = require('../modules/queryConnect');

// 회원정보 불러오기
// 회원정보 수정
// 회원 탈퇴
// 로그인
// 로그아웃
// 아이디 찾기
// 비밀번호 찾기

// 제대로 된 입력을 받지 않고 아예 생뚱맞은 걸 입력한 경우 예외처리

const { idValidator, pwValidator, nameValidator, emailValidator, genderValidator, birthValidator, addressValidator, telValidator  } = require('../modules/accountValidator');

router.post('/login', idValidator, pwValidator, async (req, res, next) => {
    const { id, pw } = req.body;
    const result = {
        success: false,
        message: '로그인 실패',
        data: null,
    };

    try {
        // DB 통신
        const query = {
            text: 'SELECT * FROM account WHERE id = $1 AND pw = $2',
            values: [id, pw],
        };

        const { rows } = await queryConnect(query);
        
        if (rows.length > 0) {
            result.success = true;
            result.message = '로그인 성공';
            result.data = rows[0];
            req.session.user = rows[0];
        } else {
            result.message = '해당하는 계정이 없습니다.';
        }
    } catch (error) {
        console.error('로그인 오류: ', error);
        result.message = '로그인 오류 발생';
        result.error = error;
        return next(error);
    } finally {
        res.send(result);
    }
});

// 로그아웃 API
router.post('/logout', loginCheck, async (req, res, next) => {
    const result = {
        success: false,
        message: "로그아웃 실패",
        data: null
    };
        req.session.destroy((err) => {
            if (err) {
                return next({
                    status : 500,
                    err
                })
            }
            result.success = true;
            result.message = '로그아웃 성공';
            res.status(200).send(result);
        });
});

//id 찾기
router.get("/findid", nameValidator, emailValidator, async (req, res, next) => {
    const { name, email } = req.body;

    const result = {
        success: false,
        message: "아이디 찾기 실패",
        data: null
    };

    try {
        const query = {
            text: 'SELECT id FROM account WHERE name = $1 AND email = $2',
            values: [name, email],
        };

        const { rows } = await queryConnect(query);

        if (rows.length > 0) {
            const foundId = rows[0].id;
            result.success = true;
            result.message = `아이디 찾기 성공, 아이디는 ${foundId} 입니다.`;
            result.data = { id: foundId, name, email };
        } else {
            result.success = false;
            result.message = "일치하는 정보 없음";
        }

       // 이 위치에서 응답을 보내도록 변경
    } catch (error) {
        result.error = error;
        return next(error);
    }
});




//pw 찾기
router.get("/findpw", nameValidator, emailValidator, idValidator, async (req,res,next) => {
    const { name, email, id } = req.body

    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }

    try{
        const query = {
            text: 'SELECT pw FROM account WHERE name = $1 AND email = $2 AND id = $3',
            values: [name, email, id],
        };
        const { rows } = await queryConnect(query);


        if (rows.length === 0) {
            return next({
                message : "일치하는 정보 없음",
                status : 404
            });                

        }
        else {
            const foundPw = rows[0].pw;
            result.success = true;
            result.message = `비밀번호 찾기 성공, 비밀번호는 ${foundPw} 입니다.`;
            result.data = { pw: foundPw, name, email, id };
        }
    } catch (error) {
        result.message = error.message;
    } finally { 
        res.send(result);
    }
});

// 회원가입 API -> 더 나은 구조 생각해보기.
// 주소를 입력하지 않아도 그냥 넘어가는 이유??
router.post("/", nameValidator, emailValidator, idValidator, telValidator, pwValidator, birthValidator, genderValidator, addressValidator, async (req, res, next) => {
    const { id, pw, name, email, tel, birth, address, gender } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };

    try {
        const selectQuery = {
            text: 'SELECT * FROM account WHERE id = $1 OR email = $2',
            values: [id, email],
        };
        const { rows } = await queryConnect(selectQuery);


        if (rows.length > 0) {
            result.success = false;
            result.message = "이미 사용 중";
        } else {
            const insertQuery = {
                text: 'INSERT INTO account (name, id, pw, email, birth, tel, address, gender) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                values: [name, id, pw, email, birth, tel, address, gender],
            };
            const { rows } = await queryConnect(insertQuery);

            if(rows.length>0){

                result.success=true
                result.data= rows
            }
            else{
                result.success=true
                result.message = "회원 가입 성공"
            }
        } 
    }
    catch(e){
        result.message=e.message
        console.log(e)
    } finally{
        res.send(result) 
    }  
})

    


// 회원정보 보기 API
router.get("/my", loginCheck, async (req, res, next) => {
    const userIdx = req.session.user.idx
    const result = {
        success: false,
        message: '',
        data: null,
    };

    try {
        const query = {
            text: 'SELECT id, pw, email, name, address, birth, tel, gender FROM account WHERE idx =$1',
            values: [userIdx],
        };
        const { rows } = await queryConnect(query);


        if(rows.length>0){
            result.success = true;
            result.message = "회원정보 불러오기 성공";
            result.data = rows;
        }
        else{
            result.success=true
            result.message = "해당 계정 없음"
        }

    } catch (error) {
        result.message=error.message
    } finally{
        res.send(result) 
    }
    
});

// 회원정보 수정 API

router.put("/my", loginCheck, pwValidator, telValidator, birthValidator, genderValidator, addressValidator, async (req, res, next) => {
    const { pw, tel, birth, gender, address } = req.body;
    const userIdx = req.session.user.idx
    const result = {
        success: false,
        message: '',
        data: null,
    };
    try{ 
        const query = {
            text: 'UPDATE account SET pw = $1, tel = $2, gender = $3, address = $4, birth = $5 WHERE idx = $6',
            values: [pw, tel, gender, address, birth, userIdx],
        };

        const { rowCount } = await queryConnect(query);

        if(rowCount.length == 0){

            result.message = "회원정보 수정 실패"
            console.error("회원정보 수정 실패: 데이터 없음", data);
        }
        else{
            result.success = true
            result.data = [pw, tel, gender, address, birth]
            result.message = "회원정보 수정 성공"
        }

    }
    catch(error){
        result.message=error.message
    } finally{
        res.send(result) 
    }
    
})

router.delete("/my", loginCheck, async (req, res, next) => {
    const userIdx = req.session.user.idx;
    const result = {
        success: false,
        message: '',
        data: null,
    };

    try {
        // 세션 정보 삭제 => eq.session.destroy 함수는 콜백 기반의 함수,직접 await를 사용할 수 없음
        // 그러나 Promise를 반환하도록 감싸주면 await를 사용 가능
        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    console.error('세션 삭제 오류: ', err);
                    reject({
                        message: "세션 삭제 실패",
                        status: 500
                    });
                } else {
                    resolve();
                }
            });
        });
        const query = {
            text: 'DELETE FROM account WHERE idx = $1',
            values: [userIdx],
        };
        const { rowCount } = await queryConnect(query);


        if (rowCount > 0) {
            result.success = true;
            result.data = rowCount;
            result.message = '회원정보 삭제 성공';
        } else {
            result.success = false;
            result.message = "회원정보 삭제 실패: 해당하는 사용자 없음";
        }

        res.status(200).send(result);
    } catch (error) {
        result.error = error;
        return next(error);
    } finally {
        if (!pool.ended) {
            await pool.end();
        }
        console.log("종료됨")
    }
});


router.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        success: false,
        message: err.message || '서버 오류',
        data: null,
    });
});

module.exports = router