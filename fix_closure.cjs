const fs = require('fs');
let prom = fs.readFileSync('src/pages/Promotion.tsx', 'utf8');

// Fix 1: Add params to promoteSingleById
prom = prom.replace(
  'async function promoteSingleById(sid:number,adm:string,name:string,nroll:string){',
  'async function promoteSingleById(sid:number,adm:string,name:string,nroll:string,toCid?:number,toSec?:string,newSess?:string){'
);

// Fix 2: Replace the check with local vars
prom = prom.replace(
  "if(!form.toClassId||form.toClassId<=0){toast.error('Pehle \"To Class\" select karein');return;}",
  "var cid=toCid||form.toClassId;var sec=toSec||form.toSection;var sess=newSess||form.newSession;if(!cid||cid<=0){toast.error('Pehle To Class select karein');return;}"
);

// Fix 3: Replace the updatedStudent to use local vars
prom = prom.replace(
  'const updatedStudent = { ...studentData, classId: form.toClassId, section: form.toSection, academicSession: form.newSession, rollNumber: nroll, status: \'Active\' };',
  'const updatedStudent = { ...studentData, classId: cid, section: sec, academicSession: sess, rollNumber: nroll, status: \'Active\' };'
);

// Fix 4: Pass form values directly in onClick to avoid stale closure
prom = prom.replace(
  "onClick={()=>promoteSingleById(row.original.studentId,row.original.admissionNumber,row.original.studentName,row.original.newRollNumber)}",
  "onClick={()=>promoteSingleById(row.original.studentId,row.original.admissionNumber,row.original.studentName,row.original.newRollNumber,form.toClassId,form.toSection,form.newSession)}"
);

fs.writeFileSync('src/pages/Promotion.tsx', prom);
console.log('Done!');
