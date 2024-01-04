const { MongoClient } = require('mongodb');

const connectToMongo = async () => {
    const client = new MongoClient("mongodb://localhost:27017");

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db("week15");
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

module.exports = connectToMongo;

//api를 여러번 연결하다 보면 중간에 postman이 가져오지 못하는 오류??

