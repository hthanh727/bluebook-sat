const Importer = require('mysql-import');
require('dotenv').config();

async function importDb() {
    try {
        console.log('Connecting to Aiven MySQL...');
        const importer = new Importer({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME
        });

        importer.onProgress(progress => {
            var percent = Math.floor(progress.bytes_processed / progress.total_bytes * 10000) / 100;
            console.log(`${percent}% Completed`);
        });

        console.log('Importing database structure and data... This might take a few seconds.');
        await importer.import('bluebook_db_clean.sql');

        console.log('Import completed successfully!');
        importer.disconnect();
    } catch (error) {
        console.error('Error importing database:', error);
    }
}

importDb();
