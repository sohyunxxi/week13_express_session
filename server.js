//==========package============
const express=require("express")

//======Init========
const app = express()
const port = 8000


//======Apis========

app.get("/",(req,res)=>{
    res.sendFile(`${__dirname}/public/index.html`)
})

app.get("/loginPage",(req,res)=>{
    res.sendFile(`${__dirname}/public/login.html`)

})

app.get("/account",(req,res)=>{
    res.sendFile(`${__dirname}/public/login.html`)
    const {idx} = req.body

    const result={
        "success":false,
        "message":"",
        "data":null
    }
    // DB 통신

    // DB 통신 결과 처리
    result.success=true
    result.data={}

    //값 반환
    res.send(result)
})
app.post("/account",(req,res)=>{
    res.sendFile(`${__dirname}/public/login.html`)
    const {id,pw,name}=req.body

})
app.put("/account",(req,res)=>{
    res.sendFile(`${__dirname}/public/login.html`)
    const id = req.body.id

})
app.delete("/account",(req,res)=>{
    res.sendFile(`${__dirname}/public/login.html`)

})

//======Web Server======
app.listen(port, ()=>{
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})

