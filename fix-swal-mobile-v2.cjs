const fs = require('fs');

const studentFile = 'src/pages/StudentEntry.tsx';
const teacherFile = 'src/pages/TeacherLogin.tsx';

const newClass = `customClass: {
          popup: 'swal2-mobile-optimized',
          title: 'swal2-title-optimized',
          htmlContainer: 'swal2-content-optimized',
          confirmButton: 'swal2-confirm-optimized',
          cancelButton: 'swal2-cancel-optimized'
        }`;

function replaceCustomClass(file) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace the complex customClass objects with simpler ones
  content = content.replace(/customClass:\s*\{[^{}]*htmlContainer:[^{}]*\}/g, newClass);
  fs.writeFileSync(file, content);
}

replaceCustomClass(studentFile);
replaceCustomClass(teacherFile);
console.log('Done');
