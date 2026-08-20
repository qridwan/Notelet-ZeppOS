import { SyncMessage } from '../../types/sync';

/**
 * Abstraction over the phone <-> watch communication channel.
 *
 * SRS §9 requires validating the actual Zepp OS 5.0 / API 4.4 messaging APIs
 * with a physical device before the full sync architecture is built — that
 * POC (Phase 0) hasn't run yet. This interface lets the rest of the sync
 * engine (protocol, change detection, retry, error handling) be built and
 * exercised now against `MockWatchTransport`, then swapped for a real
 * `ZeppWatchTransport` once the POC confirms which Zepp SDK APIs to use,
 * without touching SyncEngine itself.
 */
export interface SyncTransport {
  readonly isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: SyncMessage): Promise<void>;
  /** Returns an unsubscribe function. */
  onMessage(handler: (message: SyncMessage) => void): () => void;
}

type MockWatchOptions = {
  /** Simulated round-trip latency in ms. */
  latencyMs?: number;
  /** If true, the next sync attempt responds with SYNC_ERROR instead of SYNC_COMPLETE. */
  failNextSync?: boolean;
};

/**
 * In-memory stand-in for a paired watch. Applies received folders/notes to
 * its own store (so it can be inspected in dev/tests) and acknowledges with
 * SYNC_COMPLETE — or SYNC_ERROR once, if `failNextSync` is set, to exercise
 * the retry path without real hardware.
 */
export class MockWatchTransport implements SyncTransport {
  isConnected = false;

  readonly watchFolders = new Map<string, { name: string; updatedAt: number }>();
  readonly watchNotes = new Map<
    string,
    { folderId: string | null; title: string; description: string; isPinned: boolean; updatedAt: number }
  >();

  private handlers: Array<(message: SyncMessage) => void> = [];
  private failNextSync: boolean;
  private latencyMs: number;

  constructor(options: MockWatchOptions = {}) {
    this.failNextSync = options.failNextSync ?? false;
    this.latencyMs = options.latencyMs ?? 10;
  }

  async connect(): Promise<void> {
    await delay(this.latencyMs);
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  onMessage(handler: (message: SyncMessage) => void): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  async send(message: SyncMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Cannot send: transport is not connected');
    }
    await delay(this.latencyMs);

    if (message.type !== 'SYNC_DATA') {
      return;
    }

    if (this.failNextSync) {
      this.failNextSync = false;
      this.emit({
        type: 'SYNC_ERROR',
        protocolVersion: message.protocolVersion,
        reason: 'Connection interrupted',
      });
      return;
    }

    for (const folder of message.folders) {
      if (folder.deleted) {
        this.watchFolders.delete(folder.id);
      } else {
        this.watchFolders.set(folder.id, { name: folder.name, updatedAt: folder.updatedAt });
      }
    }

    for (const note of message.notes) {
      if (note.deleted) {
        this.watchNotes.delete(note.id);
      } else {
        this.watchNotes.set(note.id, {
          folderId: note.folderId,
          title: note.title,
          description: note.description,
          isPinned: note.isPinned,
          updatedAt: note.updatedAt,
        });
      }
    }

    this.emit({ type: 'SYNC_COMPLETE', protocolVersion: message.protocolVersion });
  }

  private emit(message: SyncMessage) {
    this.handlers.forEach((handler) => handler(message));
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
