const mysql = require('mysql2/promise');

async function main() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bluebook_db'
    };
    
    try {
        const connection = await mysql.createConnection(config);
        const [qs] = await connection.execute(
            "SELECT id, question_number, prompt, passage FROM questions WHERE test_id = 13 AND module = 1 ORDER BY question_number, id"
        );
        console.log(`--- Test 13 Module 1 Questions (Total: ${qs.length}) ---`);
        for (const q of qs) {
            console.log(`Q${q.question_number} (DB ID: ${q.id}) | Prompt: ${JSON.stringify((q.prompt || '').substring(0, 45))} | Passage: ${q.passage ? JSON.stringify(q.passage.substring(0, 45)) : 'None'}`);
        }
        await connection.end();
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
