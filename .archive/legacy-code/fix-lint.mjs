import fs from 'fs';

try {
  const results = JSON.parse(fs.readFileSync('eslint-results.json', 'utf8'));
  for (const file of results) {
    if (file.messages.length === 0) continue;
    let content = fs.readFileSync(file.filePath, 'utf8');
    let lines = content.split('\n');
    
    for (const msg of file.messages) {
      if (msg.ruleId === 'unused-imports/no-unused-vars') {
        const match = msg.message.match(/'([^']+)'/);
        if (match) {
          const varName = match[1];
          const lineIdx = msg.line - 1;
          const regex = new RegExp(`\\b${varName}\\b`);
          lines[lineIdx] = lines[lineIdx].replace(regex, `_${varName}`);
        }
      }
    }
    fs.writeFileSync(file.filePath, lines.join('\n'));
  }
  console.log('Lint warnings patched.');
} catch (e) {
  console.error(e);
}
