require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const questionItemSchema = {
  type: "object",
  properties: {
    question_number: { type: "integer", description: "The original question number from the PDF (e.g. 1, 8, 10, 165)" },
    prompt: {
      type: "string",
      description: "Complete question prompt. ALL math symbols, variables, formulas, powers (e.g. x^2), fractions (e.g. \\frac{a}{b}), coordinates, and math expressions MUST be in standard LaTeX \\( ... \\). Tables must be formatted as markdown tables."
    },
    option_a: { type: "string", description: "Option A text formatted with LaTeX \\( ... \\) if mathematical, or empty string if SPR" },
    option_b: { type: "string", description: "Option B text formatted with LaTeX \\( ... \\) if mathematical, or empty string if SPR" },
    option_c: { type: "string", description: "Option C text formatted with LaTeX \\( ... \\) if mathematical, or empty string if SPR" },
    option_d: { type: "string", description: "Option D text formatted with LaTeX \\( ... \\) if mathematical, or empty string if SPR" }
  },
  required: ["question_number", "prompt", "option_a", "option_b", "option_c", "option_d"]
};

const responseSchema = {
  type: "array",
  items: questionItemSchema
};

const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: responseSchema
  }
});

const promptText = `
You are an expert SAT Math parser and typesetter. You are given a PDF slice containing SAT Math questions.
Extract ALL questions that appear in this PDF slice.

CRITICAL FORMATTING RULES:
1. Standard LaTeX for ALL math expressions:
   - Enclose ALL formulas, equations, variables, powers (e.g. \\(x^2\\), \\(34z^{14}\\)), fractions (e.g. \\(\\frac{numerator}{denominator}\\)), roots (e.g. \\(\\sqrt{w+19}\\)), coordinates (e.g. \\((0, -\\frac{75}{7})\\)), inequalities (e.g. \\(a \\leq 3\\)), and standalone numbers in mathematical context in standard LaTeX \\( ... \\).
   - Fractions MUST be formatted as \\(\\frac{numerator}{denominator}\\). NEVER split numerator and denominator across lines.
   - For text tables, use clean standard Markdown table format.
2. Options for Multiple Choice Questions:
   - Set option_a, option_b, option_c, option_d.
   - Use LaTeX \\( ... \\) for any mathematical symbols, formulas, or numbers in the options.
   - If the question is a Student-Produced Response (SPR / grid-in) with no choices, set option_a, option_b, option_c, option_d to "".
3. If a question is cut off at the very end of the slice and incomplete, but you can see its full text from previous pages or context, extract it. Otherwise, extract all questions that have their prompt on these pages.
`;

async function processChunk(filePath, chunkIdx) {
  const cachePath = path.join(__dirname, '..', 'pdf_chunks', `results_chunk_${String(chunkIdx).padStart(2, '0')}.json`);
  if (fs.existsSync(cachePath)) {
    console.log(`[Chunk ${chunkIdx}] Found cached result: ${cachePath}`);
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }

  console.log(`[Chunk ${chunkIdx}] Processing ${path.basename(filePath)} with Gemini...`);
  const pdfBuffer = fs.readFileSync(filePath);
  const pdfPart = {
    inlineData: {
      data: pdfBuffer.toString('base64'),
      mimeType: 'application/pdf'
    }
  };

  let retries = 3;
  while (retries > 0) {
    try {
      const res = await model.generateContent([pdfPart, promptText]);
      const jsonText = res.response.text();
      const parsed = JSON.parse(jsonText);
      fs.writeFileSync(cachePath, JSON.stringify(parsed, null, 2), 'utf8');
      console.log(`[Chunk ${chunkIdx}] Success! Extracted ${parsed.length} questions.`);
      return parsed;
    } catch (err) {
      console.error(`[Chunk ${chunkIdx}] Error: ${err.message}. Retrying in 5s...`);
      retries--;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  throw new Error(`Failed chunk ${chunkIdx}`);
}

async function main() {
  const chunkFiles = fs.readdirSync(path.join(__dirname, '..', 'pdf_chunks'))
    .filter(f => f.startsWith('chunk_') && f.endsWith('.pdf'))
    .sort();

  console.log(`Found ${chunkFiles.length} chunks to process.`);
  const allResults = [];

  for (let i = 0; i < chunkFiles.length; i++) {
    const chunkFile = path.join(__dirname, '..', 'pdf_chunks', chunkFiles[i]);
    const items = await processChunk(chunkFile, i);
    allResults.push(...items);
    // Slight pause to respect rate limits
    await new Promise(r => setTimeout(r, 1200));
  }

  // Deduplicate and merge by question_number
  console.log(`Total questions extracted across all chunks: ${allResults.length}`);
  const qMap = new Map();

  for (const item of allResults) {
    const qNum = item.question_number;
    if (!qNum) continue;

    if (!qMap.has(qNum)) {
      qMap.set(qNum, item);
    } else {
      // Pick the more complete one (longer prompt or having choices)
      const existing = qMap.get(qNum);
      const curScore = (item.prompt || '').length + (item.option_a ? 100 : 0);
      const exScore = (existing.prompt || '').length + (existing.option_a ? 100 : 0);
      if (curScore > exScore) {
        qMap.set(qNum, item);
      }
    }
  }

  const sortedQuestions = Array.from(qMap.values()).sort((a, b) => a.question_number - b.question_number);
  console.log(`Unique questions deduplicated: ${sortedQuestions.length}`);

  const outPath = path.join(__dirname, '..', 'scratch_all_latex_questions.json');
  fs.writeFileSync(outPath, JSON.stringify(sortedQuestions, null, 2), 'utf8');
  console.log(`Saved deduplicated LaTeX questions to ${outPath}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
