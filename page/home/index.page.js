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
import { formatTime } from './../../utils/index'
import { getFolders } from './../../utils/syncStore'
import { getSyncStatus } from './../../utils/syncStatus'
import { runSync } from './../../utils/syncClient'
import { SyncStatusValue } from './../../utils/constants'

const logger = Logger.getLogger('notelet-home')

Page(
  BasePage({
    state: {
      title: null,
      tipText: null,
      rowWidgets: [],
      items: []
    },
    onInit() {
      logger.debug('home onInit invoked')
    },
    build() {
      logger.debug('home build invoked')

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

      this.state.title = hmUI.createWidget(hmUI.widget.TEXT, {
        ...TITLE_TEXT_STYLE
      })

      // Always show whatever is already stored locally first (SRS #39: notes
      // must stay available even if the phone/sync is unreachable), then try
      // a sync in the background and refresh once it settles.
      this.loadFromLocalStore()
      this.sync()
    },
    onDestroy() {
      logger.debug('home onDestroy invoked')
    },
    sync() {
      runSync(this.request.bind(this))
        .then(() => this.loadFromLocalStore())
        .catch((error) => {
          logger.error('sync failed', error && error.message)
          this.loadFromLocalStore()
        })
    },
    loadFromLocalStore() {
      const folders = getFolders()
      const status = getSyncStatus()

      let syncLabel = '🔄 Sync now'
      if (status.status === SyncStatusValue.SYNCING) {
        syncLabel = 'Syncing…'
      } else if (status.lastSyncedAt) {
        syncLabel = `🔄 Last synced ${formatTime(status.lastSyncedAt)}`
      }

      const items = [
        { iconText: '⭐', label: 'Pinned', route: { type: 'pinned' } },
        ...folders.map((folder) => ({
          iconText: '📁',
          label: folder.name,
          route: { type: 'folder', folderId: folder.id, folderName: folder.name }
        })),
        { iconText: '🔍', label: 'Search', route: { type: 'search' } },
        { iconText: '', label: syncLabel, route: { type: 'sync' } }
      ]
      this.state.items = items
      this.renderList()
    },
    // Row widgets are rebuilt on every refresh rather than diffed/reused —
    // this list is small (SRS #46: folders <= 100) so the simplicity is
    // worth more than the extra churn. Each row is a single BUTTON: a
    // separate TEXT widget layered on top silently blocks its taps in this
    // environment, so icon+label are combined into the button's own text.
    renderList() {
      const { items } = this.state

      this.state.rowWidgets.forEach((widget) => hmUI.deleteWidget(widget))
      this.state.rowWidgets = []
      this.state.tipText && hmUI.deleteWidget(this.state.tipText)
      this.state.tipText = null

      if (items.length === 0) {
        this.state.tipText = hmUI.createWidget(hmUI.widget.TEXT, { ...TIPS_TEXT_STYLE })
        return
      }

      this.state.rowWidgets = items.map((item, index) =>
        hmUI.createWidget(hmUI.widget.BUTTON, {
          ...ROW_BUTTON_STYLE,
          x: ROW_X,
          y: ROW_Y + index * (ROW_H + ROW_SPACE),
          w: ROW_W,
          h: ROW_H,
          text: `${item.iconText} ${item.label}`.trim(),
          click_func: () => this.onItemClick(index)
        })
      )
    },
    onItemClick(index) {
      const item = this.state.items[index]
      if (!item) return

      if (item.route.type === 'pinned') {
        this.goToFolder({ folderId: '__pinned__', folderName: 'Pinned' })
      } else if (item.route.type === 'folder') {
        this.goToFolder({ folderId: item.route.folderId, folderName: item.route.folderName })
      } else if (item.route.type === 'search') {
        // Basic title search is a Phase 1 stretch goal (SRS #23); not part of the mock UI yet.
        hmUI.showToast({ text: 'Search coming soon' })
      } else if (item.route.type === 'sync') {
        hmUI.showToast({ text: 'Syncing…' })
        this.sync()
      }
    },
    goToFolder(params) {
      push({
        url: 'page/folder/index.page',
        params: JSON.stringify(params)
      })
    }
  })
)
