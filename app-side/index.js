import { BaseSideService } from '@zeppos/zml/base-side'

import { MOCK_FOLDERS, MOCK_NOTES, SYNC_PROTOCOL_VERSION } from './../utils/constants'

function buildSyncPayload() {
  return {
    protocolVersion: SYNC_PROTOCOL_VERSION,
    folders: MOCK_FOLDERS.map((folder) => ({
      id: folder.id,
      name: folder.name,
      updatedAt: folder.updatedAt,
      deleted: false
    })),
    notes: MOCK_NOTES.map((note) => ({
      id: note.id,
      folderId: note.folderId,
      title: note.title,
      description: note.description,
      isPinned: note.isPinned,
      updatedAt: note.updatedAt,
      deleted: Boolean(note.deletedAt)
    }))
  }
}

/**
 * Phase 5 (SRS #63): the watch pulls a full sync payload through PULL_SYNC
 * and applies it to its own local storage (utils/syncStore.js) so it keeps
 * working after the phone disconnects — the watch pages never call this
 * service directly for reads. Until Phase 0's communication POC settles how
 * this app-side process actually reaches the mobile app's real SQLite data,
 * PULL_SYNC serves the same mock catalog in the wire format
 * mobile/src/services/sync/changeSet.ts produces — swapping the mock for a
 * real bridge call only changes buildSyncPayload(), not the watch-side
 * contract.
 */
AppSideService(
  BaseSideService({
    onInit() {},
    onRequest(req, res) {
      if (req.method === 'PULL_SYNC') {
        res(null, { result: buildSyncPayload() })
      } else {
        res(new Error('Unknown method: ' + req.method))
      }
    },
    onRun() {},
    onDestroy() {}
  })
)
