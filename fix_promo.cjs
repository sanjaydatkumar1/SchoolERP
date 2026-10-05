const fs = require('fs');
let prom = fs.readFileSync('src/pages/Promotion.tsx', 'utf8');

// Add listStudents to import
prom = prom.replace(
  "import { listClasses, listExams, listPromotionLogs, previewPromotion, promoteStudents, saveStudent } from '@/services/schoolApi';",
  "import { listClasses, listExams, listPromotionLogs, listStudents, previewPromotion, promoteStudents, saveStudent } from '@/services/schoolApi';"
);

// Replace the entire promoteSingleById function
const start = prom.indexOf('async function promoteSingleById');
// Find the start of function demoPreview
const end = prom.indexOf('function demoPreview');

if (start > -1 && end > -1) {
  const newFn = `async function promoteSingleById(sid:number,adm:string,name:string,nroll:string){
    if(!form.toClassId||form.toClassId<=0){toast.error('Pehle "To Class" select karein');return;}
    if(!confirm(name+' ko class '+form.toClassId+' section '+form.toSection+' me promote karein? Roll: '+nroll)) return;
    setLoading(true); try{
      // Student ka current data fetch karo
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
      toast.success(name+' promoted successfully! Roll: '+nroll);
      setPreview(preview.filter(x=>x.studentId!==sid));
      await load();
    }catch(e){ toast.error('Error: '+String(e)); }
    finally{ setLoading(false); }
  }\n\n`;
  prom = prom.substring(0, start) + newFn + prom.substring(end);
  fs.writeFileSync('src/pages/Promotion.tsx', prom);
  console.log('Promotion.tsx - Fixed!');
} else {
  console.log('Could not find function boundaries');
}
