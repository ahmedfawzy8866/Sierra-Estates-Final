import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.next', 'dist', '.git', 'scripts'].includes(file)) {
        results = results.concat(walk(full));
      }
    } else {
      if (full.endsWith('.ts') || full.endsWith('.tsx')) {
        results.push(full);
      }
    }
  }
  return results;
}

const files = walk('.');

let count = 0;
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if (content.match(/console\.(log|error|warn|info)\(/)) {
    // Add import if not present
    if (!content.includes('import { logger }')) {
      const importLine = `import { logger } from '@/lib/logger';`;
      const lines = content.split('\n');
      let lastImport = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImport = i;
        }
      }
      if (lastImport !== -1) {
        lines.splice(lastImport + 1, 0, importLine);
      } else {
        lines.unshift(importLine);
      }
      content = lines.join('\n');
    }
    
    // Replace
    content = content.replace(/console\.log\(/g, 'logger.info(');
    content = content.replace(/console\.error\(/g, 'logger.error(');
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    content = content.replace(/console\.info\(/g, 'logger.info(');
    
    fs.writeFileSync(f, content);
    count++;
  }
}
console.log(`Done replacing consoles in ${count} files.`);
