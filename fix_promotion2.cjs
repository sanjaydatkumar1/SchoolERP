const fs = require('fs');
let prom = fs.readFileSync('src/pages/Promotion.tsx', 'utf8');

// Replace the referenc to promoteSingle with an inline version that calls saveStudent
prom = prom.replace(
  `onClick={()=>promoteSingle(row.original)}`,
  `onClick={async()=>{if(!confirm(\`\${row.original.studentName} ko promote karein?\`))return;setLoading(true);try{await saveStudent({id:row.original.studentId,classId:form.toClassId,section:form.toSection,academicSession:form.newSession,rollNumber:row.original.newRollNumber,status:'Active'} as any);toast.success(\`\${row.original.studentName} promoted\`);setPreview(preview.filter(x=>x.studentId!==row.original.studentId));await load();}catch(e){toast.error(String(e));}finally{setLoading(false);}}}`
);

fs.writeFileSync('src/pages/Promotion.tsx', prom);
console.log('Promotion.tsx fixed - inline promote');
