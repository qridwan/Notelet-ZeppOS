import * as hmUI from '@zos/ui'
import hmApp from '@zos/app'
import { log as Logger } from '@zos/utils'

import { BasePage } from '@zeppos/zml/base-page'
import {
  TITLE_TEXT_STYLE,
  TIPS_TEXT_STYLE,
  NOTE_LIST
} from 'zosLoader:./index.page.[pf].layout.js'
import { getScrollListDataConfig, truncate } from './../../utils/index'
import { getNotesByFolder, getPinnedNotes } from './../../utils/syncStore'

const logger = Logger.getLogger('notelet-folder')

Page(
  BasePage({
    state: {
      folderId: null,
      folderName: '',
      title: null,
      tipText: null,
      list: null,
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
    renderList() {
      const { notes, list } = this.state

      if (notes.length === 0) {
        !this.state.tipText &&
          (this.state.tipText = hmUI.createWidget(hmUI.widget.TEXT, {
            ...TIPS_TEXT_STYLE,
            text: 'No notes yet.'
          }))
        return
      }

      const items = notes.map((note) => ({
        id: note.id,
        title: note.title,
        preview: truncate(note.description, 40),
        pinMark: note.isPinned ? '⭐' : ''
      }))

      const dataTypeConfig = getScrollListDataConfig(-1, items.length)

      if (list) {
        list.setProperty(hmUI.prop.UPDATE_DATA, {
          data_array: items,
          data_count: items.length,
          data_type_config: [{ start: 0, end: items.length, type_id: 1 }],
          data_type_config_count: 1,
          on_page: 1
        })
      } else {
        this.state.list = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
          ...NOTE_LIST,
          data_array: items,
          data_count: items.length,
          data_type_config: dataTypeConfig,
          data_type_config_count: dataTypeConfig.length,
          on_page: 1,
          item_click_func: (list, index) => this.onNoteClick(index)
        })
      }
    },
    onNoteClick(index) {
      const note = this.state.notes[index]
      if (!note) return

      hmApp.gotoPage({
        url: 'page/note-detail/index.page',
        param: JSON.stringify({ id: note.id })
      })
    }
  })
)
