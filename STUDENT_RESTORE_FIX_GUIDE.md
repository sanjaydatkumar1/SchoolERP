# Student Restore + Build Error Fix Guide

## Fixed in this phase

1. TypeScript build error fixed:
   - `replaceAll` removed and replaced with older-compatible `.replace(/.../g, ...)`.
   - Files:
     - `src/services/schoolApi.ts`
     - `src/utils/exporters.ts`

2. Student restore option added:
   - Left / TC Issued / Passed Out / Inactive student ko wapas `Active` kiya ja sakta hai.
   - Students table me non-active student ke Actions me green Restore icon dikhega.
   - Restore karne par leaving date, leaving reason, TC number, TC issue date clear ho jayenge.
   - Agar same class/session/section me same roll number kisi active student ke paas already hai, restore hote waqt old roll number auto clear ho jayega, taaki duplicate roll error na aaye.
   - Restore event student timeline aur audit log me save hota hai.

## Files to replace on laptop

Copy these files to `E:\SchoolERP`:

- `src/pages/Students.tsx`
- `src/services/schoolApi.ts`
- `src/utils/exporters.ts`
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/main.rs`

## Test steps

Open CMD:

```bat
cd /d E:\SchoolERP
npm run tauri:dev
```

Then in app:

1. Login.
2. Open `Students`.
3. Kisi student ko `Mark left` karo.
4. Status filter me `Left` choose karo ya search me `Left` type karo.
5. Actions column me green restore icon dabao.
6. Confirm karo.
7. Student status `Active` ho jana chahiye.

## Note

Frontend TypeScript build is passing in workspace. Rust compile cannot be checked here because this sandbox does not have Cargo installed. If Windows laptop par Rust/Tauri compile error aaye, full CMD error text or screenshot bhej dena; exact line fix kar dunga.
