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
