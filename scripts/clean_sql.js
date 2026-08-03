const fs = require('fs');
let sql = fs.readFileSync('bluebook_db.sql', 'utf8');

// Remove SET statements that Aiven blocks
sql = sql.replace(/^SET .*;$/gm, '');
sql = sql.replace(/^START TRANSACTION;$/gm, '');
sql = sql.replace(/^COMMIT;$/gm, '');
// Remove phpMyAdmin specific comments that contain SET
sql = sql.replace(/^\/\*\!40101 SET .*\*\/;$/gm, '');

fs.writeFileSync('bluebook_db_clean.sql', sql);
console.log('Cleaned SQL dump aggressively!');
