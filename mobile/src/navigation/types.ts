// A folder screen shows one of: a real folder, the Pinned virtual list, or
// the Recent virtual list. `source` picks which query backs the list.
export type NoteListSource =
  | { type: 'folder'; folderId: string; title: string }
  | { type: 'pinned' }
  | { type: 'recent' };

export type RootStackParamList = {
  Home: undefined;
  NoteList: { source: NoteListSource };
  Search: undefined;
  NoteDetail: { noteId: string };
  NoteEditor: { noteId?: string; folderId?: string | null } | undefined;
};
