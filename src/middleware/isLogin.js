const isLogin = (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return next({
                message: '토큰이 없습니다.',
                status: 401,
            });
        }

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return next({
                    message: '토큰 검증 실패',
                    status: 401,
                });
            }

            req.user = decoded; // 토큰에서 해독한 정보를 req.user에 저장
            next();
        });
    } catch (error) {
        console.error('isLogin 미들웨어 오류:', error);
        return next({
            message: '로그인 상태 확인 중 오류 발생',
            status: 401,
        });
    }
};

module.exports = isLogin;
