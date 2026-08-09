require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bluebook_db',
        port: process.env.DB_PORT || 3306,
    });

    try {
        const [rows] = await pool.query('SELECT * FROM progress LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
main();
