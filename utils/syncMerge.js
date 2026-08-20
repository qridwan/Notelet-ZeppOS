/**
 * Pure replace logic for applySyncPayload, kept separate from file I/O
 * (utils/syncStore.js) so it can be exercised without @zos/fs — e.g. from a
 * plain Node script during development.
 *
 * This is a full replace, not an incremental merge: PULL_SYNC always sends
 * the complete current folders/notes (Settings is the single source of
 * truth, not a stream of diffs), so anything the watch has stored that
 * isn't in the incoming payload is dropped — not just entries explicitly
 * flagged `deleted: true`. An incremental tombstone-only merge left orphaned
 * entries permanently stuck on the watch whenever their source id stopped
 * being served at all (e.g. the old hardcoded mock notes, once removed from
 * app-side — no tombstone was ever generated for ids the payload simply
 * never mentions again, so they never got cleaned up).
 */
export function mergeFolders(existingFolders, incomingFolders) {
  const existingById = new Map(existingFolders.map((folder) => [folder.id, folder]))
  const active = incomingFolders.filter((folder) => !folder.deleted)

  const folders = active.map((incoming) => {
    const existing = existingById.get(incoming.id)
    return {
      id: incoming.id,
      name: incoming.name,
      createdAt: existing ? existing.createdAt : incoming.updatedAt,
      updatedAt: incoming.updatedAt
    }
  })

  const removed = existingFolders.filter(
    (folder) => !active.some((incoming) => incoming.id === folder.id)
  ).length

  return { folders, removed, upserted: active.length }
}

export function mergeNotes(existingNotes, incomingNotes) {
  const existingById = new Map(existingNotes.map((note) => [note.id, note]))
  const active = incomingNotes.filter((note) => !note.deleted)

  const notes = active.map((incoming) => {
    const existing = existingById.get(incoming.id)
    return {
      id: incoming.id,
      folderId: incoming.folderId,
      title: incoming.title,
      description: incoming.description,
      isPinned: incoming.isPinned,
      createdAt: existing ? existing.createdAt : incoming.updatedAt,
      updatedAt: incoming.updatedAt,
      deletedAt: null
    }
  })

  const removed = existingNotes.filter((n) => !active.some((incoming) => incoming.id === n.id)).length

  return { notes, removed, upserted: active.length }
}
