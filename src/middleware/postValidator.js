const titleValidator = (req, res, next)=>{
    const {title} = req.body;
    if(!title || title.trim() === ""){
        return next({
            message : "제목이 비어있음",
            status : 400
        })
    }
    next();
}  

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

module.exports = {
    titleValidator,
    contentValidator,
};
  
