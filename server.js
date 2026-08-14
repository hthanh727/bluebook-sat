require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bluebook_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Run migrations on startup
pool.query('ALTER TABLE tests ADD COLUMN allow_practice TINYINT(1) DEFAULT 1')
    .then(() => {
        console.log("Migration 'allow_practice' added to 'tests' table successfully!");
    })
    .catch(err => {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'allow_practice' already exists.");
        } else {
            console.error("Migration error 'allow_practice':", err);
        }
    });

pool.query('ALTER TABLE tests ADD COLUMN difficulty VARCHAR(50) DEFAULT NULL')
    .then(() => {
        console.log("Migration 'difficulty' added to 'tests' table successfully!");
    })
    .catch(err => {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'difficulty' already exists.");
        } else {
            console.error("Migration error 'difficulty':", err);
        }
    });

pool.query('ALTER TABLE tests MODIFY COLUMN type VARCHAR(50) NOT NULL')
    .then(() => {
        console.log("Migration 'type' modified to VARCHAR(50) successfully!");
    })
    .catch(err => {
        console.error("Migration error 'type' modification:", err);
    });

pool.query(`
    CREATE TABLE IF NOT EXISTS recordings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(512) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`)
    .then(() => {
        console.log("Table 'recordings' created or already exists successfully!");
    })
    .catch(err => {
        console.error("Migration error creating recordings table:", err);
    });

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-bluebook';

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authenticateAdmin = (req, res, next) => {
    authenticateToken(req, res, () => {
        if (req.user.role !== 'admin') return res.sendStatus(403);
        next();
    });
};

// --- API Endpoints ---

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Test & Question API (Protected) ---
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, role, name FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user name
app.put('/api/user/name', authenticateToken, async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ message: 'Name cannot be empty' });
    try {
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id]);
        res.json({ success: true, name: name.trim() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/tests', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT t.*, 
            (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as question_count
            FROM tests t 
            ORDER BY t.created_at DESC
        `;
        const [rows] = await pool.query(query);

        if (req.user && req.user.role === 'student') {
            const [locks] = await pool.query('SELECT test_id FROM test_locks WHERE user_id = ?', [req.user.id]);
            const lockedTestIds = new Set(locks.map(l => l.test_id));
            rows.forEach(row => {
                row.is_locked = lockedTestIds.has(row.id);
            });
        }

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/tests/:id/questions', authenticateToken, async (req, res) => {
    try {
        const testId = req.params.id;

        if (req.user && req.user.role === 'student') {
            const [locks] = await pool.query('SELECT 1 FROM test_locks WHERE test_id = ? AND user_id = ?', [testId, req.user.id]);
            if (locks.length > 0) {
                return res.status(403).json({ message: 'Test is locked for you' });
            }
        }

        const [testRows] = await pool.query('SELECT * FROM tests WHERE id = ?', [req.params.id]);
        if (testRows.length === 0) return res.status(404).json({ message: 'Test not found' });

        const test = testRows[0];
        const [questions] = await pool.query('SELECT * FROM questions WHERE test_id = ? ORDER BY module ASC, question_number ASC', [req.params.id]);

        res.json({ test, questions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Save Progress API (Protected)
app.post('/api/save-progress', authenticateToken, async (req, res) => {
    const { test_id, answers, score, completed } = req.body;
    try {
        // Find test type
        const [testRows] = await pool.query('SELECT type FROM tests WHERE id = ?', [test_id]);
        if (testRows.length === 0) return res.status(404).json({ message: 'Test not found' });
        const test_type = testRows[0].type;

        // Check if progress exists
        const [rows] = await pool.query('SELECT id FROM progress WHERE user_id = ? AND test_id = ?', [req.user.id, test_id]);

        if (rows.length > 0) {
            await pool.query('UPDATE progress SET answers = ?, score = ?, completed = ? WHERE user_id = ? AND test_id = ?',
                [JSON.stringify(answers), score, completed ? 1 : 0, req.user.id, test_id]);
        } else {
            await pool.query('INSERT INTO progress (user_id, test_id, test_type, answers, score, completed) VALUES (?, ?, ?, ?, ?, ?)',
                [req.user.id, test_id, test_type, JSON.stringify(answers), score, completed ? 1 : 0]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving progress' });
    }
});

// Load Progress API (Protected)
app.get('/api/progress/:test_id', authenticateToken, async (req, res) => {
    const { test_id } = req.params;
    try {
        const [rows] = await pool.query('SELECT answers, score, completed FROM progress WHERE user_id = ? AND test_id = ?', [req.user.id, test_id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json({ answers: null });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error loading progress' });
    }
});

// --- Admin API ---
app.get('/api/admin/student-progress', authenticateAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id as student_id, u.name as student_name, u.email as student_email, u.role as student_role,
                t.title as test_title, t.type as test_type,
                p.test_id, p.answers, p.score, p.completed, p.updated_at
            FROM users u
            JOIN progress p ON u.id = p.user_id
            JOIN tests t ON p.test_id = t.id
            ORDER BY p.updated_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/admin/tests', authenticateAdmin, async (req, res) => {
    const { title, type, difficulty } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO tests (title, type, difficulty) VALUES (?, ?, ?)', [title, type, difficulty || null]);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/admin/tests/:id', authenticateAdmin, async (req, res) => {
    const test_id = req.params.id;
    try {
        await pool.query('DELETE FROM tests WHERE id = ?', [test_id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin API to get lock status of a test
app.get('/api/admin/tests/:id/locks', authenticateAdmin, async (req, res) => {
    try {
        const testId = req.params.id;
        const [students] = await pool.query(`
            SELECT u.id, u.email, 
            CASE WHEN tl.test_id IS NOT NULL THEN true ELSE false END as is_locked 
            FROM users u 
            LEFT JOIN test_locks tl ON u.id = tl.user_id AND tl.test_id = ? 
            WHERE u.role = 'student'
        `, [testId]);

        // Map 1/0 to true/false for mysql boolean
        const formattedStudents = students.map(s => ({
            ...s,
            is_locked: !!s.is_locked
        }));

        res.json(formattedStudents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin API to update lock status of a test for specific students
app.post('/api/admin/tests/:id/locks', authenticateAdmin, async (req, res) => {
    try {
        const testId = req.params.id;
        const { userIds, is_locked } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'No users specified' });
        }

        if (is_locked) {
            const values = userIds.map(uid => [testId, uid]);
            await pool.query('INSERT IGNORE INTO test_locks (test_id, user_id) VALUES ?', [values]);
        } else {
            await pool.query('DELETE FROM test_locks WHERE test_id = ? AND user_id IN (?)', [testId, userIds]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin API to toggle Practice Mode availability for a test
app.post('/api/admin/tests/:id/practice', authenticateAdmin, async (req, res) => {
    try {
        const testId = req.params.id;
        const { allow_practice } = req.body;
        await pool.query('UPDATE tests SET allow_practice = ? WHERE id = ?', [allow_practice ? 1 : 0, testId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

const sanitizeQType = (t, text) => {
    if (t && String(t).toLowerCase().trim() === 'spr') return 'spr';
    if (text && String(text).trim() !== '') return 'spr';
    return 'mcq';
};

app.post('/api/admin/upload-questions', authenticateAdmin, async (req, res) => {
    const { test_id, question_number, passage, prompt, options, correct_answer_index, module, image_url, question_type, correct_answer_text, section } = req.body;
    try {
        await pool.query(
            'INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module, image_url, question_type, correct_answer_text, section) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [test_id, question_number, passage, prompt, options ? JSON.stringify(options) : null, correct_answer_index, module, image_url || null, sanitizeQType(question_type, correct_answer_text), correct_answer_text || null, section || 'reading']
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/admin/tests/:id/questions/bulk', authenticateAdmin, async (req, res) => {
    const test_id = req.params.id;
    const questions = req.body.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        for (const q of questions) {
            await connection.query(
                'INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module, image_url, question_type, correct_answer_text, section) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    test_id,
                    q.question_number,
                    q.passage || null,
                    q.prompt,
                    q.options ? JSON.stringify(q.options) : null,
                    q.correct_answer_index,
                    q.module || 1,
                    q.image_url || null,
                    sanitizeQType(q.question_type, q.correct_answer_text),
                    q.correct_answer_text || null,
                    q.section || 'reading'
                ]
            );
        }
        await connection.commit();
        res.json({ success: true, message: `Successfully imported ${questions.length} questions.` });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Error during bulk import' });
    } finally {
        connection.release();
    }
});

// Admin API to batch update question image URLs
app.post('/api/admin/questions/batch-images', authenticateAdmin, async (req, res) => {
    const { updates } = req.body; // array of { id, image_url }
    if (!Array.isArray(updates)) {
        return res.status(400).json({ message: 'Invalid data format' });
    }
    try {
        for (const u of updates) {
            await pool.query('UPDATE questions SET image_url = ? WHERE id = ?', [u.image_url ? u.image_url.trim() : null, u.id]);
        }
        res.json({ success: true, count: updates.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating question images' });
    }
});

// Admin API to replace all questions of a test (used for CSV editor)
app.post('/api/admin/tests/:id/questions/replace-all', authenticateAdmin, async (req, res) => {
    const test_id = req.params.id;
    const questions = req.body.questions;

    if (!Array.isArray(questions)) {
        return res.status(400).json({ message: 'Invalid questions format' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM questions WHERE test_id = ?', [test_id]);

        for (const q of questions) {
            await connection.query(
                'INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module, image_url, question_type, correct_answer_text, section) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    test_id,
                    q.question_number,
                    q.passage || null,
                    q.prompt,
                    q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : null,
                    q.correct_answer_index !== undefined ? q.correct_answer_index : null,
                    q.module || 1,
                    q.image_url || null,
                    sanitizeQType(q.question_type, q.correct_answer_text),
                    q.correct_answer_text || null,
                    q.section || 'reading'
                ]
            );
        }
        await connection.commit();
        res.json({ success: true, count: questions.length });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Error replacing test questions' });
    } finally {
        connection.release();
    }
});

// Admin API to delete single question
app.delete('/api/admin/questions/:id', authenticateAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/explain', authenticateToken, async (req, res) => {
    const { question, passage, options, userAnswer, correctAnswer } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
You are an expert SAT tutor. A student got the following question wrong. Explain clearly and concisely why their answer was wrong and why the correct answer is correct. Must explain with Vietnamese language
Passage: ${passage ? passage : 'None'}
Question: ${question}
Options: ${JSON.stringify(options)}
Câu sai: ${userAnswer}
Câu đúng: ${correctAnswer}

Giải thích: (keep it under 3-4 paragraphs, formatted in simple text or basic html):
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.json({ explanation: text });
    } catch (err) {
        console.error('AI Explain Error:', err);
        res.status(500).json({ message: 'Failed to generate explanation.' });
    }
});

// Add Bookmark
app.post('/api/bookmarks', authenticateToken, async (req, res) => {
    const { test_id, question_id } = req.body;
    try {
        await pool.query('INSERT IGNORE INTO bookmarks (user_id, test_id, question_id) VALUES (?, ?, ?)', [req.user.id, test_id, question_id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding bookmark' });
    }
});

// Remove Bookmark
app.delete('/api/bookmarks/:question_id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM bookmarks WHERE user_id = ? AND question_id = ?', [req.user.id, req.params.question_id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error removing bookmark' });
    }
});

// Get Bookmarks for a test
app.get('/api/tests/:test_id/bookmarks', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT question_id FROM bookmarks WHERE user_id = ? AND test_id = ?', [req.user.id, req.params.test_id]);
        res.json(rows.map(r => r.question_id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching test bookmarks' });
    }
});

// Get all Bookmarks for a user
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.question_id, b.test_id, q.module, q.question_number, q.prompt, q.passage, q.options, q.correct_answer_index, q.correct_answer_text, q.question_type, t.title as test_name
            FROM bookmarks b
            JOIN questions q ON b.question_id = q.id
            LEFT JOIN tests t ON b.test_id = t.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching bookmarks' });
    }
});

// --- Recordings API ---

// Get all recordings (Student + Admin)
app.get('/api/recordings', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM recordings ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create recording (Admin Only)
app.post('/api/admin/recordings', authenticateAdmin, async (req, res) => {
    const { title, description, video_url } = req.body;
    if (!title || !video_url) {
        return res.status(400).json({ message: 'Title and Video URL are required' });
    }
    try {
        await pool.query(
            'INSERT INTO recordings (title, description, video_url) VALUES (?, ?, ?)',
            [title, description || null, video_url]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete recording (Admin Only)
app.delete('/api/admin/recordings/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM recordings WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
