const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importDb() {
    try {
        console.log('Connecting to Aiven MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        });

        console.log('Reading bluebook_db_clean.sql...');
        const sql = fs.readFileSync('bluebook_db_clean.sql', 'utf8');

        // Split by semicolon, but ignore semicolons inside strings
        // This is a naive regex but works for most basic dumps if we are careful
        // Actually, let's just use a simple state machine to split statements safely
        let statements = [];
        let currentStatement = '';
        let inString = false;
        let stringChar = '';
        let escapeNext = false;

        for (let i = 0; i < sql.length; i++) {
            const char = sql[i];
            
            if (escapeNext) {
                currentStatement += char;
                escapeNext = false;
                continue;
            }

            if (char === '\\') {
                escapeNext = true;
                currentStatement += char;
                continue;
            }

            if ((char === "'" || char === '"') && !inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar && inString) {
                inString = false;
            }

            if (char === ';' && !inString) {
                if (currentStatement.trim().length > 0) {
                    statements.push(currentStatement.trim());
                }
                currentStatement = '';
            } else {
                currentStatement += char;
            }
        }
        if (currentStatement.trim().length > 0) {
            statements.push(currentStatement.trim());
        }

        console.log(`Found ${statements.length} statements. Executing...`);
        let count = 0;
        for (let stmt of statements) {
            if (stmt.startsWith('--') || stmt.startsWith('/*')) continue;
            try {
                await connection.query(stmt);
                count++;
            } catch (err) {
                console.error(`Error in statement:\n${stmt.substring(0, 50)}...`);
                console.error(err.message);
            }
        }

        console.log(`Successfully executed ${count} statements!`);
        await connection.end();
    } catch (error) {
        console.error('Error importing database:', error);
    }
}

importDb();
