require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const parsedTests = require('./parsed_3_full_tests.json');

async function updateBackupFile() {
  const backupPath = path.join(__dirname, '..', 'backup_all_tests.json');
  let backup = { tests: [], questions: [] };

  if (fs.existsSync(backupPath)) {
    try {
      backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    } catch (e) {
      console.warn('Could not parse existing backup file, creating new structure');
    }
  }

  if (!backup.tests) backup.tests = [];
  if (!backup.questions) backup.questions = [];

  let maxTestId = backup.tests.reduce((max, t) => Math.max(max, t.id || 0), 0);
  let maxQId = backup.questions.reduce((max, q) => Math.max(max, q.id || 0), 0);

  const importedSummary = [];

  for (const t of parsedTests) {
    const existingTestIndex = backup.tests.findIndex(test => test.title === t.title);
    let assignedTestId;

    if (existingTestIndex >= 0) {
      assignedTestId = backup.tests[existingTestIndex].id;
      backup.tests[existingTestIndex] = {
        id: assignedTestId,
        title: t.title,
        type: 'full',
        created_at: new Date().toISOString(),
        allow_practice: 1,
        difficulty: null
      };
      // Remove old questions for this test
      backup.questions = backup.questions.filter(q => q.test_id !== assignedTestId);
      console.log(`Updated existing test entry '${t.title}' (ID: ${assignedTestId})`);
    } else {
      maxTestId++;
      assignedTestId = maxTestId;
      backup.tests.push({
        id: assignedTestId,
        title: t.title,
        type: 'full',
        created_at: new Date().toISOString(),
        allow_practice: 1,
        difficulty: null
      });
      console.log(`Created new test entry '${t.title}' (ID: ${assignedTestId})`);
    }

    // Add all 98 questions
    for (const q of t.questions) {
      maxQId++;
      backup.questions.push({
        id: maxQId,
        test_id: assignedTestId,
        question_number: q.question_number,
        original_question_number: q.original_question_number,
        passage: q.passage,
        prompt: q.prompt,
        options: q.options ? JSON.stringify(q.options) : null,
        correct_answer_index: q.correct_answer_index,
        correct_answer_text: q.correct_answer_text,
        module: q.module,
        image_url: q.image_url,
        question_type: q.question_type,
        section: q.section,
        domain: q.domain,
        difficulty: q.difficulty
      });
    }

    importedSummary.push({
      id: assignedTestId,
      title: t.title,
      questionCount: t.questions.length
    });
  }

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`\n✅ backup_all_tests.json successfully updated with ${importedSummary.length} full tests!`);
  importedSummary.forEach(s => console.log(`   - [ID: ${s.id}] ${s.title}: ${s.questionCount} questions`));

  return importedSummary;
}

async function importToDatabase() {
  console.log('--- Starting Import for 3 Full Tests ---');

  // Update backup_all_tests.json first
  const testSummaries = await updateBackupFile();

  // Try MySQL connection
  let connection;
  try {
    console.log(`\nAttempting connection to MySQL (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306})...`);
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || 'bluebook_db',
      ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
      connectTimeout: 5000
    });
    console.log('Connected to MySQL successfully!');

    for (const t of parsedTests) {
      const [existing] = await connection.query('SELECT id FROM tests WHERE title = ?', [t.title]);
      let testId;
      if (existing.length > 0) {
        testId = existing[0].id;
        console.log(`Test '${t.title}' exists in DB with ID ${testId}. Cleaning up old questions...`);
        await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
        await connection.query('UPDATE tests SET type = "full", allow_practice = 1 WHERE id = ?', [testId]);
      } else {
        const [res] = await connection.query(
          'INSERT INTO tests (title, type, allow_practice) VALUES (?, "full", 1)',
          [t.title]
        );
        testId = res.insertId;
        console.log(`Created test in DB: '${t.title}' with ID ${testId}`);
      }

      console.log(`Inserting ${t.questions.length} questions into DB for test ID ${testId}...`);
      for (const q of t.questions) {
        await connection.query(
          `INSERT INTO questions (
            test_id, question_number, passage, prompt, options,
            correct_answer_index, correct_answer_text, module, image_url,
            question_type, section, domain, difficulty
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            testId,
            q.question_number,
            q.passage,
            q.prompt,
            q.options ? JSON.stringify(q.options) : null,
            q.correct_answer_index,
            q.correct_answer_text,
            q.module,
            q.image_url,
            q.question_type,
            q.section,
            q.domain,
            q.difficulty
          ]
        );
      }
      console.log(`Finished inserting DB questions for '${t.title}'`);
    }
    console.log('🎉 DB Import completed for all 3 full tests!');
  } catch (err) {
    console.warn('\nℹ️ MySQL is not running or timed out:', err.message);
    console.log('✅ The Bluebook application will serve all 3 full tests directly from backup_all_tests.json (server fallback).');
  } finally {
    if (connection) await connection.end();
  }
}

importToDatabase().catch(console.error);
