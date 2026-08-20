import * as SQLite from 'expo-sqlite';

import { SyncEntityType, SyncMetadata, SyncStatus } from '../../types/domain';
import { SyncMetadataRow, syncMetadataFromRow } from '../schema/rows';

/**
 * Sync metadata is kept separate from business data (SRS #16) so change
 * tracking survives independently of note/folder CRUD. Every mutation to a
 * folder or note marks it PENDING here; the Phase 4 sync engine reads this
 * table to compute its diff instead of re-scanning every note.
 */
export async function markPending(
  db: SQLite.SQLiteDatabase,
  entityId: string,
  entityType: SyncEntityType,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO sync_metadata (entity_id, entity_type, version, last_synced_at, sync_status)
     VALUES (?, ?, 1, NULL, ?)
     ON CONFLICT(entity_id, entity_type) DO UPDATE SET
       version = version + 1,
       sync_status = excluded.sync_status`,
    [entityId, entityType, SyncStatus.PENDING],
  );
}

// Entities the sync engine still owes the watch a copy of: never-synced
// (PENDING) and previously-failed (FAILED, so a retry picks them back up).
export async function listOutstanding(db: SQLite.SQLiteDatabase): Promise<SyncMetadata[]> {
  const rows = await db.getAllAsync<SyncMetadataRow>(
    `SELECT * FROM sync_metadata WHERE sync_status IN (?, ?)`,
    [SyncStatus.PENDING, SyncStatus.FAILED],
  );
  return rows.map(syncMetadataFromRow);
}

export async function markSyncing(
  db: SQLite.SQLiteDatabase,
  entityRefs: Array<{ entityId: string; entityType: SyncEntityType }>,
): Promise<void> {
  for (const ref of entityRefs) {
    await db.runAsync(
      'UPDATE sync_metadata SET sync_status = ? WHERE entity_id = ? AND entity_type = ?',
      [SyncStatus.SYNCING, ref.entityId, ref.entityType],
    );
  }
}

// Only marks entities SYNCED if they haven't been mutated again since this
// sync attempt started (version still matches) — otherwise a change made
// mid-sync would be incorrectly reported as delivered.
export async function markSynced(
  db: SQLite.SQLiteDatabase,
  entityRefs: Array<{ entityId: string; entityType: SyncEntityType; version: number }>,
  syncedAt: number,
): Promise<void> {
  for (const ref of entityRefs) {
    await db.runAsync(
      `UPDATE sync_metadata SET sync_status = ?, last_synced_at = ?
       WHERE entity_id = ? AND entity_type = ? AND version = ?`,
      [SyncStatus.SYNCED, syncedAt, ref.entityId, ref.entityType, ref.version],
    );
  }
}

// SRS #37: a failed sync must leave existing data alone and stay retryable —
// this only flips the status flag, nothing else.
export async function markFailed(
  db: SQLite.SQLiteDatabase,
  entityRefs: Array<{ entityId: string; entityType: SyncEntityType }>,
): Promise<void> {
  for (const ref of entityRefs) {
    await db.runAsync(
      'UPDATE sync_metadata SET sync_status = ? WHERE entity_id = ? AND entity_type = ?',
      [SyncStatus.FAILED, ref.entityId, ref.entityType],
    );
  }
}

export async function purgeMetadata(
  db: SQLite.SQLiteDatabase,
  entityId: string,
  entityType: SyncEntityType,
): Promise<void> {
  await db.runAsync('DELETE FROM sync_metadata WHERE entity_id = ? AND entity_type = ?', [
    entityId,
    entityType,
  ]);
}
