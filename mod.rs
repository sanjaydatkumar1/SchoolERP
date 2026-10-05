use rusqlite::{Connection, Result};
use std::{fs, io::Read, path::PathBuf, sync::Mutex};

pub struct Db { pub conn: Mutex<Connection>, pub path: PathBuf }

struct Migration { version: i64, name: &'static str, sql: &'static str }

const MIGRATIONS: &[Migration] = &[
  Migration { version: 1, name: "001_initial", sql: include_str!("migrations/001_initial.sql") },
  Migration { version: 2, name: "002_family_billing", sql: include_str!("migrations/002_family_billing.sql") },
  Migration { version: 3, name: "003_app_settings", sql: include_str!("migrations/003_app_settings.sql") },
];

impl Db {
  pub fn new() -> Result<Self> {
    let base = dirs::data_dir().unwrap_or_else(|| std::env::current_dir().unwrap()).join("PremiumSchoolERP");
    fs::create_dir_all(&base).ok();
    let path = base.join("school_erp.sqlite3");

    // Scheduled restore can be a direct .sqlite3 OR a full ZIP backup.
    // Earlier builds could accidentally copy a ZIP file over the SQLite DB,
    // causing: SqliteFailure(NotADatabase). This recovery guard prevents startup panic.
    process_scheduled_restore(&base, &path).ok();
    recover_invalid_database_file(&base, &path).ok();

    let conn = Connection::open(&path)?;
    conn.pragma_update(None, "foreign_keys", "ON")?;
    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "synchronous", "NORMAL")?;
    run_migrations(&conn, &path)?;
    Ok(Self { conn: Mutex::new(conn), path })
  }
}

fn is_sqlite_file(path: &PathBuf) -> std::io::Result<bool> {
  if !path.exists() { return Ok(true); }
  let mut f = fs::File::open(path)?;
  let mut header = [0u8; 16];
  let n = f.read(&mut header)?;
  if n == 0 { return Ok(false); }
  Ok(n >= 16 && &header == b"SQLite format 3\0")
}

fn is_zip_file(path: &PathBuf) -> std::io::Result<bool> {
  if !path.exists() { return Ok(false); }
  let mut f = fs::File::open(path)?;
  let mut header = [0u8; 4];
  let n = f.read(&mut header)?;
  Ok(n >= 4 && header == [b'P', b'K', 3, 4])
}

fn extract_sqlite_from_zip(zip_path: &PathBuf, dest_db: &PathBuf) -> std::io::Result<bool> {
  let file = fs::File::open(zip_path)?;
  let mut archive = zip::ZipArchive::new(file).map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
  for name in ["school_erp.sqlite3", "database.sqlite3", "school_erp.db"] {
    if let Ok(mut entry) = archive.by_name(name) {
      let mut bytes = Vec::new();
      entry.read_to_end(&mut bytes)?;
      fs::write(dest_db, bytes)?;
      return Ok(true);
    }
  }
  Ok(false)
}

fn recover_invalid_database_file(base: &PathBuf, db_path: &PathBuf) -> std::io::Result<()> {
  if !db_path.exists() { return Ok(()); }
  if is_sqlite_file(db_path)? { return Ok(()); }

  let recovery_dir = base.join("invalid_database_backups");
  fs::create_dir_all(&recovery_dir)?;
  let stamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();

  // If the DB path actually contains a ZIP backup, extract the real SQLite DB from it.
  if is_zip_file(db_path)? {
    let bad_zip_copy = recovery_dir.join(format!("school_erp_was_zip_{}.zip", stamp));
    fs::copy(db_path, &bad_zip_copy)?;
    let tmp_db = recovery_dir.join(format!("extracted_{}.sqlite3", stamp));
    if extract_sqlite_from_zip(&bad_zip_copy, &tmp_db)? && is_sqlite_file(&tmp_db)? {
      fs::copy(&tmp_db, db_path)?;
      return Ok(());
    }
  }

  // Otherwise preserve the invalid file and let SQLite create a fresh DB.
  let bad_file = recovery_dir.join(format!("invalid_school_erp_{}.bin", stamp));
  if fs::rename(db_path, &bad_file).is_err() {
    let copy_file = recovery_dir.join(format!("invalid_school_erp_{}_copy.bin", stamp));
    fs::copy(db_path, copy_file)?;
    let _ = fs::remove_file(db_path);
  }
  Ok(())
}

fn process_scheduled_restore(base: &PathBuf, db_path: &PathBuf) -> std::io::Result<()> {
  let marker = base.join("restore_on_next_start.txt");
  if !marker.exists() { return Ok(()); }
  let restore_path = fs::read_to_string(&marker)?.trim().to_string();
  let restore_file = PathBuf::from(&restore_path);
  if !restore_file.exists() {
    let _ = fs::rename(&marker, base.join("restore_failed_missing_file.txt"));
    return Ok(());
  }
  let restore_backup_dir = base.join("restore_backups");
  fs::create_dir_all(&restore_backup_dir)?;
  if db_path.exists() {
    let before_restore = restore_backup_dir.join(format!("before_restore_{}.sqlite3", chrono::Local::now().format("%Y%m%d_%H%M%S")));
    fs::copy(db_path, before_restore)?;
    let wal = db_path.with_extension("sqlite3-wal");
    let shm = db_path.with_extension("sqlite3-shm");
    let _ = fs::remove_file(wal);
    let _ = fs::remove_file(shm);
  }

  if is_zip_file(&restore_file).unwrap_or(false) {
    let extracted = restore_backup_dir.join(format!("restore_zip_extracted_{}.sqlite3", chrono::Local::now().format("%Y%m%d_%H%M%S")));
    if extract_sqlite_from_zip(&restore_file, &extracted)? && is_sqlite_file(&extracted)? {
      fs::copy(&extracted, db_path)?;
    } else {
      let _ = fs::rename(&marker, base.join("restore_failed_invalid_zip.txt"));
      return Ok(());
    }
  } else {
    fs::copy(&restore_file, db_path)?;
  }

  let done = base.join(format!("restore_completed_{}.txt", chrono::Local::now().format("%Y%m%d_%H%M%S")));
  fs::write(done, restore_path)?;
  fs::remove_file(marker)?;
  Ok(())
}

fn run_migrations(conn: &Connection, db_path: &PathBuf) -> Result<()> {
  conn.execute_batch("CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);")?;
  for migration in MIGRATIONS {
    let exists: i64 = conn.query_row("SELECT COUNT(*) FROM schema_migrations WHERE version=?", [migration.version], |r| r.get(0)).unwrap_or(0);
    if exists == 0 {
      backup_before_migration(db_path, migration.version).ok();
      let tx = conn.unchecked_transaction()?;
      tx.execute_batch(migration.sql)?;
      tx.execute("INSERT OR IGNORE INTO schema_migrations(version,name) VALUES (?,?)", rusqlite::params![migration.version, migration.name])?;
      tx.commit()?;
    }
  }
  seed_defaults(conn)?;
  Ok(())
}

fn backup_before_migration(db_path: &PathBuf, version: i64) -> std::io::Result<()> {
  if !db_path.exists() { return Ok(()); }
  let backup_dir = db_path.parent().unwrap_or_else(|| std::path::Path::new(".")).join("migration_backups");
  fs::create_dir_all(&backup_dir)?;
  let backup_path = backup_dir.join(format!("before_migration_{}_{}.sqlite3", version, chrono::Local::now().format("%Y%m%d_%H%M%S")));
  fs::copy(db_path, backup_path)?;
  Ok(())
}

fn seed_defaults(conn: &Connection) -> Result<()> {
  conn.execute("INSERT OR IGNORE INTO roles(id,name,description) VALUES (1,'Admin','Full system access'),(2,'Teacher','Attendance and exam entry'),(3,'Accountant','Fees and payroll'),(4,'Reception','Admissions'),(5,'Principal','Reports and approvals')", [])?;
  conn.execute("INSERT OR IGNORE INTO users(id,username,password_hash,full_name,role_id,status) VALUES (1,'admin','$2b$12$W0j9oEAyoHOmgQuE5883eOOBi8Erp/dxPffSCju22ME7Nl.nZbf9i','Administrator',1,'Active')", [])?; // default password: admin123 - force change in production
  Ok(())
}
