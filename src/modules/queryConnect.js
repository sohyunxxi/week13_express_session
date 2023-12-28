

// async function queryConnect(pool, sql, values) {
//     try {
//         const data = await pool.query(sql, values);
//         console.log('SQL 쿼리 수행 성공');
//         return data;
//     } catch (error) {
//         console.error('SQL 쿼리 수행 오류:', error);
//         throw new Error("SQL 쿼리 수행 실패: "+error);
//     }
// }

// module.exports = queryConnect

const pool = require('../config/postgresql');

async function queryConnect(sql, values) {
    try {
        const data = await pool.query(sql, values);
        console.log('SQL 쿼리 수행 성공');
        return data;
    } catch (error) {
        console.error('SQL 쿼리 수행 오류:', error);
        throw new Error("SQL 쿼리 수행 실패: " + error);
    }
}

module.exports = queryConnect;

