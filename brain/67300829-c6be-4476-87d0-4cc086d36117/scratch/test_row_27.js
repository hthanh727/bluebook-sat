const fs = require('fs');

function parseCSV(csv) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    const cleanCsv = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < cleanCsv.length; i++) {
        const char = cleanCsv[i];
        const nextChar = cleanCsv[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentField.trim());
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }
    return rows;
}

const csvData = fs.readFileSync('question/Reading/F M2 026.csv', 'utf8');
const rows = parseCSV(csvData);
console.log("Row 27 length:", rows[27].length);
rows[27].forEach((val, idx) => {
    console.log(`Col ${idx}:`, JSON.stringify(val));
});
