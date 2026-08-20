export type Folder = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type Note = {
  id: string;
  folderId: string | null;
  title: string;
  description: string;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}

export type SyncEntityType = 'folder' | 'note';

export type SyncMetadata = {
  entityId: string;
  entityType: SyncEntityType;
  version: number;
  lastSyncedAt: number | null;
  syncStatus: SyncStatus;
};

export type NewFolderInput = {
  name: string;
};

export type UpdateFolderInput = {
  name: string;
};

export type NewNoteInput = {
  title: string;
  description: string;
  folderId: string | null;
  isPinned?: boolean;
};

export type UpdateNoteInput = {
  title?: string;
  description?: string;
  folderId?: string | null;
  isPinned?: boolean;
};
