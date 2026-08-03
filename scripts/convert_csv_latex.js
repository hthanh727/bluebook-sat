require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is not defined in .env file!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function convertCsvLatex(filePath) {
    const csvContent = fs.readFileSync(filePath, 'utf8');

    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
            temperature: 0.1
        }
    });

    const prompt = `
You are a professional SAT Math content formatter. I will provide a CSV file containing SAT Math questions.
Your task is to take the EXACT same CSV structure and text, and only format all mathematical symbols, equations, formulas, fractions, numbers in a math context, superscripts, subscripts, and variables into standard LaTeX enclosed in \\( and \\) (e.g., \\(x^2\\), \\(\\frac{w}{5}\\), \\(y < 3x + 12\\)).
DO NOT change the columns, do not change the number of rows, do not modify the non-math text. Just output the exact same CSV with math correctly formatted in LaTeX.
Return ONLY the raw CSV text, without markdown code blocks, without any explanations.

Original CSV:
${csvContent}
`;

    try {
        const result = await model.generateContent(prompt);
        let outputText = result.response.text();
        
        // Remove markdown block if it exists
        if (outputText.startsWith('\`\`\`csv')) {
            outputText = outputText.substring(7);
        } else if (outputText.startsWith('\`\`\`')) {
            outputText = outputText.substring(3);
        }
        if (outputText.endsWith('\`\`\`')) {
            outputText = outputText.substring(0, outputText.length - 3);
        }
        
        outputText = outputText.trim() + '\n';
        
        fs.writeFileSync(filePath, outputText, 'utf8');
        console.log(`✅ Successfully formatted LaTeX for: ${filePath}`);
    } catch (e) {
        console.error(`❌ Error formatting ${filePath}:`, e.message);
        throw e;
    }
}

async function main() {
    const csvDir = 'question/Math/pdf/csv';
    const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv') && !f.endsWith('_mcq.csv') && !f.endsWith('_spr.csv'));

    console.log(`Found ${files.length} CSV files to process.`);
    
    for (const file of files) {
        const filePath = path.join(csvDir, file);
        console.log(`Processing: ${file}...`);
        
        let success = false;
        let retries = 3;
        
        while (!success && retries > 0) {
            try {
                await convertCsvLatex(filePath);
                success = true;
                console.log("Waiting 15 seconds to avoid rate limits...");
                await sleep(15000);
            } catch (err) {
                retries--;
                if (retries > 0) {
                    console.log(`Rate limit or error hit. Retrying in 30 seconds... (${retries} retries left)`);
                    await sleep(30000);
                } else {
                    console.log(`Failed to process ${file} after 3 retries.`);
                }
            }
        }
    }
    console.log('🎉 All CSVs processed!');
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
});
