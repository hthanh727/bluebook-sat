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
const PDF_PATH = 'C:/Users/Thanh GAY/.gemini/antigravity-ide/brain/5390c9e1-b885-4d3c-99d6-412448308a1a/.user_uploaded/media_1786980513333.pdf';
const TARGET_TOPIC_TITLE = 'Algebra (Hard)';

const mathQuestionSchema = {
    type: "object",
    properties: {
        page_number: { type: "integer", description: "The page number in the PDF where this question is found (from 1 to 60)" },
        question_type: { type: "string", description: "'mcq' for Multiple Choice, 'spr' for Student-Produced Response (fill in the blank)" },
        prompt: { type: "string", description: "The question prompt text. Every single mathematical formula, symbol, fraction, superscript, subscript, equation, variable (like x, y, a, b, c, d, w, p, t, r, n, k, g, j, l, \\ell), and standalone number in a mathematical context MUST be formatted in standard LaTeX notation using \\( ... \\) for inline math (e.g. \\(x\\), \\(y\\), \\(24\\), \\(\\ell\\), \\(y = 8x + 2\\), \\(S\\))." },
        option_a: { type: "string", description: "Option A text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if math is present. If option contains a table of values, format it as a standard Markdown table." },
        option_b: { type: "string", description: "Option B text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if math is present. If option contains a table of values, format it as a standard Markdown table." },
        option_c: { type: "string", description: "Option C text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if math is present. If option contains a table of values, format it as a standard Markdown table." },
        option_d: { type: "string", description: "Option D text if MCQ, else empty string. MUST use LaTeX \\( ... \\) if math is present. If option contains a table of values, format it as a standard Markdown table." },
        correct_answer_index: { type: "integer", description: "Index of correct option (0=A, 1=B, 2=C, 3=D) for MCQ, or -1 for SPR" },
        correct_answer_text: { type: "string", description: "The correct text answer for SPR (e.g. '24', '1.5', '-14/15', '-22'), or empty string for MCQ" }
    },
    required: ["page_number", "question_type", "prompt", "option_a", "option_b", "option_c", "option_d", "correct_answer_index", "correct_answer_text"]
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
    const cachePath = 'c:/Users/Thanh GAY/.gemini/antigravity-ide/scratch/bluebook-sat/questions_algebra_hard_raw.json';

    // Delete old cache files to force clean recreation
    if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
        console.log('🗑️ Deleted old JSON cache file.');
    }
    const csvPath = 'c:/Users/Thanh GAY/.gemini/antigravity-ide/scratch/bluebook-sat/questions_algebra_hard.csv';
    if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
        console.log('🗑️ Deleted old CSV file.');
    }

    console.log('Starting Gemini Hard Algebra Extraction WITH Answers & Graphs...');
    const pdfPart = fileToGenerativePart(PDF_PATH, 'application/pdf');

    const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite", 
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    const batches = [
        { start: 1, end: 20, skip: [11] },
        { start: 21, end: 40, skip: [36, 39] },
        { start: 41, end: 60, skip: [52] }
    ];

    for (const batch of batches) {
        console.log(`🤖 Extracting batch: Pages ${batch.start} to ${batch.end} (skipping pages: ${batch.skip.join(', ')})...`);
        const prompt = `
You are a professional SAT Math parser. Extract the questions from Page ${batch.start} to Page ${batch.end} in the attached SAT Math PDF file.
For each page, there is exactly one question.

CRITICAL INSTRUCTIONS:
1. Skip Pages: ${batch.skip.join(', ')}. These pages do not have a "Question ID:" header and are just spillover rationales from the previous question. Do NOT extract them as questions.
2. For all other pages, extract the question prompt and options.
3. CRITICAL MATH FORMATTING: Format ALL mathematical symbols, formulas, superscripts, subscripts, fractions, variables (like x, y, a, b, c, d, w, p, t, r, n, k, g, j, l, \\ell), equations, AND numbers in a mathematical context in standard LaTeX enclosed in \\( and \\) (e.g., \\(x^2\\), \\(\\frac{w}{5}\\), \\(y = mx + b\\), \\(45\\), \\(\\ell\\)).
4. CRITICAL INSTRUCTION FOR MCQ OPTIONS: Ensure the options option_a, option_b, option_c, option_d are parsed correctly from the options list under the "Answer" section of each question. Make sure options are LaTeX formatted.
   - Exception: If the option choice contains a data table, represent it fully as a Markdown table (e.g., | x | y | ...).
   - If the option choice is a graph/diagram (like Page 10), place the placeholder "[image]" in each option field.
5. CRITICAL INSTRUCTION FOR GRAPHS/DIAGRAMS: If a question contains a graph, diagram, geometric figure, or coordinate plane, place the placeholder tag string "[image]" at the exact position where that graph/figure was located in the prompt. Do NOT attempt to write text descriptions of the images.
6. Extract the correct answer from the "Correct Answer:" field on each page.
   - For MCQs: find the option letter (A, B, C, D) and convert it to index (0=A, 1=B, 2=C, 3=D). Set correct_answer_index to this index, and correct_answer_text to "".
   - For SPRs: set correct_answer_index to -1, and correct_answer_text to the exact text answer (e.g. "24", "1.5", "-14/15").
7. Populate "page_number" with the actual page number in the PDF (from 1 to 60) where the question starts.
        `;

        const result = await generateWithRetry(model, [pdfPart, prompt]);
        const questions = JSON.parse(result.response.text());
        console.log(`✅ Extracted ${questions.length} questions for batch.`);
        allQuestions.push(...questions);
        
        console.log('⏳ Cooldown delay to respect rate limits...');
        await new Promise(r => setTimeout(r, 6000));
    }

    // Clean up and ensure sorted order by page number
    allQuestions.sort((a, b) => a.page_number - b.page_number);

    // Filter out any leaked skip pages just in case
    const skippedPages = [11, 36, 39, 52];
    allQuestions = allQuestions.filter(q => !skippedPages.includes(q.page_number));

    // Assign sequential question_number (from 1 to 56)
    allQuestions.forEach((q, idx) => {
        q.question_number = idx + 1;
    });

    // Save JSON cache
    fs.writeFileSync(cachePath, JSON.stringify(allQuestions, null, 2), 'utf8');
    console.log(`📦 Saved extracted questions to cache: ${cachePath}`);

    // Save CSV
    function convertMarkdownTablesToHtml(text) {
        if (!text || typeof text !== 'string' || !text.includes('|---')) return text;
        const tableRegex = /(?:\|[^\n]+\|\r?\n)+(?:\|[-:\s|]+\|\r?\n)(?:\|[^\n]+\|\r?\n?)+/g;
        return text.replace(tableRegex, (match) => {
            const lines = match.trim().split(/\r?\n/).filter(line => line.trim().startsWith('|'));
            if (lines.length < 3) return match;
            const parseRow = (rowStr) => rowStr.split('|').slice(1, -1).map(cell => cell.trim());
            const headers = parseRow(lines[0]);
            const bodyRows = lines.slice(2).map(parseRow);
            let html = '<table class="sat-table"><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
            bodyRows.forEach(row => {
                html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
            });
            html += '</tbody></table>';
            return html;
        });
    }

    function escapeCSV(val) {
        if (val === null || val === undefined) return '""';
        const str = convertMarkdownTablesToHtml(String(val));
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
    }

    const csvHeaders = ['module', 'question_number', 'prompt', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer_index', 'correct_answer_text', 'image_url', 'question_type'];
    const csvRows = allQuestions.map(q => {
        let opt_a = q.option_a;
        let opt_b = q.option_b;
        let opt_c = q.option_c;
        let opt_d = q.option_d;
        let image_url = '';

        if (q.question_number === 4) {
            image_url = 'images/media_1786980513333_Q4.png';
        } else if (q.question_number === 10) {
            opt_a = 'images/media_1786980513333_Q10_A.png';
            opt_b = 'images/media_1786980513333_Q10_B.png';
            opt_c = 'images/media_1786980513333_Q10_C.png';
            opt_d = 'images/media_1786980513333_Q10_D.png';
        } else if (q.question_number === 12) {
            image_url = 'images/media_1786980513333_Q12.png';
        } else if (q.question_number === 21) {
            image_url = 'images/media_1786980513333_Q21.png';
        } else if (q.question_number === 43) {
            image_url = 'images/media_1786980513333_Q43.png';
        }

        return [
            1, // module
            q.question_number,
            q.prompt,
            opt_a || '',
            opt_b || '',
            opt_c || '',
            opt_d || '',
            q.question_type === 'mcq' ? q.correct_answer_index : '',
            q.question_type === 'spr' ? q.correct_answer_text : '',
            image_url,
            q.question_type
        ];
    });

    const headerLine = csvHeaders.join(',') + '\n';
    const content = csvRows.map(row => row.map(escapeCSV).join(',')).join('\n') + '\n';
    fs.writeFileSync(csvPath, headerLine + content, 'utf8');
    console.log(`📁 Generated CSV file at: ${csvPath}`);

    console.log(`📊 Extracted ${allQuestions.length} total questions. Preparing database insertion...`);

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
                "INSERT INTO tests (title, type, difficulty, allow_practice) VALUES (?, 'topic', 'Hard', 1)",
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
            let image_url = null;
            let opt_a = q.option_a;
            let opt_b = q.option_b;
            let opt_c = q.option_c;
            let opt_d = q.option_d;

            if (q.question_number === 4) {
                image_url = 'images/media_1786980513333_Q4.png';
            } else if (q.question_number === 10) {
                opt_a = 'images/media_1786980513333_Q10_A.png';
                opt_b = 'images/media_1786980513333_Q10_B.png';
                opt_c = 'images/media_1786980513333_Q10_C.png';
                opt_d = 'images/media_1786980513333_Q10_D.png';
            } else if (q.question_number === 12) {
                image_url = 'images/media_1786980513333_Q12.png';
            } else if (q.question_number === 21) {
                image_url = 'images/media_1786980513333_Q21.png';
            } else if (q.question_number === 43) {
                image_url = 'images/media_1786980513333_Q43.png';
            }

            const options = q.question_type === 'mcq' ? [opt_a, opt_b, opt_c, opt_d] : null;

            await connection.query(
                'INSERT INTO questions (test_id, question_number, passage, prompt, options, correct_answer_index, module, image_url, question_type, correct_answer_text, section, domain, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    testId,
                    q.question_number,
                    '', // passage
                    q.prompt,
                    options ? JSON.stringify(options) : null,
                    q.question_type === 'mcq' ? q.correct_answer_index : null,
                    1, // module
                    image_url,
                    q.question_type,
                    q.question_type === 'spr' ? q.correct_answer_text : null,
                    'math', // section
                    'Algebra', // domain
                    'Hard' // difficulty
                ]
            );
            count++;
        }
        await connection.commit();
        console.log(`🎉 Successfully imported ${count} Hard Algebra questions to test ID ${testId} WITH correct answers and images associated!`);

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
