const contentValidator = (req, res, next)=>{
    const {content} = req.body;
    if(!content || content.trim() === ""){
        return next({
            message : "내용이 비어있음",
            status : 400
        })
    }
    next();
}

module.exports = contentValidator;

//선언형 코드 
//
