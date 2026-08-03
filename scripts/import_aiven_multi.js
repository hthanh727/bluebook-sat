const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importDb() {
    try {
        console.log('Connecting to Aiven MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('Reading bluebook_db_clean.sql...');
        const sql = fs.readFileSync('bluebook_db_clean.sql', 'utf8');

        console.log('Executing via multipleStatements...');
        await connection.query(sql);
        console.log('Done!');
        await connection.end();
    } catch (error) {
        console.error('Error importing database:', error);
    }
}

importDb();
