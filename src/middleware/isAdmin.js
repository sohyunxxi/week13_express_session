const isAdmin = (req, res, next) => {
    const isAdmin = req.session.user.isadmin;

    if (!isAdmin) {
        const result = {
            data: null,
            message: "관리자만 로그를 볼 수 있습니다.",
            status: 204
        };
        return res.send(result);
    }

    next(); // 다음 미들웨어 또는 핸들러 호출
};

module.exports = isAdmin;