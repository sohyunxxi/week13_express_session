const idValidator = (req, res, next) => {
    const { id } = req.body;

    if (!id || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(id)) {
        return next({
            message: '아이디 입력 양식 틀림.',
            status: 400,
        });
    }

    next();
};

const pwValidator = (req, res, next) => {
    const { pw } = req.body;

    if (!pw || !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/.test(pw)) {
        return next({
            message: '비밀번호는 6자리 이상 16자리 이하의 영어, 숫자, 특수문자 조합으로 작성해주세요.',
            status: 400,
        });
    }

    next();
};

const nameValidator = (req, res, next) =>{
    const { name } = req.body;
    if(!name || !/^[a-zA-Z가-힣]{2,50}$/.test(name)){
        return next({
            message :'이름 양식 틀림',
            status  : 400
        });
    }
    next();
}

const emailValidator = (req, res, next) =>{
    const { email } = req.body;
    if(!email || !/^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)){
        return next({
            message : '이메일 양식 틀림',
            status : 400
        })
    }
    next();
}

const telValidator = (req, res, next) =>{
    const { tel } = req.body;
    if(!tel || !/^[0-9]{11}$/.test(tel)){
        return next({
            message : '전화번호 양식 틀림',
            status : 400
        })
    }
    next();
}

const birthValidator = (req, res, next) =>{
    const { birth } = req.body;
    if(!birth || !/^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/.test(birth)){
        return next({
            message : '생일 양식 틀림',
            status : 400
        })
    }
    next();
}

const genderValidator = (req, res, next) =>{
    const { gender } = req.body;
    if(!gender || !/^(1|2)$/.test(gender)){
        return next({
            message : '성별 양식 틀림',
            status : 400
        })
    }
    next();
}

const addressValidator = (req, res, next) =>{
    const { address } = req.body;
    if(!address || !/^(?![\s]+$)[가-힣a-zA-Z\s]{2,}$/.test(address)){
        return next({
            message : '주소 양식 틀림',
            status : 400
        })
    }
    next();
}

module.exports = {
  idValidator,
  pwValidator,
  nameValidator,
  emailValidator,
  telValidator,
  birthValidator,
  genderValidator,
  addressValidator
};
