// SRS #35: the wire protocol is versioned so mobile and watch builds can
// detect a mismatch instead of silently misparsing each other's payloads.
export const SYNC_PROTOCOL_VERSION = 1;

export type FolderSyncItem = {
  id: string;
  name: string;
  updatedAt: number;
  deleted: boolean;
};

export type NoteSyncItem = {
  id: string;
  folderId: string | null;
  title: string;
  description: string;
  isPinned: boolean;
  updatedAt: number;
  deleted: boolean;
};

export type SyncRequestMessage = {
  type: 'SYNC_REQUEST';
  protocolVersion: number;
};

export type SyncDataMessage = {
  type: 'SYNC_DATA';
  protocolVersion: number;
  folders: FolderSyncItem[];
  notes: NoteSyncItem[];
};

export type SyncCompleteMessage = {
  type: 'SYNC_COMPLETE';
  protocolVersion: number;
};

export type SyncErrorMessage = {
  type: 'SYNC_ERROR';
  protocolVersion: number;
  reason: string;
};

export type SyncMessage =
  | SyncRequestMessage
  | SyncDataMessage
  | SyncCompleteMessage
  | SyncErrorMessage;

// Overall sync-session state (SRS #38) — distinct from the per-entity
// SyncStatus in types/domain.ts, which tracks PENDING/SYNCING/SYNCED/FAILED
// for individual folders/notes rather than the sync attempt as a whole.
export enum SyncSessionStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  SYNCING = 'SYNCING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  DISCONNECTED = 'DISCONNECTED',
}

export type SyncEntityRef = {
  entityId: string;
  entityType: 'folder' | 'note';
  version: number;
};

export type SyncChangeSet = {
  entityRefs: SyncEntityRef[];
  folders: FolderSyncItem[];
  notes: NoteSyncItem[];
};

export type SyncResult = {
  status: SyncSessionStatus.SUCCESS | SyncSessionStatus.FAILED;
  syncedFolders: number;
  syncedNotes: number;
  reason?: string;
  syncedAt: number;
};
