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

const STATUS_TONES = {
  idle: { dot: '#9A9AA0', bg: '#F0F1F4', fg: '#6B6B70' },
  ok: { dot: '#30A46C', bg: '#E6F6EC', fg: '#1F7A4D' },
  warn: { dot: '#F5A524', bg: '#FFF4DD', fg: '#9A6700' }
}

const statTileStyle = {
  flex: 1,
  background: PAGE_BG,
  borderRadius: '12px',
  padding: '10px 12px'
}

const statValueStyle = { fontSize: '22px', fontWeight: 'bold', color: TEXT_PRIMARY }
const statLabelStyle = { fontSize: '12px', color: TEXT_SECONDARY, marginTop: '2px' }

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

const addButtonStyle = {
  fontSize: '14px',
  color: ACCENT,
  background: ACCENT_SOFT,
  borderRadius: '10px',
  padding: '10px 0',
  textAlign: 'center',
  marginTop: '12px'
}

const formLabelStyle = { fontSize: '12px', color: TEXT_SECONDARY, marginTop: '12px' }

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

function timeAgo(timestamp) {
  const diff = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
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
    newNoteFolderId: null
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
          newNoteFolderId: this.state.newNoteFolderId
        }
      })
    )
  },
  // Called from the "+ Add folder" TextInput's onChange: the native input
  // modal opens on tap and fires this once on confirm, so adding is one tap.
  addFolder(rawName) {
    const name = (rawName || '').trim()
    if (!name) return
    const folder = { id: generateId('folder'), name, updatedAt: Date.now() }
    this.state.folders = [...this.state.folders, folder]
    // New notes most likely go into the folder just created.
    this.state.newNoteFolderId = folder.id
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
  addNote(rawTitle) {
    const title = (rawTitle || '').trim()
    if (!title) return
    this.state.notes = [
      ...this.state.notes,
      {
        id: generateId('note'),
        folderId: this.state.newNoteFolderId,
        title,
        description: '',
        isPinned: false,
        updatedAt: Date.now()
      }
    ]
    this.persist()
  },
  updateNoteText(noteId, text) {
    this.state.notes = this.state.notes.map((note) =>
      note.id === noteId
        ? { ...note, description: (text || '').trim(), updatedAt: Date.now() }
        : note
    )
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
          TextInput({
            label: preview || gettext('addNoteText'),
            placeholder: gettext('newNoteDescription'),
            value: note.description || '',
            labelStyle: preview ? rowMetaStyle : { ...rowMetaStyle, color: ACCENT },
            onChange: (val) => this.updateNoteText(note.id, val)
          }),
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

  // Derives a single status from what both sides already report, so there
  // is no extra state to persist: watch counts + last sync time come from the
  // watch's REPORT_SYNC_STATUS, the pending request from FORCE_SYNC_KEY.
  getSyncView(syncStatus) {
    const requestedAt = Number(this.state.settingsStorage.getItem(FORCE_SYNC_KEY)) || 0
    const lastSyncedAt = (syncStatus && syncStatus.lastSyncedAt) || 0
    const { folders, notes } = this.state

    if (requestedAt > lastSyncedAt) {
      const stale = Date.now() - requestedAt > 2 * 60 * 1000
      return {
        tone: STATUS_TONES.warn,
        badge: stale ? 'No response' : 'Waiting for watch…',
        hint: stale
          ? 'The watch did not answer. Open Notelet on your watch and keep it on screen, then try again.'
          : 'Keep Notelet open on your watch. This updates automatically.',
        button: stale ? 'Try again' : 'Request sent · Resend'
      }
    }
    if (!lastSyncedAt) {
      return {
        tone: STATUS_TONES.idle,
        badge: 'Not synced yet',
        hint: 'Open Notelet on your watch, keep it on screen, then tap Sync now.',
        button: 'Sync now'
      }
    }
    const changed =
      (syncStatus.folderCount ?? 0) !== folders.length ||
      (syncStatus.noteCount ?? 0) !== notes.length ||
      notes.some((n) => (n.updatedAt || 0) > lastSyncedAt) ||
      folders.some((f) => (f.updatedAt || 0) > lastSyncedAt)
    if (changed) {
      return {
        tone: STATUS_TONES.warn,
        badge: 'Changes not on watch',
        hint: `Last synced ${timeAgo(lastSyncedAt)}. Sync to send your latest changes.`,
        button: 'Sync now'
      }
    }
    return {
      tone: STATUS_TONES.ok,
      badge: 'Up to date',
      hint: `Last synced ${timeAgo(lastSyncedAt)}.`,
      button: 'Sync again'
    }
  },

  renderSyncCard(syncStatus) {
    const view = this.getSyncView(syncStatus)
    const watchFolders = syncStatus ? (syncStatus.folderCount ?? 0) : 0
    const watchNotes = syncStatus ? (syncStatus.noteCount ?? 0) : 0

    return View({ style: cardStyle }, [
      View({ style: sectionHeaderStyle }, [
        View({ style: sectionTitleStyle }, [gettext('syncSectionTitle')]),
        View(
          {
            style: {
              fontSize: '12px',
              fontWeight: 'bold',
              color: view.tone.fg,
              background: view.tone.bg,
              borderRadius: '12px',
              padding: '4px 10px'
            }
          },
          [`● ${view.badge}`]
        )
      ]),
      View({ style: { ...rowMetaStyle, marginTop: '0', marginBottom: '14px', fontSize: '13px' } }, [
        view.hint
      ]),
      View({ style: { display: 'flex', flexDirection: 'row', marginBottom: '14px' } }, [
        View({ style: { ...statTileStyle, marginRight: '10px' } }, [
          View({ style: statValueStyle }, [String(watchFolders)]),
          View({ style: statLabelStyle }, ['Folders on watch'])
        ]),
        View({ style: statTileStyle }, [
          View({ style: statValueStyle }, [String(watchNotes)]),
          View({ style: statLabelStyle }, ['Notes on watch'])
        ])
      ]),
      Button({
        label: `⟳  ${view.button}`,
        style: primaryButtonStyle,
        onClick: () => this.requestSync()
      })
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

        // The TextInput's own label is the tap target, styled as the add
        // button — tapping it opens the input modal straight away.
        TextInput({
          label: `+ ${gettext('addFolder')}`,
          placeholder: gettext('newFolderName'),
          value: '',
          labelStyle: addButtonStyle,
          onChange: (val) => this.addFolder(val)
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

        ...(folders.length > 0
          ? [
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
          : []),
        TextInput({
          label: `+ ${gettext('addNote')}`,
          placeholder: gettext('newNoteTitle'),
          value: '',
          labelStyle: addButtonStyle,
          onChange: (val) => this.addNote(val)
        })
      ])
    ])
  }
})
