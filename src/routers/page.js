const router = require("express").Router()
const path = require("path")

router.get("/",(req,res)=>{
    //res.sendFile(`${__dirname}/public/index.html`)
    res.sendFile(path.join(__dirname, "../../public/index.html"))
})

router.get("/loginPage",(req,res)=>{
    //res.sendFile(`${__dirname}/public/login.html`)
    res.sendFile(path.join(__dirname, "../../public/login.html"))

})

module.exports = router
//    res.sendFile(`${__dirname}/public/login.html`) 현재 위치까지의..
