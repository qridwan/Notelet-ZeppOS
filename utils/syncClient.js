import { SyncStatusValue } from './constants'
import { validateSyncPayload } from './payloadValidation'
import { applySyncPayload } from './syncStore'
import { setSyncStatus } from './syncStatus'

/**
 * Runs one pull-sync: ask app-side for the latest payload, validate it,
 * apply it to local storage, and record the outcome for the home screen's
 * "Last synced" row. `requestFn` is a page's bound `this.request` — kept as
 * a parameter (rather than importing BasePage here) so this module has no
 * dependency on which page triggers it.
 *
 * Transport-agnostic by design: today `requestFn` resolves against app-side's
 * mock PULL_SYNC handler; once Phase 0's communication POC lands, app-side
 * swaps in the real mobile payload and this function doesn't change.
 */
export function runSync(requestFn) {
  setSyncStatus({ status: SyncStatusValue.SYNCING })

  return requestFn({ method: 'PULL_SYNC' })
    .then(({ result }) => {
      const payload = validateSyncPayload(result)
      const summary = applySyncPayload(payload)
      setSyncStatus({
        status: SyncStatusValue.SUCCESS,
        lastSyncedAt: Date.now(),
        lastError: null,
        folderCount: summary.folderCount,
        noteCount: summary.noteCount
      })
      return summary
    })
    .catch((error) => {
      // SRS #37: sync failed, but local storage was never touched — whatever
      // was there before this call remains available.
      setSyncStatus({
        status: SyncStatusValue.FAILED,
        lastError: error && error.message ? error.message : 'Sync failed'
      })
      throw error
    })
}
