const idValidator = (id) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(id);
const pwValidator = (pw) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{6,16}$/.test(pw);
const nameValidator = (name) => /^[a-zA-Z가-힣]{2,50}$/.test(name);
const emailValidator = (email) => /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const telValidator = (tel) => /^[0-9]{11}$/.test(tel);
const birthValidator = (birth) => /^\d{8}$/.test(birth);
const genderValidator = (gender) => /^(남성|여성)$/.test(gender);

module.exports = {
  idValidator,
  pwValidator,
  nameValidator,
  emailValidator,
  telValidator,
  birthValidator,
  genderValidator,
};
