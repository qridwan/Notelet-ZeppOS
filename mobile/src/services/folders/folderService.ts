import { getFolderRepository } from '../../database/repositories';
import { Folder, NewFolderInput, UpdateFolderInput } from '../../types/domain';

// Thin façade over FolderRepository so screens depend on a service, not the
// database layer directly (SRS #53: separate database operations from UI).
export const folderService = {
  async create(input: NewFolderInput): Promise<Folder> {
    const repo = await getFolderRepository();
    return repo.create(input);
  },
  async rename(id: string, input: UpdateFolderInput): Promise<Folder> {
    const repo = await getFolderRepository();
    return repo.rename(id, input);
  },
  async delete(id: string): Promise<void> {
    const repo = await getFolderRepository();
    return repo.delete(id);
  },
  async list(): Promise<Folder[]> {
    const repo = await getFolderRepository();
    return repo.list();
  },
};
