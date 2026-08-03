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
        await pool.query('ALTER TABLE users ADD COLUMN name VARCHAR(255) DEFAULT "Học sinh"');
        console.log("Added name column to users.");
        await pool.query('UPDATE users SET name = "Nguyễn Văn A" WHERE email = "hocsinh1@gmail.com"');
        await pool.query('UPDATE users SET name = "Admin" WHERE role = "admin"');
        console.log("Updated sample users.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column name already exists.");
        } else {
            console.error(e);
        }
    } finally {
        pool.end();
    }
}
main();
