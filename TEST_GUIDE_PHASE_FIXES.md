# Premium School ERP - Step-by-step Test Guide

## Before Testing
1. Project backup bana lo: `E:\SchoolERP_BACKUP`
2. Latest workspace files replace karo.
3. Run:
   ```bat
   cd /d E:\SchoolERP
   npm install
   npm run tauri:dev
   ```
4. Login:
   - Username: `admin`
   - Password: `admin123`

## 1. Login Test
- Login button dabao.
- Expected: Dashboard open hona chahiye.
- Error aaye to screenshot bhejo.

## 2. Classes Test
- Classes module open karo.
- Add class: e.g. Class 1, Section A, Session 2026-27.
- Save.
- Expected: class list me show ho.

## 3. Students Test
- Students > Add Student.
- Expected: Admission No automatically `01` ya next number aaye.
- Fill student name, father, class, roll, session.
- Choose Photo button se JPG/PNG photo select karo.
- Expected: photo preview dikhe aur photo path auto-fill ho.
- Save.
- Expected: student list me photo + data dikhe.

## 4. Search Test
- Students search box me name/admission/mobile/class type karo.
- Expected: table filter ho.
- Header global search me name type karke Enter press karo.
- Expected: Students page open ho aur search apply ho.

## 5. Print Test
- Student row me Admission Receipt icon click karo.
- ID Card icon click karo.
- Expected: print preview window ya HTML file open/download ho.
- Browser/Windows popup block ho to popup allow karo.

## 6. Attendance Test
- Attendance module open karo.
- Date select karo.
- Class select karo.
- Session check karo.
- Load button dabao.
- Expected: active students load ho.
- Mark all present/absent/late test karo.
- Save Attendance.
- History tab me load karke verify karo.
- Monthly tab me percentage check karo.

## 7. Fees Test
- Fees module open karo.
- New Receipt.
- Student select karo.
- Fee amounts fill karo.
- Paid amount fill karo.
- Save Receipt.
- Receipt print icon click karo.
- Expected: fee receipt print preview open ho.

## 8. Backup Test
- Backup / Restore module open karo.
- Create Full Backup click karo.
- Expected: `.zip` backup create ho.
- Backup ZIP me `school_erp.sqlite3` aur `photos/` folder included hona chahiye.

## 9. Student Profile Test
- Student Profile open karo.
- Student select karo.
- Personal, Academic, Attendance, Fees, Transport, Timeline tabs check karo.
- Expected: data load ho.

## Report Errors
Agar kisi step me issue aaye to:
1. Screenshot bhejo.
2. CMD terminal ka full error text bhejo.
3. Kaunsa step fail hua, woh number batao.
