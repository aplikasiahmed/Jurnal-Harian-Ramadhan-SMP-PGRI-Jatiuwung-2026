const fs = require('fs');

const studentFile = 'src/pages/StudentEntry.tsx';
const teacherFile = 'src/pages/TeacherLogin.tsx';

const newClass = `customClass: {
          popup: 'rounded-2xl max-w-[260px] sm:max-w-[320px] p-4 text-sm',
          title: 'text-[15px] sm:text-lg font-bold text-emerald-900 mt-2 mb-1',
          htmlContainer: 'text-[13px] sm:text-sm m-0 p-0',
          confirmButton: 'px-4 py-2 text-[13px] sm:text-sm rounded-lg mt-2',
          cancelButton: 'px-4 py-2 text-[13px] sm:text-sm rounded-lg mt-2'
        }`;

function replaceCustomClass(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/customClass:\s*\{[^{}]*htmlContainer:[^{}]*\}/g, newClass);
  fs.writeFileSync(file, content);
}

replaceCustomClass(studentFile);
replaceCustomClass(teacherFile);
console.log('Done');
