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
const PDF_PATH = 'C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/b1d55254-bb1e-4024-88a3-d14ccd4809f2/.user_uploaded/media_1786731309486.pdf';
const TARGET_TOPIC_TITLE = 'Algebra (Hard)';

const mathQuestionSchema = {
    type: "object",
    properties: {
        question_number: { type: "integer", description: "Question number (corresponds to page number in the PDF, from 1 to 102)" },
        question_type: { type: "string", description: "'mcq' for Multiple Choice, 'spr' for Student-Produced Response (fill in the blank)" },
        prompt: { type: "string", description: "The question prompt text. Every single mathematical formula, symbol, fraction, superscript, subscript, equation, variable (like x, y, a, b, c, d, w, p, t, r, n, k, g, j, l), and standalone number in a mathematical context MUST be formatted in standard LaTeX notation using \\( ... \\) for inline math (e.g. \\(x\\), \\(y\\), \\(24\\), \\(\\ell\\), \\(y = 8x + 2\\), \\(S\\))." },
        option_a: { type: "string", description: "Option A text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if any math, numbers, or variables are present." },
        option_b: { type: "string", description: "Option B text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if any math, numbers, or variables are present." },
        option_c: { type: "string", description: "Option C text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if any math, numbers, or variables are present." },
        option_d: { type: "string", description: "Option D text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if any math, numbers, or variables are present." },
        correct_answer_index: { type: "integer", description: "Index of correct option (0=A, 1=B, 2=C, 3=D) for MCQ, or -1 for SPR" },
        correct_answer_text: { type: "string", description: "The correct text answer for SPR (e.g. '24', '-22', '35', '1.5', '1.8', '9/5', '-14/15', '-.9333'), or empty string for MCQ" }
    },
    required: ["question_number", "question_type", "prompt", "option_a", "option_b", "option_c", "option_d", "correct_answer_index", "correct_answer_text"]
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
    let currentModel = model;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await currentModel.generateContent(parts);
        } catch (err) {
            console.error(`Attempt ${i + 1} failed:`, err.message);
            if (i < maxRetries - 1) {
                const delay = 15000 * (i + 1);
                console.log(`Waiting ${delay / 1000}s before retrying...`);
                await new Promise(r => setTimeout(r, delay));
            } else {
                throw err;
            }
        }
    }
}
async function main() {
    let allQuestions = [];
    const cachePath = 'c:/Users/Thanh GAY/.gemini/antigravity-ide/scratch/bluebook-sat/questions_hard_gemini.json';

    if (fs.existsSync(cachePath)) {
        console.log('📦 Loading extracted questions from cache file...');
        allQuestions = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } else {
        console.log('Starting Gemini Hard Algebra Extraction...');
        const pdfPart = fileToGenerativePart(PDF_PATH, 'application/pdf');

        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash-lite", // Use the Lite model configured in the environment
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const batches = [
            { start: 1, end: 25 },
            { start: 26, end: 50 },
            { start: 51, end: 75 },
            { start: 76, end: 102 }
        ];

        for (const batch of batches) {
            console.log(`🤖 Extracting batch: Pages ${batch.start} to ${batch.end}...`);
            const prompt = `
You are a professional SAT Math parser. Extract the questions from Page ${batch.start} to Page ${batch.end} in the attached SAT Math PDF file.
For each page, there is exactly one question. The question number corresponds to the page number (e.g. Page 1 is question_number 1).

CRITICAL INSTRUCTIONS:
1. Extract prompt and choices.
2. CRITICAL MATH FORMATTING: Format ALL mathematical symbols, formulas, superscripts, subscripts, fractions, variables (like x, y, a, b, c, d, w, p, t, r, n, k, g, j, l), equations, AND numbers in a mathematical context in standard LaTeX enclosed in \\( and \\) (e.g., \\(x^2\\), \\(\\frac{w}{5}\\), \\(y = mx + b\\), \\(45\\), \\(\\ell\\)).
3. CRITICAL INSTRUCTION FOR MCQ OPTIONS: Ensure the options option_a, option_b, option_c, option_d are parsed correctly from the options list under the "Answer" section of each question. Make sure options are LaTeX formatted.
4. Extract the correct answer from the "Correct Answer:" field on each page.
5. If it is MCQ, find the option letter (A, B, C, D) and convert it to index (0=A, 1=B, 2=C, 3=D). Set question_type to "mcq", correct_answer_text to "".
6. If it is SPR (Student-Produced Response / fill-in-the-blank), set question_type to "spr", correct_answer_index to -1, option_a to option_d to "", and set correct_answer_text to the exact text answer (e.g. "24", "1.5", "-14/15").
            `;

            const result = await generateWithRetry(model, [pdfPart, prompt]);
            const questions = JSON.parse(result.response.text());
            console.log(`✅ Extracted ${questions.length} questions for batch.`);
            allQuestions.push(...questions);
            
            console.log('⏳ Cooldown delay to respect rate limits...');
            await new Promise(r => setTimeout(r, 6000));
        }

        fs.writeFileSync(cachePath, JSON.stringify(allQuestions, null, 2), 'utf8');
        console.log(`📦 Saved extracted questions to cache: ${cachePath}`);
    }

    console.log(`📊 Extracted ${allQuestions.length} total questions. Preparing database insertion...`);

    // Clean up and ensure sorted order
    allQuestions.sort((a, b) => a.question_number - b.question_number);

    // Database Connection
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'defaultdb',
        port: parseInt(process.env.DB_PORT || '18921'),
        waitForConnections: true,
        connectionLimit: 5
    });

    const connection = await pool.getConnection();
    try {
        // Find or create test
        const [testRows] = await connection.query(
            "SELECT id FROM tests WHERE title = ? AND type = 'topic'",
            [TARGET_TOPIC_TITLE]
        );

        let testId;
        if (testRows.length > 0) {
            testId = testRows[0].id;
            console.log(`Found existing test with ID: ${testId}`);
        } else {
            const [insertRes] = await connection.query(
                "INSERT INTO tests (title, type, difficulty) VALUES (?, 'topic', 'Hard')",
                [TARGET_TOPIC_TITLE]
            );
            testId = insertRes.insertId;
            console.log(`Created new test "${TARGET_TOPIC_TITLE}" with ID: ${testId}`);
        }

        // Delete existing questions
        await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
        console.log(`Cleared existing questions for test ID: ${testId}`);

        // Bulk Insert
        await connection.beginTransaction();
        let count = 0;
        for (const q of allQuestions) {
            // Check if diagram image was extracted on local storage
            const imageFilename = `media_1786731309486_Q${q.question_number}.png`;
            const imagePath = path.join(__dirname, 'public/images', imageFilename);
            let image_url = null;
            if (fs.existsSync(imagePath)) {
                image_url = `images/${imageFilename}`;
            }

            const options = q.question_type === 'mcq' ? [q.option_a, q.option_b, q.option_c, q.option_d] : null;

            await connection.query(
                'INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module, image_url, question_type, correct_answer_text, section) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    testId,
                    q.question_number,
                    '', // passage
                    q.prompt,
                    options ? JSON.stringify(options) : null,
                    q.correct_answer_index,
                    1, // module
                    image_url,
                    q.question_type,
                    q.question_type === 'spr' ? q.correct_answer_text : null,
                    'math'
                ]
            );
            count++;
        }
        await connection.commit();
        console.log(`🎉 Successfully imported ${count} Hard Algebra questions to test ID ${testId}!`);

    } catch (err) {
        await connection.rollback();
        console.error('Database transaction error:', err);
    } finally {
        connection.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Extraction script error:', err);
    process.exit(1);
});
