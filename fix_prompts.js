require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');

async function main() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT),
    });

    const connection = await pool.getConnection();
    try {
        const [questions] = await connection.query(
            "SELECT id, prompt FROM questions WHERE test_id = 37"
        );

        console.log(`Fixing prompts for ${questions.length} questions...`);
        let fixedCount = 0;
        for (const q of questions) {
            if (q.prompt.includes('\\n') || q.prompt.includes('\n')) {
                // Replace literal \\n or real \n in prompts with <br> for HTML rendering
                let fixedPrompt = q.prompt.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
                await connection.query(
                    "UPDATE questions SET prompt = ? WHERE id = ?",
                    [fixedPrompt, q.id]
                );
                fixedCount++;
            }
        }
        console.log(`🎉 Successfully fixed ${fixedCount} prompts by replacing literal \\n with <br>!`);
    } catch (err) {
        console.error(err);
    } finally {
        connection.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
