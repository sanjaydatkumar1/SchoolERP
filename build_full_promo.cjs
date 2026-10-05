const fs = require('fs');

const fullContent = `import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, ChevronRight, Eye, Loader2, RotateCcw, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { listClasses, listExams, listPromotionLogs, listStudents, previewPromotion, promoteStudents, saveStudent } from '@/services/schoolApi';
import type { Exam, PromotionLog, PromotionPreview, PromotionRequest, SchoolClass } from '@/types';

const initial: PromotionRequest = { promotionType: 'normal', fromClassId: 0, fromSection: 'A', toClassId: 0, toSection: 'A', oldSession: '2025-26', newSession: '2026-27', examId: undefined };

export function Promotion() {
  const [classes,setClasses]=useState<SchoolClass[]>([]); const [exams,setExams]=useState<Exam[]>([]); const [logs,setLogs]=useState<PromotionLog[]>([]); const [preview,setPreview]=useState<PromotionPreview[]>([]); const [form,setForm]=useState<PromotionRequest>(initial); const [loading,setLoading]=useState(false); const [tab,setTab]=useState<'promote'|'logs'>('promote');
  async function load(){ const [c,e,l]=await Promise.all([listClasses(),listExams(),listPromotionLogs()]); setClasses(c); setExams(e); setLogs(l); }
  useEffect(()=>{load()},[]);
  function onFromClass(id:number){ const c=classes.find(x=>x.id===id); setForm({...form,fromClassId:id,fromSection:c?.section||form.fromSection,oldSession:c?.academicSession||form.oldSession}); }
  function onToClass(id:number){ const c=classes.find(x=>x.id===id); setForm({...form,toClassId:id,toSection:c?.section||form.toSection,newSession:c?.academicSession||form.newSession}); }
  async function doPreview(){ if(!form.fromClassId||!form.toClassId) return toast.error('From and To class required'); setLoading(true); try{ const p=await previewPromotion(form); if(p&&p.length>0){setPreview(p);toast.success(p.length+' students ready for promotion');}else{toast.info('No students found. Check filters.');setPreview([]);} }catch(e){toast.error('Backend: '+String(e)+'. Demo preview.'); setPreview(demoPreview(form)); }finally{setLoading(false);} }
  async function doPromote(){ if(preview.length===0) return toast.error('Preview first'); if(!confirm('Promote '+preview.length+' students?')) return; setLoading(true); try{ const res=await promoteStudents(form); toast.success(res.promoted+' students promoted'); setPreview([]); await load(); setTab('logs'); }catch(e){toast.error(String(e));} finally{setLoading(false);} }
  async function promoteSingleById(sid:number,adm:string,name:string,nroll:string){
    if(!form.toClassId||form.toClassId<=0){toast.error('Pehle "To Class" select karein');return;}
    if(!confirm(name+' ko class '+form.toClassId+' section '+form.toSection+' me promote karein? Roll: '+nroll)) return;
    setLoading(true); try{
      const allStudents = await listStudents();
      const studentData = allStudents.find(s => Number(s.id) === Number(sid));
      if (!studentData) { toast.error('Student data not found'); setLoading(false); return; }
      const updatedStudent = { ...studentData, classId: form.toClassId, section: form.toSection, academicSession: form.newSession, rollNumber: nroll, status: 'Active' };
      await saveStudent(updatedStudent as any);
      toast.success(name+' promoted! Roll: '+nroll);
      setPreview(preview.filter(x=>x.studentId!==sid));
      await load();
    }catch(e){ toast.error('Error: '+String(e)); } finally{ setLoading(false); }
  }
  const previewCols=useMemo<ColumnDef<PromotionPreview>[]>(()=>[
    {header:'Adm',accessorKey:'admissionNumber'}, {header:'Student',accessorKey:'studentName'}, {header:'Old Roll',accessorKey:'oldRollNumber'}, {header:'New Roll',cell:({row})=><b>{row.original.newRollNumber}</b>}, {header:'Rank',cell:({row})=>row.original.rank||'-'}, {header:'%',cell:({row})=>row.original.percentage?row.original.percentage.toFixed(1)+'%':'-'}, {header:'Conflict',cell:({row})=>row.original.conflictHandled?<Badge>Adjusted</Badge>:<Badge>OK</Badge>}, {header:'Actions',cell:({row})=><button title='Promote Single' onClick={()=>promoteSingleById(row.original.studentId,row.original.admissionNumber,row.original.studentName,row.original.newRollNumber)} className='text-emerald-600'><ChevronRight size={18}/></button>}
  ],[]);
  const logCols=useMemo<ColumnDef<PromotionLog>[]>(()=>[
    {header:'Date',accessorKey:'createdAt'}, {header:'Adm',accessorKey:'admissionNumber'}, {header:'Student',accessorKey:'studentName'}, {header:'From',cell:({row})=>row.original.fromClassName+' '+row.original.fromSection+' ('+row.original.oldSession+')'}, {header:'To',cell:({row})=>row.original.toClassName+' '+row.original.toSection+' ('+row.original.newSession+')'}, {header:'Roll',cell:({row})=>(row.original.oldRollNumber||'-')+' → '+(row.original.newRollNumber||'-')}, {header:'Type',accessorKey:'promotionType'}, {header:'Rank',accessorKey:'rankUsed'}
  ],[]);
  const rankExams=exams.filter(e=>e.classId===form.fromClassId && (e.section||'')===(form.fromSection||'') && e.academicSession===form.oldSession);
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-3xl font-black">Promotion</h2><p className="text-slate-500">Normal and Final Exam Rank based promotion with roll conflict handling.</p></div><div className="flex gap-2"><Button onClick={()=>setTab('promote')} className={tab==='promote'?'':'bg-slate-100 text-slate-700 hover:bg-slate-200'}>Promotion</Button><Button onClick={()=>setTab('logs')} className={tab==='logs'?'':'bg-slate-100 text-slate-700 hover:bg-slate-200'}>Logs</Button></div></div>{tab==='promote'&&<><Card><div className="grid gap-4 md:grid-cols-4"><Field label="Promotion Type"><select value={form.promotionType} onChange={e=>setForm({...form,promotionType:e.target.value as any})} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="normal">Normal Promotion</option><option value="rank">By Final Exam Rank</option></select></Field><Field label="From Class"><select value={form.fromClassId||''} onChange={e=>onFromClass(Number(e.target.value))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">Select</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name} - {c.section} ({c.academicSession})</option>)}</select></Field><Field label="From Section"><Input value={form.fromSection||''} onChange={e=>setForm({...form,fromSection:e.target.value.toUpperCase()})}/></Field><Field label="Old Session"><Input value={form.oldSession} onChange={e=>setForm({...form,oldSession:e.target.value})}/></Field><Field label="To Class"><select value={form.toClassId||''} onChange={e=>onToClass(Number(e.target.value))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">Select</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name} - {c.section} ({c.academicSession})</option>)}</select></Field><Field label="To Section"><Input value={form.toSection||''} onChange={e=>setForm({...form,toSection:e.target.value.toUpperCase()})}/></Field><Field label="New Session"><Input value={form.newSession} onChange={e=>setForm({...form,newSession:e.target.value})}/></Field>{form.promotionType==='rank'&&<Field label="Final Exam"><select value={form.examId||''} onChange={e=>setForm({...form,examId:e.target.value?Number(e.target.value):undefined})} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"><option value="">Select exam</option>{rankExams.map(e=><option key={e.id} value={e.id}>{e.examName} - {e.examDate}</option>)}</select></Field>}</div><div className="mt-5 flex flex-wrap justify-end gap-3"><Button onClick={doPreview} disabled={loading}><Eye size={18}/> Preview Promotion</Button><Button onClick={doPromote} disabled={loading||preview.length===0} className="bg-emerald-600 hover:bg-emerald-700">{loading&&<Loader2 className="h-4 w-4 animate-spin"/>}<RotateCcw size={18}/> Promote Students</Button></div></Card><div className="grid gap-4 md:grid-cols-3"><Card><CardTitle>Ready Students</CardTitle><p className="mt-2 text-3xl font-black">{preview.length}</p></Card><Card><CardTitle>Roll Conflicts Adjusted</CardTitle><p className="mt-2 text-3xl font-black">{preview.filter(p=>p.conflictHandled).length}</p></Card><Card><CardTitle>Rules</CardTitle><p className="mt-2 text-sm text-slate-500">Left/TC excluded. Existing target rolls not disturbed.</p></Card></div><DataTable data={preview} columns={previewCols}/><Card><CardTitle className="flex items-center gap-2"><ShieldCheck size={20}/> Safety Rules</CardTitle><ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300"><li>• Rank 1 gets Roll 1 if available.</li><li>• If target roll exists, student gets next available roll.</li><li>• Existing target class students are not disturbed.</li><li>• Left/TC students are never promoted.</li></ul></Card></>}{tab==='logs'&&<DataTable data={logs} columns={logCols}/>}</div>;
}`;

fs.writeFileSync('src/pages/Promotion.tsx', fullContent);
console.log('Complete Promotion.tsx written successfully!');
