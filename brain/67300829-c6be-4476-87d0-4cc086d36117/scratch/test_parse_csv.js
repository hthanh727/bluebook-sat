const fs = require('fs');

function parseCSV(csv) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    // Standardize line endings to \n
    const cleanCsv = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < cleanCsv.length; i++) {
        const char = cleanCsv[i];
        const nextChar = cleanCsv[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped double quote
                currentField += '"';
                i++; // skip next quote
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            currentRow.push(currentField.trim());
            currentField = '';
        } else if (char === '\n' && !inQuotes) {
            // End of row
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
console.log("Total parsed rows:", rows.length);
for (let i = 0; i < Math.min(10, rows.length); i++) {
    console.log(`Row ${i}: length ${rows[i].length} | values:`, rows[i].slice(0, 3));
}
