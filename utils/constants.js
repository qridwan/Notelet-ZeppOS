export const FOLDERS_FILE_NAME = 'notelet_folders.json'
export const NOTES_FILE_NAME = 'notelet_notes.json'
export const SYNC_STATUS_FILE_NAME = 'notelet_sync_status.json'

// Must match SYNC_PROTOCOL_VERSION in mobile/src/types/sync.ts.
export const SYNC_PROTOCOL_VERSION = 1

export const SyncStatusValue = {
  IDLE: 'IDLE',
  SYNCING: 'SYNCING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}

// Seed data used until real mobile -> watch sync is implemented (SRS Phase 1: mock-data UI).
export const MOCK_FOLDERS = [
  { id: 'folder-work', name: 'Work', createdAt: 1750000000000, updatedAt: 1750000000000 },
  { id: 'folder-personal', name: 'Personal', createdAt: 1750000000000, updatedAt: 1750000000000 },
  { id: 'folder-ideas', name: 'Ideas', createdAt: 1750000000000, updatedAt: 1750000000000 }
]

export const MOCK_NOTES = [
  {
    id: 'note-001',
    folderId: 'folder-work',
    title: 'API Architecture',
    description:
      'Use Redis for frequently accessed API responses. Consider cache invalidation for frequently changing resources.',
    isPinned: true,
    createdAt: 1750000000000,
    updatedAt: 1750000000000,
    deletedAt: null
  },
  {
    id: 'note-002',
    folderId: 'folder-work',
    title: 'Meeting Notes',
    description: 'Discussed Q3 roadmap. Follow up with design team about the new watch UI.',
    isPinned: true,
    createdAt: 1750000000000,
    updatedAt: 1750000000000,
    deletedAt: null
  },
  {
    id: 'note-003',
    folderId: 'folder-work',
    title: 'Deployment',
    description: 'Blue/green deployment checklist: run migrations, warm caches, flip traffic.',
    isPinned: false,
    createdAt: 1750000000000,
    updatedAt: 1750000000000,
    deletedAt: null
  },
  {
    id: 'note-004',
    folderId: 'folder-personal',
    title: 'Grocery List',
    description: 'Eggs, milk, coffee, bread.',
    isPinned: false,
    createdAt: 1750000000000,
    updatedAt: 1750000000000,
    deletedAt: null
  },
  {
    id: 'note-005',
    folderId: 'folder-ideas',
    title: 'Current Project',
    description: 'Notelet: offline-first notes with a Zepp OS watch companion.',
    isPinned: true,
    createdAt: 1750000000000,
    updatedAt: 1750000000000,
    deletedAt: null
  }
]
