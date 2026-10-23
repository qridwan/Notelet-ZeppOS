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

// No mock data — an untouched install starts genuinely empty.
const SEED_DATA = {
  folders: [],
  notes: [],
  deletedFolderIds: [],
  deletedNoteIds: []
}

// Soft card layout: light grey page, white rounded cards, one accent color
// for primary actions, red only for destructive ones.
const ACCENT = '#4F7DF3'
const ACCENT_SOFT = '#EAF0FE'
const DANGER = '#E5484D'
const TEXT_PRIMARY = '#1C1C1E'
const TEXT_SECONDARY = '#8A8A8E'
const SURFACE = '#FFFFFF'
const SURFACE_MUTED = '#F0F1F4'
const PAGE_BG = '#F5F6F8'
const BORDER = '#ECECEF'

const pageStyle = { padding: '20px 16px 40px', background: PAGE_BG }

const heroTitleStyle = { fontSize: '24px', fontWeight: 'bold', color: TEXT_PRIMARY }
const heroTaglineStyle = {
  fontSize: '13px',
  color: TEXT_SECONDARY,
  marginTop: '2px',
  marginBottom: '16px'
}

const cardStyle = {
  background: SURFACE,
  borderRadius: '14px',
  border: `1px solid ${BORDER}`,
  padding: '14px 16px',
  marginBottom: '16px'
}

const sectionHeaderStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '6px'
}

const sectionTitleStyle = { flex: 1, fontSize: '16px', fontWeight: 'bold', color: TEXT_PRIMARY }
const sectionCountStyle = { fontSize: '12px', color: TEXT_SECONDARY }

const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: `1px solid ${BORDER}`
}

const rowTitleStyle = { fontSize: '15px', color: TEXT_PRIMARY }
const rowMetaStyle = { fontSize: '12px', color: TEXT_SECONDARY, marginTop: '2px' }

const pillStyle = {
  display: 'inline-block',
  fontSize: '11px',
  color: ACCENT,
  background: ACCENT_SOFT,
  borderRadius: '10px',
  padding: '2px 8px',
  marginTop: '6px'
}

const noteActionsStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: '4px'
}

const actionLinkStyle = { fontSize: '13px', color: ACCENT, marginLeft: '16px' }
const dangerLinkStyle = { fontSize: '13px', color: DANGER, marginLeft: '16px' }

const emptyStateStyle = {
  fontSize: '13px',
  color: TEXT_SECONDARY,
  textAlign: 'center',
  padding: '18px 0'
}

const primaryButtonStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#FFFFFF',
  background: ACCENT,
  borderRadius: '10px',
  padding: '10px 18px',
  textAlign: 'center'
}

const secondaryButtonStyle = {
  fontSize: '14px',
  color: TEXT_PRIMARY,
  background: SURFACE_MUTED,
  borderRadius: '10px',
  padding: '10px 18px',
  textAlign: 'center',
  marginLeft: '10px'
}

const addButtonStyle = {
  fontSize: '14px',
  color: ACCENT,
  background: ACCENT_SOFT,
  borderRadius: '10px',
  padding: '10px 0',
  textAlign: 'center',
  marginTop: '12px'
}

const addFormStyle = {
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: `1px solid ${BORDER}`
}

const formLabelStyle = { fontSize: '12px', color: TEXT_SECONDARY, marginTop: '12px' }

const formActionsStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: '16px'
}

const chipsStyle = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '8px' }

function folderChipStyle(active) {
  return {
    fontSize: '13px',
    padding: '6px 12px',
    marginRight: '8px',
    marginBottom: '8px',
    borderRadius: '16px',
    color: active ? '#FFFFFF' : TEXT_PRIMARY,
    background: active ? ACCENT : SURFACE_MUTED,
    fontWeight: active ? 'bold' : 'normal'
  }
}

function truncate(text, max) {
  if (!text) return ''
  const flat = String(text).replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
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
    newNoteFolderId: null,
    isAddingFolder: false,
    isAddingNote: false
  },
  loadState(settingsStorage) {
    this.state.settingsStorage = settingsStorage
    const data = readJson(settingsStorage, NOTELET_DATA_KEY, SEED_DATA)
    // The form draft lives in the same blob as the data. this.state alone
    // doesn't survive the page rebuilding on every write, which is how the
    // chosen folder was getting lost and notes ended up with folderId null.
    const draft = data.draft || {}
    this.state.folders = data.folders || []
    this.state.notes = data.notes || []
    this.state.deletedFolderIds = data.deletedFolderIds || []
    this.state.deletedNoteIds = data.deletedNoteIds || []
    this.state.newFolderName = draft.newFolderName || ''
    this.state.newNoteTitle = draft.newNoteTitle || ''
    this.state.newNoteDescription = draft.newNoteDescription || ''
    this.state.isAddingFolder = !!draft.isAddingFolder
    this.state.isAddingNote = !!draft.isAddingNote

    // undefined = never chosen -> default to the first folder; null = the
    // user explicitly picked Uncategorized; a deleted folder id -> reset.
    const chosen = draft.newNoteFolderId
    const exists = this.state.folders.some((f) => f.id === chosen)
    if (chosen === null) {
      this.state.newNoteFolderId = null
    } else if (exists) {
      this.state.newNoteFolderId = chosen
    } else {
      this.state.newNoteFolderId = this.state.folders.length > 0 ? this.state.folders[0].id : null
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
        deletedNoteIds: this.state.deletedNoteIds,
        draft: {
          newFolderName: this.state.newFolderName,
          newNoteTitle: this.state.newNoteTitle,
          newNoteDescription: this.state.newNoteDescription,
          newNoteFolderId: this.state.newNoteFolderId,
          isAddingFolder: this.state.isAddingFolder,
          isAddingNote: this.state.isAddingNote
        }
      })
    )
  },
  // Mutating this.state alone doesn't redraw the page here — only an actual
  // settingsStorage write does (see selectNoteFolder), so these toggles
  // need the same persist() nudge to actually reveal/hide the form.
  startAddingFolder() {
    this.state.isAddingFolder = true
    this.persist()
  },
  cancelAddingFolder() {
    this.state.isAddingFolder = false
    this.state.newFolderName = ''
    this.persist()
  },
  addFolder() {
    const name = this.state.newFolderName.trim()
    if (!name) return
    this.state.folders = [
      ...this.state.folders,
      { id: generateId('folder'), name, updatedAt: Date.now() }
    ]
    this.state.newFolderName = ''
    this.state.isAddingFolder = false
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
  startAddingNote() {
    this.state.isAddingNote = true
    this.persist()
  },
  cancelAddingNote() {
    this.state.isAddingNote = false
    this.state.newNoteTitle = ''
    this.state.newNoteDescription = ''
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
    this.state.isAddingNote = false
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
  // Mutating this.state alone doesn't redraw the page here — only an actual
  // settingsStorage write does (that's why Delete/Pin/Add already worked:
  // they all call persist()). This picker's selection needs the same
  // trigger even though the data it's writing hasn't changed.
  selectNoteFolder(folderId) {
    this.state.newNoteFolderId = folderId
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

  noteCountIn(folderId) {
    return this.state.notes.filter((n) => n.folderId === folderId).length
  },

  renderHeader(title, count) {
    return View({ style: sectionHeaderStyle }, [
      View({ style: sectionTitleStyle }, [title]),
      View({ style: sectionCountStyle }, [String(count)])
    ])
  },

  renderFolderRow(folder, isLast) {
    const count = this.noteCountIn(folder.id)
    return View({ style: { ...rowStyle, borderBottom: isLast ? 'none' : rowStyle.borderBottom } }, [
      View({ style: { flex: 1 } }, [
        View({ style: rowTitleStyle }, [`📁 ${folder.name}`]),
        View({ style: rowMetaStyle }, [`${count} ${count === 1 ? 'note' : 'notes'}`])
      ]),
      Button({
        label: gettext('delete'),
        style: dangerLinkStyle,
        onClick: () => this.deleteFolder(folder.id)
      })
    ])
  },

  renderNoteRow(note, isLast) {
    const preview = truncate(note.description, 90)
    return View(
      {
        style: {
          ...rowStyle,
          alignItems: 'stretch',
          borderBottom: isLast ? 'none' : rowStyle.borderBottom
        }
      },
      [
        View({ style: { flex: 1 } }, [
          View({ style: { ...rowTitleStyle, fontWeight: 'bold' } }, [
            `${note.isPinned ? '📌 ' : ''}${note.title}`
          ]),
          ...(preview ? [View({ style: rowMetaStyle }, [preview])] : []),
          View({ style: pillStyle }, [this.folderName(note.folderId)]),
          View({ style: noteActionsStyle }, [
            Button({
              label: note.isPinned ? gettext('unpin') : gettext('pin'),
              style: actionLinkStyle,
              onClick: () => this.togglePinned(note.id)
            }),
            Button({
              label: gettext('delete'),
              style: dangerLinkStyle,
              onClick: () => this.deleteNote(note.id)
            })
          ])
        ])
      ]
    )
  },

  renderSyncCard(syncStatus) {
    const summary = syncStatus
      ? gettext('syncSummary')
          .replace('{time}', new Date(syncStatus.lastSyncedAt || 0).toLocaleString())
          .replace('{folders}', String(syncStatus.folderCount ?? 0))
          .replace('{notes}', String(syncStatus.noteCount ?? 0))
      : gettext('syncNeverSummary')
    return View({ style: cardStyle }, [
      View({ style: { fontSize: '16px', fontWeight: 'bold', color: TEXT_PRIMARY } }, [
        `${syncStatus ? '🟢' : '⚪️'} ${gettext('syncSectionTitle')}`
      ]),
      View({ style: { ...rowMetaStyle, marginTop: '4px', marginBottom: '12px' } }, [summary]),
      Button({
        label: gettext('checkForUpdates'),
        style: primaryButtonStyle,
        onClick: () => this.requestSync()
      })
    ])
  },

  renderAddForm({ nameLabel, value, onChange, onSubmit, onCancel, submitKey, extra }) {
    return View({ style: addFormStyle }, [
      TextInput({ label: nameLabel, value, onChange }),
      ...(extra || []),
      View({ style: formActionsStyle }, [
        Button({ label: gettext(submitKey), style: primaryButtonStyle, onClick: onSubmit }),
        Button({ label: gettext('cancel'), style: secondaryButtonStyle, onClick: onCancel })
      ])
    ])
  },

  build(props) {
    this.loadState(props.settingsStorage)
    const syncStatus = readJson(props.settingsStorage, SYNC_STATUS_KEY, null)
    const { folders, notes } = this.state
    // Pinned notes first; otherwise newest first.
    const sortedNotes = [...notes].sort(
      (a, b) => Number(b.isPinned) - Number(a.isPinned) || (b.updatedAt || 0) - (a.updatedAt || 0)
    )

    return View({ style: pageStyle }, [
      View({ style: heroTitleStyle }, ['Notelet']),
      View({ style: heroTaglineStyle }, [gettext('aboutBody')]),

      this.renderSyncCard(syncStatus),

      View({ style: cardStyle }, [
        this.renderHeader(gettext('foldersSectionTitle'), folders.length),
        folders.length > 0
          ? View(
              {},
              folders.map((folder, i) => this.renderFolderRow(folder, i === folders.length - 1))
            )
          : View({ style: emptyStateStyle }, [gettext('noFoldersYet')]),

        this.state.isAddingFolder
          ? this.renderAddForm({
              nameLabel: gettext('newFolderName'),
              value: this.state.newFolderName,
              // TextInput opens a native modal and onChange fires once on
              // confirm, not per keystroke — persist() makes the typed value
              // show up (this.state alone doesn't redraw the page).
              onChange: (val) => {
                this.state.newFolderName = val
                this.persist()
              },
              submitKey: 'addFolder',
              onSubmit: () => this.addFolder(),
              onCancel: () => this.cancelAddingFolder()
            })
          : Button({
              label: `+ ${gettext('addFolder')}`,
              style: addButtonStyle,
              onClick: () => this.startAddingFolder()
            })
      ]),

      View({ style: cardStyle }, [
        this.renderHeader(gettext('notesSectionTitle'), notes.length),
        sortedNotes.length > 0
          ? View(
              {},
              sortedNotes.map((note, i) => this.renderNoteRow(note, i === sortedNotes.length - 1))
            )
          : View({ style: emptyStateStyle }, [gettext('noNotesYet')]),

        this.state.isAddingNote
          ? this.renderAddForm({
              nameLabel: gettext('newNoteTitle'),
              value: this.state.newNoteTitle,
              onChange: (val) => {
                this.state.newNoteTitle = val
                this.persist()
              },
              submitKey: 'addNote',
              onSubmit: () => this.addNote(),
              onCancel: () => this.cancelAddingNote(),
              extra: [
                TextInput({
                  label: gettext('newNoteDescription'),
                  value: this.state.newNoteDescription,
                  onChange: (val) => {
                    this.state.newNoteDescription = val
                    this.persist()
                  }
                }),
                View({ style: formLabelStyle }, [gettext('saveIn')]),
                View(
                  { style: chipsStyle },
                  [{ id: null, name: gettext('uncategorized') }, ...folders].map((folder) => {
                    const active = this.state.newNoteFolderId === folder.id
                    return Button({
                      // A style-only change on an otherwise-identical Button
                      // doesn't reliably re-render here — the label must
                      // differ too.
                      label: active ? `✓ ${folder.name}` : folder.name,
                      style: folderChipStyle(active),
                      onClick: () => this.selectNoteFolder(folder.id)
                    })
                  })
                )
              ]
            })
          : Button({
              label: `+ ${gettext('addNote')}`,
              style: addButtonStyle,
              onClick: () => this.startAddingNote()
            })
      ])
    ])
  }
})
