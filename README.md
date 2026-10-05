# Premium Offline School ERP — Tauri + React + SQLite

A production-oriented desktop School Management System foundation using React, Vite, Tailwind CSS, TypeScript, Tauri, Rust, SQLite, Recharts, TanStack Table, React Hook Form/Zod-ready validation, PDF/Excel-ready module boundaries, role-based access, audit logs, backup/restore and safe migrations.

## Run

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

The Tauri build creates native bundles/installers under `src-tauri/target/release/bundle` on the build machine. On Windows this can produce NSIS/MSI depending on installed prerequisites.

## Default login seed

- username: `admin`
- password seed hash is for `admin123` — force change before production rollout.

## Implemented foundation

- React/Vite/Tailwind/Tauri project structure
- Premium desktop ERP shell with collapsible sidebar, top header, theme support
- Sidebar modules requested by the specification
- Recharts dashboard widgets and notification panel
- Student listing with global filtering, TanStack table and status badges
- Rust SQLite initialization with WAL, foreign keys and migration file
- Core future-proof schema with required tables, indexes, constraints, soft-delete timestamps, audit logs and settings
- Tauri commands for initialization, dashboard stats, students, notifications, data integrity checks, backup preview and legacy import stub
- Zod validation sample for students and RBAC permission catalog

## Legacy Python/Tkinter migration

The importer is intentionally guarded until the old Python DB schema is supplied. This prevents corrupting existing data. Once the old `.db` file or schema is available, add column mapping in `import_legacy_sqlite`, import inside a transaction, normalize admission numbers, and write audit/import logs.

## Phased roadmap

1. Complete exact legacy DB mapping and importer.
2. Implement full CRUD forms and command coverage for every module.
3. Add professional PDF templates for receipts, TC, ID cards, registers, slips and marksheets.
4. Add Excel import/export validation workflows.
5. Harden RBAC screens, login/session handling and installer branding.
