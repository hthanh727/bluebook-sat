require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function importFromJSON() {
    const jsonPath = path.join(__dirname, '..', 'question', 'Reading', 'Transitions.json');
    const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Loaded ${questions.length} questions from JSON.`);

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [testRows] = await pool.query(
            "SELECT id FROM tests WHERE title = 'Transitions' AND type = 'topic'"
        );
        let testId;
        if (testRows.length > 0) {
            testId = testRows[0].id;
        } else {
            const [res] = await pool.query(
                "INSERT INTO tests (title, type, difficulty, allow_practice) VALUES ('Transitions', 'topic', 'Medium', 1)"
            );
            testId = res.insertId;
        }
        console.log('Test ID:', testId);

        await pool.query("DELETE FROM questions WHERE test_id = ?", [testId]);
        console.log('Deleted old questions.');

        // Bulk insert using pool.query with nested array
        const values = questions.map(q => [
            testId,
            q.question_number,
            q.passage,
            q.prompt,
            JSON.stringify([q.option_a, q.option_b, q.option_c, q.option_d]),
            q.correct_answer_index,
            1,
            null,
            'mcq',
            'reading',
            'Expression of Ideas',
            'Medium'
        ]);

        const sql = `INSERT INTO questions 
            (test_id, question_number, passage, prompt, options, correct_answer_index, module, image_url, question_type, section, domain, difficulty) 
            VALUES ?`;
        
        console.log('Inserting bulk questions...');
        const [result] = await pool.query(sql, [values]);
        console.log(`🎉 Successfully bulk inserted ${result.affectedRows} questions!`);

        const [verify] = await pool.query("SELECT COUNT(*) as count FROM questions WHERE test_id = ?", [testId]);
        console.log(`Verified count in DB: ${verify[0].count}`);

    } catch (e) {
        console.error('Import error:', e);
    } finally {
        await pool.end();
    }
}

importFromJSON();
