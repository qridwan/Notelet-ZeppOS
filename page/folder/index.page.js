import * as hmUI from '@zos/ui'
import { push } from '@zos/router'
import { log as Logger } from '@zos/utils'

import { BasePage } from '@zeppos/zml/base-page'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  TITLE_TEXT_STYLE,
  TIPS_TEXT_STYLE,
  ROW_X,
  ROW_Y,
  ROW_W,
  ROW_H,
  ROW_SPACE,
  ROW_BUTTON_STYLE
} from 'zosLoader:./index.page.[pf].layout.js'
import { getNotesByFolder, getPinnedNotes } from './../../utils/syncStore'

const logger = Logger.getLogger('notelet-folder')

Page(
  BasePage({
    state: {
      folderId: null,
      folderName: '',
      title: null,
      tipText: null,
      rowWidgets: [],
      notes: []
    },
    onInit(query) {
      logger.debug('folder onInit invoked', query)
      const params = query ? JSON.parse(query) : {}
      this.state.folderId = params.folderId || null
      this.state.folderName = params.folderName || ''
    },
    build() {
      logger.debug('folder build invoked')

      // Defensive: pushing a new page doesn't reliably clear the previous
      // page's widgets first in this environment (verified — a stale title
      // from the page underneath was bleeding through), so every page starts
      // by repainting its own full-screen background.
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        color: 0x000000
      })

      this.state.title = hmUI.createWidget(hmUI.widget.TEXT, {
        ...TITLE_TEXT_STYLE,
        text: this.state.folderName
      })

      this.loadNotes()
    },
    onDestroy() {
      logger.debug('folder onDestroy invoked')
    },
    loadNotes() {
      const { folderId } = this.state
      // Reads the watch's own local copy (SRS #39) — no request to app-side
      // here, so this works whether or not the phone is connected.
      this.state.notes = folderId === '__pinned__' ? getPinnedNotes() : getNotesByFolder(folderId)
      this.renderList()
    },
    // Row widgets are rebuilt on every refresh rather than diffed/reused —
    // SCROLL_LIST does not render in the current environment, and per-folder
    // note counts are small enough (SRS #46) that this is fine. Each row is
    // a single BUTTON: a separate TEXT widget layered on top silently blocks
    // its taps in this environment.
    renderList() {
      const { notes } = this.state

      this.state.rowWidgets.forEach((widget) => hmUI.deleteWidget(widget))
      this.state.rowWidgets = []
      this.state.tipText && hmUI.deleteWidget(this.state.tipText)
      this.state.tipText = null

      if (notes.length === 0) {
        this.state.tipText = hmUI.createWidget(hmUI.widget.TEXT, {
          ...TIPS_TEXT_STYLE,
          text: 'No notes yet.'
        })
        return
      }

      this.state.rowWidgets = notes.map((note, index) =>
        hmUI.createWidget(hmUI.widget.BUTTON, {
          ...ROW_BUTTON_STYLE,
          x: ROW_X,
          y: ROW_Y + index * (ROW_H + ROW_SPACE),
          w: ROW_W,
          h: ROW_H,
          text: note.isPinned ? `⭐ ${note.title}` : note.title,
          click_func: () => this.onNoteClick(index)
        })
      )
    },
    onNoteClick(index) {
      const note = this.state.notes[index]
      if (!note) return

      push({
        url: 'page/note-detail/index.page',
        params: JSON.stringify({ id: note.id })
      })
    }
  })
)
