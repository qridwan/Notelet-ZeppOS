import { gettext } from 'i18n'

const SYNC_STATUS_KEY = 'syncStatus'
const FORCE_SYNC_KEY = 'forceSyncRequestedAt'
// Single combined key (see app-side/index.js): every CRUD action here does
// exactly ONE settingsStorage.setItem call. Each write appears to trigger a
// Side Service reload, and multiple rapid writes from one action (e.g. the
// old separate folders/notes/deletedIds keys) reproducibly crashed the
// framework's own hot-reload with "exports is not defined" / "Cannot read
// properties of undefined (reading 'onInit')" — a framework-level race, not
// something in this file, but avoidable by writing once per action.
const NOTELET_DATA_KEY = 'noteletData'

const SEED_DATA = {
  folders: [
    { id: 'folder-work', name: 'Work', updatedAt: 1750000000000 },
    { id: 'folder-personal', name: 'Personal', updatedAt: 1750000000000 },
    { id: 'folder-ideas', name: 'Ideas', updatedAt: 1750000000000 }
  ],
  notes: [
    {
      id: 'note-001',
      folderId: 'folder-work',
      title: 'API Architecture',
      description: 'Use Redis for frequently accessed API responses.',
      isPinned: true,
      updatedAt: 1750000000000
    }
  ],
  deletedFolderIds: [],
  deletedNoteIds: []
}

// SRS #47: minimal, clean, no decorative UI — one accent color reserved for
// primary actions, everything else is plain text with a hairline divider.
const ACCENT = '#4F7DF3'
const TEXT_SECONDARY = '#8A8A8E'
const BORDER = '#EAEAEA'

const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: `1px solid ${BORDER}`
}

const linkStyle = {
  fontSize: '13px',
  color: TEXT_SECONDARY,
  marginLeft: '16px'
}

const primaryButtonStyle = {
  fontSize: '14px',
  color: ACCENT,
  textAlign: 'left',
  marginTop: '10px'
}

const emptyStateStyle = {
  fontSize: '13px',
  color: TEXT_SECONDARY,
  padding: '8px 0'
}

function readJson(storage, key, fallback) {
  const raw = storage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

/**
 * The watch is read-only in MVP (SRS #42) and the long-term plan is for the
 * separate Notelet mobile app to own note/folder CRUD (once the Phase 0
 * BLE bridge exists — see README's "Phone <-> Watch Communication POC"
 * section). Until then, this Settings page IS the interim data source:
 * app-side/index.js's PULL_SYNC serves whatever is stored here via
 * settingsStorage (shared between Settings App and Side Service), seeded
 * from the original mock catalog so nothing regresses on first run.
 */
AppSettingsPage({
  state: {
    settingsStorage: null,
    folders: [],
    notes: [],
    deletedFolderIds: [],
    deletedNoteIds: [],
    newFolderName: '',
    newNoteTitle: '',
    newNoteDescription: '',
    newNoteFolderId: null
  },
  loadState(settingsStorage) {
    this.state.settingsStorage = settingsStorage
    const data = readJson(settingsStorage, NOTELET_DATA_KEY, SEED_DATA)
    this.state.folders = data.folders || []
    this.state.notes = data.notes || []
    this.state.deletedFolderIds = data.deletedFolderIds || []
    this.state.deletedNoteIds = data.deletedNoteIds || []
    if (this.state.newNoteFolderId === null && this.state.folders.length > 0) {
      this.state.newNoteFolderId = this.state.folders[0].id
    }
  },
  // The one and only settingsStorage write for any CRUD action — see the
  // NOTELET_DATA_KEY comment above for why that matters here.
  persist() {
    this.state.settingsStorage.setItem(
      NOTELET_DATA_KEY,
      JSON.stringify({
        folders: this.state.folders,
        notes: this.state.notes,
        deletedFolderIds: this.state.deletedFolderIds,
        deletedNoteIds: this.state.deletedNoteIds
      })
    )
  },
  addFolder() {
    const name = this.state.newFolderName.trim()
    if (!name) return
    this.state.folders = [
      ...this.state.folders,
      { id: generateId('folder'), name, updatedAt: Date.now() }
    ]
    this.state.newFolderName = ''
    this.persist()
  },
  // FR-MOB-003: deleting a folder moves its notes to Uncategorized rather
  // than deleting them.
  deleteFolder(folderId) {
    this.state.folders = this.state.folders.filter((f) => f.id !== folderId)
    this.state.notes = this.state.notes.map((note) =>
      note.folderId === folderId ? { ...note, folderId: null, updatedAt: Date.now() } : note
    )
    this.state.deletedFolderIds = [...this.state.deletedFolderIds, folderId]
    this.persist()
  },
  addNote() {
    const title = this.state.newNoteTitle.trim()
    if (!title) return
    this.state.notes = [
      ...this.state.notes,
      {
        id: generateId('note'),
        folderId: this.state.newNoteFolderId,
        title,
        description: this.state.newNoteDescription.trim(),
        isPinned: false,
        updatedAt: Date.now()
      }
    ]
    this.state.newNoteTitle = ''
    this.state.newNoteDescription = ''
    this.persist()
  },
  deleteNote(noteId) {
    this.state.notes = this.state.notes.filter((n) => n.id !== noteId)
    this.state.deletedNoteIds = [...this.state.deletedNoteIds, noteId]
    this.persist()
  },
  togglePinned(noteId) {
    this.state.notes = this.state.notes.map((note) =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() } : note
    )
    this.persist()
  },
  folderName(folderId) {
    const folder = this.state.folders.find((f) => f.id === folderId)
    return folder ? folder.name : gettext('uncategorized')
  },
  requestSync() {
    // Settings App and the watch's Device App can't call each other
    // directly — writing here is what app-side/index.js's onSettingsChange
    // observes to push a FORCE_SYNC to the watch (see that file).
    this.state.settingsStorage.setItem(FORCE_SYNC_KEY, String(Date.now()))
  },

  renderFolderRow(folder) {
    return View({ style: rowStyle }, [
      View({ style: { flex: 1, fontSize: '14px' } }, [folder.name]),
      Button({
        label: gettext('delete'),
        style: linkStyle,
        onClick: () => this.deleteFolder(folder.id)
      })
    ])
  },

  renderNoteRow(note) {
    return View({ style: rowStyle }, [
      View({ style: { flex: 1 } }, [
        View({ style: { fontSize: '14px' } }, [`${note.isPinned ? '⭐ ' : ''}${note.title}`]),
        View({ style: { fontSize: '12px', color: TEXT_SECONDARY, marginTop: '1px' } }, [
          this.folderName(note.folderId)
        ])
      ]),
      Button({
        label: note.isPinned ? gettext('unpin') : gettext('pin'),
        style: linkStyle,
        onClick: () => this.togglePinned(note.id)
      }),
      Button({
        label: gettext('delete'),
        style: linkStyle,
        onClick: () => this.deleteNote(note.id)
      })
    ])
  },

  build(props) {
    this.loadState(props.settingsStorage)
    const syncStatus = readJson(props.settingsStorage, SYNC_STATUS_KEY, null)

    return View({ style: { padding: '16px 20px 32px' } }, [
      //   Section({ title: gettext('aboutTitle'), description: gettext('aboutBody') }, []),

      Section(
        {
          title: gettext('syncSectionTitle'),
          description: syncStatus
            ? gettext('syncSummary')
                .replace('{time}', new Date(syncStatus.lastSyncedAt || 0).toLocaleString())
                .replace('{folders}', String(syncStatus.folderCount ?? 0))
                .replace('{notes}', String(syncStatus.noteCount ?? 0))
            : gettext('syncNeverSummary')
        },
        [
          Button({
            label: gettext('checkForUpdates'),
            style: primaryButtonStyle,
            onClick: () => this.requestSync()
          })
        ]
      ),

      Section({ title: gettext('foldersSectionTitle') }, [
        this.state.folders.length > 0
          ? View(
              {},
              this.state.folders.map((folder) => this.renderFolderRow(folder))
            )
          : View({ style: emptyStateStyle }, [gettext('noFoldersYet')]),

        TextInput({
          label: gettext('newFolderName'),
          value: this.state.newFolderName,
          onChange: (val) => {
            this.state.newFolderName = val
          }
        }),
        Button({
          label: `+ ${gettext('addFolder')}`,
          style: primaryButtonStyle,
          onClick: () => this.addFolder()
        })
      ]),

      Section({ title: gettext('notesSectionTitle') }, [
        this.state.notes.length > 0
          ? View(
              {},
              this.state.notes.map((note) => this.renderNoteRow(note))
            )
          : View({ style: emptyStateStyle }, [gettext('noNotesYet')]),

        TextInput({
          label: gettext('newNoteTitle'),
          value: this.state.newNoteTitle,
          onChange: (val) => {
            this.state.newNoteTitle = val
          }
        }),
        TextInput({
          label: gettext('newNoteDescription'),
          value: this.state.newNoteDescription,
          onChange: (val) => {
            this.state.newNoteDescription = val
          }
        }),
        this.state.folders.length > 0 &&
          View(
            {
              style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '8px' }
            },
            this.state.folders.map((folder, index) =>
              Button({
                label: index === 0 ? folder.name : `  ·  ${folder.name}`,
                style: {
                  fontSize: '13px',
                  color: this.state.newNoteFolderId === folder.id ? ACCENT : TEXT_SECONDARY,
                  fontWeight: this.state.newNoteFolderId === folder.id ? 'bold' : 'normal'
                },
                onClick: () => {
                  this.state.newNoteFolderId = folder.id
                }
              })
            )
          ),
        Button({
          label: `+ ${gettext('addNote')}`,
          style: primaryButtonStyle,
          onClick: () => this.addNote()
        })
      ])
    ])
  }
})
