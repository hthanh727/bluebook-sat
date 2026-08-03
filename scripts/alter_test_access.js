require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bluebook_db',
    port: process.env.DB_PORT || 3306
});

async function run() {
    try {
        console.log('Creating test_locks table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS test_locks (
                test_id INT NOT NULL,
                user_id INT NOT NULL,
                PRIMARY KEY (test_id, user_id),
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Successfully created test_locks table.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        process.exit(0);
    }
}

run();
