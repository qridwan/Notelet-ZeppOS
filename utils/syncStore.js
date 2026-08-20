import { FOLDERS_FILE_NAME, NOTES_FILE_NAME } from './constants'
import { readJsonFile, writeJsonFile } from './storage'
import { mergeFolders, mergeNotes } from './syncMerge'

/**
 * The watch's own local copy of folders/notes (SRS #39). Everything the
 * watch UI displays comes from here, not from a live request to app-side —
 * that's what keeps notes readable after the phone disconnects. The only
 * writer is applySyncPayload(), called once per successful sync.
 */
function loadFolders() {
  return readJsonFile(FOLDERS_FILE_NAME, [])
}

function loadNotes() {
  return readJsonFile(NOTES_FILE_NAME, [])
}

export function getFolders() {
  return loadFolders()
}

export function getNotesByFolder(folderId) {
  return loadNotes().filter((note) => note.folderId === folderId)
}

export function getPinnedNotes() {
  return loadNotes().filter((note) => note.isPinned)
}

export function getNoteById(id) {
  return loadNotes().find((note) => note.id === id) || null
}

// SRS #32/#34: applies CREATE/UPDATE/DELETE for both folders and notes from
// one incremental payload. Each entity type is written with a single
// writeJsonFile call (not per-item), so a mid-sync crash leaves the previous
// complete file untouched rather than a half-written one (SRS #36).
export function applySyncPayload(payload) {
  const folderMerge = mergeFolders(loadFolders(), payload.folders)
  const noteMerge = mergeNotes(loadNotes(), payload.notes)

  writeJsonFile(FOLDERS_FILE_NAME, folderMerge.folders)
  writeJsonFile(NOTES_FILE_NAME, noteMerge.notes)

  return {
    folderCount: folderMerge.folders.length,
    noteCount: noteMerge.notes.length,
    upsertedFolders: folderMerge.upserted,
    removedFolders: folderMerge.removed,
    upsertedNotes: noteMerge.upserted,
    removedNotes: noteMerge.removed
  }
}
