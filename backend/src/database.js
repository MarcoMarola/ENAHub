
const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: process.env.DB_SSL === 'true'
        ? {
            ca: process.env.DB_SSL_CA?.replace(/\\n/g, '\n'),
            rejectUnauthorized: true
        }
        : undefined
});

module.exports = connection;
