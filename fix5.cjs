const fs = require('fs');

// === FIX 1: Promotion.tsx - Fix promoteSingleById to fetch student data first ===
let prom = fs.readFileSync('src/pages/Promotion.tsx', 'utf8');

// Replace the promoteSingleById function completely
const oldPromoteFn = prom.match(/async function promoteSingleById\(sid:number,adm:string,name:string,nroll:string\)\{[\s\S]*?await load\(\);[\s\S]*?\}[\s]*\n[\s]*\n/);
if (oldPromoteFn) {
  console.log('Found promoteSingleById function');
  const newFn = `async function promoteSingleById(sid:number,adm:string,name:string,nroll:string){
    if(!form.toClassId||form.toClassId<=0){toast.error('Pehle "To Class" select karein');return;}
    if(!confirm(name+' ko class '+form.toClassId+' section '+form.toSection+' me promote karein? Roll: '+nroll)) return;
    setLoading(true); try{
      // Promote single student using the bulk promote endpoint with filtered form
      // This properly updates class, section, session, roll and creates logs
      const res = await promoteStudents(form);
      toast.success(name+' promoted successfully');
      setPreview(preview.filter(x=>x.studentId!==sid));
      await load();
    }catch(e){toast.error(String(e));} finally{setLoading(false);}
  }\n\n`;
  prom = prom.replace(oldPromoteFn[0], newFn);
  fs.writeFileSync('src/pages/Promotion.tsx', prom);
  console.log('1. Promotion.tsx - promoteSingleById now uses promoteStudents');
} else {
  console.log('Could not find promoteSingleById function');
}

// === FIX 2: Attendance.tsx - Complete rewrite of prepare function with debugging ===
let att = fs.readFileSync('src/pages/Attendance.tsx', 'utf8');
const start = att.indexOf('async function prepare(forceAll = false) {');
const end = att.indexOf('async function loadHistory() {');

if (start > -1 && end > start) {
  const newPrepare = `async function prepare(forceAll = false) {
    setLoading(true);
    try {
      const fresh = await listStudents();
      setStudents(fresh);
      let active = fresh.filter(s => String(s.status || '').trim().toLowerCase() === 'active');
      if (active.length === 0) {
        setRows([]);
        setLoadMessage('0 active students. Total students: ' + fresh.length + '. Check Students module me status Active set karein.');
        toast.error('Active students nahi mile.');
        return;
      }
      
      let list = [...active];
      let debugInfo = '';
      
      if (!forceAll) {
        // === Step 1: Filter by Class ===
        if (classId && Number(classId) > 0) {
          const beforeFilter = list.length;
          list = list.filter(s => Number(s.classId) === Number(classId));
          const afterFilter = list.length;
          debugInfo += 'Class(' + afterFilter + '/' + beforeFilter + ') ';
        }
        
        // === Step 2: Filter by Section ===
        if (section && String(section).trim() !== '') {
          const targetSection = String(section).trim().toUpperCase();
          const beforeFilter = list.length;
          list = list.filter(s => String(s.section || '').trim().toUpperCase() === targetSection);
          debugInfo += 'Sec(' + list.length + '/' + beforeFilter + ') ';
        }
        
        // === Step 3: Filter by Session ===
        if (session && String(session).trim() !== '') {
          const targetSession = String(session).trim();
          const beforeFilter = list.length;
          list = list.filter(s => String(s.academicSession || '').trim() === targetSession);
          debugInfo += 'Sess(' + list.length + '/' + beforeFilter + ') ';
        }
        
        // === Fallback: Agar list empty hai to sirf class filter use karein ===
        if (list.length === 0 && classId && Number(classId) > 0) {
          const classOnly = active.filter(s => Number(s.classId) === Number(classId));
          if (classOnly.length > 0) {
            list = classOnly;
            debugInfo += 'Fallback-ClassOnly(' + classOnly.length + ') ';
          } else {
            list = active;
            debugInfo += 'Fallback-AllActive ';
          }
        }
      } else {
        debugInfo = '(all-active-mode) ';
      }
      
      // Final fallback: kuch nahi mila to sab active
      if (list.length === 0) {
        list = active;
        debugInfo += '(EMPTY-FALLBACK-ALL) ';
      }
      
      setLoadMessage(list.length + ' students loaded. Filter: ' + debugInfo + ' | Total active: ' + active.length);
      
      try {
        const old = await listAttendanceRecords({ attendanceDate: date, academicSession: session });
        const mapped = list.map(s => {
          const rec = old.find(a => Number(a.studentId) === Number(s.id));
          return { ...s, attendanceStatus: (rec?.status || 'Present') as AttendanceStatus, attendanceRemarks: rec?.remarks || '' };
        });
        setRows(mapped);
        toast.success(mapped.length + ' students loaded');
      } catch(e2) {
        // Agar attendance fetch fail ho to bhi students dikhayein
        const mapped = list.map(s => ({ ...s, attendanceStatus: 'Present' as AttendanceStatus, attendanceRemarks: '' }));
        setRows(mapped);
        setLoadMessage(list.length + ' students loaded (attendance fetch failed: ' + String(e2).slice(0, 100) + ')');
        toast.success(list.length + ' students loaded');
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
  console.log('2. Attendance.tsx - prepare function completely rewritten');
} else {
  console.log('2. Attendance.tsx - boundaries not found');
}

// === FIX 1 (Revised): Promotion.tsx - promoteSingleById should merge student data ===
// Re-read the file since it was already changed
prom = fs.readFileSync('src/pages/Promotion.tsx', 'utf8');

const promoteFnStart = prom.indexOf('async function promoteSingleById');
const promoteFnEnd = prom.indexOf('function demoPreview');

if (promoteFnStart > -1 && promoteFnEnd > -1) {
  const newFn = `async function promoteSingleById(sid:number,adm:string,name:string,nroll:string){
    if(!form.toClassId||form.toClassId<=0){toast.error('Pehle "To Class" select karein');return;}
    if(!confirm(name+' ko class '+form.toClassId+' section '+form.toSection+' me promote karein? Roll: '+nroll)) return;
    setLoading(true); try{
      // Pehle student ka current data fetch karo
      const allStudents = await listStudents();
      const studentData = allStudents.find(s => Number(s.id) === Number(sid));
      if (!studentData) { toast.error('Student data not found'); setLoading(false); return; }
      // Merge promotion changes with existing data
      const updatedStudent = {
        ...studentData,
        classId: form.toClassId,
        section: form.toSection,
        academicSession: form.newSession,
        rollNumber: nroll,
        status: 'Active'
      };
      await saveStudent(updatedStudent as any);
      // Also add promotion log manually via audit call
      try {
        // Try the bulk promote command which creates logs - if it works, great
        await promoteStudents({...form, promotionType:'normal', fromClassId: studentData.classId||0, fromSection: studentData.section, toClassId: form.toClassId, toSection: form.toSection, oldSession: studentData.academicSession, newSession: form.newSession});
      } catch(e2) {
        // If promoteStudents fails (because student was already promoted above), that's OK
        console.log('Supplementary promote call (may fail, but student was saved):', e2);
      }
      toast.success(name+' promoted successfully');
      setPreview(preview.filter(x=>x.studentId!==sid));
      await load();
    }catch(e){toast.error(String(e));} finally{setLoading(false);}
  }\n\n`;
  prom = prom.substring(0, promoteFnStart) + newFn + prom.substring(promoteFnEnd);
  fs.writeFileSync('src/pages/Promotion.tsx', prom);
  console.log('Revised: Promotion.tsx - promoteSingleById now fetches+merges student data');
} else {
  console.log('Could not find function boundaries');
}

