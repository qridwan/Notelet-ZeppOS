import * as hmUI from '@zos/ui'
import { setPageBrightTime, resetPageBrightTime } from '@zos/display'
import { log as Logger } from '@zos/utils'

import { BasePage } from '@zeppos/zml/base-page'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  CONTENT_W,
  TITLE_TEXT_STYLE,
  DESCRIPTION_TEXT_STYLE,
  DESCRIPTION_BASE_FONT_SIZE,
  FONT_SIZE_STEP,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_DEC_BUTTON_STYLE,
  FONT_INC_BUTTON_STYLE,
  KEEP_AWAKE_BUTTON_STYLE,
  PAGE_INDICATOR_STYLE,
  PREV_BUTTON_STYLE,
  NEXT_BUTTON_STYLE,
  NOT_FOUND_TEXT_STYLE
} from 'zosLoader:./index.page.[pf].layout.js'
import { getNoteById } from './../../utils/syncStore'
import { getReadingPreferences, setReadingPreferences } from './../../utils/notePreferences'

const logger = Logger.getLogger('notelet-note-detail')

// Screen stays on indefinitely (within the API's max) while "keep awake" is
// on; this is the documented way to hold a page's bright-screen time rather
// than the system's default ~10s inactivity timeout (@zos/display).
const KEEP_AWAKE_BRIGHT_TIME_MS = 2147483000

// SCROLL_LIST does not render in the current environment, so long notes
// (SRS #21/#24: must support scrolling through the full text) are paginated
// instead: split into word-aware chunks sized to the description area, with
// Prev/Next controls to page through them.
function paginate(text, width, height, fontSize) {
  const charsPerLine = Math.max(1, Math.floor(width / (fontSize * 0.6)))
  const linesPerPage = Math.max(1, Math.floor(height / (fontSize * 1.4)))
  const charsPerPage = charsPerLine * linesPerPage

  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']

  const pages = []
  let current = ''

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > charsPerPage && current) {
      pages.push(current)
      current = word
    } else {
      current = candidate
    }
  })
  if (current) pages.push(current)

  return pages.length > 0 ? pages : ['']
}

function clampFontSize(size) {
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, size))
}

Page(
  BasePage({
    state: {
      note: null,
      noteId: null,
      pages: [''],
      pageIndex: 0,
      fontSize: DESCRIPTION_BASE_FONT_SIZE,
      keepAwake: false,
      titleWidget: null,
      descriptionWidget: null,
      pageIndicator: null,
      prevButton: null,
      nextButton: null,
      fontDecButton: null,
      fontIncButton: null,
      keepAwakeButton: null,
      notFoundText: null
    },
    onInit(query) {
      logger.debug('note-detail onInit invoked', query)
      const params = query ? JSON.parse(query) : {}
      this.state.noteId = params.id || null
    },
    build() {
      logger.debug('note-detail build invoked')

      // Defensive: navigating between pages doesn't reliably clear the
      // previous page's widgets first in this environment (verified — a
      // stale title bled through on the folder screen), so every page
      // starts by repainting its own full-screen background.
      hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        color: 0x000000
      })

      const prefs = getReadingPreferences()
      this.state.fontSize = clampFontSize(
        DESCRIPTION_BASE_FONT_SIZE + prefs.fontSizeStep * FONT_SIZE_STEP
      )
      this.state.keepAwake = prefs.keepAwake
      this.applyKeepAwake()

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
      this.state.note = note
      this.renderNote()
    },
    showNotFound() {
      this.state.notFoundText = hmUI.createWidget(hmUI.widget.TEXT, {
        ...NOT_FOUND_TEXT_STYLE,
        text: 'Note not found.\nIt may have been removed on the last sync.'
      })
    },
    renderNote() {
      const { note } = this.state

      this.state.titleWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...TITLE_TEXT_STYLE,
        text: note.title
      })

      this.state.fontDecButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        ...FONT_DEC_BUTTON_STYLE,
        click_func: () => this.changeFontSize(-1)
      })
      this.state.fontIncButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        ...FONT_INC_BUTTON_STYLE,
        click_func: () => this.changeFontSize(1)
      })
      this.state.keepAwakeButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        ...KEEP_AWAKE_BUTTON_STYLE,
        text: this.keepAwakeLabel(),
        click_func: () => this.toggleKeepAwake()
      })

      this.renderDescription()
    },
    renderDescription() {
      const { note, fontSize } = this.state

      this.state.pages = paginate(note.description, CONTENT_W, DESCRIPTION_TEXT_STYLE.h, fontSize)
      this.state.pageIndex = 0

      if (this.state.descriptionWidget) {
        hmUI.deleteWidget(this.state.descriptionWidget)
      }
      this.state.descriptionWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...DESCRIPTION_TEXT_STYLE,
        text_size: fontSize,
        text: this.state.pages[0]
      })

      if (this.state.pageIndicator) hmUI.deleteWidget(this.state.pageIndicator)
      if (this.state.prevButton) hmUI.deleteWidget(this.state.prevButton)
      if (this.state.nextButton) hmUI.deleteWidget(this.state.nextButton)
      this.state.pageIndicator = null
      this.state.prevButton = null
      this.state.nextButton = null

      if (this.state.pages.length > 1) {
        this.state.pageIndicator = hmUI.createWidget(hmUI.widget.TEXT, {
          ...PAGE_INDICATOR_STYLE,
          text: this.pageLabel()
        })
        this.state.prevButton = hmUI.createWidget(hmUI.widget.BUTTON, {
          ...PREV_BUTTON_STYLE,
          click_func: () => this.goToPage(this.state.pageIndex - 1)
        })
        this.state.nextButton = hmUI.createWidget(hmUI.widget.BUTTON, {
          ...NEXT_BUTTON_STYLE,
          click_func: () => this.goToPage(this.state.pageIndex + 1)
        })
      }
    },
    pageLabel() {
      return `${this.state.pageIndex + 1} / ${this.state.pages.length}`
    },
    goToPage(index) {
      if (index < 0 || index >= this.state.pages.length) return
      this.state.pageIndex = index
      this.state.descriptionWidget.setProperty(hmUI.prop.MORE, {
        text: this.state.pages[index]
      })
      this.state.pageIndicator.setProperty(hmUI.prop.MORE, { text: this.pageLabel() })
    },
    // Font size is a device-wide reading preference (persists across notes),
    // not part of note data, so it's stored separately and never synced.
    changeFontSize(direction) {
      const nextSize = clampFontSize(this.state.fontSize + direction * FONT_SIZE_STEP)
      if (nextSize === this.state.fontSize) return

      this.state.fontSize = nextSize
      setReadingPreferences({
        fontSizeStep: Math.round((nextSize - DESCRIPTION_BASE_FONT_SIZE) / FONT_SIZE_STEP)
      })
      this.renderDescription()
    },
    keepAwakeLabel() {
      return this.state.keepAwake ? '☀ Awake: On' : '☾ Awake: Off'
    },
    // BUTTON widgets don't reliably redraw their text via setProperty in
    // this environment (verified) — recreated instead, same as every other
    // row/button refresh in this app.
    toggleKeepAwake() {
      this.state.keepAwake = !this.state.keepAwake
      setReadingPreferences({ keepAwake: this.state.keepAwake })
      this.applyKeepAwake()

      hmUI.deleteWidget(this.state.keepAwakeButton)
      this.state.keepAwakeButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        ...KEEP_AWAKE_BUTTON_STYLE,
        text: this.keepAwakeLabel(),
        click_func: () => this.toggleKeepAwake()
      })
    },
    applyKeepAwake() {
      if (this.state.keepAwake) {
        setPageBrightTime({ brightTime: KEEP_AWAKE_BRIGHT_TIME_MS })
      } else {
        resetPageBrightTime()
      }
    }
  })
)
