import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'

import { SYNC_PROTOCOL_VERSION } from './../utils/constants'

const SYNC_STATUS_KEY = 'syncStatus'
const FORCE_SYNC_KEY = 'forceSyncRequestedAt'
// Single combined key, written by setting/index.js in exactly one
// settingsStorage.setItem call per CRUD action. Multiple separate keys each
// triggering their own write (and, it seems, their own Side Service reload)
// reproducibly crashed the framework's own hot-reload — this key exists to
// keep that to one write, one reload, per action.
const NOTELET_DATA_KEY = 'noteletData'

function readJson(key, fallback) {
  const raw = settingsLib.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

/**
 * settingsStorage is the interim "real" data source until the mobile app
 * <-> watch BLE bridge (Phase 0) exists: the phone's Settings page
 * (setting/index.js) does folder/note CRUD directly against it, and
 * PULL_SYNC below just serves whatever is currently stored there. No mock
 * data — an untouched install starts genuinely empty.
 */
function buildSyncPayload() {
  const data = readJson(NOTELET_DATA_KEY, {
    folders: [],
    notes: [],
    deletedFolderIds: [],
    deletedNoteIds: []
  })
  const folders = data.folders || []
  const notes = data.notes || []
  const deletedFolderIds = data.deletedFolderIds || []
  const deletedNoteIds = data.deletedNoteIds || []

  return {
    protocolVersion: SYNC_PROTOCOL_VERSION,
    folders: [
      ...folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        updatedAt: folder.updatedAt,
        deleted: false
      })),
      ...deletedFolderIds.map((id) => ({ id, name: '', updatedAt: Date.now(), deleted: true }))
    ],
    notes: [
      ...notes.map((note) => ({
        id: note.id,
        folderId: note.folderId,
        title: note.title,
        description: note.description,
        isPinned: note.isPinned,
        updatedAt: note.updatedAt,
        deleted: false
      })),
      ...deletedNoteIds.map((id) => ({
        id,
        folderId: null,
        title: '',
        description: '',
        isPinned: false,
        updatedAt: Date.now(),
        deleted: true
      }))
    ]
  }
}

/**
 * Phase 5 (SRS #63): the watch pulls a full sync payload through PULL_SYNC
 * and applies it to its own local storage (utils/syncStore.js) so it keeps
 * working after the phone disconnects — the watch pages never call this
 * service directly for reads.
 *
 * Also bridges the phone Settings App to the watch: Settings App and Side
 * Service only share `settingsStorage` (no direct call), so the "check for
 * updates" button in setting/index.js writes FORCE_SYNC_KEY there;
 * onSettingsChange below observes that and pushes to the watch via
 * `this.call()`, which page/home/index.page.js picks up in `onCall`. After
 * a sync, the watch reports back via REPORT_SYNC_STATUS so Settings can
 * show real numbers instead of nothing.
 */
AppSideService(
  BaseSideService({
    onInit() {},
    onRequest(req, res) {
      if (req.method === 'PULL_SYNC') {
        res(null, { result: buildSyncPayload() })
      } else if (req.method === 'REPORT_SYNC_STATUS') {
        settingsLib.setItem(SYNC_STATUS_KEY, JSON.stringify(req.params))
        res(null, { result: true })
      } else {
        res(new Error('Unknown method: ' + req.method))
      }
    },
    onSettingsChange({ key }) {
      if (key !== FORCE_SYNC_KEY) return
      // `this.call()` pushes to the Device App and throws if it isn't
      // currently connected/foregrounded (observed: it can crash this
      // Side Service instance entirely, taking the watch app down with
      // it) — guarded so a Settings App tap can never do that.
      try {
        this.call({ type: 'FORCE_SYNC' })
      } catch (error) {
        // Nothing to recover here — the watch will still pick up the
        // change next time it syncs on its own.
      }
    },
    onRun() {},
    onDestroy() {}
  })
)
