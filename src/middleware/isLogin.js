const isLogin = (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return next({
                message: '토큰이 없습니다.',
                status: 401,
            });
        }

        const decoded = jwt.verify(token, SECRET_KEY);

        // 토큰이 유효하면 사용자 정보를 세션에 저장
        req.session.isLoggedIn = true;
        req.session.user = decoded;

        next();
    } catch (error) {
        console.error('isLogin 미들웨어 오류:', error);
        return next({
            message: '로그인 상태 확인 중 오류 발생',
            status: 401,
        });
    }
};