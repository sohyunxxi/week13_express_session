// const client = require("mongodb").MongoClient
// client.connect()
// 위 방식은 모듈이 생성될 때마다 새로운 클라이언트 생성

const { MongoClient } = require("mongodb")

const client = new MongoClient("mongodb://localhost:27017")
client.connect()
module.exports = client
//아래 방식은 미리 만들어두고 여러 파일에서 공유해서 사용 -> 더 효율적
