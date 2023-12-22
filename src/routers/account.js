const validator = require('../modules/accountValidator');
const router = require("express").Router()
const mysql = require('mysql');
const path = require("path")

const connection = require('../config/mysql');
const loginCheck = require('../middleware/loginCheck');

// 회원정보 불러오기
// 회원정보 수정
// 회원 탈퇴
// 로그인
// 로그아웃
// 아이디 찾기
// 비밀번호 찾기

// 제대로 된 입력을 받지 않고 아예 생뚱맞은 걸 입력한 경우 예외처리

router.post('/login', (req, res, next) => {
    try {
        const { id, pw } = req.body;
            
        const result = {
            success: false,
            message: '로그인 실패',
            data: null,
        };

        if (!validator.idValidator(id)) {
            return next({
                message: '아이디는 6자리 이상 12자리 이하의 영어와 숫자 조합으로 작성해주세요.',
                status: 400
            });
        }

        if (!validator.pwValidator(pw)) {
            return next({
                message: '비밀번호는 6자리 이상 16자리 이하의 영어, 숫자, 특수문자 조합으로 작성해주세요.',
                status: 400
            });
        }

        const selectSql = 'SELECT * FROM user WHERE id = ? AND pw = ?';

        connection.query(selectSql, [id, pw], (err, rows) => {
            if (err) {
                console.log('로그인 오류: ', err); 

                const loginError = {
                    status: 500,
                    message: '로그인 실패'
                };

                return next(loginError);
            }

            if (rows.length === 0) {
                return next( {
                    message : '해당하는 아이디가 없습니다.',
                     status : 400
                });
            }

            const userDataFromDB = rows[0];
            result.success = true;
            result.message = '로그인 성공';

            result.data = {
                userId: userDataFromDB.id,
                userPw: userDataFromDB.pw,
            };

            req.session.user = userDataFromDB;
            
            // 여기서 로그인 성공 시 클라이언트에게 응답
            res.status(200).send(result);
        });

    } catch (error) {
        next(error);
    }
});




// 로그아웃 API
router.post('/logout', loginCheck, (req, res, next) => {
    const result = {
        success: false,
        message: ''
    };

    try {
        // 세션 파기 (로그아웃)
        req.session.destroy((err) => {
            if (err) {
                console.log('로그아웃 오류: ', err); 

                const logoutError = {
                    status: 500,
                    message: '로그아웃 실패'
                };

                return next(logoutError);
                
            } else {
                result.success = true;
                result.message = '로그아웃 성공';
                res.status(200).send(result);
            }
        });
    } catch (error) {
        next(error);
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
        if (!validator.nameValidator(name)){
            return next({
                message : "유효한 이름 작성 양식이 아님",
                status : 400
            })
        } 
        if (!validator.emailValidator(email)) {
           return next({
                message : "유효한 이메일 작성 양식이 아님",
                status : 400
           })
        }

        // 아이디 찾기 쿼리
        const selectSql = "SELECT id FROM user WHERE name = ? AND email = ?";
        connection.query(selectSql, [name, email], (err, rows) => {
            if (err) {
                console.error('아이디 찾기 오류: ', err);
                return next({
                    message : "아이디 찾기 오류",
                    status : 500
                });
            }

            if (rows.length === 0) {
                return next({
                    message : "일치하는 정보 없음",
                    status : 404
                });
            }
            const foundId = rows[0].id;
            result.success = true;
            result.message = `아이디찾기 성공, 아이디는 ${foundId} 입니다.`;
            result.data = { id: foundId, name, email };
            res.status(200).send(result);
        });

    } catch (error) {
       next(error);
    }
});


//pw 찾기
router.get("/findpw", (req,res,next) => {
    const { name, email, id } = req.body

    const result = {
        "success" : false, 
        "message" : "",
        "data" : null 
    }
    try{
        if (!validator.nameValidator(name)) next({
            message : "유효한 이름 입력 양식이 아님",
            status : 400
        })
        
        if (!validator.emailValidator(email)) next({
            message : "유효한 이메일 입력 양식이 아님",
            status : 400
        })
        
        if (!validator.idValidator(id)) next({
            message : "유효한 아이디 입력 양식이 아님",
            status : 400
        })
        
        // 아이디 찾기 쿼리
        const selectSql = "SELECT pw FROM user WHERE name = ? AND email = ? AND id = ?";
        connection.query(selectSql, [name, email, id], (err, rows) => {
            if (err) {
                console.error('비밀번호 찾기 오류: ', err);
                return next({
                    message : "비밀번호 찾기 실패",
                    status : 500
                });

            }

            if (rows.length === 0) {
                return next({
                    message : "일치하는 정보 없음",
                    status : 404
                });                

            }

            const foundPw = rows[0].pw;
            result.success = true;
            result.message = `비밀번호 찾기 성공, 비밀번호는 ${foundPw} 입니다.`;
            result.data = { id: foundPw, name, email };
            res.status(200).send(result);
   });

       
    } catch (error){
       next(error);
    }
})


//------회원 관련 API-------


// 회원가입 API -> 더 나은 구조 생각해보기.
// 주소를 입력하지 않아도 그냥 넘어가는 이유??

router.post("/", (req, res, next) => {
    const { id, pw, confirmPw, name, email, tel, birth, address, gender } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };  

    try{
        if (!validator.nameValidator(name)) {
            return next({
                message : "유효하지 않은 이름 입력 양식",
                status : 400
            })
        }
        
        if (!validator.emailValidator(email)) {
            return next({
                message : "유효하지 않은 이메일 입력 양식",
                status : 400
            })
            
        }
        if (!validator.idValidator(id)) {
            return next({
                message : "유효하지 않은 아이디 입력 양식",
                status : 400
            })
        }
        
        if (!validator.telValidator(tel)) {
            return next({
                message : "유효하지 않은 전화번호 입력 양식",
                status : 400
            })
        }
        
        if (!validator.pwValidator(pw)) {
            return next({
                message : "유효하지 않은 비밀번호 입력 양식",
                status : 400
            })
        }
        
        if (!validator.pwValidator(confirmPw)) {
            return next({
                message : "유효하지 않은 확인 비밀번호 입력 양식",
                status : 400
            })
        }
        
        if (!validator.birthValidator(birth)){
            return next({
                message : "유효하지 않은 생일 입력 양식",
                status : 400
            })
        }
        
        if (!validator.genderValidator(gender)){
            return next({
                message : "유효하지 않은 성별 입력 양식",
                status : 400
            })
        }
        if (!validator.addressValidator(address)) { // 거쳐지지 않는 이유?
            return next({
                message : "유효하지 않은 주소 입력 양식",
                status : 400
            })    
        }
        if(confirmPw !== pw) {
            return next({
                message : "비밀번호 불일치",
                status : 400
            })
        }
        // 중복 확인
    
        const checkIdDuplicate = "SELECT * FROM user WHERE id = ?";
        connection.query(checkIdDuplicate, [id], (err, idRows) => {
            if (err) {
                console.error('회원가입 오류 - 아이디 중복: ', err);
                return next({
                    success: false,
                    message: '회원가입 실패 - 아이디 중복',
                    data: null,
                });
               
            }
    
            if (idRows.length > 0) {
                return next({
                    success: false,
                    message: "아이디가 이미 사용 중입니다.",
                    data: null
                });
            }

                const checkEmailDuplicate = "SELECT * FROM user WHERE email = ?";
                connection.query(checkEmailDuplicate, [email], (err, rows) => {
                    if (err) {
                        console.error('회원가입 오류 - 이메일 중복: ', err);
                        return next({
                            success: false,
                            message: '회원가입 실패 - 이메일 중복',
                            data: null,
                        });
                    
                    }
            
                    if (rows.length > 0) {
                        return next({
                            success: false,
                            message: "이메일이 이미 사용 중입니다.",
                            data: null
                        });
                    }

                       
                
                    // 회원가입 쿼리
                    const insertSql = "INSERT INTO user (name, id, pw, email, birth, tel, address, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    connection.query(insertSql, [name, id, pw, email, birth, tel, address, gender], (err) => {
                        if (err) {
                            console.error('회원가입 오류: ', err);
                            return next({
                                message : "회원가입 실패",
                                status : "500"
                            })
            
                        }
            
                        result.success = true;
                        result.message = '회원가입 성공';
                        result.data = { id, name, pw, email, birth, tel, gender, address };
                        res.status(200).send(result);
                    })
             
                });
        });
    }
    catch(error){
        next(error);
    }

});



// 회원정보 보기 API
router.get("/my", loginCheck, (req, res, next) => {

    const result = {
        success: false,
        message: '',
        data: null,
    };

    try {
        const selectSql = "SELECT id, pw, email, name, address, birth, gender FROM user WHERE idx =?";
        connection.query(selectSql, [req.session.user.idx], (err, rows) => {
            if (err) {
                console.error('정보 불러오기 오류: ', err);
                return next({
                    message : "정보 불러오기 실패",
                    status : 500
                })

            }
            result.success = true;
            result.message = "회원정보 불러오기 성공";
            result.data = rows[0];
            
            return res.status(200).send(result);
           
        });

    } catch (error) {
        result.message = "회원정보 불러오기 오류 발생";
        res.status(500).send(result);
    }
});


// 회원정보 수정 API -> 주소 부분에서 계속 오류?
// 한번 정보수정 한 뒤에 다시 정보수정 할려고 하면 주소 부분에서 오류가 있다고 함.
// next를 계속 연달아서 써서??

router.put("/my", loginCheck,(req, res, next) => {
    const { pw, confirmPw, tel, birth, gender, address } = req.body;

    const result = {
        success: false,
        message: '',
        data: null,
    };

    try{
        
        if(!validator.pwValidator(pw)){
            return next({
                message : "비밀번호 입력 양식 오류",
                status : 400
            }) 
        }  
        
        if(!validator.pwValidator(confirmPw)) {
            return next({
            message : "재확인 비밀번호 입력 양식 오류",
            status : 400
            
        })  
    }        
        
        if(!validator.telValidator(tel)) {
           return  next({
            message : "전화번호 입력 양식 오류",
            status : 400
        })   
    }            
        
        if(confirmPw!== pw) 
        { return  next({
            message : "비밀번호 불일치",
            status : 400
        })  }
      
        
        if(!validator.birthValidator(birth)) 
        {
            return next({
                message : "생일 입력 양식 오류",
                status : 400
            })    
        }    
        if(!validator.genderValidator(gender)) {
            return next({
                message : "성별 입력 양식 오류",
                status : 400
            }) 
        }       
        if(!validator.addressValidator(address)) {
            return next({
                message : "주소 입력 양식 오류",
                status : 400
            })        
        }
        const updateSql = "UPDATE user SET pw = ?, tel = ?, gender = ?, address = ?, birth = ? WHERE idx = ?";

        connection.query(updateSql, [pw, tel, gender, address, birth, req.session.user.idx], (err) => {
            const result = {
                success: false,
                message: '',
                data: null,
            };

            if (err) {
                console.error('정보 수정 오류: ', err);
                return next({
                    message : "정보 수정 실패",
                    status : 500
                })

            }

            result.success = true;
            result.message = '회원정보 수정 성공';
            result.data = {
                id: req.session.user.id,
                pw,
                name: req.session.user.name,
                address,
                gender,
                birth,
            };

            return res.status(200).send(result);
        });

    }
    catch(error){
        next(error);
    }

});

//회원 탈퇴하기
router.delete("/my", loginCheck,(req, res, next) => {
    const userIdx = req.session.user.idx
    const result = {
        success: false,
        message: '',
        data: null,
    };

    try {
        // 세션 정보 삭제
        req.session.destroy((err) => {
            if (err) {
                console.error('세션 삭제 오류: ', err);
                return next({
                    message : "세션 삭제 실패",
                    status : 500
                })

            }
        
            // 회원 정보 삭제
            const deleteSql = "DELETE FROM user WHERE idx = ?";
            connection.query(deleteSql, [userIdx], (deleteErr) => {
                if (deleteErr) {
                    console.error('회원 정보 삭제 오류: ', deleteErr);
                    return next({
                        message : '회원 정보 삭제 실패',
                        status : 500
                    })
                   
                }
        
                result.success = true;
                result.message = '회원정보 삭제 성공';
                return res.status(200).send(result);
            });
        });
        
    } catch (error) {
        console.error('회원정보 삭제 오류: ', error);
        return next({
            message : "회원정보 삭제 오류 발생",
            status : 500
        })

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