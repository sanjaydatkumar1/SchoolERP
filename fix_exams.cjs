const fs = require('fs');
let exam = fs.readFileSync('src/pages/Exams.tsx', 'utf8');

// Add a rank-specific search state and SearchBox
// First, add rankQ state variable
exam = exam.replace(
  "const [q,setQ]=useState(''); const [open,setOpen]=useState(false);",
  "const [q,setQ]=useState(''); const [rankQ,setRankQ]=useState(''); const [open,setOpen]=useState(false);"
);

// Filter ranks based on rankQ
// Find the rank tab rendering section and add a SearchBox before the buttons
exam = exam.replace(
  `{tab==='rank'&&<><div className=\"flex justify-end\"><Button onClick={()=>printClassWallResult(ranks.map(enrichRank), selectedExam ? \`\${selectedExam.examName} Class Wall Result\` : 'Class Wall Result')} className=\"mb-3 bg-emerald-700 hover:bg-emerald-800\"><FileText size={18}/> Class Wall Result PDF</Button><Button onClick={()=>printBulkRankMarksheets(ranks.map(enrichRank), selectedExam ? \`\${selectedExam.examName} Result Marksheets\` : 'Bulk Marksheets')} className=\"mb-3 bg-slate-900 hover:bg-slate-800\"><FileText size={18}/> Bulk Marksheet</Button></div><DataTable data={ranks} columns={rankCols}/></>}`,
  `{tab==='rank'&&<><div className=\"flex flex-wrap items-center justify-between gap-3 mb-3\"><SearchBox value={rankQ} onChange={e=>setRankQ(e.target.value)} placeholder=\"Search by name, admission number, rank, grade...\"/><div className=\"flex gap-2\"><Button onClick={()=>printClassWallResult(ranks.map(enrichRank), selectedExam ? \`\${selectedExam.examName} Class Wall Result\` : 'Class Wall Result')} className=\"bg-emerald-700 hover:bg-emerald-800\"><FileText size={18}/> Class Wall Result PDF</Button><Button onClick={()=>printBulkRankMarksheets(ranks.map(enrichRank), selectedExam ? \`\${selectedExam.examName} Result Marksheets\` : 'Bulk Marksheets')} className=\"bg-slate-900 hover:bg-slate-800\"><FileText size={18}/> Bulk Marksheet</Button></div></div><DataTable data={ranks.filter(r=>JSON.stringify(r).toLowerCase().includes(rankQ.toLowerCase()))} columns={rankCols}/></>}`
);

fs.writeFileSync('src/pages/Exams.tsx', exam);
console.log('Exams.tsx updated');
