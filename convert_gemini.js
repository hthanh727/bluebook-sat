require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI, Type } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is not defined in .env file!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
            mimeType
        },
    };
}

const mathQuestionSchema = {
    type: "object",
    properties: {
        module: { type: "integer", description: "Module number, either 1 or 2" },
        question_number: { type: "integer", description: "Question number" },
        question_type: { type: "string", description: "'mcq' for Multiple Choice, 'spr' for Student-Produced Response (fill in the blank)" },
        prompt: { type: "string", description: "The question prompt text. All mathematical formulas, symbols, fractions, superscripts, subscripts, equations, and variables MUST be formatted in LaTeX notation using \\( ... \\) for inline math (e.g. \\(24x^2\\)). For tables, use markdown table formatting inside the prompt." },
        option_a: { type: "string", description: "Option A text if MCQ, else empty string. Use LaTeX if math is present." },
        option_b: { type: "string", description: "Option B text if MCQ, else empty string. Use LaTeX if math is present." },
        option_c: { type: "string", description: "Option C text if MCQ, else empty string. Use LaTeX if math is present." },
        option_d: { type: "string", description: "Option D text if MCQ, else empty string. Use LaTeX if math is present." },
        correct_answer_index: { type: "integer", description: "Index of correct option (0=A, 1=B, 2=C, 3=D) for MCQ, or -1 for SPR" },
        correct_answer_text: { type: "string", description: "The correct text answer for SPR (e.g. '64', '12', '112/21'), or empty string for MCQ" }
    },
    required: ["module", "question_number", "question_type", "prompt", "option_a", "option_b", "option_c", "option_d", "correct_answer_index", "correct_answer_text"]
};

const readingQuestionSchema = {
    type: "object",
    properties: {
        module: { type: "integer", description: "Module number, either 1 or 2" },
        question_number: { type: "integer", description: "Question number" },
        passage: { type: "string", description: "The reading passage associated with this question. If there is no passage, leave empty." },
        prompt: { type: "string", description: "The question prompt text." },
        option_a: { type: "string", description: "Option A text" },
        option_b: { type: "string", description: "Option B text" },
        option_c: { type: "string", description: "Option C text" },
        option_d: { type: "string", description: "Option D text" },
        correct_answer_index: { type: "integer", description: "Index of correct option (0=A, 1=B, 2=C, 3=D)" }
    },
    required: ["module", "question_number", "passage", "prompt", "option_a", "option_b", "option_c", "option_d", "correct_answer_index"]
};

function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
}

function writeCSV(filePath, headers, rows) {
    const headerLine = headers.join(',') + '\n';
    const content = rows.map(row => row.map(escapeCSV).join(',')).join('\n') + '\n';
    fs.writeFileSync(filePath, headerLine + content, 'utf8');
}

async function convertMath(pdfPart, outputPrefix) {
    const responseSchema = {
        type: "array",
        items: mathQuestionSchema
    };

    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    // Pass 1: Extract Module 1
    console.log('🤖 Parsing Math Module 1 (Questions 1 to 22)...');
    const prompt1 = `
You are a professional SAT parser. Extract all 22 questions belonging to **Module 1** in the attached SAT Math PDF file.
For each question:
1. Extract prompt and choices. Format all mathematical symbols, formulas, superscripts, subscripts, fractions, and variables in standard LaTeX enclosed in \\( and \\) (e.g., \\(x^2\\) or \\(\\frac{w}{5}\\)).
2. CRITICAL INSTRUCTION FOR TABLES/GRAPHS/FIGURES: If a question contains a table of data, a graph, a diagram, or a figure, DO NOT include any text representations or markdown tables of that data/graph in the "prompt" field. Instead, extract ONLY the text portion of the question, and place the placeholder string "[image]" at the exact position where that table, graph, or figure was located in the original question text. The user will manually upload the table/graph as an image.
3. Find the correct answer from the Answer Sheet at the end of the PDF. Match the answer for Module 1, Questions 1-22.
4. If it is an MCQ, find the option letter (A, B, C, D) and convert it to index (0, 1, 2, 3).
5. If it is an SPR (fill in the blank), get the text answer (e.g. "64", "12").
`;

    const result1 = await model.generateContent([pdfPart, prompt1]);
    const module1Questions = JSON.parse(result1.response.text());
    console.log(`✅ Extracted ${module1Questions.length} questions for Module 1.`);

    // Pass 2: Extract Module 2
    console.log('🤖 Parsing Math Module 2 (Questions 1 to 22)...');
    const prompt2 = `
You are a professional SAT parser. Extract all 22 questions belonging to **Module 2** in the attached SAT Math PDF file.
For each question:
1. Extract prompt and choices. Format all mathematical symbols, formulas, superscripts, subscripts, fractions, and variables in standard LaTeX enclosed in \\( and \\) (e.g., \\(x^2\\) or \\(\\frac{w}{5}\\)).
2. CRITICAL INSTRUCTION FOR TABLES/GRAPHS/FIGURES: If a question contains a table of data, a graph, a diagram, or a figure, DO NOT include any text representations or markdown tables of that data/graph in the "prompt" field. Instead, extract ONLY the text portion of the question, and place the placeholder string "[image]" at the exact position where that table, graph, or figure was located in the original question text. The user will manually upload the table/graph as an image.
3. Find the correct answer from the Answer Sheet at the end of the PDF. Match the answer for Module 2, Questions 1-22.
4. If it is an MCQ, find the option letter (A, B, C, D) and convert it to index (0, 1, 2, 3).
5. If it is an SPR (fill in the blank), get the text answer (e.g. "64", "12").
`;

    const result2 = await model.generateContent([pdfPart, prompt2]);
    const module2Questions = JSON.parse(result2.response.text());
    console.log(`✅ Extracted ${module2Questions.length} questions for Module 2.`);

    const allQuestions = [...module1Questions, ...module2Questions];
    allQuestions.sort((a, b) => {
        if (a.module !== b.module) return a.module - b.module;
        return a.question_number - b.question_number;
    });

    console.log(`📊 Processing ${allQuestions.length} total questions...`);

    const mcqQuestions = allQuestions.filter(q => q.question_type === 'mcq');
    const sprQuestions = allQuestions.filter(q => q.question_type === 'spr');

    // 1. Write MCQ CSV
    const mcqHeaders = ['module', 'question_number', 'prompt', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer_index', 'image_url', 'question_type'];
    const mcqRows = mcqQuestions.map(q => [
        q.module, q.question_number, q.prompt,
        q.option_a, q.option_b, q.option_c, q.option_d,
        q.correct_answer_index, '', 'mcq'
    ]);
    const mcqPath = `${outputPrefix}_mcq.csv`;
    writeCSV(mcqPath, mcqHeaders, mcqRows);
    console.log(`📁 Saved MCQ CSV: ${mcqPath} (${mcqQuestions.length} questions)`);

    // 2. Write SPR CSV
    const sprHeaders = ['module', 'question_number', 'prompt', 'correct_answer_text', 'image_url', 'question_type'];
    const sprRows = sprQuestions.map(q => [
        q.module, q.question_number, q.prompt,
        q.correct_answer_text, '', 'spr'
    ]);
    const sprPath = `${outputPrefix}_spr.csv`;
    writeCSV(sprPath, sprHeaders, sprRows);
    console.log(`📁 Saved SPR CSV: ${sprPath} (${sprQuestions.length} questions)`);

    // 3. Write Unified CSV
    const allHeaders = ['module', 'question_number', 'prompt', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer_index', 'correct_answer_text', 'image_url', 'question_type'];
    const allRows = allQuestions.map(q => [
        q.module, q.question_number, q.prompt,
        q.option_a, q.option_b, q.option_c, q.option_d,
        q.question_type === 'mcq' ? q.correct_answer_index : '',
        q.question_type === 'spr' ? q.correct_answer_text : '',
        '', q.question_type
    ]);
    const allPath = `${outputPrefix}.csv`;
    writeCSV(allPath, allHeaders, allRows);
    console.log(`📁 Saved Unified CSV: ${allPath} (${allQuestions.length} questions)`);
}

async function convertReading(pdfPart, outputPrefix) {
    const responseSchema = {
        type: "array",
        items: readingQuestionSchema
    };

    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    // Pass 1: Extract Module 1
    console.log('🤖 Parsing Reading Module 1 (Questions 1 to 27)...');
    const prompt1 = `
You are a professional SAT parser. Extract all 27 questions belonging to **Module 1** in the attached SAT Reading & Writing PDF file.
For each question:
1. Extract the passage, the prompt, and the options (A, B, C, D).
2. CRITICAL INSTRUCTION FOR TABLES/GRAPHS/FIGURES: If a question contains a table of data, a graph, a diagram, or a figure, DO NOT include any text representations or markdown tables of that data/graph in the "prompt" field. Instead, extract ONLY the text portion of the question, and place the placeholder string "[image]" at the exact position where that table, graph, or figure was located in the original question text.
3. Find the correct answer from the Answer Sheet at the end of the PDF. Match the answer for Module 1, Questions 1-27, and convert the letter (A, B, C, D) to index (0, 1, 2, 3).
`;

    const result1 = await model.generateContent([pdfPart, prompt1]);
    const module1Questions = JSON.parse(result1.response.text());
    console.log(`✅ Extracted ${module1Questions.length} questions for Module 1.`);

    // Pass 2: Extract Module 2
    console.log('🤖 Parsing Reading Module 2 (Questions 1 to 27)...');
    const prompt2 = `
You are a professional SAT parser. Extract all 27 questions belonging to **Module 2** in the attached SAT Reading & Writing PDF file.
For each question:
1. Extract the passage, the prompt, and the options (A, B, C, D).
2. CRITICAL INSTRUCTION FOR TABLES/GRAPHS/FIGURES: If a question contains a table of data, a graph, a diagram, or a figure, DO NOT include any text representations or markdown tables of that data/graph in the "prompt" field. Instead, extract ONLY the text portion of the question, and place the placeholder string "[image]" at the exact position where that table, graph, or figure was located in the original question text.
3. Find the correct answer from the Answer Sheet at the end of the PDF. Match the answer for Module 2, Questions 1-27, and convert the letter (A, B, C, D) to index (0, 1, 2, 3).
`;

    const result2 = await model.generateContent([pdfPart, prompt2]);
    const module2Questions = JSON.parse(result2.response.text());
    console.log(`✅ Extracted ${module2Questions.length} questions for Module 2.`);

    const allQuestions = [...module1Questions, ...module2Questions];
    allQuestions.sort((a, b) => {
        if (a.module !== b.module) return a.module - b.module;
        return a.question_number - b.question_number;
    });

    console.log(`📊 Processing ${allQuestions.length} total questions...`);

    const headers = ['module', 'question_number', 'passage', 'prompt', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'image_url'];
    const rows = allQuestions.map(q => [
        q.module, q.question_number, q.passage || '', q.prompt,
        q.option_a, q.option_b, q.option_c, q.option_d,
        q.correct_answer_index, ''
    ]);
    const allPath = `${outputPrefix}.csv`;
    writeCSV(allPath, headers, rows);
    console.log(`📁 Saved Reading CSV: ${allPath} (${allQuestions.length} questions)`);
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node convert_gemini.js <path_to_pdf> <math|reading> [<output_prefix>]');
        console.log('Example: node convert_gemini.js "question/2026 May v2 Math.pdf" math');
        process.exit(1);
    }

    const pdfPath = args[0];
    const type = args[1].toLowerCase();
    let outputPrefix = args[2];

    if (type !== 'math' && type !== 'reading') {
        console.error('❌ Error: type must be either "math" or "reading"');
        process.exit(1);
    }

    if (!outputPrefix) {
        const ext = path.extname(pdfPath);
        outputPrefix = pdfPath.slice(0, pdfPath.length - ext.length);
    }

    console.log("============================================================");
    console.log("🎓 SAT PDF to CSV Gemini Converter");
    console.log("============================================================");
    console.log(`📄 File PDF : ${pdfPath}`);
    console.log(`📝 Subject  : ${type === 'math' ? 'Math' : 'Reading & Writing'}`);
    console.log(`💾 Output   : ${outputPrefix}.csv`);
    console.log("============================================================");

    const pdfPart = fileToGenerativePart(pdfPath, 'application/pdf');

    if (type === 'math') {
        await convertMath(pdfPart, outputPrefix);
    } else {
        await convertReading(pdfPart, outputPrefix);
    }
    console.log('🎉 All tasks completed successfully!');
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
});
