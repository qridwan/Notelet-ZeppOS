import { SYNC_PROTOCOL_VERSION } from './constants'

export class SyncPayloadError extends Error {}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0
}

/**
 * Structural validation for an incoming SYNC_DATA payload (SRS #35, #53:
 * external synchronization payloads must never be trusted as-is). Mirrors
 * the shape produced by mobile/src/services/sync/changeSet.ts.
 */
export function validateSyncPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new SyncPayloadError('Sync payload must be an object')
  }
  if (payload.protocolVersion !== SYNC_PROTOCOL_VERSION) {
    throw new SyncPayloadError(
      `Unsupported sync protocol version: ${payload.protocolVersion} (expected ${SYNC_PROTOCOL_VERSION})`
    )
  }
  if (!Array.isArray(payload.folders) || !Array.isArray(payload.notes)) {
    throw new SyncPayloadError('Sync payload must include folders[] and notes[]')
  }

  payload.folders.forEach((folder, index) => {
    if (!folder || !isNonEmptyString(folder.id) || typeof folder.deleted !== 'boolean') {
      throw new SyncPayloadError(`Invalid folder entry at index ${index}`)
    }
  })

  payload.notes.forEach((note, index) => {
    if (!note || !isNonEmptyString(note.id) || typeof note.deleted !== 'boolean') {
      throw new SyncPayloadError(`Invalid note entry at index ${index}`)
    }
  })

  return payload
}
