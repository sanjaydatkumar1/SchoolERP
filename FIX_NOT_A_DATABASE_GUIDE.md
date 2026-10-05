# Fix: database init failed - file is not a database

Error:

```text
thread 'main' panicked at src\main.rs:10:23:
database init failed: SqliteFailure(Error { code: NotADatabase, extended_code: 26 }, Some("file is not a database"))
```

## Reason

App ka SQLite database file corrupted/invalid ho gaya hai. Most likely restore ke time full ZIP backup ko direct `school_erp.sqlite3` ke upar copy kar diya gaya tha. ZIP file SQLite database nahi hoti, isliye app startup par crash ho gaya.

## Code fix added

Replace this file:

```text
src-tauri/src/db/mod.rs
```

New code:

1. Startup par DB header check karega.
2. Agar `school_erp.sqlite3` actually ZIP nikla, to ZIP ke andar se real `school_erp.sqlite3` extract karega.
3. Agar file invalid hai, to usko safe backup folder me move karke fresh DB create karega.
4. Future restore me ZIP backup ko direct copy nahi karega; pehle extract karega.

## Manual emergency fix if app still does not start

1. App close karo.
2. Windows Run open karo: `Win + R`
3. Type karo:

```text
%APPDATA%\PremiumSchoolERP
```

Agar folder nahi mile to try:

```text
%LOCALAPPDATA%\PremiumSchoolERP
```

4. Is file ko rename karo:

```text
school_erp.sqlite3
```

to:

```text
school_erp_bad.sqlite3
```

5. Saath me agar ye files ho to delete/rename kar do:

```text
school_erp.sqlite3-wal
school_erp.sqlite3-shm
restore_on_next_start.txt
```

6. App run karo:

```bat
cd /d E:\SchoolERP
npm run tauri:dev
```

App fresh DB ke saath start ho jayega. Agar aapke paas valid backup ZIP hai to Backup/Restore page se restore karo; new code ZIP ko properly extract karega.
