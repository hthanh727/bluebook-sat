require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Connecting to database...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bluebook_db',
        port: process.env.DB_PORT || 3306,
    });

    try {
        // 1. Describe table to check columns
        console.log('Checking users table schema...');
        const [columns] = await pool.query('DESCRIBE users');
        const columnNames = columns.map(c => c.Field);
        console.log('Columns in users table:', columnNames);

        // 2. Prepare user details
        const email = 'vanminhtommy@gmail.com';
        const rawPass = 'student123';
        const role = 'student';
        const name = 'Tommy';
        
        console.log(`Checking if user ${email} already exists...`);
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log(`User ${email} already exists with ID: ${existing[0].id}`);
            return;
        }

        console.log(`Hashing password: ${rawPass}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPass, salt);

        // 3. Build insert query dynamically based on column names
        const userObj = {
            email: email,
            password: hashedPassword,
            role: role,
            name: name
        };
        if (columnNames.includes('status')) {
            userObj.status = 'active';
        }

        const keys = Object.keys(userObj);
        const values = Object.values(userObj);
        const placeholders = keys.map(() => '?').join(', ');

        console.log(`Inserting user ${email}...`);
        const [result] = await pool.query(
            `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`,
            values
        );
        console.log('User inserted successfully with ID:', result.insertId);
        console.log(`Credentials:\nEmail: ${email}\nPassword: ${rawPass}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

main();
