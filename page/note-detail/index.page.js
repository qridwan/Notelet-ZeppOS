import * as hmUI from '@zos/ui'
import { log as Logger } from '@zos/utils'

import { BasePage } from '@zeppos/zml/base-page'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  CONTENT_W,
  TITLE_TEXT_STYLE,
  DESCRIPTION_TEXT_STYLE,
  NOT_FOUND_TEXT_STYLE
} from 'zosLoader:./index.page.[pf].layout.js'
import { getNoteById } from './../../utils/syncStore'

const logger = Logger.getLogger('notelet-note-detail')

// Rough estimate of wrapped-text height so the whole note fits one scrollable
// widget. Good enough for Phase 1's mock UI; refine once real font metrics matter.
function estimateTextHeight(text, width, fontSize) {
  const charsPerLine = Math.max(1, Math.floor(width / (fontSize * 0.6)))
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine))
  return lines * fontSize * 1.4
}

Page(
  BasePage({
    state: {
      noteId: null,
      scrollList: null,
      notFoundText: null
    },
    onInit(query) {
      logger.debug('note-detail onInit invoked', query)
      const params = query ? JSON.parse(query) : {}
      this.state.noteId = params.id || null
    },
    build() {
      logger.debug('note-detail build invoked')
      this.loadNote()
    },
    onDestroy() {
      logger.debug('note-detail onDestroy invoked')
    },
    loadNote() {
      // Local read (SRS #39): a note opened after the phone disconnects must
      // still be fully available.
      const note = getNoteById(this.state.noteId)
      if (!note) {
        this.showNotFound()
        return
      }
      this.renderNote(note)
    },
    showNotFound() {
      this.state.notFoundText = hmUI.createWidget(hmUI.widget.TEXT, {
        ...NOT_FOUND_TEXT_STYLE,
        text: 'Note not found.\nIt may have been removed on the last sync.'
      })
    },
    renderNote(note) {
      const titleHeight = estimateTextHeight(note.title, CONTENT_W, TITLE_TEXT_STYLE.text_size)
      const descHeight = estimateTextHeight(
        note.description,
        CONTENT_W,
        DESCRIPTION_TEXT_STYLE.text_size
      )
      const gap = 20
      const contentHeight = TITLE_TEXT_STYLE.y + titleHeight + descHeight + gap * 2

      this.state.scrollList = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        item_height: contentHeight,
        item_space: 0,
        data_array: [{ title: note.title, description: note.description }],
        data_count: 1,
        data_type_config: [{ start: 0, end: 1, type_id: 1 }],
        data_type_config_count: 1,
        item_config: [
          {
            type_id: 1,
            item_bg_color: 0x000000,
            text_view: [
              {
                ...TITLE_TEXT_STYLE,
                key: 'title'
              },
              {
                ...DESCRIPTION_TEXT_STYLE,
                h: descHeight,
                key: 'description'
              }
            ],
            text_view_count: 2,
            item_height: contentHeight
          }
        ],
        item_config_count: 1,
        on_page: 1
      })
    }
  })
)
