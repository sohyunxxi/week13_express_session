const { idReq, pwReq, nameReq, emailReq, birthReq, telReq, genderReq, addressReq } = require("./patterns");

const checkPattern = (...items) => {
    return (req, res, next) => {
        for (const item of items) {
            const value = req.body[item];
            const regex = eval(`${item}Req`);

            if (!value || (regex && !regex.test(value))) {
                return next({
                    message: `${item.charAt(0).toUpperCase() + item.slice(1)} 양식 틀림.`,
                    status: 400,
                });
            }
        }
        next();
    };
};

module.exports = checkPattern;
