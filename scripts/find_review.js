const fs = require('fs');

function find(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n');
    console.log(`--- Matches in ${filename} ---`);
    lines.forEach((line, idx) => {
        if (line.includes('review') || line.includes('reviewMode') || line.includes('review-btn')) {
            console.log(`${idx + 1}: ${line.trim()}`);
        }
    });
}

find('public/app.js');
find('public/app-math.js');
find('public/app-practice.js');
