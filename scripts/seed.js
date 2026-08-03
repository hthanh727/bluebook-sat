const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bluebook_db'
};
async function seed() {
    const pool = mysql.createPool(dbConfig);
    try {
        await pool.query('DELETE FROM questions WHERE test_id = 1');
        for (let i = 1; i <= 54; i++) {
            await pool.query(
                'INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [1, i, 'Passage ' + i, 'Prompt ' + i, JSON.stringify(['A', 'B', 'C', 'D']), 0, i <= 27 ? 1 : 2]
            );
        }
        console.log('Inserted 54 questions');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
seed();
