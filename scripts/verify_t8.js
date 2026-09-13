const mysql = require('mysql2/promise');
require('dotenv').config({ override: true });

async function verify() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  });

  const [test] = await c.query("SELECT * FROM tests WHERE title = 'T8 2026 Int I'");
  console.log("Test:", test);

  if (test.length > 0) {
    const testId = test[0].id;
    const [counts] = await c.query(`
      SELECT 
        module, 
        COUNT(*) as total, 
        SUM(CASE WHEN question_type = 'spr' THEN 1 ELSE 0 END) as spr_count,
        SUM(CASE WHEN question_type = 'mcq' THEN 1 ELSE 0 END) as mcq_count,
        SUM(CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END) as img_count
      FROM questions 
      WHERE test_id = ? 
      GROUP BY module
    `, [testId]);
    console.log("Counts by module:", counts);

    const [images] = await c.query("SELECT module, question_number, image_url, question_type, correct_answer_index, correct_answer_text FROM questions WHERE test_id = ? AND image_url IS NOT NULL", [testId]);
    console.log("Questions with images:", images);

    const [sprs] = await c.query("SELECT module, question_number, correct_answer_text FROM questions WHERE test_id = ? AND question_type = 'spr'", [testId]);
    console.log("SPR questions:", sprs);
  }

  await c.end();
}

verify();
