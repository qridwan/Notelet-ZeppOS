export const up = `
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY NOT NULL,
  folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);

CREATE TABLE IF NOT EXISTS sync_metadata (
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  last_synced_at INTEGER,
  sync_status TEXT NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (entity_id, entity_type)
);
`;
