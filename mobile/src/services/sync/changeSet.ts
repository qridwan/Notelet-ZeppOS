import * as SQLite from 'expo-sqlite';

import { listOutstanding } from '../../database/repositories/syncMetadataRepository';
import { FolderSyncItem, NoteSyncItem, SyncChangeSet, SyncEntityRef } from '../../types/sync';

type FolderJoinRow = {
  entity_id: string;
  version: number;
  name: string | null;
  updated_at: number | null;
};

type NoteJoinRow = {
  entity_id: string;
  version: number;
  folder_id: string | null;
  title: string | null;
  description: string | null;
  is_pinned: number | null;
  updated_at: number | null;
  deleted_at: number | null;
};

// SRS #33: incremental sync — only entities the sync_metadata table marks
// PENDING/FAILED are read, never a full folders+notes scan.
export async function loadChangeSet(
  db: SQLite.SQLiteDatabase,
  onlyEntityIds?: Set<string>,
): Promise<SyncChangeSet> {
  const outstanding = (await listOutstanding(db)).filter(
    (entry) => !onlyEntityIds || onlyEntityIds.has(entry.entityId),
  );

  const folderIds = outstanding.filter((e) => e.entityType === 'folder').map((e) => e.entityId);
  const noteIds = outstanding.filter((e) => e.entityType === 'note').map((e) => e.entityId);

  const folderRows = folderIds.length
    ? await db.getAllAsync<FolderJoinRow>(
        `SELECT sm.entity_id, sm.version, f.name, f.updated_at
         FROM sync_metadata sm
         LEFT JOIN folders f ON f.id = sm.entity_id
         WHERE sm.entity_type = 'folder' AND sm.entity_id IN (${folderIds.map(() => '?').join(',')})`,
        folderIds,
      )
    : [];

  const noteRows = noteIds.length
    ? await db.getAllAsync<NoteJoinRow>(
        `SELECT sm.entity_id, sm.version, n.folder_id, n.title, n.description, n.is_pinned, n.updated_at, n.deleted_at
         FROM sync_metadata sm
         LEFT JOIN notes n ON n.id = sm.entity_id
         WHERE sm.entity_type = 'note' AND sm.entity_id IN (${noteIds.map(() => '?').join(',')})`,
        noteIds,
      )
    : [];

  return buildChangeSet(folderRows, noteRows);
}

// Pure transform, kept separate from the SQL above so it can be unit-tested
// (and reasoned about) without a live database connection.
export function buildChangeSet(folderRows: FolderJoinRow[], noteRows: NoteJoinRow[]): SyncChangeSet {
  const entityRefs: SyncEntityRef[] = [];
  const folders: FolderSyncItem[] = [];
  const notes: NoteSyncItem[] = [];
  const now = Date.now();

  for (const row of folderRows) {
    entityRefs.push({ entityId: row.entity_id, entityType: 'folder', version: row.version });
    // A folder missing from the table was hard-deleted (FR-MOB-003) — this is
    // its tombstone: the watch only needs the id to remove its local copy.
    const wasDeleted = row.name === null;
    folders.push({
      id: row.entity_id,
      name: wasDeleted ? '' : row.name!,
      updatedAt: wasDeleted ? now : row.updated_at!,
      deleted: wasDeleted,
    });
  }

  for (const row of noteRows) {
    entityRefs.push({ entityId: row.entity_id, entityType: 'note', version: row.version });
    // Notes are soft-deleted, so the row is still present with deleted_at set
    // (SRS #34) rather than missing outright like a purged folder.
    const isDeleted = row.deleted_at !== null && row.deleted_at !== undefined;
    notes.push({
      id: row.entity_id,
      folderId: row.folder_id,
      // Deletion tombstones omit content to keep the payload minimal (SRS P-005).
      title: isDeleted ? '' : row.title ?? '',
      description: isDeleted ? '' : row.description ?? '',
      isPinned: row.is_pinned === 1,
      updatedAt: row.updated_at ?? now,
      deleted: isDeleted,
    });
  }

  return { entityRefs, folders, notes };
}
