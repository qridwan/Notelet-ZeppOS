import * as SQLite from 'expo-sqlite';

import { FOLDER_NAME_MAX_LENGTH } from '../../constants';
import { Folder, NewFolderInput, UpdateFolderInput } from '../../types/domain';
import { requireNonEmpty } from '../../utils/validation';
import { generateId } from '../../utils/uuid';
import { FolderRow, folderFromRow } from '../schema/rows';
import { markPending } from './syncMetadataRepository';

export class FolderRepository {
  constructor(private readonly db: SQLite.SQLiteDatabase) {}

  async create(input: NewFolderInput): Promise<Folder> {
    const name = requireNonEmpty(input.name, 'Folder name', FOLDER_NAME_MAX_LENGTH);
    const now = Date.now();
    const id = generateId();

    await this.db.runAsync(
      'INSERT INTO folders (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [id, name, now, now],
    );
    await markPending(this.db, id, 'folder');

    return { id, name, createdAt: now, updatedAt: now };
  }

  async rename(id: string, input: UpdateFolderInput): Promise<Folder> {
    const name = requireNonEmpty(input.name, 'Folder name', FOLDER_NAME_MAX_LENGTH);
    const now = Date.now();

    await this.db.runAsync('UPDATE folders SET name = ?, updated_at = ? WHERE id = ?', [
      name,
      now,
      id,
    ]);
    await markPending(this.db, id, 'folder');

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Folder ${id} not found after rename`);
    }
    return updated;
  }

  // FR-MOB-003: deleting a folder moves its notes to Uncategorized (folderId = null)
  // rather than deleting them.
  async delete(id: string): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync('UPDATE notes SET folder_id = NULL WHERE folder_id = ?', [id]);
      await this.db.runAsync('DELETE FROM folders WHERE id = ?', [id]);
    });
    await markPending(this.db, id, 'folder');
  }

  async getById(id: string): Promise<Folder | null> {
    const row = await this.db.getFirstAsync<FolderRow>('SELECT * FROM folders WHERE id = ?', [
      id,
    ]);
    return row ? folderFromRow(row) : null;
  }

  async list(): Promise<Folder[]> {
    const rows = await this.db.getAllAsync<FolderRow>('SELECT * FROM folders ORDER BY name ASC');
    return rows.map(folderFromRow);
  }
}
