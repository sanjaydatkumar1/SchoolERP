const fs = require('fs');

// ==== FIX 1: Attendance.tsx ====
let att = fs.readFileSync('src/pages/Attendance.tsx', 'utf8');
const startIdx = att.indexOf('async function prepare(forceAll = false)');
const endIdx = att.indexOf('async function loadHistory()');

if (startIdx > -1 && endIdx > startIdx) {
  const newPrepare = `async function prepare(forceAll = false) {
    setLoading(true);
    try {
      const fresh = await listStudents();
      setStudents(fresh);
      let active = fresh.filter(s => String(s.status || '').trim().toLowerCase() === 'active');
      if (active.length === 0) {
        setRows([]);
        setLoadMessage('0 active students found.');
        toast.error('Active students nahi mile.');
        return;
      }
      let list = [...active];
      if (!forceAll) {
        if (classId) {
          list = list.filter(s => Number(s.classId) === Number(classId));
        }
        if (section.trim()) {
          const s_upper = section.trim().toUpperCase();
          list = list.filter(s => String(s.section || '').trim().toUpperCase() === s_upper);
        }
        if (session.trim()) {
          list = list.filter(s => String(s.academicSession || '').trim() === session.trim());
        }
        if (list.length === 0 && classId) {
          const classOnly = active.filter(s => Number(s.classId) === Number(classId));
          if (classOnly.length > 0) {
            list = classOnly;
            setLoadMessage(classOnly.length + ' students loaded (class only)');
          } else {
            list = active;
            setLoadMessage('No match. Showing all active.');
          }
        }
      }
      if (list.length === 0) { list = active; setLoadMessage('No match. Showing all active students.'); }
      try {
        const old = await listAttendanceRecords({ attendanceDate: date, academicSession: session });
        const mapped = list.map(s => {
          const rec = old.find(a => Number(a.studentId) === Number(s.id));
          return { ...s, attendanceStatus: (rec?.status || 'Present'), attendanceRemarks: rec?.remarks || '' };
        });
        setRows(mapped);
        if (!loadMessage) setLoadMessage(mapped.length + ' students loaded.');
        toast.success(mapped.length + ' students loaded');
      } catch(e2) {
        const mapped = list.map(s => ({ ...s, attendanceStatus: 'Present', attendanceRemarks: '' }));
        setRows(mapped);
        setLoadMessage(mapped.length + ' students loaded (no attendance data)');
        toast.success(mapped.length + ' students loaded');
      }
    } catch (e) {
      toast.error(String(e));
      setLoadMessage('Error: ' + String(e));
    } finally {
      setLoading(false);
    }
  }\n`;

  att = att.substring(0, startIdx) + newPrepare + att.substring(endIdx);
  fs.writeFileSync('src/pages/Attendance.tsx', att);
  console.log('1. Attendance.tsx - Fixed');
} else {
  console.log('1. Attendance.tsx - Could not find boundaries');
}

// ==== FIX 2: Payroll.tsx - Fix printSlip ====
let pay = fs.readFileSync('src/pages/Payroll.tsx', 'utf8');
const slipStart = pay.indexOf('function printSlip(r:PayrollRecord)');

if (slipStart > -1) {
  let braceCount = 0;
  for (let i = slipStart; i < pay.length; i++) {
    if (pay[i] === '{') braceCount++;
    else if (pay[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        const newSlip = `function printSlip(r:PayrollRecord) {
    const netAmt = r.netSalary ?? net(r);
    function esc2(v){return String(v!==undefined&&v!==null?v:'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    const rowData = [
      ['Basic Salary', Number(r.basicSalary||0).toLocaleString('en-IN')],
      ['Allowance', Number(r.allowance||0).toLocaleString('en-IN')],
      ['Deduction', '- ' + Number(r.deduction||0).toLocaleString('en-IN')],
      ['Net Salary', Number(netAmt).toLocaleString('en-IN')],
      ['Payment Date', r.paymentDate || '-']
    ];
    let rowsHtml = '';
    for (let i = 0; i < rowData.length; i++) {
      const isNet = rowData[i][0] === 'Net Salary';
      rowsHtml += '<tr' + (isNet ? ' class="totalRow"' : '') + '><td style="border:1px solid #cbd5e1;padding:8px;' + (isNet?'font-weight:900;font-size:14px':'') + '">' + esc2(rowData[i][0]) + '</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right;' + (isNet?'font-weight:900;font-size:14px':'') + '">\\u20B9 ' + esc2(rowData[i][1]) + '</td></tr>';
    }
    const h = '<div class="page printPad">' +
      '<div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:14px">' +
      '<div style="font-size:22px;font-weight:800">SALARY SLIP</div>' +
      '<div style="font-size:13px;color:#475569">' + esc2(r.employeeName) + ' &bull; ' + esc2(r.month) + ' ' + r.year + ' &bull; ' + esc2(r.role) + '</div></div>' +
      '<div style="display:flex;justify-content:space-between;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px">' +
      '<span>Status: <b>' + esc2(r.status) + '</b></span><span>Period: <b>' + esc2(r.month) + ' ' + r.year + '</b></span></div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
      '<thead><tr><th style="border:1px solid #cbd5e1;padding:8px;background:#e2e8f0;text-align:left">Particulars</th>' +
      '<th style="border:1px solid #cbd5e1;padding:8px;background:#e2e8f0;text-align:right">Amount (\\u20B9)</th></tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody></table>' +
      '<div style="display:flex;justify-content:space-between;margin-top:40px;font-size:12px">' +
      '<div style="border-top:1px solid #0f172a;padding-top:6px;width:150px;text-align:center;font-weight:700">Employee</div>' +
      '<div style="border-top:1px solid #0f172a;padding-top:6px;width:150px;text-align:center;font-weight:700">Accountant</div>' +
      '<div style="border-top:1px solid #0f172a;padding-top:6px;width:150px;text-align:center;font-weight:700">Principal</div></div></div>';
    openDoc('Salary Slip', h);
  }\n`;
        pay = pay.substring(0, slipStart) + newSlip + pay.substring(i + 1);
        fs.writeFileSync('src/pages/Payroll.tsx', pay);
        console.log('2. Payroll.tsx - Fixed');
        break;
      }
    }
  }
} else {
  console.log('2. Payroll.tsx - Could not find printSlip');
}

// ==== FIX 3: Reports.tsx - Fix print preview ====
let rep = fs.readFileSync('src/pages/Reports.tsx', 'utf8');
// Find the Print/PDF button and replace it
const pStart = rep.indexOf('<Button onClick={');
// Find the specific Print/PDF button
const searchStr = 'Print / PDF</Button>';
const pBtnEnd = rep.lastIndexOf(searchStr);
if (pBtnEnd > -1) {
  // Find the start of this button's onClick
  const btnStart = rep.lastIndexOf('<Button', pBtnEnd);
  if (btnStart > -1) {
    // Find the matching end
    const btnEnd = pBtnEnd + searchStr.length;
    const newBtn = `<Button onClick={function(){
      if(rows.length===0){toast.error('Pehle "Load Data" dabayein');return;}
      var schoolName='School Name',schoolAddr='';
      try{var st=JSON.parse(localStorage.getItem('appSettings')||'{}');schoolName=st.school_name||'School Name';schoolAddr=st.school_address||'';}catch(e){}
      var header='<div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:14px">'+
        '<div style="font-size:22px;font-weight:800">'+schoolName+'</div>'+
        '<div style="font-size:12px;color:#475569">'+schoolAddr+'</div>'+
        '<div style="font-size:15px;font-weight:800;margin-top:8px">'+def.title+'</div>'+
        '<div style="font-size:12px;color:#475569">'+subtitle+'</div></div>';
      var cols=def.columns.map(function(c){return '<th style="border:1px solid #cbd5e1;padding:6px;background:#e2e8f0;text-align:left">'+c.label+'</th>';}).join('');
      var body=rows.map(function(r){return '<tr>'+def.columns.map(function(c){return '<td style="border:1px solid #cbd5e1;padding:6px">'+String(r[c.key]??'')+'</td>';}).join('')+'</tr>';}).join('');
      var html='<div class="page printPad">'+header+'<table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr>'+cols+'</tr></thead><tbody>'+body+'</tbody></table></div>';
      openDoc(def.title, html);
    }} className="bg-slate-900 hover:bg-slate-800"><Printer size={18}/> Print / PDF</Button>`;
    rep = rep.substring(0, btnStart) + newBtn + rep.substring(btnEnd);
    fs.writeFileSync('src/pages/Reports.tsx', rep);
    console.log('3. Reports.tsx - Fixed');
  } else {
    console.log('3. Reports.tsx - Could not find button start');
  }
} else {
  console.log('3. Reports.tsx - Could not find Print/PDF button');
}

console.log('\\nAll fixes applied!');
