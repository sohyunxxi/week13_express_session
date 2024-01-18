const loginCheck = (req, res, next) => {
    if (!req.session.user) { 
        return next({
            message: "로그인 상태가 아닙니다.",            
            status: 401
        });
    }

    req.user = req.session.user;
    next();
};

module.exports = loginCheck;