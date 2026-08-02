const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterDb() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bluebook_db'
    });
    
    try {
        console.log('Modifying tests table...');
        await pool.query("ALTER TABLE tests MODIFY COLUMN type ENUM('reading', 'math', 'full') NOT NULL");
        console.log('tests table updated.');
    } catch (e) {
        console.error('Error on tests table:', e.message);
    }

    try {
        console.log('Modifying questions table...');
        await pool.query("ALTER TABLE questions ADD COLUMN section ENUM('reading', 'math') DEFAULT 'reading'");
        console.log('questions table updated.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('section column already exists.');
        } else {
            console.error('Error on questions table:', e.message);
        }
    }

    pool.end();
}

alterDb();
