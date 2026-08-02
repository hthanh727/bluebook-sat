require('dotenv').config();
const mysql = require('mysql2/promise');
const { SAT_QUESTIONS, SAT_MATH_QUESTIONS } = require('./questions.js');
const fs = require('fs');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
});

async function initDB() {
    try {
        console.log('Connecting to database...');
        
        // 1. Create DB and tables using database.sql
        const sqlSchema = fs.readFileSync('database.sql', 'utf8');
        
        // Before running schema, let's select the database if it exists, or create it.
        await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'bluebook_db'}`);
        await pool.query(`USE ${process.env.DB_NAME || 'bluebook_db'}`);
        
        // We will drop existing tables to ensure a clean slate since this is a dev/learning project
        console.log('Dropping existing tables to apply new schema...');
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('DROP TABLE IF EXISTS progress, questions, tests, users');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Running database.sql...');
        await pool.query(sqlSchema);
        
        // 2. Insert Test 1 (Reading)
        console.log('Inserting Reading Test...');
        const [readRes] = await pool.query("INSERT INTO tests (title, type) VALUES ('Digital SAT Practice Test 1 - Reading', 'reading')");
        const readTestId = readRes.insertId;

        // Insert reading questions
        for (let i = 0; i < SAT_QUESTIONS.length; i++) {
            const q = SAT_QUESTIONS[i];
            await pool.query(
                "INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    readTestId,
                    i + 1,
                    q.passage || null,
                    q.prompt || '',
                    JSON.stringify(q.options || []),
                    q.answer || 0,
                    i < 27 ? 1 : 2 // Module 1 for first half, Module 2 for second half
                ]
            );
        }

        // 3. Insert Test 2 (Math)
        console.log('Inserting Math Test...');
        const [mathRes] = await pool.query("INSERT INTO tests (title, type) VALUES ('Digital SAT Practice Test 1 - Math', 'math')");
        const mathTestId = mathRes.insertId;

        // Insert math questions
        for (let i = 0; i < SAT_MATH_QUESTIONS.length; i++) {
            const q = SAT_MATH_QUESTIONS[i];
            await pool.query(
                "INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    mathTestId,
                    i + 1,
                    q.passage || null,
                    q.question || q.prompt || '', // Math questions use 'question' in questions.js
                    JSON.stringify(q.options || []),
                    q.answer || 0,
                    i < 22 ? 1 : 2
                ]
            );
        }

        console.log('Database initialized successfully with test data and admin user!');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDB();
