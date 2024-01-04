const isBlank = (...items) => {
    return (req, res, next) => {
        const blank = [];

        items.forEach(item => {
            if (!req.body[item]) {
                blank.push(item);
            }
        });

        if (blank.length > 0) {
            return next({
                message: `필수 항목인 [${blank.join(', ')}]이(가) 누락되었습니다.`,
                status: 400
            });
        }

        next();
    };
};

module.exports = isBlank;
