const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentEntry.tsx', 'utf8');

// Replace Type 1
content = content.replace(/customClass: \{\s*popup: 'rounded-2xl text-xs sm:text-sm max-w-\[320px\]',\s*title: 'text-base sm:text-lg',\s*\}/g, `customClass: {
          popup: 'rounded-2xl text-[11px] sm:text-sm max-w-[280px] sm:max-w-[320px] p-4 sm:p-6',
          title: 'text-sm sm:text-base',
          htmlContainer: 'text-xs sm:text-sm m-2',
          confirmButton: 'px-4 py-2 text-xs sm:text-sm rounded-lg',
          cancelButton: 'px-4 py-2 text-xs sm:text-sm rounded-lg'
        }`);

// Replace Type 2
content = content.replace(/customClass: \{\s*popup: 'rounded-2xl text-sm max-w-\[400px\]',\s*title: 'text-lg font-bold text-emerald-900',\s*\}/g, `customClass: {
          popup: 'rounded-2xl text-[11px] sm:text-sm max-w-[280px] sm:max-w-[400px] p-4 sm:p-6',
          title: 'text-sm sm:text-lg font-bold text-emerald-900',
          htmlContainer: 'text-xs sm:text-sm m-2',
          confirmButton: 'px-4 py-2 text-xs sm:text-sm rounded-lg',
          cancelButton: 'px-4 py-2 text-xs sm:text-sm rounded-lg'
        }`);

fs.writeFileSync('src/pages/StudentEntry.tsx', content);
console.log('Done replacing customClass');
