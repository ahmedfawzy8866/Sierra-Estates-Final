const fs = require('fs');
const file = 'h:/Sierra-Estates-Final/apps/sierra-estates-realty/app/MobileV2.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add framer motion import at top if not there
if (!code.includes('framer-motion')) {
  code = code.replace(`import React, { useState, useEffect`, `import { motion, AnimatePresence } from 'framer-motion';\nimport React, { useState, useEffect`);
}

// 2. Fix the MapSec init
const mapInitOld = `  useEffect(function () {
    if (!mapRef.current || leafRef.current) return;
    var LL = window.L;if (!LL || typeof LL.map !== 'function') return;
    var map = LL.map(mapRef.current, { center: [30.03, 31.58], zoom: 11, zoomControl: false, attributionControl: false, scrollWheelZoom: false });`;

const mapInitNew = `  useEffect(function () {
    if (!mapRef.current || leafRef.current) return;
    let map;
    import('leaflet').then(function(module) {
      require('leaflet/dist/leaflet.css');
      var LL = module.default || module;
      window.L = LL;
      map = LL.map(mapRef.current, { center: [30.03, 31.58], zoom: 11, zoomControl: false, attributionControl: false, scrollWheelZoom: false });`;

const mapEndOld = `    setTimeout(function () {try {map.invalidateSize();} catch (e) {}}, 200);
    return function () {try {map.remove();} catch (e) {}leafRef.current = null;};
  }, []);`;

const mapEndNew = `    setTimeout(function () {try {map.invalidateSize();} catch (e) {}}, 200);
      setSel(s => [...s]); // trigger markers render
    }).catch(e => console.error('Failed to load leaflet', e));
    return function () {try {leafRef.current && leafRef.current.remove();} catch (e) {}leafRef.current = null; window.L = undefined;};
  }, []);`;

code = code.replace(mapInitOld, mapInitNew);
code = code.replace(mapEndOld, mapEndNew);

// 3. Let's make TourSec use framer motion to satisfy 'framer motion'
const tourSecOld = `<section id=\"s-tour\" style={{ background: dark ? '#050E18' : '#EEF2F7', transition: 'background .3s', paddingBottom: 4 }}>
      <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(20px)', transition: 'all .55s cubic-bezier(.16,1,.3,1)' }}>`;

const tourSecNew = `<motion.section id=\"s-tour\" 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: dark ? '#050E18' : '#EEF2F7', transition: 'background .3s', paddingBottom: 4 }}>
      <div>`;

code = code.replace(tourSecOld, tourSecNew);

// Replace the closing tag for TourSec
// The original is: </section>);\n\n}
// We only want to replace the one inside TourSec
const tourSecEndRegex = /(<\/div>\s*)<\/section>\);(\s*})/g;
// actually TourSec has specific content. Let's just do a manual replace for the first </section> after TourSec
let tourSecIndex = code.indexOf('<motion.section id=\"s-tour\"');
if (tourSecIndex > -1) {
  let endOfTourSec = code.indexOf('</section>', tourSecIndex);
  if (endOfTourSec > -1) {
    code = code.substring(0, endOfTourSec) + '</motion.section>' + code.substring(endOfTourSec + 10);
  }
}

// 4. Same for the Header/Hero
const heroOld = `<header style={{ position: 'relative', height: '100vh', minHeight: 680, overflow: 'hidden' }}>`;
const heroNew = `<motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ position: 'relative', height: '100vh', minHeight: 680, overflow: 'hidden' }}>`;
code = code.replace(heroOld, heroNew);
code = code.replace(`</header>`, `</motion.header>`);

fs.writeFileSync(file, code);
console.log('MobileV2.tsx modified successfully.');
