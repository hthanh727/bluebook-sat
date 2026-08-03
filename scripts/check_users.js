require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bluebook_db',
    });

    try {
        const [rows] = await pool.query('SELECT id, email, role, name FROM users');
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
main();
