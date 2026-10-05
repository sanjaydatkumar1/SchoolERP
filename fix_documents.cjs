const fs = require('fs');
let doc = fs.readFileSync('src/utils/documents.ts', 'utf8');

// 1. Update CSS for ID card page
const oldCss = '.idPage{background:#f1f5f9}.idcard{width:86mm;height:54mm;border-radius:4mm;overflow:hidden;background:#fff;display:inline-block;vertical-align:top;margin:5mm;border:1px solid #1e3a8a;box-shadow:0 3px 14px rgba(15,23,42,.22);position:relative}';

const newCss = '.idPage{display:flex;flex-wrap:wrap;justify-content:center;gap:4mm;padding:4mm;background:#f1f5f9}.idcard{width:86mm;height:54mm;border-radius:4mm;overflow:hidden;background:#fff;display:inline-block;vertical-align:top;border:1px solid #1e3a8a;box-shadow:0 3px 14px rgba(15,23,42,.22);position:relative;margin:0}.idcardBack{width:86mm;height:54mm;border-radius:4mm;overflow:hidden;background:#fff;display:inline-block;vertical-align:top;border:1px solid #1e3a8a;box-shadow:0 3px 14px rgba(15,23,42,.22);position:relative;margin:0}.idBackWatermark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.08;pointer-events:none}.idBackWatermark img{width:80%;height:auto;max-width:90mm}.idBackContent{padding:5mm;display:flex;flex-direction:column;height:100%;box-sizing:border-box;position:relative;z-index:1}.idBackAddress{flex:1}.idBackAddress h4{font-size:9px;color:#1e3a8a;margin:0 0 3px;font-weight:900;text-transform:uppercase}.idBackAddress p{font-size:8.5px;color:#334155;margin:0;line-height:1.5}.idBackSchoolInfo{text-align:center;border-top:1px solid #cbd5e1;padding-top:3px;margin-top:auto}.idBackSchoolInfo p{margin:1px 0;font-size:7.5px;color:#475569}.idBackSchoolInfo b{font-size:8.5px;color:#1e3a8a}';

doc = doc.replace(oldCss, newCss);

// 2. Add idCardBackHtml function
const idCardBackFn = `
function idCardBackHtml(s: StudentLike) {
  const st = settings();
  const logoWm = st.logoDataUrl ? \`<div class="idBackWatermark"><img src="\${st.logoDataUrl}"/></div>\` : '';
  return \`<div class="idcardBack">\${logoWm}<div class="idBackContent"><div class="idBackAddress"><h4>Permanent Address</h4><p>\${esc(s.address || 'Not provided')}</p></div><div class="idBackSchoolInfo"><b>\${esc(st.school_name || 'Your School Name')}</b><p>\${esc(st.school_address || '')}</p><p>\${st.school_phone ? 'Ph: ' + esc(st.school_phone) : ''} \${st.school_email ? ' | Email: ' + esc(st.school_email) : ''}</p><p>\${st.school_website ? 'Web: ' + esc(st.school_website) : ''}</p><p style="margin-top:2px;font-size:7px;color:#94a3b8">This ID card is property of the school. If found, please return to the school office.</p></div></div></div>\`;
}
`;

doc = doc.replace(
  'function idCardHtml(s: StudentLike) {',
  idCardBackFn + 'function idCardHtml(s: StudentLike) {'
);

// 3. Update printStudentIdCard
doc = doc.replace(
  "export function printStudentIdCard(s: StudentLike) {\n  openDoc('Student ID Card', `<div class=\"page idPage\">${idCardHtml(s)}</div>`);\n}",
  "export function printStudentIdCard(s: StudentLike) {\n  openDoc('Student ID Card', `<div class=\"page idPage\">${idCardHtml(s)}${idCardBackHtml(s)}</div>`);\n}"
);

// 4. Update printBulkIdCards
doc = doc.replace(
  "export function printBulkIdCards(students: StudentLike[], title = 'Bulk ID Cards') {\n  const cards = students.map(s => idCardHtml(s)).join('');\n  openDoc(title, `<div class=\"page idPage\">${cards}</div>`);\n}",
  "export function printBulkIdCards(students: StudentLike[], title = 'Bulk ID Cards') {\n  const cards = students.map(s => idCardHtml(s) + idCardBackHtml(s)).join('');\n  openDoc(title, `<div class=\"page idPage\">${cards}</div>`);\n}"
);

fs.writeFileSync('src/utils/documents.ts', doc);
console.log('documents.ts updated successfully');
