const fs = require('fs');
let pay = fs.readFileSync('src/pages/Payroll.tsx', 'utf8');

// Replace printSlip function with a proper salary slip format
const oldPrintSlip = `  function printSlip(r:PayrollRecord){printReport({title:'Salary Slip',subtitle:\`\${r.employeeName} • \${r.month} \${r.year}\`,rows:[{head:'Basic Salary',amount:r.basicSalary},{head:'Allowance',amount:r.allowance},{head:'Deduction',amount:r.deduction},{head:'Net Salary',amount:r.netSalary??net(r)},{head:'Status',amount:r.status},{head:'Payment Date',amount:r.paymentDate||'-'}],columns:[{key:'head',label:'Particulars'},{key:'amount',label:'Amount / Value'}]});}`;

const newPrintSlip = `  function printSlip(r:PayrollRecord){
    const st = JSON.parse(localStorage.getItem('appSettings') || '{}');
    const logo = st.logoDataUrl ? \`<img src="\${st.logoDataUrl}" style="height:50px;width:50px;border-radius:50%;object-fit:contain"/>\` : \`<div style="width:50px;height:50px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900">\${(st.school_name||'S').slice(0,1)}</div>\`;
    const netAmt = r.netSalary ?? net(r);
    const body = \`<div class="page printPad">
      <div style="display:flex;align-items:center;gap:14px;border:2px solid #0f172a;border-radius:14px;padding:10px 12px;background:linear-gradient(135deg,#eff6ff,#fff);margin-bottom:12px">
        \${logo}
        <div style="text-align:center;flex:1"><h1 style="font-size:28px;margin:0;text-transform:uppercase">\${esc(st.school_name || 'Your School Name')}</h1><p style="margin:2px 0;font-size:14px;font-weight:700">\${esc(st.school_address || 'School Address')}</p></div>
      </div>
      <div style="text-align:center;margin:10px 0"><span style="display:inline-block;background:#0f172a;color:#fff;border-radius:999px;padding:7px 22px;font-size:15px;font-weight:900;text-transform:uppercase">SALARY SLIP</span></div>
      <div style="display:flex;justify-content:space-between;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;padding:7px 10px;margin-bottom:12px">
        <span>Employee: <b>\${esc(r.employeeName)}</b></span>
        <span>Role: <b>\${esc(r.role)}</b></span>
        <span>Period: <b>\${r.month} \${r.year}</b></span>
        <span>Status: <b>\${r.status}</b></span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px">
        <thead><tr><th style="border:1px solid #cbd5e1;padding:8px;background:#e2e8f0;text-transform:uppercase;font-size:12px;text-align:left">Particulars</th><th style="border:1px solid #cbd5e1;padding:8px;background:#e2e8f0;text-transform:uppercase;font-size:12px;text-align:right">Amount (₹)</th></tr></thead>
        <tbody>
          <tr><td style="border:1px solid #cbd5e1;padding:8px">Basic Salary</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right">\${Number(r.basicSalary||0).toLocaleString('en-IN')}</td></tr>
          <tr><td style="border:1px solid #cbd5e1;padding:8px">Allowance</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right">\${Number(r.allowance||0).toLocaleString('en-IN')}</td></tr>
          <tr><td style="border:1px solid #cbd5e1;padding:8px">Deduction</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right;color:#dc2626">- \${Number(r.deduction||0).toLocaleString('en-IN')}</td></tr>
          <tr style="background:#eff6ff;font-weight:900"><td style="border:1px solid #cbd5e1;padding:10px;font-size:14px">Net Salary</td><td style="border:1px solid #cbd5e1;padding:10px;text-align:right;font-size:14px">\${netAmt.toLocaleString('en-IN')}</td></tr>
          <tr><td style="border:1px solid #cbd5e1;padding:8px">Payment Date</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right">\${r.paymentDate || '-'}</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;margin-top:40px;font-size:12px">
        <div style="border-top:1px solid #0f172a;padding-top:6px;width:160px;text-align:center;font-weight:700">Employee Signature</div>
        <div style="border-top:1px solid #0f172a;padding-top:6px;width:160px;text-align:center;font-weight:700">Accountant</div>
        <div style="border-top:1px solid #0f172a;padding-top:6px;width:160px;text-align:center;font-weight:700">Principal</div>
      </div>
      <div style="position:absolute;bottom:5mm;left:9mm;right:9mm;text-align:center;font-size:10px;color:#64748b;border-top:1px solid #cbd5e1;padding-top:4px"><b>This is a computer generated salary slip.</b><br/>Powered by Premium School ERP • Developer: \${esc(st.developer_name || 'Sanjaydat Kumar')}</div>
    </div>\`;
    const {openDoc} = require('@/utils/documents');
    // We can't use require, so let's call openDoc directly via the imported function
    // Since printReport is already imported, we'll use it but with custom HTML in a different way
    // For now use printReport as fallback but with better formatting
    openDoc('Salary Slip', body);
  }`;

// Actually let me simplify - just add a proper openDoc call. The import is already there from printReport
// Replace printSlip with a version that calls openDoc directly
const simpleNewPrintSlip = `  function printSlip(r:PayrollRecord){
    const st = JSON.parse(localStorage.getItem('appSettings') || '{}');
    const logo = st.logoDataUrl ? \`<img src="\${st.logoDataUrl}" style="height:50px;width:50px;border-radius:50%;object-fit:contain"/>\` : \`<div style="width:50px;height:50px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900">\${(st.school_name||'S').slice(0,1)}</div>\`;
    const netAmt = r.netSalary ?? net(r);
    openDoc('Salary Slip', \`<div class="page printPad">
      <div style="display:flex;align-items:center;gap:14px;border:2px solid #0f172a;border-radius:14px;padding:10px 12px;background:linear-gradient(135deg,#eff6ff,#fff);margin-bottom:12px">
        \${logo}
        <div style="text-align:center;flex:1"><h1 style="font-size:28px;margin:0;text-transform:uppercase">\${esc(st.school_name || 'Your School Name')}</h1><p style="margin:2px 0;font-size:14px;font-weight:700">\${esc(st.school_address || 'School Address')}</p></div>
      </div>
      <div style="text-align:center;margin:10px 0"><span style="display:inline-block;background:#0f172a;color:#fff;border-radius:999px;padding:7px 22px;font-size:15px;font-weight:900;text-transform:uppercase">SALARY SLIP</span></div>
      <div style="display:flex;justify-content:space-between;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;padding:7px 10px;margin-bottom:12px">
        <span>Employee: <b>\${esc(r.employeeName)}</b></span>
        <span>Role: <b>\${esc(r.role)}</b></span>
        <span>Period: <b>\${r.month} \${r.year}</b></span>
        <span>Status: <b>\${r.status}</b></span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:6px">
        <thead><tr><th style="border:1px solid #cbd5e1;padding:8px;background:#e2e8f0;text-transform:uppercase;font-size:12px;text-align:left">Particulars</th><th style="border:1px solid #cbd5e1;padding:8px;background:#e2e8f0;text-transform:uppercase;font-size:12px;text-align:right">Amount (₹)</th></tr></thead>
        <tbody>
          <tr><td style="border:1px solid #cbd5e1;padding:8px">Basic Salary</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right">\${Number(r.basicSalary||0).toLocaleString('en-IN')}</td></tr>
          <tr><td style="border:1px solid #cbd5e1;padding:8px">Allowance</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right">\${Number(r.allowance||0).toLocaleString('en-IN')}</td></tr>
          <tr><td style="border:1px solid #cbd5e1;padding:8px">Deduction</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right;color:#dc2626">- \${Number(r.deduction||0).toLocaleString('en-IN')}</td></tr>
          <tr style="background:#eff6ff;font-weight:900"><td style="border:1px solid #cbd5e1;padding:10px;font-size:14px">Net Salary</td><td style="border:1px solid #cbd5e1;padding:10px;text-align:right;font-size:14px">\${netAmt.toLocaleString('en-IN')}</td></tr>
          <tr><td style="border:1px solid #cbd5e1;padding:8px">Payment Date</td><td style="border:1px solid #cbd5e1;padding:8px;text-align:right">\${r.paymentDate || '-'}</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;margin-top:40px;font-size:12px">
        <div style="border-top:1px solid #0f172a;padding-top:6px;width:160px;text-align:center;font-weight:700">Employee Signature</div>
        <div style="border-top:1px solid #0f172a;padding-top:6px;width:160px;text-align:center;font-weight:700">Accountant</div>
        <div style="border-top:1px solid #0f172a;padding-top:6px;width:160px;text-align:center;font-weight:700">Principal</div>
      </div>
      <div class="footer"><b>This is a computer generated salary slip.</b><br/>Powered by Premium School ERP</div>
    </div>\`);
  }`;

pay = pay.replace(oldPrintSlip, simpleNewPrintSlip);

// Also need to add esc function at the top, or use import
// Actually esc is defined in documents.ts, not here. Let me add it inline or use a simpler approach
// Let me add a local esc function
pay = pay.replace(
  "import { printReport } from '@/utils/exporters';",
  "import { printReport } from '@/utils/exporters';\nimport { openDoc } from '@/utils/documents';"
);

// Add esc function locally  
pay = pay.replace(
  "const months=['January','February','March','April','May','June','July','August','September','October','November','December'];",
  "function esc(v:any){return String(v??'').replace(/[&<>\"]/g,function(ch){var map={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'};return map[ch]||ch})}\nconst months=['January','February','March','April','May','June','July','August','September','October','November','December'];"
);

fs.writeFileSync('src/pages/Payroll.tsx', pay);
console.log('Payroll.tsx updated');
