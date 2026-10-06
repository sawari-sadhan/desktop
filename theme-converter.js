const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/(protected)/console/attribute/[code]/components');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/text-white/g, 'text-slate-900');
      content = content.replace(/bg-white\/5/g, 'bg-white');
      content = content.replace(/border-white\/10/g, 'border-slate-200');
      content = content.replace(/border-white\/5/g, 'border-slate-200');
      content = content.replace(/hover:bg-white\/10/g, 'hover:bg-slate-50');
      content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-slate-50');
      content = content.replace(/text-slate-400/g, 'text-slate-500');
      content = content.replace(/text-slate-300/g, 'text-slate-600');
      content = content.replace(/bg-white\/10/g, 'bg-slate-100');
      content = content.replace(/border-white\/20/g, 'border-blue-200');
      content = content.replace(/hover:text-white/g, 'hover:text-slate-900');
      content = content.replace(/rgba\(255,255,255,0\.04\)/g, '"rgba(0,0,0,0.03)"');
      content = content.replace(/rgba\(255, 255, 255, 0\.04\)/g, '"rgba(0,0,0,0.03)"');
      content = content.replace(/border-t-white\/5/g, 'border-t-slate-200');
      content = content.replace(/border-t border-white\/5/g, 'border-t border-slate-100');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${fullPath}`);
    }
  }
}

processDirectory(dir);
console.log('Done!');
