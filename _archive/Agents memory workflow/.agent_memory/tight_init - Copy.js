const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'i-sierra-2027');

// 1. Build directory tree structures securely
['.agent_memory', '.antigravity/skills', '.github/workflows', 'backend-integration', 'components'].forEach(d => fs.mkdirSync(path.join(root, d), { recursive: true }));

// 2. Set memory core status parameters
fs.writeFileSync(path.join(root, '.agent_memory/experience_core.md'), `# 📅 i-SIERRA-2027 MEMORY CORE\n- [Rule]: Master project root active.\n- [Proxy]: Port 8964 context secured.\n`, 'utf8');

// 3. Write core Antigravity micro skill node
fs.writeFileSync(path.join(root, '.antigravity/skills/sierra_integration.js'), `export class SierraAntigravityBridge { constructor() { console.log("i-Sierra 2027 active."); } }`, 'utf8');

// 4. Secure Property Finder primary configuration variables
fs.writeFileSync(path.join(root, 'backend-integration/integration_config.py'), `PROPERTY_FINDER_API_KEY = "YHDNf.LadthM6TyLlAOs8fqQu8IpTt65yhzXE9ae"\nBASE_LISTINGS_URL = "https://www.sierra-blu.com/listings"\n`, 'utf8');

// 5. Build premium Next.js filter component (No maps, direct form matching actions)
const filterCode = `import React, { useState } from 'react';
export default function HeroFilter() {
  const [type, setType] = useState('Golf Villa');
  const [view, setView] = useState('Full Golf Course');
  return (
    <section className="w-full bg-slate-950 text-white p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl font-sans">
      <div className="mb-6">
        <span className="text-amber-500 text-xs font-bold uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Emaar • Uptown Cairo</span>
        <h1 className="text-3xl md:text-5xl font-light mt-3">Signature <span className="font-semibold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">Golf Views</span></h1>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); window.location.href=\`https://www.sierra-blu.com/listings?type=${type}&view=\${view}\`; }} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/10 items-end backdrop-blur-xl">
        <div className="flex flex-col"><label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Type</label><select value={type} onChange={e=>setType(e.target.value)} className="bg-transparent text-sm mt-1 cursor-pointer focus:outline-none"><option value="Golf Villa" className="bg-slate-950">Golf Villa</option><option value="Premium Apartment" className="bg-slate-950">Premium Apartment</option></select></div>
        <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4"><label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">View</label><select value={view} onChange={e=>setView(e.target.value)} className="bg-transparent text-sm mt-1 cursor-pointer focus:outline-none"><option value="Full Golf Course" className="bg-slate-950">Full Golf Course</option><option value="Skyline" className="bg-slate-950">Skyline</option></select></div>
        <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-transform transform active:scale-95 shadow-md">Find Match with AI</button>
      </form>
    </section>
  );
}`;
fs.writeFileSync(path.join(root, 'components/HeroFilter.tsx'), filterCode, 'utf8');

// 6. Establish localized deployment safety workflow profile
fs.writeFileSync(path.join(root, '.github/workflows/integration.yml'), `name: Build\non: [push]\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n`, 'utf8');

console.log("🚀 [SUCCESS] Local workspace engine 'i-sierra-2027' generated cleanly with zero text bloat.");