import { SYNC_PROTOCOL_VERSION, SyncMessage } from '../../types/sync';

export class SyncProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SyncProtocolError';
  }
}

// SRS #53: external synchronization payloads must be validated, never trusted
// as-is — this runs on anything the transport hands back to the engine.
export function parseIncomingSyncMessage(raw: unknown): SyncMessage {
  if (typeof raw !== 'object' || raw === null) {
    throw new SyncProtocolError('Sync message must be an object');
  }

  const message = raw as Record<string, unknown>;

  if (typeof message.type !== 'string') {
    throw new SyncProtocolError('Sync message missing "type"');
  }
  if (typeof message.protocolVersion !== 'number') {
    throw new SyncProtocolError('Sync message missing "protocolVersion"');
  }
  if (message.protocolVersion !== SYNC_PROTOCOL_VERSION) {
    throw new SyncProtocolError(
      `Unsupported sync protocol version: ${message.protocolVersion} (expected ${SYNC_PROTOCOL_VERSION})`,
    );
  }

  switch (message.type) {
    case 'SYNC_COMPLETE':
      return { type: 'SYNC_COMPLETE', protocolVersion: message.protocolVersion };
    case 'SYNC_ERROR':
      if (typeof message.reason !== 'string') {
        throw new SyncProtocolError('SYNC_ERROR missing "reason"');
      }
      return {
        type: 'SYNC_ERROR',
        protocolVersion: message.protocolVersion,
        reason: message.reason,
      };
    case 'SYNC_REQUEST':
      return { type: 'SYNC_REQUEST', protocolVersion: message.protocolVersion };
    default:
      throw new SyncProtocolError(`Unknown sync message type: ${message.type}`);
  }
}
