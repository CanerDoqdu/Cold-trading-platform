const fs = require('fs');
const path = require('path');

const reportsDir = './lighthouse-reports';
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));

console.log('\n========== LIGHTHOUSE ANALYSIS ==========\n');

const allIssues = new Set();

files.forEach(file => {
    try {
        const j = JSON.parse(fs.readFileSync(path.join(reportsDir, file)));
        const name = file.replace('.json', '').toUpperCase();
        const perf = Math.round(j.categories.performance.score * 100);
        const acc = Math.round(j.categories.accessibility.score * 100);
        const bp = Math.round(j.categories['best-practices'].score * 100);
        const seo = Math.round(j.categories.seo.score * 100);
        
        const perfColor = perf >= 90 ? '\x1b[32m' : perf >= 50 ? '\x1b[33m' : '\x1b[31m';
        const accColor = acc >= 90 ? '\x1b[32m' : '\x1b[31m';
        const bpColor = bp >= 90 ? '\x1b[32m' : '\x1b[31m';
        const seoColor = seo >= 90 ? '\x1b[32m' : '\x1b[31m';
        const reset = '\x1b[0m';
        
        console.log(`=== ${name} ===`);
        console.log(`${perfColor}Performance: ${perf}%${reset} | ${accColor}Accessibility: ${acc}%${reset} | ${bpColor}Best Practices: ${bp}%${reset} | ${seoColor}SEO: ${seo}%${reset}`);
        
        // Find failed audits
        Object.entries(j.audits).forEach(([key, audit]) => {
            if (audit.score === 0 && audit.scoreDisplayMode !== 'informative' && audit.scoreDisplayMode !== 'notApplicable') {
                allIssues.add(audit.title);
            }
        });
        
        console.log('');
    } catch(e) {
        console.log(`Error reading ${file}: ${e.message}`);
    }
});

console.log('\n========== ALL ISSUES TO FIX ==========\n');
allIssues.forEach(issue => console.log(`❌ ${issue}`));

console.log('\n========== PRIORITY FIXES ==========\n');
const priorityFixes = [
    { issue: 'Document does not have a meta description', fix: 'Add meta description to layout.tsx' },
    { issue: 'Browser errors were logged to the console', fix: 'Fix console errors (401s, TradingView)' },
    { issue: 'Minify JavaScript', fix: 'Production build will handle this' },
    { issue: 'Reduce unused JavaScript', fix: 'Dynamic imports, code splitting' },
    { issue: 'Missing source maps', fix: 'Enable in next.config.mjs for production' },
];

priorityFixes.forEach(p => {
    if (Array.from(allIssues).some(i => i.includes(p.issue.substring(0, 20)))) {
        console.log(`🔧 ${p.issue}`);
        console.log(`   → ${p.fix}\n`);
    }
});
