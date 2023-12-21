const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'Sohyunxxi',
    password: '1234',
    database: 'week6'
});

module.exports = connection;
