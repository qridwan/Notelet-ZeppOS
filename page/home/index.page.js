import * as hmUI from '@zos/ui'
import hmApp from '@zos/app'
import { log as Logger } from '@zos/utils'

import { BasePage } from '@zeppos/zml/base-page'
import {
  TITLE_TEXT_STYLE,
  TIPS_TEXT_STYLE,
  HOME_LIST
} from 'zosLoader:./index.page.[pf].layout.js'
import { getScrollListDataConfig, formatTime } from './../../utils/index'
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
      list: null,
      items: []
    },
    onInit() {
      logger.debug('home onInit invoked')
    },
    build() {
      logger.debug('home build invoked')

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
          logger.error('sync failed', error?.message)
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
    renderList() {
      const { items, list } = this.state

      if (items.length === 0) {
        !this.state.tipText &&
          (this.state.tipText = hmUI.createWidget(hmUI.widget.TEXT, { ...TIPS_TEXT_STYLE }))
        return
      }

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
          ...HOME_LIST,
          data_array: items,
          data_count: items.length,
          data_type_config: dataTypeConfig,
          data_type_config_count: dataTypeConfig.length,
          on_page: 1,
          item_click_func: (list, index) => this.onItemClick(index)
        })
      }
    },
    onItemClick(index) {
      const item = this.state.items[index]
      if (!item) return

      if (item.route.type === 'pinned') {
        hmApp.gotoPage({
          url: 'page/folder/index.page',
          param: JSON.stringify({ folderId: '__pinned__', folderName: 'Pinned' })
        })
      } else if (item.route.type === 'folder') {
        hmApp.gotoPage({
          url: 'page/folder/index.page',
          param: JSON.stringify({
            folderId: item.route.folderId,
            folderName: item.route.folderName
          })
        })
      } else if (item.route.type === 'search') {
        // Basic title search is a Phase 1 stretch goal (SRS #23); not part of the mock UI yet.
        hmUI.showToast({ text: 'Search coming soon' })
      } else if (item.route.type === 'sync') {
        hmUI.showToast({ text: 'Syncing…' })
        this.sync()
      }
    }
  })
)
