import { getDatabase } from '../database';
import { FolderRepository } from './folderRepository';
import { NoteRepository } from './noteRepository';

export { FolderRepository } from './folderRepository';
export { NoteRepository } from './noteRepository';

export async function getFolderRepository(): Promise<FolderRepository> {
  return new FolderRepository(await getDatabase());
}

export async function getNoteRepository(): Promise<NoteRepository> {
  return new NoteRepository(await getDatabase());
}
