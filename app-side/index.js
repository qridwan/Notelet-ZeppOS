import { BaseSideService } from '@zeppos/zml/base-side'

import { MOCK_FOLDERS, MOCK_NOTES } from './../utils/constants'

/**
 * Phase 1 (SRS #63): serves mock folders/notes so the watch UI can be built and
 * tested standalone. Phase 5 replaces the data source here with the real
 * mobile -> watch sync payload, without changing the watch-side request contract.
 */
AppSideService(
  BaseSideService({
    onInit() {},
    onRequest(req, res) {
      if (req.method === 'GET_FOLDERS') {
        res(null, { result: MOCK_FOLDERS })
      } else if (req.method === 'GET_NOTES') {
        const { folderId } = req.params || {}
        const notes = MOCK_NOTES.filter((n) => !n.deletedAt && (!folderId || n.folderId === folderId))
        res(null, { result: notes })
      } else if (req.method === 'GET_PINNED_NOTES') {
        res(null, { result: MOCK_NOTES.filter((n) => !n.deletedAt && n.isPinned) })
      } else if (req.method === 'GET_NOTE') {
        const { id } = req.params || {}
        const note = MOCK_NOTES.find((n) => n.id === id) || null
        res(null, { result: note })
      } else {
        res(new Error('Unknown method: ' + req.method))
      }
    },
    onRun() {},
    onDestroy() {}
  })
)
