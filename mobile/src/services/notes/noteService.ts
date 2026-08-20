import { getNoteRepository } from '../../database/repositories';
import { NewNoteInput, Note, UpdateNoteInput } from '../../types/domain';

// Thin façade over NoteRepository so screens depend on a service, not the
// database layer directly (SRS #53: separate database operations from UI).
export const noteService = {
  async create(input: NewNoteInput): Promise<Note> {
    const repo = await getNoteRepository();
    return repo.create(input);
  },
  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const repo = await getNoteRepository();
    return repo.update(id, input);
  },
  async delete(id: string): Promise<void> {
    const repo = await getNoteRepository();
    return repo.softDelete(id);
  },
  async getById(id: string): Promise<Note | null> {
    const repo = await getNoteRepository();
    return repo.getById(id);
  },
  async listByFolder(folderId: string | null): Promise<Note[]> {
    const repo = await getNoteRepository();
    return repo.listByFolder(folderId);
  },
  async listPinned(): Promise<Note[]> {
    const repo = await getNoteRepository();
    return repo.listPinned();
  },
  async listRecent(limit?: number): Promise<Note[]> {
    const repo = await getNoteRepository();
    return repo.listRecent(limit);
  },
  async search(query: string): Promise<Note[]> {
    const repo = await getNoteRepository();
    return repo.search(query);
  },
};
