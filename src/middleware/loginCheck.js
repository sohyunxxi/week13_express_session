const jwt = require('jsonwebtoken');

const loginCheck = (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return next({
            message: '로그인 상태가 아닙니다.',
            status: 401
        });
    }

    // 토큰이 유효한지 검증
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return next({
                message: '토큰 검증 실패',
                status: 401
            });
        }

        req.user = decoded; // 토큰에서 해독한 정보를 req.user에 저장
        next();
    });
};

module.exports = loginCheck;
