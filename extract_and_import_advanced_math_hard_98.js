require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is not defined in .env file!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const PDF_PATH = 'C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/4a63943e-670a-4a14-a5e4-5d5a1d8f81a8/.user_uploaded/media_1787924313738.pdf';
const TARGET_TOPIC_TITLE = 'Advanced Math';
const TARGET_DIFFICULTY = 'Hard';

const mathQuestionSchema = {
    type: "object",
    properties: {
        page_number: { type: "integer", description: "The page number in the PDF where this question starts (from 1 to 99)" },
        question_id: { type: "string", description: "The Question ID string (e.g., '512bd5b4')" },
        question_type: { type: "string", description: "'mcq' for Multiple Choice, 'spr' for Student-Produced Response (fill in the blank)" },
        prompt: { type: "string", description: "The question prompt text. CRITICAL: Every single mathematical formula, symbol, fraction, superscript, subscript, equation, variable (like x, y, a, b, c, d, w, p, t, r, n, k, g, j, l, \\ell), and standalone number in a mathematical context MUST be formatted in standard LaTeX notation using \\( ... \\) for inline math (e.g. \\(x\\), \\(y\\), \\(24\\), \\(y = 8x + 2\\)). For data tables, format them cleanly as a Markdown table." },
        option_a: { type: "string", description: "Option A text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if math is present." },
        option_b: { type: "string", description: "Option B text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if math is present." },
        option_c: { type: "string", description: "Option C text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if math is present." },
        option_d: { type: "string", description: "Option D text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if math is present." },
        correct_answer_index: { type: "integer", description: "Index of correct option (0=A, 1=B, 2=C, 3=D) for MCQ, or -1 for SPR" },
        correct_answer_text: { type: "string", description: "The correct text answer for SPR (e.g. '44', '14', '7/6', '-324', '120', '4/225'), or empty string for MCQ" }
    },
    required: ["page_number", "question_id", "question_type", "prompt", "option_a", "option_b", "option_c", "option_d", "correct_answer_index", "correct_answer_text"]
};

const responseSchema = {
    type: "array",
    items: mathQuestionSchema
};

function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
            mimeType
        },
    };
}

async function generateWithRetry(model, parts, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await model.generateContent(parts);
        } catch (err) {
            console.error(`Attempt ${i + 1} failed:`, err.message);
            if (i < maxRetries - 1) {
                const delay = 10000 * (i + 1);
                console.log(`Waiting ${delay / 1000}s before retrying...`);
                await new Promise(r => setTimeout(r, delay));
            } else {
                throw err;
            }
        }
    }
}

function escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
}

async function main() {
    let allQuestions = [];
    const cachePath = path.join(__dirname, 'questions_advanced_math_hard_raw.json');
    const csvPath = path.join(__dirname, 'questions_advanced_math_hard.csv');

    console.log('🚀 Starting Gemini Advanced Math (Hard) 98-Question Extraction...');
    const pdfPart = fileToGenerativePart(PDF_PATH, 'application/pdf');

    const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite", 
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    const batches = [
        { start: 1, end: 20, skip: [] },
        { start: 21, end: 40, skip: [] },
        { start: 41, end: 60, skip: [48] },
        { start: 61, end: 80, skip: [] },
        { start: 81, end: 99, skip: [] }
    ];

    for (const batch of batches) {
        console.log(`🤖 Extracting batch: Pages ${batch.start} to ${batch.end} (skip: ${batch.skip.length ? batch.skip.join(',') : 'none'})...`);
        const prompt = `
You are a professional SAT Math parser. Extract the questions from Page ${batch.start} to Page ${batch.end} in the attached SAT Math PDF file.
For each page that has a "Question ID: [id]" header, extract that exact question.

CRITICAL INSTRUCTIONS:
1. Skip Pages: ${batch.skip.join(', ') || 'None'}. These are spillover rationale pages without a Question ID header.
2. For every question:
   - Extract "question_id" exactly as shown in "Question ID: ...".
   - Extract "prompt": Format ALL math variables, numbers in math context, expressions, exponents, fractions, equations in LaTeX enclosed in \\( and \\).
   - If prompt contains a table, format it as a markdown table.
   - For MCQs: extract option_a, option_b, option_c, option_d with full LaTeX notation. Set correct_answer_index (0=A, 1=B, 2=C, 3=D) and correct_answer_text to "".
   - For SPRs: set option_a..d to "", correct_answer_index to -1, and extract correct_answer_text (e.g. "44", "1728", "81/4", "7").
   - Extract "page_number" matching the PDF page number.
`;

        const result = await generateWithRetry(model, [pdfPart, prompt]);
        const questions = JSON.parse(result.response.text());
        console.log(`✅ Extracted ${questions.length} questions for batch Pages ${batch.start}-${batch.end}.`);
        allQuestions.push(...questions);
        
        console.log('⏳ Short pause to respect rate limits...');
        await new Promise(r => setTimeout(r, 4000));
    }

    // Sort by page_number
    allQuestions.sort((a, b) => a.page_number - b.page_number);

    // Map image URLs for questions with graphs
    allQuestions.forEach((q, idx) => {
        q.question_number = idx + 1;
        q.image_url = '';
        if (q.question_id === '09d21d79' || q.page_number === 39) {
            q.image_url = 'images/adv_math_hard_q39.png';
        }
        if (q.question_id === '36b6f8ba' || q.page_number === 50) {
            q.image_url = 'images/adv_math_hard_q49.png';
        }
    });

    console.log(`📊 Total questions extracted: ${allQuestions.length}`);

    // Save JSON
    fs.writeFileSync(cachePath, JSON.stringify(allQuestions, null, 2), 'utf8');
    console.log(`💾 Saved updated JSON to: ${cachePath}`);

    // Save CSV
    const csvHeader = 'module,question_number,prompt,option_a,option_b,option_c,option_d,correct_answer_index,correct_answer_text,image_url,question_type\n';
    const csvRows = allQuestions.map(q => [
        escapeCsv(1),
        escapeCsv(q.question_number),
        escapeCsv(q.prompt),
        escapeCsv(q.option_a || ''),
        escapeCsv(q.option_b || ''),
        escapeCsv(q.option_c || ''),
        escapeCsv(q.option_d || ''),
        escapeCsv(q.question_type === 'mcq' ? q.correct_answer_index : ''),
        escapeCsv(q.question_type === 'spr' ? q.correct_answer_text : ''),
        escapeCsv(q.image_url || ''),
        escapeCsv(q.question_type)
    ].join(','));
    fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n'), 'utf8');
    console.log(`💾 Saved updated CSV to: ${csvPath}`);

    // Connect to DB and Import
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'defaultdb',
        port: parseInt(process.env.DB_PORT || '18921'),
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 5
    });

    const connection = await pool.getConnection();
    try {
        const [testRows] = await connection.query(
            "SELECT id FROM tests WHERE title = ? AND type = 'topic' AND difficulty = ?",
            [TARGET_TOPIC_TITLE, TARGET_DIFFICULTY]
        );

        let testId;
        if (testRows.length > 0) {
            testId = testRows[0].id;
            console.log(`Found existing test with ID: ${testId}`);
        } else {
            const [insertRes] = await connection.query(
                "INSERT INTO tests (title, type, difficulty, allow_practice) VALUES (?, 'topic', ?, 1)",
                [TARGET_TOPIC_TITLE, TARGET_DIFFICULTY]
            );
            testId = insertRes.insertId;
            console.log(`Created new test "${TARGET_TOPIC_TITLE}" (${TARGET_DIFFICULTY}) with ID: ${testId}`);
        }

        // Delete existing questions
        await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
        console.log(`Cleared existing questions for test ID: ${testId}`);

        // Bulk Insert
        await connection.beginTransaction();
        let count = 0;
        for (const q of allQuestions) {
            const options = q.question_type === 'mcq' ? JSON.stringify([q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || '']) : null;
            await connection.query(
                `INSERT INTO questions 
                (test_id, section, module, question_number, passage, prompt, options, correct_answer_index, correct_answer_text, image_url, question_type)
                VALUES (?, 'math', 1, ?, NULL, ?, ?, ?, ?, ?, ?)`,
                [
                    testId,
                    q.question_number,
                    q.prompt,
                    options,
                    q.question_type === 'mcq' ? q.correct_answer_index : null,
                    q.question_type === 'spr' ? (q.correct_answer_text || '') : null,
                    q.image_url || null,
                    q.question_type
                ]
            );
            count++;
        }

        await connection.commit();
        console.log(`🎉 Successfully inserted all ${count} questions into test ID ${testId} ("${TARGET_TOPIC_TITLE}" - ${TARGET_DIFFICULTY})!`);

    } catch (err) {
        await connection.rollback();
        console.error('❌ Database insertion error:', err);
    } finally {
        connection.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
