const fs = require('fs');
const data = JSON.parse(fs.readFileSync('eslint-report.json', 'utf16le'));
data.forEach(f => {
  if (f.errorCount > 0 || f.warningCount > 0) {
    console.log(f.filePath);
    f.messages.forEach(m => console.log(`  ${m.line}:${m.column} ${m.severity === 2 ? 'error' : 'warning'} ${m.message} (${m.ruleId})`));
    console.log('');
  }
});
