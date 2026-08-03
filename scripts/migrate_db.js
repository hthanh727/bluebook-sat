const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    console.log('Connecting to Local DB...');
    const localDb = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'bluebook_db'
    });

    console.log('Connecting to Aiven DB...');
    const aivenDb = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    });

    const tables = ['users', 'tests', 'questions', 'progress'];

    for (const table of tables) {
        console.log(`\n--- Migrating table: ${table} ---`);
        
        // 1. Get CREATE TABLE syntax from Local
        const [createTableRows] = await localDb.query(`SHOW CREATE TABLE \`${table}\``);
        let createSql = createTableRows[0]['Create Table'];
        
        // 2. Create table on Aiven (drop if exists)
        await aivenDb.query(`DROP TABLE IF EXISTS \`${table}\``);
        await aivenDb.query(createSql);
        console.log(`Created table ${table} on Aiven.`);

        // 3. Get all data from Local
        const [data] = await localDb.query(`SELECT * FROM \`${table}\``);
        console.log(`Found ${data.length} rows in ${table}.`);

        if (data.length > 0) {
            // 4. Insert data into Aiven in chunks
            const chunkSize = 100;
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                
                const columns = Object.keys(chunk[0]).map(c => `\`${c}\``).join(', ');
                const placeholders = Object.keys(chunk[0]).map(() => '?').join(', ');
                
                const insertSql = `INSERT INTO \`${table}\` (${columns}) VALUES ${chunk.map(() => `(${placeholders})`).join(', ')}`;
                
                const values = chunk.flatMap(row => Object.values(row));
                
                await aivenDb.query(insertSql, values);
            }
            console.log(`Inserted all data into ${table}.`);
        }
    }

    console.log('\nMigration complete!');
    await localDb.end();
    await aivenDb.end();
}

migrate().catch(console.error);
