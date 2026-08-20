import * as SQLite from 'expo-sqlite';

import {
  markFailed,
  markSyncing,
  markSynced,
} from '../../database/repositories/syncMetadataRepository';
import {
  FolderSyncItem,
  NoteSyncItem,
  SyncEntityRef,
  SyncMessage,
  SyncResult,
  SyncSessionStatus,
  SYNC_PROTOCOL_VERSION,
} from '../../types/sync';
import { loadChangeSet } from './changeSet';
import { SyncTransport } from './transport';
import { parseIncomingSyncMessage, SyncProtocolError } from './validation';

const DEFAULT_TIMEOUT_MS = 10_000;

export type SyncOptions = {
  /** Restrict this run to specific note/folder ids (SRS #30 selective sync). */
  entityIds?: string[];
  timeoutMs?: number;
};

type StatusListener = (status: SyncSessionStatus) => void;

/**
 * Orchestrates one manual sync attempt (SRS #29): connect, send the
 * incremental change set, wait for acknowledgement, and update sync_metadata
 * accordingly. Never touches folders/notes tables directly — SRS #36/#37
 * require that a failed sync leave all existing data (mobile and watch)
 * exactly as it was, and this engine only ever writes to sync_metadata.
 */
export class SyncEngine {
  private status: SyncSessionStatus = SyncSessionStatus.IDLE;
  private listeners: StatusListener[] = [];
  private lastSyncedAt: number | null = null;

  constructor(
    private readonly db: SQLite.SQLiteDatabase,
    private readonly transport: SyncTransport,
  ) {}

  getStatus(): SyncSessionStatus {
    return this.status;
  }

  getLastSyncedAt(): number | null {
    return this.lastSyncedAt;
  }

  onStatusChange(listener: StatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const onlyEntityIds = options.entityIds ? new Set(options.entityIds) : undefined;

    this.setStatus(SyncSessionStatus.CONNECTING);
    try {
      await this.transport.connect();
    } catch {
      return this.fail('Unable to connect to watch.');
    }

    this.setStatus(SyncSessionStatus.SYNCING);

    let changeSet;
    try {
      changeSet = await loadChangeSet(this.db, onlyEntityIds);
    } catch (error) {
      await this.safeDisconnect();
      return this.fail(errorMessage(error));
    }

    if (changeSet.entityRefs.length === 0) {
      await this.safeDisconnect();
      return this.succeed(0, 0);
    }

    await markSyncing(this.db, changeSet.entityRefs);

    try {
      const response = await this.exchange(changeSet.entityRefs, changeSet.folders, changeSet.notes, timeoutMs);

      if (response.type === 'SYNC_ERROR') {
        await markFailed(this.db, changeSet.entityRefs);
        await this.safeDisconnect();
        return this.fail(response.reason);
      }

      const syncedAt = Date.now();
      await markSynced(this.db, changeSet.entityRefs, syncedAt);
      await this.safeDisconnect();
      this.lastSyncedAt = syncedAt;
      return this.succeed(changeSet.folders.length, changeSet.notes.length);
    } catch (error) {
      // SRS #37: sync failed, existing mobile/watch data remains untouched —
      // only the retry flag on these entities changes.
      await markFailed(this.db, changeSet.entityRefs);
      await this.safeDisconnect();
      return this.fail(errorMessage(error));
    }
  }

  // SRS #37: a retry is just another sync() call — outstanding entities
  // (PENDING and FAILED) are picked up the same way either time.
  async retry(options: SyncOptions = {}): Promise<SyncResult> {
    return this.sync(options);
  }

  private exchange(
    entityRefs: SyncEntityRef[],
    folders: FolderSyncItem[],
    notes: NoteSyncItem[],
    timeoutMs: number,
  ): Promise<SyncMessage> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        unsubscribe();
        reject(new Error('Connection interrupted'));
      }, timeoutMs);

      const unsubscribe = this.transport.onMessage((raw) => {
        if (settled) return;
        let message: SyncMessage;
        try {
          message = parseIncomingSyncMessage(raw);
        } catch (error) {
          if (error instanceof SyncProtocolError) return; // ignore unrelated/garbled messages
          throw error;
        }
        if (message.type !== 'SYNC_COMPLETE' && message.type !== 'SYNC_ERROR') return;

        settled = true;
        clearTimeout(timer);
        unsubscribe();
        resolve(message);
      });

      this.transport
        .send({ type: 'SYNC_DATA', protocolVersion: SYNC_PROTOCOL_VERSION, folders, notes })
        .catch((error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          unsubscribe();
          reject(error);
        });
    });
  }

  private async safeDisconnect(): Promise<void> {
    try {
      await this.transport.disconnect();
    } catch {
      // Disconnection failures don't change the sync result — data safety
      // was already decided above.
    }
  }

  private succeed(syncedFolders: number, syncedNotes: number): SyncResult {
    this.setStatus(SyncSessionStatus.SUCCESS);
    return {
      status: SyncSessionStatus.SUCCESS,
      syncedFolders,
      syncedNotes,
      syncedAt: Date.now(),
    };
  }

  private fail(reason: string): SyncResult {
    this.setStatus(SyncSessionStatus.FAILED);
    return {
      status: SyncSessionStatus.FAILED,
      syncedFolders: 0,
      syncedNotes: 0,
      reason,
      syncedAt: Date.now(),
    };
  }

  private setStatus(status: SyncSessionStatus): void {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Sync failed';
}
