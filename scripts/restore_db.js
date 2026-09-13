const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ override: true });

function formatDatetime(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

async function restore() {
  console.log("Connecting to new MySQL database:", process.env.DB_HOST);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  console.log("Connected successfully!");

  // Create tables
  console.log("Creating tables if not exists...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) DEFAULT 'Học sinh',
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        allow_practice TINYINT(1) DEFAULT 1,
        difficulty VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        question_number INT NOT NULL,
        passage TEXT,
        prompt TEXT NOT NULL,
        options JSON NULL,
        correct_answer_index INT NULL,
        module INT DEFAULT 1,
        image_url VARCHAR(512) DEFAULT NULL,
        question_type ENUM('mcq', 'spr') DEFAULT 'mcq',
        correct_answer_text VARCHAR(255) DEFAULT NULL,
        section VARCHAR(50) DEFAULT 'reading',
        domain VARCHAR(100) DEFAULT NULL,
        difficulty VARCHAR(50) DEFAULT NULL,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        test_id INT,
        test_type VARCHAR(50) NOT NULL,
        answers JSON NOT NULL,
        score INT DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS test_locks (
        test_id INT NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY (test_id, user_id),
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS recordings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(512) NOT NULL,
        pdf_url VARCHAR(512) DEFAULT NULL,
        pdf_name VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Read backup
  console.log("Reading backup_all_tests.json...");
  const backup = JSON.parse(fs.readFileSync('backup_all_tests.json', 'utf8'));

  // Disable foreign key checks for clean restore
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE questions');
  await connection.query('TRUNCATE TABLE progress');
  await connection.query('TRUNCATE TABLE test_locks');
  await connection.query('TRUNCATE TABLE tests');
  await connection.query('TRUNCATE TABLE users');
  if (backup.recordings) await connection.query('TRUNCATE TABLE recordings');

  // Insert users
  console.log(`Restoring ${backup.users.length} users...`);
  for (const u of backup.users) {
    await connection.query(
      'INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [u.id, u.name, u.email, u.password, u.role, formatDatetime(u.created_at)]
    );
  }

  // Insert tests
  console.log(`Restoring ${backup.tests.length} tests...`);
  for (const t of backup.tests) {
    await connection.query(
      'INSERT INTO tests (id, title, type, allow_practice, difficulty, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [t.id, t.title, t.type, t.allow_practice !== undefined ? t.allow_practice : 1, t.difficulty || null, formatDatetime(t.created_at)]
    );
  }

  // Insert questions in batches
  console.log(`Restoring ${backup.questions.length} questions...`);
  for (const q of backup.questions) {
    const opts = typeof q.options === 'object' && q.options !== null ? JSON.stringify(q.options) : q.options;
    await connection.query(
      `INSERT INTO questions (
        id, test_id, question_number, passage, prompt, options,
        correct_answer_index, correct_answer_text, module, image_url,
        question_type, section, domain, difficulty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        q.id, q.test_id, q.question_number, q.passage, q.prompt, opts,
        q.correct_answer_index, q.correct_answer_text, q.module, q.image_url,
        q.question_type, q.section, q.domain, q.difficulty
      ]
    );
  }

  // Insert progress
  if (backup.progress && backup.progress.length > 0) {
    console.log(`Restoring ${backup.progress.length} progress records...`);
    for (const p of backup.progress) {
      const ans = typeof p.answers === 'object' ? JSON.stringify(p.answers) : p.answers;
      await connection.query(
        'INSERT INTO progress (id, user_id, test_id, test_type, answers, score, completed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.user_id, p.test_id, p.test_type, ans, p.score, p.completed, formatDatetime(p.updated_at)]
      );
    }
  }

  // Insert test_locks
  if (backup.test_locks && backup.test_locks.length > 0) {
    console.log(`Restoring ${backup.test_locks.length} test locks...`);
    for (const l of backup.test_locks) {
      await connection.query(
        'INSERT INTO test_locks (test_id, user_id) VALUES (?, ?)',
        [l.test_id, l.user_id]
      );
    }
  }

  // Insert recordings
  if (backup.recordings && backup.recordings.length > 0) {
    console.log(`Restoring ${backup.recordings.length} recordings...`);
    for (const r of backup.recordings) {
      await connection.query(
        'INSERT INTO recordings (id, title, description, video_url, pdf_url, pdf_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [r.id, r.title, r.description, r.video_url, r.pdf_url, r.pdf_name, formatDatetime(r.created_at)]
      );
    }
  }

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log("\n🎉 ALL DATA SUCCESSFULLY RESTORED INTO NEW DATABASE!");

  const [testRows] = await connection.query(`
    SELECT t.id, t.title, t.type, COUNT(q.id) as question_count 
    FROM tests t 
    LEFT JOIN questions q ON t.id = q.test_id 
    GROUP BY t.id, t.title, t.type
    ORDER BY t.id DESC
  `);
  console.log("Restored tests summary:\n", testRows);

  await connection.end();
}

restore().catch(err => {
  console.error("Restore failed:", err);
  process.exit(1);
});
