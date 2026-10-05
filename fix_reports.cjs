const fs = require('fs');
let report = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

// Change import to use openDoc from documents.ts
report = report.replace(
  "import { exportCsv, printReport, type ReportColumn } from '@/utils/exporters';",
  "import { exportCsv, type ReportColumn } from '@/utils/exporters';\nimport { openDoc, esc, money, schoolHeader, footer } from '@/utils/documents';"
);

// Replace the Print/PDF button to use openDoc (same-window) instead of popup
report = report.replace(
  `<Button onClick={()=>printReport({title:def.title,subtitle,rows,columns:def.columns})} className=\"bg-slate-900 hover:bg-slate-800\"><Printer size={18}/> Print / PDF</Button>`,
  `<Button onClick={()=>openDoc(def.title, \`<div class=\"page printPad\">\${schoolHeader(def.title)}<div class=\"section\"><div class=\"sectionBody\">\${esc(subtitle)}</div></div><table><thead><tr>\${def.columns.map(c=>\`<th>\${esc(c.label)}</th>\`).join('')}</tr></thead><tbody>\${rows.map(row=>\`<tr>\${def.columns.map(c=>\`<td>\${esc((row as any)[c.key as string])}</td>\`).join('')}</tr>\`).join('')}</tbody></table>\${footer()}</div>\`)} className=\"bg-slate-900 hover:bg-slate-800\"><Printer size={18}/> Print / PDF</Button>`
);

// Also fix the Preview button to ensure data flows correctly with fallback message
// And add a note when no rows are loaded
report = report.replace(
  '<Button onClick={load}><Eye size={18}/> Preview</Button>',
  '<Button onClick={load}><Eye size={18}/> Load Data</Button>'
);

// Add some info text when rows are loaded
report = report.replace(
  '<DataTable data={rows} columns={columns}/>',
  '<div>{rows.length===0?<div className="rounded-xl bg-amber-50 p-4 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><b>Data load karein:</b> Upar "Load Data" button dabayein. Phir Print/PDF button dabayein.</div>:<div className="text-xs text-slate-400 mb-2">{rows.length} records loaded. Print/PDF button se preview dekhein.</div>}<DataTable data={rows} columns={columns}/></div>'
);

fs.writeFileSync('src/pages/Reports.tsx', report);
console.log('Reports.tsx updated');
