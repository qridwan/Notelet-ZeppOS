import * as SQLite from 'expo-sqlite';

import { SyncEntityType, SyncStatus } from '../../types/domain';

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
