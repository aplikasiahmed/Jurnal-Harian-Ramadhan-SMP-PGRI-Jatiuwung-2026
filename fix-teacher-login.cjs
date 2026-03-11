const fs = require('fs');
let content = fs.readFileSync('src/pages/TeacherLogin.tsx', 'utf8');

content = content.replace(/customClass: \{\s*popup: 'rounded-2xl text-sm sm:text-base max-w-md',\s*title: 'text-lg sm:text-xl',\s*\}/g, `customClass: {
          popup: 'rounded-2xl text-[11px] sm:text-sm max-w-[280px] sm:max-w-[400px] p-4 sm:p-6',
          title: 'text-sm sm:text-lg font-bold text-emerald-900',
          htmlContainer: 'text-xs sm:text-sm m-2',
          confirmButton: 'px-4 py-2 text-xs sm:text-sm rounded-lg',
          cancelButton: 'px-4 py-2 text-xs sm:text-sm rounded-lg'
        }`);

content = content.replace(/width: '85%',/g, `width: 'auto',`);

fs.writeFileSync('src/pages/TeacherLogin.tsx', content);
console.log('Done fixing TeacherLogin');
