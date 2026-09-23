require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
    const jsonPath = path.join(__dirname, '..', 'question', 'Reading', 'Transitions.json');
    const rawQuestions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const backupPath = path.join(__dirname, '..', 'backup_all_tests.json');
    let backup = { tests: [], questions: [] };
    if (fs.existsSync(backupPath)) {
        backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    }

    console.log(`Loaded ${rawQuestions.length} questions from Transitions.json`);
    console.log(`Current backup has ${backup.tests.length} tests and ${backup.questions.length} questions.`);

    let testId = 43;

    // Check DB
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            connectTimeout: 5000
        });

        const [testRows] = await pool.query("SELECT * FROM tests WHERE title = 'Transitions' OR id = 43");
        console.log('DB tests found:', testRows);
        if (testRows.length > 0) {
            testId = testRows[0].id;
        } else {
            const [ins] = await pool.query("INSERT INTO tests (id, title, type, difficulty, allow_practice) VALUES (43, 'Transitions', 'topic', 'Medium', 1) ON DUPLICATE KEY UPDATE title='Transitions'");
            console.log('Inserted/updated test in DB:', ins);
            testId = 43;
        }

        const [qCount] = await pool.query("SELECT COUNT(id) as cnt FROM questions WHERE test_id = ?", [testId]);
        console.log(`DB question count for test ${testId}:`, qCount[0].cnt);
        if (qCount[0].cnt === 0) {
            console.log('Inserting questions into DB...');
            const values = rawQuestions.map(q => [
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
            await pool.query(sql, [values]);
            console.log('Inserted questions into DB successfully!');
        }

        await pool.end();
    } catch (e) {
        console.warn('DB operation warning/timeout:', e.message);
    }

    // Now update backup_all_tests.json
    console.log(`Ensuring test ${testId} exists in backup_all_tests.json...`);
    const testIndex = backup.tests.findIndex(t => String(t.id) === String(testId));
    const testObj = {
        id: testId,
        title: "Transitions",
        type: "topic",
        created_at: new Date().toISOString(),
        allow_practice: 1,
        difficulty: "Medium"
    };

    if (testIndex >= 0) {
        backup.tests[testIndex] = testObj;
    } else {
        backup.tests.push(testObj);
    }

    // Remove any existing questions for this test in backup
    backup.questions = backup.questions.filter(q => String(q.test_id) !== String(testId));

    // Append new questions
    let baseQuestionId = 4000;
    const formattedQuestions = rawQuestions.map((q, idx) => ({
        id: baseQuestionId + idx,
        test_id: testId,
        question_number: q.question_number,
        passage: q.passage,
        prompt: q.prompt,
        options: JSON.stringify([q.option_a, q.option_b, q.option_c, q.option_d]),
        correct_answer_index: q.correct_answer_index,
        module: 1,
        image_url: null,
        question_type: "mcq",
        section: "reading",
        domain: "Expression of Ideas",
        difficulty: "Medium"
    }));

    backup.questions.push(...formattedQuestions);

    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
    console.log(`✅ backup_all_tests.json updated! Now has ${backup.tests.length} tests and ${backup.questions.length} questions.`);
}

main().catch(console.error);
