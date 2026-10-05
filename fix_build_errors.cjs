const fs = require('fs');

// 1. Fix Payroll.tsx - proper esc function
let payroll = fs.readFileSync('src/pages/Payroll.tsx', 'utf8');
payroll = payroll.replace(
  "function esc(v:any){return String(v??'').replace(/[&<>\"]/g,function(ch){var map={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'};return map[ch]||ch})}",
  "function esc(v:any){var s=String(v??'');return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;')}"
);
fs.writeFileSync('src/pages/Payroll.tsx', payroll);
console.log('Payroll.tsx fixed');

// 2. Fix Promotion.tsx - promoteSingle needs to be accessible from useMemo
let promotion = fs.readFileSync('src/pages/Promotion.tsx', 'utf8');

// The issue is that promoteSingle is defined as a function inside the component
// but it's used inside useMemo which captures the initial value.
// The fix: use a ref or just move the function definition before useMemo
// OR: define columns as a separate component
// Simplest fix: use a state variable to track which student to promote
// Actually, simpler: inline the promote logic using a wrapper function

// Let me add a promoteSingleById function that's accessible
// Replace the previewCols to use an inline handler
promotion = promotion.replace(
  `const previewCols=useMemo<ColumnDef<PromotionPreview>[]>(()=>[\\n    {header:'Adm',accessorKey:'admissionNumber'}, {header:'Student',accessorKey:'studentName'}, {header:'Old Roll',accessorKey:'oldRollNumber'}, {header:'New Roll',cell:({row})=><b>{row.original.newRollNumber}</b>}, {header:'Rank',cell:({row})=>row.original.rank||'-'}, {header:'%',cell:({row})=>row.original.percentage?\`\${row.original.percentage.toFixed(1)}%\`:'-'}, {header:'Conflict',cell:({row})=>row.original.conflictHandled?<Badge>Adjusted</Badge>:<Badge>OK</Badge>}, {header:'Actions',cell:({row})=><button title='Promote Single' onClick={()=>promoteSingle(row.original)} className='text-emerald-600'><ChevronRight size={18}/></button>}\\n  ],[]);`,
  `function promoteRow(p:PromotionPreview){promoteSingle(p);}
  const previewCols=useMemo<ColumnDef<PromotionPreview>[]>(()=>[\\n    {header:'Adm',accessorKey:'admissionNumber'}, {header:'Student',accessorKey:'studentName'}, {header:'Old Roll',accessorKey:'oldRollNumber'}, {header:'New Roll',cell:({row})=><b>{row.original.newRollNumber}</b>}, {header:'Rank',cell:({row})=>row.original.rank||'-'}, {header:'%',cell:({row})=>row.original.percentage?\`\${row.original.percentage.toFixed(1)}%\`:'-'}, {header:'Conflict',cell:({row})=>row.original.conflictHandled?<Badge>Adjusted</Badge>:<Badge>OK</Badge>}, {header:'Actions',cell:({row})=><button title='Promote Single' onClick={()=>promoteRow(row.original)} className='text-emerald-600'><ChevronRight size={18}/></button>}\\n  ],[]);`
);
fs.writeFileSync('src/pages/Promotion.tsx', promotion);
console.log('Promotion.tsx fixed');

// 3. Fix documents.ts - export esc, money, schoolHeader, footer
let doc = fs.readFileSync('src/utils/documents.ts', 'utf8');

// Make esc, money, schoolHeader, footer exported
doc = doc.replace('function esc(v: any) {', 'export function esc(v: any) {');
doc = doc.replace('function money(v: any) {', 'export function money(v: any) {');
doc = doc.replace('function schoolHeader(title: string, meta = \'\') {', 'export function schoolHeader(title: string, meta = \'\') {');
doc = doc.replace('function footer(receipt = false) {', 'export function footer(receipt = false) {');

// Also make shortDate, photoHtml, docNo, studentInfoSection, idLogoBlock, idPhotoBlock, idCardHtml, idCardBackHtml exported
// But we don't need them for Reports - let me just make the ones needed
fs.writeFileSync('src/utils/documents.ts', doc);
console.log('documents.ts exports fixed');

