const fs = require('fs');
let att = fs.readFileSync('src/pages/Attendance.tsx', 'utf8');

// Simplify the prepare() function to fix class-wise loading
// Replace the entire prepare function body from async function prepare
const oldPrepare = `  async function prepare(forceAll = false) {
    setLoading(true);
    try {
      const fresh = await listStudents();
      setStudents(fresh);
      let active = fresh.filter(s => String(s.status || '').trim().toLowerCase() === 'active');
      if (active.length === 0) {
        setRows([]);
        setLoadMessage(\`0 active students. Total students in database: \${fresh.length}. Students module me status Active check karein.\`);
        toast.error('Active students nahi mile.');
        return;
      }

      let list = [...active];
      let fallbackReason = '';
      if (!forceAll) {
        if (classId) list = list.filter(s => Number(s.classId || 0) === Number(classId));
        if (section.trim()) list = list.filter(s => String(s.section || '').trim().toLowerCase() === section.trim().toLowerCase());
        const beforeSession = [...list];
        if (session.trim()) list = list.filter(s => String(s.academicSession || '').trim() === session.trim());
        if (list.length === 0 && beforeSession.length > 0) {
          list = beforeSession;
          fallbackReason = 'Session mismatch tha, session filter ignore kiya.';
        }
        if (list.length === 0 && classId) {
          const classOnly = active.filter(s => Number(s.classId || 0) === Number(classId));
          if (classOnly.length > 0) {
            list = classOnly;
            fallbackReason = 'Section/session mismatch tha, selected class ke students load kiye.';
          }
        }
      }
      if (list.length === 0) {
        list = active;
        fallbackReason = 'Selected filters me students nahi mile, all active students load kiye.';
      }`;

const newPrepare = `  async function prepare(forceAll = false) {
    setLoading(true);
    try {
      const fresh = await listStudents();
      setStudents(fresh);
      let active = fresh.filter(s => String(s.status || '').trim().toLowerCase() === 'active');
      if (active.length === 0) {
        setRows([]);
        setLoadMessage(\`0 active students. Total students in database: \${fresh.length}. Students module me status Active check karein.\`);
        toast.error('Active students nahi mile.');
        return;
      }

      // Direct filtering: if forceAll, load ALL active. Otherwise filter by classId then section then session.
      let list = [...active];
      let fallbackReason = '';
      if (!forceAll) {
        if (classId) {
          list = list.filter(s => Number(s.classId || 0) === Number(classId));
          if (section.trim()) {
            const secFiltered = list.filter(s => String(s.section || '').trim().toLowerCase() === section.trim().toLowerCase());
            if (secFiltered.length > 0) list = secFiltered;
            else fallbackReason = 'Section filter match nahi hua, class ke saare students dikhaye.';
          }
          if (session.trim()) {
            const sessFiltered = list.filter(s => String(s.academicSession || '').trim() === session.trim());
            if (sessFiltered.length > 0) list = sessFiltered;
            else fallbackReason = (fallbackReason ? fallbackReason + ' ' : '') + 'Session filter match nahi hua.';
          }
        } else {
          // No class selected - load all if user explicitly clicked Load without class
          // This is fine
        }
      }
      if (list.length === 0) {
        list = active;
        fallbackReason = 'Selected filters me students nahi mile, all active students load kiye.';
      }`;

att = att.replace(oldPrepare, newPrepare);

fs.writeFileSync('src/pages/Attendance.tsx', att);
console.log('Attendance.tsx updated');
