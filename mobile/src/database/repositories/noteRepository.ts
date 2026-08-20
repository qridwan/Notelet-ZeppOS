import * as SQLite from 'expo-sqlite';

import { NOTE_DESCRIPTION_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from '../../constants';
import { NewNoteInput, Note, UpdateNoteInput } from '../../types/domain';
import { requireNonEmpty } from '../../utils/validation';
import { generateId } from '../../utils/uuid';
import { NoteRow, noteFromRow } from '../schema/rows';
import { markPending } from './syncMetadataRepository';

const SELECT_ACTIVE_NOTES = 'SELECT * FROM notes WHERE deleted_at IS NULL';

export class NoteRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  async create(input: NewNoteInput): Promise<Note> {
    const title = requireNonEmpty(input.title, 'Note title', NOTE_TITLE_MAX_LENGTH);
    const description = (input.description ?? '').slice(0, NOTE_DESCRIPTION_MAX_LENGTH);
    const now = Date.now();
    const id = generateId();
    const isPinned = input.isPinned ?? false;

    await this.db.runAsync(
      `INSERT INTO notes (id, folder_id, title, description, is_pinned, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
      [id, input.folderId, title, description, isPinned ? 1 : 0, now, now],
    );
    await markPending(this.db, id, 'note');

    return {
      id,
      folderId: input.folderId,
      title,
      description,
      isPinned,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  }

  // FR-MOB-005: title, description, folder, and pinned status are all editable;
  // persisted immediately on save.
  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Note ${id} not found`);
    }

    const title =
      input.title !== undefined
        ? requireNonEmpty(input.title, 'Note title', NOTE_TITLE_MAX_LENGTH)
        : existing.title;
    const description =
      input.description !== undefined
        ? input.description.slice(0, NOTE_DESCRIPTION_MAX_LENGTH)
        : existing.description;
    const folderId = input.folderId !== undefined ? input.folderId : existing.folderId;
    const isPinned = input.isPinned !== undefined ? input.isPinned : existing.isPinned;
    const now = Date.now();

    await this.db.runAsync(
      `UPDATE notes SET title = ?, description = ?, folder_id = ?, is_pinned = ?, updated_at = ?
       WHERE id = ?`,
      [title, description, folderId, isPinned ? 1 : 0, now, id],
    );
    await markPending(this.db, id, 'note');

    return { ...existing, title, description, folderId, isPinned, updatedAt: now };
  }

  // Soft delete so the deletion itself can be synced to the watch (SRS #34)
  // before the row is ever purged.
  async softDelete(id: string): Promise<void> {
    const now = Date.now();
    await this.db.runAsync('UPDATE notes SET deleted_at = ?, updated_at = ? WHERE id = ?', [
      now,
      now,
      id,
    ]);
    await markPending(this.db, id, 'note');
  }

  // Permanently removes a note. Only safe to call once a deletion has been
  // confirmed synced (SRS #34) — the Phase 4 sync engine owns that decision.
  async purge(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    await this.db.runAsync('DELETE FROM sync_metadata WHERE entity_id = ? AND entity_type = ?', [
      id,
      'note',
    ]);
  }

  async getById(id: string): Promise<Note | null> {
    const row = await this.db.getFirstAsync<NoteRow>(
      'SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL',
      [id],
    );
    return row ? noteFromRow(row) : null;
  }

  async listByFolder(folderId: string | null): Promise<Note[]> {
    const rows =
      folderId === null
        ? await this.db.getAllAsync<NoteRow>(
            `${SELECT_ACTIVE_NOTES} AND folder_id IS NULL ORDER BY updated_at DESC`,
          )
        : await this.db.getAllAsync<NoteRow>(
            `${SELECT_ACTIVE_NOTES} AND folder_id = ? ORDER BY updated_at DESC`,
            [folderId],
          );
    return rows.map(noteFromRow);
  }

  async listPinned(): Promise<Note[]> {
    const rows = await this.db.getAllAsync<NoteRow>(
      `${SELECT_ACTIVE_NOTES} AND is_pinned = 1 ORDER BY updated_at DESC`,
    );
    return rows.map(noteFromRow);
  }

  // FR-MOB-010: Recent section, updatedAt DESC.
  async listRecent(limit = 20): Promise<Note[]> {
    const rows = await this.db.getAllAsync<NoteRow>(
      `${SELECT_ACTIVE_NOTES} ORDER BY updated_at DESC LIMIT ?`,
      [limit],
    );
    return rows.map(noteFromRow);
  }

  // FR-MOB-008: case-insensitive search across title, description, and folder name.
  async search(query: string): Promise<Note[]> {
    const term = `%${query.trim().toLowerCase()}%`;
    if (query.trim().length === 0) {
      return [];
    }

    const rows = await this.db.getAllAsync<NoteRow>(
      `SELECT notes.* FROM notes
       LEFT JOIN folders ON folders.id = notes.folder_id
       WHERE notes.deleted_at IS NULL
         AND (
           LOWER(notes.title) LIKE ?
           OR LOWER(notes.description) LIKE ?
           OR LOWER(folders.name) LIKE ?
         )
       ORDER BY notes.updated_at DESC`,
      [term, term, term],
    );
    return rows.map(noteFromRow);
  }
}
