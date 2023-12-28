const pool = require('../config/postgresql');

async function queryConnect(query) {
    try {
        const data = await pool.query(query);

        console.log('SQL 쿼리 수행 성공');
        return data;
    } catch (error) {
        console.error('SQL 쿼리 수행 오류:', error);
        throw new Error("SQL 쿼리 수행 실패: " + error);
    }
}

module.exports = queryConnect;
