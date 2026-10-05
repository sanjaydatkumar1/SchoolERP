# Fix Pack: Dashboard Graphs + Restore Student + Bulk Demand Bills

## User reported errors fixed

### 1. `Load error: Invalid parameter name: :class_id`
Fixed by removing risky SQLite named parameters from:
- attendance history/monthly summary
- reports filters

### 2. `Command restore_student not found`
Restore command is registered in Tauri main invoke handler. Important: after replacing Rust files, app must be fully restarted.

### 3. Dashboard graphs showing all 0
Dashboard chart command updated:
- attendance chart now uses actual attendance dates available in database, not only last 7 days
- fee chart uses available fee months/created records
- class strength uses active students
- admission trend uses actual admission records

Note: graphs that depend on no data will remain 0 until module data exists. Example: exam performance needs marks entry; fee collection needs fee records; attendance needs attendance saved.

### 4. Bulk Demand Bill system added
New page/menu:
- `Demand Bills` route: `/demand-bills`

Features:
- all active students demand bills in one click
- optional all classes or specific class ID
- month selection, e.g. August
- tuition fee from fee structure
- transport fee only if student uses route; route monthly fee preferred, otherwise fee structure transport fee
- optional exam fee from fee structure
- optional library/other/admission fee
- previous pending dues automatically added as Back Dues
- saves current month dues in `fees` table, skips duplicate dues if already generated
- professional demand slip print
- A4 page has 6 demand bill slips
- month-end notification added from 25th day onward, redirects to `/demand-bills`

## Replace these files in E:\SchoolERP

```text
src-tauri/src/commands/mod.rs
src-tauri/src/main.rs
src/services/schoolApi.ts
src/types/index.ts
src/utils/documents.ts
src/pages/DemandBills.tsx
src/App.tsx
src/layouts/menu.ts
```

Also keep these earlier fixed files if not already replaced:

```text
src/pages/Students.tsx
src/utils/exporters.ts
src/pages/Dashboard.tsx
```

## Run

```bat
cd /d E:\SchoolERP
npm run tauri:dev
```

If app was already running, close it fully and run again. Rust command registration changes need full Tauri restart.

## Demand Bill test

1. Fee Structure me har class ka tuition/transport/exam fee set karo.
2. Students me active students ke class/session correct rakho.
3. Transport student ke route me monthly fee set karo.
4. Open `Demand Bills`.
5. Month `August` select karo.
6. Transport fee checkbox ON rakho.
7. Exam fee checkbox ON only if exam fee add karna hai.
8. Previous dues checkbox ON rakho.
9. Generate / Preview dabao.
10. Print 6 per A4 dabao.

Example output:
- Tuition August: 400
- Transport: 400
- Previous dues: 100
- Total Payable: 900

## Note
Frontend TypeScript build passed in workspace. Rust compile cannot be checked in this sandbox because Cargo is not installed. If Rust/Tauri compile error appears on your laptop, send full CMD error screenshot/text.
