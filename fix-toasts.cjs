const fs = require('fs');
let content = fs.readFileSync('src/pages/StudentEntry.tsx', 'utf8');

// Fix toast customClass
content = content.replace(/toast: true,([\s\S]*?)customClass: \{[\s\S]*?\}/g, (match, p1) => {
  return `toast: true,${p1}customClass: {
          popup: 'rounded-xl text-xs sm:text-sm max-w-[280px] sm:max-w-[320px]',
          title: 'text-sm sm:text-base'
        }`;
});

fs.writeFileSync('src/pages/StudentEntry.tsx', content);
console.log('Done fixing toasts');
