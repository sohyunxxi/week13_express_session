//==========package============//예외처리를 모듈화해서 밖으로 빼기 (유효성 모듈)
const express=require("express")
const session = require("express-session")//
const maria = require("mysql");

//======Init========
const app = express()
const port = 8000
maria.connect();

var connection = mysql.createConnection({
    host: '3.35.27.154', 
    port: 8000,
    user: 'Sohyunxxi', 
    password: '1234',
    connectionLimit: 5,
    database:"week6"
});

const sessionObj = {
  secret: 'session',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,

};

app.use(express.json()) //json 가지고 통신할 수 있게 해주는 설정. -> 받아온 값을 다시 json으로 바꾸는 등등..
app.use(session(sessionObj)); //모든 url에 접근시 적용
//======Apis========

 // 정상적으로 파일분할.
const accountApi = require("./src/routers/account")
app.use("/account", accountApi)

const postApi = require("./src/routers/post")
app.use("/",postApi)

const commentApi = require("./src/routers/comment")
app.use("/",commentApi)

//======Web Server======
app.listen(port, ()=>{
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})

