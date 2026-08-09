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
        const [rows] = await pool.query("SELECT id, test_id, question_number, prompt, image_url FROM questions WHERE prompt LIKE '%is parallel to line%' LIMIT 5");
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
main();
