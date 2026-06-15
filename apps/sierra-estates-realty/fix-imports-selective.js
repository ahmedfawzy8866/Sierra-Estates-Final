const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const dir = 'f:/Sierra Estates/i-sierra-2027/sierra-estates-final/apps/sierra-estates-realty';
const files = walk(dir);

const designSystemComponents = [
    'AboutPhilosophy',
    'FeaturedEstates',
    'Footer',
    'GlassCard',
    'Layout',
    'LuxuryButton',
    'LuxurySkeleton',
    'MotionText',
    'Navbar',
    'PremiumHero',
    'Typography',
    'ValuationTeaser'
];

let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Normalize newlines to prevent weird matching
    let normalized = content.replace(/\r\n/g, '\n');
    
    // Replace absolute imports to components/UI
    const regex = /import\s+({?[^;'\"\n]+}?)\s+from\s+['\"]@\/components\/UI\/([^'\"]+)['\"]/g;
    normalized = normalized.replace(regex, (match, imports, componentName) => {
        let cleanName = componentName.replace(/\.tsx?$/, '');
        if (designSystemComponents.includes(cleanName)) {
            changed = true;
            let newImports = imports.trim();
            if (!newImports.startsWith('{')) newImports = '{ ' + newImports + ' }';
            return 'import ' + newImports + ' from \'@sierra-estates/ui\'';
        }
        return match;
    });
    
    // Replace relative imports to components/UI
    const relativeRegex = /import\s+({?[^;'\"\n]+}?)\s+from\s+['\"](?:\.\.\/)+UI\/([^'\"]+)['\"]/g;
    normalized = normalized.replace(relativeRegex, (match, imports, componentName) => {
        let cleanName = componentName.replace(/\.tsx?$/, '');
        if (designSystemComponents.includes(cleanName)) {
            changed = true;
            let newImports = imports.trim();
            if (!newImports.startsWith('{')) newImports = '{ ' + newImports + ' }';
            return 'import ' + newImports + ' from \'@sierra-estates/ui\'';
        }
        return match;
    });
    
    if (normalized.includes('import { MCPProvider } from \'@/lib/mcp/MCPContext\';')) {
        normalized = normalized.replace('import { MCPProvider } from \'@/lib/mcp/MCPContext\';', 'import { MCPProvider } from \'@sierra-estates/agents-core\';');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, normalized, 'utf8');
        count++;
    }
});
console.log('Fixed imports in ' + count + ' files.');
