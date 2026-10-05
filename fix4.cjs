const fs = require('fs');

// === FIX 1: Promotion.tsx - pass admissionNumber and studentName to saveStudent ===
let prom = fs.readFileSync('src/pages/Promotion.tsx', 'utf8');
prom = prom.replace(
  "await saveStudent({id:sid,classId:form.toClassId,section:form.toSection,academicSession:form.newSession,rollNumber:nroll,status:\"Active\"} as any);",
  "await saveStudent({id:sid,admissionNumber:adm,studentName:name,classId:form.toClassId,section:form.toSection,academicSession:form.newSession,rollNumber:nroll,status:\"Active\"} as any);"
);
fs.writeFileSync('src/pages/Promotion.tsx', prom);
console.log('1. Promotion.tsx - fixed');

// === FIX 2: Check Attendance.tsx ===
let att = fs.readFileSync('src/pages/Attendance.tsx', 'utf8');
const start = att.indexOf('async function prepare(forceAll = false) {');
const end = att.indexOf('async function loadHistory() {');
if (start > -1 && end > start) {
  console.log('prepare function found at', start, 'to', end);
  const newPrepare = `async function prepare(forceAll = false) {
    setLoading(true);
    try {
      const fresh = await listStudents();
      setStudents(fresh);
      let active = fresh.filter(s => String(s.status || '').trim().toLowerCase() === 'active');
      if (active.length === 0) {
        setRows([]);
        setLoadMessage('0 active students. Total: ' + fresh.length);
        toast.error('Active students nahi mile.');
        return;
      }
      let list = [...active];
      let info = '';
      if (!forceAll) {
        if (classId && Number(classId) > 0) {
          const before = list.length;
          list = list.filter(s => Number(s.classId) === Number(classId));
          info += 'Class(' + list.length + '/' + before + ') ';
        }
        if (section && String(section).trim()) {
          const sUp = String(section).trim().toUpperCase();
          const before = list.length;
          list = list.filter(s => String(s.section || '').trim().toUpperCase() === sUp);
          info += 'Sec(' + list.length + '/' + before + ') ';
          if (list.length === 0 && classId) {
            list = active.filter(s => Number(s.classId) === Number(classId));
            info += '(sec-reset) ';
          }
        }
        if (session && String(session).trim()) {
          const before = list.length;
          list = list.filter(s => String(s.academicSession || '').trim() === String(session).trim());
          info += 'Sess(' + list.length + '/' + before + ') ';
          if (list.length === 0 && classId) {
            list = active.filter(s => Number(s.classId) === Number(classId));
            info += '(sess-reset) ';
          }
        }
        if (list.length === 0 && classId) {
          list = active.filter(s => Number(s.classId) === Number(classId));
          info += '(class-fallback) ';
        }
      } else {
        info = '(all-active)';
      }
      if (list.length === 0) { list = active; info += '(empty-all)'; }
      setLoadMessage(list.length + ' loaded. ' + info + ' | Active: ' + active.length);
      try {
        const old = await listAttendanceRecords({ attendanceDate: date, academicSession: session });
        const mapped = list.map(s => {
          const rec = old.find(a => Number(a.studentId) === Number(s.id));
          return { ...s, attendanceStatus: (rec?.status || 'Present') as AttendanceStatus, attendanceRemarks: rec?.remarks || '' };
        });
        setRows(mapped);
        toast.success(mapped.length + ' students loaded');
      } catch(e2) {
        const mapped = list.map(s => ({ ...s, attendanceStatus: 'Present' as AttendanceStatus, attendanceRemarks: '' }));
        setRows(mapped);
      }
    } catch (e) {
      toast.error(String(e));
      setLoadMessage('Error: ' + String(e));
    } finally {
      setLoading(false);
    }
  }\n`;
  att = att.substring(0, start) + newPrepare + att.substring(end);
  fs.writeFileSync('src/pages/Attendance.tsx', att);
  console.log('2. Attendance.tsx - prepare replaced');
} else {
  console.log('2. Attendance.tsx - boundaries not found');
}
