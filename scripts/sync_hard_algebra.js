require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const RAW_JSON_PATH = path.join(__dirname, '..', 'questions_algebra_hard_raw.json');
const CSV_PATH = path.join(__dirname, '..', 'questions_algebra_hard.csv');
const TARGET_TOPIC_TITLE = 'Algebra (Hard)';

async function main() {
    if (!fs.existsSync(RAW_JSON_PATH)) {
        console.error('❌ Cannot find raw JSON at:', RAW_JSON_PATH);
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(RAW_JSON_PATH, 'utf8'));
    console.log(`📦 Loaded ${rawData.length} questions from JSON.`);

    // Enrich and clean each question
    const questions = rawData.map((q, idx) => {
        const qNum = idx + 1;
        let prompt = (q.prompt || '').replace(/\\n/g, '\n');
        let opt_a = (q.option_a || '').replace(/\\n/g, '\n');
        let opt_b = (q.option_b || '').replace(/\\n/g, '\n');
        let opt_c = (q.option_c || '').replace(/\\n/g, '\n');
        let opt_d = (q.option_d || '').replace(/\\n/g, '\n');
        let image_url = null;

        if (qNum === 4) {
            image_url = 'images/media_1786980513333_Q4.png';
        } else if (qNum === 10) {
            if (!prompt.includes('ax + by = b')) {
                prompt = '\\(ax + by = b\\)\n' + prompt;
            }
            opt_a = 'images/media_1786980513333_Q10_A.png';
            opt_b = 'images/media_1786980513333_Q10_B.png';
            opt_c = 'images/media_1786980513333_Q10_C.png';
            opt_d = 'images/media_1786980513333_Q10_D.png';
        } else if (qNum === 12) {
            image_url = 'images/media_1786980513333_Q12.png';
        } else if (qNum === 21) {
            image_url = 'images/media_1786980513333_Q21.png';
        } else if (qNum === 43) {
            image_url = 'images/media_1786980513333_Q43.png';
        }

        return {
            ...q,
            question_number: qNum,
            prompt,
            option_a: opt_a,
            option_b: opt_b,
            option_c: opt_c,
            option_d: opt_d,
            image_url
        };
    });

    // Save back to JSON
    fs.writeFileSync(RAW_JSON_PATH, JSON.stringify(questions, null, 2), 'utf8');
    console.log('✅ Updated raw JSON cache.');

    // Save CSV
    function escapeCSV(val) {
        if (val === null || val === undefined) return '""';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
    }

    const csvHeaders = ['module', 'question_number', 'prompt', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer_index', 'correct_answer_text', 'image_url', 'question_type'];
    const csvRows = questions.map(q => [
        1,
        q.question_number,
        q.prompt,
        q.option_a || '',
        q.option_b || '',
        q.option_c || '',
        q.option_d || '',
        q.question_type === 'mcq' ? q.correct_answer_index : '',
        q.question_type === 'spr' ? q.correct_answer_text : '',
        q.image_url || '',
        q.question_type
    ]);

    const headerLine = csvHeaders.join(',') + '\n';
    const csvContent = csvRows.map(r => r.map(escapeCSV).join(',')).join('\n') + '\n';
    fs.writeFileSync(CSV_PATH, headerLine + csvContent, 'utf8');
    console.log(`✅ Saved clean CSV to: ${CSV_PATH}`);

    // Update MySQL Database
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bluebook_db',
        port: parseInt(process.env.DB_PORT || '3306'),
        waitForConnections: true,
        connectionLimit: 5
    });

    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL.');

        const [testRows] = await connection.query(
            "SELECT id FROM tests WHERE title = ? AND type = 'topic'",
            [TARGET_TOPIC_TITLE]
        );

        let testId;
        if (testRows.length > 0) {
            testId = testRows[0].id;
            console.log(`Found test ID: ${testId}`);
        } else {
            const [ins] = await connection.query(
                "INSERT INTO tests (title, type, difficulty, allow_practice) VALUES (?, 'topic', 'Hard', 1)",
                [TARGET_TOPIC_TITLE]
            );
            testId = ins.insertId;
            console.log(`Created test ID: ${testId}`);
        }

        await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
        console.log(`Cleared existing questions for test ID ${testId}`);

        await connection.beginTransaction();
        for (const q of questions) {
            const options = q.question_type === 'mcq' ? [q.option_a, q.option_b, q.option_c, q.option_d] : null;
            await connection.query(
                'INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module, image_url, question_type, correct_answer_text, section, domain, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    testId,
                    q.question_number,
                    '',
                    q.prompt,
                    options ? JSON.stringify(options) : null,
                    q.question_type === 'mcq' ? q.correct_answer_index : null,
                    1,
                    q.image_url,
                    q.question_type,
                    q.question_type === 'spr' ? q.correct_answer_text : null,
                    'math',
                    'Algebra',
                    'Hard'
                ]
            );
        }
        await connection.commit();
        console.log(`🎉 Successfully synced ${questions.length} questions to database!`);
        connection.release();
    } catch (err) {
        console.error('MySQL sync error:', err.message);
    } finally {
        await pool.end();
    }
}

main();
