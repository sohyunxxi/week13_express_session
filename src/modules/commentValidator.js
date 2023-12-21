const contentValidator = (content) => {
    if (!content || content.trim() === "") {
        return false; // 빈 값이면 유효성 실패
    }
    else{
        return true;
    }
};
  
module.exports = {
    contentValidator
};
  