const postgresql = require("../config/postgresql")

const queryConnect = async (sql, params) => {
    let client
    try {
        const pool = await postgresql()
        client = await pool.connect()
        const result = await client.query(sql, params)
        return result.rows
    } finally {
        if (client) {
            client.release()
        }
    }
}

module.exports = queryConnect

