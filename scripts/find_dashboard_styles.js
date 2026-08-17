const fs = require('fs');
const content = fs.readFileSync('public/dashboard.html', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('math-badge') || line.includes('reading-badge') || line.includes('math-card') || line.includes('math-btn')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
