import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME } from '../constants';
import { migrations } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  const pending = migrations
    .filter((migration) => migration.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.execAsync(migration.up);
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    currentVersion = migration.version;
  }
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA foreign_keys = ON');
  await runMigrations(db);
  return db;
}

// Offline-first (SRS P-001): the mobile database is opened once, lazily, and
// reused for the app's lifetime. No network round-trip is ever on this path.
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabase();
  }
  return dbPromise;
}

// Test-only escape hatch: forces the next getDatabase() call to re-open.
export function resetDatabaseConnectionForTests(): void {
  dbPromise = null;
}
