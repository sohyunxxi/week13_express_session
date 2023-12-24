const { Pool } = require('pg');

const pool = new Pool({
    user: 'your_user',
    host: 'your_host',
    database: 'your_database',
    password: 'your_password',
    port: 5432, // PostgreSQL 기본 포트
});