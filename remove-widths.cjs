const fs = require('fs');

const files = ['src/pages/StudentEntry.tsx', 'src/pages/TeacherLogin.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/width:\s*'auto',/g, '');
  content = content.replace(/width:\s*'85%',/g, '');
  fs.writeFileSync(file, content);
});

console.log('Done');
