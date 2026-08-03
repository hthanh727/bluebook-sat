const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const csvDir = 'question/Math/pdf/csv';
const pdfDir = 'question/Math/pdf';

const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBatch() {
    console.log("Waiting 30 seconds for rate limit to reset before starting...");
    await sleep(30000);

    for (const file of files) {
        const baseName = path.basename(file, '.pdf');
        const pdfFile = path.join(pdfDir, file);
        
        if (fs.existsSync(pdfFile)) {
            console.log('==================================');
            console.log('Processing', pdfFile);
            try {
                const outPrefix = path.join(csvDir, baseName).replace(/\\/g, '/');
                const pdfFileFmt = pdfFile.replace(/\\/g, '/');
                
                console.log("Extracting graph images...");
                execSync(`python extract_graphs.py "${pdfFileFmt}"`, { stdio: 'inherit' });
                
                console.log("Running Gemini parsing...");
                execSync(`node convert_gemini.js "${pdfFileFmt}" math "${outPrefix}"`, { stdio: 'inherit' });
                
                console.log("Waiting 35 seconds to avoid Gemini API rate limits...");
                await sleep(35000);
            } catch (e) {
                console.error('Error on', pdfFile);
                console.log("Waiting 60 seconds after error...");
                await sleep(60000);
            }
        } else {
            console.log('Missing PDF for', file);
        }
    }
    console.log("Batch processing complete.");
}

runBatch();
