const mysql = require('mysql2/promise');
require('dotenv').config();

async function addColumn() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bluebook_db',
    });
    
    try {
        await pool.query('ALTER TABLE questions ADD COLUMN image_url VARCHAR(255) DEFAULT NULL');
        console.log("Column added successfully!");
    } catch(err) {
        if(err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
        } else {
            console.error(err);
        }
    } finally {
        pool.end();
    }
}
addColumn();
