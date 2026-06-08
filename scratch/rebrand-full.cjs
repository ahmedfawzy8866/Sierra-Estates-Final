const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = 'f:/Final/i-sierra-2027';

function walk(dir) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(function(file) {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) { 
                if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next') && !file.includes('.turbo') && !file.includes('.vercel')) {
                    results = results.concat(walk(file));
                    results.push({ type: 'dir', path: file });
                }
            } else { 
                results.push({ type: 'file', path: file });
            }
        });
    } catch(e) {}
    return results;
}

const allItems = walk(targetDir);
const files = allItems.filter(i => i.type === 'file').map(i => i.path);
const dirs = allItems.filter(i => i.type === 'dir').map(i => i.path);

let contentCount = 0;
files.forEach(file => {
    try {
        const ext = path.extname(file).toLowerCase();
        const excludeExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.pdf', '.mp4', '.woff', '.woff2', '.ttf'];
        if (excludeExts.includes(ext)) return;

        let content = fs.readFileSync(file, 'utf8');
        
        let newContent = content
            .replace(/Sierra Estates/g, 'Sierra Estates')
            .replace(/Sierra Estatese/g, 'Sierra Estates')
            .replace(/sierra estates/gi, 'sierra estates')
            .replace(/SierraEstates/g, 'SierraEstates')
            .replace(/sierraestates/gi, 'sierraestates')
            .replace(/sierra-estates/g, 'sierra-estates')
            .replace(/sierra-estatese/gi, 'sierra-estates')
            .replace(/sierra_estates/gi, 'sierra_estates')
            .replace(/sierra estates/g, 'SIERRA ESTATES')
            .replace(/sierra estatesE/g, 'SIERRA ESTATES')
            .replace(/SIERRA-ESTATES/g, 'SIERRA-ESTATES');
            
        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            contentCount++;
            console.log(`Updated content: ${file}`);
        }
    } catch(e) {}
});

console.log(`\nSuccessfully modified content in ${contentCount} files.`);

// Now rename files and directories
let renameCount = 0;
// We must sort by path length descending to rename deepest files/folders first!
const allPaths = [...files, ...dirs].sort((a, b) => b.length - a.length);

allPaths.forEach(filePath => {
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath);
    
    let newBasename = basename
            .replace(/Sierra Estates/g, 'Sierra Estates')
            .replace(/Sierra Estatese/g, 'Sierra Estates')
            .replace(/sierra estates/gi, 'sierra estates')
            .replace(/SierraEstates/g, 'SierraEstates')
            .replace(/sierraestates/gi, 'sierraestates')
            .replace(/sierra-estates/g, 'sierra-estates')
            .replace(/sierra-estatese/gi, 'sierra-estates')
            .replace(/sierra_estates/gi, 'sierra_estates')
            .replace(/sierra estates/g, 'SIERRA ESTATES')
            .replace(/sierra estatesE/g, 'SIERRA ESTATES')
            .replace(/SIERRA-ESTATES/g, 'SIERRA-ESTATES');
            
    if (basename !== newBasename) {
        const newPath = path.join(dir, newBasename);
        try {
            execSync(`git mv "${filePath}" "${newPath}"`, { cwd: targetDir, stdio: 'ignore' });
            console.log(`Git mv: ${basename} -> ${newBasename}`);
            renameCount++;
        } catch(e) {
            try {
                fs.renameSync(filePath, newPath);
                console.log(`FS rename: ${basename} -> ${newBasename}`);
                renameCount++;
            } catch(err) {}
        }
    }
});

console.log(`\nSuccessfully renamed ${renameCount} files/directories.`);
