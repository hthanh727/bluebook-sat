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
        
        const [tests] = await connection.execute("SELECT id, title, type, created_at FROM tests ORDER BY id DESC LIMIT 5");
        console.log("--- Latest Tests in Database ---");
        for (const t of tests) {
            const [qCountRow] = await connection.execute("SELECT COUNT(*) as count FROM questions WHERE test_id = ?", [t.id]);
            const [m1Row] = await connection.execute("SELECT COUNT(*) as count FROM questions WHERE test_id = ? AND module = 1", [t.id]);
            const [m2Row] = await connection.execute("SELECT COUNT(*) as count FROM questions WHERE test_id = ? AND module = 2", [t.id]);
            
            console.log(`ID: ${t.id} | Title: ${t.title} | Type: ${t.type} | Total Qs: ${qCountRow[0].count} (M1: ${m1Row[0].count}, M2: ${m2Row[0].count})`);
            
            if (qCountRow[0].count > 0) {
                // Check if any question has weird data
                const [weird] = await connection.execute("SELECT question_number, prompt, passage FROM questions WHERE test_id = ? ORDER BY id DESC LIMIT 5", [t.id]);
                console.log("  Latest imported rows:");
                for (const q of weird) {
                    console.log(`    Q${q.question_number}: Prompt: ${JSON.stringify((q.prompt || '').substring(0, 50))} | Passage: ${q.passage ? JSON.stringify(q.passage.substring(0, 50)) : 'None'}`);
                }
            }
        }
        
        await connection.end();
    } catch (e) {
        console.error("Database Error:", e);
    }
}

main();
