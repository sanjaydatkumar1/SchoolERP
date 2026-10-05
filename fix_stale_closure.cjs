const fs = require('fs');
let prom = fs.readFileSync('src/pages/Promotion.tsx', 'utf8');

// The core issue: useMemo([], []) captures first render's form.
// Fix: Use useRef to always have latest form values

// 1. Add useRef import 
prom = prom.replace(
  "import { useEffect, useMemo, useState } from 'react';",
  "import { useEffect, useMemo, useRef, useState } from 'react';"
);

// 2. Add formRef after the form state declaration
prom = prom.replace(
  "const [form,setForm]=useState<PromotionRequest>(initial); const [loading,setLoading]=useState(false); const [tab,setTab]=useState<'promote'|'logs'>('promote');",
  "const [form,setForm]=useState<PromotionRequest>(initial); const formRef=useRef(form); formRef.current=form; const [loading,setLoading]=useState(false); const [tab,setTab]=useState<'promote'|'logs'>('promote');"
);

// 3. Replace promoteSingleById to use formRef instead of form
const oldFn = prom.match(/async function promoteSingleById[\s\S]*?await load\(\);[\s]*\n[\s]*\}catch\(e\)\{[\s]*toast\.error[\s\S]*?\} finally\{[\s]*setLoading\(false\);[\s]*\}/);
if (oldFn) {
  const newFn = `async function promoteSingleById(sid:number,adm:string,name:string,nroll:string){
    var f=formRef.current;
    if(!confirm(name+" ko promote karein? Roll: "+nroll)) return;
    setLoading(true); try{
      const allStudents = await listStudents();
      const studentData = allStudents.find(s => Number(s.id) === Number(sid));
      if (!studentData) { toast.error("Student data not found"); setLoading(false); return; }
      const updatedStudent = { ...studentData, classId: f.toClassId, section: f.toSection, academicSession: f.newSession, rollNumber: nroll, status: "Active" };
      await saveStudent(updatedStudent as any);
      toast.success(name+" promoted! Roll: "+nroll);
      setPreview(preview.filter(x=>x.studentId!==sid));
      await load();
    }catch(e){ toast.error("Error: "+String(e)); } finally{ setLoading(false); }
  }`;
  prom = prom.replace(oldFn[0], newFn);
} else {
  console.log("Could not find promoteSingleById function");
}

fs.writeFileSync('src/pages/Promotion.tsx', prom);
console.log('Done - useRef fix applied!');
