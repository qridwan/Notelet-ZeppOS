import { Folder, Note, SyncEntityType, SyncMetadata, SyncStatus } from '../../types/domain';

// Raw shapes as they come back from expo-sqlite (snake_case columns, 0/1 booleans).
export type FolderRow = {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
};

export type NoteRow = {
  id: string;
  folder_id: string | null;
  title: string;
  description: string;
  is_pinned: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type SyncMetadataRow = {
  entity_id: string;
  entity_type: string;
  version: number;
  last_synced_at: number | null;
  sync_status: string;
};

export function folderFromRow(row: FolderRow): Folder {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function noteFromRow(row: NoteRow): Note {
  return {
    id: row.id,
    folderId: row.folder_id,
    title: row.title,
    description: row.description,
    isPinned: row.is_pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function syncMetadataFromRow(row: SyncMetadataRow): SyncMetadata {
  return {
    entityId: row.entity_id,
    entityType: row.entity_type as SyncEntityType,
    version: row.version,
    lastSyncedAt: row.last_synced_at,
    syncStatus: row.sync_status as SyncStatus,
  };
}
