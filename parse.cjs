const fs = require('fs');
let text = fs.readFileSync('eslint-report2.json', 'utf8');
const data = JSON.parse(text);
data.forEach(f => {
  if (f.errorCount > 0 || f.warningCount > 0) {
    console.log(f.filePath);
    f.messages.forEach(m => console.log(`  ${m.line}:${m.column} ${m.severity === 2 ? 'error' : 'warning'} ${m.ruleId} ${m.message}`));
    console.log('');
  }
});
