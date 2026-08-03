const mysql = require('mysql2/promise');
require('dotenv').config();

async function addColumns() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bluebook_db',
    });
    
    try {
        await pool.query("ALTER TABLE questions ADD COLUMN question_type ENUM('mcq', 'spr') DEFAULT 'mcq'");
        console.log("Added question_type column");
    } catch(err) {
        if(err.code === 'ER_DUP_FIELDNAME') console.log("question_type already exists");
        else console.error("Error adding question_type:", err.message);
    }

    try {
        await pool.query("ALTER TABLE questions ADD COLUMN correct_answer_text VARCHAR(255) DEFAULT NULL");
        console.log("Added correct_answer_text column");
    } catch(err) {
        if(err.code === 'ER_DUP_FIELDNAME') console.log("correct_answer_text already exists");
        else console.error("Error adding correct_answer_text:", err.message);
    }
    
    // Also change correct_answer_index to be NULLABLE because SPR doesn't have an index
    try {
        await pool.query("ALTER TABLE questions MODIFY COLUMN correct_answer_index INT NULL");
        console.log("Made correct_answer_index nullable");
    } catch(err) {
        console.error("Error making correct_answer_index nullable:", err.message);
    }
    
    // Also change options to be NULLABLE because SPR doesn't have options
    try {
        await pool.query("ALTER TABLE questions MODIFY COLUMN options JSON NULL");
        console.log("Made options nullable");
    } catch(err) {
        console.error("Error making options nullable:", err.message);
    }

    pool.end();
}
addColumns();
