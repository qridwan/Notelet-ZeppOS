/**
 * Pure merge logic for applySyncPayload, kept separate from file I/O
 * (utils/syncStore.js) so it can be exercised without @zos/fs — e.g. from a
 * plain Node script during development.
 */
export function mergeFolders(existingFolders, incomingFolders) {
  const folderById = new Map(existingFolders.map((folder) => [folder.id, folder]))
  let removed = 0
  let upserted = 0

  incomingFolders.forEach((incoming) => {
    if (incoming.deleted) {
      if (folderById.delete(incoming.id)) removed += 1
      return
    }
    const existing = folderById.get(incoming.id)
    folderById.set(incoming.id, {
      id: incoming.id,
      name: incoming.name,
      createdAt: existing ? existing.createdAt : incoming.updatedAt,
      updatedAt: incoming.updatedAt
    })
    upserted += 1
  })

  return { folders: Array.from(folderById.values()), removed, upserted }
}

export function mergeNotes(existingNotes, incomingNotes) {
  const noteById = new Map(existingNotes.map((note) => [note.id, note]))
  let removed = 0
  let upserted = 0

  incomingNotes.forEach((incoming) => {
    if (incoming.deleted) {
      if (noteById.delete(incoming.id)) removed += 1
      return
    }
    const existing = noteById.get(incoming.id)
    noteById.set(incoming.id, {
      id: incoming.id,
      folderId: incoming.folderId,
      title: incoming.title,
      description: incoming.description,
      isPinned: incoming.isPinned,
      createdAt: existing ? existing.createdAt : incoming.updatedAt,
      updatedAt: incoming.updatedAt,
      deletedAt: null
    })
    upserted += 1
  })

  return { notes: Array.from(noteById.values()), removed, upserted }
}
