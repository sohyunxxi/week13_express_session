//==========package============//예외처리를 모듈화해서 밖으로 빼기 (유효성 모듈)
const express=require("express")
const session = require("express-session")//
const mysql = require("mysql");

//======Init========
const app = express()
const port = 8000

const connection = mysql.createConnection({
    host: 'localhost', 
    port: 3306,
    user: 'Sohyunxxi', 
    password: '1234',
    database:"week6"
});

const sessionStore = new session.MemoryStore();

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
app.use("/post",postApi)

const commentApi = require("./src/routers/comment")
app.use("/comment",commentApi)

//======Web Server======
app.listen(port, ()=>{
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})

connection.connect((err) => {
    if (err) {
      console.error('MySQL 연결 실패: ' + err.stack);
      return;
    }
    console.log('MySQL에 연결되었습니다. 연결 ID: ' + connection.threadId);
  });