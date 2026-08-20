import { SYNC_STATUS_FILE_NAME, SyncStatusValue } from './constants'
import { readJsonFile, writeJsonFile } from './storage'

const DEFAULT_STATUS = {
  status: SyncStatusValue.IDLE,
  lastSyncedAt: null,
  lastError: null,
  folderCount: 0,
  noteCount: 0
}

// SRS #29/#38: lets the home screen show "Last synced: ..." without redoing
// the sync itself.
export function getSyncStatus() {
  return readJsonFile(SYNC_STATUS_FILE_NAME, DEFAULT_STATUS)
}

export function setSyncStatus(patch) {
  const next = { ...getSyncStatus(), ...patch }
  writeJsonFile(SYNC_STATUS_FILE_NAME, next)
  return next
}
