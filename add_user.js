const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function addUser() {
    console.log('Connecting to Aiven MySQL...');
    const aivenDb = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    });

    const email = 'infinityxbirdyy@gmail.com';
    const rawPass = 'lngocc2008';
    const role = 'admin';
    const name = 'Admin User';
    const status = 'active';

    try {
        console.log(`Hashing password for ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPass, salt);

        console.log('Inserting into database...');
        await aivenDb.query(
            'INSERT INTO users (email, password, role, name, status) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, role, name, status]
        );
        console.log('User inserted successfully!');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.log('User already exists!');
        } else {
            console.error('Error inserting user:', err);
        }
    } finally {
        await aivenDb.end();
    }
}

addUser().catch(console.error);
